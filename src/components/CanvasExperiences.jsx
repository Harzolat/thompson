import { useState } from 'react';
import { motion } from 'motion/react';
import { site } from '../data/site.js';

// The three experiences inside the hero sandbox card (the "preview.pulse.lab"
// panel). Each is a small, genuinely working demo: real state, real output —
// no fake editors, no eval. Copy lives in site.js (hero.visual.experiences);
// chip labels and the community content come from the shared data too.
// Motion here is limited to the focus-chip stagger; the panel swap itself
// is owned by the card (AnimatePresence in HeroScrollVisual).

const { experiences } = site.hero.visual;
const { pulseLab } = site;

/* A. React — component playground: one useState, three controls. */
function CounterPlay() {
  const [count, setCount] = useState(0);
  const copy = experiences.react;

  return (
    <div className="panel">
      <p className="panel-kicker mono">{copy.title}</p>
      <p className="panel-readout">
        <span className="panel-count" aria-live="polite">
          {count}
        </span>
        <code className="panel-state mono">{`{ count: ${count} }`}</code>
      </p>
      <div className="panel-controls">
        <button
          type="button"
          className="panel-btn"
          onClick={() => setCount(count - 1)}
          aria-label="Decrement count"
        >
          −
        </button>
        <button
          type="button"
          className="panel-btn"
          onClick={() => setCount(count + 1)}
          aria-label="Increment count"
        >
          +
        </button>
        <button
          type="button"
          className="panel-btn panel-btn-reset"
          onClick={() => setCount(0)}
        >
          Reset
        </button>
      </div>
      <p className="panel-note">{copy.note}</p>
      <p className="panel-foot">
        <a className="panel-link" href={copy.link.href}>
          {copy.link.label} <span aria-hidden="true">→</span>
        </a>
      </p>
    </div>
  );
}

/* B. JavaScript — logic playground: state in, derived string out. */
const MODES = [
  { id: 'upper', label: 'UPPERCASE', fn: (s) => s.toUpperCase() },
  { id: 'lower', label: 'lowercase', fn: (s) => s.toLowerCase() },
  { id: 'reverse', label: 'reverse', fn: (s) => [...s].reverse().join('') },
];

function LogicPlay() {
  const copy = experiences.javascript;
  const [text, setText] = useState(pulseLab.motto);
  const [mode, setMode] = useState(null);

  const activeMode = MODES.find((m) => m.id === mode);
  const output = activeMode ? activeMode.fn(text) : text;
  const isEmpty = text.length === 0;

  // Clicking the active transform again returns to the plain input.
  const toggleMode = (id) => setMode((current) => (current === id ? null : id));

  return (
    <div className="panel">
      <p className="panel-kicker mono">{copy.title}</p>
      <div className="panel-field">
        <label className="panel-label mono" htmlFor="canvas-js-input">
          input
        </label>
        <input
          id="canvas-js-input"
          className="panel-input mono"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
          spellCheck="false"
        />
        <span className="panel-meta mono" aria-hidden="true">
          {text.length} chars
        </span>
      </div>
      <div className="panel-controls">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className="panel-btn"
            aria-pressed={mode === m.id}
            onClick={() => toggleMode(m.id)}
          >
            {m.label}
          </button>
        ))}
        <button
          type="button"
          className="panel-btn panel-btn-reset"
          onClick={() => {
            setText(pulseLab.motto);
            setMode(null);
          }}
        >
          Reset
        </button>
      </div>
      <div className="panel-field">
        <span className="panel-label mono">
          output{activeMode ? ` · ${activeMode.id}()` : ''}
        </span>
        <p className="panel-output mono">
          {isEmpty ? (
            <span className="panel-empty">Empty input — nothing to transform.</span>
          ) : (
            output
          )}
        </p>
      </div>
      <p className="panel-note">{copy.note}</p>
    </div>
  );
}

/* Stagger for the focus-area chips (coordinated, one-shot). */
const CHIPS_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const CHIP_VARIANTS = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

/* C. PulseLab — community focus: motto, focus picker, real CTA. */
function CommunityPlay() {
  const copy = experiences.pulselab;
  const [focus, setFocus] = useState(0);
  const pillar = pulseLab.pillars[focus];

  return (
    <div className="panel">
      <p className="panel-kicker mono">{copy.title}</p>
      <p className="panel-motto">{pulseLab.motto}</p>
      <div
        className="panel-chips"
        role="group"
        aria-label="PulseLab focus areas"
        variants={CHIPS_VARIANTS}
        initial="hidden"
        animate="show"
      >
        {pulseLab.pillars.map((item, i) => (
          <motion.button
            key={item.name}
            type="button"
            className="panel-btn panel-chip"
            aria-pressed={focus === i}
            onClick={() => setFocus(i)}
            variants={CHIP_VARIANTS}
          >
            {item.name}
          </motion.button>
        ))}
      </div>
      <p className="panel-blurb">{pillar.blurb}</p>
      <p className="panel-items mono">{pillar.items.join(' · ')}</p>
      <p className="panel-foot">
        <a
          className="panel-link"
          href={pulseLab.cta.href}
        >
          {pulseLab.cta.label} <span aria-hidden="true">→</span>
        </a>
      </p>
    </div>
  );
}

export { CounterPlay, LogicPlay, CommunityPlay };
