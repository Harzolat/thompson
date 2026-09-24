import { useEffect, useRef, useState } from 'react';
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
//   aria-current always reflects activeId, so state is never lost.
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

function Navbar({ onOpenPalette }) {
  const [open, setOpen] = useState(false); // mobile menu
  const [activeId, setActiveId] = useState('top');
  const [dismissed, setDismissed] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [theme, setTheme] = useState(
    () => (localStorage.getItem('th-portfolio-theme') === 'dark' ? 'dark' : 'light'),
  );
  const barRef = useRef(null);
  // While a click-initiated smooth scroll is in flight, ignore the
  // scroll-spy so passing sections can't yank the active tab around.
  const navigatingRef = useRef(0);

  // Scroll-spy: reflect the section in view. No scroll listeners.
  useEffect(() => {
    const targets = site.nav
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter(Boolean);
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
  }, []);

  // Brand visibility: vanish once the user starts leaving the hero for
  // the next section — either the hero is fully past, or About has
  // started entering while the hero is still on screen.
  useEffect(() => {
    const hero = document.getElementById('top');
    const about = document.getElementById('about');
    if (!hero || typeof IntersectionObserver === 'undefined') return;
    let heroVisible = true;
    let aboutVisible = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === 'top') heroVisible = entry.isIntersecting;
          else aboutVisible = entry.isIntersecting;
        });
        setPastHero(!heroVisible || aboutVisible);
      },
      { threshold: 0 },
    );
    observer.observe(hero);
    if (about) observer.observe(about);
    return () => observer.disconnect();
  }, []);
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
    setActiveId(item.href.slice(1));
    setDismissed(false);
    setOpen(false);
    // Mute the scroll-spy until the smooth scroll settles (~1s).
    navigatingRef.current = Date.now() + 1000;
  }

  const expandedId = dismissed ? null : activeId;

  return (
    <header className="site-header">
      <div className="container navbar">
        <a
          href="#top"
          className={`brand${pastHero ? ' is-hidden' : ''}`}
          aria-hidden={pastHero || undefined}
          tabIndex={pastHero ? -1 : undefined}
          onClick={() => goTo(site.nav[0])}
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
        </a>

        {/* Desktop pill */}
        <nav className="pill-nav" aria-label="Primary" ref={barRef}>
          <MotionConfig reducedMotion="user">
            <div className="pill">
              {GROUPS.map((start, groupIndex) => (
                <div className="pill-group" key={start}>
                  {groupIndex > 0 && (
                    <span className="pill-sep" aria-hidden="true" />
                  )}
                  {site.nav.slice(start, start + 2).map((item) => {
                    const id = item.href.slice(1);
                    const isActive = expandedId === id;
                    const Icon = ICONS[item.icon] || Home;
                    return (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        layout
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        className={`pill-tab${isActive ? ' is-active' : ''}`}
                        aria-label={item.label}
                        aria-current={activeId === id ? 'true' : undefined}
                        onClick={() => goTo(item)}
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
                  })}
                </div>
              ))}
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
            onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
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
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={item.label === 'Contact' ? 'nav-cta' : ''}
                  aria-current={activeId === item.href.slice(1) ? 'true' : undefined}
                  onClick={() => goTo(item)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          </nav>
        </div>
      </div>

      {/* Standing wordmark: sticks to the left viewport edge once the
          horizontal brand has vanished past the hero. Decorative — the
          brand link above remains the accessible name. */}
      <span className={`brand-rail${pastHero ? ' is-on' : ''}`} aria-hidden="true">
        {site.name.toUpperCase()}
      </span>
    </header>
  );
}

export default Navbar;
