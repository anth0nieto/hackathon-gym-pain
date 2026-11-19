# Design system

Tokens, estilos base y componentes de UI del proyecto.

Las pantallas todavía usan `src/styles.css` y `src/components/`. Hasta que el design system esté listo para reemplazarlos, esta carpeta no se importa desde ningún otro lado.

## Ver los componentes

Con `npm run dev` corriendo, abrí http://localhost:5173/src/design-system/playground/index.html

## Usarlos en una pantalla

```tsx
import { Button } from '../design-system';

<Button variant="secondary">Guardar</Button>
```

Los tokens (`tokens.css`) y las clases llevan el prefijo `ds-` para no pisar los estilos actuales de la app.

## Agregar un componente

1. Crear `components/<Nombre>/<Nombre>.tsx` y su `.css`.
2. Exportarlo en `index.ts`.
3. Sumar su demo en `playground/demos.tsx`.
