import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ExercisesEditor, exercisesValid, trimExercises } from '../../components/ExercisesEditor';
import { customizeNext, getUser, openSession, plannedExercises, useDB } from '../../data/store';
import { useCurrentUser } from '../../session';
import type { PlannedExercise } from '../../types';

/** Changes a routine's exercises for one day only: today's session if it started, otherwise the next time. */
export function OneOffEditor() {
  const db = useDB();
  const coach = useCurrentUser();
  const { routineId } = useParams();
  const routine = db.routines.find((r) => r.id === routineId && r.coachId === coach.id);
  if (!routine) return <Navigate to="/coach" replace />;

  const open = openSession(db, routine.studentId);
  const today = open?.routineId === routine.id ? open : undefined;
  return (
    <Form
      key={routine.id}
      initial={today?.exercises ?? plannedExercises(routine)}
      routineId={routine.id}
      studentId={routine.studentId}
      title={`Rutina ${routine.position} · ${routine.name}`}
      studentName={getUser(db, routine.studentId)?.name ?? ''}
      forToday={!!today}
    />
  );
}

interface FormProps {
  initial: PlannedExercise[];
  routineId: string;
  studentId: string;
  title: string;
  studentName: string;
  forToday: boolean;
}

function Form({ initial, routineId, studentId, title, studentName, forToday }: FormProps) {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState(initial);
  const back = () => navigate(`/coach/alumno/${studentId}`);

  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); customizeNext(routineId, trimExercises(exercises)); back(); }}>
      <button type="button" className="btn-link" onClick={back}>‹ {studentName}</button>
      <h1>Cambiar solo {forToday ? 'hoy' : 'la próxima vez'}</h1>
      <p className="muted">
        {title}. {forToday ? `${studentName} ya empezó esta rutina: el cambio vale para la sesión de hoy.` : `Vale solo para la próxima vez que ${studentName} haga esta rutina.`}{' '}
        La rutina no cambia.
      </p>
      <ExercisesEditor value={exercises} onChange={setExercises} />
      <button type="submit" className="btn btn-block" disabled={!exercisesValid(exercises)}>Guardar cambio</button>
    </form>
  );
}
