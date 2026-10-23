import { useEffect } from 'react';

// One shared viewport reveal for every section on the site (previously
// copy-pasted into seven components).
//
// - `.is-visible` is added the first time the section enters view and
//   never removed: each entrance plays exactly once, so scrolling back
//   and forth never replays it.
// - `.is-settled` lands 1400ms after entry — past the longest stagger
//   window — clearing the entrance transition-delays so hover and
//   focus stay instant afterwards.
// - `trackInView` keeps observing and toggles `.is-inview` (calling
//   `onInView`) for sections whose idle loops run only while visible:
//   Creative's turntable and PulseLab's traveling pulses.
// - Without IntersectionObserver everything shows immediately, so
//   content can never be stranded behind a reveal that never fires.

const SETTLE_MS = 1400;

export default function useSectionReveal(ref, options = {}) {
  const { threshold = 0.2, trackInView = false, onInView } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      if (trackInView) {
        el.classList.add('is-inview');
        onInView?.(true);
      }
      return undefined;
    }

    let settled = false;
    let settleTimer = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        if (trackInView) {
          el.classList.toggle('is-inview', visible);
          onInView?.(visible);
        }
        if (!visible) return;
        el.classList.add('is-visible');
        if (!settled) {
          settled = true;
          settleTimer = window.setTimeout(
            () => el.classList.add('is-settled'),
            SETTLE_MS,
          );
        }
        if (!trackInView) observer.disconnect();
      },
      { threshold },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(settleTimer);
    };
  }, [ref, threshold, trackInView, onInView]);
}
