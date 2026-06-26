import Crest from '../ui/Crest';
import { navLinks, venue } from '../../data/content';

export default function Footer() {
  return (
    <footer className="bg-green-900 px-6 pb-6 pt-14 text-ivory sm:px-10 lg:px-24">
      <div className="mx-auto flex max-w-container flex-col items-start justify-between gap-8 border-b border-white/10 pb-9 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Crest className="h-10 w-10 flex-none text-xl" />
          <div>
            <strong className="block font-serif text-lg">{venue.name}</strong>
            <small className="text-[0.65rem] uppercase tracking-[0.2em] opacity-70">
              {venue.location}
            </small>
          </div>
        </div>

        <nav className="flex flex-wrap gap-6">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm opacity-85 hover:text-gold-glow">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex gap-5">
          {venue.socials.map((s) => (
            <a key={s.label} href={s.href} className="text-sm tracking-wide opacity-85 hover:text-gold-glow">
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-5 flex max-w-container flex-col justify-between gap-2 text-xs tracking-wide opacity-60 sm:flex-row">
        <span>© {new Date().getFullYear()} {venue.name}. All rights reserved.</span>
        <span>Crafted for unforgettable celebrations.</span>
      </div>
    </footer>
  );
}
