import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none";

const variants = {
  primary: "btn-gradient",
  signal:
    "bg-signal text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-0.5",
  ghost:
    "glass border-glass-border text-ink hover:bg-glass-hover hover:border-glass-border-hover hover:-translate-y-0.5",
};

const sizes = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

function classes({ variant = "primary", size = "md", className = "" }) {
  return `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`.trim();
}

export function Button({ variant, size, className, children, ...props }) {
  return (
    <button className={classes({ variant, size, className })} {...props}>
      <span>{children}</span>
    </button>
  );
}

export function ButtonLink({ variant, size, className, children, ...props }) {
  return (
    <Link className={classes({ variant, size, className })} {...props}>
      <span>{children}</span>
    </Link>
  );
}
