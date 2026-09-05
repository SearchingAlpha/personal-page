import type { Orbit } from '../data/atom';

// ── Rutherford: the geometry of the atom ─────────────────────────────────────
// Pure functions, no DOM. Shared by the build (the resting positions written
// into the HTML, see rutherford.ts) and the browser (the motion, see
// src/scripts/atom.ts), so the two can never disagree.
//
// Lengths are fractions of the atom's width unless a name says px.

/** Orbit radii, % of the atom box. The ring in CSS reads the same numbers. */
export const RX = 44;
export const RY = 22;

/** Pixels from the centre of a dot to the nearest point of its tag. */
export const GAP = 11;

// ── Arc length ───────────────────────────────────────────────────────────────
// Electrons move at constant speed along the ellipse, so their position is a
// fraction of the perimeter, not an angle; on a 2:1 ellipse the two differ by
// up to ~20°. This table turns one into the other.

const SAMPLES = 1440;
const ARC: number[] = (() => {
  const out = [0];
  let x0 = RX;
  let y0 = 0;
  for (let i = 1; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * 2 * Math.PI;
    const x = RX * Math.cos(t);
    const y = RY * Math.sin(t);
    out.push(out[i - 1] + Math.hypot(x - x0, y - y0));
    x0 = x;
    y0 = y;
  }
  const total = out[SAMPLES];
  return out.map((s) => s / total);
})();

/** Parametric angle (radians, clockwise from 3 o'clock) at arc fraction `p`. */
export function thetaAt(p: number): number {
  p = ((p % 1) + 1) % 1;
  let lo = 0;
  let hi = SAMPLES;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ARC[mid] <= p) lo = mid;
    else hi = mid;
  }
  const span = ARC[hi] - ARC[lo] || 1;
  return ((lo + (p - ARC[lo]) / span) / SAMPLES) * 2 * Math.PI;
}

// ── Where a dot is ───────────────────────────────────────────────────────────

export interface Dot {
  /** Offset from the atom's centre, fraction of the atom's width; y down. */
  x: number;
  y: number;
  /** Unit vector from the atom's centre through the dot. */
  ux: number;
  uy: number;
  /** +1 at the nearest point of the orbit, −1 at the farthest: the depth cue. */
  depth: number;
}

/** The dot at arc fraction `p` of `orbit`, in the atom's frame. */
export function dotAt(orbit: Orbit, p: number): Dot {
  const th = thetaAt(p);
  const lx = (RX / 100) * Math.cos(th);
  const ly = (RY / 100) * Math.sin(th);
  const t = (orbit.tilt * Math.PI) / 180;
  const x = lx * Math.cos(t) - ly * Math.sin(t);
  const y = lx * Math.sin(t) + ly * Math.cos(t);
  const len = Math.hypot(x, y) || 1;
  return { x, y, ux: x / len, uy: y / len, depth: Math.sin(th) };
}

/** Near electrons swell a little; far ones shrink and fade. */
export function breathe(depth: number): { scale: number; opacity: number } {
  return depth >= 0
    ? { scale: 1 + 0.06 * depth, opacity: 1 }
    : { scale: 1 + 0.14 * depth, opacity: 1 + 0.2 * depth };
}

// ── Where a tag hangs ────────────────────────────────────────────────────────

/**
 * Centre of a w×h tag (px) hung from its dot in direction (ux, uy), so that
 * the tag's nearest point is exactly GAP px from the dot: the ray from the
 * dot meets the rounded rectangle of half-extents (w/2 + GAP, h/2 + GAP) with
 * corners of radius GAP. Beside the dot along the sides, above and below it
 * along the top and bottom, and round the corners in between — a C¹ curve,
 * so a tag turning round its dot never changes speed abruptly.
 */
export function hangCentre(ux: number, uy: number, w: number, h: number): { x: number; y: number } {
  const ax = Math.abs(ux);
  const ay = Math.abs(uy);
  if (ax > 0) {
    const t = (w / 2 + GAP) / ax;
    if (Math.abs(t * uy) <= h / 2) return { x: t * ux, y: t * uy };
  }
  if (ay > 0) {
    const t = (h / 2 + GAP) / ay;
    if (Math.abs(t * ux) <= w / 2) return { x: t * ux, y: t * uy };
  }
  const kx = Math.sign(ux) * (w / 2);
  const ky = Math.sign(uy) * (h / 2);
  const uk = ux * kx + uy * ky;
  const t = uk + Math.sqrt(Math.max(0, uk * uk - (kx * kx + ky * ky) + GAP * GAP));
  return { x: t * ux, y: t * uy };
}
