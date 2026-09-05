import type { Orbit } from '../data/atom';
import { breathe, dotAt, hangCentre } from '../lib/atom-geometry';

// ── The atom ─────────────────────────────────────────────────────────────────
// One loop moves everything: each frame it works out where every electron is
// from the clock alone (its orbit, its phase, the time elapsed), and where
// every tag should hang, and writes both as transforms. No motion paths, no
// keyframes, no reading positions back from the page — so the picture is
// exact (a dot is on its ring to the pixel) and the same on every browser.
//
// A tag hangs radially outward from its dot. Electrons on different orbits
// still pass each other, and where they do, two tags would cross. Each frame,
// every tag looks for the direction nearest its radial one in which it is in
// nobody's way — not another tag's, not the nucleus's, not another dot's, not
// the plate's edge — and a damped spring carries it there: it never steps, it
// glides, and it never moves faster than VMAX. Who yields is fixed — a wider
// tag never moves for a narrower one — so no two tags ever chase each other.
//
// A tag that has begun to dodge one way round its dot keeps to that side for
// as long as there is room on it: turning back would mean sweeping through
// whatever it is dodging. Which side it takes at the start is decided by
// looking LOOK seconds ahead along the orbits — the side that will have room
// when the electrons are closest — so it rarely regrets the choice.
//
// Holding an electron (hover or focus) stops the clock, so the atom holds
// still while it is being read; the tags still settle. With reduced motion,
// or without this script, the atom stands at its starting phase.

const CLEAR = 6; // px a tag likes to keep from anything else
const TIGHT = 2; // px it will settle for, sooner than sweep across another tag
const SQUEEZE = 6; // px it will even let itself be overlapped by, sooner than that
const SWEEP = 150; // degrees a tag may turn round its dot, either way
const SCAN = 3; // degrees between the directions a tag tries
const CHEAP = 20; // degrees: a blocked stretch this narrow may be crossed to change sides
const LOOK = 4; // seconds ahead a tag looks when choosing its side
const OMEGA = 10; // 1/s: the spring's stiffness (settles in ~0.4 s)
const VMAX = 150; // degrees/s: the fastest a tag may turn
const FADE = 0.18; // s: a tag that must cross another fades out, moves, fades in

interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

/** Where an electron is: dot, radial direction, breathing scale. */
interface Spot {
  x: number; // dot, px from the atom's centre
  y: number;
  ux: number; // unit vector, centre → dot
  uy: number;
  s: number; // breathing scale
}

interface E extends Spot {
  el: HTMLElement;
  body: HTMLElement;
  tag: HTMLElement;
  orbit: Orbit;
  phase: number;
  dir: number; // +1 clockwise, −1 counter
  half: number; // half the electron's box, px
  tw: number; // the tag's layout size, px
  th: number;
  swing: number; // degrees the tag is turned from its radial direction
  v: number; // degrees/s
  side: number; // which side it is dodging to: ±1, or 0 when at rest
  crossing: boolean; // seek found it must cross to the other side
  fadeEnd: number; // while > 0, the tag is faded out and will reappear at its target
  box: Box; // the tag, atom coordinates
}

function box(l: number, t: number, w: number, h: number): Box {
  return { l, t, r: l + w, b: t + h, w, h, cx: l + w / 2, cy: t + h / 2 };
}

/** How much two boxes intrude on each other: 0 once they are `gap` apart,
 *  rising smoothly to 1 as their centres meet. */
function overlap(a: Box, b: Box, gap: number) {
  const X = (a.w + b.w) / 2 + gap;
  const Y = (a.h + b.h) / 2 + gap;
  const dx = Math.abs(a.cx - b.cx);
  const dy = Math.abs(a.cy - b.cy);
  return dx >= X || dy >= Y ? 0 : (1 - dx / X) * (1 - dy / Y);
}

