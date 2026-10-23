import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Cursor from './components/Cursor.jsx';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import PulseLabPage from './pages/PulseLabPage.jsx';

// Command palette loads on demand — never part of the initial bundle.
const CommandPalette = lazy(() => import('./components/CommandPalette.jsx'));

// Central scroll behavior for route changes (react-router doesn't scroll
// on its own): hash links glide to their section, plain route changes
// reset to the top. One place, no per-link scroll code.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => {
        document
          .querySelector(hash)
          ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }, 60);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash, reducedMotion]);

  return null;
}

// Page shell: router, shared chrome (cursor, nav, footer), page routes.
// Home carries the portfolio story; /pulselab carries the community.
// A brand loader covers the first paint (skipped under reduced motion);
// the page is inert until it lifts.

function App() {
  // Loader plays once per session: skipped under reduced motion and on
  // reloads/re-visits once the session flag is set.
  const [loading, setLoading] = useState(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    try {
      return sessionStorage.getItem('th-seen-loader') !== 'true';
    } catch {
      // sessionStorage unavailable — play the loader every visit.
      return true;
    }
  });

  // The curtain has fully lifted (exit animation complete), not just
  // started: scroll and interaction stay locked until then.
  const [revealed, setRevealed] = useState(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    try {
      return sessionStorage.getItem('th-seen-loader') === 'true';
    } catch {
      return false;
    }
  });

  // Stable identity so the loader's effect never re-runs mid-count.
  const handleDone = useCallback(() => {
    try {
      sessionStorage.setItem('th-seen-loader', 'true');
    } catch {
      // Flag not persisted — loader simply replays next visit.
    }
    setLoading(false);
  }, []);

  // Command palette (Cmd/Ctrl+K) — also opened from the navbar button.
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    function onHotkey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    }
    document.addEventListener('keydown', onHotkey);
    return () => document.removeEventListener('keydown', onHotkey);
  }, []);

  // Lock scroll until the curtain has fully lifted (not just started).
  useEffect(() => {
    if (revealed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [revealed]);

  // Fresh loads always start at the top: manual restoration, instant
  // reset, and hash stripped so a reload never resumes mid-page.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  return (
    <BrowserRouter>
      {/* One reduced-motion contract for every Motion animation on the
          site: transforms jump to their end state, opacity still plays.
          (Loader, cursor and the CSS entrances already gate themselves.) */}
      <MotionConfig reducedMotion="user">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AnimatePresence onExitComplete={() => setRevealed(true)}>
          {loading && <Loader onDone={handleDone} />}
        </AnimatePresence>
        {paletteOpen && (
          <Suspense fallback={null}>
            <CommandPalette open={paletteOpen} onClose={closePalette} />
          </Suspense>
        )}
        <div inert={revealed ? undefined : true}>
          <Cursor />
          <Navbar onOpenPalette={openPalette} ready={!loading} />
          <ScrollManager />
          <Routes>
            <Route path="/" element={<Home ready={!loading} />} />
            <Route path="/pulselab" element={<PulseLabPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
