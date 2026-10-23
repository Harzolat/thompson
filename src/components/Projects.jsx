import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects.js';
import useGitHubStats from '../hooks/useGitHub.js';
import useSectionReveal from '../hooks/useSectionReveal.js';
import {
  ProjectHighlights,
  ProjectLinks,
  ProjectMeta,
  ProjectVisual,
} from './projectParts.jsx';

// Case-study drawer loads on demand — never part of the initial bundle.
const CaseStudy = lazy(() => import('./CaseStudy.jsx'));

// PHASE 5 — Work: a curated case-study index, not a card grid.
// - First project is featured with a large visual area.
// - The rest are editorial index rows (number / title / meta / arrow).
// - No custom cursor (keeps keyboard + touch simple and accessible).
// - Visuals: real <img> when project.image is set, otherwise an
//   abstract placeholder. Swap data only — no component changes needed.

const LABEL = '03 / Work';
const STATEMENT = 'Things I’ve built, explored and';
const STATEMENT_ACCENT = 'brought to life.';

// Floating preview card size — must match .work-preview in index.css.
const PREVIEW_W = 300;
const PREVIEW_H = 200;

// Featured slideshow: manual arrows, dots and touch swipe between the
// project's gallery shots. No autoplay — calm by default, instant under
// reduced motion (global transition collapse). Decorative duplicates of
// information the text already carries.
function ProjectSlideshow({ project, total }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});
  const touchX = useRef(null);
  const shots = project.gallery.filter((shot) => shot.src && !failed[shot.src]);
  const count = shots.length;

  // A missing file drops that slide instead of breaking the carousel.
  function flagFailed(src) {
    setFailed((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  }

  function go(next) {
    if (count === 0) return;
    setIndex((value) => (value + next + count) % count);
  }

  function onTouchStart(event) {
    touchX.current = event.touches[0].clientX;
  }

  function onTouchEnd(event) {
    if (touchX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
  }

  if (count === 0) {
    return <ProjectVisual project={{ ...project, image: null }} total={total} />;
  }

  return (
    <div
      className="work-slideshow"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${project.title} screenshots`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="slide-stage">
        {shots.map((shot, i) => (
          <img
            key={shot.src}
            src={shot.src}
            alt={i === index ? shot.alt : ''}
            aria-hidden={i === index ? undefined : true}
            loading={i === 0 ? 'eager' : 'lazy'}
            onError={() => flagFailed(shot.src)}
            className={`slide${i === index ? ' is-active' : ''}`}
          />
        ))}
        <span className="work-count">
          {project.number} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <button
        type="button"
        className="slide-arrow slide-prev"
        onClick={() => go(-1)}
        aria-label={`Previous ${project.title} screenshot`}
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        className="slide-arrow slide-next"
        onClick={() => go(1)}
        aria-label={`Next ${project.title} screenshot`}
      >
        <span aria-hidden="true">›</span>
      </button>
      <div className="slide-dots" role="tablist" aria-label="Choose screenshot">
        {shots.map((shot, i) => (
          <button
            key={shot.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Screenshot ${i + 1} of ${count}`}
            className={`slide-dot${i === index ? ' is-active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

// Live repo facts (stars + primary language) from the GitHub API.
// Renders nothing until the data arrives or if the request fails.
function repoPath(url) {
  if (!url || !url.includes('github.com/')) return null;
  return url.split('github.com/')[1].replace(/\/$/, '');
}

function RepoLive({ project, stats }) {
  if (!stats) return null;
  const path = project.repo ? repoPath(project.repo) : repoPath(project.link);
  const live = path ? stats.byPath[path] : null;
  if (!live) return null;
  return (
    <span className="work-live">
      ★ {live.stars}
      {live.language ? ` · ${live.language}` : ''}
    </span>
  );
}

// Local copy of the link-target rule (projectParts keeps its own;
// one shared file can't export helpers alongside components).
function projectTarget(href) {
  return href && href.startsWith('http')
    ? { target: '_blank', rel: 'noreferrer' }
    : {};
}

// Row variant: stars only (the row already lists its tech statically).
function RowLive({ project, stats }) {
  if (!stats) return null;
  const path = project.repo ? repoPath(project.repo) : repoPath(project.link);
  const live = path ? stats.byPath[path] : null;
  if (!live) return null;
  return <> · ★ {live.stars}</>;
}

// Shared gallery building blocks live in projectParts.jsx (also used by
// the lazily loaded CaseStudy drawer) so the two views never drift apart.

function HoverCover({ project }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const candidates = [
    { src: project.previewImage, alt: project.previewImageAlt },
    { src: project.image, alt: project.imageAlt },
  ];
  const cover = candidates.find((c) => c.src && c.src !== failedSrc);
  if (!cover) {
    return (
      <div className="work-preview-inner preview-cover">
        <span className="preview-cover-top">
          <span className="preview-cover-cat">{project.category}</span>
          <span className="preview-cover-num">{project.number}</span>
        </span>
        <span className="preview-cover-foot">
          <span>{project.year}</span>
          <span className="preview-cover-block" />
        </span>
      </div>
    );
  }
  return (
    <img
      className="work-preview-inner"
      src={cover.src}
      alt={cover.alt || ''}
      loading="lazy"
      onError={() => setFailedSrc(cover.src)}
    />
  );
}

function Projects() {
  const sectionRef = useRef(null);
  const [featured, ...rest] = projects;
  const github = useGitHubStats();
  const [caseStudy, setCaseStudy] = useState(null);
  const caseProject = projects.find((project) => project.id === caseStudy) || null;

  // ---- Floating row preview (desktop, fine pointer, full motion only).
  // Pattern reference: 21st.dev "Project Showcase" (id 9607) — concept
  // only; everything below is hand-written for our tokens (no Tailwind,
  // no shadcn, no motion library). Position lives in refs and is written
  // straight to the DOM, so mousemove never triggers a React render.
  const previewRef = useRef(null);
  const frameRef = useRef(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const [previewId, setPreviewId] = useState(null); // active row — discrete
  const [canPreview] = useState(
    () =>
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const activePreview = rest.find((project) => project.id === previewId) || null;

  // Lerp loop: runs only while a preview is active.
  function tick() {
    const el = previewRef.current;
    if (!el) return;
    const target = targetRef.current;
    const current = currentRef.current;
    current.x += (target.x - current.x) * 0.14;
    current.y += (target.y - current.y) * 0.14;
    // Clamp inside the viewport so the card never causes overflow.
    const x = Math.min(
      Math.max(current.x, 12),
      window.innerWidth - PREVIEW_W - 12,
    );
    const y = Math.min(
      Math.max(current.y, 12),
      window.innerHeight - PREVIEW_H - 12,
    );
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    frameRef.current = requestAnimationFrame(tick);
  }

  function startPreview(id, clientX, clientY) {
    if (!canPreview) return;
    // Snap to the cursor on entry so the card never flies across the screen.
    targetRef.current = { x: clientX + 28, y: clientY - PREVIEW_H / 2 };
    currentRef.current = { ...targetRef.current };
    setPreviewId(id);
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(tick);
  }

  function movePreview(event) {
    if (previewId === null) return;
    targetRef.current = {
      x: event.clientX + 28,
      y: event.clientY - PREVIEW_H / 2,
    };
  }

  function stopPreview() {
    cancelAnimationFrame(frameRef.current);
    setPreviewId(null);
  }

  // Reveal once when the section enters the viewport (same as every section).
  useSectionReveal(sectionRef, { threshold: 0.1 });

  // Cancel any queued preview frame on unmount.
  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="section work"
      aria-label="Selected work"
    >
      <div className="container">
        <p className="section-label reveal-item">{LABEL}</p>
        <h2 className="section-title work-statement reveal-item">
          {STATEMENT}{' '}
          <span className="title-accent">{STATEMENT_ACCENT}</span>
        </h2>

        {/* Featured project */}
        <article className="work-feature reveal-item" aria-label={featured.title}>
          <div className="work-feature-media">
            {featured.gallery && featured.gallery.length > 1 ? (
              <ProjectSlideshow project={featured} total={projects.length} />
            ) : (
              <a href={featured.link} aria-label={`View ${featured.title}`}>
                <ProjectVisual project={featured} total={projects.length} />
              </a>
            )}
          </div>
          <div className="work-feature-body">
            <p className="work-num">Project {featured.number}</p>
            <h3 className="work-title">
              <a href={featured.link}>{featured.title}</a>
            </h3>
            <p className="work-desc">{featured.description}</p>
            <ProjectHighlights highlights={featured.highlights} />
            <ProjectMeta project={featured} />
            <RepoLive project={featured} stats={github} />
            <ProjectLinks project={featured} />
            <button
              type="button"
              className="link-arrow case-trigger"
              onClick={() => setCaseStudy(featured.id)}
            >
              View case study <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>

        {/* Index rows — hover drives the floating preview (desktop only) */}
        <ul
          className="work-list"
          onMouseMove={movePreview}
          onMouseLeave={stopPreview}
        >
          {rest.map((project) => (
            <li
              key={project.id}
              className="work-row reveal-item"
              onMouseEnter={(event) =>
                startPreview(project.id, event.clientX, event.clientY)
              }
            >
              <a
                className="work-row-link"
                href={project.link}
                aria-label={`View ${project.title} — ${project.role}, ${project.year}`}
              >
                <span className="work-row-num" aria-hidden="true">
                  {project.number}
                </span>
                <span className="work-row-main">
                  <span className="work-row-title">{project.title}</span>
                  <span className="work-row-desc">{project.description}</span>
                  <span className="work-row-meta">
                    {[project.role, project.tech.join(' / '), project.year]
                      .filter((part) => part && part.trim().length > 0)
                      .join(' · ')}
                    <RowLive project={project} stats={github} />
                  </span>
                </span>
                <span className="work-row-arrow" aria-hidden="true">
                  →
                </span>
              </a>
              {/* Expandable detail: visual + highlights + actions live
                  outside the header link (no nested interactives).
                  Opens on hover/focus; always open on touch. */}
              <div className="work-row-detail">
                <div>
                  <ProjectVisual project={project} total={projects.length} />
                  <div className="work-row-info">
                    <ProjectHighlights highlights={project.highlights} />
                    <div className="work-row-actions">
                    {project.demo && (
                      <a
                        className="btn-primary btn-small"
                        href={project.demo}
                        {...projectTarget(project.demo)}
                      >
                        Live Demo <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {project.repo && (
                      <a
                        className="btn-outline"
                        href={project.repo}
                        {...projectTarget(project.repo)}
                      >
                        Source Code <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    <button
                      type="button"
                      className="link-arrow"
                      onClick={() => setCaseStudy(project.id)}
                      aria-label={`View ${project.title} case study`}
                    >
                      Case study <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="work-more reveal-item">
          <p className="work-more-text">
            More experiments on the way — still building.
          </p>
          <Link className="btn-accent" to={{ pathname: '/', hash: '#contact' }}>
            Have an idea? Start a project <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Floating preview: one fixed card, content swaps per row.
            Decorative (rows carry all info); hidden from assistive tech. */}
        {canPreview && (
          <div
            ref={previewRef}
            className={`work-preview${previewId ? ' is-visible' : ''}`}
            aria-hidden="true"
          >
            {activePreview && (
              <HoverCover key={activePreview.id} project={activePreview} />
            )}
          </div>
        )}

        {caseProject && (
          <Suspense fallback={null}>
            <CaseStudy
              project={caseProject}
              total={projects.length}
              onClose={() => setCaseStudy(null)}
            />
          </Suspense>
        )}
      </div>
    </section>
  );
}

export default Projects;
