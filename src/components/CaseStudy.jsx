import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import {
  ProjectHighlights,
  ProjectLinks,
  ProjectMeta,
  ProjectVisual,
} from './projectParts.jsx';

// Case-study drawer: visual, facts, links, plus narrative sections
// that render ONLY when the data provides them (overview, challenge,
// solution, results). Focus moves in on open and returns on close;
// Escape and backdrop clicks close. No fake metrics, ever.
// Loaded lazily by Projects.jsx so it never blocks initial parsing.
function CaseStudy({ project, total, onClose }) {
  const closeRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    openerRef.current = document.activeElement;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
      if (openerRef.current?.focus) openerRef.current.focus();
    };
  }, [onClose]);

  const sections = [
    { heading: 'Overview', body: project.overview },
    { heading: 'The challenge', body: project.challenge },
    { heading: 'Solution & architecture', body: project.solution },
  ];

  return (
    <div
      className="case-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="case-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} case study`}
      >
        <button
          ref={closeRef}
          type="button"
          className="case-close"
          onClick={onClose}
          aria-label="Close case study"
        >
          <X size={18} strokeWidth={2} aria-hidden="true" />
        </button>
        <p className="section-label">
          Case study · {project.number} / {String(total).padStart(2, '0')}
        </p>
        <h3 className="case-title">{project.title}</h3>
        <p className="case-desc">{project.description}</p>
        <ProjectVisual project={project} total={total} />
        {sections.map(
          (section) =>
            section.body && (
              <div className="case-section" key={section.heading}>
                <h4>{section.heading}</h4>
                <p>{section.body}</p>
              </div>
            ),
        )}
        {project.results && project.results.length > 0 && (
          <div className="case-section" key="results">
            <h4>Results & impact</h4>
            <ProjectHighlights highlights={project.results} />
          </div>
        )}
        <ProjectMeta project={project} />
        <ProjectLinks project={project} />
      </div>
    </div>
  );
}

export default CaseStudy;
