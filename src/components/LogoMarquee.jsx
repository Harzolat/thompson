import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect, useReducedMotion } from 'motion/react';
import {
  BrainCircuit,
  Code2,
  MousePointerClick,
  PenTool,
  Workflow,
} from 'lucide-react';

// Logo Marquee (21st.dev @ddoemonn, ported from TSX/Tailwind to plain
// JSX + plain CSS to match this project: no TypeScript, no Tailwind).
// An infinite strip of brand marks with physics-based easing: it ramps
// up and settles, pauses while hovered or focused, stops entirely when
// off-screen or under prefers-reduced-motion (where it becomes a static
// horizontally-scrollable row). Offset is painted straight to the DOM
// with translate3d, so animation frames cause no React re-renders.
//
// Items: { id, label, icon?, src?, href? } — icon keys map to lucide
// glyphs, src points at an svg logo; the label always renders as text,
// and href turns the item into an external link.

const RAMP = 0.19;
const SETTLE = 0.16;
const MAX_COPIES = 14;

// Environments without IntersectionObserver (and SSR) never pause the
// strip: start it in the "near" state instead of setting it in an effect.
const HAS_IO = typeof IntersectionObserver !== 'undefined';

function fold(x, loop) {
  const m = x % loop;
  return m > 0 ? m - loop : m;
}

function clamp(x, min, max) {
  return x < min ? min : x > max ? max : x;
}

// Icon keys used by site data — the same lucide set the Skills tiles
// use, so marks share one visual language.
const ICONS = {
  ai: BrainCircuit,
  automation: Workflow,
  code: Code2,
  pen: PenTool,
  interactive: MousePointerClick,
};

// A missing logo file hides itself instead of showing a broken image.
function hideBrokenMark(event) {
  event.currentTarget.style.display = 'none';
}

// Every item renders mark + visible label: an svg logo when `src` is
// set, a lucide icon when `icon` is set, then the label as text (which
// also gives links their accessible name).
function face(item) {
  const Icon = item.icon ? ICONS[item.icon] : null;
  return (
    <>
      {item.src ? (
        <img
          className="lm-mark"
          src={item.src}
          alt=""
          onError={hideBrokenMark}
        />
      ) : Icon ? (
        <span className="lm-icon" aria-hidden="true">
          <Icon size={19} />
        </span>
      ) : null}
      <span className="lm-text">{item.label}</span>
    </>
  );
}

