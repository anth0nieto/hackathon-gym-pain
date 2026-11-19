import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { activityOf, AWAY_DAYS, dueRoutine, routinesOf, sessionsThisWeek, stalledExercises, studentsOf, useDB, type ActivityStatus } from '../../data/store';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import { fold } from '../../lib/text';
import { useCurrentUser, useGym } from '../../session';
import type { User } from '../../types';
import { initials } from '../../lib/initials';



const STATUS: Record<ActivityStatus, { label: string; tone: string }> = {
  ok: { label: 'Al día', tone: 'ok' },
  risk: { label: 'En riesgo', tone: 'warn' },
  inactive: { label: 'Inactivo', tone: 'danger' },
  new: { label: 'Sin empezar', tone: 'neutral' },
};

const lastLabel = (idle: number | null) => (idle === null ? 'Nunca' : idle === 0 ? 'Hoy' : idle === 1 ? 'Ayer' : `Hace ${idle} días`);

type Filter = 'all' | 'risk' | 'ok' | 'stalled' | 'empty';

const PAGE_SIZE = 20;

export function CoachHome() {
  const db = useDB();
  const coach = useCurrentUser();
  const { gym } = useGym();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);

  // Whoever stopped training longest ago goes first; never registered counts as the longest.
  const rows = studentsOf(db, coach.id, gym?.id)
    .map((s) => ({
      s,
      activity: activityOf(db, s.id),
      week: sessionsThisWeek(db, s.id).length,
      due: dueRoutine(db, s.id),
      routines: routinesOf(db, s.id).length,
      stalled: stalledExercises(db, s.id).length > 0,
    }))
    .sort((a, b) => (b.activity.idleDays ?? Infinity) - (a.activity.idleDays ?? Infinity) || a.s.name.localeCompare(b.s.name));

  const matches: Record<Filter, (r: (typeof rows)[number]) => boolean> = {
    all: () => true,
    risk: (r) => r.activity.status === 'risk' || r.activity.status === 'inactive',
    ok: (r) => r.activity.status === 'ok',
    stalled: (r) => r.stalled,
    empty: (r) => r.routines === 0,
  };
  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'risk', label: 'En riesgo' },
    { key: 'ok', label: 'Al día' },
    { key: 'stalled', label: 'Mismos pesos' },
    { key: 'empty', label: 'Sin rutinas' },
  ];

  const q = fold(query.trim());
  const filtered = rows.filter(matches[filter]).filter(({ s }) => !q || fold(s.name).includes(q) || (s.dni ?? '').includes(q));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const open = (s: User) => navigate(`/coach/alumno/${s.id}`);
  const stalled = rows.filter((r) => r.stalled);
  // Already ordered by days without training, longest first.
  const away = rows.filter((r) => (r.activity.idleDays ?? -1) >= AWAY_DAYS);

  return (
    <div className="stack page-wide">
      <div className="page-head">
        <div>
          <p className="muted small">{rows.length} alumnos</p>
          <h1 className="page-title">Alumnos</h1>
        </div>
        <Link to="/coach/alumnos/nuevo" className="btn">+ Alumno</Link>
      </div>

      {away.length > 0 && (
        <p className="notice danger">
          <strong>{away.length === 1 ? '1 alumno no entrena' : `${away.length} alumnos no entrenan`} hace una semana o más.</strong>{' '}
          Escribiles antes de que dejen:{' '}
          {away.slice(0, 8).map(({ s, activity }, i) => (
            <span key={s.id}>
              {i > 0 && ', '}<Link to={`/coach/alumno/${s.id}`}>{s.name}</Link> ({activity.idleDays} días)
              <WhatsAppButton phone={s.phone} name={s.name} />
            </span>
          ))}
          {away.length > 8 && ` y ${away.length - 8} más.`}
        </p>
      )}

      {stalled.length > 0 && (
        <p className="notice">
          <strong>{stalled.length === 1 ? '1 alumno lleva' : `${stalled.length} alumnos llevan`} un mes o más levantando los mismos pesos.</strong>{' '}
          Revisá su rutina o subile los pesos:{' '}
          {stalled.map(({ s }, i) => (
            <span key={s.id}>{i > 0 && ', '}<Link to={`/coach/alumno/${s.id}?tab=progreso`}>{s.name}</Link></span>
          ))}
        </p>
      )}

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filtrar alumnos">
          {chips.map((c) => (
            <button key={c.key} className={`chip ${filter === c.key ? 'is-active' : ''}`} aria-pressed={filter === c.key} onClick={() => { setFilter(c.key); setPage(0); }}>
              {c.label} · {rows.filter(matches[c.key]).length}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="toolbar-search"
          value={query}
          placeholder="Buscar por nombre o DNI"
          aria-label="Buscar alumno"
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        />
      </div>

      {shown.length === 0 && <p className="empty">Ningún alumno coincide.</p>}

      {shown.length > 0 && (
        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Días/sem</th>
                <th>Esta semana</th>
                <th>Le toca</th>
                <th>Último registro</th>
                <th>Estado</th>
                <th aria-label="Contacto" />
              </tr>
            </thead>
            <tbody>
              {shown.map(({ s, activity, week, due, stalled }) => (
                <tr key={s.id} onClick={() => open(s)}>
                  <td>
                    <div className="person">
                      <span className="avatar" aria-hidden="true">{initials(s.name)}</span>
                      <div>
                        <Link to={`/coach/alumno/${s.id}`} className="person-name" onClick={(e) => e.stopPropagation()}>{s.name}</Link>
                        <span className="muted small">DNI {s.dni}</span>
                      </div>
                    </div>
                  </td>
                  <td>{s.daysPerWeek ?? '—'}</td>
                  <td>
                    <strong>{week}</strong> <span className="muted">de {s.daysPerWeek ?? '?'}</span>
                  </td>
                  <td>{due ? `Rutina ${due.position} · ${due.name}` : <span className="muted">Sin rutinas</span>}</td>
                  <td>{lastLabel(activity.idleDays)}</td>
                  <td>
                    <span className={`badge tone-${STATUS[activity.status].tone}`}>{STATUS[activity.status].label}</span>
                    {stalled && <> <span className="badge tone-warn" title="Hace un mes o más que levanta los mismos pesos">Mismos pesos</span></>}
                  </td>
                  <td className="cell-action"><WhatsAppButton phone={s.phone} name={s.name} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="table-cards">
            {shown.map(({ s, activity, week, due, stalled }) => (
              <li key={s.id} className="card stack-sm card-stretch">
                  <div className="row-between">
                    <div className="person">
                      <span className="avatar" aria-hidden="true">{initials(s.name)}</span>
                      <Link to={`/coach/alumno/${s.id}`} className="person-name stretched-link">{s.name}</Link>
                      <WhatsAppButton phone={s.phone} name={s.name} />
                    </div>
                    <span>
                      <span className={`badge tone-${STATUS[activity.status].tone}`}>{STATUS[activity.status].label}</span>
                      {stalled && <> <span className="badge tone-warn">Mismos pesos</span></>}
                    </span>
                  </div>
                  <div className="row-between small muted">
                    <span>Esta semana: {week} de {s.daysPerWeek ?? '?'} · {lastLabel(activity.idleDays)}</span>
                    <span>{due ? `Le toca Rutina ${due.position}` : 'Sin rutinas'}</span>
                  </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pages > 1 && (
        <nav className="pager" aria-label="Páginas">
          <span className="muted small">
            {current * PAGE_SIZE + 1}–{current * PAGE_SIZE + shown.length} de {filtered.length}
          </span>
          <div className="row">
            <button className="chip" disabled={current === 0} onClick={() => setPage(current - 1)}>‹ Anterior</button>
            <button className="chip" disabled={current === pages - 1} onClick={() => setPage(current + 1)}>Siguiente ›</button>
          </div>
        </nav>
      )}
    </div>
  );
}
