const controlClasses =
  "w-full border border-glass-border rounded-xl p-3.5 bg-glass text-sm text-ink placeholder:text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 outline-none transition-all duration-300 backdrop-blur-sm";

export function Label({ children }) {
  return (
    <label className="block text-sm font-medium text-ink-soft mb-2">
      {children}
    </label>
  );
}

export function SelectField({
  label,
  options,
  placeholder,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <select className={`${controlClasses} cursor-pointer`} {...props}>
        {placeholder ? (
          <option value="" className="bg-canvas text-muted">
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option} className="bg-canvas text-ink">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
