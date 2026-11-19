import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExerciseDemo } from '../../components/ExerciseDemo';
import '../../components/exercises.css';
import { getExercise } from '../../data/exercises';
import { LEVELS, planFor, type Level } from '../../data/plans';
import { assignPlan, getUser, routinesOf, studentsOf, useDB } from '../../data/store';
import { useCurrentUser } from '../../session';

const DAYS = [1, 2, 3, 4, 5, 6, 7];

/** Ready-made plans by level and gym days a week. `?alumno=<id>` opens it to assign one to that student. */
export function Plans() {
  const db = useDB();
  const coach = useCurrentUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const students = studentsOf(db, coach.id);
  const preset = getUser(db, params.get('alumno'));

  const [level, setLevel] = useState<Level>('principiante');
  const [days, setDays] = useState(preset?.daysPerWeek ?? 3);
  const [studentId, setStudentId] = useState(preset?.coachId === coach.id ? preset.id : '');

  const plan = planFor(level, days)!;
  const levelInfo = LEVELS.find((l) => l.id === level)!;
  const student = students.find((s) => s.id === studentId);

  const assign = () => {
    if (!student) return;
    const current = routinesOf(db, student.id).length;
    if (current && !confirm(`Reemplaza las ${current} rutinas actuales de ${student.name}. Su historial se mantiene. ¿Seguir?`)) return;
    assignPlan(plan, student.id);
    navigate(`/coach/alumno/${student.id}`);
  };

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 className="page-title">Planes</h1>
          <p className="muted">Rutinas listas según el nivel del alumno y los días que va por semana.</p>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Nivel">
        {LEVELS.map((l) => (
          <button key={l.id} type="button" className={`chip ${l.id === level ? 'is-active' : ''}`} aria-pressed={l.id === level} onClick={() => setLevel(l.id)}>
            {l.label}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="Días por semana">
        {DAYS.map((d) => (
          <button key={d} type="button" className={`chip ${d === days ? 'is-active' : ''}`} aria-pressed={d === days} onClick={() => setDays(d)}>
            {d} {d === 1 ? 'día' : 'días'}
          </button>
        ))}
      </div>
      <p className="muted small">{levelInfo.summary}</p>
      {plan.note && <p className="notice">{plan.note}</p>}

      <article className="card stack-sm">
        <h2>Asignar este plan</h2>
        <label className="field">
          Alumno
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Elegí un alumno</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.daysPerWeek ? ` · va ${s.daysPerWeek} ${s.daysPerWeek === 1 ? 'día' : 'días'}` : ''}
              </option>
            ))}
          </select>
        </label>
        {student?.daysPerWeek && student.daysPerWeek !== days && (
          <p className="notice">{student.name} va {student.daysPerWeek} días por semana y este plan es de {days}.</p>
        )}
        <p className="muted small">Reemplaza las rutinas del alumno por estas {plan.routines.length}. Los pesos arrancan en 0 para que los ajustes.</p>
        <button className="btn btn-block" disabled={!student} onClick={assign}>
          Asignar plan {levelInfo.label.toLowerCase()} de {days} {days === 1 ? 'día' : 'días'}
        </button>
      </article>

      {plan.routines.map((r, i) => (
        <article key={i} className="card stack-sm">
          <h3>Rutina {i + 1} · {r.name}</h3>
          {r.exercises.map((e, j) => {
            const ex = getExercise(e.exerciseId)!;
            return (
              <details key={j} className="plan-ex">
                <summary>
                  <img className="exthumb" src={ex.images[0]} alt="" loading="lazy" />
                  <span className="plan-ex-name">
                    <span>{ex.alias}</span>
                    <span className="muted small">{ex.name}</span>
                  </span>
                  <span className="plan-ex-sets">{e.sets}×{e.reps}</span>
                </summary>
                <ExerciseDemo exercise={ex} />
              </details>
            );
          })}
        </article>
      ))}
    </div>
  );
}
