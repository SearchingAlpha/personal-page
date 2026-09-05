// ── Placeholder projects ─────────────────────────────────────────────────────
// Replace with your real work. `featured: true` surfaces a project as the
// standout card in designs that support one (e.g. Caldera's Plasma hero card).

export type ProjectStatus = 'Shipped' | 'Building' | 'Prototype' | 'Archived';

export interface Project {
  name: string;
  year: number;
  status: ProjectStatus;
  blurb: string;
  url?: string;
  tags: string[];
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: 'Driftwood',
    year: 2026,
    status: 'Building',
    blurb:
      'A local-first note tool that syncs over your own storage. No accounts, no servers, just files you own.',
    url: 'https://example.com/driftwood',
    tags: ['local-first', 'TypeScript', 'CRDT'],
    featured: true,
  },
  {
    name: 'Pinboard Radio',
    year: 2025,
    status: 'Shipped',
    blurb:
      'Turns any set of RSS feeds into a personal, always-on audio station using on-device text-to-speech.',
    url: 'https://example.com/pinboard-radio',
    tags: ['audio', 'RSS', 'PWA'],
  },
  {
    name: 'Tinylytics',
    year: 2025,
    status: 'Shipped',
    blurb:
      'Privacy-first analytics in a single script tag. One number, no cookies, no dashboards to babysit.',
    url: 'https://example.com/tinylytics',
    tags: ['analytics', 'privacy', 'edge'],
  },
  {
    name: 'Grove',
    year: 2024,
    status: 'Prototype',
    blurb:
      'An experiment in growing a digital garden from your git history — commits become notes, notes become a map.',
    tags: ['digital-garden', 'git', 'visualization'],
  },
  {
    name: 'Cadence',
    year: 2024,
    status: 'Shipped',
    blurb:
      'A tiny habit tracker that lives in your terminal and nudges you with a single line a day.',
    url: 'https://example.com/cadence',
    tags: ['CLI', 'Rust', 'habits'],
  },
  {
    name: 'Ferry',
    year: 2023,
    status: 'Archived',
    blurb:
      'A self-hosted read-it-later service. Sunset once the ecosystem caught up — kept here as a fond footnote.',
    tags: ['self-hosted', 'Go'],
  },
];
