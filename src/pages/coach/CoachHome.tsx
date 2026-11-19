import { Link } from 'react-router-dom';
import { dueRoutine, lastActivity, sessionsThisWeek, studentsOf, useDB } from '../../data/store';
import { useCurrentUser } from '../../session';

const daysSince = (iso?: string) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : null);

export function CoachHome() {
  const db = useDB();
  const coach = useCurrentUser();
  const students = studentsOf(db, coach.id);

  return (
    <div className="stack">
      <div className="row-between">
        <h1>Mis alumnos</h1>
        <Link to="/coach/alumnos/nuevo" className="btn-link">+ Alumno</Link>
      </div>
      <div className="row">
        <Link to="/coach/plantillas" className="btn btn-secondary grow">Mis rutinas</Link>
        <Link to="/coach/importar" className="btn btn-ghost grow">Importar CSV</Link>
      </div>
      {students.map((s) => {
        const idle = daysSince(lastActivity(db, s.id));
        const due = dueRoutine(db, s.id);
        return (
          <Link key={s.id} to={`/coach/alumno/${s.id}`} className="card card-link stack-sm">
            <div className="row-between">
              <h2>{s.name}</h2>
              <span className={`small ${idle === null || idle > 3 ? 'warn' : 'muted'}`}>
                {idle === null ? 'Nunca registró' : idle === 0 ? 'Registró hoy' : `Último registro hace ${idle} d`}
              </span>
            </div>
            <div className="row-between small muted">
              <span>Esta semana: {sessionsThisWeek(db, s.id).length} de {s.daysPerWeek ?? '?'}</span>
              <span>{due ? `Le toca Rutina ${due.position}` : 'Sin rutinas'}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
