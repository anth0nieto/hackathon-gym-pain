import { addDays, startOfWeek, today, weekLabel } from '../lib/dates';

/** Arrows move ±7 days, keeping the selected weekday. */
export function WeekNav({ date, onChange }: { date: string; onChange: (date: string) => void }) {
  const isCurrentWeek = startOfWeek(date) === startOfWeek(today());
  return (
    <div className="daynav">
      <button className="btn-icon" aria-label="Semana anterior" onClick={() => onChange(addDays(date, -7))}>‹</button>
      <div className="daynav-label">
        <strong>{weekLabel(date)}</strong>
        {(!isCurrentWeek || date !== today()) && (
          <button className="btn-link" onClick={() => onChange(today())}>Volver a hoy</button>
        )}
      </div>
      <button className="btn-icon" aria-label="Semana siguiente" onClick={() => onChange(addDays(date, 7))}>›</button>
    </div>
  );
}
