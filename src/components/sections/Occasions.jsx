import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import { occasions } from '../../data/content';

export default function Occasions() {
  return (
    <section
      id="occasions"
      className="relative bg-green-900 px-6 py-20 text-ivory sm:px-10 md:py-28 lg:px-24 lg:py-32"
      style={{
        backgroundImage:
          'linear-gradient(rgba(35,46,22,0.82),rgba(35,46,22,0.92)), url(/images/frame-02.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto grid max-w-container items-center gap-12 md:grid-cols-2">
        <Reveal stagger={0.12}>
          <Eyebrow light className="mb-5">
            Occasions
          </Eyebrow>
          <SectionTitle light>
            Made for every kind
            <br />
            of celebration
          </SectionTitle>
          <p className="mt-4 max-w-[42ch] opacity-80">
            Whatever the moment, Yash Palace adapts to your vision — grand or intimate, traditional
            or modern.
          </p>
        </Reveal>

        <Reveal stagger={0.1} as="ul">
          {occasions.map((item, i) => (
            <li
              key={item}
              className="group flex items-center gap-5 border-b border-white/15 py-5 font-serif text-[clamp(1.3rem,3vw,2rem)] transition-all duration-500 ease-soft hover:pl-4 hover:text-gold-glow"
            >
              <span className="font-sans text-sm tracking-wider text-gold-glow">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item}
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
