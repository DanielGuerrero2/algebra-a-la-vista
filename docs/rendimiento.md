# Revisión de rendimiento · 8 de noviembre de 2026

La compilación de producción se probó en Chrome headless contra `vite preview`, con la caché desactivada. Para simular una conexión lenta se usaron 150 ms de latencia, 200 kB/s de descarga y una CPU limitada a 4 veces menos capacidad. Son mediciones sintéticas en una máquina local, no datos de usuarios reales.

| Vista | Antes: LCP / carga | Después: LCP / carga |
| --- | --- | --- |
| Portada | 19.1 s / 22.4 s | 3.4–4.1 s / 4.4–5.2 s |
| Laboratorio | 1.4 s / 10.7 s | 1.5–1.6 s / 1.6–1.7 s |

El elemento LCP de la portada es la ilustración principal; en el laboratorio es el título del ejercicio. El CLS observado fue inferior a 0.01 en ambas vistas. La muestra inicial en red lenta fue una carga por vista y la final, dos; los tiempos pueden variar. Falta medir INP y datos de campo.

Se sustituyeron seis PNG mostrados por el sitio por variantes WebP dimensionadas para su tamaño en pantalla. El peso conjunto de esos archivos pasó de 6.58 MB a 148 kB. Los PNG originales se conservan como referencias visuales. El JavaScript y CSS iniciales miden aproximadamente 54.7 kB y 14.8 kB comprimidos.

La portada aún supera el objetivo orientativo de 2.5 s de LCP en la simulación lenta. Conviene repetir la medición en dispositivos y redes reales antes de cambiar más código o fuentes.
