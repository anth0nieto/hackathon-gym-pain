import { useState } from 'react';
import { assignTemplate, studentsOf, templatesOf, useDB } from '../data/store';
import { isValidISO } from '../lib/dates';
import { useCurrentUser } from '../session';

interface Props {
  initialDate: string;
  initialTemplateId?: string;
  initialStudentIds?: string[];
  onDone: (date: string) => void;
}

export function AssignTemplateForm({ initialDate, initialTemplateId, initialStudentIds = [], onDone }: Props) {
  const db = useDB();
  const coach = useCurrentUser();
  const templates = templatesOf(db, coach.id);
  const students = studentsOf(db, coach.id);
  const [templateId, setTemplateId] = useState(initialTemplateId ?? '');
  const [date, setDate] = useState(initialDate);
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
    const { skipped } = assignTemplate(template, [...selected], date);
    if (skipped) alert(`${skipped} alumno(s) ya tenían esta rutina ese día y no se duplicó.`);
    onDone(date);
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

      <label className="field">
        <span>Fecha</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

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

      <button className="btn btn-block" disabled={!template || selected.size === 0 || !isValidISO(date)} onClick={submit}>
        Asignar{selected.size ? ` a ${selected.size} alumno${selected.size === 1 ? '' : 's'}` : ''}
      </button>
    </div>
  );
}
