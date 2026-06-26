import { Home, UtensilsCrossed, Flower2, Crown, CarFront, MapPin } from 'lucide-react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import { features } from '../../data/content';

const icons = { Home, UtensilsCrossed, Flower2, Crown, CarFront, MapPin };

export default function WhyUs() {
  return (
    <section id="why" className="container-x section-pad">
      <Reveal className="mb-12 max-w-2xl">
        <Eyebrow className="mb-5">Why Yash Palace</Eyebrow>
        <SectionTitle>Everything your celebration deserves</SectionTitle>
      </Reveal>

      <Reveal stagger={0.1} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = icons[f.icon];
          return (
            <article
              key={f.title}
              className="feature-card group rounded-[18px] border border-cream bg-white p-8 transition-all duration-500 ease-soft hover:-translate-y-2 hover:border-lime-soft hover:shadow-[0_28px_50px_-28px_rgba(63,82,38,0.5)]"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-cream bg-gradient-to-br from-ivory-2 to-white text-green-800 transition-colors group-hover:text-gold">
                {Icon && <Icon size={26} strokeWidth={1.5} />}
              </div>
              <h3 className="mb-2 font-serif text-xl font-semibold text-green-800">{f.title}</h3>
              <p className="text-[0.92rem] text-ink-soft">{f.text}</p>
            </article>
          );
        })}
      </Reveal>
    </section>
  );
}
