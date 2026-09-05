# personal-page

Sitio personal estático hecho con [Astro](https://astro.build) 5. Sin JavaScript en cliente.

## El sitio: Orrery (`/`)

Un *orrery* es un modelo mecánico de un sistema solar: un cuerpo en el centro y el resto dispuesto a su alrededor, visiblemente conectado a él. Ese es todo el concepto.

**Tú eres el centro.** Cada satélite es una faceta tuya, unida al centro por una línea de un píxel para que la relación esté dibujada y no solo insinuada.

```
┌──────────────────────────────────┐
│ ┌ 01 what I build ┐ ┌ 02 write ┐ │
│ │ · proyecto      │ │ · art.   │ │
│ └────────┬────────┘ └────┬─────┘ │
│          │               │       │
│      ╔═══╧═══════════════╧═══╗   │
│      ║      PABLO           ║   │
│      ║   la línea "now"     ║   │
│      ╚═══╤═══════════════╤═══╝   │
│          │               │       │
│ ┌ 03 how I work ──┐ ┌ 04 else ─┐ │
│ │ 01 principio    │ │ · github │ │
│ └─────────────────┘ └──────────┘ │
└──────────────────────────────────┘
```

Decisiones de diseño:

- **La línea `now`** es lo más parecido a una tesis que tiene la página: una frase en presente sobre lo que estás haciendo ahora mismo, con la fecha en que era cierta. La marca de tiempo obliga a mantenerla.
- **Los conectores** son `::after` de un píxel de alto exactamente un `--gap`. Sin JavaScript y sin medir nada.
- **Empieza mínimo, escala a denso.** `hub.limits` en `src/data/hub.ts` controla cuántos elementos muestra cada satélite. Subir esos números añade densidad sin cambios estructurales.
- **En móvil el centro va primero.** Por debajo de 760 px el sistema colapsa a una columna con el hub arriba: en un teléfono la identidad debe llegar antes que sus facetas. Los conectores desaparecen porque una pila vertical ya se lee como conectada.
- **Retematizar es un solo bloque.** Todos los colores y ritmos están en `:root` al principio de `src/styles/orrery.css`, con modo oscuro automático vía `prefers-color-scheme`.
- **Tipografía:** Instrument Serif para el nombre y la línea `now`, IBM Plex Mono para etiquetas y metadatos, Inter para el cuerpo. Serif editorial más mono de panel de instrumentos, en vez del *sans* uniforme de la mayoría de portfolios.

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
| Línea `now`, principios, satélites, densidad | `src/data/hub.ts` |
| Proyectos | `src/data/projects.ts` |
| Artículos | `src/content/writing/*.md` |
| Colores, tipografía, ritmo | `:root` en `src/styles/orrery.css` |
| Dominio final | `astro.config.mjs` → campo `site` |

## Estado: el contenido todavía no es real

**Todo el contenido es de relleno.** Hasta que se sustituya, el sitio describe a una persona inventada.

Dos clases de placeholder, y solo una se detecta automáticamente:

1. **Marcados con `TODO —`** → `npm run todo` los lista, y en la página salen con un contorno naranja discontinuo para que no puedan publicarse por accidente. Están en `src/data/hub.ts`: la línea `now` y los tres principios.
2. **Contenido plausible pero falso** → **el scanner no lo detecta.** `profile.ts` (`Pablo`, "Software engineer & indie builder", `hello@example.com`, `Remote`, redes que apuntan a la raíz de GitHub y X), los seis proyectos de `projects.ts` (Driftwood, Pinboard Radio, Tinylytics, Grove, Cadence, Ferry) y los cuatro artículos de `src/content/writing/`. Nada de eso existe.

## Siguientes pasos

- [ ] Sustituir `profile.ts` con datos reales, incluido el email
- [ ] Sustituir `projects.ts` con proyectos reales, o vaciarlo si aún no hay
- [ ] Escribir la línea `now` y los tres principios en `hub.ts`
- [ ] Borrar los cuatro artículos de relleno de `src/content/writing/`
- [ ] Páginas por artículo (`src/pages/writing/[...slug].astro`) — ahora los artículos se listan pero no se pueden abrir
- [ ] Poner el dominio real en `astro.config.mjs`
- [ ] Favicon propio (`public/favicon.svg` es el de Astro)
- [ ] Decidir si los cuatro borradores se conservan o se retiran
