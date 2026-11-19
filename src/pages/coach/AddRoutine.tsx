import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AssignTemplateForm } from '../../components/AssignTemplateForm';
import { getUser, useDB } from '../../data/store';
import { formatDay } from '../../lib/dates';
import { useDateParam } from '../../lib/useDateParam';
import { useCurrentUser } from '../../session';

/** "+ Rutina" on a day: create a new routine or assign one from the coach's library. */
export function AddRoutine() {
  const db = useDB();
  const coach = useCurrentUser();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [date] = useDateParam();
  const student = getUser(db, studentId);
  if (!student || student.coachId !== coach.id) return <Navigate to="/coach" replace />;

  return (
    <div className="stack">
      <Link to={`/coach/alumno/${student.id}?semana=${date}`} className="btn-link">‹ {student.name}</Link>
      <h1>Rutina para el {formatDay(date)}</h1>
      <Link to={`/coach/alumno/${student.id}/rutina/nueva?fecha=${date}`} className="btn btn-block btn-secondary">
        + Crear rutina nueva
      </Link>
      <div className="divider"><span>o asignar una de Mis rutinas</span></div>
      <AssignTemplateForm
        initialDate={date}
        initialStudentIds={[student.id]}
        onDone={(d) => navigate(`/coach/alumno/${student.id}?semana=${d}`)}
      />
    </div>
  );
}
