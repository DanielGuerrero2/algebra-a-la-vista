# Guía de estilo de imágenes

Esta guía define el aspecto de las ilustraciones de **Álgebra a la vista**. Debe utilizarse al crear, generar, seleccionar o modificar imágenes para la página.

## Referencia principal

La referencia aprobada es [`assets/originals/brand/brand-icon-cartoon.png`](../assets/originals/brand/brand-icon-cartoon.png), utilizada como fuente de la ilustración principal de la portada. Aunque el nombre del archivo contiene «icon», su función es ilustrativa.

![Referencia del estilo cartoon](../assets/originals/brand/brand-icon-cartoon.png)

El estilo vigente es la versión cartoon. La imagen anterior `brand-icon-v2.png`, de apariencia más realista, se conserva como antecedente y no es la referencia para nuevas ilustraciones.

## Dirección visual

- **Cartoon cuidado y profesional:** cercano, claro y apropiado para un laboratorio educativo.
- Formas redondeadas, siluetas reconocibles y una ligera asimetría que aporte naturalidad.
- Contornos limpios en verde oscuro, con grosor consistente entre objetos.
- Volumen ilustrado mediante pocas zonas de sombra y reflejos amplios y suaves.
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

## Integración en la página

Las ilustraciones acompañan el contenido, con proporciones naturales y espacio suficiente para respirar. Deben adaptarse al ancho disponible sin deformarse ni provocar desplazamiento horizontal.

**No reutilizar la ilustración principal como logotipo, favicon o icono de botón.** La identidad pequeña utiliza el emblema propio `public/assets/brand/brand-icon-256.png` y su variante de 64 px para el favicon; los controles utilizan los iconos de la interfaz.

Guardar las imágenes fuente en `assets/originals/illustrations/` y sus versiones optimizadas en `public/assets/illustrations/`, con nombres descriptivos, por ejemplo `ilustracion-relaciones.webp`. Conservar el fondo transparente y optimizar el peso antes de publicar. Añadir texto alternativo que describa su función; usar `alt=""` cuando sea exclusivamente decorativa.

## Plantilla de prompt

> Ilustración cartoon profesional para Álgebra a la vista sobre [concepto de bases de datos]. Usar la imagen aprobada como referencia visual: formas redondeadas, contornos verde oscuro limpios, volumen ilustrado, sombras suaves y reflejos amplios. Paleta verde esmeralda, menta, marfil y pequeños acentos dorados. Composición clara y cohesionada, con margen exterior y fondo realmente transparente. Sin texto, marcas de agua, caras, fotografía ni materiales fotorrealistas. Mantener legibilidad en móvil y coherencia con la referencia.

## Revisión antes de integrar

- ¿Se reconoce el concepto y coincide con el contenido educativo?
- ¿Mantiene el estilo, los colores y los contornos de la referencia?
- ¿Se ve bien sobre el fondo claro de la página y en móvil?
- ¿Conserva transparencia, proporción y bordes completos?
- ¿Acompaña el texto sin saturar la interfaz ni agrandar los controles?
