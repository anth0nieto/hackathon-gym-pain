# Design system

Todo el estilo de la app vive en `src/styles.css`. No hay librería de componentes ni Tailwind: son variables CSS y clases. Para que una pantalla nueva se vea como el resto, usá las clases de este documento y los colores a través de sus variables.

La base es el login. Toma el azul de Docker (`#1D63ED`) y su azul marino (`#00084D`). Las superficies oscuras (login y menú lateral del coach) llevan tarjetas translúcidas. El contenido va sobre fondo claro, con tarjetas blancas.

## Marca

La app se llama **Forza**. El logo y sus reglas están en [marca.md](marca.md). Usá los archivos de `public/brand/` tal cual, sin redibujarlos: `forza-logo-dark.svg` sobre `--nav-bg` (login y menú lateral) y `forza-logo-light.svg` sobre fondo claro.

## Reglas

1. **Nunca escribas un color en un componente.** Usá una variable: `var(--primary)`, no `#1d63ed`. Si falta un color, agregá la variable en `:root` y en el bloque de modo oscuro.
2. **Una acción principal por pantalla**, con `.btn`. El resto, con `.btn-secondary`, `.btn-ghost` o `.btn-link`.
3. **Todo lo que se toca mide al menos `var(--tap)`**, que son 48 px. El alumno usa la app en el gimnasio, con una mano.
4. **El estado va con color y con texto.** Un badge verde siempre dice "Al día" o "Finalizada", nunca solo el color.
5. **El modo oscuro es automático.** Sigue al sistema (`prefers-color-scheme`). Si usás variables, no tenés que hacer nada. El login es siempre oscuro.

## Colores

| Variable | Claro | Oscuro | Para qué |
|---|---|---|---|
| `--primary` | `#1d63ed` | `#3d7cf5` | Azul Docker. Botón principal, links, selección |
| `--primary-hover` | `#1750c4` | `#5b91f7` | Hover del botón principal |
| `--primary-text` | `#ffffff` | `#ffffff` | Texto sobre `--primary` |
| `--secondary` | `#e5f2fc` | `#0f1e4a` | Fondo de botones secundarios, filtro activo, hover |
| `--accent` | `#2496ed` | `#2496ed` | Azul Docker clásico. Marca del link activo en el menú |
| `--nav-bg` | `#00084d` | `#00052e` | Azul marino. Fondo del login y del menú lateral |
| `--nav-text` | `#e5f2fc` | `#e5f2fc` | Texto sobre `--nav-bg` |
| `--bg` | `#f6f7f9` | `#0b1120` | Fondo de la página |
| `--surface` | `#ffffff` | `#131c2e` | Tarjetas, inputs, tabla |
| `--text` | `#0f172a` | `#e2e8f0` | Texto principal |
| `--muted` | `#64748b` | `#94a3b8` | Texto secundario, etiquetas |
| `--border` | `#e2e8f0` | `#1e293b` | Bordes y divisores |
| `--idle` | `#cbd5e1` | `#334155` | Elementos deshabilitados |
| `--ok` / `--ok-bg` | `#16a34a` / `#dcfce7` | `#16a34a` / `#052e16` | Al día, hecho, finalizada |
| `--warn` / `--warn-bg` | `#b45309` / `#fef3c7` | `#fbbf24` / `#3a2a06` | En riesgo, en curso, avisos |
| `--danger` / `--danger-bg` | `#dc2626` / `#fee2e2` | `#dc2626` / `#3b0a0a` | Inactivo, salteado, borrar |
| `--focus-ring` | azul al 35 % | azul al 40 % | Anillo de foco de inputs |
| `--glass-bg` / `--glass-border` | blanco al 7 % / al 14 % | igual | Tarjetas translúcidas sobre `--nav-bg` |
| `--glow` | `#2496ed` al 35 % | igual | Brillo de fondo del login |
| `--avatar-bg` | `#00084d` | `#1d3fa0` | Círculo de iniciales |

## Tipografía

La fuente es la del sistema (`system-ui`): San Francisco en iPhone, Roboto en Android y Segoe en Windows. No se carga ninguna fuente externa.

| Uso | Tamaño | Peso |
|---|---|---|
| Texto base | 16 px, interlineado 1.4 | 400 |
| `h1` | 1.5 rem | 700 |
| Título de página del coach, `.page-title` | 2.25 rem (1.75 rem en celular) | 700, `letter-spacing: -0.02em` |
| Título del login, `.login-title` | entre 1.75 y 2.25 rem según el ancho | 700 |
| `h2` | 1.1 rem | 700 |
| `h3` | 1 rem | 700 |
| `.small` | 0.85 rem | — |
| Badge | 0.75 rem | 600 |

## Medidas

| Variable o valor | Para qué |
|---|---|
| `--tap: 48px` | Alto mínimo de botones e inputs |
| `--radius: 14px` | Tarjetas |
| 10 a 12 px | Botones e inputs |
| 999 px | Badges, filtros, buscador |
| Espacios de 8 y 16 px | `.stack-sm` y `.stack` |

## Layout

