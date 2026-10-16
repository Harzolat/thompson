import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowUp, Check, Copy, Mail } from 'lucide-react';
import { site } from '../data/site.js';
import copyText from '../utils/copyText.js';

// Cinematic footer (concept reference: 21st.dev "Motion Footer").
// Hand-ported: our tokens, Motion scroll values instead of GSAP
// ScrollTrigger, magnetic pills via rAF + refs (same pattern as the
// Hero CTA), restrained static glow instead of animated aurora.
// Layers: tilted marquee → giant headline → magnetic pills → social
// pills → ghost wordmark → bottom bar with back-to-top.

// Small magnetic wrapper: pulls toward the cursor, eases back on leave.
// Renders a router Link for `to`, a plain anchor for `href`.
function Magnetic({ href, to, onClick, className, label, children, type }) {
  const ref = useRef(null);
  const frameRef = useRef(0);
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function pull(event) {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.3;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
  }

  function release() {
    const el = ref.current;
    if (!el || reducedMotion) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      el.style.transform = 'translate3d(0px, 0px, 0)';
    });
  }

  if (to) {
    return (
      <Link
        ref={ref}
        to={to}
        className={className}
        aria-label={label || undefined}
        onMouseMove={pull}
        onMouseLeave={release}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    const external = href.startsWith('http');
    return (
      <a
        ref={ref}
        href={href}
        className={className}
        aria-label={label || undefined}
        {...(external
          ? { target: '_blank', rel: 'noreferrer' }
          : {})}
        onMouseMove={pull}
        onMouseLeave={release}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type || 'button'}
      className={className}
      aria-label={label || undefined}
      onClick={onClick}
      onMouseMove={pull}
      onMouseLeave={release}
    >
      {children}
    </button>
  );
}

// Small copy-email pill: inline emerald feedback, no toast needed here.
function CopyEmailButton({ copied, onCopy, label }) {
  return (
    <button
      type="button"
      className={`cine-pill cine-copy${copied ? ' is-copied' : ''}`}
      onClick={onCopy}
      aria-label={copied ? 'Email address copied' : label}
    >
      {copied ? (
        <Check size={18} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Copy size={18} strokeWidth={2} aria-hidden="true" />
      )}
      {copied ? 'Copied! ✓' : 'Copy email'}
    </button>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const footRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { footer, socials, email } = site;
  // Footer copy feedback mirrors the contact button: inline, emerald, 2s.
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  async function copyFooterEmail() {
    await copyText(email);
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  }
  // Floating shortcut appears once the hero is scrolled past.
  const [pastTop, setPastTop] = useState(false);

  // Cinematic reveal: ghost wordmark + content rise as the footer
  // scrolls into view. MotionValue-driven, no scroll listeners.
  const { scrollYProgress } = useScroll({
    target: footRef,
    offset: ['start end', 'end end'],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], ['12vh', '0vh']);
  const ghostScale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [56, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const live = (value) => (reduceMotion ? undefined : value);

  // Pause the marquee loop while the footer is off-screen.
  useEffect(() => {
    const el = footRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => el.classList.toggle('is-inview', entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }

  // Reveal the floating shortcut once Section 02 is fully scrolled past
  // (never on initial load). No scroll listeners — one observer.
  useEffect(() => {
    const lab = document.getElementById('pulselab');
    if (!lab || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastTop(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(lab);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footRef} className="cine-footer" aria-label="Footer">
      {/* faint grid + restrained blue wash */}
      <div className="cine-bg" aria-hidden="true">
        <span className="cine-grid" />
        <span className="cine-wash" />
      </div>

      {/* giant ghost wordmark */}
      <motion.p
        className="cine-giant"
        style={{ y: live(ghostY), scale: live(ghostScale), opacity: live(ghostOpacity) }}
        aria-hidden="true"
      >
        {footer.giant}
      </motion.p>

      {/* tilted marquee */}
      <div className="cine-marquee" aria-hidden="true">
        <div className="cine-track">
          {[0, 1].map((copy) => (
            <div className="cine-items" key={copy}>
              {footer.marquee.map((word) => (
                <span className="cine-item" key={`${copy}-${word}`}>
                  {word}
                  <span className="cine-star">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* center content */}
      <motion.div
        className="container cine-main"
        style={{ y: live(contentY), opacity: live(contentOpacity) }}
      >
        <p className="cine-headline">{footer.headline}</p>

        <div className="cine-primary">
          <Magnetic className="cine-pill cine-pill-lg" href={`mailto:${email}`}>
            <Mail size={20} strokeWidth={1.8} aria-hidden="true" />
            {footer.emailCta}
          </Magnetic>
          <Magnetic className="cine-pill cine-pill-lg" to={site.pulseLab.cta.href}>
            {footer.pulselabCta}
            <span aria-hidden="true">→</span>
          </Magnetic>
          <CopyEmailButton
            copied={copied}
            onCopy={copyFooterEmail}
            label="Copy email address"
          />
        </div>

        <div className="cine-secondary">
          {socials.map((social) => (
            <Magnetic
              key={social.label}
              className="cine-pill cine-pill-sm"
              href={social.href}
              label={`${social.label} (opens in a new tab)`}
            >
              {social.label}
            </Magnetic>
          ))}
        </div>
      </motion.div>

      {/* bottom bar */}
      <div className="container cine-bar">
        <span className="cine-copy">
          <img
            className="foot-mark"
            src={site.community.logo}
            alt=""
            aria-hidden="true"
            width={26}
            height={26}
            loading="lazy"
            decoding="async"
          />
          © {year} {site.name} • {site.community.name}
        </span>
        <span className="cine-badge">
          <span className="status-dot" aria-hidden="true" />
          {footer.badge}
          <span className="brand-dot" aria-hidden="true" />
        </span>
        <Magnetic
          className="cine-top"
          label="Back to top"
          onClick={scrollToTop}
        >
          <ArrowUp size={20} strokeWidth={1.8} aria-hidden="true" />
        </Magnetic>
      </div>

      {/* floating shortcut — same action, available anywhere past the hero */}
      {pastTop && (
        <button
          className="float-top"
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
      )}
    </footer>
  );
}

export default Footer;
