import { venue } from '../../data/content';

export default function MapSection() {
  return (
    <section aria-label="Location map" className="h-[clamp(320px,45vh,480px)]">
      <iframe
        title="Yash Palace location on Google Maps"
        src={venue.mapEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0 contrast-[1.05] grayscale-[0.2]"
      />
    </section>
  );
}