| Clase | Qué hace |
|---|---|
| `.stack` | Columna con 16 px entre elementos |
| `.stack-sm` | Columna con 8 px |
| `.row` | Fila con 8 px, centrada en vertical |
| `.row-between` | Fila con los extremos separados |
| `.grow` | Ocupa el espacio que sobra en una fila |
| `.page-head` | Encabezado de página: título a la izquierda, acción a la derecha |
| `.toolbar` | Filtros a la izquierda, buscador a la derecha. En celular se apilan. |
| `.page-wide` | Dentro del panel del coach, la página usa hasta 1200 px en lugar de 760 |

## Componentes

### Botones

```html
<button class="btn">Guardar</button>
<button class="btn btn-block">Entrar</button>
<a class="btn btn-secondary">Mis rutinas</a>
<button class="btn btn-ghost">Cancelar</button>
<button class="btn-link">Editar</button>
<button class="btn-link danger">Borrar</button>
```

| Clase | Uso |
|---|---|
| `.btn` | Acción principal. Azul Docker, se oscurece con hover |
| `.btn-secondary` | Acción secundaria. Fondo celeste y texto azul |
| `.btn-ghost` | Acción terciaria. Solo borde |
| `.btn-block` | Ocupa todo el ancho |
| `.btn-link` | Acción en línea, como "Editar". Con `.muted` o `.danger` cambia de color |

### Inputs

```html
<label class="field">
  <span>DNI</span>
  <input inputmode="numeric" />
</label>
```

Los `input` y `select` ya tienen alto, borde y anillo de foco azul. `.field` agrega la etiqueta encima. Para DNI y números usá `inputmode="numeric"`, así el celular abre el teclado numérico.

### Tarjetas

| Clase | Uso |
|---|---|
| `.card` | Tarjeta blanca con borde, radio de 14 px y 16 px de relleno |
| `.card-link` | Tarjeta que funciona como link y se achica un poco al tocarla |
| `.glass` | Tarjeta translúcida con desenfoque. **Solo sobre fondos oscuros** (`--nav-bg`), como en el login |

### Badges de estado

```html
<span class="badge tone-ok">Al día</span>
```

| Clase | Color | Ejemplos |
|---|---|---|
| `.tone-ok` | Verde | Al día, Finalizada |
| `.tone-warn` | Ámbar | En riesgo, En curso |
| `.tone-danger` | Rojo | Inactivo |
| `.tone-neutral` | Gris | Sin empezar |

`.badge-complete`, `.badge-partial`, `.badge-pending` y `.badge-skipped` son la versión anterior y siguen funcionando. En código nuevo usá las `tone-*`.

### Avisos

```html
<p class="notice">Tiene 2 rutinas y va 3 veces por semana.</p>
<p class="notice ok">Listo, rutinas importadas.</p>
<p class="notice danger">No pude leer esa URL.</p>
```

### Filtros

```html
<div class="chips">
  <button class="chip is-active" aria-pressed="true">Todos · 107</button>
  <button class="chip" aria-pressed="false">En riesgo · 19</button>
</div>
```

Muestran la cantidad de cada filtro. Marcá el activo con `.is-active` y con `aria-pressed`.

### Tabla y tarjetas en celular

```html
<div class="table-card">
  <table class="table">…</table>
  <ul class="table-cards">…</ul>
</div>
```

En pantallas de más de 860 px se ve la tabla. En celular se oculta y se ven las tarjetas de `.table-cards`. Hay que escribir las dos versiones: es la forma más simple de que la tabla no desborde en un celular. Cada fila se puede tocar y abre el detalle.

### Persona

```html
<div class="person">
  <span class="avatar">JP</span>
  <div><span class="person-name">Juan Pérez</span><span class="muted small">DNI 30111222</span></div>
</div>
```

### Otros

| Clase | Uso |
|---|---|
| `.stepper`, `.btn-step` | Botones −/+ para series, reps y peso (`src/components/Stepper.tsx`) |
| `.exsum-list`, `.exsum` | Lista de ejercicios con lo sugerido contra lo realizado (`src/components/ExerciseSummary.tsx`) |
| `.weekstrip`, `.dot-*` | Semana del alumno y sus puntos de estado |
| `.empty` | Mensaje centrado cuando no hay datos |
| `.divider` | Línea con texto en el medio ("o asignar una de Mis rutinas") |
| `.no-print` | Se oculta al imprimir |

## Pantallas modelo

| Pantalla | Archivo | Qué copiar |
|---|---|---|
| Login | `src/pages/Login.tsx` | Logo oscuro, fondo `--nav-bg` con `.login-glow`, tarjetas `.glass`, botón principal a todo el ancho |
| Panel del coach | `src/components/CoachLayout.tsx` | Logo oscuro y menú lateral `--nav-bg` que en celular pasa a ser una barra arriba |
| Lista con filtros | `src/pages/coach/CoachHome.tsx` | `.page-head`, `.toolbar` con `.chips` y buscador, `.table-card`, paginación `.pager` |
| Formulario | `src/pages/coach/StudentForm.tsx` | `.stack` con `.field`, un `.btn-block` y un `.btn-link.danger` para borrar |
