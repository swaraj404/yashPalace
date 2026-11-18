const base =
  'inline-flex items-center justify-center gap-2 rounded text-sm font-semibold transition-all duration-300 ease-soft active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  gold: 'bg-gold-glow text-green-950 shadow-[0_14px_30px_-16px_rgba(140,103,9,0.8)] hover:-translate-y-0.5 hover:bg-gold-bright',
  ghost: 'border border-white/60 text-white backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white hover:text-green-800',
  outline: 'border border-green-700/40 text-green-800 hover:border-green-800 hover:bg-green-800 hover:text-ivory',
  lightOutline: 'border border-white/30 text-ivory hover:border-gold-glow hover:text-gold-glow',
};

const sizes = {
  md: 'px-6 py-3.5',
  sm: 'px-4 py-2.5',
  full: 'w-full px-6 py-4',
};

export default function Button({
  as = 'a',
  variant = 'gold',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const Tag = as;
  return (
    <Tag className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
