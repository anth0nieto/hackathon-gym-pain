import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { blankExercise, ExercisesEditor, exercisesValid, trimExercises } from '../../components/ExercisesEditor';
import { deleteRoutine, fromTemplate, getUser, nextPosition, saveRoutine, saveTemplate, templatesOf, useDB } from '../../data/store';
import { uid } from '../../lib/id';
import { useCurrentUser } from '../../session';
import type { Routine, RoutineTemplate } from '../../types';

export function RoutineEditor() {
  const db = useDB();
  const coach = useCurrentUser();
  const { routineId, studentId } = useParams();
  const existing = db.routines.find((r) => r.id === routineId && r.coachId === coach.id);
  const student = getUser(db, existing?.studentId ?? studentId);

  if ((routineId && !existing) || !student || student.coachId !== coach.id) return <Navigate to="/coach" replace />;

  return (
    <EditorForm
      key={existing?.id ?? 'new'}
      initial={
        existing ?? {
          id: uid(),
          coachId: coach.id,
          studentId: student.id,
          position: nextPosition(db, student.id),
          name: '',
          exercises: [blankExercise()],
        }
      }
      isNew={!existing}
      studentName={student.name}
      templates={templatesOf(db, coach.id)}
    />
  );
}

interface FormProps {
  initial: Routine;
  isNew: boolean;
  studentName: string;
  templates: RoutineTemplate[];
}

function EditorForm({ initial, isNew, studentName, templates }: FormProps) {
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine>(initial);
  const [alsoTemplate, setAlsoTemplate] = useState(false);
  const back = () => navigate(`/coach/alumno/${routine.studentId}`);

  const valid = routine.name.trim() && exercisesValid(routine.exercises);

  const loadTemplate = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template) setRoutine(fromTemplate(routine, template));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const name = routine.name.trim();
    const exercises = trimExercises(routine.exercises);
    let templateId = routine.templateId;
    if (alsoTemplate) {
      templateId = uid();
      saveTemplate({ id: templateId, coachId: routine.coachId, name, exercises: exercises.map((x) => ({ ...x, id: uid() })) });
    }
    saveRoutine({ ...routine, name, exercises, templateId });
    back();
  };

  return (
    <form className="stack" onSubmit={submit}>
      <button type="button" className="btn-link" onClick={back}>‹ {studentName}</button>
      <h1>{isNew ? 'Nueva' : 'Editar'} Rutina {routine.position}</h1>
      {!isNew && <p className="muted small">El historial del alumno no cambia: lo que ya registró queda como estaba.</p>}

      {templates.length > 0 && (
        <label className="field">
          <span>Reemplazar por una de Mis rutinas</span>
          <select value="" onChange={(e) => loadTemplate(e.target.value)}>
            <option value="">Elegir…</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      )}

      <label className="field">
        <span>Nombre</span>
        <input value={routine.name} placeholder="Ej: Piernas" onChange={(e) => setRoutine({ ...routine, name: e.target.value })} required />
      </label>

      <ExercisesEditor value={routine.exercises} onChange={(exercises) => setRoutine({ ...routine, exercises })} />

      <label className="check">
        <input type="checkbox" checked={alsoTemplate} onChange={(e) => setAlsoTemplate(e.target.checked)} />
        <span>Guardar también en Mis rutinas para reusarla</span>
      </label>

      <button type="submit" className="btn btn-block" disabled={!valid}>Guardar</button>
      {!isNew && (
        <button type="button" className="btn-link danger" onClick={() => { if (confirm('¿Borrar la rutina? Las siguientes se renumeran.')) { deleteRoutine(routine.id); back(); } }}>
          Borrar rutina
        </button>
      )}
    </form>
  );
}
