import { useEffect, useRef, useState } from 'react';
import { MousePointerClick, Move } from 'lucide-react';
import { site } from '../data/site.js';
import useSectionReveal from '../hooks/useSectionReveal.js';

// PHASE 8 — Creative: one interactive digital sculpture.
// Concept: a "structural study" — three nested wireframe cubes
// (outer ink, middle gray, solid charcoal core with one blue face).
// It reads as an architect's study model: craft, systems, building.
// Built with CSS 3D only — no Three.js (see report for why).
//
// ONE primary interaction: pointer tilt (the object turns in your hands).
// ONE secondary interaction: click / Enter reconfigures the study.
// Idle: an extremely slow spin, like a gallery turntable.

const FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'];

// Extra rotation (degrees) applied to the middle + inner cubes per study.
const CONFIGS = [
  { mid: [18, -24], inner: [0, 0] },
  { mid: [-20, 32], inner: [24, -18] },
  { mid: [30, 12], inner: [-22, 28] },
];

// One wireframe cube. Size via --s; faces fold around it in CSS.
function Cube({ size, tone, rotation }) {
  return (
    <div
      className={`cube cube-${tone}`}
      aria-hidden="true"
      style={{
        '--s': `${size}px`,
        transform: `rotateX(${rotation[0]}deg) rotateY(${rotation[1]}deg)`,
      }}
    >
      {FACES.map((face) => (
        <span key={face} className={`face f-${face}`} />
      ))}
    </div>
  );
}

function Creative() {
  const sectionRef = useRef(null);
  const { creative } = site;
  const [study, setStudy] = useState(0);
  // Tilt writes straight to the DOM inside rAF — moving the pointer
  // never re-renders (matters for main-thread responsiveness).
  const tiltRef = useRef(null);
  const frameRef = useRef(0);
  // Display controls — discrete choices only, no continuous input.
  // Speed changes the turntable rate; style fills the wireframes;
  // accent swaps the core face. All classes, no new dependencies.
  const [speed, setSpeed] = useState('slow');
  const [style, setStyle] = useState('wire');
  const [accent, setAccent] = useState('blue');
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const config = CONFIGS[study % CONFIGS.length];

  // Reveal once + toggle .is-inview so the turntable idles only
  // while visible. Kept observing (not disconnected). Interaction
  // (tilt, reconfigure) works regardless of visibility.
  useSectionReveal(sectionRef, { threshold: 0.2, trackInView: true });

  // Cancel any queued tilt frame on unmount.
  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function handleMove(event) {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (tiltRef.current) {
        tiltRef.current.style.transform = `rotateX(${(-y * 28).toFixed(1)}deg) rotateY(${(x * 28).toFixed(1)}deg)`;
      }
    });
  }

  function resetTilt() {
    if (reducedMotion) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (tiltRef.current) tiltRef.current.style.transform = '';
    });
  }

  function nextStudy() {
    setStudy((value) => (value + 1) % CONFIGS.length);
  }

  return (
    <section
      id="creative"
      ref={sectionRef}
      className="section creative"
      aria-label="Creative experiment"
    >
      <div className="container creative-grid">
        {/* Left — statement */}
        <div className="creative-copy">
          <p className="section-label reveal-item">{creative.label}</p>
          <h2 className="creative-statement reveal-item">
            {creative.statement}{' '}
            <span className="title-accent">{creative.statementAccent}</span>
          </h2>
          <p className="creative-intro reveal-item">{creative.intro}</p>
          <p className="creative-instruction reveal-item">
            <Move size={14} strokeWidth={2} aria-hidden="true" />
            {creative.instruction.explore}
            <span aria-hidden="true">·</span>
            <MousePointerClick size={14} strokeWidth={2} aria-hidden="true" />
            {creative.instruction.reconfigure}
          </p>
          <p className="creative-closing reveal-item">{creative.closing}</p>
        </div>

        {/* Right — the sculpture */}
        <div className="creative-visual reveal-item">
          {/* Semantic button: native keyboard support, correct SR role.
              Tilt + reconfigure keep working while idle spin is paused. */}
          <button
            type="button"
            className={`construct${reducedMotion ? ' is-still' : ''} speed-${speed} style-${style} accent-${accent}`}
            aria-label={`Interactive structural study. Activate to reconfigure. Currently showing ${creative.studies[study]}.`}
            onPointerMove={handleMove}
            onPointerLeave={resetTilt}
            onClick={nextStudy}
          >
            {/* museum label for the installation */}
            <span className="fig-tag" aria-hidden="true">
              Fig. 01
            </span>
            <div className="construct-spin">
              <div ref={tiltRef} className="construct-tilt">
                <Cube size={132} tone="outer" rotation={[0, 0]} />
                <Cube size={88} tone="mid" rotation={config.mid} />
                <Cube size={48} tone="inner" rotation={config.inner} />
              </div>
            </div>
          </button>

          {/* Study selector — the active study is always explicit */}
          <div className="construct-tabs" role="group" aria-label="Studies">
            {creative.studies.map((name, i) => (
              <button
                key={name}
                type="button"
                className={`study-tab${i === study ? ' is-active' : ''}`}
                aria-pressed={i === study}
                onClick={() => setStudy(i)}
              >
                <span className="study-dot" aria-hidden="true" />
                {name}
              </button>
            ))}
          </div>

          {/* Display controls — small, honest, in-palette only */}
          <div className="construct-controls">
            <div className="control-group" role="group" aria-label="Rotation speed">
              <span className="control-label">Speed</span>
              <div className="segmented">
                {['slow', 'fast'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={speed === option}
                    className={speed === option ? 'is-active' : ''}
                    onClick={() => setSpeed(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group" role="group" aria-label="Render style">
              <span className="control-label">Style</span>
              <div className="segmented">
                {['wire', 'solid'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={style === option}
                    className={style === option ? 'is-active' : ''}
                    onClick={() => setStyle(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group" role="group" aria-label="Accent color">
              <span className="control-label">Accent</span>
              <div className="segmented">
                {['blue', 'ink'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={accent === option}
                    className={accent === option ? 'is-active' : ''}
                    onClick={() => setAccent(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Creative;
