# personal-page

Sitio personal estático hecho con [Astro](https://astro.build) 5. Sin JavaScript en cliente.

## El sitio: Rutherford

La portada es un átomo. **El núcleo es el nombre y nada más.** Cada tópico del sitio es un electrón que recorre una órbita elíptica inclinada alrededor del núcleo — moviéndose de verdad, con CSS motion paths. Pulsas un electrón, se abre el tópico.

```
              ╭───────╮
        ╭─────┼───────┼─────╮        ● HOW I WORK
       ╭┼─────┼───────┼─────┼╮
   ●   ││     │ Pablo │     ││   ●
ELSEWHERE     ╰───────╯     ││  WORK
       ╰┼─────┼───────┼─────┼╯
        ╰─────┼───────┼─────╯
              ╰───────╯        ● WRITING
```

### Cómo está hecho

- **Órbitas:** una `div` con `border-radius: 50%` de 76 % × 30 % es una elipse real. Tres, rotadas 0°, 60° y 120°: el símbolo clásico del átomo.
- **Movimiento:** cada electrón sigue `offset-path: ellipse(...)` con una animación lineal infinita. Cero JavaScript.
- **Profundidad:** los electrones pasan *por delante* del núcleo en la mitad inferior de su órbita y *por detrás* en la superior. Se consigue animando el `z-index` de su carril en sincronía con el movimiento, más un halo del color del fondo detrás del nombre que los oculta al pasar por detrás. Es lo que hace que el dibujo plano se lea como un sólido.
- **Etiquetas siempre derechas:** el carril está rotado por la inclinación de su órbita; el cuerpo del electrón se contra-rota exactamente lo mismo.
- **Tocar un electrón detiene el átomo entero** (`:has()` + `animation-play-state`), para poder hacer clic con calma.
- **Quietud:** con `prefers-reduced-motion` los electrones descansan en su `phase`. Sin soporte de motion paths, se colocan en la posición precalculada. Ambos casos dan la misma imagen que el instante inicial.
- **Geometría con una sola fuente de verdad:** `RX`/`RY` en `src/lib/rutherford.ts` alimentan el anillo, el motion path y la posición estática, así el electrón está siempre exactamente sobre la línea.
- **Modo oscuro** automático vía `prefers-color-scheme`. Todos los colores y ritmos están en `:root` al principio de `src/styles/rutherford.css`.
- **Tipografía:** Instrument Serif para el nombre y los títulos, IBM Plex Mono para las etiquetas de los electrones y los metadatos, Inter para el cuerpo.

### Páginas de tópico

Cada electrón apunta a una página (`/work`, `/writing`, `/method`, `/elsewhere`) que usa `src/layouts/Topic.astro`: un pequeño átomo como enlace de vuelta al núcleo, el título del tópico (tomado de `atom.ts`, así etiqueta y título no pueden divergir), el contenido, y un pie mínimo.

### Hacer crecer el sitio

Añadir un tópico son dos pasos:

1. Un electrón en `src/data/atom.ts` (etiqueta, `href`, `phase`, en qué órbita).
2. La página en `src/pages/<slug>.astro` envuelta en `<Topic href="/<slug>">`.

Si el `href` de un electrón no tiene página, el enlace da 404; si una página usa un `href` sin electrón, la build falla con un error claro. Tres órbitas con uno o dos electrones cada una se leen como el símbolo; a partir de ~7 electrones las etiquetas empiezan a chocar cerca del núcleo.

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
| Nombre, rol, email, redes | `src/data/profile.ts` — alimenta el sitio y los cuatro borradores |
| Electrones, órbitas, velocidades | `src/data/atom.ts` |
| Principios (`/method`) | `src/data/principles.ts` |
| Proyectos (`/work`) | `src/data/projects.ts` |
| Artículos (`/writing`) | `src/content/writing/*.md` |
| Geometría de las órbitas | `RX`, `RY` en `src/lib/rutherford.ts` |
| Colores, tipografía, duraciones | `:root` en `src/styles/rutherford.css` |
| Dominio final | `astro.config.mjs` → campo `site` |

## Estado: el contenido todavía no es real

**Todo el contenido es de relleno.** Hasta que se sustituya, el sitio describe a una persona inventada.

Dos clases de placeholder, y solo una se detecta automáticamente:

1. **Marcados con `TODO —`** → `npm run todo` los lista, y en la página salen con un contorno naranja discontinuo para que no puedan publicarse por accidente. Están en `src/data/principles.ts`.
2. **Contenido plausible pero falso** → **el scanner no lo detecta.** `profile.ts` (`Pablo`, `hello@example.com`, redes que apuntan a la raíz de GitHub y X), los seis proyectos de `projects.ts` (Driftwood, Pinboard Radio, Tinylytics, Grove, Cadence, Ferry) y los cuatro artículos de `src/content/writing/`. Nada de eso existe.

## Siguientes pasos

- [ ] Sustituir `profile.ts` con datos reales, incluido el email
- [ ] Sustituir `projects.ts` con proyectos reales, o vaciarlo si aún no hay
- [ ] Escribir los tres principios en `principles.ts`
- [ ] Borrar los cuatro artículos de relleno de `src/content/writing/`
- [ ] Páginas por artículo (`src/pages/writing/[...slug].astro`) — ahora los artículos se listan pero no se pueden abrir
- [ ] Poner el dominio real en `astro.config.mjs`
- [ ] Favicon propio (`public/favicon.svg` es el de Astro) — el átomo es un favicon obvio
- [ ] Decidir si los cuatro borradores se conservan o se retiran
