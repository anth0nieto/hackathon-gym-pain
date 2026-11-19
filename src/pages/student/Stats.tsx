import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LineChart } from '../../components/LineChart';
import { WeekNav } from '../../components/WeekNav';
import { liftHistory } from '../../data/progress';
import { routinesOf, sessionStatus, sessionsOf, useDB } from '../../data/store';
import { addDays, dayOf, formatDay, fromISO, isValidISO, startOfWeek, today, weekDays } from '../../lib/dates';
import { humanDuration, sessionDuration } from '../../lib/duration';
import { useCurrentUser } from '../../session';
import './Stats.css';

const MISSED_ALERT = 3;
const RECENT = 3;

const UPCOMING_MESSAGES = [
  { icon: '💪', title: 'Esta semana todavía no empezó', text: 'Lo que hagas hoy es lo que vas a ver acá. ¡A seguir sumando!' },
  { icon: '🔥', title: 'Una semana nueva te espera', text: 'La constancia le gana al talento. Un entrenamiento a la vez.' },
  { icon: '🚀', title: 'Tu próxima semana está en blanco', text: 'Cada rutina que completes la va a ir llenando de verde.' },
  { icon: '🏆', title: 'Se viene otra semana', text: 'No hace falta que sea perfecta, alcanza con que vayas.' },
];

