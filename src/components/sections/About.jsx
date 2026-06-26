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
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* Media */}
        <Reveal className="group relative overflow-hidden rounded-[18px]">
          <img
            src="/images/frame-03.jpg"
            alt="Yash Palace façade with grand columns"
            className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-soft group-hover:scale-105"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3 rounded-2xl bg-ivory/95 px-5 py-4 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.4)] backdrop-blur">
            <span className="font-serif text-3xl leading-none text-gold">3,000</span>
            <span className="text-[0.7rem] uppercase tracking-wide text-ink-soft">
              Guests
              <br />
              welcomed with ease
            </span>
          </div>
        </Reveal>

        {/* Text */}
        <div>
          <Reveal stagger={0.12}>
            <Eyebrow className="mb-5">About Yash Palace</Eyebrow>
            <SectionTitle className="mb-6">
              A landmark of celebration
              <br />
              in the heart of Yeola
            </SectionTitle>
            <p className="mb-4 max-w-[56ch] text-ink-soft">
              Yash Palace is one of Yeola's most loved wedding venues — known for its beautiful
              ambiance and a spacious hall that comfortably hosts gatherings of up to{' '}
              <strong className="font-medium text-green-800">3,000 guests</strong>. From intimate
              ceremonies to grand celebrations, every event unfolds against a backdrop of timeless
              elegance.
            </p>
            <p className="max-w-[56ch] text-ink-soft">
              Guests consistently praise the{' '}
              <strong className="font-medium text-green-800">lovely décor</strong> and{' '}
              <strong className="font-medium text-green-800">high-quality food</strong>, while our
              attentive staff and ample parking make every occasion effortless. Situated just{' '}
              <strong className="font-medium text-green-800">1 km from Yeola Bus Stand</strong>, the
              palace is as convenient as it is grand.
            </p>
          </Reveal>

          <Reveal className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {bullets.map((b) => (
              <span key={b} className="text-sm text-green-700">
                ✦ {b}
              </span>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
