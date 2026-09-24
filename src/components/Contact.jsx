import { useEffect, useRef, useState } from 'react';
import { Copy } from 'lucide-react';
import { site } from '../data/site.js';
import copyText from '../utils/copyText.js';

// Contact: invitation + honest tools. The form has no backend, so it
// composes a real email instead of pretending to send one: submit opens
// the visitor's email client with everything prefilled, and the note
// below the button says exactly that. No fake success states.

const PROJECT_TYPES = [
  'Web Development',
  'Creative Engineering',
  'Full-time Role',
  'Something else',
];

function Contact() {
  const sectionRef = useRef(null);
  const { contact, email, socials } = site;
  // Toast: { id, message, leaving } — fixed floating note, no layout shift.
  const [toast, setToast] = useState(null);
  // Form status: idle → opening → idle. There is deliberately no "sent"
  // state and no form reset: mailto can't confirm delivery, and clearing
  // the fields would destroy the visitor's draft.
  const [sending, setSending] = useState(false);
  const toastTimer = useRef(0);

  // Reveal once when the section enters the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add('is-visible');
          // Clear entrance delays so hover stays instant afterwards.
          window.setTimeout(() => el.classList.add('is-settled'), 1400);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message) {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, leaving: false });
    toastTimer.current = window.setTimeout(() => {
      setToast((current) => (current ? { ...current, leaving: true } : current));
      toastTimer.current = window.setTimeout(() => setToast(null), 350);
    }, 2200);
  }

  function sendViaEmail(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const from = String(data.get('email') || '').trim();
    const type = String(data.get('type') || PROJECT_TYPES[0]);
    const message = String(data.get('message') || '').trim();
    const subject = `Portfolio inquiry — ${type} — ${name}`;
    const body = `${message}\n\n— ${name} (${from})`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // Truthful feedback only: the client was triggered, not confirmed.
    setSending(true);
    showToast('Opening your email client with prefilled details…');
    window.setTimeout(() => setSending(false), 2500);
  }

  async function copyEmail() {
    await copyText(email);
    showToast('Email copied to clipboard ✓');
  }

  // Brand accent per network — dots only, rows stay monochrome.
  function brandClass(label) {
    if (label.includes('LinkedIn')) return 'brand-li';
    if (label.startsWith('X')) return 'brand-x';
    return 'brand-gh';
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section contact"
      aria-label="Contact"
    >
      <div className="container">
        <p className="section-label reveal-item">{contact.label}</p>

        <div className="contact-grid">
          {/* Main — headline, intro, form, direct email, socials */}
          <div className="contact-main">
            <h2 className="contact-statement reveal-item">{contact.statement}</h2>
            <p className="contact-intro reveal-item">{contact.intro}</p>

            <form
              className="contact-form reveal-item"
              onSubmit={sendViaEmail}
              aria-label="Contact form"
            >
              <div className="form-row">
                <label>
                  Your name
                  <input name="name" type="text" autoComplete="name" required />
                </label>
                <label>
                  Email
                  <input name="email" type="email" autoComplete="email" required />
                </label>
              </div>
              <label>
                Project type
                <select name="type" defaultValue={PROJECT_TYPES[0]}>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Message
                <textarea name="message" rows={4} required />
              </label>
              <button className="btn-accent" type="submit" disabled={sending}>
                {sending ? 'Opening…' : 'Send via email'}{' '}
                <span aria-hidden="true">→</span>
              </button>
              <p className="form-note">
                Opens your email client with everything prefilled — nothing is
                stored or sent automatically.
              </p>
            </form>

            <div className="contact-direct reveal-item">
              <a
                className="contact-cta"
                href={`mailto:${email}`}
                aria-label={`Start a conversation by email at ${email} — opens your email client`}
              >
                <span className="contact-cta-label">{contact.ctaLabel}</span>
                <span className="contact-cta-email">
                  {email}
                  <span className="contact-cta-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </a>
              <button
                className="copy-btn"
                type="button"
                onClick={copyEmail}
                aria-label="Copy email address"
              >
                <Copy size={16} strokeWidth={2} aria-hidden="true" />
                Copy
              </button>
            </div>

            <ul className="contact-socials reveal-item" aria-label="Social links">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    className={brandClass(social.label)}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${social.label} (opens in a new tab)`}
                  >
                    <span className="social-dot" aria-hidden="true" />
                    {social.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Side — availability index (informational, not interactive) */}
          <aside className="contact-side reveal-item" aria-label={contact.availabilityLabel}>
            <p className="contact-side-label">{contact.availabilityLabel}</p>
            <ol className="contact-open">
              {contact.availability.map((item, i) => (
                <li key={item}>
                  <span className="contact-open-num" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>

      {/* Floating feedback toast — fixed, announced, no layout shift */}
      {toast && (
        <p
          key={toast.id}
          role="status"
          className={`toast${toast.leaving ? ' is-leaving' : ''}`}
        >
          {toast.message}
        </p>
      )}
    </section>
  );
}

export default Contact;
