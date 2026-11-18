export default function Eyebrow({ children, light = false, center = false, className = '' }) {
  return (
    <p
      className={`flex items-center gap-3 font-serif text-xl font-medium italic ${
        light ? 'text-gold-glow [text-shadow:0_1px_14px_rgba(23,31,15,0.75)]' : 'text-gold'
      } ${center ? 'justify-center' : ''} ${className}`}
    >
      <span className="inline-block h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}
