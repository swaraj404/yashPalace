const base =
  'inline-flex items-center justify-center gap-2 rounded-full text-xs font-medium uppercase tracking-[0.12em] transition-all duration-500 ease-soft will-change-transform';

const variants = {
  gold: 'bg-gradient-to-br from-gold-bright to-gold-glow text-[#2a2102] shadow-[0_12px_30px_-10px_rgba(200,146,10,0.65)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(200,146,10,0.85)]',
  ghost:
    'border border-white/60 text-white backdrop-blur-sm hover:bg-white hover:text-green-800 hover:-translate-y-0.5',
  outline:
    'border border-gold/50 text-green-800 hover:bg-gold hover:text-white hover:-translate-y-0.5',
};

const sizes = {
  md: 'px-7 py-3.5',
  sm: 'px-5 py-2.5',
  full: 'w-full px-7 py-4',
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
