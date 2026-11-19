import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AssignTemplateForm } from '../../components/AssignTemplateForm';
import { useDB } from '../../data/store';
import { useCurrentUser } from '../../session';

export function AssignTemplate() {
  const db = useDB();
  const coach = useCurrentUser();
  const navigate = useNavigate();
  const { templateId } = useParams();
  const template = db.templates.find((t) => t.id === templateId && t.coachId === coach.id);
  if (!template) return <Navigate to="/coach/plantillas" replace />;

  return (
    <div className="stack">
      <Link to="/coach/plantillas" className="btn-link">‹ Mis rutinas</Link>
      <h1>Asignar “{template.name}”</h1>
      <AssignTemplateForm initialTemplateId={template.id} onDone={() => navigate('/coach')} />
    </div>
  );
}
