import { useEffect, useState } from 'react';
import { CalendarDays, Phone } from 'lucide-react';
import { venue } from '../../data/content';

// Keeps "call" and "check dates" within reach on phones once past the hero.
export default function MobileActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const about = document.querySelector('#about');
      setVisible(Boolean(about) && about.getBoundingClientRect().top < window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const item = 'flex items-center justify-center gap-2 py-3.5 text-sm font-semibold';
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[900] grid grid-cols-2 bg-green-950 pb-[env(safe-area-inset-bottom)] text-ivory transition-transform duration-300 ease-soft lg:hidden ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
    >
      <a href={venue.phoneHref} tabIndex={visible ? 0 : -1} className={item}>
        <Phone size={16} /> Call
      </a>
      <a href="#availability" tabIndex={visible ? 0 : -1} className={`${item} bg-gold-glow text-green-950`}>
        <CalendarDays size={16} /> Check dates
      </a>
    </div>
  );
}
