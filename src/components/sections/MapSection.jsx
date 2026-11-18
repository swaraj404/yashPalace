import { Navigation } from 'lucide-react';
import { venue } from '../../data/content';

export default function MapSection() {
  return (
    <section aria-label="Location" className="relative h-[clamp(420px,58vh,600px)] bg-ivory-2">
      <iframe
        title="Yash Palace location on Google Maps"
        src={venue.mapEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0 grayscale-[0.25]"
      />
      <div className="absolute bottom-4 left-4 right-4 rounded-md bg-ivory p-5 shadow-[0_24px_50px_-28px_rgba(33,43,23,0.7)] sm:right-auto sm:w-[360px] lg:bottom-10 lg:left-14">
        <h2 className="font-serif text-3xl font-semibold leading-tight text-green-800">Find us in Yeola</h2>
        <p className="mb-4 mt-1 text-sm text-ink-soft">{venue.address}</p>
        <a
          href={venue.directionsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 underline-offset-4 hover:underline"
        >
          <Navigation size={15} /> Get directions
        </a>
      </div>
    </section>
  );
}
