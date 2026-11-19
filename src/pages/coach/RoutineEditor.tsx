import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { blankExercise, ExercisesEditor, exercisesValid, trimExercises } from '../../components/ExercisesEditor';
import { deleteRoutine, getUser, logsOf, saveRoutine, saveTemplate, useDB } from '../../data/store';
import { isValidISO, today } from '../../lib/dates';
import { uid } from '../../lib/id';
import { useDateParam } from '../../lib/useDateParam';
import { useCurrentUser } from '../../session';
import type { Routine } from '../../types';

export function RoutineEditor() {
  const db = useDB();
  const coach = useCurrentUser();
  const { routineId, studentId } = useParams();
  const [dateParam] = useDateParam();
  const existing = db.routines.find((r) => r.id === routineId && r.coachId === coach.id);
  const student = getUser(db, existing?.studentId ?? studentId);

  if ((routineId && !existing) || !student || student.coachId !== coach.id) return <Navigate to="/coach" replace />;

  return (
    <EditorForm
      key={existing?.id ?? 'new'}
      initial={existing ?? { id: uid(), coachId: coach.id, studentId: student.id, date: dateParam, name: '', exercises: [blankExercise()] }}
      isNew={!existing}
      studentName={student.name}
      hasLogs={!!existing && logsOf(db, existing.id).length > 0}
    />
  );
}

function EditorForm({ initial, isNew, studentName, hasLogs }: { initial: Routine; isNew: boolean; studentName: string; hasLogs: boolean }) {
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine>(initial);
  const [alsoTemplate, setAlsoTemplate] = useState(false);
  const back = () => navigate(`/coach/alumno/${routine.studentId}?semana=${routine.date}`);

  const valid = routine.name.trim() && isValidISO(routine.date) && exercisesValid(routine.exercises);

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
      <h1>{isNew ? 'Nueva rutina' : 'Editar rutina'}</h1>
      {hasLogs && <p className="notice">El alumno ya registró esta rutina. Si borrás un ejercicio, se pierde su registro.</p>}
      {routine.templateId && !isNew && (
        <p className="muted small">Los cambios afectan solo a esta rutina de {studentName}, no a la plantilla.</p>
      )}

      <label className="field">
        <span>Nombre</span>
        <input value={routine.name} placeholder="Ej: Día A - Piernas" onChange={(e) => setRoutine({ ...routine, name: e.target.value })} required />
      </label>
      <label className="field">
        <span>Fecha</span>
        <input type="date" value={routine.date} min={isNew ? today() : undefined} onChange={(e) => setRoutine({ ...routine, date: e.target.value })} required />
      </label>

      <ExercisesEditor value={routine.exercises} onChange={(exercises) => setRoutine({ ...routine, exercises })} />

      <label className="check">
        <input type="checkbox" checked={alsoTemplate} onChange={(e) => setAlsoTemplate(e.target.checked)} />
        <span>Guardar también en Mis rutinas para reusarla</span>
      </label>

      <button type="submit" className="btn btn-block" disabled={!valid}>Guardar</button>
      {!isNew && (
        <button type="button" className="btn-link danger" onClick={() => { if (confirm('¿Borrar la rutina?')) { deleteRoutine(routine.id); back(); } }}>
          Borrar rutina
        </button>
      )}
    </form>
  );
}
