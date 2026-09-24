import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { site } from '../data/site.js';

// PHASE 23 canvas — tech preview card (concept reference: 21st.dev
// "Preloader"-style canvas block, hand-built for our tokens).
// Dot-matrix field, ambient glows, chrome header bar, animated SVG mark,
// stack badges and an honest status bar. No fake metrics: every label is
// real stack/site info from site.js.

function Artwork() {
  const { visual } = site.hero;
  // If the file is missing or fails to load, fall back to the
  // SVG composition instead of showing a broken image.
  const [failed, setFailed] = useState(false);

  return (
    <div className="scroll-card" aria-hidden="true">
      {/* ambient glows */}
      <span className="canvas-glow glow-a" />
      <span className="canvas-glow glow-b" />

      {/* chrome header */}
      <div className="scroll-row canvas-bar">
        <span className="canvas-traffic">
          <span className="dot-r" />
          <span className="dot-y" />
          <span className="dot-g" />
          <span className="canvas-sandbox mono">{visual.sandbox}</span>
        </span>
        <span className="canvas-live">
          <span className="canvas-pulse" />
          {visual.sandboxBadge}
        </span>
      </div>

      {/* center stage */}
      <div className="canvas-center">
        {visual.image && !failed ? (
          <img
            className="canvas-shot"
            src={visual.image}
            alt=""
            loading="eager"
            fetchpriority="high"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <svg className="canvas-mark" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="mark-ring"
            />
            <rect
              x="25"
              y="25"
              width="50"
              height="50"
              rx="8"
              stroke="var(--color-accent)"
              strokeWidth="2"
              className="mark-box"
            />
            <path
              d="M35 50L45 60L65 40"
              stroke="#fafaf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <p className="canvas-code mono">{visual.codeLine}</p>
        <p className="canvas-sub mono">{visual.codeSub}</p>
        <div className="canvas-badges">
          {visual.badges.map((badge, i) => (
            <span
              key={badge}
              className={`canvas-badge${i === visual.badges.length - 1 ? ' is-accent' : ''}`}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* status bar — real stack info only, no invented metrics */}
      <div className="scroll-row scroll-foot">
        <span className="scroll-meta mono">{visual.stack}</span>
        <span className="canvas-foot-tag">{visual.footRight}</span>
      </div>
    </div>
  );
}

function HeroScrollVisual() {
  const wrapRef = useRef(null);
  const reduceMotion = useReducedMotion();
  // Gentler travel on small screens so the card never feels oversized.
  const [isSmall] = useState(() => window.matchMedia('(max-width: 600px)').matches);
  const { visual } = site.hero;

  // 0 as the card enters the viewport → 1 as it reaches mid-viewport.
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start end', 'center center'],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [isSmall ? 8 : 18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [isSmall ? 1.015 : 1.04, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [isSmall ? 40 : 84, 0]);

  return (
    <div ref={wrapRef} className="scroll-wrap rise" style={{ animationDelay: '0.45s' }}>
      {reduceMotion ? (
        // Final resting position, no scroll animation.
        <Artwork />
      ) : (
        <motion.div style={{ rotateX, scale, y }}>
          <Artwork />
        </motion.div>
      )}
      <p className="pulse-caption scroll-caption">{visual.caption}</p>
    </div>
  );
}

export default HeroScrollVisual;
