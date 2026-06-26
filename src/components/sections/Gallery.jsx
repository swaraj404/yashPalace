import { useState } from 'react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import Lightbox from '../ui/Lightbox';
import { galleryItems } from '../../data/content';

const spanClass = {
  tall: 'row-span-2',
  wide: 'sm:col-span-2',
};

export default function Gallery() {
  const [active, setActive] = useState(null);

  return (
    <section id="gallery" className="container-x section-pad">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <Eyebrow center className="mb-5">
          Gallery
        </Eyebrow>
        <SectionTitle>A glimpse of the grandeur</SectionTitle>
      </Reveal>

      <Reveal
        stagger={0.08}
        className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {galleryItems.map((item) => (
          <figure
            key={item.src}
            onClick={() => setActive(item)}
            className={`gallery-item group relative cursor-pointer overflow-hidden rounded-[18px] ${
              spanClass[item.span] || ''
            }`}
          >
            <img
              src={item.src}
              alt={item.caption}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
            />
            <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-green-900/85 to-transparent px-5 pb-4 pt-14 font-serif text-lg text-white opacity-0 transition-all duration-500 ease-soft group-hover:translate-y-0 group-hover:opacity-100">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </Reveal>

      <p className="mt-6 text-center text-xs tracking-wide text-ink-soft">
        Tap any image to view full size.
      </p>

      <Lightbox image={active} onClose={() => setActive(null)} />
    </section>
  );
}
