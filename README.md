# personal-page

Sitio personal estático hecho con [Astro](https://astro.build) 5. Un único script en cliente, y solo en la portada: la intro que escribe el saludo la primera vez. Sin él la página se ve completa.

## El sitio: la carta

La portada es una carta corta. **Un párrafo en primera persona; las secciones del sitio son enlaces dentro de las frases, cada uno con su número de referencia en superíndice (1, 2, 3… en orden de lectura).** Debajo, la línea *now* fechada, en cursiva, y una lista breve de lo más reciente. Las decisiones de diseño, y por qué, están en [DESIGN.md](DESIGN.md). Las páginas de cada sección son la misma hoja —papel cálido, etiquetas pequeñas en los márgenes— con un título y una columna de entradas.

```
┌──────────────────────────────────────────────────────────┐
│ PABLO                                  LUXEMBOURG · 2026 │
│                                                          │
│        Hi, I'm Pablo, an engineer from Spain working in  │
│        Amazon's supply chain, based in Luxembourg. On the│
│        side I build projects¹ and write about how it     │
│        goes². I'm very curious, so I keep consuming      │
│        knowledge³. There is a bit more about me⁴, and you│
│        can find me on other social media⁵.               │
│                                                          │
│        Right now I'm …                          SEP 2026 │
│                                                          │
│        RECENTLY                                          │
│        Aug 2026   Why I'm building in public⁶      essay │
│        Jul 2026   Shipping a side project …⁷       essay │
│        2026       ShortLoad⁸                     growing │
│                                                          │
│ morvegpablo@…         GITHUB  LINKEDIN  X  RSS  EMAIL    │
└──────────────────────────────────────────────────────────┘
```

### Cómo está hecho

- **La carta es prosa, no plantilla.** Sus palabras viven en `src/pages/index.astro` y se editan como texto. Cada enlace a una sección pasa por `sec()`, que comprueba que la sección existe en `src/data/letter.ts`. Sin cifras en el titular.
- **Todo enlace del cuerpo es una referencia numerada:** su texto y un ordinal pequeño en óxido, como una llamada de nota. Los números los pone un contador CSS (`.ref` en `src/styles/letter.css`) en orden de lectura a lo largo de toda la página —tras la carta sigue por la lista *Recently*—, valen igual para destinos internos y externos, y nunca se escriben a mano. Cabecera, navegación de secciones y pie no llevan número. Es la decisión central de [DESIGN.md](DESIGN.md).
- **Los textos de los datos admiten enlaces `[texto](url)` y `**negrita**`** (`refs()` en `src/lib/refs.ts`): los enlaces salen como referencias numeradas y la negrita (Newsreader 600) resalta las pocas palabras que importan en cada línea. Sin HTML en los datos. Las cuentas que quedan (las cabeceras de `/interests`, la nota de la estantería) se escriben en palabras hasta noventa y nueve (`countWord` en `src/lib/letter.ts`).
- **Recently** (`getRecent` en `src/lib/content.ts`) mezcla artículos y proyectos, lo más nuevo primero. Los proyectos solo tienen año, así que cada uno se fecha a mitad del suyo y los artículos de ese año se ordenan alrededor con naturalidad. Los enlaces van a las páginas de sección: los artículos aún no tienen página propia.
- **La línea `now`** es lo más parecido a una tesis que tiene la carta: una frase en presente con la fecha en que era cierta. La fecha obliga a mantenerla. Está en `src/data/letter.ts`.
- **La primera vez que se abre la carta, hay una intro** (`src/scripts/letter-intro.ts`): la hoja está en blanco y el saludo —las primeras palabras de la carta, "Hi, I'm Pablo"— se escribe letra a letra, en su sitio y en su tipo, con un cursor. Cuando está completo, el cursor se va y el resto de la carta aparece a su alrededor en orden de lectura: el resto de la frase, la línea *now*, la lista, los márgenes. Nada se mueve: la intro se convierte en la página. Un clic o una tecla la salta; con `prefers-reduced-motion`, o en la segunda visita de la misma sesión, no se muestra (lo decide un script inline antes del primer pintado, para que nada parpadee). Para volver a verla, abrir `/#intro`. Sin JavaScript no hay intro y la página está completa.
- **Tipografía:** una sola serif de texto, Newsreader; los títulos nunca en negrita —la jerarquía la llevan el tamaño y la cursiva— y negrita solo para resaltar dentro de una línea. Inter 500 a 12 px con tracking 0.08em para las etiquetas: fechas, cuentas, cabecera y pie.
- **Color:** papel cálido (`#fbf9f4`), tinta casi negra (`#1c1a17`) y un solo acento, óxido (`#b3401e`), que marca lo que se puede seguir (subrayados, cuentas) y lo que está vivo. Líneas finas, sin cajas ni sombras. Todo en `:root` al principio de `src/styles/letter.css`.
- **Los placeholders se ven:** cualquier texto que empiece por `TODO —` sale con un contorno ámbar discontinuo (`.is-todo`) para que no pueda publicarse por accidente.

### Páginas de sección

Cada enlace de la carta apunta a una página (`/projects`, `/writing`, `/interests`, `/about`, `/elsewhere`) que usa `src/layouts/Topic.astro`: la misma hoja que la portada, con la cabecera de navegación —el nombre vuelve a la carta; a la derecha, las demás secciones, con la actual en tinta—, el número y el título de la sección (tomados de `letter.ts`, así el enlace de la carta y el título no pueden divergir), el contenido, y un pie con la vuelta a la portada y la sección siguiente. Las cinco páginas se leen en bucle sin pasar por la carta.

#### Proyectos (`/projects`)

Una hoja ancha (`<Topic wide>`, medida de 1080 px) con dos cuadrículas, a la manera de [gulipad.com](https://www.gulipad.com/): **proyectos activos** (`active: true`), dos por fila, cada uno con su imagen 16:9 (`image`, con crédito opcional debajo), título, etiquetas, un resumen y las viñetas con lo concreto (`points`); y **otros proyectos**, tres por fila, con título, etiquetas y una línea. Las imágenes viven en `public/projects/`. En pantallas estrechas las cuadrículas bajan a dos y a una columna.

#### Sobre mí (`/about`)

Los datos básicos, un hecho por línea con las palabras clave en negrita (`basics` en `src/data/about.ts`), y debajo la lista corta de principios (`principles.ts`), todavía por escribir.

#### Intereses (`/interests`)

Dos partes en una página, cada una con su `id` para que la carta pueda enlazarla: **libros** y **podcasts**. Arriba, **la estantería**: los favoritos en una cuadrícula de portadas —el único sitio del sitio con imágenes—, cinco por fila a la medida completa, con título y autor debajo. Después, **la lista completa archivada por temática** (`themes` en `src/data/interests.ts`, en ese orden), una fila por libro con el autor en gris, una sinopsis de una línea (`blurb`) y los favoritos marcados otra vez en óxido. Los podcasts reutilizan las filas de proyectos: el nombre enlaza a su web, debajo quién lo hace y una línea, y una segunda referencia a Spotify (`spotify`). Un libro es una entrada en `books` con su `theme`; `favourite: true` lo sube a la estantería y `cover` apunta a su portada en `public/covers/` (las actuales vienen de [Open Library](https://openlibrary.org)); un favorito sin portada sale con el título tipografiado en su lugar.

### Hacer crecer el sitio

Añadir una sección son tres pasos:

1. La sección en `src/data/letter.ts` — título y `href`. El orden del array es el orden de numeración.
2. La página en `src/pages/<slug>.astro` envuelta en `<Topic href="/<slug>">`.
3. Una frase de la carta en `src/pages/index.astro` donde colgar el enlace: `sec('/<slug>')` y `class="ref"`. El número se lo da su posición.

Si el `href` de una sección no tiene página, el enlace da 404; si una página usa un `href` sin sección, la build falla con un error claro.

## Borradores anteriores (`/drafts`)

Los borradores siguen accesibles, cada uno en su ruta, con su hoja de estilos en `src/styles/<slug>.css`.

| Ruta | Nombre | Dirección visual |
|---|---|---|
| `/drafts` | — | Índice comparador |
| `/atom` | Rutherford | Lámina de laboratorio: el nombre como núcleo, cada sección un electrón en órbita, un autómata celular detrás |
| `/aaru` | Aaru | Observatorio oscuro. Negro, azul eléctrico, lima ácido, tipografía ultraligera |
| `/pravah` | Pravah | Dossier en pergamino cálido, una inversión en berenjena |
| `/caldera` | Caldera | Caliza fundida, naranja ascua, display comprimido |
| `/atlantic` | Atlantic | Wireframe de medianoche, blanco hielo como bordes |

Los cuatro últimos tienen su referencia de estilo en `skills/design<N>`.

### Rutherford (`/atom`)

La portada anterior: una lámina de cuaderno de laboratorio. **La figura es un átomo: el núcleo es el nombre; cada tópico del sitio es un electrón que recorre una órbita elíptica inclinada** — moviéndose de verdad. Los márgenes de la lámina llevan las anotaciones: pie de figura, índice, una línea *now* fechada, enlaces. Sus electrones apuntan a las páginas de sección de la carta; qué secciones existen, y la línea *now*, los lee de `src/data/letter.ts`.

```
┌──────────────────────────────────────────────────────────┐
│ PABLO                                      REMOTE · 2026 │
│                                                          │
│                  ╭───────╮                               │
│            ╭─────┼───────┼─────╮        ● HOW I WORK 03  │
│        ●   │     │ Pablo │     │   ● WORK 06             │
│   ELSEWHERE 04   ╰───────╯     │                         │
│            ╰─────┼───────┼─────╯        ● WRITING 04     │
│                  ╰───────╯                               │
│                                                          │
│       FIG. 1 — PABLO, ROLE. 3 ORBITS, 4 ELECTRONS.       │
│ ──────────────────────────────────────────────────────── │
│ 01 WORK ······· 06        NOW              GITHUB ↗  X ↗ │
│ 02 WRITING ···· 04   one line, dated       RSS ↗  EMAIL  │
└──────────────────────────────────────────────────────────┘
```

#### Cómo está hecho

- **Órbitas:** una `div` con `border-radius: 50%` de 88 % × 44 % es una elipse real. Tres, rotadas 0°, 60° y 120°: el símbolo clásico del átomo.
- **Movimiento:** un solo bucle en JavaScript (`src/scripts/atom.ts`) calcula en cada frame dónde está cada electrón a partir del reloj (su órbita, su fase, el tiempo transcurrido) y lo escribe como `translate`. Sin motion paths ni keyframes: la geometría es analítica, el punto está sobre su anillo al píxel y se ve igual en todos los navegadores. La velocidad es constante a lo largo de la elipse (parametrización por longitud de arco). Sostener un electrón para el reloj; volver a la pestaña no da saltos porque el reloj solo avanza mientras la página se ve.
- **Los nombres de sección nunca se tapan.** Los electrones y sus etiquetas van siempre por delante del núcleo, y **cada etiqueta cuelga radialmente hacia fuera de su punto**, con su punto más cercano a 11 px de él: el centro de la etiqueta es donde el rayo radial corta un rectángulo redondeado alrededor del punto (`hangCentre` en `src/lib/atom-geometry.ts`). Esa curva es C¹ —lados rectos tangentes a arcos—, así que la etiqueta nunca cambia de velocidad de golpe al rodear el punto. El núcleo, además, se dimensiona para caber dentro del radio menor de las órbitas, y el nombre escala por número de caracteres. La profundidad la sugiere solo la respiración de los electrones (escala y opacidad) al dar la vuelta.
- **Las etiquetas se esquivan sin saltos.** Electrones de órbitas distintas se cruzan de vez en cuando, y ahí dos etiquetas chocarían. En cada frame, cada etiqueta busca la dirección más cercana a la radial en la que no estorba a nadie (otra etiqueta, el núcleo, otro punto, el borde de la lámina), con precisión de fracción de grado, y **un muelle amortiguado la lleva hasta allí**: nunca da pasos, se desliza, y nunca gira más deprisa que `VMAX`. Al despejarse el camino, el mismo muelle la devuelve a su sitio. Quién cede ante quién es fijo: una etiqueta más ancha nunca se aparta por una más estrecha, de modo que ninguna reacciona a otra que reaccione a ella y no pueden perseguirse. En átomos pequeños (móvil) el borde de la lámina es un obstáculo más, así que en los extremos de la órbita la etiqueta gira hasta quedar encima o debajo del punto. Cuando tres electrones coinciden en un cruce puede no haber sitio para todos y una etiqueta cruza brevemente otra; es raro y dura menos de un segundo.
- **El átomo llena la altura disponible.** En pantallas de escritorio la lámina tiene altura fija y el átomo crece hasta ocupar todo lo que dejan cabecera, pie y leyenda; en pantallas pequeñas o bajas se dimensiona desde el ancho.
- **Etiquetas siempre derechas:** nada rota. El script coloca cada electrón directamente en coordenadas de pantalla; la inclinación de la órbita se aplica al calcular la posición, no al elemento.
- **Cada electrón lleva su cuenta** (cuántos proyectos, artículos…) y, al sostenerlo, **revela lo más reciente** en una línea en cursiva. Sostenerlo también **ilumina la órbita** que recorre y **detiene el átomo entero** para poder hacer clic con calma.
- **El índice** del pie repite los electrones numerados con líneas de puntos: la forma estable de navegar cuando los que se mueven son demasiado juguetones.
- **La línea `now`** es lo más parecido a una tesis que tiene la lámina: una frase en presente con la fecha en que era cierta. La fecha obliga a mantenerla.
- **La primera vez que se abre la lámina, hay una intro** (`src/scripts/intro.ts`): sobre el campo de partículas se escribe "Hi, this is Pablo" letra a letra, justo donde va a estar el nombre; el saludo se borra hacia atrás dejando el nombre, y alrededor de él aparece el marco del núcleo, crecen las órbitas, llegan los electrones y por último las anotaciones. El nombre no se mueve: la intro se convierte en la página. Un clic o una tecla la salta; con `prefers-reduced-motion`, o en la segunda visita de la misma sesión, no se muestra (lo decide un script inline antes del primer pintado, para que nada parpadee). El texto se compone en `src/pages/atom.astro` (`intro`).
- **El pie de figura se fecha solo:** "Observed Sep 2026" es la fecha de la build. La build es la observación.
- **El campo de partículas es un autómata celular** — la idea de von Neumann, la regla de Conway — corriendo sobre una retícula de puntos detrás de la lámina. Las células vivas brillan en cobalto y se encienden y apagan con suavidad en vez de parpadear; la figura descansa en un claro que termina justo pasadas las órbitas. Cuando el campo se queda demasiado quieto, dos fluctuaciones del vacío lo reavivan en algún punto. **El puntero es una fuente de vida, no una luz:** no se dibuja nada a su alrededor; a su paso nacen pequeños racimos de células que aparecen al instante y luego evolucionan como cualquier otra, dejando una estela de actividad cobalto que Life va apagando; las células vivas que atraviesa destellan un momento; y **un clic sobre la lámina vacía deja caer un glider** en una dirección al azar. Con `prefers-reduced-motion`, una sola generación, quieta, y sin puntero. **Corre en todas las páginas:** en la portada despeja un claro redondo alrededor del átomo; en las páginas de tópico, uno rectangular alrededor de la columna de texto (`src/scripts/field.ts`; las constantes de ajuste están arriba del todo).
- **Quietud:** con `prefers-reduced-motion` el script coloca el átomo una sola vez en su fase inicial, con los cruces resueltos, y no arranca el reloj (y lo recoloca en cada cambio de tamaño). Sin JavaScript, cada electrón lleva en el HTML su posición de reposo (`--fx`/`--fy` para el punto, `--tx0`/`--ty0` para la etiqueta), calculada en la build con la misma geometría: es la misma imagen que dibuja el script en el instante cero, así que cuando arranca no hay salto.
- **Geometría con una sola fuente de verdad:** `src/lib/atom-geometry.ts` (radios, tabla de longitud de arco, posición del punto, colgado de la etiqueta, respiración) lo usan tanto la build (posiciones de reposo) como el navegador (el movimiento), así el electrón está siempre exactamente sobre la línea y la etiqueta junto a él.
- **El *peek* cae debajo de la etiqueta** y la acompaña a donde vaya.
- **Se adapta al tamaño del átomo, no del viewport** (container queries): bajo 480 px desaparece la línea de rol del núcleo (el pie la conserva); bajo 420 px desaparece el *peek*, porque no hay hover que lo revele ni sitio para él.
- **Estilo: `skills/design4` (Atlantic)** — observatorio de medianoche en wireframe. Solo oscuro: lienzo negro, lámina en carbón, tipo blanco hielo que es también el color de todas las líneas ("un wireframe dibujado con luz"). Sin sombras ni degradados: la profundidad es escalonado de superficies. El **cobalto eléctrico** solo resalta — las partículas de los electrones, los puntos azules en las esquinas de cada marco, el asterisco junto a los títulos, la segunda palabra del nombre. El **naranja señal** solo para estados interactivos — hover, foco, la etiqueta *Building*. Por eso el halo del núcleo es ahora un marco plano con esquinas azules en vez de un degradado: mismo efecto de profundidad, sin romper la regla. Todos los colores están en `:root` al principio de `src/styles/rutherford.css`; los del campo, en las constantes de `src/scripts/field.ts`.
- **Tipografía:** una sola sans a un solo peso — Inter 400 (sustituto de Monument), con `-0.03em` en el nombre; la jerarquía la lleva el tamaño, nunca la negrita. JetBrains Mono a 10 px con tracking 0.16em para todas las anotaciones.

## Desarrollo

```sh
npm install
npm run dev      # servidor local
npm run build    # genera dist/
npm run preview  # sirve dist/
npm run todo     # lista los placeholders que quedan
```

## Dónde editar

| Qué | Dónde |
|---|---|
| Nombre, rol, ubicación, email, redes (GitHub, LinkedIn, X) | `src/data/profile.ts` — alimenta el sitio y los borradores |
| El texto de la carta | `src/pages/index.astro` |
| Secciones (título, ruta, orden) y línea `now` | `src/data/letter.ts` |
| Cuántas entradas lista *Recently* | `getRecent(4)` en `src/pages/index.astro` |
| Ritmo de la intro | constantes al inicio de `src/scripts/letter-intro.ts`; orden y duraciones del *reveal* en `src/styles/letter.css` ("The intro"). `/#intro` la repite |
| Sobre mí (`/about`): los datos básicos y, debajo, los principios | `src/data/about.ts`, `src/data/principles.ts` |
| Proyectos (`/projects`) — resumen (`blurb`) y viñetas con lo concreto (`points`), `url`, `posts` (dónde se habló de ellos); enlaces `[texto](url)` en cualquiera de los textos | `src/data/projects.ts` |
| Artículos (`/writing`) | `src/content/writing/*.md` |
| Libros (temáticas, favoritos, sinopsis, portadas) y podcasts (web, Spotify) (`/interests`) | `src/data/interests.ts`; portadas en `public/covers/` |
| Decisiones de diseño | `DESIGN.md` |
| Colores, tipografía, medidas | `:root` en `src/styles/letter.css` |
| El borrador del átomo | `src/data/atom.ts` (órbitas, fases), `src/styles/rutherford.css`, `src/scripts/{atom,field,intro}.ts` |
| Dominio final | `astro.config.mjs` → campo `site` |

## Estado: qué es real y qué no

Real, sacado del CV (sep 2026): `profile.ts` (rol, Luxemburgo, email, GitHub, LinkedIn, X), la carta de `index.astro`, la línea `now` de `letter.ts`, los proyectos de `projects.ts` (ShortLoad, Polymarket supply-chain intel, el trabajo en Amazon) y todo `interests.ts` (libros, favoritos, podcasts). La carta lleva ya las palabras del autor (sep 2026); la línea `now` es un primer borrador escrito a partir del CV y conviene releerla.

Dos clases de placeholder, y solo una se detecta automáticamente:

1. **Marcados con `TODO —`** → `npm run todo` los lista, y en la página salen con un contorno ámbar discontinuo para que no puedan publicarse por accidente. Quedan los tres principios de `src/data/principles.ts` (segunda parte de `/about`) y el crédito de la foto de Amazon en `projects.ts` si se cambia la foto.
2. **Contenido plausible pero falso** → **el scanner no lo detecta.** Los cuatro artículos de `src/content/writing/` son de relleno: la carta dice "four essays" y ninguno existe. El enlace `RSS` de `profile.ts` apunta a `/rss.xml`, que todavía no se genera.

## Siguientes pasos

- [x] Sustituir `profile.ts` con datos reales, incluidos ubicación y email
- [x] Reescribir la carta en `index.astro`
- [x] Proyectos reales en `projects.ts` (ShortLoad, Polymarket supply-chain intel) — añadir los que falten
- [x] Escribir la línea `now` en `letter.ts` — borrador; revisar
- [ ] Los tres principios en `principles.ts` (segunda parte de `/about`)
- [ ] Sustituir la foto de Amazon en `public/projects/amazon.jpg` por una propia, si se quiere, y ajustar el crédito
- [ ] Completar la lista de libros en `interests.ts` (faltan los que no recordaba) y, si se quiere, ampliar la estantería
- [ ] Borrar los cuatro artículos de relleno de `src/content/writing/`
- [ ] Generar `/rss.xml` o quitar el enlace RSS de `profile.ts`
- [ ] Páginas por artículo (`src/pages/writing/[...slug].astro`) — ahora los artículos se listan pero no se pueden abrir; *Recently* debería enlazarlos
- [ ] Poner el dominio real en `astro.config.mjs`
- [ ] Favicon propio (`public/favicon.svg` es el de Astro)
- [ ] Decidir si los borradores (`/drafts`) se conservan o se retiran
