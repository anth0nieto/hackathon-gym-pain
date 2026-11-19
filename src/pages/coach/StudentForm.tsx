import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { deleteStudent, getUser, normalizeDni, saveStudent, useDB } from '../../data/store';
import { useCurrentUser } from '../../session';

export function StudentForm() {
  const db = useDB();
  const coach = useCurrentUser();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const existing = getUser(db, studentId);
  const [name, setName] = useState(existing?.name ?? '');
  const [dni, setDni] = useState(existing?.dni ?? '');
  const [dniTaken, setDniTaken] = useState(false);

  if (studentId && (!existing || existing.coachId !== coach.id)) return <Navigate to="/coach" replace />;

  const back = () => navigate(existing ? `/coach/alumno/${existing.id}` : '/coach');
  const valid = name.trim() && normalizeDni(dni).length >= 7;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const result = saveStudent({ id: existing?.id, name, dni, coachId: coach.id });
    setDniTaken(result === 'dni-taken');
    if (result === 'ok') back();
  };

  const remove = () => {
    if (!existing || !confirm(`¿Borrar a ${existing.name} con todas sus rutinas y registros?`)) return;
    deleteStudent(existing.id);
    navigate('/coach');
  };

  return (
    <form className="stack" onSubmit={submit}>
      <button type="button" className="btn-link" onClick={back}>‹ {existing ? existing.name : 'Alumnos'}</button>
      <h1>{existing ? 'Editar alumno' : 'Nuevo alumno'}</h1>
      <label className="field">
        <span>Nombre y apellido</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
      </label>
      <label className="field">
        <span>DNI</span>
        <input
          value={dni}
          inputMode="numeric"
          placeholder="Sin puntos"
          onChange={(e) => { setDni(e.target.value); setDniTaken(false); }}
          required
        />
      </label>
      {dniTaken && <p className="small warn">Ya hay un alumno con ese DNI.</p>}
      <p className="muted small">El alumno entra a la app con este DNI.</p>
      <button type="submit" className="btn btn-block" disabled={!valid}>Guardar</button>
      {existing && <button type="button" className="btn-link danger" onClick={remove}>Borrar alumno</button>}
    </form>
  );
}
