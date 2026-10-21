# Decisiones de diseño

Lo que hace que este sitio sea este sitio, escrito para no reabrirlo cada vez. Si una decisión cambia, cambia aquí primero. Cómo está construido cada trozo está en el [README](README.md).

## La carta

- La portada es **una carta corta en primera persona**, no una portada de portfolio, **que se convierte en el grafo** cuando el lector sigue (abajo, "El grafo"). Un párrafo; debajo, la línea *now* con la fecha en que era cierta; después, lo más reciente.
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

- **Una sola sans, Nunito Sans** (octubre de 2026, a la manera de [worrydream.com](https://worrydream.com/), que usa Avenir; Nunito Sans es la libre más cercana). Los títulos nunca en negrita: la jerarquía la lleva el tamaño. **La negrita (700) es para lo que se puede seguir** —los enlaces, en blanco— **y para resaltar**, dentro de una línea, las pocas palabras que importan, nunca más de dos o tres por frase. En los datos se escribe `**así**`.
- **Un registro de etiquetas:** la misma sans, 12 px, tracking 0.08em, mayúsculas. Solo para lo que no es prosa: fechas, cabecera, pie, temáticas, cuentas.
- Los ordinales de las referencias van a 11 px, en el acento.

## Color

- **La noche, a la manera de worrydream.com** (octubre de 2026; antes, papel cálido con tinta y óxido): **la hoja azul marino** (`#10183a`), **las palabras en azul pálido** (`#aaccee`), **en blanco y negrita lo que se puede seguir**, **en gris** fechas, cuentas y notas, y **un solo acento, amarillo** (`#ffe94d`), para los ordinales de las referencias, lo mejor (los libros favoritos) y lo que está vivo (*Growing*, *Building*, el trabajo de ahora). No decora.
- **Su estilo, mi material.** Ni sus dibujos ni su tipo: los dibujos de los márgenes son los míos, entintados a pluma, y la tipografía es libre.
- Todo el color y el tipo están en un solo sitio, `src/styles/tokens.css`, que leen las páginas de la carta y el grafo.

## Superficies — la placa

- **Dos escalones de noche, y solo dos.** La hoja (`--paper: #10183a`) y **la placa un escalón más profunda** (`--surface: #0c1331`): una placa se asienta en la página, no se levanta sobre ella. (Con el papel se probó al revés en septiembre de 2026 y las placas pasaban a leerse como hojas sobre una mesa; la regla se queda.)
- **Un solo rectángulo, repetido.** En una página de sección, todo bloque de contenido se dibuja igual: borde hairline de un píxel, esquina de 2 px, el escalón profundo de papel y un único padding. Vale para la nota bajo el nombre de una sección, cada tarjeta de una cuadrícula, la estantería, una lista archivada, la hoja de datos y cada principio. Modelo: [gulipad.com](https://www.gulipad.com/).
- **Los chips vuelven al color de la hoja** (`.pill`, las etiquetas de una tarjeta): sobre la placa se leen como marcas encima, no como agujeros.
- **La consistencia es que solo hay una regla.** La lista de selectores de la placa está en un sitio (`src/styles/letter.css`, "The plate"). Un bloque nuevo se añade a esa lista; **nunca se escribe una segunda caja.**
- **La carta no lleva placas.** La portada es prosa desnuda sobre la hoja: una carta no tiene paneles.
- **Las secciones se distinguen por una regla, no por una caja más pesada.** El nombre de la sección y, desde él hasta el margen derecho, un filete de un píxel (`.part__head`). Un peso de caja, un peso de línea. Un nivel por debajo —una temática en `/interests`— la etiqueta va sola: la placa de abajo es la que cierra el grupo.
- **La cabecera y el pie llevan el suyo:** el filete bajo el masthead y el de encima del pie son el marco de la página; entre los dos está el contenido, y todas las placas alinean con los mismos márgenes.
- **Sin sombras, en ningún sitio.**
- **Imágenes solo donde son contenido:** las portadas de los favoritos en `/interests` y la imagen de cada proyecto activo en `/projects`. La imagen de una tarjeta llega a sangre hasta el borde de la placa —el borde de la placa es su marco— y el crédito baja al pie de la tarjeta, para que todos los títulos empiecen en la misma línea y la cuadrícula quede cuadrada. Nunca decorativas.
- **Una sola medida (660 px) para todo lo que es prosa.** La excepción es `/projects`, una hoja ancha (1080 px) porque es una cuadrícula de tarjetas; dentro de cada tarjeta el texto vuelve a una columna estrecha.

## Proyectos

- **Dos listas:** los proyectos activos —lo que estoy construyendo ahora, en el trabajo y fuera— con imagen, dos por fila; y los demás, tres por fila, título y una línea.
- **Cada proyecto es un resumen y luego lo concreto en viñetas:** la tesis, los hitos, las cifras. Una línea por viñeta. Etiquetas cortas debajo del título dicen qué clase de cosa es (Marketplace · Founder · Florida). Modelo: [gulipad.com](https://www.gulipad.com/).

## Palabras

- **El sitio está en inglés.** Los títulos de los libros, en el idioma en que se leyeron.
- **Las cuentas se escriben en palabras** hasta noventa y nueve ("twenty-three books", "the five I keep going back to").
- **Lo que está vivo lleva fecha.** La línea *now* dice cuándo era cierta.
- **Los placeholders se ven.** Cualquier texto que empiece por `TODO —` sale con un contorno ámbar para que no se publique por accidente.

## El grafo — la carta se convierte en él

- **Un sitio, no una página.** Tras la carta, la portada es todo el sitio como una red con el nombre en el centro: trabajo, estudios, proyectos, lugares, libros y podcasts. Se recorre, no se lee de arriba abajo.
- **Las ideas son los cruces.** Unas pocas ideas (*supply chain*, *LLM agents*, *markets*, *engineering*) están donde se tocan lo que hago y lo que leo: *The Box* lleva a *supply chain*, y *supply chain* a Amazon, Mango y Kubota. Sin esos cruces sería una lista.
- **Cada palabra de la carta tiene adónde ir.** Los hechos vuelan a sus nodos; los enlaces, a la palabra de su sección en el borde de la pantalla —las referencias de la carta se convierten en el marco del sitio—; lo demás se disuelve. Nada desaparece sin destino.
- **La misma noche, el mismo acento.** En blanco el nombre y lo que cuelga de él, en azul pálido libros y podcasts, en gris lugares y temáticas; el amarillo marca lo que sigue vivo (Amazon, ShortLoad, *LLM agents*, Luxemburgo) y lo mejor (los libros favoritos). Los títulos de libros y podcasts en cursiva, como se escriben los títulos; lugares y temáticas en el registro de etiquetas. Cada etiqueta lleva un halo de la hoja para que las aristas pasen por debajo.
- **Las imágenes, a la derecha** (o a la izquierda: en la mitad de la pantalla donde no está el puntero), como en worrydream.com: un nodo con imagen —una portada, una captura— la muestra a toda altura mientras está bajo el puntero.
- **Dos dibujos en los márgenes de la carta**, tinta sobre la noche: un barco a la derecha y la bifurcación del camino a la izquierda, a medias fuera de la columna y por debajo de las palabras. Se van cuando la carta se convierte en el grafo.
- **Ninguna etiqueta pisa a otra.** Cada etiqueta es una caja en la simulación, y la maqueta se elige en el build entre varias semillas por el menor número de aristas cruzadas. Un grafo vale lo que se leen sus etiquetas.
- **Vivo, pero quieto para leer.** Respira sin moverse de sitio; reacciona al puntero (el vecindario se ilumina, lo demás se aparta), se arrastra y se amplía. Cada nodo abre una tarjeta —la placa— con sus palabras y con qué conecta, y desde ella se sigue al siguiente.
- **Los bordes son la navegación.** Las seis palabras de los bordes —la carta y las cinco secciones— son el único chrome; no hay cabecera ni pie.
