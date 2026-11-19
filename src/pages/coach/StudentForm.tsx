import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { deleteStudent, getUser, normalizeDni, saveStudent, useDB } from '../../data/store';
import { uid } from '../../lib/id';
import { isValidPhone, normalizePhone } from '../../lib/phone';
import { useCurrentUser, useGym } from '../../session';

export function StudentForm() {
  const db = useDB();
  const coach = useCurrentUser();
  const { gym } = useGym();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const existing = getUser(db, studentId);
  const [name, setName] = useState(existing?.name ?? '');
  const [dni, setDni] = useState(existing?.dni ?? '');
  const [days, setDays] = useState(existing?.daysPerWeek ?? 3);
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [dniTaken, setDniTaken] = useState(false);

  if (studentId && (!existing || existing.coachId !== coach.id)) return <Navigate to="/coach" replace />;

  const back = () => navigate(existing ? `/coach/alumno/${existing.id}` : '/coach');
  const phoneOk = !phone.trim() || isValidPhone(normalizePhone(phone));
  const valid = name.trim() && normalizeDni(dni).length >= 7 && days >= 1 && days <= 7 && phoneOk;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const id = existing?.id ?? uid();
    const result = saveStudent({ id, name, dni, daysPerWeek: days, coachId: coach.id, gymId: existing?.gymId ?? gym!.id, phone });
    setDniTaken(result === 'dni-taken');
    if (result === 'ok') navigate(`/coach/alumno/${id}`);
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
      <label className="field">
        <span>Teléfono (WhatsApp, opcional)</span>
        <input value={phone} type="tel" inputMode="tel" autoComplete="off" placeholder="11 2233 4455" onChange={(e) => setPhone(e.target.value)} />
      </label>
      {!phoneOk && <p className="small warn">Ese teléfono no parece válido. Probá con el código de área, por ejemplo 11 2233 4455.</p>}
      <label className="field">
        <span>Días por semana que entrena</span>
        <input type="number" inputMode="numeric" min={1} max={7} value={days} onChange={(e) => setDays(Number(e.target.value))} required />
      </label>
      {dniTaken && <p className="small warn">Ya hay un alumno con ese DNI.</p>}
      <p className="muted small">El alumno entra a la app con este DNI. Los días por semana definen cuántas rutinas le armás.</p>
      <button type="submit" className="btn btn-block" disabled={!valid}>Guardar</button>
      {existing && <button type="button" className="btn-link danger" onClick={remove}>Borrar alumno</button>}
    </form>
  );
}
