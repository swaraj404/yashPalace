import { ArrowRight, MessageCircle } from 'lucide-react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import AvailabilityCalendar from '../ui/AvailabilityCalendar';
import { useSmoothScroll } from '../layout/SmoothScroll';
import { useBookingDate } from '../../lib/bookingDate';
import { formatLong } from '../../../shared/dates';
import { venue } from '../../data/content';

export default function Availability() {
  const { date } = useBookingDate();
  const smooth = useSmoothScroll();

  const toForm = (e) => {
    e.preventDefault();
    const form = document.querySelector('#contact');
    if (smooth) smooth.scrollTo(form, { offset: -10 });
    else form.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="availability" className="bg-ivory-2/60">
      <div className="container-x section-pad grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <Reveal stagger={0.1}>
          <Eyebrow className="mb-5">Available dates</Eyebrow>
          <SectionTitle className="mb-5">See which days are free</SectionTitle>
          <p className="mb-8 max-w-[44ch] text-ink-soft">
            Bookings are for the whole day. Choose a free date and send us your details. Your date is
            confirmed once our team has spoken with you.
          </p>
          <dl className="mb-8 grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <dt className="h-5 w-5 rounded bg-green-100" aria-hidden />
              <dd>Free to request</dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="grid h-5 w-5 place-items-center rounded bg-ivory-2 text-xs text-ink-soft line-through" aria-hidden>
                8
              </dt>
              <dd>Not available</dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="h-5 w-5 rounded bg-green-800" aria-hidden />
              <dd>Your selected date</dd>
            </div>
          </dl>

          <div className="border-t border-cream pt-6" aria-live="polite">
            {date ? (
              <>
                <p className="text-sm text-ink-soft">This date is free</p>
                <p className="mb-5 font-serif text-3xl font-semibold leading-tight text-green-800">
                  {formatLong(date)}
                </p>
                <Button href="#contact" onClick={toForm}>
                  Request this date <ArrowRight size={16} />
                </Button>
              </>
            ) : (
              <a
                href={venue.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-medium text-green-700 underline-offset-4 hover:underline"
              >
                <MessageCircle size={17} /> Prefer to ask on WhatsApp?
              </a>
            )}
          </div>
        </Reveal>

        <Reveal className="self-start rounded-md border border-cream bg-white p-4 shadow-[0_30px_60px_-45px_rgba(44,58,30,0.55)] sm:p-8">
          <AvailabilityCalendar months={2} />
        </Reveal>
      </div>
    </section>
  );
}
