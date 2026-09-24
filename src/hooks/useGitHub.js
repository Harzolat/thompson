import { useEffect, useState } from 'react';

// Shared GitHub stats, fetched once per page load and cached across
// every consumer. Public endpoints need no key; failures (rate limits,
// offline, blocked requests) resolve to null and every consumer renders
// nothing extra — the portfolio never depends on this data.

// Single-flight cache: one pair of requests no matter how many
// components call the hook.
let cache = null;

function loadGitHub() {
  if (!cache) {
    cache = (async () => {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch('https://api.github.com/users/Harzolat'),
          fetch('https://api.github.com/users/Harzolat/repos?per_page=100'),
        ]);
        if (!userRes.ok || !reposRes.ok) return null;
        const user = await userRes.json();
        const repos = await reposRes.json();
        if (!Array.isArray(repos)) return null;

        // Per-repo lookup: "Harzolat/Name" → { stars, language }.
        const byPath = {};
        const langBytes = {};
        let stars = 0;
        repos.forEach((repo) => {
          const path = repo.full_name;
          byPath[path] = {
            stars: repo.stargazers_count || 0,
            language: repo.language || null,
          };
          stars += repo.stargazers_count || 0;
          if (repo.language) {
            langBytes[repo.language] = (langBytes[repo.language] || 0) + 1;
          }
        });

        // Top languages by repo count (byte-level needs N more calls;
        // repo-level share is honest and labeled as such).
        const totalLangRepos = Object.values(langBytes).reduce((a, b) => a + b, 0);
        const topLanguages = Object.entries(langBytes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([language, count]) => ({
            language,
            share: totalLangRepos
              ? Math.round((count / totalLangRepos) * 100)
              : 0,
          }));

        return {
          repos: user.public_repos ?? repos.length,
          stars,
          topLanguages,
          byPath,
        };
      } catch {
        return null;
      }
    })();
  }
  return cache;
}

function useGitHubStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let live = true;
    let idleId = 0;
    function run() {
      loadGitHub().then((data) => {
        if (live) setStats(data);
      });
    }
    // Non-critical network work waits for an idle window (or 1.5s max)
    // so it never contends with first paint and interaction.
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 3000 });
    } else {
      idleId = window.setTimeout(run, 1500);
    }
    return () => {
      live = false;
      if (typeof window.cancelIdleCallback === 'function' && idleId) {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  return stats;
}

export default useGitHubStats;
