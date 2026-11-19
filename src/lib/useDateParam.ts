import { useSearchParams } from 'react-router-dom';
import { isValidISO, today } from './dates';

export function useDateParam(name = 'fecha'): [string, (d: string) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get(name);
  const date = raw && isValidISO(raw) ? raw : today();
  const setDate = (d: string) => setParams((p) => { p.set(name, d); return p; }, { replace: true });
  return [date, setDate];
}
