interface Props {
  label: string;
  value: number;
  step?: number;
  suffix?: string;
  suggested?: number;
  /** Keeps the label for screen readers only, for rows under a shared header. */
  hideLabel?: boolean;
  disabled?: boolean;
  onChange: (n: number) => void;
}

export function Stepper({ label, value, step = 1, suffix, suggested, hideLabel = false, disabled = false, onChange }: Props) {
  const set = (n: number) => onChange(Math.max(0, Math.round(n * 100) / 100));
  const changed = suggested !== undefined && suggested !== value;
  return (
    <div className="stepper">
      {!hideLabel && <span className="stepper-label">{label}</span>}
      <div className="stepper-row">
        <button type="button" className="btn-step" aria-label={`Bajar ${label}`} disabled={disabled} onClick={() => set(value - step)}>−</button>
        <input
          className={changed ? 'changed' : ''}
          inputMode="decimal"
          value={value}
          readOnly={disabled}
          onChange={(e) => {
            const n = Number(e.target.value.replace(',', '.'));
            if (!isNaN(n)) set(n);
          }}
          aria-label={label}
        />
        <button type="button" className="btn-step" aria-label={`Subir ${label}`} disabled={disabled} onClick={() => set(value + step)}>+</button>
      </div>
      {suffix && <span className="stepper-suffix">{suffix}</span>}
    </div>
  );
}
