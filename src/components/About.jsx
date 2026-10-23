import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../data/site.js';
import useGitHubStats from '../hooks/useGitHub.js';

// PHASE 3 — About ("Behind the builds").
// Editorial asymmetric layout: label left, statement + text right,
// one quiet visual (identity card with intentional portrait slot).
// Entrance: a single IntersectionObserver adds .is-visible once;
// CSS staggers the children. After that the section stays calm.

// Live GitHub strip for the About column. Silent when offline or
// rate-limited — the section never depends on it.
function GitHubStrip() {
  const stats = useGitHubStats();
  if (!stats) return null;
  const langs = stats.topLanguages
    .map((entry) => `${entry.language} ${entry.share}%`)
    .join(' · ');
  return (
    <p
      className="github-strip reveal-item"
      aria-label={`Active on GitHub: ${stats.repos} public repositories, ${stats.stars} stars${langs ? `, top languages ${langs}` : ''}`}
    >
      <span className="status-dot" aria-hidden="true" />
      <span aria-hidden="true">
        Active on GitHub · {stats.repos} repos · ★ {stats.stars}
        {langs ? ` · ${langs}` : ''}
      </span>
    </p>
  );
}

function About() {
  const sectionRef = useRef(null);
  const { about } = site;
  // Missing-file guard: fall back to the placeholder, never a broken image.
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // If the browser has no IntersectionObserver, just show everything.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add('is-visible');
          // Entrance delays must not slow down hover afterwards,
          // so clear them once the entrance has finished playing.
          window.setTimeout(() => el.classList.add('is-settled'), 1400);
          observer.disconnect(); // animate once, then stay calm
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section about"
      aria-label="About Thompson"
    >
      <div className="container about-grid">
        {/* Left rail — section marker, stays small and quiet */}
        <div className="about-side reveal-item">
          <p className="section-label">{about.label}</p>
          <p className="about-heading">{about.heading}</p>
        </div>

        {/* Right — statement, description, identity card */}
        <div className="about-main">
          <h2 className="about-statement reveal-item">
            {about.statement}{' '}
            <span className="statement-accent">{about.statementAccent}</span>
          </h2>

          <div className="about-lower">
            <div className="about-text">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="reveal-item">
                  {paragraph}
                </p>
              ))}

              <div className="about-actions reveal-item">
                <a
                  className="btn-primary btn-small"
                  href={site.resume.href}
                  target="_blank"
                  rel="noopener"
                >
                  {about.actions.resumeLabel}
                </a>
                <Link
                  className="link-arrow"
                  to={{ pathname: '/', hash: about.actions.stackHref }}
                >
                  {about.actions.stackLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>

              <ul className="about-metrics reveal-item">
                {about.metrics.map((metric) => (
                  <li
                    key={metric.label}
                    aria-label={`${metric.value} ${metric.label}`}
                  >
                    <span className="metric-value" aria-hidden="true">
                      {metric.value}
                    </span>
                    <span className="metric-label" aria-hidden="true">
                      {metric.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Live GitHub strip — renders only when the API responds.
                  The curated metrics above stay untouched. */}
              <GitHubStrip />
            </div>

            <aside className="id-card reveal-item" aria-label="Thompson Harzolat">
              <span className="id-bar" aria-hidden="true" />
              {/* Developer profile card: real photo when about.image is set
                  (see public/images/README.md), live profile otherwise */}
              <div className="id-portrait">
                {about.image && !photoFailed ? (
                  <img
                    className="id-photo"
                    src={about.image}
                    alt={about.imageAlt || 'Portrait of Thompson Harzolat'}
                    loading="lazy"
                    onError={() => setPhotoFailed(true)}
                  />
                ) : (
                  <div className="id-profile">
                    <p className="id-name">{about.card.name}</p>
                    <p className="id-role">{about.card.role}</p>
                    <ul className="id-badges" aria-label="Primary technologies">
                      {about.card.badges.map((badge) => (
                        <li key={badge}>{badge}</li>
                      ))}
                    </ul>
                    <p className="id-building">
                      <span className="status-dot" aria-hidden="true" />
                      {about.card.building}
                    </p>
                  </div>
                )}
              </div>
              <p className="id-stack">{about.card.badges.join(' · ')}</p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
