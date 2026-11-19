import { Link } from 'react-router-dom';
import { StatusDot } from '../../components/StatusBadge';
import { lastActivity, routineStatus, routinesOn, studentsOf, useDB } from '../../data/store';
import { formatShort, today, weekDays } from '../../lib/dates';
import { useCurrentUser } from '../../session';

const daysSince = (iso?: string) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : null);

export function CoachHome() {
  const db = useDB();
  const coach = useCurrentUser();
  const days = weekDays(today());
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
        return (
          <Link key={s.id} to={`/coach/alumno/${s.id}`} className="card card-link stack-sm">
            <div className="row-between">
              <h2>{s.name}</h2>
              <span className={`small ${idle === null || idle > 3 ? 'warn' : 'muted'}`}>
                {idle === null ? 'Nunca registró' : idle === 0 ? 'Registró hoy' : `Último registro hace ${idle} d`}
              </span>
            </div>
            <div className="week-dots">
              {days.map((d) => {
                const rs = routinesOn(db, s.id, d);
                const st = rs.length ? routineStatus(db, rs[0]) : 'none';
                return (
                  <div key={d} className="week-dot">
                    <StatusDot status={st} title={rs.map((r) => r.name).join(', ')} />
                    <span className="small muted">{formatShort(d).slice(0, 2)}</span>
                  </div>
                );
              })}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
