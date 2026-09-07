# Decisiones de diseño

Lo que hace que este sitio sea este sitio, escrito para no reabrirlo cada vez. Si una decisión cambia, cambia aquí primero. Cómo está construido cada trozo está en el [README](README.md).

## La carta

- La portada es **una carta corta en primera persona**, no una portada de portfolio. Un párrafo; debajo, la línea *now* con la fecha en que era cierta; después, lo más reciente.
- **Las secciones se enlazan desde dentro de las frases**, no desde un menú. La carta es la navegación.
- **Sin cifras en el titular.** Los números que lleva la carta son referencias (abajo), no cuentas. Las cuentas van en las páginas, y en palabras.
- La primera vez que se abre, el saludo se escribe letra a letra y el resto aparece alrededor. La página está completa sin JavaScript.

## Referencias numeradas — la decisión clave

- **Todo enlace en el cuerpo de una página es una referencia:** su texto y, detrás, un ordinal pequeño en el color de acento, como una llamada de nota al pie. Se numeran **en orden de lectura a lo largo de toda la página**, empezando en 1: en la portada, primero los enlaces de la carta y después los de la lista *Recently*; en una página de sección, las entradas de arriba abajo.
- **Vale igual para destinos internos y externos:** una sección del sitio, GitHub, un hilo, la web de un podcast, Spotify, la página *about* de un proyecto. El lector no distingue; el número dice solo "esto se puede seguir".
- **La navegación no lleva número:** cabecera, la fila de secciones de las páginas de sección y el pie son chrome, no referencias.
- **El número no se escribe nunca a mano.** Lo pone un contador CSS (`.ref::after` en `src/styles/letter.css`), reiniciado en `.page` y `.topic__body`. Reordenar el texto renumera solo.
- **Cómo se marca.** En Astro, `class="ref"` en el `<a>` (o en el texto del enlace, si el `<a>` es una fila entera, como en `/elsewhere`). En los datos, cualquier campo de prosa admite `[texto](url)`, que `refs()` (`src/lib/refs.ts`) convierte en una referencia; así no hay HTML en los datos.
- **Los títulos que enlazan también son referencias** (ShortLoad¹, Kapital⁵). Un título sin destino —un artículo sin página, un libro— no lleva número.

## Tipografía

- **Una serif de texto, Newsreader.** Los títulos nunca en negrita: la jerarquía la llevan el tamaño y la cursiva. **La negrita (600) es para resaltar**, dentro de una línea, las pocas palabras que importan —una cifra, un nombre, la idea— y nunca más de dos o tres por frase. En los datos se escribe `**así**`.
- **Un registro de etiquetas:** Inter 500, 12 px, tracking 0.08em, mayúsculas. Solo para lo que no es prosa: fechas, cabecera, pie, temáticas, cuentas.
- Los ordinales de las referencias van en Inter 500 a 11 px, en el acento.

## Color

- **Papel cálido, tinta casi negra, un solo acento óxido.** El acento marca lo que se puede seguir (subrayados de la carta, ordinales) y lo que está vivo (*Growing*, *Building*, *favourite*). No decora.
- Todo el color está en `:root` al principio de `src/styles/letter.css`.

## Superficies

- **Líneas finas, sin cajas ni sombras.** Las entradas se separan con hairlines.
- **Imágenes solo donde son contenido:** las portadas de los favoritos en `/interests` y la imagen de cada proyecto activo en `/projects`, siempre con un borde de un píxel y sin sombra. Nunca decorativas.
- **Una sola medida (660 px) para todo lo que es prosa.** La excepción es `/projects`, una hoja ancha (1080 px) porque es una cuadrícula de tarjetas; dentro de cada tarjeta el texto vuelve a una columna estrecha.

## Proyectos

- **Dos listas:** los proyectos activos —lo que estoy construyendo ahora, en el trabajo y fuera— con imagen, dos por fila; y los demás, tres por fila, título y una línea.
- **Cada proyecto es un resumen y luego lo concreto en viñetas:** la tesis, los hitos, las cifras. Una línea por viñeta. Etiquetas cortas debajo del título dicen qué clase de cosa es (Marketplace · Founder · Florida). Modelo: [gulipad.com](https://www.gulipad.com/).

## Palabras

- **El sitio está en inglés.** Los títulos de los libros, en el idioma en que se leyeron.
- **Las cuentas se escriben en palabras** hasta noventa y nueve ("twenty-three books", "the five I keep going back to").
- **Lo que está vivo lleva fecha.** La línea *now* dice cuándo era cierta.
- **Los placeholders se ven.** Cualquier texto que empiece por `TODO —` sale con un contorno ámbar para que no se publique por accidente.
