# Back: funciones de `src/data/store.ts`

Las pantallas no llaman a Supabase directamente. Todo pasa por `src/data/store.ts`. Al arrancar, la app carga la base completa en memoria (`loadDB` en `src/main.tsx`). Los selectores leen esa copia y son sincrónicos. Las acciones actualizan la copia, la pantalla se redibuja enseguida, y después escriben en Supabase. Si otro dispositivo cambia algo, la copia se actualiza sola.

El esquema de la base está en `supabase/schema.sql`. Para levantar la app hace falta `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Leer datos

Los selectores reciben la base actual, que se obtiene con el hook `useDB()`:

```tsx
const db = useDB();
const rutinas = routinesOn(db, user.id, today());
```

| Selector | Devuelve |
|---|---|
| `studentByDni(db, dni)` | El alumno con ese DNI, o `undefined`. Acepta el DNI con puntos o espacios. |
| `getUser(db, id)` | El usuario con ese id |
| `studentsOf(db, coachId)` | Los alumnos de un coach |
| `routinesOn(db, studentId, date)` | Las rutinas de un alumno en una fecha `AAAA-MM-DD` |
| `logsOf(db, routineId)` | Lo registrado en una rutina |
| `logFor(db, routineId, exerciseId)` | Lo registrado en un ejercicio, o `undefined` |
| `routineStatus(db, routine)` | `'pending'`, `'partial'`, `'complete'` o `'skipped'` |
| `lastActivity(db, studentId)` | Fecha ISO del último registro del alumno, o `undefined` |
| `templatesOf(db, coachId)` | La biblioteca "Mis rutinas" del coach, ordenada por nombre |
| `normalizeDni(dni)` | El DNI con solo dígitos |

## Acciones del alumno

| Acción | Qué hace |
|---|---|
| `saveLog(routineId, exerciseId, status, { sets, reps, weight })` | Guarda un ejercicio como `'done'` o `'skipped'`. Si ya estaba guardado, lo reemplaza. |
| `clearLog(routineId, exerciseId)` | Borra lo guardado de un ejercicio |
| `skipRoutine(routine)` | Marca todos los ejercicios de la rutina como salteados |

## Acciones del coach

| Acción | Qué hace |
|---|---|
| `saveStudent({ id?, name, dni, coachId })` | Crea un alumno, o lo actualiza si recibe `id`. Devuelve `'dni-taken'` sin guardar si otro usuario ya tiene ese DNI. Si no, devuelve `'ok'`. |
| `deleteStudent(id)` | Borra el alumno con sus rutinas y registros |
| `saveRoutine(routine)` | Crea o actualiza una rutina asignada. Borra los registros de los ejercicios que se quitaron. |
| `deleteRoutine(id)` | Borra una rutina y sus registros |
| `addRoutines(routines)` | Agrega varias rutinas de una vez, por ejemplo desde el CSV |
| `copyPreviousWeek(studentId, weekDate)` | Copia las rutinas de la semana anterior. Devuelve cuántas creó. |
| `saveTemplate(template)` / `deleteTemplate(id)` | Crea, actualiza o borra una rutina de la biblioteca |
| `assignTemplate(template, studentIds, date)` | Copia una rutina de la biblioteca a varios alumnos. Devuelve `{ created, skipped }`. |
| `resetDB()` | Borra todo y vuelve a cargar los datos de ejemplo |

## Login

| Rol | Cómo entra |
|---|---|
| Coach | Usuario `coach`, contraseña `coach123`. Están fijos en `src/pages/Login.tsx` y entran como el usuario `c1`. |
| Alumno | Con su DNI: `const s = studentByDni(db, dni); if (s) login(s.id);`. `login` viene de `useSession()`. |

DNIs de ejemplo:

| Alumno | DNI |
|---|---|
| Juan Pérez | 30111222 |
| Ana Gómez | 35333444 |
| Martín Ruiz | 40555666 |

## Errores

Si una escritura en Supabase falla, la app muestra "No se pudo guardar. Revisá la conexión y probá de nuevo." y vuelve a leer la base. Las acciones no devuelven el error a la pantalla.
