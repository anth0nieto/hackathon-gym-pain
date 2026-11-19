# Rutinas: problema, solución y decisiones

## El problema

**Lo sufren:** el coach particular y, sobre todo, sus alumnos.

El coach arma y comparte las rutinas de cada alumno en una planilla de Google Sheets. En el gimnasio, el alumno tiene que abrir la planilla en el celular, hacer zoom, buscar el día que le toca y anotar los pesos en celdas chiquitas. Muchos dejan de registrar, y el coach se queda sin saber qué hicieron.

**Por qué es real:** las planillas y los formularios son difíciles de completar desde el celular, cada paso de más hace que el alumno no registre, y el sistema "funciona con 5 alumnos y se rompe con 20". Fuente: proveedor (HubFit).

## La solución

Una web responsive con dos roles, coach y alumno. No hay registro: los usuarios ya existen con su rol.

**Coach**

- Crea rutinas para sus alumnos. Cada rutina tiene ejercicios con series, repeticiones y peso. El ejercicio es fijo; series, repeticiones y peso son sugeridos.
- También puede cargarlas desde un CSV exportado de Google Sheets.
- Tiene una biblioteca, "Mis rutinas" (por ejemplo "Principiante" o "Avanzado"), y asigna una misma rutina a varios alumnos a la vez.
- Por cada alumno ve la semana día por día: hacia atrás, el estado de lo que hizo; hacia adelante, carga y edita rutinas.

**Alumno**

- Ve sus rutinas por día.
- Marca cada ejercicio como hecho o salteado. Antes de guardar puede subir o bajar las series, las repeticiones y el peso, para dejar lo que realmente hizo.

## Las 8 decisiones de diseño

La idea guía: **registrar tiene que costar menos que no registrar.**

### 1. Un solo toque para registrar

Los valores sugeridos ya aparecen cargados. Si el alumno hizo lo indicado, toca "Hecho" y listo; usa los botones −/+ solo si algo cambió.

Código: `src/pages/student/RoutineSession.tsx`, `src/components/Stepper.tsx`.

### 2. Guardar cada ejercicio al marcarlo

No hay un botón "Guardar" al final. En el gimnasio se cierra la pestaña o se corta la señal, y el registro se perdería. Cada "Hecho" o "Saltear" se guarda en el momento y se puede editar o deshacer.

Código: `saveLog` y `clearLog` en `src/data/store.ts`.

### 3. Separar lo indicado de lo realizado

La rutina del coach no se pisa con lo que carga el alumno: se guardan por separado (`PlannedExercise` y `ExerciseLog`). El coach ve la diferencia, por ejemplo ~~4×8 · 60 kg~~ **4×8 · 62,5 kg**, que es el dato que más le sirve para ajustar.

Código: `src/types.ts`, `src/components/ExerciseSummary.tsx`.

### 4. El estado de la rutina sale de los ejercicios

El alumno marca cada ejercicio, y la rutina queda en **Pendiente**, **En curso**, **Completa** o **Salteada** según eso. Un botón "Hoy no entreno" saltea la rutina entera de una vez.

Código: `routineStatus` y `skipRoutine` en `src/data/store.ts`.

### 5. Copiar la semana anterior

Lo que se rompe con 20 alumnos es el trabajo del coach. La mayoría de las semanas repite la rutina con pequeños ajustes, así que copiar y editar le ahorra más tiempo que cualquier import. Se complementa con la biblioteca "Mis rutinas", que se asigna a varios alumnos a la vez.

Código: `copyPreviousWeek` y `assignTemplate` en `src/data/store.ts`.

### 6. Avisar quién no está registrando

El dolor original es que el coach no sabe qué hicieron. La home del coach muestra un punto de color por día de la semana para cada alumno y "Último registro hace X días", resaltado cuando pasan más de 3.

Código: `src/pages/coach/CoachHome.tsx`.

### 7. Un formato de CSV fijo, con plantilla

Las planillas de cada coach son distintas, y tratar de adivinar las columnas no tiene fin. El formato es fijo, una fila por ejercicio:

```
alumno,fecha,rutina,ejercicio,series,reps,peso
```

Las filas con el mismo alumno, fecha y rutina se agrupan en una sola rutina. Hay un archivo de ejemplo para descargar y los errores se muestran por fila. Acepta un archivo subido o la URL de una planilla publicada como CSV.

Código: `src/data/csv.ts`, `public/rutinas-ejemplo.csv`.

### 8. Rutinas por fecha, no por día de la semana

Cada rutina se asigna a una fecha concreta, no a "lunes" en general. Así queda un historial real hacia atrás y la semana que viene se carga aparte.

## Fuera del MVP

- Registrar el peso de cada serie por separado, cuando las series no son iguales.
- Notas y esfuerzo percibido (RPE) por ejercicio.
- Que funcione sin conexión (PWA).
- Login real y reglas de acceso por usuario en Supabase. Hoy la clave publishable lee y escribe todo, y la contraseña del coach está en el código.
