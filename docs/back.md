# Back: funciones de `src/data/store.ts`

Las pantallas no llaman a Supabase directamente. Todo pasa por `src/data/store.ts`. Al arrancar, la app carga la base completa en memoria (`loadDB` en `src/main.tsx`). Los selectores leen esa copia y son sincrónicos. Las acciones actualizan la copia, la pantalla se redibuja enseguida, y después escriben en Supabase de a una, en orden. Si otro dispositivo cambia algo, la copia se actualiza sola.

El esquema está en `supabase/schema.sql` y los tipos en `src/types.ts`. Las reglas de qué rutina le toca al alumno están en [producto.md](producto.md#cómo-se-decide-qué-rutina-le-toca). Para levantar la app hace falta `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Modelo

| Tabla | Qué guarda |
|---|---|
| `gyms` | Los gimnasios, que crea el admin |
| `users` | Coaches y alumnos. Los alumnos tienen `dni`, `daysPerWeek` y `gymId`, el gimnasio donde entrenan. Los coaches tienen `username`, `password` y `gymIds`, los gimnasios donde trabajan. |
| `templates` | La biblioteca "Mis rutinas" del coach |
| `routines` | Las rutinas de cada alumno, con `position` 1, 2, 3…, sus ejercicios sugeridos y `override`, los ejercicios de un cambio para la próxima vez |
| `sessions` | Cada vez que el alumno entrenó una rutina: `startedAt`, `finishedAt`, y una copia de `position`, `routineName` y los `exercises` planificados ese día |
| `logs` | Lo que hizo en cada ejercicio de una sesión, con una copia de `exerciseName` |

## Leer datos

Los selectores reciben la base actual, que se obtiene con el hook `useDB()`:

```tsx
const db = useDB();
const routine = dueRoutine(db, user.id);
```

| Selector | Devuelve |
|---|---|
| `plannedExercises(routine)` | Los ejercicios que el alumno tiene que hacer la próxima vez: el cambio del coach si hay, o los de la rutina. En una sesión ya empezada, usá `session.exercises`. |
| `dueRoutine(db, studentId)` | La rutina que le toca al alumno ahora, o `undefined` si no tiene rutinas |
| `openSession(db, studentId)` | Su sesión abierta, o `undefined` |
| `sessionStatus(session)` | `'open'` o `'done'`. Una sesión pasa a `'done'` al finalizarla o a las 6 horas de empezada (`AUTO_CLOSE_HOURS`). |
| `routinesOf(db, studentId)` | Sus rutinas ordenadas por `position` |
| `sessionsOf(db, studentId)` | Sus sesiones, de la más nueva a la más vieja |
| `getSession(db, id)` | Una sesión por id |
| `logsOf(db, sessionId)` | Lo registrado en una sesión |
| `logFor(db, sessionId, exerciseId)` | Lo registrado en un ejercicio de una sesión, o `undefined` |
| `sessionsThisWeek(db, studentId)` | Sesiones empezadas desde el lunes |
| `lastActivity(db, studentId)` | Fecha ISO de su último registro, o `undefined` |
| `studentByDni(db, dni)` | El alumno con ese DNI, o `undefined`. Acepta el DNI con puntos o espacios. |
| `getUser(db, id)` / `studentsOf(db, coachId, gymId?)` | Un usuario, o los alumnos de un coach. Con `gymId`, solo los de ese gimnasio. |
| `coaches(db)` / `gymsSorted(db)` / `gymsOf(db, coach)` | Los coaches, los gimnasios, o los gimnasios asignados a un coach, por nombre |
| `coachByLogin(db, username, password)` | El coach con ese usuario y contraseña, o `undefined` |
| `templatesOf(db, coachId)` | "Mis rutinas" del coach, ordenadas por nombre |
| `progressOf(db, studentId)` | Para cada ejercicio hecho, el peso de cada sesión, de la más vieja a la más nueva |
| `stalledExercises(db, studentId, days?)` | Los ejercicios en los que repite el mismo peso hace `STALL_DAYS` (30) días o más, con el peso y desde cuándo. No cuenta los de 0 kg. |
| `nextPosition(db, studentId)` | El número que tendría una rutina nueva del alumno |

## Acciones del alumno

| Acción | Qué hace |
|---|---|
| `startSession(studentId, routine)` | Devuelve el id de la sesión abierta de esa rutina. Si no existe, la crea con `plannedExercises(routine)` y borra el cambio para la próxima vez. |
| `saveLog(sessionId, exercise, status, { sets, reps, weight })` | Guarda un ejercicio como `'done'` o `'skipped'`. Si ya estaba guardado, lo reemplaza. |
| `clearLog(sessionId, exerciseId)` | Borra lo guardado de un ejercicio |
| `finishSession(sessionId)` | Finaliza la sesión. La próxima vez le toca la rutina siguiente. |

Para no crear sesiones vacías, la pantalla crea la sesión recién cuando el alumno marca el primer ejercicio:

```tsx
saveLog(session?.id ?? startSession(user.id, routine), exercise, 'done', values);
```

## Acciones del coach

| Acción | Qué hace |
|---|---|
| `saveStudent({ id?, name, dni, daysPerWeek, coachId, gymId })` | Crea un alumno, o lo actualiza si recibe `id`. Devuelve `'dni-taken'` sin guardar si otro usuario ya tiene ese DNI. Si no, devuelve `'ok'`. |
| `deleteStudent(id)` | Borra el alumno con sus rutinas, sesiones y registros |
| `saveRoutine(routine)` | Crea o actualiza una rutina. Para una nueva, usá `position: nextPosition(db, studentId)`. |
| `moveRoutine(id, -1 \| 1)` | Intercambia la rutina con la anterior o la siguiente |
| `customizeNext(routineId, exercises)` | Cambia los ejercicios solo por un día: en la sesión de hoy si el alumno ya la empezó, o en `override` para la próxima vez. Con `null` deshace el cambio. |
| `deleteRoutine(id)` | Borra una rutina y renumera las que quedan. El historial no cambia. |
| `fromTemplate(routine, template)` | Devuelve la rutina con el nombre y los ejercicios de una de "Mis rutinas", en la misma posición. Guardala con `saveRoutine`. |
| `assignTemplate(template, studentIds)` | Agrega una copia de la plantilla como próxima rutina de cada alumno |
| `replaceRoutines(routines, newStudents?)` | Crea `newStudents` y reemplaza las rutinas de los alumnos incluidos. Lo usa la importación de CSV. |
| `saveTemplate(template)` / `deleteTemplate(id)` | Crea, actualiza o borra una de "Mis rutinas" |

## Acciones del admin

| Acción | Qué hace |
|---|---|
| `saveGym({ id, name })` | Crea o renombra un gimnasio |
| `saveCoach({ id?, name, username, password, gymIds })` | Crea un coach, o lo actualiza si recibe `id`. Devuelve `'username-taken'` sin guardar si otro coach ya tiene ese usuario. |

## Gimnasio actual del coach

El coach trabaja en un gimnasio a la vez y lo cambia desde la barra lateral. `useGym()` de `src/session.tsx` devuelve `{ gym, gyms, setGymId }`. Lo elegido queda guardado en el dispositivo. Las pantallas del coach muestran solo los alumnos de `gym`, y los alumnos nuevos, también los del CSV, se crean en ese gimnasio. El QR de cada gimnasio abre `/?gym=<id>`, y el login muestra el nombre del gimnasio.

## Login

| Rol | Cómo entra |
|---|---|
| Admin | Usuario `admin`, contraseña `admin123`, fijos en `ADMIN` de `src/session.tsx`. No está en la base. Entra a `/admin`. |
| Coach | Con el usuario y la contraseña que le creó el admin. `c1` (Antonella Rocuzzo) entra con `coach` / `coach123`. |
| Alumno | Con su DNI: `const s = studentByDni(db, dni); if (s) login(s.id);`. `login` viene de `useSession()`. |

Todos los alumnos tienen rutinas cargadas. Juan, Ana y Martín además tienen historial de las últimas semanas para la demo. Martín dejó de entrenar hace 12 días.

| Alumno | DNI | Rutinas |
|---|---|---|
| Juan Pérez | 30111222 | 3 |
| Ana Gómez | 35333444 | 2 |
| Martín Ruiz | 40555666 | 3 |
| Ezequiel Scollo | 41399264 | 3 |
| Flor Villar | 39967191 | 3 |
| Anthony Montero | 96220982 | 3 |

## Errores

Si una escritura en Supabase falla, la app muestra "No se pudo guardar. Revisá la conexión y probá de nuevo." y vuelve a leer la base. Las acciones no devuelven el error a la pantalla.
