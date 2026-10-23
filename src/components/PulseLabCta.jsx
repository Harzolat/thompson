import { Link } from 'react-router-dom';
import { site } from '../data/site.js';

// Bridge card between the portfolio and the PulseLab route.
// Dark panel, blue corner block, single route action — no glow.
function PulseLabCta() {
  const { community } = site;

  return (
    <section className="section pulse-cta" aria-label="Enter PulseLab">
      <div className="container">
        <div className="pulse-cta-card">
          <p className="section-label">PulseLab</p>
          <h2 className="pulse-cta-title">
            Founder &amp; Creator of{' '}
            <span className="title-accent">PulseLab</span>
          </h2>
          <p className="pulse-cta-sub">
            Explore my interactive developer sandbox, experimental UI
            components, and community workspace.
          </p>
          <Link className="btn-accent" to="/pulselab">
            Enter PulseLab <span aria-hidden="true">→</span>
          </Link>
          <span className="pulse-cta-mark" aria-hidden="true">
            {community.name}
          </span>
        </div>
      </div>
    </section>
  );
}

export default PulseLabCta;
