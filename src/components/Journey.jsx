import { useEffect, useRef, useState } from 'react';
import { site } from '../data/site.js';
import useSectionReveal from '../hooks/useSectionReveal.js';

// Journey: how the curiosity evolved. Sticky statement left, milestone
// rail right: vertical line, per-stage nodes that light up as each stage
// passes through view (discrete observer updates — no scroll listeners).
// Descriptions and dates are always visible; motion only shifts emphasis.

function Journey() {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const { journey } = site;
  // Index of the milestone currently in view — drives the rail node.
  // Discrete observer updates only; no scroll listeners.
  const [current, setCurrent] = useState(0);

  // Reveal once when the section enters the viewport.
  useSectionReveal(sectionRef, { threshold: 0.12 });

  // Rail tracking: the milestone nearest the viewport middle lights up.
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === 'undefined') return;
    const items = Array.from(list.children);
    const tracker = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrent(items.indexOf(entry.target));
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    items.forEach((item) => tracker.observe(item));
    return () => tracker.disconnect();
  }, []);

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="section journey"
      aria-label="Journey"
    >
      <div className="container journey-grid">
        {/* Left — sticky statement */}
        <div className="journey-side">
          <p className="section-label reveal-item">{journey.label}</p>
          <h2 className="journey-statement reveal-item">
            {journey.statement}{' '}
            <span className="title-accent">{journey.statementAccent}</span>
          </h2>
          <p className="journey-intro reveal-item">{journey.intro}</p>
        </div>

        {/* Right — milestone rail */}
        <ol className="journey-list" ref={listRef}>
          {journey.milestones.map((milestone, i) => (
            <li
              key={milestone.number}
              tabIndex={0}
              className={`milestone reveal-item${current === i ? ' is-current' : ''}`}
              aria-label={`${milestone.number}, ${milestone.title}, ${milestone.period}, ${milestone.date}`}
            >
              <span className="milestone-node" aria-hidden="true" />
              <span className="milestone-num" aria-hidden="true">
                {milestone.number}
              </span>
              <span className="milestone-body">
                <span className="milestone-top">
                  <span className="milestone-period">{milestone.period}</span>
                  <span className="milestone-date">{milestone.date}</span>
                </span>
                <span className="milestone-title">{milestone.title}</span>
                <span className="milestone-desc">{milestone.description}</span>
                <span className="milestone-tags">
                  {milestone.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Journey;
