import { useEffect, useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';
import Crest from '../ui/Crest';
import Button from '../ui/Button';
import { navLinks, venue } from '../../data/content';
import { useSmoothScroll } from './SmoothScroll';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ['#home', ...navLinks.map((link) => link.href)].forEach((href) => {
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    if (!el) return;
    // The open menu locks scrolling, so release it before moving the page.
    document.body.style.overflow = '';
    smooth?.start();
    if (smooth) smooth.scrollTo(el, { offset: -10 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  const dark = scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[1000] flex items-center justify-between px-5 transition-all duration-500 ease-soft sm:px-10 lg:px-14 ${
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
        <Crest className="h-11 w-9 flex-none text-xl" />
        <span className="flex flex-col leading-tight">
          <strong className="font-serif text-[1.45rem] font-semibold leading-none">
            {venue.name}
          </strong>
          <small className="text-xs opacity-75">
            {venue.location}
          </small>
        </span>
      </a>

      {/* Desktop links */}
      <nav aria-label="Main" className="hidden items-center gap-5 lg:flex xl:gap-7">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => go(e, link.href)}
            aria-current={current === link.href ? 'true' : undefined}
            className={`group relative text-sm font-medium transition-colors ${
              dark ? 'text-green-800' : 'text-white/90'
            }`}
          >
            {link.label}
            <span
              className={`absolute -bottom-1 left-0 h-px bg-gold-bright transition-all duration-300 ease-soft group-hover:w-full ${
                current === link.href ? 'w-full' : 'w-0'
              }`}
            />
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <a
          href={venue.phoneHref}
          className={`hidden items-center gap-2 text-sm font-semibold xl:inline-flex ${
            dark ? 'text-green-800' : 'text-white'
          }`}
        >
          <Phone size={15} /> {venue.phoneDisplay}
        </a>
        <Button
          href="#availability"
          onClick={(e) => go(e, '#availability')}
          size="sm"
          className="hidden lg:inline-flex"
        >
          Check dates
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
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 bg-green-900 px-6 transition-transform duration-500 ease-soft lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => go(e, link.href)}
            className="font-serif text-3xl text-ivory"
          >
            {link.label}
          </a>
        ))}
        <Button href={venue.phoneHref} className="mt-2">
          <Phone size={16} /> {venue.phoneDisplay}
        </Button>
      </div>
    </header>
  );
}
