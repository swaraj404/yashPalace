import { useEffect, useRef, useState } from 'react';
import { stats } from '../../data/content';

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started) return;
          started = true;
          const start = performance.now();
          const dur = 1600;
          const tick = (now) => {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(value * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular font-serif text-[clamp(3rem,6vw,5rem)] font-medium leading-none text-green-800">
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section aria-label="Yash Palace at a glance" className="container-x">
      <div className="grid grid-cols-2 border-y border-cream md:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-2 py-9 md:px-6 md:py-12 ${i > 0 ? 'md:border-l md:border-cream' : ''} ${
              i % 2 ? 'border-l border-cream pl-5' : ''
            } ${i > 1 ? 'border-t border-cream md:border-t-0' : ''}`}
          >
            <Counter value={stat.value} suffix={stat.suffix} />
            <div className="mt-2 text-sm text-ink-soft">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
