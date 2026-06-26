export default function SectionTitle({ children, light = false, className = '' }) {
  return (
    <h2
      className={`font-serif text-[clamp(1.9rem,4.6vw,3.4rem)] font-medium leading-[1.08] tracking-tight ${
        light ? 'text-ivory' : 'text-green-800'
      } ${className}`}
    >
      {children}
    </h2>
  );
}
