import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths, endOfMonth, formatLong, formatMonth, monthCells, startOfMonth, todayInIndia,
} from '../../../shared/dates';
import { useAvailability } from '../../lib/useAvailability';
import { useBookingDate } from '../../lib/bookingDate';
import { venue } from '../../data/content';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_AHEAD = 23;

const tones = {
  light: {
    title: 'text-green-800',
    muted: 'text-ink-soft',
    nav: 'border-cream text-green-800 hover:border-green-700 hover:bg-green-50',
    free: 'bg-green-50 text-green-800 hover:bg-gold-glow hover:text-green-950',
    taken: 'bg-ivory-2/70 text-ink-soft/55 line-through',
    past: 'text-ink-soft/30',
    selected: 'bg-green-800 text-ivory',
    today: 'ring-1 ring-inset ring-gold',
    skeleton: 'bg-ivory-2',
    error: 'bg-ivory-2 text-ink',
  },
  dark: {
    title: 'text-ivory',
    muted: 'text-ivory/65',
    nav: 'border-white/20 text-ivory hover:border-gold-glow hover:text-gold-glow',
    free: 'bg-white/[0.07] text-ivory hover:bg-gold-glow hover:text-green-950',
    taken: 'text-ivory/30 line-through',
    past: 'text-ivory/20',
    selected: 'bg-gold-glow text-green-950',
    today: 'ring-1 ring-inset ring-gold-glow/70',
    skeleton: 'bg-white/[0.07]',
    error: 'bg-white/10 text-ivory',
  },
};

function Month({ month, tone, data, value, onSelect }) {
  const t = tones[tone];
  return (
    <div>
      <h3 className={`mb-4 text-center font-serif text-2xl font-semibold ${t.title}`}>
        {formatMonth(month)}
      </h3>
      <div className={`mb-1 grid grid-cols-7 text-center text-xs font-medium ${t.muted}`} aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthCells(month).map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;
          const label = Number(day.slice(8));
          const isPast = day < data.today;
          if (data.status === 'loading' && !isPast) {
            return <span key={day} className={`aspect-square animate-pulse rounded ${t.skeleton}`} />;
          }
          const taken = data.unavailable.has(day);
          const usable = data.status === 'ready' && !isPast && !taken;
          const stateClass = day === value
            ? t.selected
            : isPast
              ? t.past
              : taken
                ? t.taken
                : usable
                  ? t.free
                  : t.past;
          const status = isPast ? 'past' : taken ? 'not available' : 'available';
          return (
            <button
              key={day}
              type="button"
              disabled={!usable}
              onClick={() => onSelect(day)}
              aria-pressed={day === value}
              aria-label={`${formatLong(day)}, ${status}`}
              className={`tabular aspect-square rounded text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed ${stateClass} ${
                day === data.today ? t.today : ''
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AvailabilityCalendar({ months = 1, tone = 'light', onSelect }) {
  const { date, setDate, version } = useBookingDate();
  const firstMonth = startOfMonth(todayInIndia());
  const lastMonth = addMonths(firstMonth, MONTHS_AHEAD);
  const [month, setMonth] = useState(() => (date ? startOfMonth(date) : firstMonth));
  const visible = Array.from({ length: months }, (_, i) => addMonths(month, i));
  const data = useAvailability(month, endOfMonth(visible[visible.length - 1]), version);
  const t = tones[tone];

  const select = (day) => {
    setDate(day);
    onSelect?.(day);
  };

  const navButton = `grid h-10 w-10 place-items-center rounded border transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${t.nav}`;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={month <= firstMonth}
          onClick={() => setMonth(addMonths(month, -1))}
          className={navButton}
        >
          <ChevronLeft size={18} />
        </button>
        <p className={`text-sm ${t.muted}`} aria-live="polite">
          {data.status === 'loading' ? 'Checking dates…' : 'Tap a free date'}
        </p>
        <button
          type="button"
          aria-label="Next month"
          disabled={month >= lastMonth}
          onClick={() => setMonth(addMonths(month, 1))}
          className={navButton}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {data.status === 'error' && (
        <div role="alert" className={`mb-4 rounded p-3 text-sm ${t.error}`}>
          We couldn’t load live dates.{' '}
          <button type="button" onClick={data.retry} className="font-semibold underline">
            Try again
          </button>{' '}
          or call <a href={venue.phoneHref} className="font-semibold underline">{venue.phoneDisplay}</a>.
        </div>
      )}

      <div className={`grid gap-10 ${months > 1 ? 'lg:grid-cols-2' : ''}`}>
        {visible.map((m, i) => (
          <div key={m} className={i > 0 ? 'hidden lg:block' : ''}>
            <Month month={m} tone={tone} data={data} value={date} onSelect={select} />
          </div>
        ))}
      </div>
    </div>
  );
}
