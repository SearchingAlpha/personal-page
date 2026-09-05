// ── Orrery: the centre-and-satellites page ──────────────────────────────────
// The hub is you. Each satellite is one facet of you, rendered around the hub.
//
// This file holds only what is specific to that layout. Name, role, bio, email
// and socials still come from `profile.ts`; projects from `projects.ts`;
// writing from the `writing` content collection.
//
// Anything prefixed `TODO —` is a placeholder. Run `npm run todo` to list them.

export interface Satellite {
  /** Stable id, also used as the CSS modifier: .sat--<id> */
  id: string;
  /** Ordinal shown in the satellite's corner. Purely typographic. */
  index: string;
  /** Small mono label in the satellite header. */
  label: string;
  /** Which row the satellite sits in — decides which way its connector runs. */
  edge: 'top' | 'bottom';
  /** Optional destination for the satellite's footer link. */
  href?: string;
  /** Optional text for that link. Falls back to nothing. */
  hrefLabel?: string;
}

export interface Hub {
  /** One line, present tense, what you are doing right now. The heart of the page. */
  now: string;
  /** When `now` was last true. Shown as a small timestamp — keeps you honest. */
  nowUpdated: string;
  /** Two or three short lines on how you work. Kept terse on purpose. */
  principles: string[];
  /**
   * How many items each satellite shows. This is the dial between "minimal"
   * and "dense": raise the numbers as you add real content and the layout
   * absorbs it without structural changes.
   */
  limits: {
    projects: number;
    writing: number;
    principles: number;
  };
  satellites: Satellite[];
}

export const hub: Hub = {
  now: 'TODO — one line, present tense: what are you actually doing right now?',
  nowUpdated: 'TODO — Month YYYY',

  principles: [
    'TODO — how you work, in one line.',
    'TODO — something you believe that others in your field do not.',
    'TODO — what you refuse to do.',
  ],

  limits: {
    projects: 3,
    writing: 3,
    principles: 3,
  },

  satellites: [
    {
      id: 'work',
      index: '01',
      label: 'What I build',
      edge: 'top',
    },
    {
      id: 'writing',
      index: '02',
      label: 'What I write',
      edge: 'top',
    },
    {
      id: 'method',
      index: '03',
      label: 'How I work',
      edge: 'bottom',
    },
    {
      id: 'elsewhere',
      index: '04',
      label: 'Elsewhere',
      edge: 'bottom',
    },
  ],
};
