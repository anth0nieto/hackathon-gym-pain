import { Link } from 'react-router-dom';
import { DayNav } from '../../components/DayNav';
import { StatusBadge } from '../../components/StatusBadge';
import { routineStatus, routinesOn, useDB } from '../../data/store';
import { useDateParam } from '../../lib/useDateParam';
import { useCurrentUser } from '../../session';

export function StudentDay() {
  const db = useDB();
  const user = useCurrentUser();
  const [date, setDate] = useDateParam();
  const routines = routinesOn(db, user.id, date);

  return (
    <div className="stack">
      <DayNav date={date} onChange={setDate} mode="day" />
      {routines.length === 0 && <p className="empty">No tenés rutina para este día. 🛋️</p>}
      {routines.map((r) => (
        <Link key={r.id} to={`/alumno/rutina/${r.id}`} className="card card-link">
          <div className="row-between">
            <h2>{r.name}</h2>
            <StatusBadge status={routineStatus(db, r)} />
          </div>
          <p className="muted">{r.exercises.map((e) => e.name).join(' · ')}</p>
        </Link>
      ))}
    </div>
  );
}
