import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PulseLab from '../components/PulseLab.jsx';

const TITLE = 'PulseLab — Developer Sandbox by Thompson Harzolat';

// Dedicated PulseLab route: the full community section on its own page.
function PulseLabPage() {
  useEffect(() => {
    document.title = TITLE;
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', TITLE);
  }, []);

  return (
    <main id="main">
      <div className="container">
        <Link className="link-arrow back-link" to="/">
          <span aria-hidden="true">←</span> Back to Portfolio
        </Link>
      </div>
      <PulseLab />
    </main>
  );
}

export default PulseLabPage;
