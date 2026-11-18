import Crest from '../ui/Crest';
import { navLinks, venue } from '../../data/content';

export default function Footer() {
  return (
    <footer className="bg-green-950 pb-24 pt-14 text-ivory lg:pb-8">
      <div className="container-x">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <Crest className="h-11 w-9 flex-none text-xl" />
              <div>
                <strong className="block font-serif text-2xl font-semibold leading-none">{venue.name}</strong>
                <small className="text-xs text-ivory/60">{venue.location}</small>
              </div>
            </div>
            <a href={venue.phoneHref} className="tabular font-serif text-3xl text-gold-glow hover:text-ivory">
              {venue.phoneDisplay}
            </a>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-ivory/75 hover:text-gold-glow">
                {link.label}
              </a>
            ))}
            <a href={venue.whatsappHref} target="_blank" rel="noreferrer" className="text-sm text-ivory/75 hover:text-gold-glow">
              WhatsApp
            </a>
          </nav>
        </div>
        <p className="mt-5 text-xs text-ivory/50">
          © {new Date().getFullYear()} {venue.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
