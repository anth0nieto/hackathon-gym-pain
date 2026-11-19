# Rutinas: problema, solución y decisiones

## El problema

**Lo sufren:** el coach particular y, sobre todo, sus alumnos.

El coach arma y comparte las rutinas de cada alumno en una planilla de Google Sheets. En el gimnasio, el alumno tiene que abrir la planilla en el celular, hacer zoom, buscar el día que le toca y anotar los pesos en celdas chiquitas. Muchos dejan de registrar, y el coach se queda sin saber qué hicieron.

**Por qué es real:** las planillas y los formularios son difíciles de completar desde el celular, cada paso de más hace que el alumno no registre, y el sistema "funciona con 5 alumnos y se rompe con 20". Fuente: proveedor (HubFit).

## La solución

Una web responsive con dos roles, coach y alumno, sobre Supabase. No hay registro: el coach carga a sus alumnos con nombre y DNI.

**Coach**

- Le arma a cada alumno tantas rutinas como días por semana va a entrenar. Si va 3 veces, tiene Rutina 1, 2 y 3. Si va 5, tiene 5 rutinas.
- Cada rutina tiene 4 o 5 ejercicios con series, repeticiones y peso sugeridos.
- Puede editar una rutina, cambiar un ejercicio puntual, reemplazar la rutina por otra de su biblioteca "Mis rutinas", o cambiarla de lugar en el orden.
- Puede cambiar los ejercicios **solo por un día**, sin tocar la rutina. Si el alumno ya empezó la rutina, el cambio vale para hoy. Si no, vale para la próxima vez que la haga.
- También puede cargar las rutinas desde un CSV exportado de Google Sheets.
- Imprime el QR del gimnasio desde la app. Es uno solo para todos los alumnos.
- Busca alumnos por nombre o DNI. La lista muestra primero a los que hace más tiempo que no entrenan.
- Ve el historial de cada alumno, qué rutina hizo cada día y con qué valores, y el progreso de peso de cada ejercicio.

**Alumno**

- Entra con un QR que es el mismo para todos y después escribe su DNI.
- La app le muestra la rutina que le toca. No elige: si quiere otra, se lo pide al coach.
- Marca cada ejercicio como hecho o salteado. Antes de marcarlo puede subir o bajar las series, las repeticiones y el peso, para dejar lo que realmente hizo.
- Al terminar toca "Finalizar".

## Cómo se decide qué rutina le toca

Las rutinas no tienen día ni fecha. Van en orden: 1, 2, 3, y después vuelve a la 1. No importa si el alumno vuelve al otro día o un mes después: le toca la siguiente a la última que hizo.

| Situación | Qué ve el alumno |
|---|---|
| Nunca entrenó | La Rutina 1 |
| Finalizó la Rutina 1 | La Rutina 2, aunque vuelva a entrenar ese mismo día |
| Finalizó la última rutina | La Rutina 1 de nuevo |
| Empezó una rutina y no la finalizó, y pasaron menos de 6 horas | La misma rutina, para seguirla |
| Empezó una rutina, no la finalizó, y pasaron 6 horas o más desde que empezó | La siguiente. La anterior queda cerrada con los ejercicios que marcó. |
| Quiere ver o corregir una rutina que ya hizo | La abre desde su historial y la edita |

El coach no elige cuál es la próxima rutina. El orden es siempre 1, 2, 3.

## Decisiones de diseño

La idea guía: **registrar tiene que costar menos que no registrar.**

### 1. Un solo toque para registrar

Los valores sugeridos ya aparecen cargados. Si el alumno hizo lo indicado, toca "Hecho" y listo. Usa los botones −/+ solo si algo cambió.

### 2. Guardar cada ejercicio al marcarlo

En el gimnasio se cierra la pestaña o se corta la señal. Cada "Hecho" o "Saltear" se guarda en el momento y se puede editar o deshacer. "Finalizar" solo cierra la sesión.

### 3. Separar lo indicado de lo realizado

La rutina del coach no se pisa con lo que carga el alumno. Cada vez que el alumno entrena se crea una **sesión**, y lo que registra queda en esa sesión. El coach ve la diferencia, por ejemplo ~~4×8 · 60 kg~~ **4×8 · 62,5 kg**.

### 4. El historial sobrevive a los cambios del coach

La sesión guarda el número y el nombre de la rutina, y cada registro guarda el nombre del ejercicio. Si el coach edita o borra una rutina, el historial del alumno no cambia.

### 5. Un cambio de un día no toca la rutina

Si un día el alumno tiene que hacer otro ejercicio, el coach lo cambia solo para esa vez. Se guarda aparte de la rutina y se borra cuando el alumno empieza esa sesión. La sesión guarda los ejercicios que tocaban ese día, así el historial compara contra lo que realmente estaba planificado.

### 6. Una sesión sin finalizar se cierra sola a las 6 horas

Si el alumno se olvida de tocar "Finalizar", no queda trabado en la misma rutina. A las 6 horas de empezada, la sesión cuenta como terminada con lo que marcó.

### 7. Biblioteca "Mis rutinas"

El coach arma rutinas una vez, por ejemplo "Principiante" o "Avanzado", y se las asigna a varios alumnos. Cada alumno recibe una copia que el coach puede ajustar sin tocar la original.

### 8. Avisar quién no está registrando

La home del coach muestra para cada alumno cuántas veces entrenó esta semana, qué rutina le toca y "Último registro hace X días", resaltado cuando pasan más de 3.

### 9. Un formato de CSV fijo, que también crea alumnos

Una fila por ejercicio:

```
alumno,dni,dias,rutina,ejercicio,series,reps,peso
```

`dni` y `dias` son opcionales. Con el DNI, los alumnos que todavía no están en la app se crean al importar, así un coach que viene de Sheets importa todo de una vez. Si la fila trae DNI, el alumno se identifica solo por el DNI, porque dos personas pueden llamarse igual. Sin DNI, se busca por nombre.

Las filas con el mismo alumno y la misma rutina forman una rutina. El orden en que aparece cada rutina define si es la 1, la 2 o la 3. Importar reemplaza las rutinas que ese alumno tenía. Los ejercicios se escriben como los llama el coach ("Press banca", "Sentadilla", "Camilla femoral") y tienen que estar en la lista de ejercicios.

Para la demo está `public/planilla-coach-demo.csv`: la planilla de un coach con 24 alumnos y 77 rutinas. Se genera con `scripts/planilla-demo.py`.

## Fuera del MVP

- Que el coach elija cuál es la próxima rutina de un alumno.
- Registrar el peso de cada serie por separado, cuando las series no son iguales.
- Notas y esfuerzo percibido (RPE) por ejercicio.
- Que funcione sin conexión (PWA).
- Login real y reglas de acceso por usuario en Supabase. Hoy la clave publishable lee y escribe todo, y la contraseña del coach está en el código.
