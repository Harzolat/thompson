import { useEffect, useRef, useState } from 'react';
import { site } from '../data/site.js';
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

function Hero() {
  const magnetRef = useRef(null);
  const frameRef = useRef(0);
  const [reducedMotion] = useState(
    () => window.matchMedia(reduceMotionQuery).matches,
  );

  // Cancel any queued frame on unmount.
  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

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

  return (
    <section id="top" className="hero" aria-label="Introduction">
      <div className="container hero-center">
        {/* ---- Layer 1: editorial identity ---- */}
        <p className="section-label hero-label rise" style={{ animationDelay: '0.05s' }}>
          <span className="brand-dot" aria-hidden="true" />
          {site.name} — {site.roles.join(' / ')}
        </p>

        <h1 className="hero-title">
          <span className="mask">
            <span className="mask-inner" style={{ animationDelay: '0.15s' }}>
              Building ideas
            </span>
          </span>
          <span className="mask">
            <span className="mask-inner" style={{ animationDelay: '0.27s' }}>
              into digital
            </span>
          </span>
          <span className="mask">
            <span className="mask-inner" style={{ animationDelay: '0.39s' }}>
              experiences<span className="accent-dot" aria-hidden="true">.</span>
            </span>
          </span>
        </h1>

        <p className="hero-sub rise" style={{ animationDelay: '0.52s' }}>
          {site.description}
        </p>

        <p className="hero-meta rise" style={{ animationDelay: '0.6s' }}>
          React.js · JavaScript · Founder of PulseLab
        </p>

        <div className="hero-ctas rise" style={{ animationDelay: '0.68s' }}>
          <a
            ref={magnetRef}
            className="btn-primary"
            href="#work"
            onMouseMove={handleMagnetMove}
            onMouseLeave={resetMagnet}
          >
            Explore my work
          </a>
          <a className="link-arrow" href="#pulselab">
            Enter PulseLab <span aria-hidden="true">→</span>
          </a>
        </div>

        <p className="hero-status rise" style={{ animationDelay: '0.78s' }}>
          <span className="status-dot" aria-hidden="true" />
          {site.status}
        </p>

        <a
          className="scroll-cue rise"
          style={{ animationDelay: '0.92s' }}
          href="#about"
          aria-label="Scroll down to the About section"
        >
          <span>Scroll</span>
          <span className="cue-line" aria-hidden="true">
            <span className="cue-dot" />
          </span>
        </a>

        {/* ---- Layer 2: scroll-reactive artwork ---- */}
        <HeroScrollVisual />
      </div>
    </section>
  );
}

export default Hero;
