import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { WeekNav } from '../../components/WeekNav';
import { WeekStrip, type DayMark } from '../../components/WeekStrip';
import { dueRoutine, openSession, plannedExercises, routinesOf, sessionStatus, sessionsOf, startSession, useDB } from '../../data/store';
import { dayOf, formatDay, isValidISO, startOfWeek, today } from '../../lib/dates';
import { humanDuration, sessionDuration } from '../../lib/duration';
import { useCurrentUser } from '../../session';
import type { Session } from '../../types';

/**
 * Student home: a week calendar. Routines have no date, so a day shows what was trained that day;
 * today and upcoming days show the routine that comes next in the rotation.
 */
export function StudentDay() {
  const db = useDB();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const raw = params.get('fecha');
  const date = raw && isValidISO(raw) ? raw : today();
  const select = (d: string) => setParams({ fecha: d }, { replace: true });

  const routines = routinesOf(db, user.id);
  const total = routines.length;
  const sessions = sessionsOf(db, user.id);
  const due = dueRoutine(db, user.id);
  const open = openSession(db, user.id);

  const sessionsOn = (d: string) => sessions.filter((s) => dayOf(s.startedAt) === d);
  const markOf = (d: string): DayMark => {
    const day = sessionsOn(d);
    if (!day.length) return 'none';
    return day.some((s) => sessionStatus(s) === 'open') ? 'open' : 'done';
  };

  const weekStart = startOfWeek(date);
  const doneThisWeek = sessions.filter((s) => startOfWeek(dayOf(s.startedAt)) === weekStart).length;
  const isPast = date < today();
  const isToday = date === today();
  const daySessions = sessionsOn(date).filter((s) => !(isToday && s.id === open?.id));

  if (total === 0) return <p className="empty">Tu coach todavía no te armó rutinas.</p>;

  return (
    <div className="stack">
      <WeekNav date={date} onChange={select} />
      <WeekProgress done={doneThisWeek} total={total} />
      <WeekStrip date={date} onSelect={select} markOf={markOf} />

      {!isPast && due && (
        <section className="card hero-card stack-sm">
          <p className="eyebrow">{isToday ? (open ? 'Estás haciendo' : 'Te toca') : 'Tu próxima rutina'}</p>
          <div>
            <h1 className="hero-title">{due.name}</h1>
            <p className="muted small">Rutina {due.position} de {total} · {plannedExercises(due).length} ejercicios</p>
          </div>
          <p className="hero-exercises">{plannedExercises(due).map((e) => e.name).join(' · ')}</p>
          {isToday ? (
            <button className="btn btn-block btn-start" onClick={() => { if (!open) startSession(user.id, due); navigate('/alumno/entrenar'); }}>
              {open ? 'Seguir' : 'Empezar'}
            </button>
          ) : (
            <p className="muted small">Las rutinas van en orden: el día que vengas, hacés la que sigue.</p>
          )}
        </section>
      )}

      <h2 className="day-title">{isToday ? `Hoy, ${formatDay(date)}` : formatDay(date)}</h2>

      {daySessions.length > 0 && (
        <div className="card session-list">
          {daySessions.map((s) => <SessionCard key={s.id} session={s} total={total} />)}
        </div>
      )}

      {isPast && daySessions.length === 0 && (
        <div className="empty">
          <p><strong>Día libre</strong></p>
          <p className="small">No entrenaste este día.</p>
        </div>
      )}
    </div>
  );
}

function WeekProgress({ done, total }: { done: number; total: number }) {
  return (
    <div className="week-progress">
      <span className="small muted">{done >= total ? '¡Semana completa!' : `${done} de ${total} rutinas esta semana`}</span>
      <div className="row">
        {Array.from({ length: Math.max(total, done) }, (_, i) => (
          <span key={i} className={`dot ${i < done ? 'dot-done' : 'dot-pending'}`} />
        ))}
      </div>
    </div>
  );
}

function SessionCard({ session, total }: { session: Session; total: number }) {
  const ms = sessionDuration(session);
  return (
    <Link to={`/alumno/sesion/${session.id}`} className="session-row">
      <span className="session-row-text">
        <strong>{session.routineName}</strong>
        <span className="muted small">
          Rutina {session.position} de {total}
          {ms !== undefined && ` · ${humanDuration(ms)}`}
        </span>
      </span>
      <StatusBadge status={sessionStatus(session)} />
    </Link>
  );
}
