import { Check } from 'lucide-react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';

const bullets = [
  'Spacious air-conditioned hall',
  'Beautiful curated décor',
  'Praised in-house cuisine',
  'Ample on-site parking',
];

export default function About() {
  return (
    <section id="about" className="container-x section-pad">
      <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <Reveal className="relative pb-14 pr-10 sm:pr-24 lg:col-span-6 lg:pr-20">
          <img
            src="/images/venue/arches-portrait.jpg"
            alt="Golden stage arches covered with pink and white roses"
            className="arch aspect-[4/5] w-full object-cover"
          />
          <img
            src="/images/venue/hall-facade.jpg"
            alt="Decorated canopy leading to the arched palace front"
            loading="lazy"
            className="absolute bottom-0 right-0 aspect-[4/3] w-[58%] rounded border-[6px] border-ivory object-cover shadow-[0_24px_50px_-30px_rgba(33,43,23,0.7)]"
          />
        </Reveal>

        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal stagger={0.1}>
            <Eyebrow className="mb-5">About Yash Palace</Eyebrow>
            <SectionTitle className="mb-7">A landmark of celebration in Yeola</SectionTitle>
            <p className="mb-4 max-w-[58ch] text-ink-soft">
              Yash Palace is one of Yeola's most loved wedding venues, known for its beautiful
              ambiance and a spacious hall that comfortably hosts up to{' '}
              <strong className="font-semibold text-green-800">3,000 guests</strong>.
            </p>
            <p className="max-w-[58ch] text-ink-soft">
              Guests praise the <strong className="font-semibold text-green-800">décor</strong> and{' '}
              <strong className="font-semibold text-green-800">food</strong>, while attentive staff
              and ample parking keep the day easy. We are just{' '}
              <strong className="font-semibold text-green-800">1 km from Yeola Bus Stand</strong>.
            </p>
          </Reveal>

          <Reveal as="ul" className="mt-8 grid gap-x-6 gap-y-3 border-t border-cream pt-6 sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm font-medium text-green-700">
                <Check size={16} className="mt-1 flex-none text-gold" />
                {b}
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
