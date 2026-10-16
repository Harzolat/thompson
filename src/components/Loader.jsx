import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { site } from '../data/site.js';

// Brand loader (exit concept reference: 21st.dev "Preloader" — a curved
// bottom edge that morphs flat as the panel slides up to reveal the page).
// Hand-built for our tokens with our Motion dependency: centered identity,
// slider bar beneath the name, curved-lift exit. Transient, decorative,
// skipped entirely under reduced motion (see App.jsx).

const DURATION = 1200;
const HOLD = 250;
const EASE = [0.76, 0, 0.24, 1];

function Loader({ onDone }) {
  const [count, setCount] = useState(0);
  const [width] = useState(() => window.innerWidth);

  useEffect(() => {
    let frame = 0;
    let timer = 0;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / DURATION, 1);
      setCount(Math.round(t * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        timer = window.setTimeout(onDone, HOLD);
      }
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [onDone]);

  // Curved belly hanging below the panel → flat line on exit.
  const belly = `M0 0 H${width} V56 Q${width / 2} 150 0 56 Z`;
  const flat = `M0 0 H${width} V56 Q${width / 2} 56 0 56 Z`;

  return (
    <motion.div
      className="loader"
      aria-hidden="true"
      // Past -100%: the curved belly hangs ~150px below the panel and
      // must fully clear the viewport before unmount, or its tip snaps.
      exit={{ y: 'calc(-100% - 160px)' }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {/* name tapes — outlined watermark bands, static and low-contrast */}
      <div className="loader-tapes" aria-hidden="true">
        <p className="loader-tape tape-top">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i}>Thompson Harzolat —&nbsp;</span>
          ))}
        </p>
        <p className="loader-tape tape-bottom">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i}>Thompson Harzolat —&nbsp;</span>
          ))}
        </p>
      </div>

      <motion.div
        className="loader-inner"
        exit={{ scale: 0.95, opacity: 0, y: -40, transition: { duration: 0.4 } }}
      >
        <p className="loader-brand">
          <span className="loader-dot" />
          {site.name.toUpperCase()}
        </p>
        <div className="loader-slider">
          <div className="loader-track">
            <span style={{ transform: `scaleX(${count / 100})` }} />
          </div>
          <span className="loader-pct">{count}%</span>
        </div>
      </motion.div>

      {width > 0 && (
        <svg
          className="loader-curve"
          viewBox={`0 0 ${width} 150`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.path
            fill="#0a0a0a"
            initial={{ d: belly }}
            exit={{ d: flat }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          />
        </svg>
      )}
    </motion.div>
  );
}

export default Loader;
