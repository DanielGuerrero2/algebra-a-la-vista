# Álgebra a la vista

Laboratorio de álgebra relacional en español con 23 ejercicios de Inmobiliaria, BD_Clientes, Biblioteca y Servicios de vehículos. Aplicación de Preact con Tailwind CSS y Vite; se publica como sitio estático. Los datos y las consultas se procesan en el navegador y las operaciones no modifican la base original.

## Archivos

El estilo de las ilustraciones se define en [docs/estilo-imagenes.md](docs/estilo-imagenes.md): referencia cartoon, paleta, composición y criterios de integración.

La portada presenta el laboratorio e incluye una demostración de selección y proyección con datos de Inmobiliaria. «Entrar al laboratorio» abre `#laboratorio`; «Inicio» regresa a la portada. Los borradores y el progreso conservan su almacenamiento habitual. La portada se implementa en `src/components/Landing.jsx` y la navegación en `src/main.jsx`.

La interfaz utiliza Button, Card y Badge adaptados de [shadcn/ui (New York)](https://ui.shadcn.com/) en `src/components/ui/`. Los componentes están en JavaScript y usan la compatibilidad de React incluida en el preset de Preact. `src/components/ui.jsx` conserva la API de botones del laboratorio. Los colores semánticos se definen en `src/styles.css`; las variantes se componen con `class-variance-authority` y `cn()` en `src/lib/utils.js`. `components.json` y el alias `@/` permiten incorporar más componentes. Conservar las adaptaciones de Preact y los tamaños adaptados al dispositivo al actualizarlos.

- `src/core/engine.js`: intérprete sin evaluación de código JavaScript. Selección, proyección, join natural, unión, diferencia, intersección y relaciones literales.
- `src/core/lab-model.js`: constructor de expresiones, conversión a símbolos y comparación de conjuntos.
- `src/core/session.js`: historial, edición y restauración de sesiones.
- `src/hooks/useWorkspace.js`: estado de la aplicación, comprobación y persistencia por ejercicio.
- `src/components/`: constructor visual, editor, inspector, tablas y navegación.
- `src/styles.css`: tema de Tailwind y estilos específicos del editor.
- `src/data/datasets.json`: tablas, expresiones y explicaciones transcritas de los documentos.
- `dist/`: salida generada por Vite; no editar directamente.
- `tests/`: pruebas automatizadas; `tests/fixtures/expected-results.json` contiene resultados de referencia independientes.
- `public/assets/brand/` y `public/assets/illustrations/`: icono e ilustraciones usados por la página; `assets/originals/` conserva las imágenes fuente fuera del sitio publicado.

## Verificación

`tests/test-operations.mjs` añade pruebas de las nueve operaciones del constructor con resultados independientes: comparadores, AND/OR, duplicados, joins, altas/bajas, modificaciones y cadenas. Incluye relaciones vacías y rechaza conjuntos con tipos incompatibles aunque no tengan filas. Se ejecuta dentro de `npm test`.

La secuencia del constructor se presenta en una tira horizontal desplazable, accesible con teclado, para mantener los controles a la vista mientras crece la consulta.

Ejecutar desde esta carpeta con Node y npm:

```text
npm ci
npm test
npm run build
npm run dev
```

Para revisar en el navegador: probar el ejercicio 1 de Inmobiliaria mediante dos joins, selección de precio y proyección de nombre; comprobar deshacer/rehacer, cambiar de ejercicio y volver; introducir una condición incompleta y confirmar que no se conservan filas anteriores ni se habilita CSV. Probar el alta de vendedor, aumento de precios, baja de casas y modificación del tema de dos libros con OR.

La comprobación compara los conjuntos obtenidos sobre los datos de ejemplo; no demuestra equivalencia de las consultas sobre cualquier base. Ver una solución no marca automáticamente el ejercicio como resuelto. Reiniciar permite un nuevo intento independiente.

## Contribuir

Para preparar el entorno, elegir dónde hacer cambios y verificar una propuesta, consulta [CONTRIBUTING.md](CONTRIBUTING.md).

## Interfaz y adaptación a pantallas

La interfaz conserva la paleta verde y distingue dos etapas: construir la consulta y explorar sus resultados. Desde 1280 px se muestran ambos paneles; por debajo se usa un selector fijo durante el desplazamiento. El constructor muestra una cadena de operaciones: «Añadir paso» aplica la operación sobre el resultado anterior y mantiene visible la consulta para seguir encadenando. «Ver resultado» y la ejecución del editor abren el inspector en pantallas estrechas y colocan allí el foco. Deshacer y rehacer actualizan también la cadena. Una expresión inválida mantiene visible el editor.

La navegación lateral permanece visible desde 1024 px. En pantallas menores se abre como un menú con foco contenido, cierre con Escape y retorno al botón de apertura. Las condiciones se reorganizan según el ancho del panel, y las tablas se desplazan dentro de su propia región sin ensanchar la página. El laboratorio usa controles compactos de 36 px en escritorio y al menos 44 px en pantallas menores de 1024 px o con puntero táctil; «Añadir paso» se ajusta a su contenido. La selección y el hover utilizan verdes suaves; el editor usa la misma tipografía en su texto y su capa de resaltado.

Para verificar la interfaz: revisar anchos de 320, 768, 1024 y 1440 px; aplicar una operación en móvil, volver a Consulta, ejecutar una expresión válida e inválida, recorrer el menú con Tab y cerrarlo con Escape. Comprobar también la guía, el cambio de base y el desplazamiento horizontal de una tabla ancha.

El editor convierte palabras de operadores a símbolos fuera de las cadenas entre comillas. Los borradores y el progreso se guardan localmente en el navegador. Se conservan las claves `lab-drafts-v2` y `lab-progress` para recuperar el trabajo de la versión anterior; la ubicación actual se guarda en `lab-location-v3`. Las consultas admitidas tienen un máximo de 60 000 caracteres y los resultados se limitan a 20 000 filas.
