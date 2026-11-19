# hackathon-gym-pain

Web responsive para que el coach cargue rutinas y el alumno las registre desde el celular.

Problema, solución y decisiones de diseño: [docs/producto.md](docs/producto.md).

```bash
npm install
npm run dev      # http://localhost:5173 (con --host, accesible desde el celular en la misma red)
npm run build
```

No hay registro: en la pantalla inicial elegís un usuario (coach o alumno) del seed en `src/data/seed.ts`.

## Estructura

```
src/
  types.ts                 modelo: User, RoutineTemplate (biblioteca), Routine (asignada), PlannedExercise (sugerido), ExerciseLog (lo que hizo)
  data/store.ts            persistencia + selectores + acciones (hoy localStorage; reemplazable por un backend)
  data/csv.ts              import de CSV / Google Sheets publicado
  data/seed.ts             usuarios y rutinas de ejemplo
  session.tsx              usuario actual + guard por rol
  components/              Layout, DayNav, Stepper, StatusBadge, ExerciseSummary, ExercisesEditor, AssignTemplateForm
  pages/Login.tsx
  pages/coach/             CoachHome, StudentWeek, AddRoutine, RoutineEditor, Templates, TemplateEditor, AssignTemplate, ImportCsv
  pages/student/           StudentDay, RoutineSession
```

## CSV

Una fila por ejercicio: `alumno,fecha,rutina,ejercicio,series,reps,peso`. Ejemplo en `public/rutinas-ejemplo.csv`.
Fecha `AAAA-MM-DD` o `DD/MM/AAAA`. El alumno se busca por nombre o id.
