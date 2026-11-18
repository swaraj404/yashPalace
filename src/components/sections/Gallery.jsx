import { useCallback, useState } from 'react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import Lightbox from '../ui/Lightbox';
import { galleryItems } from '../../data/content';

export default function Gallery() {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <section id="gallery" className="container-x section-pad">
      <Reveal className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <Eyebrow className="mb-5">Gallery</Eyebrow>
          <SectionTitle>A look inside</SectionTitle>
        </div>
        <p className="max-w-[38ch] text-ink-soft">
          The stage, the flowers and the seating, photographed at the venue.
        </p>
      </Reveal>

      <Reveal className="grid auto-rows-[clamp(130px,22vw,190px)] grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-12">
        {galleryItems.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View photo: ${item.caption}`}
            className={`gallery-item group relative overflow-hidden rounded bg-ivory-2 text-left ${item.span}`}
          >
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-green-950/80 to-transparent px-4 pb-3 pt-12 font-serif text-xl text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
              {item.caption}
            </span>
          </button>
        ))}
      </Reveal>

      <Lightbox items={galleryItems} index={active} onChange={setActive} onClose={close} />
    </section>
  );
}
