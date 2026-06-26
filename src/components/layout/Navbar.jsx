import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Crest from '../ui/Crest';
import Button from '../ui/Button';
import { navLinks, venue } from '../../data/content';
import { useSmoothScroll } from './SmoothScroll';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const smooth = useSmoothScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (smooth) (open ? smooth.stop() : smooth.start());
  }, [open, smooth]);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    if (!el) return;
    if (smooth) smooth.scrollTo(el, { offset: -10 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  const dark = scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[1000] flex items-center justify-between px-6 transition-all duration-500 ease-soft sm:px-10 lg:px-24 ${
        dark
          ? 'bg-ivory/90 py-3 shadow-[0_1px_0_#e6dfce] backdrop-blur-md'
          : 'bg-transparent py-4'
      }`}
    >
      {/* Brand */}
      <a
        href="#home"
        onClick={(e) => go(e, '#home')}
        className={`relative z-[1001] flex items-center gap-3 ${
          dark ? 'text-green-800' : 'text-white'
        }`}
      >
        <Crest className="h-10 w-10 flex-none text-xl" />
        <span className="flex flex-col leading-tight">
          <strong className="font-serif text-[1.05rem] font-semibold tracking-wide">
            {venue.name}
          </strong>
          <small className="text-[0.62rem] uppercase tracking-[0.22em] opacity-75">
            {venue.location}
          </small>
        </span>
      </a>

      {/* Desktop links */}
      <nav className="hidden items-center gap-8 lg:flex">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => go(e, link.href)}
            className={`group relative text-[0.82rem] uppercase tracking-wider transition-colors ${
              dark ? 'text-green-800' : 'text-white/90'
            }`}
          >
            {link.label}
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 ease-soft group-hover:w-full" />
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Button
          href="#contact"
          onClick={(e) => go(e, '#contact')}
          size="sm"
          className="hidden lg:inline-flex"
        >
          Book Your Date
        </Button>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className={`relative z-[1001] lg:hidden ${
            open || !dark ? 'text-white' : 'text-green-800'
          }`}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8 bg-green-900 transition-transform duration-500 ease-soft lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => go(e, link.href)}
            className="text-lg uppercase tracking-wider text-ivory"
          >
            {link.label}
          </a>
        ))}
        <Button href="#contact" onClick={(e) => go(e, '#contact')} className="mt-2">
          Book Your Date
        </Button>
      </div>
    </header>
  );
}
