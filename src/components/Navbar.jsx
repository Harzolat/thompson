import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  Command,
  FileText,
  Folder,
  Home,
  Layers,
  Mail,
  Moon,
  Orbit,
  Route,
  Sparkles,
  Sun,
  UserRound,
} from 'lucide-react';
import { site } from '../data/site.js';

// Expandable pill navbar (concept reference: 21st.dev "Expandable Tabs").
// Hand-adapted: our tokens, our anchors, Motion instead of framer-motion,
// no usehooks-ts (click-outside is a local ref + effect below).
//
// Two pieces of state, kept separate on purpose:
// - activeId: the actual current section (clicks + scroll-spy). Persists.
// - dismissed: click-outside collapses the visual expansion only.
//   aria-current always reflects the effective section (route-aware),
//   so state is never lost.
const ICONS = {
  home: Home,
  about: UserRound,
  pulselab: Orbit,
  work: Folder,
  capabilities: Layers,
  journey: Route,
  creative: Sparkles,
  contact: Mail,
};

// Tab pairs, matching the compact grouped pill reference.
const GROUPS = [0, 2, 4, 6];

// Anchor tabs live in the pill pairs; the route entry renders as a
// separate highlighted badge after them.
const ANCHORS = site.nav.filter((item) => !item.route);
const ROUTE_TAB = site.nav.find((item) => item.route);

// One expandable tab. Plain anchor semantics (valid href fallback);
// client-side routing is handled through onGo with preventDefault.
function PillTab({ item, isActive, current, onGo, badge }) {
  const Icon = ICONS[item.icon] || Home;
  return (
    <motion.a
      href={item.route ? item.href : `/${item.href}`}
      layout
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className={`pill-tab${isActive ? ' is-active' : ''}${badge ? ' is-route' : ''}`}
      aria-label={item.label}
      aria-current={current ? 'true' : undefined}
      onClick={(event) => {
        event.preventDefault();
        onGo();
      }}
    >
      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.span
            key="label"
            className="pill-label"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {item.label}
            <span className="pill-dot" aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
      {/* micro-tooltip for the icon-only state */}
      <span className="pill-tip" aria-hidden="true">
        {item.label}
      </span>
    </motion.a>
  );
}

