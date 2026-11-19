import { useState } from 'react';
import { Link } from 'react-router-dom';
import { dueRoutine, lastActivity, sessionsThisWeek, studentsOf, useDB } from '../../data/store';
import { dayOf, today } from '../../lib/dates';
import { useCurrentUser } from '../../session';

/** Calendar days since a timestamp: yesterday at 23:00 is 1, not 0. */
const daysSince = (iso?: string) => (iso ? Math.round((Date.parse(today()) - Date.parse(dayOf(iso))) / 86_400_000) : null);

/** Lowercase without accents, so "martin" finds "Martín". */
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function CoachHome() {
  const db = useDB();
  const coach = useCurrentUser();
  const [query, setQuery] = useState('');
  const q = fold(query.trim());
  // Whoever stopped training longest ago goes first; never registered counts as the longest.
  const students = studentsOf(db, coach.id)
    .map((s) => ({ s, idle: daysSince(lastActivity(db, s.id)) }))
    .filter(({ s }) => !q || fold(s.name).includes(q) || (s.dni ?? '').includes(q))
    .sort((a, b) => (b.idle ?? Infinity) - (a.idle ?? Infinity) || a.s.name.localeCompare(b.s.name));

  return (
    <div className="stack">
      <div className="row-between">
        <h1>Mis alumnos</h1>
        <div className="row">
          <Link to="/coach/qr" className="btn-link">QR</Link>
          <Link to="/coach/alumnos/nuevo" className="btn-link">+ Alumno</Link>
        </div>
      </div>
      <div className="row">
        <Link to="/coach/plantillas" className="btn btn-secondary grow">Mis rutinas</Link>
        <Link to="/coach/importar" className="btn btn-ghost grow">Importar CSV</Link>
      </div>
      <input type="search" value={query} placeholder="Buscar por nombre o DNI" aria-label="Buscar alumno" onChange={(e) => setQuery(e.target.value)} />
      {q && students.length === 0 && <p className="empty">Ningún alumno coincide con “{query.trim()}”.</p>}
      {students.map(({ s, idle }) => {
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
