import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { site } from '../data/site.js';
import copyText from '../utils/copyText.js';
import LogoMarquee from './LogoMarquee.jsx';
import HeroScrollVisual from './HeroScrollVisual.jsx';

// PHASE 23 — Hero: centered editorial intro + scroll-reactive artwork.
// Layer 1 (this file): identity, headline, description, CTAs — staged
// entrance, magnetic primary button. Layer 2 (HeroScrollVisual): the
// Container Scroll card, the hero's primary visual interaction.
// The old pulse-field visual was retired to avoid two competing hero
// visuals; a small wave motif lives on inside the artwork.
//
// Pointer writes go straight to the DOM inside requestAnimationFrame,
// so moving the mouse causes zero React re-renders.

const reduceMotionQuery = '(prefers-reduced-motion: reduce)';

function Hero({ ready = true }) {
  const magnetRef = useRef(null);
  const frameRef = useRef(0);
  const [reducedMotion] = useState(
    () => window.matchMedia(reduceMotionQuery).matches,
  );
  // Copy-email feedback: transient label only, reverts automatically.
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(0);
  // Portrait guard: a missing file hides the slot instead of showing a
  // broken image (see public/images/README.md).
  const [portraitFailed, setPortraitFailed] = useState(false);

  // Cancel any queued frame on unmount.
  useEffect(() => () => {
    cancelAnimationFrame(frameRef.current);
    window.clearTimeout(copyTimer.current);
  }, []);

  function handleMagnetMove(event) {
    if (reducedMotion) return;
    const button = magnetRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      button.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
  }

  function resetMagnet() {
    const button = magnetRef.current;
    if (!button || reducedMotion) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      button.style.transform = 'translate3d(0px, 0px, 0)';
    });
  }

  async function copySiteEmail() {
    await copyText(site.email);
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      id="top"
      className={ready ? 'hero' : 'hero hero-waiting'}
      aria-label="Introduction"
    >
      <div className="container hero-center">
        {/* ---- Layer 1: full-viewport editorial intro ---- */}
        <div className="hero-viewport">
        <div className="hero-top">
          <div className="hero-copy">
            <p className="section-label hero-label rise" style={{ animationDelay: '0.05s' }}>
              <span className="status-dot" aria-hidden="true" />
              <span className="mono">Software Engineer & UI/UX Designer</span>
            </p>

            <h1 className="hero-title">
              <span className="mask">
                <span className="mask-inner" style={{ animationDelay: '0.15s' }}>
                  Thompson
                </span>
              </span>
              <span className="mask">
                <span className="mask-inner" style={{ animationDelay: '0.27s' }}>
                  Harzolat<span className="accent-dot" aria-hidden="true">.</span>
                </span>
              </span>
            </h1>

            <p className="hero-role rise" style={{ animationDelay: '0.39s' }}>
              {site.roleTitle}
            </p>

            <p className="hero-sub rise" style={{ animationDelay: '0.5s' }}>
              {site.description}
            </p>
          </div>

          {/* Portrait: his real photo (hero.portrait in site.js), framed
              with the hairline token and the site's photo shadow; a
              failed load hides the slot, leaving the clean layout. */}
          {site.hero.portrait?.src && !portraitFailed ? (
            <div
              className="hero-portrait rise"
              style={{ animationDelay: '0.3s' }}
            >
              <img
                src={site.hero.portrait.src}
                alt={site.hero.portrait.alt}
                loading="eager"
                fetchpriority="high"
                decoding="async"
                onError={() => setPortraitFailed(true)}
              />
            </div>
          ) : null}
        </div>

        <div className="hero-ctas rise" style={{ animationDelay: '0.62s' }}>
          <Link
            ref={magnetRef}
            className="btn-primary"
            to={{ pathname: '/', hash: '#work' }}
            onMouseMove={handleMagnetMove}
            onMouseLeave={resetMagnet}
          >
            View Selected Work
          </Link>
          <button
            className="btn-outline"
            type="button"
            onClick={copySiteEmail}
            aria-label={copied ? 'Email address copied' : 'Copy email address'}
          >
            <Copy size={15} strokeWidth={2} aria-hidden="true" />
            {copied ? 'Copied ✓' : site.email}
          </button>
          <Link className="link-arrow" to="/pulselab">
            Explore PulseLab <span aria-hidden="true">→</span>
          </Link>
        </div>

        <p className="hero-status rise" style={{ animationDelay: '0.72s' }}>
          {site.status}
        </p>

        <ul className="hero-stats rise" style={{ animationDelay: '0.8s' }}>
          {site.heroStats.map((stat) => (
            <li
              key={stat.label}
              aria-label={`${stat.value} ${stat.label}`}
            >
              <span className="hero-stat-value" aria-hidden="true">
                {stat.value}
              </span>
              <span className="hero-stat-label" aria-hidden="true">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Mark + label strip: disciplines and tools from site.js
            (heroMarquee); icons are lucide, logos live in
            public/images/logos. */}
        <div className="hero-marquee rise" style={{ animationDelay: '0.86s' }}>
          <LogoMarquee items={site.heroMarquee} label="What I do and tools" />
        </div>
        </div>

        {/* ---- Layer 2: scroll-reactive artwork ---- */}
        <HeroScrollVisual />
      </div>
    </section>
  );
}

export default Hero;
