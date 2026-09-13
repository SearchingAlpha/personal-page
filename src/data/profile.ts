// ── Who ─────────────────────────────────────────────────────────────────────
// Name, role, where, how to reach me. Every page (the letter, the section
// pages, the drafts) reads these from here.

export interface SocialLink {
  label: string;
  handle: string;
  url: string;
}

export interface Profile {
  name: string;
  wordmark: string;
  role: string;
  /** Very short hero line (≤ 6 words) — used where the design wants a single terse statement. */
  headline: string;
  /** One-sentence hero label — used as a secondary line/aside. */
  subline: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  socials: SocialLink[];
}

export const profile: Profile = {
  name: 'Pablo',
  wordmark: 'pablo',
  role: 'Working in Amazon building genAI applications',
  headline: 'Building small things in the open.',
  subline: 'A public log of what I make.',
  tagline:
    'Engineer based in Luxembourg, working in Amazon building genAI applications and experimenting in the startup world.',
  bio: "By day I make Amazon's EU supply chain plan with less manual work: Python, SQL, dashboards and lately LLM agents. On the side I ship small projects out in the open. This is where I keep the log: what I'm making, what broke, and what I learned along the way.",
  location: 'Luxembourg',
  email: 'morvegpablo@gmail.com',
  socials: [
    { label: 'GitHub', handle: '@SearchingAlpha', url: 'https://github.com/SearchingAlpha' },
    { label: 'LinkedIn', handle: 'Pablo Moral Vega', url: 'https://www.linkedin.com/in/pablo-moral-vega-5154b9200/' },
    { label: 'X', handle: '@0xPmoral', url: 'https://x.com/0xPmoral' },
  ],
};
