# BetIQ

Aplicación web para registrar jugadas en una bitácora personal y comprender ganancias, pérdidas y retorno de inversión (ROI) en una sola interfaz.

## Funciones incluidas

- Panel con balance, capital arriesgado, efectividad, ROI y ranking de rendimiento por casa.
- Registro manual y edición de jugadas en modal con validación dual (HTML5 + JavaScript).
- Modalidad simple o combinada, con múltiples selecciones y cálculo automático de cuota.
- Historial con búsqueda, filtros y cambio de estado en un clic con opción de **Deshacer**.
- Análisis de gestión de capital e _insights_ automáticos por categoría/deporte.
- Cuentas con correo, contraseña, apodo opcional y declaración de mayoría de edad (SQLite en desarrollo local, Netlify Blobs en Netlify y fallback automático en `localStorage` para hosting estático / WebDAV).
- Diseño adaptable Mobile-First para teléfono, tableta y computadora.

## Tecnologías

- HTML5 Semántico y CSS3 (Flexbox, CSS Grid, Media Queries Mobile-First)
- React y JavaScript (JSX)
- Vite
- Lucide React para iconos

## Funciones de Lógica Aplicada

La aplicación implementa las funciones definidas por el equipo:

- `EsApuestaValida(tipo, monto, cuota)` valida el tipo y los valores antes de guardar.
- `CalcularResultado(monto, cuota, gano)` devuelve la ganancia neta o la pérdida.
- `CalcularROI(resultados, montos)` calcula el retorno y evita dividir entre cero.
- `getBookmakerPerformance(bets)` agrupa resultados por casa de apuestas y calcula balance y ROI.
- `getCapitalInsight(categories, summary)` resume qué categoría explicó el mayor impacto en dólares.

Para ejecutar todas las pruebas automatizadas:

```bash
npm test
```

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Vite mostrará la dirección local (`http://localhost:5173`) y la dirección en red local (`--host`) para probar desde el teléfono.

## Crear la versión de producción

```bash
npm run build
npm run preview
```

La carpeta lista para publicar se genera en `dist/`.

BetIQ es una herramienta de seguimiento y no garantiza resultados. Solo para mayores de 18 años; juega con responsabilidad.
o
