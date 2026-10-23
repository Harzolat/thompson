import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { site } from '../data/site.js';
import { CounterPlay, LogicPlay, CommunityPlay } from './CanvasExperiences.jsx';

// PHASE 23 canvas — tech preview card (concept reference: 21st.dev
// "Preloader"-style canvas block, hand-built for our tokens).
// Dot-matrix field, ambient glows, chrome header bar, animated SVG mark,
// stack badges and an honest status bar. No fake metrics: every label is
// real stack/site info from site.js.
// The three stack chips are the panel's tab controls (WAI-ARIA tabs,
// automatic activation): each switches the stage between three small,
// genuinely working demos — a React counter, a JS string transformer
// and a PulseLab focus picker. The card is interactive now, so it is
// no longer aria-hidden. Panel swaps crossfade via AnimatePresence.

const PANEL_VARIANTS = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: 'easeIn' } },
};

function Artwork() {
  const { visual } = site.hero;
  // If the file is missing or fails to load, fall back to the
  // SVG composition instead of showing a broken image.
  const [failed, setFailed] = useState(false);
  // Active experience — local state, per the panel's scope.
  const [tab, setTab] = useState(visual.badges[0].toLowerCase());

  const tabs = visual.badges.map((label) => ({
    id: label.toLowerCase(),
    label,
  }));
  const activeTab = tabs.find((item) => item.id === tab) ?? tabs[0];

  // Roving tabindex + automatic activation (WAI-ARIA tabs pattern).
  const onTabKeyDown = (event, index) => {
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft')
      next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    event.currentTarget.parentElement.children[next].focus();
  };

  return (
    <div className="scroll-card">
      {/* ambient glows */}
      <span className="canvas-glow glow-a" aria-hidden="true" />
      <span className="canvas-glow glow-b" aria-hidden="true" />

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
            fetchPriority="high"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <svg
            className="canvas-mark"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
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

        {/* experience switcher — the stack chips, now controls */}
        <div
          className="canvas-tabs"
          role="tablist"
          aria-label="Sandbox experiences"
        >
          {tabs.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`stage-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              className="canvas-badge canvas-tab"
              onClick={() => setTab(item.id)}
              onFocus={() => setTab(item.id)}
              onKeyDown={(event) => onTabKeyDown(event, i)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* active experience — crossfades, never shifts the layout */}
        <div className="canvas-stage">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              role="tabpanel"
              id={`stage-${tab}`}
              aria-labelledby={`tab-${tab}`}
              className="canvas-panel"
              variants={PANEL_VARIANTS}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {tab === 'react' && <CounterPlay />}
              {tab === 'javascript' && <LogicPlay />}
              {tab === 'pulselab' && <CommunityPlay />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* status bar — real stack info + the live experience readout */}
      <div className="scroll-row scroll-foot">
        <span className="scroll-meta mono">{visual.stack}</span>
        <span className="canvas-foot-tag">{activeTab.label}</span>
      </div>
    </div>
  );
}

function HeroScrollVisual() {
  const wrapRef = useRef(null);
  const reduceMotion = useReducedMotion();
  // Gentler travel on small screens so the card never feels oversized.
  const [isSmall] = useState(() => window.matchMedia('(max-width: 600px)').matches);

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
    </div>
  );
}

export default HeroScrollVisual;
