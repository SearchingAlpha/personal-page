// ── Projects ─────────────────────────────────────────────────────────────────
// Newest first is decided by `year` (and `featured`) in src/lib/content.ts, not
// by the order here. `featured: true` surfaces a project as the standout in
// designs that support one. A `url` makes the entry's title a link on
// /projects; `posts` are the places you wrote about it (a thread, a LinkedIn
// post), listed under the entry.
//
// /projects is two grids. `active: true` puts an entry among the active
// projects — two to a row, each with its `image` — and everything else goes
// under "other projects", three to a row, title and a line. Each entry is a
// short summary (`blurb`) and, for the active ones, the specifics as bullet
// points (`points`): the thesis, the milestones, the numbers — one line each.
// Prose may carry [text](url) links (numbered references) and **bold**.

// `Building` is not yet out; `Growing` is live and open-ended — a project with
// no finish line that keeps getting bigger; `Day job` is the work I am paid
// for. All three read as live on /projects.
export type ProjectStatus = 'Shipped' | 'Building' | 'Growing' | 'Day job' | 'Prototype' | 'Archived';

export const LIVE: ProjectStatus[] = ['Building', 'Growing', 'Day job'];

export interface Project {
  name: string;
  /** The year it started — used to sort, and shown unless `when` says otherwise. */
  year: number;
  /** How the date reads on the page when a year is not enough: "2024 –". */
  when?: string;
  status: ProjectStatus;
  /** Among the active projects on /projects, with a picture. */
  active?: boolean;
  /** The picture on an active card, 16:9. `credit` is shown under it. */
  image?: { src: string; alt: string; credit?: string };
  /** The summary: what it is, in two or three sentences. */
  blurb: string;
  /** The specifics under the summary, one line each. Active projects only. */
  points?: string[];
  url?: string;
  /** What kind of thing it is, a few words shown under the title. */
  tags: string[];
  featured?: boolean;
  posts?: { label: string; url: string }[];
}

export const projects: Project[] = [
  {
    name: 'ShortLoad',
    year: 2026,
    status: 'Growing',
    active: true,
    image: { src: '/projects/shortload.jpg', alt: 'The ShortLoad home page: size your pour, get a price for your ZIP.' },
    blurb:
      'A Florida marketplace for **small concrete pours**, one to four yards: an all-in price by ZIP, a bookable window, pay for what is poured. The thesis:',
    points: [
      'A **two-billion-dollar market** in Florida alone, split among hundreds of local operators, each with its own rates and a phone number. **Nobody publishes a price.**',
      'Built for **LLM discovery**: structured data and an llms.txt, so that when a chat agent is asked what two yards cost in a Florida ZIP, the answer with a real price is ours. More on the [about page](https://getshortload.com/about).',
    ],
    url: 'https://getshortload.com',
    tags: ['Marketplace', 'Founder', 'Florida'],
    featured: true,
  },
  {
    name: 'Polymarket supply-chain intel',
    year: 2026,
    status: 'Prototype',
    blurb:
      'Can **prediction markets** work as an early-warning system for supply chain risk? A methodology and an MVP that track Polymarket odds on tariffs, conflicts and port strikes against the **Baltic Dry** and **Freightos** indexes: cross-correlation, Granger tests, event studies.',
    url: 'https://github.com/SearchingAlpha/polymarket-scm-intel',
    tags: ['Research', 'Python', 'Open source'],
    posts: [
      { label: 'Thread on X', url: 'https://x.com/0xPmoral/status/2027136393202307291' },
      { label: 'On LinkedIn', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7431623978831482880/' },
    ],
  },
  {
    name: 'Amazon supply chain',
    year: 2024,
    when: '2024 –',
    status: 'Day job',
    active: true,
    image: {
      src: '/projects/amazon.jpg',
      alt: 'The Amazon fulfilment centre in Werne, Germany, at dusk.',
      credit: 'Photo: [Icy2008](https://commons.wikimedia.org/wiki/File:Amazon_Logistikzentrum_Werne.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)',
    },
    blurb:
      "The day job since 2024: **outbound planning** for Amazon's European non-sortable network, from Luxembourg. So far:",
    points: [
      'Redesigned the daily outbound planning process: forecast accuracy up **167 basis points** year on year, savings near **€8M a year**.',
      "Built a **GenAI agent** that writes each analyst's daily operational narrative in **under three minutes** instead of thirty to sixty.",
    ],
    tags: ['Supply chain', 'Senior analyst', 'Luxembourg'],
  },
];