function useLogoMarquee({
  speed = 44,
  direction = 'left',
  gap = 48,
} = {}) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const groupRef = useRef(null);

  const [copies, setCopies] = useState(4);
  const [held, setHeld] = useState(false);
  const [near, setNear] = useState(!HAS_IO);

  const reduced = useReducedMotion() === true;
  const stopped = held;

  const reducedRef = useRef(reduced);
  const movingRef = useRef(false);

  // Keep the hot-path refs in sync after commit; the rAF loop reads them.
  useEffect(() => {
    reducedRef.current = reduced;
    movingRef.current = !stopped && !reduced;
  }, [reduced, stopped]);

  const offset = useRef(0);
  const nudge = useRef(0);
  const rate = useRef(0);
  const span = useRef(0);

  const paint = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const x = reducedRef.current ? 0 : offset.current - span.current;
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
  }, []);

  useIsomorphicLayoutEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) return;

    // Measure one group; ResizeObserver re-measures when a logo image
    // finishes loading or the viewport resizes.
    const measure = () => {
      const width = group.getBoundingClientRect().width;
      const loop = width > 0 ? width + gap : 0;
      const room = viewport.getBoundingClientRect().width;
      span.current = loop;
      offset.current = loop > 0 ? clamp(offset.current, -loop, loop) : 0;
      paint();

      const next =
        reduced || loop <= 0
          ? 4
          : clamp(Math.ceil(room / loop) + 3, 4, MAX_COPIES);
      setCopies((prev) => (prev === next ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(group);
    return () => observer.disconnect();
  }, [gap, paint, reduced]);

  // Run the rAF loop only while the strip is near the viewport.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !HAS_IO) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) setNear(entry.isIntersecting);
      },
      { rootMargin: '96px' },
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !near) return;

    let frame = 0;
    let last = 0;
    const sign = direction === 'right' ? 1 : -1;

    const tick = (now) => {
      frame = requestAnimationFrame(tick);

      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      const loop = span.current;
      if (loop <= 0) return;

      // Rate eases toward its target so pause/resume feels physical.
      rate.current +=
        ((movingRef.current ? 1 : 0) - rate.current) *
        (1 - Math.exp(-dt / RAMP));

      const pull = nudge.current * (1 - Math.exp(-dt / SETTLE));
      nudge.current -= pull;

      let x = offset.current + sign * speed * rate.current * dt + pull;
      if (rate.current > 0.002 && Math.abs(nudge.current) < 0.25) {
        nudge.current = 0;
        x = fold(x, loop);
      } else {
        x = clamp(x, -loop, loop);
      }

      offset.current = x;
      paint();
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, near, speed, direction, paint]);

  // Keep the strip from being scrolled out of alignment by touch/trackpad.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const pin = () => {
      if (reducedRef.current) return;
      if (viewport.scrollLeft !== 0) viewport.scrollLeft = 0;
      if (viewport.scrollTop !== 0) viewport.scrollTop = 0;
    };

    viewport.addEventListener('scroll', pin, { passive: true });
    return () => viewport.removeEventListener('scroll', pin);
  }, []);

  // A window blur while hovering would otherwise leave it paused forever.
  useEffect(() => {
    const release = () => setHeld(false);
    window.addEventListener('blur', release);
    return () => window.removeEventListener('blur', release);
  }, []);

  // When a link receives focus, nudge it out from under the edge fades.
  const reveal = useCallback((node) => {
    const viewport = viewportRef.current;
    const loop = span.current;
    if (!viewport || reducedRef.current || loop <= 0) return;
    if (node === viewport) return;

    const view = viewport.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    const pad = 12;

    let delta = 0;
    if (box.left < view.left + pad) delta = view.left + pad - box.left;
    else if (box.right > view.right - pad) delta = view.right - pad - box.right;
    if (delta === 0) return;

    const target = clamp(offset.current + nudge.current + delta, -loop, loop);
    nudge.current = target - offset.current;
  }, []);

  const bind = {
    onPointerEnter: (e) => {
      if (e.pointerType !== 'touch') setHeld(true);
    },
    onPointerDown: () => setHeld(true),
    onPointerUp: (e) => {
      if (e.pointerType === 'touch') setHeld(false);
    },
    onPointerCancel: () => setHeld(false),
    onPointerLeave: () => setHeld(false),
    onFocus: (e) => {
      setHeld(true);
      reveal(e.target);
    },
    onBlur: () => setHeld(false),
  };

  return { viewportRef, trackRef, groupRef, copies, reduced, bind };
}

export function LogoMarquee({
  items,
  label = 'Logos',
  speed = 44,
  direction = 'left',
  gap = 48,
  className = '',
}) {
  const { viewportRef, trackRef, groupRef, copies, reduced, bind } =
    useLogoMarquee({ speed, direction, gap });

  const groups = reduced ? 1 : copies;
  const live = reduced ? 0 : 1;

  return (
    <section
      aria-label={label}
      className={className ? `logo-marquee ${className}` : 'logo-marquee'}
      {...bind}
    >
      <div
        ref={viewportRef}
        tabIndex={reduced ? 0 : undefined}
        style={{ overflowX: reduced ? 'auto' : 'hidden' }}
        className="lm-viewport"
      >
        <div
          ref={trackRef}
          style={{ gap, willChange: 'transform' }}
          className="lm-track"
        >
          {Array.from({ length: groups }, (_, copy) => (
            <ul
              key={copy}
              ref={copy === live ? groupRef : undefined}
              aria-hidden={copy === live ? undefined : true}
              style={{ gap }}
              className="lm-group"
            >
              {items.map((item) => (
                <li key={item.id} className="lm-item">
                  {/* Decorative repeats must not be focusable, so only the
                      live group renders real links. */}
                  {copy !== live ? (
                    <span className="lm-face">{face(item)}</span>
                  ) : item.href ? (
                    <a
                      className="lm-face lm-hit"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {face(item)}
                    </a>
                  ) : (
                    <span className="lm-face">{face(item)}</span>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="lm-fade lm-fade-l" />
      <div aria-hidden="true" className="lm-fade lm-fade-r" />
    </section>
  );
}

export default LogoMarquee;
