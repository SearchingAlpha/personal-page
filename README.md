# personal-page

Portfolio personal estático hecho con [Astro](https://astro.build) 5. Contiene **cuatro borradores de diseño** como rutas independientes, más un índice para compararlos y elegir.

## Los cuatro diseños

| Ruta | Nombre | Carpeta | Dirección visual |
|---|---|---|---|
| `/` | — | — | Índice comparador de los cuatro |
| `/aaru` | Aaru | `design1` | Observatorio científico oscuro. Lienzo negro, una sección azul eléctrico, CTA lima ácido, tipografía ultraligera |
| `/pravah` | Pravah | `design2` | Dossier de ingeniería en pergamino cálido. Una sola familia tipográfica, CTA en píldora, una inversión dramática en berenjena |
| `/caldera` | Caldera | `design3` | Caliza fundida |
| `/atlantic` | Atlantic | `design4` | Wireframe de medianoche |

Cada diseño tiene su hoja de estilos en `src/styles/<slug>.css`, su página en `src/pages/<slug>.astro` y su referencia de estilo en `skills/design<N>` (markdown con los tokens de color, tipografía y reglas de composición). Todos leen los mismos datos, así que cambiar el perfil se refleja en los cuatro.

## Desarrollo

```sh
npm install
npm run dev      # servidor local
npm run build    # genera dist/
npm run preview  # sirve dist/
```

## Dónde editar

| Qué | Dónde |
|---|---|
| Nombre, rol, bio, email, redes | `src/data/profile.ts` — **un solo fichero alimenta los cuatro diseños** |
| Proyectos | `src/data/projects.ts` |
| Artículos | `src/content/writing/*.md` |
| Dominio final | `astro.config.mjs` → campo `site` |

## Pendiente

- `astro.config.mjs` tiene `site: 'https://example.com'` — placeholder.
- `src/data/profile.ts` tiene contenido de relleno, incluido `hello@example.com`. El propio fichero lo avisa en su primera línea.
- Elegir uno de los cuatro diseños y retirar los otros tres (o quedarse con el índice como comparador permanente).
