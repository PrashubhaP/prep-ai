import { Eyebrow } from "./Eyebrow";

/**
 * Eyebrow + large gradient display title used at the top of most routes.
 */
export function PageHeader({ eyebrow, title, description, className = "" }) {
  return (
    <div className={`animate-fade-in-up ${className}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">
        {title}
      </h1>
      {description ? (
        <p className="text-ink-soft mt-3 max-w-2xl leading-relaxed">
          {description}
        </p>
      ) : null}
      {/* Decorative gradient line */}
      <div className="mt-6 h-px w-24 bg-gradient-to-r from-accent-blue via-accent-violet to-transparent rounded-full" />
    </div>
  );
}