export function startAtom(atom: HTMLElement, plate: HTMLElement) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nucleus = atom.querySelector<HTMLElement>('.nucleus');
  const es: E[] = [];
  for (const el of atom.querySelectorAll<HTMLElement>('.electron')) {
    const body = el.querySelector<HTMLElement>('.electron__body');
    const tag = el.querySelector<HTMLElement>('.electron__tag');
    if (!body || !tag) continue;
    const d = el.dataset;
    const direction = d.dir === 'ccw' ? 'ccw' : 'cw';
    es.push({
      el, body, tag,
      orbit: { tilt: Number(d.tilt) || 0, period: Number(d.period) || 100, direction },
      phase: Number(d.phase) || 0,
      dir: direction === 'ccw' ? -1 : 1,
      half: 22, tw: 0, th: 0, x: 0, y: 0, ux: 1, uy: 0, s: 1,
      swing: 0, v: 0, side: 0, crossing: false, fadeEnd: 0, box: box(0, 0, 0, 0),
    });
  }
  if (!nucleus || es.length === 0) return;
  atom.classList.add('is-live');

  let W = 0; // the atom's width, px
  let walls = box(0, 0, 0, 0); // inside the plate's border and padding
  let core = box(0, 0, 0, 0); // the nucleus
  let order: E[] = []; // widest tag first: the order of precedence

  /** Sizes and fixed obstacles, in atom coordinates (origin at its centre). */
  function measure() {
    const a = atom.getBoundingClientRect();
    W = a.width;
    const ax = a.left + a.width / 2;
    const ay = a.top + a.height / 2;
    const p = plate.getBoundingClientRect();
    const cs = getComputedStyle(plate);
    const px = (v: string) => parseFloat(v) || 0;
    const l = p.left + px(cs.borderLeftWidth) + px(cs.paddingLeft) - ax;
    const t = p.top + px(cs.borderTopWidth) + px(cs.paddingTop) - ay;
    const r = p.right - px(cs.borderRightWidth) - px(cs.paddingRight) - ax;
    const b = p.bottom - px(cs.borderBottomWidth) - px(cs.paddingBottom) - ay;
    walls = box(l, t, r - l, b - t);
    const n = nucleus!.getBoundingClientRect();
    core = box(n.left - ax, n.top - ay, n.width, n.height);
    for (const e of es) {
      e.half = e.el.offsetWidth / 2;
      e.tw = e.tag.offsetWidth;
      e.th = e.tag.offsetHeight;
    }
    order = [...es].sort((p, q) => q.tw - p.tw);
  }

  /** The electron at time `t`. */
  function spotAt(e: E, t: number): Spot {
    const d = dotAt(e.orbit, e.phase + (e.dir * t) / e.orbit.period);
    return { x: d.x * W, y: d.y * W, ux: d.ux, uy: d.uy, s: breathe(d.depth).scale };
  }

  /** The tag of `e`, at `at`, hung in its radial direction turned by `deg`. */
  function boxAt(e: E, deg: number, at: Spot = e): Box {
    const a = (deg * Math.PI) / 180;
    const ux = at.ux * Math.cos(a) - at.uy * Math.sin(a);
    const uy = at.ux * Math.sin(a) + at.uy * Math.cos(a);
    const w = e.tw * at.s;
    const h = e.th * at.s;
    const c = hangCentre(ux, uy, w, h);
    return box(at.x + c.x - w / 2, at.y + c.y - h / 2, w, h);
  }

  /** Pixels of a box sticking out of the plate. */
  function outside(a: Box) {
    return (
      Math.max(0, walls.l - a.l) + Math.max(0, a.r - walls.r) +
      Math.max(0, walls.t - a.t) + Math.max(0, a.b - walls.b)
    );
  }

  /** What is wrong with a tag being at `a` among these other tags, wanting
   *  `gap` px from them, the nucleus and the plate's edges. Zero means
   *  nothing. Dots are not counted: a tag may pass over another electron's
   *  dot for a moment — its own tag still says where it is — and dodging
   *  something that small and quick would only make the tags restless. */
  function cost(a: Box, tags: Box[], gap: number) {
    let c = outside(a) / 10 + overlap(a, core, gap);
    for (const o of tags) c += overlap(a, o, gap);
    return c;
  }

  /** How deep a box cuts into anything it must not: px, 0 when clear. */
  function intrusion(a: Box, tags: Box[]) {
    const depth = (b: Box) => {
      const w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
      const h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      return w > 0 && h > 0 ? Math.min(w, h) : 0;
    };
    // The nucleus is the name: cutting into it counts triple.
    let d = Math.max(outside(a), 3 * depth(core));
    for (const o of tags) d = Math.max(d, depth(o));
    return d;
  }

  /** On side `dir`, the swing that cuts least into anything: [deg, px].
   *  With `near`, only within 15° of the current swing, so a squeezed tag
   *  holds its ground instead of hopping to some other least-bad spot. */
  function leastBad(e: E, dir: number, tags: Box[], near: boolean): [number, number] {
    const lo = near ? Math.max(0, Math.abs(e.swing) - 15) : 0;
    const hi = near ? Math.min(SWEEP, Math.abs(e.swing) + 15) : SWEEP;
    let best = lo;
    let least = Infinity;
    for (let d = lo; d <= hi; d += SCAN) {
      const v = intrusion(boxAt(e, dir * d), tags) + Math.abs(dir * d - e.swing) * 1e-4;
      if (v < least) {
        least = v;
        best = d;
      }
    }
    return [dir * best, least];
  }

  /** Degrees to the first direction each way that is clear by `gap`, or
   *  Infinity: [down, up]. */
  function room(e: E, at: Spot, tags: Box[], gap: number): [number, number] {
    const first = (dir: number) => {
      for (let d = SCAN; d <= SWEEP; d += SCAN) if (cost(boxAt(e, dir * d, at), tags, gap) === 0) return d;
      return Infinity;
    };
    return [first(-1), first(1)];
  }

  /** The exact edge of a clear stretch that begins between `lo` (blocked)
   *  and `hi` (clear), to a fraction of a degree. */
  function edge(lo: number, hi: number, clear: (deg: number) => boolean) {
    for (let i = 0; i < 6; i++) {
      const mid = (lo + hi) / 2;
      if (clear(mid)) hi = mid;
      else lo = mid;
    }
    return hi;
  }

  /** The direction, nearest the radial one, in which the tag is in nobody's
   *  way. A tag that has begun to dodge one way keeps to that side while it
   *  has room — settling for TIGHT instead of CLEAR, and then for being
   *  overlapped by up to SQUEEZE px, before it would sweep back across
   *  whatever it is dodging: a small, still overlap reads as crowding; a tag
   *  crossing another reads as a glitch. */
  function seek(e: E, idx: number, t: number): number {
    const tags = order.slice(0, idx).map((o) => o.box);
    const clear = (deg: number, gap: number) => cost(boxAt(e, deg), tags, gap) === 0;
    if (clear(0, CLEAR)) {
      e.side = 0;
      return 0;
    }

    let gap = CLEAR;
    let [dn, up] = room(e, e, tags, gap);
    if (dn === Infinity && up === Infinity) {
      gap = TIGHT;
      [dn, up] = room(e, e, tags, gap);
    }

    let dir = e.side;
    if (dir === 0) {
      // First contact: take the side that keeps room through the next LOOK
      // seconds of the orbits — judged by its worst moment — not merely the
      // side with more room this instant, which may be about to close.
      let worstDn = dn;
      let worstUp = up;
      for (let k = 1; k <= 4; k++) {
        const ahead = es.map((o) => spotAt(o, t + (LOOK * k) / 4));
        const tagsAhead = order.slice(0, idx).map((o) => boxAt(o, o.swing, ahead[es.indexOf(o)]));
        const [d, u] = room(e, ahead[es.indexOf(e)], tagsAhead, CLEAR);
        worstDn = Math.max(worstDn, d);
        worstUp = Math.max(worstUp, u);
      }
      if (worstUp !== worstDn) dir = worstUp < worstDn ? 1 : -1;
      else if (up !== dn) dir = up < dn ? 1 : -1;
      else dir = leastBad(e, 1, tags, false)[1] <= leastBad(e, -1, tags, false)[1] ? 1 : -1;
    }

    let here = dir > 0 ? up : dn;
    const there = dir > 0 ? dn : up;
    if (here === Infinity && gap === CLEAR) {
      const [dnT, upT] = room(e, e, tags, TIGHT);
      here = dir > 0 ? upT : dnT;
      if (here < Infinity) gap = TIGHT;
    }
    if (here === Infinity) {
      // No room on this side at all. Stay, squeezed, if the squeeze is
      // slight or the other side is no better; otherwise cross — by fading
      // out here and in there, never by sweeping across.
      const [deg, px] = leastBad(e, dir, tags, e.side !== 0);
      if (px <= SQUEEZE || there === Infinity) {
        e.side = dir;
        if (debug) e.el.dataset.room = `dn=${dn} up=${up} dir=${dir} squeezed=${px.toFixed(1)}`;
        return deg;
      }
      if (e.side !== 0) e.crossing = true;
      dir = -dir;
      here = there;
    } else if (there < here && up + dn <= CHEAP) {
      // The blocked stretch between the sides is so narrow that crossing it
      // is a flicker, not a sweep: take the nearer side.
      dir = -dir;
      here = there;
    }
    e.side = dir;
    if (debug) e.el.dataset.room = `dn=${dn} up=${up} dir=${dir} gap=${gap}`;
    const g = gap;
    return dir * edge(here - SCAN, here, (x) => clear(dir * x, g));
  }

  /** Everything, at time `t`. `settle` puts the tags straight where they
   *  belong instead of springing there: the first frame, and stillness.
   *  `now` is the wall clock, for the fades. */
  function place(t: number, dt: number, settle: boolean, now = 0) {
    for (const e of es) {
      const d = dotAt(e.orbit, e.phase + (e.dir * t) / e.orbit.period);
      e.x = d.x * W;
      e.y = d.y * W;
      e.ux = d.ux;
      e.uy = d.uy;
      const b = breathe(d.depth);
      e.s = b.scale;
      e.el.style.translate = `${(e.x - e.half).toFixed(2)}px ${(e.y - e.half).toFixed(2)}px`;
      e.body.style.scale = b.scale.toFixed(4);
      e.body.style.opacity = b.opacity.toFixed(3);
    }
    order.forEach((e, idx) => {
      const target = seek(e, idx, t);
      if (settle) {
        e.swing = target;
        e.v = 0;
      } else if (e.fadeEnd > 0) {
        // Faded out: hold until the fade is done, then reappear at the target.
        if (now >= e.fadeEnd) {
          e.swing = target;
          e.v = 0;
          e.fadeEnd = 0;
          e.tag.style.opacity = '';
        }
      } else if (e.crossing) {
        e.fadeEnd = now + FADE;
        e.tag.style.opacity = '0';
      } else {
        e.v += (OMEGA * OMEGA * (target - e.swing) - 2 * OMEGA * e.v) * dt;
        e.v = Math.max(-VMAX, Math.min(VMAX, e.v));
        e.swing += e.v * dt;
      }
      e.crossing = false;
      e.box = boxAt(e, e.swing);
      // The tag lives inside the breathing body, so its offset is unscaled.
      e.tag.style.translate = `${((e.box.l - e.x) / e.s).toFixed(2)}px ${((e.box.t - e.y) / e.s).toFixed(2)}px`;
      if (debug) e.el.dataset.debug = `${target.toFixed(1)} ${e.swing.toFixed(1)} ${e.side}`;
    });
  }

  // `#t=1234` in the URL starts the clock there: a way to link to, or test, a
  // particular moment of the 28-minute cycle. `#t=1234&debug` also writes each
  // tag's target, swing and side to a data-debug attribute, for inspection.
  const hash = new URLSearchParams(location.hash.slice(1));
  let t = Number(hash.get('t')) || 0;
  const debug = hash.has('debug');

  measure();
  place(t, 0, true);

  const remeasure = () => {
    measure();
    if (still) place(t, 0, true);
  };
  const ro = new ResizeObserver(remeasure);
  ro.observe(atom);
  ro.observe(plate);
  for (const e of es) ro.observe(e.tag);
  document.fonts?.ready.then(remeasure);

  if (still) return;

  // The clock only runs while nothing is held and the page is in view, so
  // coming back to the tab, or letting go of an electron, never jumps.
  let last = performance.now();
  function frame(now: number) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!atom.matches(':has(.electron:hover, .electron:focus-visible)')) t += dt;
    place(t, dt, false, now / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
