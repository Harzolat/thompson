import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

// Custom cursor (concept reference: 21st.dev "Custom Cursor" — spring
// follower that morphs into a larger ring over interactive targets).
// Hand-built with our Motion dependency: the dot tracks the pointer
// instantly, the follower trails on springs, and hovering morphs it.
// MotionValues drive everything, so mousemove causes zero React
// re-renders (only discrete hover/visibility flips use state).
// Desktop fine-pointer only: null on touch / reduced motion.

const HOVER_SELECTOR = 'a, button, [data-cursor]';

function Cursor() {
  const [enabled] = useState(
    () =>
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 32 });
  const ringY = useSpring(y, { stiffness: 300, damping: 32 });

  useEffect(() => {
    if (!enabled) return;

    // Native cursor hides only while the custom one is mounted.
    document.body.classList.add('has-custom-cursor');

    function onMove(event) {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    }

    // Morph the follower over anything interactive (delegated).
    // relatedTarget is checked so moving between children of one
    // button (icon, label) never flickers the state.
    function onOver(event) {
      if (event.target.closest?.(HOVER_SELECTOR)) setHovering(true);
    }

    function onOut(event) {
      if (event.relatedTarget?.closest?.(HOVER_SELECTOR)) return;
      setHovering(false);
    }

    function onLeave() {
      setVisible(false);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.span
        className="cursor-dot"
        aria-hidden="true"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      />
      <motion.span
        className="cursor-ring"
        aria-hidden="true"
        style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0 }}
        animate={{
          scale: hovering ? 1.6 : 1,
          borderColor: hovering ? '#2447F5' : '#0a0a0a',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      />
    </>
  );
}

export default Cursor;
