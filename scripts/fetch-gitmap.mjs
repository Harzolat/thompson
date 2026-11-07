#!/usr/bin/env node
/**
 * Regenerates src/data/githubContributions.js from GitHub's public
 * contribution-graph page (https://github.com/users/<user>/contributions).
 *
 * The site renders this as a static heatmap — no runtime API call, so it
 * can never 403, rate-limit or fail offline. Re-run whenever you want the
 * graph refreshed:
 *
 *   npm run gitmap        (Node 18+, no dependencies)
 *
 * Data captured per day: intensity level 0–4 (GitHub's own buckets) from
 * the calendar cells, plus exact contribution counts from the graph's
 * tool-tips for the days that have any.
 */
const USER = 'Harzolat';
const OUT = new URL('../src/data/githubContributions.js', import.meta.url);

const res = await fetch(`https://github.com/users/${USER}/contributions`, {
  headers: { 'user-agent': 'portfolio-gitmap-script' },
});
if (!res.ok) throw new Error(`GitHub responded ${res.status} — try again later.`);
const html = await res.text();

// Day cells: <td data-date="YYYY-MM-DD" ... data-level="N"> — attribute
// order has changed before, so match the tag then read attrs individually.
const levels = new Map();
for (const tag of html.match(/<td[^>]*>/g) || []) {
  const date = /data-date="(\d{4}-\d{2}-\d{2})"/.exec(tag)?.[1];
  const level = /data-level="(\d)"/.exec(tag)?.[1];
  if (date && level) levels.set(date, Math.max(levels.get(date) ?? 0, Number(level)));
}
// A year graph has 365–372 day cells (+5 legend cells, no data-date).
if (levels.size < 300) {
  throw new Error(`Only ${levels.size} day cells parsed — GitHub markup may have changed.`);
}

const dates = [...levels.keys()].sort();
const start = dates[0];
const end = dates[dates.length - 1];
// The graph must begin on a Sunday for the 7-row column grid to line up.
if (new Date(`${start}T00:00:00Z`).getUTCDay() !== 0) {
  throw new Error(`Graph start ${start} is not a Sunday — grid alignment guard tripped.`);
}
const levelsStr = dates.map((d) => levels.get(d)).join('');

// Exact counts from tool-tips: "6 contributions on August 12th."
// Tips carry no year, so resolve against the graph window. Two in-range
// years are possible at the window edges (e.g. November 7th, 2025 and
// 2026) — then the level data settles it: exactly one candidate being
// active identifies the day; if both are active we skip rather than guess.
const MONTHS = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};
const years = [...new Set(dates.map((d) => Number(d.slice(0, 4))))];
const counts = {};
let tipDays = 0;
for (const m of html.matchAll(/(\d+) contributions? on ([A-Z][a-z]+) (\d+)(?:st|nd|rd|th)?\./g)) {
  const [, n, month, day] = m;
  if (!(month in MONTHS)) continue;
  tipDays += 1;
  const hits = years
    .map((y) => `${y}-${String(MONTHS[month]).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`)
    .filter((iso) => iso >= start && iso <= end);
  let target = null;
  if (hits.length === 1) target = hits[0];
  else if (hits.length > 1) {
    const activeHits = hits.filter((iso) => levels.get(iso) > 0);
    if (activeHits.length === 1) target = activeHits[0];
  }
  if (target) counts[target] = Number(n);
}

// Consistency guard: every active day should have a count and vice versa.
const activeDays = dates.filter((d) => levels.get(d) > 0);
const countedDays = Object.keys(counts).length;
if (countedDays !== activeDays.length) {
  console.warn(
    `warning: ${activeDays.length} active days but ${countedDays} counts resolved ` +
      `(${tipDays} numeric tips seen) — totals may be partial; levels are unaffected.`,
  );
}

const entries = Object.entries(counts)
  .map(([iso, n]) => `  '${iso}': ${n}`)
  .join(',\n');
const generated = new Date().toISOString().slice(0, 10);

const out = `// GENERATED FILE — do not edit by hand.
// Regenerate: npm run gitmap   (scripts/fetch-gitmap.mjs, no dependencies)
// Source: https://github.com/users/${USER}/contributions (public page).
// levels: one char per day, intensity 0–4, oldest first from \`start\`
//         (a Sunday — the graph's first column).
// counts: exact contribution totals for the days that have any.
// Generated: ${generated}
export const gitmap = {
  start: '${start}',
  levels: '${levelsStr}',
  counts: {
${entries}
  },
};
`;

await import('node:fs/promises').then((fs) => fs.writeFile(OUT, out));
const total = Object.values(counts).reduce((s, n) => s + n, 0);
console.log(
  `Wrote ${OUT.pathname.replace(process.cwd(), '.')} — ${dates.length} days (${start} → ${end}), ` +
    `${activeDays.length} active days, ${total} contributions.`,
);
