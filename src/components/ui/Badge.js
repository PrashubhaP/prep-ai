const variants = {
  info: "bg-signal-soft text-signal",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  gradient:
    "bg-gradient-to-r from-accent-blue to-accent-violet text-white",
};

export function Badge({ variant = "info", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-full ${variants[variant] || variants.info} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
