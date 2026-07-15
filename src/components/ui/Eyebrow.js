/**
 * Small uppercase mono label with gradient text that sits above page titles.
 */
export function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`font-mono text-xs tracking-[0.2em] uppercase text-gradient font-semibold mb-3 ${className}`.trim()}
    >
      {children}
    </p>
  );
}