function Navbar({ onOpenPalette, ready = true }) {  const [open, setOpen] = useState(false); // mobile menu
  const [activeId, setActiveId] = useState('top');
  const [dismissed, setDismissed] = useState(false);
  const [theme, setTheme] = useState(
    () => (localStorage.getItem('th-portfolio-theme') === 'dark' ? 'dark' : 'light'),
  );
  const barRef = useRef(null);
  // Guards the theme reveal: re-clicking mid-flight skips cleanly
  // instead of stacking two transitions (the classic flicker source).
  const transitioningRef = useRef(false);
  // While a click-initiated smooth scroll is in flight, ignore the
  // scroll-spy so passing sections can't yank the active tab around.
  const navigatingRef = useRef(0);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Scroll-spy: reflect the section in view (home page only — the
  // anchors don't exist on other routes). No scroll listeners.
  useEffect(() => {
    if (pathname !== '/') return undefined;
    const targets = ANCHORS.map((item) => document.getElementById(item.href.slice(1))).filter(
      Boolean,
    );
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < navigatingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            setDismissed(false);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);

  // The route tab highlights from the location, not the scroll-spy —
  // derived during render so no effect (and no extra render) is needed.
  const onPulseLabPage = pathname === '/pulselab';
  const effectiveActive = onPulseLabPage ? 'pulselab' : activeId;

  // Theme toggle with a circular reveal expanding from the button
  // (View Transitions API). Falls back to an instant switch without
  // support or under reduced motion; other triggers use plain setTheme.
  function toggleThemeFromButton(event) {
    const next = theme === 'dark' ? 'light' : 'dark';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof document.startViewTransition !== 'function' || reduceMotion) {
      setTheme(next);
      return;
    }
    // One reveal at a time: a second click lands instantly rather than
    // tearing the running animation.
    if (transitioningRef.current) {
      setTheme(next);
      return;
    }
    transitioningRef.current = true;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    let transition;
    try {
      transition = document.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });
    } catch {
      transitioningRef.current = false;
      setTheme(next);
      return;
    }
    transition.ready
      .then(() => {
        const animation = document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 600,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
        animation.onfinish = () => {
          transitioningRef.current = false;
        };
      })
      .catch(() => {
        transitioningRef.current = false;
      });
  }
  // Theme: reflected on <html>, persisted, theme-color kept in sync.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('th-portfolio-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0d0d0c' : '#fafaf8');
  }, [theme]);

  // The command palette asks for a toggle via event — Navbar remains
  // the single owner of the theme state.
  useEffect(() => {
    function onToggleTheme() {
      setTheme((value) => (value === 'dark' ? 'light' : 'dark'));
    }
    window.addEventListener('th-portfolio:toggle-theme', onToggleTheme);
    return () => window.removeEventListener('th-portfolio:toggle-theme', onToggleTheme);
  }, []);
  // Click-outside collapses the visual expansion, never the state.
  useEffect(() => {
    function onPointerDown(event) {
      if (barRef.current && !barRef.current.contains(event.target)) {
        setDismissed(true);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // Escape closes the mobile menu.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Lock background scroll while the full-screen mobile menu is open.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open ]);

  function goTo(item) {
    setActiveId(item.route ? 'pulselab' : item.href.slice(1));
    setDismissed(false);
    setOpen(false);
    // Mute the scroll-spy until the smooth scroll settles (~1s).
    navigatingRef.current = Date.now() + 1000;
    if (item.route) {
      navigate(item.href);
    } else {
      // ScrollManager performs the actual glide on location change.
      navigate({ pathname: '/', hash: item.href });
    }
  }

  const expandedId = dismissed ? null : effectiveActive;

  return (
    <header className={ready ? 'site-header' : 'site-header pre'}>
      <div className="container navbar">
        <Link
          to={{ pathname: '/', hash: '#top' }}
          className="brand"
          onClick={() => goTo(ANCHORS[0])}
        >
          <img
            className="brand-mark"
            src={site.community.logo}
            alt={site.community.logoAlt}
            width={26}
            height={26}
            fetchpriority="high"
            decoding="async"
          />
          {site.name.toUpperCase()}
        </Link>

        {/* Desktop pill */}
        <nav className="pill-nav" aria-label="Primary" ref={barRef}>
          <MotionConfig reducedMotion="user">
            <div className="pill">
              {GROUPS.map((start, groupIndex) => (
                <div className="pill-group" key={start}>
                  {groupIndex > 0 && (
                    <span className="pill-sep" aria-hidden="true" />
                  )}
                  {ANCHORS.slice(start, start + 2).map((item) => (
                    <PillTab
                      key={item.href}
                      item={item}
                      isActive={expandedId === item.href.slice(1)}
                      current={effectiveActive === item.href.slice(1)}
                      onGo={() => goTo(item)}
                    />
                  ))}
                </div>
              ))}
              {ROUTE_TAB && (
                <>
                  <span className="pill-sep" aria-hidden="true" />
                  <PillTab
                    item={ROUTE_TAB}
                    isActive={expandedId === 'pulselab'}
                    current={effectiveActive === 'pulselab'}
                    onGo={() => goTo(ROUTE_TAB)}
                    badge
                  />
                </>
              )}
            </div>
          </MotionConfig>
        </nav>

        {/* Right cell: palette, resume, theme, mobile menu */}
        <div className="nav-right">
          <button
            className="palette-btn"
            type="button"
            onClick={onOpenPalette}
            aria-label="Open command menu (Control K)"
          >
            <Command size={17} strokeWidth={2} aria-hidden="true" />
            <kbd className="palette-kbd" aria-hidden="true">
              ⌘K
            </kbd>
          </button>
          <a
            className="resume-btn"
            href={site.resume.href}
            download={site.resume.fileName}
            aria-label={`Download ${site.resume.label} (PDF)`}
          >
            <FileText size={16} strokeWidth={2} aria-hidden="true" />
            <span className="resume-label">{site.resume.label}</span>
          </a>
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={theme === 'dark'}
            onClick={toggleThemeFromButton}
          >
            {theme === 'dark' ? (
              <Sun size={18} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Moon size={18} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
          <nav className="mobile-nav" aria-label="Mobile">
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>

          <ul className={`nav-links ${open ? 'is-open' : ''}`}>
            <li>
              <button
                type="button"
                className="mobile-action"
                onClick={() => {
                  setOpen(false);
                  onOpenPalette();
                }}
              >
                <Command size={18} strokeWidth={2} aria-hidden="true" />
                Command menu
              </button>
            </li>
            <li>
              <button
                type="button"
                className="mobile-action"
                onClick={() => {
                  setTheme((value) => (value === 'dark' ? 'light' : 'dark'));
                  setOpen(false);
                }}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun size={18} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Moon size={18} strokeWidth={2} aria-hidden="true" />
                )}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </li>
            <li>
              <a
                href={site.resume.href}
                download={site.resume.fileName}
                className="nav-cta"
                onClick={() => setOpen(false)}
              >
                {site.resume.label} (PDF)
              </a>
            </li>
            {site.nav.map((item) => {
              const id = item.route ? 'pulselab' : item.href.slice(1);
              return (
              <li key={item.href}>
                <a
                  href={item.route ? item.href : `/${item.href}`}
                  className={item.label === 'Contact' ? 'nav-cta' : ''}
                  aria-current={effectiveActive === id ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(item);
                  }}
                >
                  {item.label}
                </a>
              </li>
              );
            })}
          </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
