import { addDays, formatDay, formatShort, today, weekDays } from '../lib/dates';

interface Props {
  date: string;
  onChange: (date: string) => void;
  mode: 'day' | 'week';
}

export function DayNav({ date, onChange, mode }: Props) {
  const step = mode === 'day' ? 1 : 7;
  const days = weekDays(date);
  const label = mode === 'day' ? formatDay(date) : `${formatShort(days[0])} – ${formatShort(days[6])}`;
  return (
    <div className="daynav">
      <button className="btn-icon" aria-label="Anterior" onClick={() => onChange(addDays(date, -step))}>‹</button>
      <div className="daynav-label">
        <strong>{label}</strong>
        {date !== today() && (
          <button className="btn-link" onClick={() => onChange(today())}>Hoy</button>
        )}
      </div>
      <button className="btn-icon" aria-label="Siguiente" onClick={() => onChange(addDays(date, step))}>›</button>
    </div>
  );
}
