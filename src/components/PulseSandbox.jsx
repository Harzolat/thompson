// PulseLab sandbox: density / accent / speed controls plus a live
// configuration readout. Fully presentational — PulseLab.jsx owns the
// state. Loaded lazily so it never blocks initial parsing.

function PulseSandbox({
  densities,
  accents,
  speeds,
  density,
  accent,
  accentHex,
  speed,
  onDensity,
  onAccent,
  onSpeed,
}) {
  return (
    <div className="lab-sandbox reveal-item">
      <div className="sandbox-controls">
        <div className="control-group" role="group" aria-label="Node density">
          <span className="control-label">Density</span>
          <div className="segmented">
            {densities.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={density === option}
                className={density === option ? 'is-active' : ''}
                onClick={() => onDensity(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="control-group" role="group" aria-label="Accent color">
          <span className="control-label">Accent</span>
          <div className="segmented">
            {accents.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={accent === option}
                className={accent === option ? 'is-active' : ''}
                onClick={() => onAccent(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="control-group" role="group" aria-label="Animation speed">
          <span className="control-label">Speed</span>
          <div className="segmented">
            {speeds.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={speed === option}
                className={speed === option ? 'is-active' : ''}
                onClick={() => onSpeed(option)}
              >
                {option.toFixed(1)}×
              </button>
            ))}
          </div>
        </div>
      </div>
      <pre className="sandbox-code" aria-hidden="true">
        <code>
          <span className="code-k">const</span> pulseConfig = {'{'}
          {'\n'}  density: <span className="code-s">"{density}"</span>,
          {'\n'}  accent: <span className="code-s">"{accentHex}"</span>,
          {'\n'}  velocity: <span className="code-n">{speed.toFixed(1)}</span>,
          {'\n'}
          {'}'};
        </code>
      </pre>
    </div>
  );
}

export default PulseSandbox;
