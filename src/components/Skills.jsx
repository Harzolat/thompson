import { useRef, useState } from 'react';
import {
  AppWindow,
  BrainCircuit,
  Code2,
  Cpu,
  Fingerprint,
  FlaskConical,
  Globe,
  Layers,
  MessagesSquare,
  MousePointerClick,
  PenTool,
  Users,
} from 'lucide-react';
import { site } from '../data/site.js';
import useSectionReveal from '../hooks/useSectionReveal.js';

// PHASE 6 — Capabilities: what Thompson can create (not proficiency scores).
// Editorial index: big statement left, interactive list right.
// Interaction = emphasis only: the hovered/focused/tapped item is full
// strength (with a small accent marker), the rest go quiet. Nothing is
// ever hidden, so touch + keyboard + mouse all get the full content.
// Entrance: useSectionReveal adds .is-visible once.

// Tile icons are looked up here; labels stay editable in site.js.
const TILE_ICONS = {
  code: Code2,
  app: AppWindow,
  interactive: MousePointerClick,
  pen: PenTool,
  layers: Layers,
  identity: Fingerprint,
  ai: BrainCircuit,
  experiment: FlaskConical,
  tools: Cpu,
  community: Users,
  sharing: MessagesSquare,
  platforms: Globe,
};

function Skills() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(null); // emphasized item index
  const { capabilities } = site;

  useSectionReveal(sectionRef, { threshold: 0.15 });

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="section skills"
      aria-label="Capabilities"
    >
      <div className="container skills-grid">
        {/* Left — statement */}
        <div className="skills-side">
          <p className="section-label reveal-item">{capabilities.label}</p>
          <h2 className="skills-statement reveal-item">
            {capabilities.statement}{' '}
            <span className="title-accent">{capabilities.statementAccent}</span>
          </h2>
          <p className="skills-note reveal-item">{capabilities.note}</p>
        </div>

        {/* Right — interactive capability index */}
        <ul
          className={`skills-list reveal-item${active !== null ? ' has-active' : ''}`}
        >
          {capabilities.items.map((item, i) => (
            <li
              key={item.name}
              tabIndex={0}
              className={`skill${active === i ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(i)}
              aria-label={`${item.name}: ${item.points.join(', ')}`}
            >
              <span className="skill-head">
                <span className="skill-index" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="skill-name">{item.name}</span>
                <span className="skill-marker" aria-hidden="true" />
              </span>
              {/* Visual tiles: icon + word per category facet.
                  Decorative (points below carry the content). */}
              <div className="skill-tiles" aria-hidden="true">
                {item.tiles.map((tile) => {
                  const Icon = TILE_ICONS[tile.icon] || Code2;
                  return (
                    <span className="skill-tile" key={tile.label}>
                      <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                      {tile.label}
                    </span>
                  );
                })}
              </div>
              {item.badges.length > 0 && (
                <ul className="skill-badges" aria-label={`${item.name} tools`}>
                  {item.badges.map((badge) => (
                    <li key={badge}>{badge}</li>
                  ))}
                </ul>
              )}
              <ul className="skill-points">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Skills;
