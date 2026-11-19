import { Link, Navigate, useParams } from 'react-router-dom';
import { DayNav } from '../../components/DayNav';
import { ExerciseSummary } from '../../components/ExerciseSummary';
import { StatusBadge } from '../../components/StatusBadge';
import { copyPreviousWeek, getUser, logFor, routineStatus, routinesOn, useDB } from '../../data/store';
import { formatDay, today, weekDays } from '../../lib/dates';
import { useDateParam } from '../../lib/useDateParam';
import { useCurrentUser } from '../../session';

export function StudentWeek() {
  const db = useDB();
  const coach = useCurrentUser();
  const { studentId } = useParams();
  const [date, setDate] = useDateParam('semana');
  const student = getUser(db, studentId);
  if (!student || student.coachId !== coach.id) return <Navigate to="/coach" replace />;

  const days = weekDays(date);
  const hasRoutines = days.some((d) => routinesOn(db, student.id, d).length);

  const copy = () => {
    const n = copyPreviousWeek(student.id, date);
    if (!n) alert('La semana anterior no tiene rutinas.');
  };

  return (
    <div className="stack">
      <Link to="/coach" className="btn-link">‹ Alumnos</Link>
      <h1>{student.name}</h1>
      <DayNav date={date} onChange={setDate} mode="week" />
      {!hasRoutines && (
        <button className="btn btn-block btn-secondary" onClick={copy}>Copiar rutinas de la semana anterior</button>
      )}
      {days.map((d) => (
        <section key={d} className={`day ${d === today() ? 'is-today' : ''}`}>
          <div className="row-between">
            <h2 className="day-title">{formatDay(d)}</h2>
            <Link to={`/coach/alumno/${student.id}/rutina/agregar?fecha=${d}`} className="btn-link">+ Rutina</Link>
          </div>
          {routinesOn(db, student.id, d).map((r) => (
            <article key={r.id} className="card stack-sm">
              <div className="row-between">
                <h3>{r.name}</h3>
                <div className="row">
                  <StatusBadge status={routineStatus(db, r)} />
                  <Link to={`/coach/rutina/${r.id}`} className="btn-link">Editar</Link>
                </div>
              </div>
              <ul className="exsum-list">
                {r.exercises.map((e) => <ExerciseSummary key={e.id} exercise={e} log={logFor(db, r.id, e.id)} />)}
              </ul>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
