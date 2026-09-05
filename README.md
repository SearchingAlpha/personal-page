# personal-page

Sitio personal estático hecho con [Astro](https://astro.build) 5. Un único script en cliente por página (el átomo en movimiento y el campo de partículas); sin él la página se ve completa, con el átomo quieto en su fase inicial.

## El sitio: Rutherford

La portada es una lámina de cuaderno de laboratorio. **La figura es un átomo: el núcleo es el nombre; cada tópico del sitio es un electrón que recorre una órbita elíptica inclinada** — moviéndose de verdad. Los márgenes de la lámina llevan las anotaciones: pie de figura, índice, una línea *now* fechada, enlaces. Las páginas de cada tópico son la misma lámina con una columna de texto en lugar del átomo.

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

### Cómo está hecho

- **Órbitas:** una `div` con `border-radius: 50%` de 88 % × 44 % es una elipse real. Tres, rotadas 0°, 60° y 120°: el símbolo clásico del átomo.
- **Movimiento:** un solo bucle en JavaScript (`src/scripts/atom.ts`) calcula en cada frame dónde está cada electrón a partir del reloj (su órbita, su fase, el tiempo transcurrido) y lo escribe como `translate`. Sin motion paths ni keyframes: la geometría es analítica, el punto está sobre su anillo al píxel y se ve igual en todos los navegadores. La velocidad es constante a lo largo de la elipse (parametrización por longitud de arco). Sostener un electrón para el reloj; volver a la pestaña no da saltos porque el reloj solo avanza mientras la página se ve.
- **Los nombres de sección nunca se tapan.** Los electrones y sus etiquetas van siempre por delante del núcleo, y **cada etiqueta cuelga radialmente hacia fuera de su punto**, con su punto más cercano a 11 px de él: el centro de la etiqueta es donde el rayo radial corta un rectángulo redondeado alrededor del punto (`hangCentre` en `src/lib/atom-geometry.ts`). Esa curva es C¹ —lados rectos tangentes a arcos—, así que la etiqueta nunca cambia de velocidad de golpe al rodear el punto. El núcleo, además, se dimensiona para caber dentro del radio menor de las órbitas, y el nombre escala por número de caracteres. La profundidad la sugiere solo la respiración de los electrones (escala y opacidad) al dar la vuelta.
- **Las etiquetas se esquivan sin saltos.** Electrones de órbitas distintas se cruzan de vez en cuando, y ahí dos etiquetas chocarían. En cada frame, cada etiqueta busca la dirección más cercana a la radial en la que no estorba a nadie (otra etiqueta, el núcleo, otro punto, el borde de la lámina), con precisión de fracción de grado, y **un muelle amortiguado la lleva hasta allí**: nunca da pasos, se desliza, y nunca gira más deprisa que `VMAX`. Al despejarse el camino, el mismo muelle la devuelve a su sitio. Quién cede ante quién es fijo: una etiqueta más ancha nunca se aparta por una más estrecha, de modo que ninguna reacciona a otra que reaccione a ella y no pueden perseguirse. En átomos pequeños (móvil) el borde de la lámina es un obstáculo más, así que en los extremos de la órbita la etiqueta gira hasta quedar encima o debajo del punto. Cuando tres electrones coinciden en un cruce puede no haber sitio para todos y una etiqueta cruza brevemente otra; es raro y dura menos de un segundo.
- **El átomo llena la altura disponible.** En pantallas de escritorio la lámina tiene altura fija y el átomo crece hasta ocupar todo lo que dejan cabecera, pie y leyenda; en pantallas pequeñas o bajas se dimensiona desde el ancho.
- **Etiquetas siempre derechas:** nada rota. El script coloca cada electrón directamente en coordenadas de pantalla; la inclinación de la órbita se aplica al calcular la posición, no al elemento.
- **Cada electrón lleva su cuenta** (cuántos proyectos, artículos…) y, al sostenerlo, **revela lo más reciente** en una línea en cursiva. Sostenerlo también **ilumina la órbita** que recorre y **detiene el átomo entero** para poder hacer clic con calma.
- **El índice** del pie repite los electrones numerados con líneas de puntos: la forma estable de navegar cuando los que se mueven son demasiado juguetones.
- **La línea `now`** es lo más parecido a una tesis que tiene la lámina: una frase en presente con la fecha en que era cierta. La fecha obliga a mantenerla.
- **La primera vez que se abre la lámina, hay una intro** (`src/scripts/intro.ts`): sobre el campo de partículas se escribe "Hi, this is Pablo" letra a letra, justo donde va a estar el nombre; el saludo se borra hacia atrás dejando el nombre, y alrededor de él aparece el marco del núcleo, crecen las órbitas, llegan los electrones y por último las anotaciones. El nombre no se mueve: la intro se convierte en la página. Un clic o una tecla la salta; con `prefers-reduced-motion`, o en la segunda visita de la misma sesión, no se muestra (lo decide un script inline antes del primer pintado, para que nada parpadee). El texto se compone en `src/pages/index.astro` (`intro`).
- **El pie de figura se fecha solo:** "Observed Sep 2026" es la fecha de la build. La build es la observación.
- **El campo de partículas es un autómata celular** — la idea de von Neumann, la regla de Conway — corriendo sobre una retícula de puntos detrás de la lámina. Las células vivas brillan en cobalto y se encienden y apagan con suavidad en vez de parpadear; la figura descansa en un claro que termina justo pasadas las órbitas. Cuando el campo se queda demasiado quieto, dos fluctuaciones del vacío lo reavivan en algún punto. **El puntero es una fuente de vida, no una luz:** no se dibuja nada a su alrededor; a su paso nacen pequeños racimos de células que aparecen al instante y luego evolucionan como cualquier otra, dejando una estela de actividad cobalto que Life va apagando; las células vivas que atraviesa destellan un momento; y **un clic sobre la lámina vacía deja caer un glider** en una dirección al azar. Con `prefers-reduced-motion`, una sola generación, quieta, y sin puntero. **Corre en todas las páginas:** en la portada despeja un claro redondo alrededor del átomo; en las páginas de tópico, uno rectangular alrededor de la columna de texto (`src/scripts/field.ts`; las constantes de ajuste están arriba del todo).
- **Quietud:** con `prefers-reduced-motion` el script coloca el átomo una sola vez en su fase inicial, con los cruces resueltos, y no arranca el reloj (y lo recoloca en cada cambio de tamaño). Sin JavaScript, cada electrón lleva en el HTML su posición de reposo (`--fx`/`--fy` para el punto, `--tx0`/`--ty0` para la etiqueta), calculada en la build con la misma geometría: es la misma imagen que dibuja el script en el instante cero, así que cuando arranca no hay salto.
- **Geometría con una sola fuente de verdad:** `src/lib/atom-geometry.ts` (radios, tabla de longitud de arco, posición del punto, colgado de la etiqueta, respiración) lo usan tanto la build (posiciones de reposo) como el navegador (el movimiento), así el electrón está siempre exactamente sobre la línea y la etiqueta junto a él.
- **El *peek* cae debajo de la etiqueta** y la acompaña a donde vaya.
- **Se adapta al tamaño del átomo, no del viewport** (container queries): bajo 480 px desaparece la línea de rol del núcleo (el pie la conserva); bajo 420 px desaparece el *peek*, porque no hay hover que lo revele ni sitio para él.
- **Estilo: `skills/design4` (Atlantic)** — observatorio de medianoche en wireframe. Solo oscuro: lienzo negro, lámina en carbón, tipo blanco hielo que es también el color de todas las líneas ("un wireframe dibujado con luz"). Sin sombras ni degradados: la profundidad es escalonado de superficies. El **cobalto eléctrico** solo resalta — las partículas de los electrones, los puntos azules en las esquinas de cada marco, el asterisco junto a los títulos, la segunda palabra del nombre. El **naranja señal** solo para estados interactivos — hover, foco, la etiqueta *Building*. Por eso el halo del núcleo es ahora un marco plano con esquinas azules en vez de un degradado: mismo efecto de profundidad, sin romper la regla. Todos los colores están en `:root` al principio de `src/styles/rutherford.css`.
- **Tipografía:** una sola sans a un solo peso — Inter 400 (sustituto de Monument), con `-0.03em` en el nombre; la jerarquía la lleva el tamaño, nunca la negrita. JetBrains Mono a 10 px con tracking 0.16em para todas las anotaciones.

### Páginas de tópico

Cada electrón apunta a una página (`/work`, `/writing`, `/method`, `/elsewhere`) que usa `src/layouts/Topic.astro`: la misma lámina que la portada (marco, esquinas, campo de partículas detrás) con una columna de texto: un átomo pequeño como enlace de vuelta al núcleo, el número y título del electrón (tomados de `atom.ts`, así etiqueta, índice y título no pueden divergir), el contenido, y un pie mínimo.

### Hacer crecer el sitio

Añadir un tópico son dos pasos:

1. Un electrón en `src/data/atom.ts` — etiqueta, `href`, en qué órbita (`orbit`) y dónde empieza (`phase`, mantenerla < 0.5 para que descanse por delante del núcleo). El orden del array es el orden del índice.
2. La página en `src/pages/<slug>.astro` envuelta en `<Topic href="/<slug>">`, más su cuenta y su *peek* en el mapa `facts` de `src/pages/index.astro`.

Si el `href` de un electrón no tiene página, el enlace da 404; si una página usa un `href` sin electrón, la build falla con un error claro. Tres órbitas se leen como el símbolo; a partir de ~7 electrones las etiquetas empiezan a chocar cerca del núcleo.

## Borradores anteriores (`/drafts`)

Los cuatro primeros borradores siguen accesibles, cada uno en su ruta, con su hoja de estilos en `src/styles/<slug>.css` y su referencia de estilo en `skills/design<N>`.

| Ruta | Nombre | Dirección visual |
|---|---|---|
| `/drafts` | — | Índice comparador de los cuatro |
| `/aaru` | Aaru | Observatorio oscuro. Negro, azul eléctrico, lima ácido, tipografía ultraligera |
| `/pravah` | Pravah | Dossier en pergamino cálido, una inversión en berenjena |
| `/caldera` | Caldera | Caliza fundida, naranja ascua, display comprimido |
| `/atlantic` | Atlantic | Wireframe de medianoche, blanco hielo como bordes |

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
| Nombre, rol, ubicación, email, redes | `src/data/profile.ts` — alimenta el sitio y los cuatro borradores |
| Electrones, órbitas, velocidades, línea `now` | `src/data/atom.ts` |
| Texto y ritmo de la intro | `intro` en `src/pages/index.astro`; constantes al inicio de `src/scripts/intro.ts` |
| Densidad, paso y ritmo del campo de partículas | constantes al inicio de `src/scripts/field.ts` |
| Holgura, velocidad y muelle del esquivar de las etiquetas | constantes al inicio de `src/scripts/atom.ts` |
| Separación etiqueta–punto (`GAP`), respiración | `src/lib/atom-geometry.ts` |
| Principios (`/method`) | `src/data/principles.ts` |
| Proyectos (`/work`) | `src/data/projects.ts` |
| Artículos (`/writing`) | `src/content/writing/*.md` |
| Cuentas y *peeks* de cada electrón | mapa `facts` en `src/pages/index.astro` |
| Geometría de las órbitas | `RX`, `RY` en `src/lib/rutherford.ts` |
| Colores, tipografía, duraciones | `:root` en `src/styles/rutherford.css` |
| Dominio final | `astro.config.mjs` → campo `site` |

## Estado: el contenido todavía no es real

**Todo el contenido es de relleno.** Hasta que se sustituya, el sitio describe a una persona inventada.

Dos clases de placeholder, y solo una se detecta automáticamente:

1. **Marcados con `TODO —`** → `npm run todo` los lista, y en la página salen con un contorno naranja discontinuo para que no puedan publicarse por accidente. Están en `src/data/principles.ts` y en la línea `now` de `src/data/atom.ts`.
2. **Contenido plausible pero falso** → **el scanner no lo detecta.** `profile.ts` (`Pablo`, "Software engineer & indie builder", `Remote`, `hello@example.com`, redes que apuntan a la raíz de GitHub y X), los seis proyectos de `projects.ts` (Driftwood, Pinboard Radio, Tinylytics, Grove, Cadence, Ferry) y los cuatro artículos de `src/content/writing/`. Nada de eso existe.

## Siguientes pasos

- [ ] Sustituir `profile.ts` con datos reales, incluidos ubicación y email
- [ ] Sustituir `projects.ts` con proyectos reales, o vaciarlo si aún no hay
- [ ] Escribir la línea `now` en `atom.ts` y los tres principios en `principles.ts`
- [ ] Borrar los cuatro artículos de relleno de `src/content/writing/`
- [ ] Páginas por artículo (`src/pages/writing/[...slug].astro`) — ahora los artículos se listan pero no se pueden abrir
- [ ] Poner el dominio real en `astro.config.mjs`
- [ ] Favicon propio (`public/favicon.svg` es el de Astro) — el átomo es un favicon obvio
- [ ] Decidir si los cuatro borradores se conservan o se retiran
