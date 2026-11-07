# Contribuir a Álgebra a la vista

Gracias por ayudar a mejorar este laboratorio de álgebra relacional. Antes de cambiar código, revisa [la arquitectura y las reglas de mantenimiento](docs/funcionamiento.md). Para ilustraciones, sigue la [guía de estilo de imágenes](docs/estilo-imagenes.md).

## Preparar el entorno

Necesitas Node.js 22.12 o superior y npm. Desde la raíz del proyecto:

```sh
npm ci
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:5173`. El servidor de desarrollo se detiene con Ctrl + C. Si prefieres limitarlo a tu equipo, usa `node node_modules/vite/bin/vite.js --host 127.0.0.1`.

## Elegir dónde trabajar

- `src/core/`: intérprete, constructor de expresiones y estado de sesión.
- `src/components/` y `src/hooks/`: interfaz y coordinación del espacio de trabajo.
- `src/data/`: relaciones, ejercicios, ejemplos y explicaciones.
- `src/styles.css`: tema y estilos propios.
- `tests/`: pruebas; `tests/fixtures/expected-results.json` contiene resultados independientes del intérprete.
- `public/assets/`: recursos que usa el sitio; `assets/originals/` conserva las imágenes fuente.
- `docs/`: funcionamiento, estilo visual y notas de mantenimiento.

Edita los archivos fuente. `dist/` y `node_modules/` se generan y no deben modificarse directamente.

## Hacer un cambio

Mantén cada cambio enfocado y acompaña los cambios de comportamiento con un caso de regresión en `tests/test-<área>.cjs` o `.mjs`. No generes los resultados esperados a partir del propio intérprete: deben seguir siendo una referencia independiente. Si cambias sintaxis, ejercicios, persistencia o recursos visuales, actualiza la documentación correspondiente.

Usa JavaScript con módulos ES, comillas simples, punto y coma y dos espacios en código expandido. Respeta el formato de los archivos compactos existentes y las convenciones JSX de Preact, incluidos los atributos `class`. Mantén los textos de la interfaz en español.

Conserva las relaciones originales sin mutaciones y la compatibilidad con las claves de almacenamiento del navegador. Las expresiones se interpretan mediante el analizador del proyecto, sin evaluar código JavaScript.

## Verificar antes de proponer el cambio

```sh
npm test
npm run build
```

Para revisar la compilación localmente, ejecuta `npm run preview`. En cambios de interfaz, comprueba los anchos de 320, 768, 1024 y 1440 px, el recorrido con teclado, deshacer y rehacer, y una expresión inválida. No hay comandos de lint ni de comprobación de tipos configurados.

Al proponer el cambio, explica qué comportamiento modificaste, cómo lo verificaste y cualquier limitación conocida. Incluye capturas si cambiaste la apariencia. Usa un título breve en imperativo, por ejemplo `Corregir validación de proyección`.
