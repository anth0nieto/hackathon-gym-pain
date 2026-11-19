import { useState } from 'react';
import { assignTemplate, studentsOf, templatesOf, useDB } from '../data/store';
import { fold } from '../lib/text';
import { useCurrentUser } from '../session';

const PAGE_SIZE = 8;

interface Props {
  initialTemplateId?: string;
  initialStudentIds?: string[];
  onDone: () => void;
}

export function AssignTemplateForm({ initialTemplateId, initialStudentIds = [], onDone }: Props) {
  const db = useDB();
  const coach = useCurrentUser();
  const templates = templatesOf(db, coach.id);
  const [templateId, setTemplateId] = useState(initialTemplateId ?? '');
  const [selected, setSelected] = useState(new Set(initialStudentIds));
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  // The student the coach came from goes first; the order doesn't change as boxes get ticked.
  const preselected = new Set(initialStudentIds);
  const q = fold(query.trim());
  const students = studentsOf(db, coach.id)
    .filter((s) => !q || fold(s.name).includes(q) || (s.dni ?? '').includes(q))
    .sort((a, b) => Number(preselected.has(b.id)) - Number(preselected.has(a.id)) || a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = students.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const template = templates.find((t) => t.id === templateId);
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allSelected = students.length > 0 && students.every((s) => selected.has(s.id));
  const toggleAll = () =>
    setSelected((sel) => {
      const next = new Set(sel);
      students.forEach((s) => (allSelected ? next.delete(s.id) : next.add(s.id)));
      return next;
    });

  const submit = () => {
    if (!template) return;
    assignTemplate(template, [...selected]);
    onDone();
  };

  if (templates.length === 0) return <p className="empty">No tenés rutinas guardadas todavía.</p>;

  return (
    <div className="stack">
      {!initialTemplateId && (
        <div className="stack-sm">
          {templates.map((t) => (
            <label key={t.id} className={`card choice ${t.id === templateId ? 'is-selected' : ''}`}>
              <input type="radio" name="template" checked={t.id === templateId} onChange={() => setTemplateId(t.id)} />
              <div>
                <strong>{t.name}</strong>
                <p className="muted small">{t.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(' · ')}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      <p className="muted small">Se agrega como la próxima rutina de cada alumno, después de las que ya tiene.</p>

      <div className="stack-sm">
        <div className="row-between">
          <h2>Alumnos <span className="muted small">· {selected.size} elegido{selected.size === 1 ? '' : 's'}</span></h2>
          <button type="button" className="btn-link" disabled={students.length === 0} onClick={toggleAll}>
            {allSelected ? 'Ninguno' : q ? 'Todos los resultados' : 'Todos'}
          </button>
        </div>
        <input
          type="search"
          value={query}
          placeholder="Buscar por nombre o DNI"
          aria-label="Buscar alumno"
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        />
        {students.length === 0 && <p className="empty">Ningún alumno coincide.</p>}
        {shown.map((s) => (
          <label key={s.id} className="check card">
            <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
            <span className="grow">{s.name}</span>
            <span className="muted small">DNI {s.dni}</span>
          </label>
        ))}
        {pages > 1 && (
          <nav className="pager" aria-label="Páginas de alumnos">
            <span className="muted small">{current * PAGE_SIZE + 1}–{current * PAGE_SIZE + shown.length} de {students.length}</span>
            <div className="row">
              <button type="button" className="chip" disabled={current === 0} onClick={() => setPage(current - 1)}>‹ Anterior</button>
              <button type="button" className="chip" disabled={current === pages - 1} onClick={() => setPage(current + 1)}>Siguiente ›</button>
            </div>
          </nav>
        )}
      </div>

      <div className="sticky-actions">
        <button className="btn btn-block" disabled={!template || selected.size === 0} onClick={submit}>
          {!template
            ? 'Elegí una rutina'
            : `Asignar “${template.name}”${selected.size ? ` a ${selected.size} alumno${selected.size === 1 ? '' : 's'}` : ''}`}
        </button>
      </div>
    </div>
  );
}
