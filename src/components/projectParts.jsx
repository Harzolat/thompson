import { useState } from 'react';

// Shared project building blocks, used by both Projects.jsx (gallery)
// and CaseStudy.jsx (drawer, loaded lazily). One home so the two views
// can never drift apart.

// Project visual: photo when available, abstract placeholder otherwise.
// A set-but-missing file falls back to the placeholder via onError.
export function ProjectVisual({ project, total }) {
  const [failed, setFailed] = useState(false);
  if (project.image && !failed) {
    return (
      <div className="work-visual">
        <img
          src={project.image}
          alt={project.imageAlt || `${project.title} preview`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
        <span className="work-count">
          {project.number} / {String(total).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className="work-visual" aria-hidden="true">
      {/* Art-directed cover: typography + blocks + lines.
          Obviously a placeholder — swap `image` in projects.js
          for a real screenshot and this whole block is replaced. */}
      <div className="work-abstract">
        <span className="cover-top">
          <span className="work-abstract-cat">{project.category}</span>
          <span className="cover-study">Study</span>
        </span>
        <span className="work-abstract-num">{project.number}</span>
        <span className="cover-foot">
          <span className="cover-year">{project.year}</span>
          <span className="cover-block">→</span>
        </span>
      </div>
      <span className="work-count">
        {project.number} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
}

// Small editorial meta block: role · technology · year.
// Empty fields are skipped so concept entries never render blanks.
export function ProjectMeta({ project }) {
  const tech = project.tech.length ? project.tech.join(' / ') : null;
  return (
    <dl className="work-meta">
      <div>
        <dt>Role</dt>
        <dd>{project.role}</dd>
      </div>
      {tech && (
        <div>
          <dt>Technology</dt>
          <dd>{tech}</dd>
        </div>
      )}
      <div>
        <dt>Year</dt>
        <dd>{project.year}</dd>
      </div>
    </dl>
  );
}

// Key highlights — rendered only when the data provides true strings.
export function ProjectHighlights({ highlights }) {
  if (!highlights || highlights.length === 0) return null;
  return (
    <ul className="work-highlights" aria-label="Key highlights">
      {highlights.map((highlight) => (
        <li key={highlight}>
          <span aria-hidden="true">✓</span>
          {highlight}
        </li>
      ))}
    </ul>
  );
}

// External destinations open in a new tab; internal anchors stay in-page.
function projectTarget(href) {
  return href && href.startsWith('http')
    ? { target: '_blank', rel: 'noreferrer' }
    : {};
}

// Dual actions when real destinations exist, single fallback otherwise.
// Nothing renders for empty demo/repo — no dead buttons, ever.
export function ProjectLinks({ project }) {
  const hasDual = project.demo || project.repo;
  if (!hasDual) {
    return (
      <a className="link-arrow" href={project.link}>
        View project <span aria-hidden="true">→</span>
      </a>
    );
  }
  return (
    <div className="work-links">
      {project.demo && (
        <a className="btn-primary btn-small" href={project.demo} {...projectTarget(project.demo)}>
          Live Demo <span aria-hidden="true">↗</span>
        </a>
      )}
      {project.repo && (
        <a className="btn-outline" href={project.repo} {...projectTarget(project.repo)}>
          Source Code <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}
