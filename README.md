# BetIQ

Aplicación web para registrar apuestas y comprender ganancias, pérdidas y retorno de inversión (ROI) en una sola interfaz.

## Funciones incluidas

- Panel con balance, capital apostado, tasa de acierto y ROI.
- Registro manual de apuestas con validación dual (HTML5 + JavaScript).
- Modalidad simple o combinada, con múltiples selecciones y cálculo automático de cuota.
- Registro antes del evento, en vivo o después de que el evento haya finalizado.
- Historial con búsqueda y filtros.
- Actualización de resultados pendientes.
- Análisis por deporte.
- Persistencia local mediante `localStorage`.
- Diseño adaptable Mobile-First para computadora, tableta y teléfono.

## Tecnologías

- HTML5 Semántico y CSS3 (Flexbox, CSS Grid, Media Queries)
- React y JavaScript (JSX)
- Vite
- Lucide React para iconos

## Funciones de Lógica Aplicada

La aplicación implementa directamente las tres funciones definidas por el equipo:

- `EsApuestaValida(tipo, monto, cuota)` valida el tipo y los valores antes de guardar.
- `CalcularResultado(monto, cuota, gano)` devuelve la ganancia neta o la pérdida.
- `CalcularROI(resultados, montos)` calcula el retorno y evita dividir entre cero.

Para ejecutar las once pruebas descritas en el documento del equipo:

```bash
npm test
```

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

## Crear la versión de producción

```bash
npm run build
npm run preview
```

La carpeta lista para publicar se genera en `dist/`.

## Publicar en Netlify

1. Sube este proyecto a un repositorio de GitHub.
2. En Netlify selecciona **Add new site > Import an existing project**.
3. Conecta el repositorio.
4. Netlify detectará automáticamente `npm run build` y la carpeta `dist` gracias a `netlify.toml`.
5. Selecciona **Deploy site**.

## Nota sobre los datos

Esta primera versión guarda la información en el navegador de cada usuario. No usa cuentas ni base de datos. Una siguiente versión puede incorporar una API y autenticación.

BetIQ es una herramienta de seguimiento y no garantiza resultados. Solo para mayores de 18 años; juega con responsabilidad.
