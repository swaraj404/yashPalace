import { useEffect, useRef, useState } from 'react';

export default function CursorGlow() {
  const ref = useRef(null);
  // Resolve capability synchronously so the element is present on the first
  // render — otherwise the effect below captures a null ref and crashes.
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );

  useEffect(() => {
    if (!enabled) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    let gx = 0,
      gy = 0,
      cx = 0,
      cy = 0,
      active = false,
      raf;

    const onMove = (e) => {
      gx = e.clientX;
      gy = e.clientY;
      if (!active) {
        active = true;
        el.style.opacity = '1';
      }
    };
    const onOver = (e) => {
      const interactive = e.target?.closest?.('a, button, .gallery-item, .feature-card');
      el.dataset.hover = interactive ? 'true' : 'false';
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);

    const loop = () => {
      cx += (gx - cx) * 0.18;
      cy += (gy - cy) * 0.18;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      data-hover="false"
      className="pointer-events-none fixed left-0 top-0 z-[6000] h-7 w-7 rounded-full border border-gold/70 opacity-0 mix-blend-multiply transition-[width,height,background,opacity] duration-300 ease-soft data-[hover=true]:h-14 data-[hover=true]:w-14 data-[hover=true]:bg-gold-glow/10"
    />
  );
}
