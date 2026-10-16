import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { site } from '../data/site.js';
import copyText from '../utils/copyText.js';

// Contact: invitation + a real Formspree-backed form. Submit states are
// honest because the backend confirms them: idle → submitting → success
// (form resets) or error (message shown, draft preserved). The direct
// email link + copy button remain as alternatives.

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
  // Copy feedback is inline on the button (emerald, 2s); the floating
  // toast stays reserved for form-submit confirmations.
  const [copied, setCopied] = useState(false);
  // Formspree submission lifecycle. Success resets the form (the server
  // confirmed receipt); error preserves the draft and explains why.
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const toastTimer = useRef(0);
  const copyTimer = useRef(0);
  const statusTimer = useRef(0);

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
      window.clearTimeout(copyTimer.current);
      window.clearTimeout(statusTimer.current);
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

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xdekyoge', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
        showToast('Message sent ✓ — I’ll get back to you soon.');
        // Re-arm the button shortly after; the sent fields stay cleared.
        window.clearTimeout(statusTimer.current);
        statusTimer.current = window.setTimeout(() => setStatus('idle'), 4000);
      } else {
        const data = await response.json().catch(() => null);
        setStatus('error');
        setErrorMessage(
          data?.errors?.[0]?.message || 'There was an issue sending your message. Please try again.',
        );
      }
    } catch {
      // The request itself failed (network/CORS/DNS) — nothing was
      // delivered, so this stays an error, never a success.
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  }

  async function copyEmail() {
    await copyText(email);
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
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
              onSubmit={handleSubmit}
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
              <button
                className="btn-accent"
                type="submit"
                disabled={status === 'submitting' || status === 'success'}
              >
                {status === 'submitting'
                  ? 'Sending…'
                  : status === 'success'
                    ? 'Message sent ✓'
                    : 'Send message'}{' '}
                <span aria-hidden="true">→</span>
              </button>
              {status === 'error' && (
                <p className="form-error" role="alert">
                  {errorMessage}{' '}
                  <a href={`mailto:${email}`}>Email me directly instead</a>.
                </p>
              )}
              {status !== 'error' && (
                <p className="form-note">
                  Sent directly — or{' '}
                  <a href={`mailto:${email}`}>open your email client</a> instead.
                </p>
              )}
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
                className={`copy-btn${copied ? ' is-copied' : ''}`}
                type="button"
                onClick={copyEmail}
                aria-label={copied ? 'Email address copied' : 'Copy email address'}
              >
                {copied ? (
                  <Check size={16} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Copy size={16} strokeWidth={2} aria-hidden="true" />
                )}
                {copied ? 'Copied! ✓' : 'Copy'}
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
