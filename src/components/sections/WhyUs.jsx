import { Home, UtensilsCrossed, Flower2, Crown, CarFront, MapPin } from 'lucide-react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import { features } from '../../data/content';

const icons = { Home, UtensilsCrossed, Flower2, Crown, CarFront, MapPin };

export default function WhyUs() {
  return (
    <section id="why" className="container-x section-pad grid gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <Reveal stagger={0.1}>
            <Eyebrow className="mb-5">Why Yash Palace</Eyebrow>
            <SectionTitle className="mb-8">Everything your celebration needs</SectionTitle>
            <img
              src="/images/venue/stage-sofas-portrait.jpg"
              alt="Carved white stage sofas beside fresh rose columns"
              loading="lazy"
              className="arch hidden aspect-[5/6] w-full max-w-sm object-cover lg:block"
            />
          </Reveal>
        </div>
      </div>

      <Reveal stagger={0.07} as="ul" className="lg:col-span-6 lg:col-start-7">
        {features.map((f) => {
          const Icon = icons[f.icon];
          return (
            <li
              key={f.title}
              className="feature-card group grid grid-cols-[44px_1fr] gap-x-5 border-b border-cream py-7 first:pt-0"
            >
              <span className="mt-1 text-gold transition-transform duration-300 ease-soft group-hover:-translate-y-0.5">
                {Icon && <Icon size={30} strokeWidth={1.35} />}
              </span>
              <div>
                <h3 className="mb-1.5 font-serif text-[1.85rem] font-semibold leading-tight text-green-800">
                  {f.title}
                </h3>
                <p className="max-w-[52ch] text-ink-soft">{f.text}</p>
              </div>
            </li>
          );
        })}
      </Reveal>
    </section>
  );
}
