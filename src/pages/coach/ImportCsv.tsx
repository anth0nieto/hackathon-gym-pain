import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CSV_COLUMNS, parseRoutinesCsv, type CsvResult } from '../../data/csv';
import { getUser, replaceRoutines, studentsOf, useDB } from '../../data/store';
import { useCurrentUser } from '../../session';

export function ImportCsv() {
  const db = useDB();
  const coach = useCurrentUser();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<CsvResult | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const parse = (text: string) => {
    setDone(false);
    setResult(parseRoutinesCsv(text, coach.id, studentsOf(db, coach.id)));
  };

  const fromFile = async (file?: File) => file && parse(await file.text());

  const fromUrl = async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      parse(await res.text());
    } catch {
      setResult({ routines: [], errors: ['No pude leer esa URL. En Sheets usá Archivo → Compartir → Publicar en la web → CSV, o descargá el archivo y subilo.'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <Link to="/coach" className="btn-link">‹ Alumnos</Link>
      <h1>Importar rutinas</h1>
      <p className="muted">
        Columnas: <code>{CSV_COLUMNS.join(', ')}</code>. Una fila por ejercicio. Las filas con el mismo alumno y rutina forman una rutina, y el orden en que aparecen define si es la 1, la 2 o la 3. Importar reemplaza las rutinas que ese alumno tenía.{' '}
        <a href="/rutinas-ejemplo.csv" download>Bajar ejemplo</a>
      </p>

      <label className="field">
        <span>Archivo CSV</span>
        <input type="file" accept=".csv,text/csv" onChange={(e) => fromFile(e.target.files?.[0])} />
      </label>
      <div className="field">
        <span>…o URL de Google Sheets publicada como CSV</span>
        <div className="row">
          <input className="grow" value={url} placeholder="https://docs.google.com/…/pub?output=csv" onChange={(e) => setUrl(e.target.value)} />
          <button className="btn" disabled={!url || loading} onClick={fromUrl}>{loading ? '…' : 'Leer'}</button>
        </div>
      </div>

      {result && (
        <section className="stack-sm">
          {result.errors.map((e) => <p key={e} className="notice danger">{e}</p>)}
          {result.routines.map((r) => (
            <div key={r.id} className="card">
              <strong>{getUser(db, r.studentId)?.name}</strong> · Rutina {r.position} · {r.name}
              <p className="muted small">{r.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(' · ')}</p>
            </div>
          ))}
          {result.routines.length > 0 && !done && (
            <button className="btn btn-block" onClick={() => { replaceRoutines(result.routines); setDone(true); }}>
              Importar {result.routines.length} rutina{result.routines.length === 1 ? '' : 's'}
            </button>
          )}
          {done && <p className="notice ok">Listo, rutinas importadas.</p>}
        </section>
      )}
    </div>
  );
}
