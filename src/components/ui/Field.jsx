const inputBase =
  'peer w-full border-0 border-b border-white/25 bg-transparent py-3 text-[0.98rem] font-light text-ivory transition-colors focus:border-gold-glow focus:outline-none';

const labelBase =
  'pointer-events-none absolute left-0 top-3 text-[0.98rem] text-ivory/55 transition-all duration-300 ease-soft';

// Floated (small, up, gold) state shared by focus / filled / static.
const floated =
  '-translate-y-6 text-[0.68rem] uppercase tracking-[0.12em] text-gold-glow';

export default function Field({
  id,
  label,
  as = 'input',
  type = 'text',
  options,
  rows = 3,
  floatStatic = false,
  ...props
}) {
  const labelClass = floatStatic
    ? `${labelBase} ${floated}`
    : `${labelBase} peer-focus:-translate-y-6 peer-focus:text-[0.68rem] peer-focus:uppercase peer-focus:tracking-[0.12em] peer-focus:text-gold-glow peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[0.68rem] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.12em] peer-[:not(:placeholder-shown)]:text-gold-glow`;

  return (
    <div className="relative">
      {as === 'textarea' && (
        <textarea id={id} rows={rows} placeholder=" " className={`${inputBase} resize-y`} {...props} />
      )}

      {as === 'select' && (
        <select id={id} className={`${inputBase} [&>option]:text-ink`} defaultValue="" {...props}>
          <option value="" disabled hidden />
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      )}

      {as === 'input' && (
        <input id={id} type={type} placeholder=" " className={inputBase} {...props} />
      )}

      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
    </div>
  );
}
