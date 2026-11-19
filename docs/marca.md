# Marca: Forza

Nombre de la app: **Forza**. Logo: la palabra FORZA con la "O" reemplazada por un disco de pesa (bumper con 3 agarres).

## Archivos (`public/brand/`)

| Archivo | Uso |
|---|---|
| `forza-logo-dark.svg` | Logo completo sobre fondo oscuro (login, nav `--nav-bg`) |
| `forza-logo-light.svg` | Logo completo sobre fondo claro |
| `forza-mark.svg` | Solo el disco, fondo transparente (avatar, loaders, espacios chicos) |
| `forza-icon.svg` | Ícono de app / favicon (cuadrado redondeado `#00084d`) |

En React: `<img src="/brand/forza-logo-dark.svg" alt="Forza" height={32} />`. Las letras son trazos vectoriales, no hace falta cargar ninguna fuente.

## Reglas

- No redibujar ni recolorear el logo en código: usar estos archivos.
- Colores: letras `#e5f2fc` (oscuro) / `#00084d` (claro); disco `#2496ed` (`--accent`) / `#1d63ed` (`--primary`).
- Tipografía del logo: Archivo, ancho 125, peso 900.
- Dejar aire alrededor de al menos la mitad del alto del disco.
