import { fromISO, today, weekDays } from '../lib/dates';

export type DayMark = 'none' | 'open' | 'done';

interface Props {
  date: string;
  onSelect: (date: string) => void;
  markOf: (date: string) => DayMark;
}

export function WeekStrip({ date, onSelect, markOf }: Props) {
  return (
    <div className="weekstrip" role="tablist">
      {weekDays(date).map((d) => {
        const day = fromISO(d);
        const classes = ['weekstrip-day', d === date && 'is-selected', d === today() && 'is-today'].filter(Boolean).join(' ');
        return (
          <button key={d} role="tab" aria-selected={d === date} className={classes} onClick={() => onSelect(d)}>
            <span className="weekstrip-name">{day.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')}</span>
            <span className="weekstrip-num">{day.getDate()}</span>
            <span className={`dot dot-${markOf(d)}`} />
          </button>
        );
      })}
    </div>
  );
}