const COMEBACK = [
  'Un día sin ir no borra lo que ya hiciste. ¡Volvé cuando puedas!',
  'El cuerpo te espera donde lo dejaste. ¡Volvé cuando puedas!',
  'Lo importante no es no faltar, es volver. ¡Te esperamos!',
  'Cada vuelta cuenta, aunque sea corta. ¡Volvé cuando puedas!',
];

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Weekly summary, recent workouts and how the weights go up. A day counts as missed only once it's over. */
export function Stats() {
  const db = useDB();
  const user = useCurrentUser();
  const [params, setParams] = useSearchParams();
  const raw = params.get('fecha');
  const date = raw && isValidISO(raw) ? raw : today();

  const sessions = sessionsOf(db, user.id);
  const trained = new Set(sessions.map((s) => dayOf(s.startedAt)));
  const days = weekDays(date);
  const weekSessions = sessions.filter((s) => days.includes(dayOf(s.startedAt)));
  const trainedThisWeek = days.filter((d) => trained.has(d)).length;
  const month = date.slice(0, 7);
  const trainedThisMonth = [...trained].filter((d) => d.startsWith(month)).length;
  const finished = weekSessions.filter((s) => sessionStatus(s) === 'done').length;
  const target = user.daysPerWeek ?? routinesOf(db, user.id).length;

  // Missed days in a row, ending yesterday (or on the week's last day when looking at a past week).
  const firstDay = sessions.length ? dayOf(sessions[sessions.length - 1].startedAt) : days[0];
  let missedStreak = 0;
  for (let d = days[6] < today() ? days[6] : addDays(today(), -1); d >= firstDay && !trained.has(d); d = addDays(d, -1)) missedStreak++;
  const isCurrentWeek = startOfWeek(date) === startOfWeek(today());

  const nav = <WeekNav date={date} onChange={(d) => setParams({ fecha: d }, { replace: true })} />;
  const dayState = (d: string) => (trained.has(d) ? 'trained' : d < today() ? 'missed' : 'upcoming');

  if (startOfWeek(date) > startOfWeek(today())) {
    const weeksAhead = Math.round((fromISO(startOfWeek(date)).getTime() - fromISO(startOfWeek(today())).getTime()) / (7 * 86_400_000));
    const message = UPCOMING_MESSAGES[(weeksAhead - 1) % UPCOMING_MESSAGES.length];
    const routines = routinesOf(db, user.id).length;
    return (
      <div className="stack">
        <h1>Mi actividad</h1>
        {nav}
        <div className="empty">
          <p className="empty-icon">{message.icon}</p>
          <p><strong>{message.title}</strong></p>
          <p className="small">{message.text}</p>
          {routines > 0 && <p className="small muted">Te esperan {plural(routines, 'rutina', 'rutinas')} por semana.</p>}
        </div>
        <RecentWorkouts />
        <LiftProgress />
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>Mi actividad</h1>
      {nav}

      <div className="stats-days" aria-label="Días de la semana">
        {days.map((d) => (
          <div key={d} className={`stats-day ${dayState(d)}`} title={d}>
            <span className="small">{fromISO(d).toLocaleDateString('es-AR', { weekday: 'narrow' })}</span>
          </div>
        ))}
      </div>

      <div className="stats-grid">
        <Stat value={trainedThisWeek} label={isCurrentWeek ? 'días que entrenaste esta semana' : 'días que entrenaste esa semana'} />
        <Stat value={trainedThisMonth} label={`días que entrenaste en ${fromISO(date).toLocaleDateString('es-AR', { month: 'long' })}`} />
        <Stat value={target ? `${finished}/${target}` : finished} label="rutinas completadas" />
        <Stat value={missedStreak} label="días seguidos sin ir" danger={missedStreak >= MISSED_ALERT} />
      </div>

      {missedStreak > 0 && (
        <p className={`notice${missedStreak >= MISSED_ALERT ? ' danger' : ''}`}>
          {isCurrentWeek ? `Llevás ${plural(missedStreak, 'día', 'días')} sin entrenar.` : `Faltaste ${plural(missedStreak, 'día', 'días')} seguidos.`}{' '}
          {COMEBACK[missedStreak % COMEBACK.length]}
        </p>
      )}

      <RecentWorkouts />
      <LiftProgress />
    </div>
  );
}

function Stat({ value, label, danger }: { value: number | string; label: string; danger?: boolean }) {
  return (
    <div className={`card stat${danger ? ' stat-danger' : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="small muted">{label}</span>
    </div>
  );
}

function RecentWorkouts() {
  const db = useDB();
  const user = useCurrentUser();
  const [all, setAll] = useState(false);
  const sessions = sessionsOf(db, user.id);
  const shown = all ? sessions : sessions.slice(0, RECENT);

  return (
    <section className="card stack-sm">
      <div className="row-between">
        <h2>Entrenamientos recientes</h2>
        {sessions.length > RECENT && (
          <button type="button" className="btn-link" onClick={() => setAll(!all)}>
            {all ? 'Ver menos' : `Ver todos (${sessions.length})`}
          </button>
        )}
      </div>
      {sessions.length === 0 && <p className="muted small">Todavía no entrenaste. Tu primer entrenamiento va a aparecer acá.</p>}
      <ul className="recent-list">
        {shown.map((s) => {
          const duration = sessionDuration(s);
          return (
            <li key={s.id}>
              <Link to={`/alumno/sesion/${s.id}`} className="recent-item">
                <span className="recent-text">
                  <strong>{s.position} · {s.routineName}</strong>
                  <span className="muted small">
                    {formatDay(dayOf(s.startedAt))}
                    {duration !== undefined && ` · ${humanDuration(duration)}`}
                    {sessionStatus(s) === 'open' && ' · en curso'}
                  </span>
                </span>
                <span className="recent-chevron" aria-hidden="true">›</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const PERIODS = [
  { id: '1M', label: '1M', months: 1 },
  { id: '3M', label: '3M', months: 3 },
  { id: '1A', label: '1A', months: 12 },
  { id: 'todo', label: 'Todo', months: 0 },
] as const;

const shortDay = (at: string) => new Date(at).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });

function LiftProgress() {
  const db = useDB();
  const user = useCurrentUser();
  const history = liftHistory(db, user.id);
  const [key, setKey] = useState<string>();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['id']>('todo');

  const selected = history.find((h) => h.key === key) ?? history[0];
  const months = PERIODS.find((p) => p.id === period)!.months;
  const now = Date.now();
  const from = months
    ? new Date(new Date().setMonth(new Date().getMonth() - months)).getTime()
    : selected
      ? Math.min(new Date(selected.points[0].at).getTime(), now - 7 * 86_400_000)
      : now;
  const points = selected?.points.filter((p) => new Date(p.at).getTime() >= from) ?? [];
  const best = points.length ? Math.max(...points.map((p) => p.weight)) : undefined;

  return (
    <section className="card stack-sm">
      <h2>Progreso de pesos</h2>
      {!selected ? (
        <p className="muted small">Cuando registres pesos al entrenar, acá vas a ver cómo van subiendo.</p>
      ) : (
        <>
          <label className="field">
            <span>Ejercicio</span>
            <select value={selected.key} onChange={(e) => setKey(e.target.value)}>
              {history.map((h) => (
                <option key={h.key} value={h.key}>{h.label} · {h.best} kg</option>
              ))}
            </select>
          </label>

          <div className="segmented" role="group" aria-label="Período">
            {PERIODS.map((p) => (
              <button key={p.id} type="button" className={p.id === period ? 'is-active' : ''} aria-pressed={p.id === period} onClick={() => setPeriod(p.id)}>
                {p.label}
              </button>
            ))}
          </div>

          {points.length === 0 ? (
            <p className="muted small">No hiciste {selected.label.toLowerCase()} en este período.</p>
          ) : (
            <>
              <LineChart
                ariaLabel={`Peso de la mejor serie en ${selected.label}, ${points.length} entrenamientos. Mejor: ${best} kg.`}
                from={from}
                to={now}
                points={points.map((p) => ({ x: new Date(p.at).getTime(), y: p.weight, label: shortDay(p.at), value: `${p.weight} kg × ${p.reps}` }))}
              />
              <p className="muted small">
                Peso de la mejor serie de cada entrenamiento · Mejor: <strong className="lift-best">{best} kg</strong>
              </p>
              <ul className="lift-list">
                {[...points].reverse().map((p) => (
                  <li key={p.sessionId}>
                    <span className="muted">{shortDay(p.at)}</span>
                    <strong>{p.weight}×{p.reps}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}
