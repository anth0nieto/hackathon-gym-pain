import { useState, type ReactNode } from 'react';
import './WeekCalendar.css';

const DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const DAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Fechas en formato `AAAA-MM-DD`. */
export interface WeekCalendarProps {
  /** Días entrenados: punto de color. */
  trainedDates?: string[];
  /** Días con entrenamiento planeado: punto gris. */
  plannedDates?: string[];
  /** Por defecto, la fecha de hoy. */
  today?: string;
  selectedDate?: string;
  /** Si se pasa, los días se pueden tocar. */
  onSelectDate?: (date: string) => void;
  /** Recibe el lunes de la semana que se muestra. */
  onWeekChange?: (weekStart: string) => void;
  /** Texto debajo de los días, por ejemplo "Te quedan 2 de 3 esta semana". */
  footer?: ReactNode;
  className?: string;
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d: Date) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
}

function weekTitle(start: Date, offset: number) {
  if (offset === 0) return 'Esta semana';
  if (offset === -1) return 'Semana pasada';
  if (offset === 1) return 'Próxima semana';
  const end = addDays(start, 6);
  const from = start.getMonth() === end.getMonth() ? `${start.getDate()}` : `${start.getDate()} ${MONTHS[start.getMonth()]}`;
  return `${from} – ${end.getDate()} ${MONTHS[end.getMonth()]}`;
}

export function WeekCalendar({
  trainedDates = [],
  plannedDates = [],
  today,
  selectedDate,
  onSelectDate,
  onWeekChange,
  footer,
  className,
}: WeekCalendarProps) {
  const todayDate = today ? fromKey(today) : new Date();
  const todayKey = toKey(todayDate);
  const currentWeek = startOfWeek(todayDate);
  const [weekStart, setWeekStart] = useState(currentWeek);

  const offset = Math.round((weekStart.getTime() - currentWeek.getTime()) / WEEK_MS);
  const trained = new Set(trainedDates);
  const planned = new Set(plannedDates);

  const go = (weeks: number) => {
    const next = addDays(weekStart, weeks * 7);
    setWeekStart(next);
    onWeekChange?.(toKey(next));
  };

  return (
    <section className={['ds-week', className].filter(Boolean).join(' ')}>
      <header className="ds-week__header">
        <button type="button" className="ds-week__nav" aria-label="Semana anterior" onClick={() => go(-1)}>
          <Chevron direction="left" />
        </button>
        <h2 className="ds-week__title" aria-live="polite">
          {weekTitle(weekStart, offset)}
        </h2>
        <button type="button" className="ds-week__nav" aria-label="Semana siguiente" onClick={() => go(1)}>
          <Chevron direction="right" />
        </button>
      </header>

      <ol className="ds-week__days">
        {DAY_LABELS.map((label, i) => {
          const date = addDays(weekStart, i);
          const key = toKey(date);
          const isTrained = trained.has(key);
          const state = isTrained ? 'trained' : planned.has(key) ? 'planned' : undefined;
          const classes = [
            'ds-week__day',
            key === todayKey && 'ds-week__day--today',
            key === selectedDate && 'ds-week__day--selected',
            state && `ds-week__day--${state}`,
          ]
            .filter(Boolean)
            .join(' ');
          const ariaLabel = [
            `${DAY_NAMES[i]} ${date.getDate()} de ${MONTHS[date.getMonth()]}`,
            key === todayKey && 'hoy',
            state === 'trained' && 'entrenaste',
            state === 'planned' && 'entrenamiento planeado',
          ]
            .filter(Boolean)
            .join(', ');

          const content = (
            <>
              <span className="ds-week__label" aria-hidden="true">{label}</span>
              <span className="ds-week__num" aria-hidden="true">{date.getDate()}</span>
              <span className="ds-week__dot" aria-hidden="true" />
            </>
          );

          return (
            <li key={key}>
              {onSelectDate ? (
                <button
                  type="button"
                  className={classes}
                  aria-label={ariaLabel}
                  aria-current={key === todayKey ? 'date' : undefined}
                  aria-pressed={key === selectedDate}
                  onClick={() => onSelectDate(key)}
                >
                  {content}
                </button>
              ) : (
                <div className={classes} aria-label={ariaLabel} aria-current={key === todayKey ? 'date' : undefined} role="group">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {footer && <p className="ds-week__footer">{footer}</p>}
    </section>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}
