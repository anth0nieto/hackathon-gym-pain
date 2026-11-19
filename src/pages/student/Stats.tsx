import { useSearchParams } from 'react-router-dom';
import { WeekNav } from '../../components/WeekNav';
import { logsOf, sessionStatus, sessionsOf, useDB } from '../../data/store';
import { dayOf, fromISO, isValidISO, today, weekDays } from '../../lib/dates';
import { humanDuration, sessionDuration } from '../../lib/duration';
import { useCurrentUser } from '../../session';

const MISSED_ALERT = 3;

/** Weekly summary for the student. A day counts as missed only once it's over. */
export function Stats() {
  const db = useDB();
  const user = useCurrentUser();
  const [params, setParams] = useSearchParams();
  const raw = params.get('fecha');
  const date = raw && isValidISO(raw) ? raw : today();

  const days = weekDays(date);
  const weekSessions = sessionsOf(db, user.id).filter((s) => days.includes(dayOf(s.startedAt)));
  const trainedDays = new Set(weekSessions.map((s) => dayOf(s.startedAt)));
  const finished = weekSessions.filter((s) => sessionStatus(s) === 'done');
  const skippedExercises = weekSessions.flatMap((s) => logsOf(db, s.id)).filter((l) => l.status === 'skipped').length;

  const dayState = (d: string) => (trainedDays.has(d) ? 'trained' : d < today() ? 'missed' : 'upcoming');
  const missed = days.filter((d) => dayState(d) === 'missed');

  let streak = 0;
  let longestMissedStreak = 0;
  for (const d of days) {
    streak = dayState(d) === 'missed' ? streak + 1 : 0;
    longestMissedStreak = Math.max(longestMissedStreak, streak);
  }
  const alert = longestMissedStreak >= MISSED_ALERT;

  const durations = finished.map(sessionDuration).filter((ms): ms is number => ms !== undefined);
  const average = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : undefined;

  return (
    <div className="stack">
      <h1>Mi actividad</h1>
      <WeekNav date={date} onChange={(d) => setParams({ fecha: d }, { replace: true })} />

      <div className="stats-days" aria-label="Días de la semana">
        {days.map((d) => (
          <div key={d} className={`stats-day ${dayState(d)}`} title={d}>
            <span className="small">{fromISO(d).toLocaleDateString('es-AR', { weekday: 'narrow' })}</span>
          </div>
        ))}
      </div>

      <div className="stats-grid">
        <Stat value={trainedDays.size} label="días que entrenaste" />
        <Stat value={finished.length} label="rutinas completadas" />
        <Stat value={skippedExercises} label="ejercicios salteados" />
        <Stat value={missed.length} label="días que no fuiste" danger={alert} />
      </div>

      {alert && (
        <p className="notice danger">Faltaste {longestMissedStreak} días seguidos esta semana. ¡Volvé cuando puedas!</p>
      )}
      {average !== undefined && (
        <p className="muted small">Tardaste en promedio {humanDuration(average)} por rutina.</p>
      )}
    </div>
  );
}

function Stat({ value, label, danger }: { value: number; label: string; danger?: boolean }) {
  return (
    <div className={`card stat${danger ? ' stat-danger' : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="small muted">{label}</span>
    </div>
  );
}
