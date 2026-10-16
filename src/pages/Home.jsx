import { useEffect } from 'react';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Projects from '../components/Projects.jsx';
import PulseLabCta from '../components/PulseLabCta.jsx';
import Skills from '../components/Skills.jsx';
import Journey from '../components/Journey.jsx';
import Creative from '../components/Creative.jsx';
import Contact from '../components/Contact.jsx';

const TITLE = 'Thompson Harzolat — Developer, Creator & Founder of PulseLab';

// Home: the personal portfolio. PulseLab lives on its own route,
// bridged by the CTA card after the Work section.
function Home({ ready = true }) {
  useEffect(() => {
    document.title = TITLE;
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', TITLE);
  }, []);

  return (
    <main id="main">
      <Hero ready={ready} />
      <About />
      <Projects />
      <PulseLabCta />
      <Skills />
      <Journey />
      <Creative />
      <Contact />
    </main>
  );
}

export default Home;
