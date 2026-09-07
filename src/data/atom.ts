// ── Rutherford: the atom page (draft, /atom) ─────────────────────────────────
// The nucleus is your name. Every section of the site is an electron travelling
// on one of the orbits around it. Click an electron, open the section.
//
// Which sections exist, their titles and routes, and the "now" line come from
// src/data/letter.ts, the site's single source; this file only adds what the
// atom needs — which orbit each one rides and where it starts.
//
// `electrons` is in display order: it drives the numbering (01, 02…) in the
// atom's legend. Three orbits reads as the classic atom symbol; past ~7
// electrons the labels start to collide near the nucleus.

import { now, sectionFor, type Section } from './letter';

export interface Orbit {
  /** Tilt of the ellipse, degrees clockwise. 0 / 60 / 120 is the atom symbol. */
  tilt: number;
  /** Seconds per revolution. Slower is calmer. */
  period: number;
  direction: 'cw' | 'ccw';
}

export interface Electron extends Section {
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
  { ...sectionFor('/projects'), orbit: 0, phase: 0 },
  { ...sectionFor('/writing'), orbit: 1, phase: 0 },
  { ...sectionFor('/about'), orbit: 2, phase: 0.47 },
  { ...sectionFor('/elsewhere'), orbit: 0, phase: 0.47 },
];

// ── The plate ────────────────────────────────────────────────────────────────
// The margins around the atom, as on a figure in a lab notebook.

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
  now: now.text,
  nowUpdated: now.updated,
};

/** Zero-padded position of an electron in display order: "01", "02"… */
export function electronIndex(e: Electron): string {
  return String(electrons.indexOf(e) + 1).padStart(2, '0');
}

/** Looks up the electron for a section page (used by the /atom draft). */
export function electronFor(href: string): Electron {
  const hit = electrons.find((e) => e.href === href);
  if (!hit) throw new Error(`atom.ts: no electron points at "${href}" — add one or fix the page.`);
  return hit;
}
