import { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import Eyebrow from '../ui/Eyebrow';
import SectionTitle from '../ui/SectionTitle';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import Field from '../ui/Field';
import { venue, eventTypes } from '../../data/content';

export default function Contact() {
  const [note, setNote] = useState({ text: '', ok: false });

  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = (data.get('name') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();
    const event = (data.get('event') || '').toString();

    if (!name || !phone || !event) {
      setNote({ text: 'Please fill in your name, phone and event type.', ok: false });
      return;
    }
    setNote({
      text: `Thank you, ${name.split(' ')[0]}! We’ll call you back shortly to plan your celebration.`,
      ok: true,
    });
    e.currentTarget.reset();
  };

  const details = [
    { icon: Phone, label: 'Call us', value: venue.phoneDisplay, href: venue.phoneHref },
    { icon: Mail, label: 'Email', value: venue.email, href: `mailto:${venue.email}` },
    { icon: MapPin, label: 'Visit', value: venue.address },
  ];

  return (
    <section id="contact" className="bg-green-900 px-6 py-20 text-ivory sm:px-10 md:py-28 lg:px-24 lg:py-32">
      <div className="mx-auto grid max-w-container gap-10 md:grid-cols-2 lg:gap-20">
        {/* Info */}
        <div>
          <Reveal stagger={0.1}>
            <Eyebrow light className="mb-5">
              Book Your Date
            </Eyebrow>
            <SectionTitle light>
              Let's plan your
              <br />
              perfect celebration
            </SectionTitle>
            <p className="mb-8 mt-4 max-w-[42ch] opacity-80">
              Share a few details and our team will get back to you with availability, packages and a
              personal venue tour.
            </p>
          </Reveal>

          <Reveal stagger={0.1} as="ul" className="grid gap-5">
            {details.map((d) => (
              <li key={d.label} className="flex items-start gap-4">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-gold-glow/30 bg-gold-glow/10 text-gold-glow">
                  <d.icon size={18} />
                </span>
                <div>
                  <small className="mb-0.5 block text-[0.68rem] uppercase tracking-[0.18em] opacity-65">
                    {d.label}
                  </small>
                  {d.href ? (
                    <a href={d.href} className="text-base hover:text-gold-glow">
                      {d.value}
                    </a>
                  ) : (
                    <span className="text-base">{d.value}</span>
                  )}
                </div>
              </li>
            ))}
          </Reveal>
        </div>

        {/* Form */}
        <Reveal>
          <form
            onSubmit={onSubmit}
            noValidate
            className="grid gap-6 rounded-[18px] border border-white/10 bg-white/[0.035] p-6 sm:p-10"
          >
            <Field id="name" name="name" label="Full Name" required />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="phone" name="phone" type="tel" label="Phone Number" required />
              <Field id="date" name="date" type="date" label="Event Date" floatStatic />
            </div>
            <Field
              id="event"
              name="event"
              as="select"
              label="Type of Event"
              options={eventTypes}
              floatStatic
              required
            />
            <Field id="message" name="message" as="textarea" label="Message (guest count, preferences…)" />
            <Button as="button" type="submit" size="full">
              Request a Callback
            </Button>
            {note.text && (
              <p className={`text-sm ${note.ok ? 'text-lime-soft' : 'text-red-300'}`}>{note.text}</p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
