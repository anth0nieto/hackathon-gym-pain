import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { useGym } from '../../session';

/** The QR posted at the coach's current gym. It opens the app with the gym's name; each student then enters with their DNI. */
export function GymQr() {
  const { gym } = useGym();
  const [base, setBase] = useState(`${window.location.origin}/`);
  const url = `${base.replace(/\/?$/, '/')}?gym=${gym!.id}`;
  const [svg, setSvg] = useState('');
  const isLocal = /localhost|127\.0\.0\.1/.test(url);

  useEffect(() => {
    QRCode.toString(url, { type: 'svg', margin: 1 }).then(setSvg).catch(() => setSvg(''));
  }, [url]);

  return (
    <div className="stack">
      <Link to="/coach" className="btn-link no-print">‹ Alumnos</Link>
      <h1 className="no-print">QR de {gym!.name}</h1>
      <p className="muted no-print">Imprimilo y pegalo en el gimnasio. Es el mismo para todos: cada alumno lo escanea y entra con su DNI.</p>

      <label className="field no-print">
        <span>Dirección de la app</span>
        <input value={base} onChange={(e) => setBase(e.target.value)} />
      </label>
      {isLocal && (
        <p className="notice no-print">
          Esta dirección solo funciona en esta compu. Para probar desde el celular, usá la dirección de red (por ejemplo http://10.18.0.225:5173/) o la de la app publicada.
        </p>
      )}

      <section className="card qr-sheet stack-sm">
        <picture>
          <source srcSet="/brand/forza-logo-dark.svg" media="screen and (prefers-color-scheme: dark)" />
          <img className="qr-logo" src="/brand/forza-logo-light.svg" alt="Forza" />
        </picture>
        <h2>{gym!.name}</h2>
        <p>Registrá tu entrenamiento</p>
        <div className="qr" aria-label={`Código QR para ${url}`} dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="muted">Escaneá el código y entrá con tu DNI</p>
      </section>

      <button className="btn btn-block no-print" disabled={!svg} onClick={() => window.print()}>Imprimir</button>
    </div>
  );
}
