import { Star } from 'lucide-react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import { testimonials } from '../../data/content';

export default function Testimonials() {
  return (
    <section className="container-x section-pad">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <Eyebrow center className="mb-5">
          What Guests Say
        </Eyebrow>
        <SectionTitle>Loved by every celebration</SectionTitle>
      </Reveal>

      <Reveal stagger={0.1} className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <blockquote
            key={i}
            className="relative overflow-hidden rounded-[18px] border border-cream bg-white p-8"
          >
            <span className="pointer-events-none absolute right-5 top-1 font-serif text-7xl leading-none text-ivory-2">
              “
            </span>
            <div className="mb-4 flex gap-1 text-gold-glow">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="relative z-10 mb-5 font-serif text-lg italic text-green-800">{t.quote}</p>
            <cite className="text-[0.82rem] uppercase not-italic tracking-wider text-ink-soft">
              — {t.author}
            </cite>
          </blockquote>
        ))}
      </Reveal>
    </section>
  );
}
