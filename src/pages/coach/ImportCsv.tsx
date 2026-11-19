import { useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { CSV_COLUMNS, OPTIONAL_COLUMNS, parseRoutinesCsv, type CsvResult } from '../../data/csv';
import { getUser, replaceRoutines, studentsOf, useDB } from '../../data/store';
import { useCurrentUser, useGym } from '../../session';

export function ImportCsv() {
  const db = useDB();
  const coach = useCurrentUser();
  const { gym } = useGym();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<CsvResult | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const parse = (text: string) => {
    setDone(false);
    setResult(parseRoutinesCsv(text, coach.id, gym!.id, studentsOf(db, coach.id)));
  };

  const nameOf = (id: string) => getUser(db, id)?.name ?? result?.newStudents.find((s) => s.id === id)?.name;

  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);

  const fromFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      setResult({ routines: [], newStudents: [], errors: [`"${file.name}" no es un CSV. En Sheets usá Archivo → Descargar → Valores separados por comas (.csv).`] });
      return;
    }
    parse(await file.text());
  };

  const failed = !!result && result.routines.length === 0 && result.errors.length > 0;

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void fromFile(e.dataTransfer.files[0]);
  };

  const fromUrl = async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      parse(await res.text());
    } catch {
      setResult({ routines: [], newStudents: [], errors: ['No pude leer esa URL. En Sheets usá Archivo → Compartir → Publicar en la web → CSV, o descargá el archivo y subilo.'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <Link to="/coach" className="btn-link">‹ Alumnos</Link>
      <h1>Importar rutinas</h1>
      <p className="muted">
        Traé tus alumnos y sus rutinas desde Google Sheets: exportá la planilla como CSV y subila acá.{' '}
        <a href="/rutinas-ejemplo.csv" download>Bajar ejemplo</a> · <a href="/planilla-coach-demo.csv" download>Bajar planilla de demo (24 alumnos)</a>
      </p>
      <details className="card">
        <summary>Formato del CSV</summary>
        <div className="stack-sm small muted">
          <p>Columnas: <code>{CSV_COLUMNS.join(', ')}</code>, y opcionales <code>{OPTIONAL_COLUMNS.join(', ')}</code>. Una fila por ejercicio.</p>
          <p>Con el DNI, los alumnos que todavía no están en la app se crean al importar.</p>
          <p>Las filas con el mismo alumno y rutina forman una rutina, y el orden en que aparecen define si es la 1, la 2 o la 3. Importar reemplaza las rutinas que ese alumno tenía.</p>
          <p>Cada ejercicio tiene que estar en la <Link to="/coach/ejercicios">lista de ejercicios</Link>.</p>
        </div>
      </details>

      <label
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${fileName ? (failed ? 'has-error' : 'has-file') : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept=".csv,text/csv"
          className="visually-hidden"
          onChange={(e) => { void fromFile(e.target.files?.[0]); e.target.value = ''; }}
        />
        <span className="dropzone-icon" aria-hidden="true">{!fileName ? '↑' : failed ? '!' : '✓'}</span>
        {fileName ? (
          <>
            <strong>{fileName}</strong>
            <span className="muted small">Hacé click o soltá otro archivo para cambiarlo</span>
          </>
        ) : (
          <>
            <strong>{dragging ? 'Soltalo acá' : 'Arrastrá tu CSV acá'}</strong>
            <span className="muted small">o hacé click para elegirlo</span>
          </>
        )}
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
          {result.newStudents.length > 0 && !done && (
            <div className="card stack-sm">
              <strong>Se van a crear {result.newStudents.length} alumno{result.newStudents.length === 1 ? '' : 's'}</strong>
              <p className="muted small">{result.newStudents.map((s) => `${s.name} (DNI ${s.dni}, ${s.daysPerWeek} días)`).join(' · ')}</p>
            </div>
          )}
          {result.routines.length > 0 && !done && (
            <button className="btn btn-block" onClick={() => { replaceRoutines(result.routines, result.newStudents); setDone(true); }}>
              Importar {result.routines.length} rutina{result.routines.length === 1 ? '' : 's'}
              {result.newStudents.length ? ` y crear ${result.newStudents.length} alumno${result.newStudents.length === 1 ? '' : 's'}` : ''}
            </button>
          )}
          {done && (
            <p className="notice ok">
              Listo: {result.routines.length} rutinas importadas{result.newStudents.length ? ` y ${result.newStudents.length} alumnos creados` : ''}. <Link to="/coach">Ver alumnos</Link>
            </p>
          )}
          {result.routines.map((r) => (
            <div key={r.id} className="card">
              <strong>{nameOf(r.studentId)}</strong> · Rutina {r.position} · {r.name}
              <p className="muted small">{r.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(' · ')}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
