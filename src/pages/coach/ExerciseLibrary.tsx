import { ExerciseDemo } from '../../components/ExerciseDemo';
import { EXERCISES, MUSCLES } from '../../data/exercises';

export function ExerciseLibrary() {
  return (
    <div className="stack page-wide">
      <div className="page-head">
        <div>
          <h1 className="page-title">Ejercicios</h1>
          <p className="muted">Los {EXERCISES.length} ejercicios de los planes, con cómo se hace cada uno. Los alumnos ven lo mismo al entrenar.</p>
        </div>
      </div>
      {MUSCLES.map((muscle) => (
        <section key={muscle} className="stack-sm">
          <h2>{muscle}</h2>
          <div className="exlib-grid">
            {EXERCISES.filter((e) => e.muscle === muscle).map((e) => (
              <article key={e.id} className="card stack-sm">
                <div>
                  <h3>{e.alias}</h3>
                  <p className="muted small">{e.name}</p>
                </div>
                <ExerciseDemo exercise={e} />
              </article>
            ))}
          </div>
        </section>
      ))}
      <p className="muted small">
        Fotos de <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">free-exercise-db</a> (dominio público).
      </p>
    </div>
  );
}
