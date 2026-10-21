// ── The graph (the home page, after the letter) ──────────────────────────────
// Everything on the site as one network, with the name at its centre: where I
// worked and studied, what I am building, the places, and what I read and
// listen to. A few ideas sit between them — the day job and the shelf meet at
// "supply chain", the side projects and the books at "markets" — and those
// crossings are what makes it a graph rather than a list.
//
// Books, podcasts, themes and projects come from the other data files; this
// file adds what they do not hold: the places, the jobs and studies (from the
// CV), the ideas, and the edges between them all.
import { profile } from './profile';
import { projects } from './projects';
import { books, podcasts, themes } from './interests';
import { countWord } from '../lib/letter';

export type Kind = 'me' | 'work' | 'study' | 'project' | 'place' | 'idea' | 'hub' | 'theme' | 'book' | 'podcast';

export interface Node {
  id: string;
  label: string;
  kind: Kind;
  /** Still going: drawn in the accent. */
  live?: boolean;
  /** A line over the card: when and where. */
  meta?: string;
  /** The card's words. May carry **bold**. */
  detail?: string;
  /** Where the card leads. */
  href?: string;
  /** A favourite book: a step bigger. */
  favourite?: boolean;
}

export type Edge = [string, string];

const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1');
const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const project = (name: string) => projects.find((p) => p.name === name)!;

const shortload = project('ShortLoad');
const polymarket = project('Polymarket supply-chain intel');
const amazon = project('Amazon supply chain');

const nodes: Node[] = [
  { id: 'me', label: profile.name, kind: 'me', detail: profile.tagline, href: '/', meta: profile.location },

  { id: 'valencia', label: 'Valencia', kind: 'place', detail: 'Where I am from.', href: '/about' },
  { id: 'barcelona', label: 'Barcelona', kind: 'place', href: '/about' },
  { id: 'luxembourg', label: 'Luxembourg', kind: 'place', live: true, detail: 'Where I live and work, since 2024.', href: '/about' },
  { id: 'florida', label: 'Florida', kind: 'place', detail: "ShortLoad's market.", href: '/projects' },

  {
    id: 'amazon', label: 'Amazon', kind: 'work', live: true, meta: 'Since 2023 · Barcelona, then Luxembourg', href: '/projects',
    detail: `${plain(amazon.blurb)} ${plain(amazon.points?.[0] ?? '')}`,
  },
  {
    id: 'mango', label: 'Mango', kind: 'work', meta: '2023 – 2024 · Barcelona', href: '/about',
    detail: 'Configured the **WMS for a new Mango warehouse** and built its test automation.',
  },
  {
    id: 'kubota', label: 'Kubota', kind: 'work', meta: '2022 · Valencia', href: '/about',
    detail: 'Planned production at **Pulverizadores Fede**, a Kubota company.',
  },
  {
    id: 'upv', label: 'UPV', kind: 'study', meta: 'Valencia', href: '/about',
    detail: '**Mechanical engineer** by training, at the Universitat Politècnica de València.',
  },
  {
    id: 'fsupv', label: 'Formula Student', kind: 'study', meta: '2020 – 2022 · Valencia', href: '/about',
    detail: 'Two years in the **FSUPV** team, third in the world in 2022: structures first, then **Head of Dynamics**.',
  },

  { id: 'shortload', label: shortload.name, kind: 'project', live: true, meta: `${shortload.status} · ${shortload.year}`, detail: plain(shortload.blurb), href: shortload.url },
  { id: 'polymarket', label: 'Polymarket intel', kind: 'project', meta: `${polymarket.status} · ${polymarket.year}`, detail: plain(polymarket.blurb), href: polymarket.url },

  { id: 'supply-chain', label: 'supply chain', kind: 'idea', href: '/projects' },
  { id: 'llm-agents', label: 'LLM agents', kind: 'idea', live: true, href: '/projects' },
  { id: 'markets', label: 'markets', kind: 'idea', href: '/projects' },
  { id: 'engineering', label: 'engineering', kind: 'idea', href: '/about' },

  { id: 'reading', label: 'What I read', kind: 'hub', href: '/interests#books', detail: `${countWord(books.length)} books, filed under ${countWord(themes.length)} themes.` },
  { id: 'listening', label: 'What I listen to', kind: 'hub', href: '/interests#podcasts', detail: `${countWord(podcasts.length)} podcasts.` },

  ...themes.map((t) => ({
    id: `theme-${slug(t)}`, label: t, kind: 'theme' as const, href: '/interests#books',
    detail: `${countWord(books.filter((b) => b.theme === t).length)} books.`,
  })),
  ...books.map((b) => ({
    id: `book-${slug(b.title)}`, label: b.title, kind: 'book' as const, meta: b.author, href: '/interests#books',
    favourite: b.favourite, detail: `${b.blurb ?? ''}${b.favourite ? ' One of my favourites.' : ''}`.trim(),
  })),
  ...podcasts.map((p) => ({ id: `podcast-${slug(p.name)}`, label: p.name, kind: 'podcast' as const, meta: p.by, href: p.spotify, detail: p.blurb })),
];

const book = (title: string) => `book-${slug(title)}`;
const theme = (t: string) => `theme-${slug(t)}`;

const edges: Edge[] = [
  ['me', 'amazon'], ['me', 'mango'], ['me', 'kubota'], ['me', 'upv'],
  ['me', 'shortload'], ['me', 'polymarket'], ['me', 'reading'], ['me', 'listening'],
  ['me', 'valencia'], ['me', 'luxembourg'],
  ['upv', 'fsupv'], ['upv', 'valencia'], ['kubota', 'valencia'],
  ['mango', 'barcelona'], ['amazon', 'barcelona'], ['amazon', 'luxembourg'],
  ['shortload', 'florida'],
  // The ideas: where the work, the projects and the shelf cross.
  ['supply-chain', 'amazon'], ['supply-chain', 'mango'], ['supply-chain', 'kubota'], ['supply-chain', 'polymarket'], ['supply-chain', book('The Box')],
  ['llm-agents', 'amazon'], ['llm-agents', 'shortload'],
  ['markets', 'polymarket'], ['markets', 'shortload'], ['markets', theme('Money & markets')],
  ['engineering', 'upv'], ['engineering', 'fsupv'], ['engineering', 'kubota'], ['engineering', theme('Science & engineering')],
  ...themes.map((t): Edge => ['reading', theme(t)]),
  ...books.map((b): Edge => [theme(b.theme), book(b.title)]),
  ...podcasts.map((p): Edge => ['listening', `podcast-${slug(p.name)}`]),
];

// Every edge must join two nodes that exist: a typo fails the build, not the page.
const ids = new Set(nodes.map((n) => n.id));
for (const [a, b] of edges) if (!ids.has(a) || !ids.has(b)) throw new Error(`graph.ts: edge ${a} — ${b} names a node that does not exist.`);

export const graph = { nodes, edges };
