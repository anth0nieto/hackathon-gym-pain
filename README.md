# hackathon-gym-pain

Web responsive para que el coach cargue rutinas y el alumno las registre desde el celular.

Problema, solución y decisiones de diseño: [docs/producto.md](docs/producto.md). Funciones del back para las pantallas: [docs/back.md](docs/back.md).

Antes de levantarla, copiá `.env.example` a `.env.local` y completá la URL y la clave publishable de Supabase. Pedíselas a Anthony.

```bash
npm install
npm run dev      # http://localhost:5173 (con --host, accesible desde el celular en la misma red)
npm run build
```

No hay registro. El coach entra con usuario `coach` y contraseña `coach123`, fijos en `src/pages/Login.tsx`. El alumno elige su usuario de la lista. Si la base está vacía, la app la llena con el seed de `src/data/seed.ts`.

## Estructura

```
src/
  types.ts                 modelo: User, RoutineTemplate (biblioteca), Routine (asignada), PlannedExercise (sugerido), ExerciseLog (lo que hizo)
  data/store.ts            Supabase + selectores + acciones (snapshot en memoria, escribe el diff y escucha cambios en tiempo real)
  data/csv.ts              import de CSV / Google Sheets publicado
  data/seed.ts             usuarios y rutinas de ejemplo
  session.tsx              usuario actual + guard por rol
  components/              Layout, DayNav, Stepper, StatusBadge, ExerciseSummary, ExercisesEditor, AssignTemplateForm
  pages/Login.tsx
  pages/coach/             CoachHome, StudentWeek, AddRoutine, RoutineEditor, Templates, TemplateEditor, AssignTemplate, ImportCsv
  pages/student/           StudentDay, RoutineSession
```

## Base de datos

Supabase. El esquema está en `supabase/schema.sql`. Las columnas usan camelCase para coincidir con `src/types.ts`. Las reglas de acceso dejan leer y escribir todo con la clave publishable, así que sirven solo para la demo.

## CSV

Una fila por ejercicio: `alumno,fecha,rutina,ejercicio,series,reps,peso`. Ejemplo en `public/rutinas-ejemplo.csv`.
Fecha `AAAA-MM-DD` o `DD/MM/AAAA`. El alumno se busca por nombre o id.
