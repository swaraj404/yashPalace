import { useState } from 'react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import { occasions } from '../../data/content';

export default function Occasions() {
  const [active, setActive] = useState(0);

  return (
    <section id="occasions" className="bg-green-900 text-ivory">
      <div className="container-x section-pad grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden arch lg:col-span-5 lg:max-w-none">
          {occasions.map((o, i) => (
            <img
              key={o.title}
              src={o.image}
              alt={i === active ? o.alt : ''}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-soft ${
                i === active ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal stagger={0.1} className="mb-8">
            <Eyebrow light className="mb-5">Occasions</Eyebrow>
            <SectionTitle light>Made for every kind of celebration</SectionTitle>
          </Reveal>

          <Reveal stagger={0.08} as="ul">
            {occasions.map((item, i) => (
              <li key={item.title} className="border-b border-white/15">
                <button
                  type="button"
                  aria-pressed={i === active}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="w-full py-5 text-left"
                >
                  <span
                    className={`block font-serif text-[clamp(1.7rem,3vw,2.5rem)] font-medium leading-tight transition-colors duration-300 ${
                      i === active ? 'text-gold-glow' : 'text-ivory'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span
                    className={`grid transition-[grid-template-rows] duration-500 ease-soft ${
                      i === active ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <span className="overflow-hidden">
                      <span className="block max-w-[50ch] pt-2 text-ivory/75">{item.text}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
