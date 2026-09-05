import type { Electron, Orbit } from '../data/atom';

// Google Fonts for the Rutherford design, shared by the atom and topic pages.
// Design4 substitutes: Inter for Monument, JetBrains Mono for Mono — both at a
// single weight, as the reference demands.
export const FONT_LINKS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400&family=JetBrains+Mono:wght@400&display=swap',
];

// Orbit geometry as a percentage of the (square) atom box. The ring, the
// motion path and the no-motion fallback all read these, so the electrons
// always sit exactly on the line.
export const RX = 38;
export const RY = 15;

/**
 * Inline custom properties for one electron's lane.
 *
 * - `--delay` starts the animation at `phase`. A reversed animation runs
 *   backwards, so its delay is measured from the other end.
 * - `--fx/--fy` are the electron's static position for browsers without
 *   motion paths; `--z` is whether that position is in front of or behind the
 *   nucleus (bottom half of the ellipse reads as "in front").
 */
export function laneStyle(orbit: Orbit, e: Electron): string {
  const delayPhase = orbit.direction === 'ccw' ? 1 - e.phase : e.phase;
  const theta = e.phase * 2 * Math.PI;
  return [
    `--tilt:${orbit.tilt}deg`,
    `--period:${orbit.period}s`,
    `--dir:${orbit.direction === 'ccw' ? 'reverse' : 'normal'}`,
    `--phase:${e.phase}`,
    `--delay:${(-delayPhase * orbit.period).toFixed(2)}s`,
    `--z:${e.phase < 0.5 ? 3 : 1}`,
    `--fx:${(50 + RX * Math.cos(theta)).toFixed(2)}%`,
    `--fy:${(50 + RY * Math.sin(theta)).toFixed(2)}%`,
  ].join(';');
}

/** Flags leftover placeholder copy so it cannot ship unnoticed. */
export const todoClass = (value: string) =>
  value.trimStart().startsWith('TODO') ? 'is-todo' : '';
