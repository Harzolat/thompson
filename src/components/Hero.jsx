import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Copy } from 'lucide-react';
import { site } from '../data/site.js';
import copyText from '../utils/copyText.js';
import LogoMarquee from './LogoMarquee.jsx';
import HeroScrollVisual from './HeroScrollVisual.jsx';

// PHASE 23 — Hero: centered editorial intro + scroll-reactive artwork.
// Layer 1 (this file): identity, headline, description, CTAs — a
// Motion-sequenced entrance, magnetic primary button. Layer 2
// (HeroScrollVisual): the Container Scroll card, the hero's primary
// visual interaction.
// The old pulse-field visual was retired to avoid two competing hero
// visuals; a small wave motif lives on inside the artwork.
//
// Pointer writes go straight to the DOM inside requestAnimationFrame,
// so moving the mouse causes zero React re-renders.

const reduceMotionQuery = '(prefers-reduced-motion: reduce)';

// Role line split: the part after " & " gets the serif italic accent.
const [ROLE_HEAD = site.roleTitle, ROLE_TAIL] = site.roleTitle.split(' & ');

// Entrance vocabulary — one curve for the whole sequence, identical to
// --ease in index.css. Elements rise 18px; the name lines slide up
// behind their mask. Delays are the original art-directed timings.
const EASE = [0.22, 1, 0.36, 1];
const RISE = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };
const LINE = { hidden: { opacity: 0, y: '110%' }, show: { opacity: 1, y: '0%' } };

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

  // One transition for every entrance element: reduced motion skips
  // the travel AND the wait (no duration, no delay), everyone else
  // gets the staged timings below. The sequence only plays when the
  // loader has lifted (`ready`), mirroring the old .hero-waiting gate.
  function seq(delay, duration = 0.7) {
    if (reducedMotion) return { duration: 0 };
    return { delay, duration, ease: EASE };
  }

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
            {/* Serif greeting — decorative; the accessible name
                stays the headline alone. First element in the copy
                stack, so it carries the earliest entrance delay. */}
            <motion.span
              className="hero-greeting"
              variants={RISE}
              initial="hidden"
              animate={ready ? 'show' : 'hidden'}
              transition={seq(0.05)}
              aria-hidden="true"
            >
              hey, I’m
            </motion.span>

            <h1 className="hero-title">
              <span className="mask">
                <motion.span
                  className="mask-inner"
                  variants={LINE}
                  initial="hidden"
                  animate={ready ? 'show' : 'hidden'}
                  transition={seq(0.15, 0.9)}
                >
                  Thompson
                </motion.span>
              </span>
              <span className="mask">
                <motion.span
                  className="mask-inner"
                  variants={LINE}
                  initial="hidden"
                  animate={ready ? 'show' : 'hidden'}
                  transition={seq(0.27, 0.9)}
                >
                  Harzolat<span className="accent-dot" aria-hidden="true">.</span>
                </motion.span>
              </span>
            </h1>

            <motion.p
              className="hero-role"
              variants={RISE}
              initial="hidden"
              animate={ready ? 'show' : 'hidden'}
              transition={seq(0.39)}
            >
              {ROLE_HEAD}
              {ROLE_TAIL && (
                <>
                  {' '}
                  <span className="role-accent">&amp; {ROLE_TAIL}</span>
                </>
              )}
            </motion.p>

            <motion.p
              className="hero-sub"
              variants={RISE}
              initial="hidden"
              animate={ready ? 'show' : 'hidden'}
              transition={seq(0.5)}
            >
              {site.description}
            </motion.p>
          </div>

          {/* Portrait: his cutout photo (hero.portrait in site.js).
              Desktop: stands on the page with a breathing glow, torso
              fading at the bottom. Mobile: fills the stage as the
              hero backdrop behind a dark scrim. A failed load hides
              the slot. */}
          {site.hero.portrait?.src && !portraitFailed ? (
            <motion.div
              className="hero-portrait"
              variants={RISE}
              initial="hidden"
              animate={ready ? 'show' : 'hidden'}
              transition={seq(0.3)}
            >
              <img
                src={site.hero.portrait.src}
                alt={site.hero.portrait.alt}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={() => setPortraitFailed(true)}
              />
            </motion.div>
          ) : null}
        </div>

        <motion.div
          className="hero-ctas"
          variants={RISE}
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
          transition={seq(0.62)}
        >
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
        </motion.div>

        <motion.p
          className="hero-status"
          variants={RISE}
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
          transition={seq(0.72)}
        >
          {site.status}
        </motion.p>

        <motion.ul
          className="hero-stats"
          variants={RISE}
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
          transition={seq(0.8)}
        >
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
        </motion.ul>

        {/* Mark + label strip: disciplines and tools from site.js
            (heroMarquee); icons are lucide, logos live in
            public/images/logos. */}
        <motion.div
          className="hero-marquee"
          variants={RISE}
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
          transition={seq(0.86)}
        >
          <LogoMarquee items={site.heroMarquee} label="What I do and tools" />
        </motion.div>
        </div>

        {/* ---- Layer 2: scroll-reactive artwork ---- */}
        <HeroScrollVisual />
      </div>
    </section>
  );
}

export default Hero;
