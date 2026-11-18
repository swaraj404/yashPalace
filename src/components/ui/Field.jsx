const inputBase =
  'peer min-h-[50px] w-full border-0 border-b bg-transparent py-3 text-base text-ivory transition-colors focus:outline-none';

const labelBase =
  'pointer-events-none absolute left-0 top-3 text-base text-ivory/60 transition-all duration-300 ease-soft';

const floated = '-translate-y-6 text-xs font-medium text-gold-glow';

export default function Field({
  id,
  label,
  as = 'input',
  type = 'text',
  options,
  rows = 3,
  floatStatic = false,
  error,
  ...props
}) {
  const labelClass = floatStatic
    ? `${labelBase} ${floated}`
    : `${labelBase} peer-focus:-translate-y-6 peer-focus:text-xs peer-focus:font-medium peer-focus:text-gold-glow peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:text-gold-glow`;
  const border = error ? 'border-red-300' : 'border-white/25 focus:border-gold-glow';
  const shared = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
    ...props,
  };

  return (
    <div>
      <div className="relative">
        {as === 'textarea' && (
          <textarea rows={rows} placeholder=" " className={`${inputBase} ${border} resize-y`} {...shared} />
        )}

        {as === 'select' && (
          <select className={`${inputBase} ${border} [&>option]:text-ink`} defaultValue="" {...shared}>
            <option value="" disabled hidden />
            {options.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        )}

        {as === 'input' && (
          <input type={type} placeholder=" " className={`${inputBase} ${border}`} {...shared} />
        )}

        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
