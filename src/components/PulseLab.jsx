import { Suspense, lazy, useRef, useState } from 'react';
import { site } from '../data/site.js';
import useSectionReveal from '../hooks/useSectionReveal.js';

// Sandbox controls load on demand — never part of the initial bundle.
const PulseSandbox = lazy(() => import('./PulseSandbox.jsx'));

// PHASE 4 — PulseLab: the world Thompson is building (+ sandbox).
// Signature visual: a minimal node-pulse system (SVG).
// Four pillar nodes = the four pillars (Build / Explore / Create / Connect).
// Hovering or focusing a pillar highlights its node + connection line.
// Traveling dots use <animateMotion> — plain SVG, no library.
// Sandbox: density / accent / speed controls drive the SVG live via
// discrete state (layout arrays, CSS variable, SMIL durations).
// Entrance: useSectionReveal adds .is-visible once (shared with every section).

const CENTER = { x: 200, y: 200 };

// Node layouts per density. Pillar nodes carry their pillar index so the
// pillar list keeps highlighting them; decorative nodes never light up.
const LAYOUTS = {
  sparse: {
    nodes: [
      { x: 200, y: 90, pillar: 0 },
      { x: 310, y: 200, pillar: 1 },
      { x: 200, y: 310, pillar: 2 },
      { x: 90, y: 200, pillar: 3 },
    ],
    dots: [{ r: 4, base: 4, path: 'M 200 200 L 200 90', begin: '0s' }],
  },
  balanced: {
    nodes: [
      { x: 200, y: 56, pillar: 0 },
      { x: 344, y: 200, pillar: 1 },
      { x: 200, y: 344, pillar: 2 },
      { x: 56, y: 200, pillar: 3 },
    ],
    dots: [
      { r: 4, base: 4, path: 'M 200 200 L 200 56', begin: '0s' },
      { r: 4, base: 6, path: 'M 56 200 L 200 200', begin: '1.5s' },
      { r: 3, base: 7, path: 'M 200 200 L 344 200', begin: '3s' },
    ],
  },
  dense: {
    nodes: [
      { x: 200, y: 56, pillar: 0 },
      { x: 344, y: 200, pillar: 1 },
      { x: 200, y: 344, pillar: 2 },
      { x: 56, y: 200, pillar: 3 },
      { x: 271, y: 129, pillar: null },
      { x: 271, y: 271, pillar: null },
      { x: 129, y: 271, pillar: null },
      { x: 129, y: 129, pillar: null },
    ],
    dots: [
      { r: 4, base: 4, path: 'M 200 200 L 200 56', begin: '0s' },
      { r: 4, base: 6, path: 'M 56 200 L 200 200', begin: '1.5s' },
      { r: 3, base: 7, path: 'M 200 200 L 344 200', begin: '3s' },
      { r: 3, base: 5, path: 'M 200 200 L 271 129', begin: '2s' },
      { r: 3, base: 8, path: 'M 129 271 L 200 200', begin: '4s' },
    ],
  },
};

// In-palette accents only — the signature blue stays the default.
const ACCENTS = {
  blue: '#2447F5',
  paper: '#fafaf8',
  slate: '#9a9a94',
};

const SPEEDS = [0.5, 1, 2];

