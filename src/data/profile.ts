// ── Personalize here ────────────────────────────────────────────────────────
// Everything below is placeholder content. Edit this one file to make the
// drafts your own — every design page reads name/tagline/socials from here.

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
  role: 'Software engineer & indie builder',
  headline: 'Building small things in the open.',
  subline: 'A public log of what I make.',
  tagline: 'Building small, useful things in public — and writing about how it goes.',
  bio: "I design and ship side projects out in the open. This is where I keep the log: what I'm making, what broke, and what I learned along the way.",
  location: 'Remote',
  email: 'hello@example.com',
  socials: [
    { label: 'GitHub', handle: '@pablo', url: 'https://github.com/' },
    { label: 'X', handle: '@pablo', url: 'https://x.com/' },
    { label: 'RSS', handle: 'Subscribe', url: '/rss.xml' },
  ],
};
