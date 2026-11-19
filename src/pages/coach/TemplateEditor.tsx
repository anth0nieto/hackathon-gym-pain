import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { blankExercise, ExercisesEditor, exercisesValid, trimExercises } from '../../components/ExercisesEditor';
import { deleteTemplate, saveTemplate, useDB } from '../../data/store';
import { uid } from '../../lib/id';
import { useCurrentUser } from '../../session';
import type { RoutineTemplate } from '../../types';

export function TemplateEditor() {
  const db = useDB();
  const coach = useCurrentUser();
  const { templateId } = useParams();
  const existing = db.templates.find((t) => t.id === templateId && t.coachId === coach.id);
  if (templateId && !existing) return <Navigate to="/coach/plantillas" replace />;

  return (
    <TemplateForm
      key={existing?.id ?? 'new'}
      initial={existing ?? { id: uid(), coachId: coach.id, name: '', exercises: [blankExercise()] }}
      isNew={!existing}
    />
  );
}

function TemplateForm({ initial, isNew }: { initial: RoutineTemplate; isNew: boolean }) {
  const navigate = useNavigate();
  const [template, setTemplate] = useState(initial);
  const back = () => navigate('/coach/plantillas');
  const valid = template.name.trim() && exercisesValid(template.exercises);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    saveTemplate({ ...template, name: template.name.trim(), exercises: trimExercises(template.exercises) });
    back();
  };

  return (
    <form className="stack" onSubmit={submit}>
      <button type="button" className="btn-link" onClick={back}>‹ Mis rutinas</button>
      <h1>{isNew ? 'Nueva rutina' : 'Editar rutina'}</h1>
      {!isNew && <p className="muted small">Los cambios aplican a las próximas asignaciones; las ya asignadas no cambian.</p>}
      <label className="field">
        <span>Nombre</span>
        <input value={template.name} placeholder="Ej: Principiante - Full body" onChange={(e) => setTemplate({ ...template, name: e.target.value })} required />
      </label>
      <ExercisesEditor value={template.exercises} onChange={(exercises) => setTemplate({ ...template, exercises })} />
      <button type="submit" className="btn btn-block" disabled={!valid}>Guardar</button>
      {!isNew && (
        <button type="button" className="btn-link danger" onClick={() => { if (confirm('¿Borrar esta rutina de tu biblioteca?')) { deleteTemplate(template.id); back(); } }}>
          Borrar
        </button>
      )}
    </form>
  );
}
