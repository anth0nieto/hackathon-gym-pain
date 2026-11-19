import { useState } from 'react';
import { assignTemplate, studentsOf, templatesOf, useDB } from '../data/store';
import { useCurrentUser } from '../session';

interface Props {
  initialTemplateId?: string;
  initialStudentIds?: string[];
  onDone: () => void;
}

export function AssignTemplateForm({ initialTemplateId, initialStudentIds = [], onDone }: Props) {
  const db = useDB();
  const coach = useCurrentUser();
  const templates = templatesOf(db, coach.id);
  const students = studentsOf(db, coach.id);
  const [templateId, setTemplateId] = useState(initialTemplateId ?? '');
  const [selected, setSelected] = useState(new Set(initialStudentIds));

  const template = templates.find((t) => t.id === templateId);
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allSelected = selected.size === students.length;

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
          <h2>Alumnos</h2>
          <button type="button" className="btn-link" onClick={() => setSelected(allSelected ? new Set() : new Set(students.map((s) => s.id)))}>
            {allSelected ? 'Ninguno' : 'Todos'}
          </button>
        </div>
        {students.map((s) => (
          <label key={s.id} className="check card">
            <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
            <span>{s.name}</span>
          </label>
        ))}
      </div>

      <button className="btn btn-block" disabled={!template || selected.size === 0} onClick={submit}>
        Asignar{selected.size ? ` a ${selected.size} alumno${selected.size === 1 ? '' : 's'}` : ''}
      </button>
    </div>
  );
}
