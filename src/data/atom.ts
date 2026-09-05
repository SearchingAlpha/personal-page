// ── Rutherford: the atom page ────────────────────────────────────────────────
// The nucleus is your name. Every topic of the site is an electron travelling
// on one of the orbits around it. Click an electron, open the topic.
//
// `electrons` is in display order: it drives the numbering (01, 02…) in the
// legend and on the topic pages. Which orbit an electron rides is a separate
// choice, made per electron with `orbit`.
//
// Growing the site is adding an electron here and its page in src/pages.
// Three orbits reads as the classic atom symbol; past ~7 electrons the labels
// start to collide near the nucleus.

export interface Orbit {
  /** Tilt of the ellipse, degrees clockwise. 0 / 60 / 120 is the atom symbol. */
  tilt: number;
  /** Seconds per revolution. Slower is calmer. */
  period: number;
  direction: 'cw' | 'ccw';
}

export interface Electron {
  /** Link text. One or two words: it travels, so it must stay short. */
  label: string;
  /** Route of the topic page. A page with this path must exist in src/pages. */
  href: string;
  /** Index into `orbits`. */
  orbit: number;
  /**
   * Where on the orbit the electron starts, 0–1. 0 is the right-hand end of
   * the major axis, increasing clockwise. Also where it rests when the visitor
   * prefers reduced motion, so spread these out — and keep them below 0.5:
   * the upper half of the orbit is "behind" the nucleus, and an electron
   * resting there is veiled by the halo.
   */
  phase: number;
}

export const orbits: Orbit[] = [
  { tilt: 0, period: 84, direction: 'cw' },
  { tilt: 60, period: 112, direction: 'ccw' },
  { tilt: 120, period: 140, direction: 'cw' },
];

export const electrons: Electron[] = [
  { label: 'Work', href: '/work', orbit: 0, phase: 0 },
  { label: 'Writing', href: '/writing', orbit: 1, phase: 0 },
  { label: 'How I work', href: '/method', orbit: 2, phase: 0.47 },
  { label: 'Elsewhere', href: '/elsewhere', orbit: 0, phase: 0.47 },
];

// ── The plate ────────────────────────────────────────────────────────────────
// The margins around the atom, as on a figure in a lab notebook. Anything
// prefixed `TODO —` is a placeholder: outlined on screen, listed by `npm run todo`.

export interface Plate {
  /** Figure label under the atom. */
  figure: string;
  /** One line, present tense: what you are actually doing right now. */
  now: string;
  /** When `now` was last true. Shown next to it — keeps you honest. */
  nowUpdated: string;
}

export const plate: Plate = {
  figure: 'Fig. 1',
  now: 'TODO — one line, present tense: what are you doing right now?',
  nowUpdated: 'TODO — Month YYYY',
};

/** Zero-padded position of an electron in display order: "01", "02"… */
export function electronIndex(e: Electron): string {
  return String(electrons.indexOf(e) + 1).padStart(2, '0');
}

/** Looks up the electron for a topic page so its title stays single-sourced here. */
export function electronFor(href: string): Electron {
  const hit = electrons.find((e) => e.href === href);
  if (!hit) throw new Error(`atom.ts: no electron points at "${href}" — add one or fix the page.`);
  return hit;
}
