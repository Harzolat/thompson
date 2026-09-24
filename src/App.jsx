import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Cursor from './components/Cursor.jsx';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import PulseLab from './components/PulseLab.jsx';
import Projects from './components/Projects.jsx';
import Skills from './components/Skills.jsx';
import Journey from './components/Journey.jsx';
import Creative from './components/Creative.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

// Command palette loads on demand — never part of the initial bundle.
const CommandPalette = lazy(() => import('./components/CommandPalette.jsx'));

// Page shell: nav, sections in story order, footer.
// Thompson → PulseLab → proof of work → capabilities → journey →
// creative experiment → invitation to talk.
// A brand loader covers the first paint (skipped under reduced motion);
// the page is inert until it lifts.

function App() {
  const [loading, setLoading] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // Stable identity so the loader's effect never re-runs mid-count.
  const handleDone = useCallback(() => setLoading(false), []);

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

  // Lock scroll while the loader covers the page.
  useEffect(() => {
    if (!loading) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [loading]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AnimatePresence>
        {loading && <Loader onDone={handleDone} />}
      </AnimatePresence>
      {paletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onClose={closePalette} />
        </Suspense>
      )}
      <div inert={loading || undefined}>
        <Cursor />
        <Navbar onOpenPalette={openPalette} />
        <main id="main">
          <Hero />
          <About />
          <PulseLab />
          <Projects />
          <Skills />
          <Journey />
          <Creative />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
