import { marqueeItems } from '../../data/content';

export default function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className="marquee-mask overflow-hidden bg-green-800 py-4 text-ivory" aria-hidden>
      <div className="flex w-max animate-marquee items-center gap-9 whitespace-nowrap font-serif text-[clamp(1.1rem,2.2vw,1.7rem)] italic">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-9">
            {item}
            <span className="text-[0.8em] not-italic text-gold-glow">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
