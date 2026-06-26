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
    <span ref={ref} className="font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-gold-glow">
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="bg-green-800 px-6 py-14 text-ivory sm:px-10 md:py-20 lg:px-24">
      <div className="mx-auto grid max-w-container grid-cols-2 gap-x-4 gap-y-10 text-center md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative px-2 md:after:absolute md:after:right-0 md:after:top-1/2 md:after:h-14 md:after:w-px md:after:-translate-y-1/2 md:after:bg-white/10 md:last:after:hidden"
          >
            <Counter value={stat.value} suffix={stat.suffix} />
            <div className="mt-2 text-[0.78rem] uppercase tracking-[0.14em] opacity-80">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
