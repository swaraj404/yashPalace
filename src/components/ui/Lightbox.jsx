import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSmoothScroll } from '../layout/SmoothScroll';

export default function Lightbox({ items, index, onChange, onClose }) {
  const closeRef = useRef(null);
  const smooth = useSmoothScroll();
  const open = index !== null;
  const item = open ? items[index] : null;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const step = (n) => onChange((i) => (i + n + items.length) % items.length);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    smooth?.stop();
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      smooth?.start();
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, items.length, onChange, onClose, smooth]);

  if (!item) return null;

  const arrow =
    'absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded bg-black/35 text-ivory transition-colors hover:bg-gold-glow hover:text-green-950';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[8000] flex flex-col items-center justify-center bg-green-950/95 p-4 sm:p-8"
    >
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Close photo"
        className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded text-ivory hover:text-gold-glow"
      >
        <X size={28} />
      </button>
      <button
        aria-label="Previous photo"
        onClick={() => onChange((i) => (i - 1 + items.length) % items.length)}
        className={`${arrow} left-3 sm:left-6`}
      >
        <ChevronLeft size={24} />
      </button>
      <img src={item.src} alt={item.alt} className="max-h-[80dvh] max-w-full rounded object-contain" />
      <p className="mt-4 font-serif text-2xl text-ivory">{item.caption}</p>
      <button
        aria-label="Next photo"
        onClick={() => onChange((i) => (i + 1) % items.length)}
        className={`${arrow} right-3 sm:right-6`}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
