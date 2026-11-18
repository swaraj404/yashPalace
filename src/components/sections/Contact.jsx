import { useRef, useState } from 'react';
import { CalendarDays, MapPin, MessageCircle, Phone, X } from 'lucide-react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import Field from '../ui/Field';
import AvailabilityCalendar from '../ui/AvailabilityCalendar';
import { useBookingDate } from '../../lib/bookingDate';
import { formatLong } from '../../../shared/dates';
import { venue, eventTypes } from '../../data/content';

export default function Contact() {
  const { date, setDate, refresh } = useBookingDate();
  const formRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(formRef.current);
    const value = (key) => (data.get(key) || '').toString().trim();
    const next = {};
    if (!value('name')) next.name = 'Please enter your name.';
    if (value('phone').replace(/\D/g, '').length < 10) next.phone = 'Please enter a valid phone number.';
    if (!value('event')) next.eventType = 'Please choose the type of event.';
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus({ state: 'idle', message: '' });
      return;
    }

    setStatus({ state: 'sending', message: '' });
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: value('name'),
          phone: value('phone'),
          eventDate: date || null,
          eventType: value('event'),
          message: value('message'),
          website: value('website'),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (body.field) setErrors({ [body.field]: body.error });
        if (res.status === 409) {
          setDate('');
          setPickerOpen(true);
          refresh();
        }
        setStatus({ state: 'error', message: body.field ? '' : body.error });
        return;
      }
      setStatus({
        state: 'sent',
        message: `Thank you, ${value('name').split(' ')[0]}. We’ll call you on ${value('phone')} soon.`,
      });
      formRef.current.reset();
      setDate('');
      setPickerOpen(false);
      refresh();
    } catch {
      setStatus({ state: 'error', message: 'We couldn’t send your request. Please call us instead.' });
    }
  };

  return (
    <section id="contact" className="bg-green-900 text-ivory">
      <div className="container-x section-pad grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal stagger={0.1}>
            <Eyebrow light className="mb-5">Book your date</Eyebrow>
            <SectionTitle light>Let’s plan your celebration</SectionTitle>
            <p className="mb-9 mt-6 max-w-[42ch] text-ivory/75">
              Call us directly, or send your details and we’ll get back to you about the date,
              packages and a venue visit.
            </p>
            <a
              href={venue.phoneHref}
              className="tabular mb-6 block font-serif text-[clamp(2.4rem,5vw,3.8rem)] font-medium leading-none text-gold-glow transition-colors hover:text-ivory"
            >
              {venue.phoneDisplay}
            </a>
            <div className="mb-9 flex flex-wrap gap-3">
              <Button href={venue.phoneHref}>
                <Phone size={16} /> Call now
              </Button>
              <Button href={venue.whatsappHref} target="_blank" rel="noreferrer" variant="lightOutline">
                <MessageCircle size={16} /> WhatsApp
              </Button>
            </div>
            <p className="flex max-w-[40ch] items-start gap-3 text-ivory/75">
              <MapPin size={18} className="mt-1 flex-none text-gold-glow" />
              {venue.address}
            </p>
            {venue.email && (
              <a href={`mailto:${venue.email}`} className="mt-3 block text-ivory/75 hover:text-gold-glow">
                {venue.email}
              </a>
            )}
          </Reveal>
        </div>

        <Reveal className="lg:col-span-6 lg:col-start-7">
          <form
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            className="grid gap-7 rounded-md border border-white/10 bg-white/[0.04] p-5 sm:p-9"
          >
            <Field id="name" name="name" label="Full name" autoComplete="name" required error={errors.name} />
            <div className="grid gap-7 sm:grid-cols-2">
              <Field id="phone" name="phone" type="tel" label="Phone number" autoComplete="tel" required error={errors.phone} />
              <Field
                id="event"
                name="event"
                as="select"
                label="Type of event"
                options={eventTypes}
                floatStatic
                required
                error={errors.eventType}
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gold-glow" id="date-label">Event date</p>
              <div className={`flex items-center justify-between gap-3 border-b py-2 ${errors.eventDate ? 'border-red-300' : 'border-white/25'}`}>
                <button
                  type="button"
                  aria-expanded={pickerOpen}
                  aria-labelledby="date-label date-value"
                  onClick={() => setPickerOpen((o) => !o)}
                  className="flex min-h-8 flex-1 items-center gap-2.5 text-left"
                >
                  <CalendarDays size={18} className="flex-none text-gold-glow" />
                  <span id="date-value" className={date ? '' : 'text-ivory/60'}>
                    {date ? formatLong(date) : 'Choose from available dates'}
                  </span>
                </button>
                {date && (
                  <button type="button" onClick={() => setDate('')} aria-label="Clear date" className="p-1 text-ivory/60 hover:text-ivory">
                    <X size={16} />
                  </button>
                )}
              </div>
              {errors.eventDate && <p className="mt-1.5 text-sm text-red-200">{errors.eventDate}</p>}
              {pickerOpen && (
                <div className="mt-4 rounded bg-black/15 p-3 sm:p-4">
                  <AvailabilityCalendar
                    tone="dark"
                    onSelect={() => {
                      setPickerOpen(false);
                      setErrors((current) => ({ ...current, eventDate: undefined }));
                    }}
                  />
                </div>
              )}
            </div>

            <Field id="message" name="message" as="textarea" label="Guest count and anything else we should know" error={errors.message} />

            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Leave this empty</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <Button as="button" type="submit" size="full" disabled={status.state === 'sending'}>
              {status.state === 'sending' ? 'Sending…' : 'Request a callback'}
            </Button>
            <div aria-live="polite">
              {status.message && (
                <p className={`text-sm ${status.state === 'sent' ? 'text-lime-soft' : 'text-red-200'}`}>
                  {status.message}
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
