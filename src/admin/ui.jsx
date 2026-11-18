import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const buttonStyles = {
  primary: 'bg-green-800 text-ivory hover:bg-green-700',
  gold: 'bg-gold-glow text-green-950 hover:bg-gold-bright',
  plain: 'border border-cream bg-white text-green-800 hover:border-green-700',
  danger: 'bg-sindoor text-white hover:bg-[#8a2718]',
  quiet: 'text-sindoor hover:bg-sindoor/10',
};

export function Btn({ tone = 'plain', className = '', as: Tag = 'button', children, ...props }) {
  const typeProp = Tag === 'button' ? { type: 'button' } : {};
  return (
    <Tag
      {...typeProp}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded px-4 text-sm font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 ${buttonStyles[tone]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

const control =
  'min-h-11 w-full rounded border bg-white px-3 py-2 text-base text-ink transition-colors focus:border-green-700 focus:outline-none';

export function Input({ label, error, hint, as: Tag = 'input', id, prefix, ...props }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const field = (
    <Tag
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={`${control} ${error ? 'border-sindoor' : 'border-cream'} ${prefix ? 'pl-7' : ''}`}
      {...props}
    />
  );
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-green-800">
        {label}
      </label>
      {prefix ? (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">{prefix}</span>
          {field}
        </div>
      ) : field}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-ink-soft">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-sindoor">{error}</p>}
    </div>
  );
}

export function Sheet({ title, onClose, children }) {
  const panel = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('input, select, textarea, button:not([data-close])')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-green-950/50"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-full w-full max-w-lg flex-col bg-ivory shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-cream px-5 py-3">
          <h2 className="font-serif text-3xl font-semibold text-green-800">{title}</h2>
          <button
            type="button"
            data-close
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 place-items-center rounded text-ink-soft hover:bg-ivory-2"
          >
            <X size={22} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function PageTitle({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-serif text-[2.75rem] font-semibold leading-none text-green-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="rounded border border-dashed border-cream px-5 py-10 text-center">
      <p className="font-serif text-2xl font-semibold text-green-800">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{children}</div>}
    </div>
  );
}
