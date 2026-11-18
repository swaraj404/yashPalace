export default function SectionTitle({ children, light = false, className = '' }) {
  return (
    <h2
      className={`font-serif text-[clamp(2.5rem,5.4vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.015em] ${
        light ? 'text-ivory' : 'text-green-800'
      } ${className}`}
    >
      {children}
    </h2>
  );
}
