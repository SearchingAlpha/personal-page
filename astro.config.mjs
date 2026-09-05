// @ts-check
import { defineConfig } from 'astro/config';

// Static personal portfolio. Each design draft is its own route:
//   /            → chooser index
//   /aaru        → design1 (dark observatory)
//   /pravah      → design2 (warm parchment dossier)
//   /caldera     → design3 (molten limestone)
//   /atlantic    → design4 (midnight wireframe)
export default defineConfig({
  site: 'https://example.com',
});
