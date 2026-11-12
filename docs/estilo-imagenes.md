# Guía de estilo de imágenes

Esta guía define el aspecto de las ilustraciones de **Álgebra a la vista**. Debe utilizarse al crear, generar, seleccionar o modificar imágenes para la página.

## Referencia principal

La referencia aprobada es el [delfín alegre en estilo cómic](../assets/originals/illustrations/ilustracion-delfin-datos-comic.png). La [ilustración de portada](../assets/originals/brand/brand-icon-cartoon-comic.png) aplica el mismo acabado a la base de datos y las tablas conectadas. Aunque su nombre contiene «icon», su función es ilustrativa.

![Referencia del estilo cómic](../assets/originals/illustrations/ilustracion-delfin-datos-comic.png)

El estilo vigente es el cómic limpio, con carisma moderado y expresiones alegres. Se conservan únicamente las fuentes de las imágenes integradas en la página y sus exportaciones optimizadas.

## Dirección visual

- **Cómic cuidado y profesional:** cercano, claro y apropiado para un laboratorio educativo.
- Formas redondeadas, siluetas reconocibles y una ligera asimetría que aporte naturalidad.
- Contornos de tinta en verde oscuro, con variaciones de grosor discretas y coherentes entre objetos.
- Volumen mediante pocas zonas de sombra, reflejos contenidos y tramas de puntos localizadas; evitar grano sobre toda la imagen.
- Conservar las miradas abiertas y las sonrisas alegres de los personajes existentes, sin exagerar sus gestos.
- Detalle suficiente para dar personalidad, sin pequeñas piezas que desaparezcan en móvil.
- Conservar la misma perspectiva, tratamiento de luz y nivel de detalle de la referencia.

Evitar fotografía, materiales fotorrealistas, apariencia de render 3D, neón, efectos tecnológicos recargados y dibujos infantiles. No añadir caras, ojos o mascotas por defecto.

## Paleta

| Uso | Referencia |
| --- | --- |
| Verde principal de la interfaz | `#16654A` |
| Verde oscuro para contornos y sombras | Tonos más oscuros del verde principal |
| Menta y salvia para luces y detalles | Referencia orientativa: `#C5E6D2` |
| Verde suave del entorno | `#F0F7F3` |
| Marfil para tablas y superficies | Crema cálido, próximo al de la ilustración aprobada |
| Acento de relaciones y enlaces | Dorado o amarillo cálido, en pequeñas cantidades |

Las imágenes pueden incluir variaciones de luz y sombra. El verde debe dominar; el dorado sirve para destacar conexiones, sin competir con el contenido.

## Temática y composición

Representar conceptos de fundamentos de bases de datos: tablas, registros, relaciones, claves y operaciones sobre conjuntos. Elegir un concepto principal por imagen.

- Crear una composición cohesionada, con conexiones fáciles de seguir.
- Dejar margen alrededor de los objetos; no recortar sus bordes.
- Usar fondo transparente para ilustraciones integradas en la página.
- Evitar texto incrustado, marcas de agua y elementos decorativos sin función.
- Si la imagen explica una operación, comprobar que las relaciones o transformaciones representadas sean correctas.
- En la lupa, la fila dorada debe encajar entre las líneas de la tabla. Mantener la cuadrícula alineada dentro y fuera del cristal, sin fragmentos verdes sobre el marco marfil ni deformaciones ópticas.

## Integración en la página

Las ilustraciones acompañan el contenido, con proporciones naturales y espacio suficiente para respirar. Deben adaptarse al ancho disponible sin deformarse ni provocar desplazamiento horizontal.

**No reutilizar la ilustración principal como logotipo, favicon o icono de botón.** La identidad pequeña utiliza el emblema propio `public/assets/brand/brand-icon-256.png` y su variante de 64 px para el favicon; los controles utilizan los iconos de la interfaz.

Guardar las imágenes fuente en `assets/originals/illustrations/` y sus versiones optimizadas en `public/assets/illustrations/`, con nombres descriptivos, por ejemplo `ilustracion-relaciones.webp`. Conservar el fondo transparente y optimizar el peso antes de publicar. Añadir texto alternativo que describa su función; usar `alt=""` cuando sea exclusivamente decorativa.

Las fuentes del rediseño llevan el sufijo `-comic.png`; las exportaciones conservan las rutas y dimensiones existentes para mantener la integración. El emblema pequeño procede de `assets/originals/brand/brand-icon-transformacion-comic.png`. Los prompts e iteraciones de la herramienta integrada de generación de imágenes están registrados en [`assets/originals/comic-prompts.json`](../assets/originals/comic-prompts.json).

## Plantilla de prompt

> Ilustración de cómic profesional para Álgebra a la vista sobre [concepto de bases de datos]. Usar el delfín aprobado como referencia de acabado: formas claras, contornos de tinta verde oscuro, sombras simples y tramas de puntos localizadas. Paleta verde esmeralda, menta, marfil y acentos dorados. Conservar los sujetos y la composición del original; en personajes existentes, mantener miradas abiertas y sonrisas alegres con carisma moderado. No añadir personajes o caras a los objetos. Margen exterior y fondo realmente transparente. Sin texto, marcas de agua, fotografía, brillos 3D ni grano generalizado. Mantener legibilidad en móvil.

## Revisión antes de integrar

- ¿Se reconoce el concepto y coincide con el contenido educativo?
- ¿Mantiene el estilo, los colores y los contornos de la referencia?
- ¿Se ve bien sobre el fondo claro de la página y en móvil?
- ¿Conserva transparencia, proporción y bordes completos?
- ¿Acompaña el texto sin saturar la interfaz ni agrandar los controles?
