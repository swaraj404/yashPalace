import { useLayoutEffect, useRef } from 'react';

const EASE = 'cubic-bezier(0.22,1,0.36,1)';

/**
 * One-shot scroll reveal using IntersectionObserver (robust to programmatic
 * scrolling and layout shifts from pinned sections). Pass `stagger` (seconds)
 * to reveal direct children one after another.
 */
export default function Reveal({
  as: Tag = 'div',
  children,
  className = '',
  delay = 0,
  y = 34,
  stagger = 0,
  ...props
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = stagger ? Array.from(el.children) : [el];

    const show = (t) => {
      t.style.opacity = '1';
      t.style.transform = 'none';
    };

    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(show);
      return undefined;
    }

    targets.forEach((t) => {
      t.style.opacity = '0';
      t.style.transform = `translateY(${y}px)`;
      t.style.transition = `opacity .9s ${EASE}, transform .9s ${EASE}`;
      t.style.willChange = 'opacity, transform';
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          targets.forEach((t, i) => {
            t.style.transitionDelay = `${delay + i * stagger}s`;
            show(t);
          });
          io.disconnect();
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);

    return () => io.disconnect();
  }, [delay, y, stagger]);

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
