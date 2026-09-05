// ── Rutherford: the atom page ────────────────────────────────────────────────
// The nucleus is your name and nothing else. Every topic of the site is an
// electron travelling on one of the orbits around it. Click an electron, open
// the topic.
//
// Growing the site is adding electrons here (and the page they point to in
// src/pages). Three orbits with one or two electrons each reads as the classic
// atom symbol; the layout tolerates more, but past ~7 electrons the labels
// start to collide near the nucleus.

export interface Electron {
  /** Link text. One or two words: it travels, so it must stay short. */
  label: string;
  /** Route of the topic page. A page with this path must exist in src/pages. */
  href: string;
  /**
   * Where on the orbit the electron starts, 0–1. 0 is the right-hand end of
   * the major axis, increasing clockwise. Also where it rests when the visitor
   * prefers reduced motion, so spread these out.
   */
  phase: number;
}

export interface Orbit {
  /** Tilt of the ellipse, degrees clockwise. 0 / 60 / 120 is the atom symbol. */
  tilt: number;
  /** Seconds per revolution. Slower is calmer; inner orbits should be faster. */
  period: number;
  direction: 'cw' | 'ccw';
  electrons: Electron[];
}

export const orbits: Orbit[] = [
  {
    tilt: 0,
    period: 84,
    direction: 'cw',
    electrons: [
      { label: 'Work', href: '/work', phase: 0 },
      { label: 'Elsewhere', href: '/elsewhere', phase: 0.5 },
    ],
  },
  {
    tilt: 60,
    period: 112,
    direction: 'ccw',
    electrons: [{ label: 'Writing', href: '/writing', phase: 0 }],
  },
  {
    tilt: 120,
    period: 140,
    direction: 'cw',
    electrons: [{ label: 'How I work', href: '/method', phase: 0.5 }],
  },
];

/** Looks up the electron for a topic page so its title stays single-sourced here. */
export function electronFor(href: string): Electron {
  for (const orbit of orbits) {
    const hit = orbit.electrons.find((e) => e.href === href);
    if (hit) return hit;
  }
  throw new Error(`atom.ts: no electron points at "${href}" — add one or fix the page.`);
}