function PulseLab() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(null); // hovered / focused pillar index
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  // Traveling pulses render only while the section is visible.
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined',
  );
  const { pulseLab } = site;
  // GitHub comes from the shared socials — no invented repo URLs.
  const github = site.socials.find((social) => social.label === 'GitHub');
  // Sandbox state — discrete choices that re-render the SVG system.
  const [density, setDensity] = useState('balanced');
  const [accent, setAccent] = useState('blue');
  const [speed, setSpeed] = useState(1);
  const layout = LAYOUTS[density];

  // Reveal once when the section enters the viewport. Kept observing
  // (trackInView): entrance plays once via .is-visible, while
  // .is-inview + inView toggle the idle pulses on/off.
  useSectionReveal(sectionRef, {
    threshold: 0.15,
    trackInView: true,
    onInView: setInView,
  });

  const caption =
    active === null
      ? 'Ideas moving through the system'
      : `${pulseLab.pillars[active].name} — signal active`;

  return (
    <section
      id="pulselab"
      ref={sectionRef}
      className="section lab"
      aria-label="PulseLab community"
    >
      <div className="container">
        <p className="section-label reveal-item">{pulseLab.label}</p>
        <img
          className="lab-brandmark reveal-item"
          src={site.community.logo}
          alt={site.community.logoAlt}
          width={52}
          height={52}
          loading="lazy"
          decoding="async"
        />

        <div className="lab-grid">
          {/* Left — wordmark, statement, description */}
          <div className="lab-copy">
            <p className="lab-kicker reveal-item">{pulseLab.kicker}</p>
            {/* Page heading of the /pulselab route — h1, since this
                section only ever renders standalone (PulseLabPage). */}
            <h1 className="lab-title reveal-item">
              {pulseLab.title}
              <span className="accent-dot" aria-hidden="true">
                .
              </span>
            </h1>
            <p className="lab-statement reveal-item">{pulseLab.statement}</p>
            <p className="lab-desc reveal-item">{pulseLab.description}</p>

            {/* Current focus — points at a real section, never fake activity */}
            <div className="lab-spotlight reveal-item">
              <span className="lab-spot-left">
                <span className="status-dot" aria-hidden="true" />
                {pulseLab.spotlight.label}:
              </span>
              <a className="lab-spot-link" href={pulseLab.spotlight.href}>
                {pulseLab.spotlight.text} <span aria-hidden="true">→</span>
              </a>
            </div>

            <p className="lab-founder reveal-item">
              <span className="brand-dot" aria-hidden="true" />
              {pulseLab.founder}
            </p>
            <div className="lab-cta-row reveal-item">
              <a className="btn-primary btn-small" href={pulseLab.cta.href}>
                {pulseLab.cta.label} <span aria-hidden="true">→</span>
              </a>
              {github && (
                <a
                  className="btn-outline"
                  href={github.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${github.label} (opens in a new tab)`}
                >
                  {github.label} <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>

          {/* Right — signature pulse visual (sandbox-driven) */}
          <div className="lab-visual reveal-item">
            <div
              className="lab-stage"
              style={{ '--lab-accent': ACCENTS[accent] }}
            >
              <img
                className="lab-stage-mark"
                src={site.community.logo}
                alt=""
                aria-hidden="true"
                width={34}
                height={34}
                loading="lazy"
                decoding="async"
              />
              <svg viewBox="0 0 400 400" role="img" aria-label="PulseLab signal map">
                {/* connection lines: centre → each node */}
                {layout.nodes.map((node) => (
                  <line
                    key={`link-${node.x}-${node.y}`}
                    className={`lab-link${node.pillar !== null && node.pillar === active ? ' is-active' : ''}`}
                    x1={CENTER.x}
                    y1={CENTER.y}
                    x2={node.x}
                    y2={node.y}
                  />
                ))}

                {/* breathing halo around the core */}
                {!reducedMotion && (
                  <circle
                    className="lab-halo"
                    style={{ animationDuration: `${(3.2 / speed).toFixed(1)}s` }}
                    cx={CENTER.x}
                    cy={CENTER.y}
                    r="14"
                  />
                )}

                {/* nodes — pillar nodes carry tooltips, decorative ones don't */}
                {layout.nodes.map((node) => (
                  <circle
                    key={`node-${node.x}-${node.y}`}
                    className={`lab-node${node.pillar !== null && node.pillar === active ? ' is-active' : ''}`}
                    cx={node.x}
                    cy={node.y}
                    r={node.pillar === null ? 5 : 8}
                  >
                    {node.pillar !== null ? (
                      <title>{`${pulseLab.pillars[node.pillar].name}: ${pulseLab.pillars[node.pillar].items.join(', ')}`}</title>
                    ) : (
                      <title>Signal relay</title>
                    )}
                  </circle>
                ))}

                {/* core */}
                <circle className="lab-core" cx={CENTER.x} cy={CENTER.y} r="9" />

                {/* traveling pulses — ideas moving through the system.
                    Mounted only while visible: SMIL can't be paused by CSS.
                    Durations scale with the sandbox speed. */}
                {inView && !reducedMotion && (
                  <>
                    {layout.dots.map((dot) => (
                      <circle key={dot.path} className="lab-pulse" r={dot.r}>
                        <animateMotion
                          dur={`${(dot.base / speed).toFixed(1)}s`}
                          begin={dot.begin}
                          repeatCount="indefinite"
                          path={dot.path}
                        />
                      </circle>
                    ))}
                  </>
                )}
              </svg>
            </div>
            <p className="pulse-caption">{caption}</p>
          </div>
        </div>

        {/* Sandbox: controls + live configuration readout.
            Lazy chunk — never blocks initial parsing. */}
        <div className="lab-sandbox-enter reveal-item">
          <Suspense fallback={null}>
            <PulseSandbox
              densities={Object.keys(LAYOUTS)}
              accents={Object.keys(ACCENTS)}
              speeds={SPEEDS}
              density={density}
              accent={accent}
              accentHex={ACCENTS[accent]}
              speed={speed}
              onDensity={setDensity}
              onAccent={setAccent}
              onSpeed={setSpeed}
            />
          </Suspense>
        </div>

        {/* Pillars — hovering one lights up its node in the visual */}
        <ul className="lab-pillars">
          {pulseLab.pillars.map((pillar, i) => (
            <li
              key={pillar.name}
              tabIndex={0}
              className={`lab-pillar reveal-item${active === i ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`${pillar.name}: ${pillar.items.join(', ')}`}
            >
              <span className="pillar-index" aria-hidden="true">
                0{i + 1}
              </span>
              <h3 className="pillar-name">{pillar.name}</h3>
              <ul className="pillar-items">
                {pillar.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PulseLab;
