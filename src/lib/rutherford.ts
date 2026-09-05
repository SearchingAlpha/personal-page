import type { Electron, Orbit } from '../data/atom';
import { GAP, dotAt } from './atom-geometry';

export { RX, RY, GAP } from './atom-geometry';

// Google Fonts for the Rutherford design, shared by the atom and topic pages.
// Design4 substitutes: Inter for Monument, JetBrains Mono for Mono — both at a
// single weight, as the reference demands.
export const FONT_LINKS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400&family=JetBrains+Mono:wght@400&display=swap',
];

/**
 * Inline custom properties for one electron: where it and its tag rest when
 * the script is not running (no JavaScript, or before it starts). The script
 * takes over from here without a jump, because it starts at the same phase.
 *
 * - `--fx/--fy`: the dot, % of the atom box.
 * - `--tx0/--ty0`: the tag's translate, hung radially outward with a squared-
 *   off direction (beside the dot at the sides, centred above and below).
 * - `--flip0`: the same for small atoms, where tags only go above or below.
 */
export function electronStyle(orbit: Orbit, e: Electron): string {
  const { x, y, ux, uy } = dotAt(orbit, e.phase);
  const m = Math.max(Math.abs(ux), Math.abs(uy)) || 1;
  const part = (u: number) => `calc(${(GAP * u).toFixed(2)}px + ${(50 * (u / m - 1)).toFixed(2)}%)`;
  return [
    `--fx:${(50 + 100 * x).toFixed(2)}%`,
    `--fy:${(50 + 100 * y).toFixed(2)}%`,
    `--tx0:${part(ux)}`,
    `--ty0:${part(uy)}`,
    `--flip0:${uy >= 0 ? `${GAP}px` : `calc(${-GAP}px - 100%)`}`,
  ].join(';');
}

/** Flags leftover placeholder copy so it cannot ship unnoticed. */
export const todoClass = (value: string) =>
  value.trimStart().startsWith('TODO') ? 'is-todo' : '';
