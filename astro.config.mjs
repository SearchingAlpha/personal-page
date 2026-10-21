// @ts-check
import { defineConfig } from 'astro/config';

// Static personal portfolio. The home is the letter, which becomes the graph;
// each earlier design is kept as its own route, listed at /drafts:
//   /letter      → the letter on its own (the home until Oct 2026)
//   /atom        → Rutherford
//   /aaru        → design1 (dark observatory)
//   /pravah      → design2 (warm parchment dossier)
//   /caldera     → design3 (molten limestone)
//   /atlantic    → design4 (midnight wireframe)
export default defineConfig({
  site: 'https://pablomoral.com',
});
