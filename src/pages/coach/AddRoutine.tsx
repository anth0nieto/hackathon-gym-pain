import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AssignTemplateForm } from '../../components/AssignTemplateForm';
import { getUser, nextPosition, useDB } from '../../data/store';
import { useCurrentUser } from '../../session';

/** "+ Rutina": create the student's next routine or copy one from the coach's library. */
export function AddRoutine() {
  const db = useDB();
  const coach = useCurrentUser();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const student = getUser(db, studentId);
  if (!student || student.coachId !== coach.id) return <Navigate to="/coach" replace />;

  return (
    <div className="stack">
      <Link to={`/coach/alumno/${student.id}`} className="btn-link">‹ {student.name}</Link>
      <h1>Rutina {nextPosition(db, student.id)} para {student.name}</h1>
      <Link to={`/coach/alumno/${student.id}/rutina/nueva`} className="btn btn-block btn-secondary">
        + Crear rutina nueva
      </Link>
      <div className="divider"><span>o asignar una de Mis rutinas</span></div>
      <AssignTemplateForm
        initialStudentIds={[student.id]}
        onDone={() => navigate(`/coach/alumno/${student.id}`)}
      />
    </div>
  );
}
