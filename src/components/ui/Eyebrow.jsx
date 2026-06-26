export default function Eyebrow({ children, light = false, center = false, className = '' }) {
  return (
    <p
      className={`inline-flex items-center gap-3 text-[0.72rem] font-medium uppercase tracking-[0.28em] ${
        light ? 'text-gold-glow' : 'text-gold'
      } ${center ? 'justify-center' : ''} ${className}`}
    >
      <span className="inline-block h-px w-8 bg-current opacity-70" />
      {children}
    </p>
  );
}
