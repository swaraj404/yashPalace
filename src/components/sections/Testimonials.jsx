import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import { testimonials } from '../../data/content';

export default function Testimonials() {
  const [featured, ...rest] = testimonials;
  return (
    <section className="container-x section-pad">
      <Reveal className="mb-12">
        <Eyebrow className="mb-5">What guests say</Eyebrow>
        <SectionTitle>Remembered for the right reasons</SectionTitle>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal as="blockquote" className="lg:col-span-7">
          <p className="font-serif text-[clamp(2rem,3.7vw,3.2rem)] font-medium italic leading-[1.12] text-green-800">
            “{featured.quote}”
          </p>
          <cite className="mt-6 block text-sm not-italic text-ink-soft">{featured.author}</cite>
        </Reveal>

        <Reveal stagger={0.1} className="grid content-start gap-8 lg:col-span-4 lg:col-start-9">
          {rest.map((t) => (
            <blockquote key={t.quote} className="border-t border-cream pt-6">
              <p className="font-serif text-2xl leading-snug text-green-800">“{t.quote}”</p>
              <cite className="mt-3 block text-sm not-italic text-ink-soft">{t.author}</cite>
            </blockquote>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
