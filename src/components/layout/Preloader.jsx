import { useEffect, useState } from 'react';
import Crest from '../ui/Crest';

export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(interval);
      clearTimeout(safety);
      setProgress(100);
      setTimeout(() => {
        setDone(true);
        onDone?.();
      }, 500);
    };

    // Drive the bar on its own clock so we never block on the (heavy) video load.
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.random() * 22, 100);
        if (next >= 100) finish();
        return next;
      });
    }, 130);

    const safety = setTimeout(finish, 2600);

    return () => {
      clearInterval(interval);
      clearTimeout(safety);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-green-900 transition-opacity duration-700 ease-soft ${
        done ? 'pointer-events-none invisible opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center text-ivory">
        <Crest className="mx-auto mb-4 h-24 w-24 animate-crest-pulse border border-gold-glow/40 !bg-none text-5xl !text-gold-glow" />
        <div className="font-serif text-base tracking-[0.35em] opacity-85">YASH&nbsp;PALACE</div>
        <div className="mx-auto mt-6 h-0.5 w-44 overflow-hidden rounded bg-white/15">
          <span
            className="block h-full bg-gradient-to-r from-gold to-gold-glow transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
