// ── The graph's physics ──────────────────────────────────────────────────────
// A small force simulation, shared by the page — which runs it to rest at
// build time and writes the positions into the HTML, so the graph stands
// without a script — and src/scripts/graph.ts, which keeps it gently alive.
// Edges are springs, nodes repel each other, a weak pull holds everything on
// the sheet, and every label is a box that no other label may overlap: a
// graph is only as good as its labels are readable.
import type { Kind, Node, Edge } from '../data/graph';

/** How each kind is drawn: dot radius, label size, and how wide its type runs per character. */
export const LOOK: Record<Kind, { r: number; size: number; em: number; charge: number }> = {
  me: { r: 6, size: 44, em: 0.46, charge: 420 },
  idea: { r: 4.5, size: 21, em: 0.44, charge: 260 },
  work: { r: 4, size: 18, em: 0.48, charge: 220 },
  study: { r: 4, size: 18, em: 0.48, charge: 220 },
  project: { r: 4, size: 18, em: 0.48, charge: 220 },
  hub: { r: 3.5, size: 16, em: 0.44, charge: 220 },
  place: { r: 4, size: 11, em: 0.78, charge: 150 },
  theme: { r: 3, size: 10.5, em: 0.78, charge: 180 },
  book: { r: 2.5, size: 13.5, em: 0.44, charge: 70 },
  podcast: { r: 2.5, size: 13.5, em: 0.44, charge: 70 },
};

export interface Body {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** The label's box, centred under the dot: width and height. */
  bw: number;
  bh: number;
  /** Pinned here while held (the name, or a node being dragged). */
  fx?: number;
  fy?: number;
}

export interface Spring {
  a: number;
  b: number;
  len: number;
  k: number;
}

export interface Sheet {
  w: number;
  h: number;
  /** Where the name sits, and how hard the sheet pulls back towards it along each axis. */
  cx: number;
  cy: number;
  gx: number;
  gy: number;
  /** Keep labels this far inside the sheet's edges (the six edge words live in the margin). */
  margin: number;
}

export const look = (n: Pick<Node, 'kind' | 'favourite'>) => {
  const l = LOOK[n.kind];
  return n.favourite ? { ...l, r: l.r + 1, size: l.size + 1 } : l;
};

/** The label's baseline, below the dot. Its box runs from the dot's centre to just under the baseline. */
export const baseline = (n: Pick<Node, 'kind' | 'favourite'>) => {
  const l = look(n);
  return l.r + 2 + l.size * 0.88;
};

export function bodies(nodes: Node[], width?: (n: Node) => number): Body[] {
  return nodes.map((n) => {
    const l = look(n);
    const tw = width ? width(n) : n.label.length * l.size * l.em;
    return { id: n.id, kind: n.kind, x: 0, y: 0, vx: 0, vy: 0, bw: tw + 12, bh: l.size * 1.15 + l.r * 2 + 4 };
  });
}

/** Springs: short from a book to its theme, long from the name to what hangs off it. */
export function springs(nodes: Node[], edges: Edge[]): Spring[] {
  const at = new Map(nodes.map((n, i) => [n.id, i]));
  return edges.map(([a, b]) => {
    const ka = nodes[at.get(a)!].kind;
    const kb = nodes[at.get(b)!].kind;
    const has = (k: Kind) => ka === k || kb === k;
    const len = has('me') ? 190 : has('book') || has('podcast') ? 62 : has('theme') ? 105 : has('idea') ? 135 : has('place') ? 100 : 120;
    const k = has('book') || has('podcast') ? 0.16 : has('idea') ? 0.05 : 0.09;
    return { a: at.get(a)!, b: at.get(b)!, len, k };
  });
}

/** A small seeded random, so the build lays the graph out the same way every time. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One step of the simulation at strength `alpha` (1 is a hard shake, 0.01 a breath). */
export function step(b: Body[], s: Spring[], sheet: Sheet, alpha: number) {
  for (const { a, b: c, len, k } of s) {
    const p = b[a];
    const q = b[c];
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const d = Math.hypot(dx, dy) || 1e-3;
    const f = ((d - len) / d) * k * alpha;
    p.vx += dx * f;
    p.vy += dy * f;
    q.vx -= dx * f;
    q.vy -= dy * f;
  }
  for (let i = 0; i < b.length; i++) {
    for (let j = i + 1; j < b.length; j++) {
      const p = b[i];
      const q = b[j];
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      // As d3's many-body force: a push that falls off with distance, not its square.
      const d2 = Math.max(dx * dx + dy * dy, 400);
      const f = (((LOOK[p.kind].charge + LOOK[q.kind].charge) / 2) * alpha) / d2;
      p.vx -= dx * f;
      p.vy -= dy * f;
      q.vx += dx * f;
      q.vy += dy * f;
    }
  }
  for (const p of b) {
    p.vx += (sheet.cx - p.x) * sheet.gx * alpha;
    p.vy += (sheet.cy - p.y) * sheet.gy * alpha;
  }
  for (const p of b) {
    if (p.fx !== undefined) {
      p.x = p.fx;
      p.y = p.fy!;
      p.vx = p.vy = 0;
      continue;
    }
    p.vx *= 0.58;
    p.vy *= 0.58;
    const v = Math.hypot(p.vx, p.vy);
    if (v > 24) {
      p.vx *= 24 / v;
      p.vy *= 24 / v;
    }
    p.x += p.vx;
    p.y += p.vy;
  }
  separate(b, sheet);
}

/** No label over another: where two boxes overlap, push them apart along the shallower side. */
function separate(b: Body[], sheet: Sheet) {
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < b.length; i++) {
      for (let j = i + 1; j < b.length; j++) {
        const p = b[i];
        const q = b[j];
        const dx = q.x - p.x;
        const dy = q.y + q.bh / 2 - (p.y + p.bh / 2);
        const ox = (p.bw + q.bw) / 2 - Math.abs(dx);
        const oy = (p.bh + q.bh) / 2 - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        const pFixed = p.fx !== undefined;
        const qFixed = q.fx !== undefined;
        const share = pFixed ? 0 : qFixed ? 1 : 0.5;
        if (ox < oy) {
          const m = (dx < 0 ? -1 : 1) * ox * 0.6;
          p.x -= m * share;
          q.x += m * (1 - share);
        } else {
          const m = (dy < 0 ? -1 : 1) * oy * 0.6;
          p.y -= m * share;
          q.y += m * (1 - share);
        }
      }
    }
  }
  for (const p of b) {
    if (p.fx !== undefined) continue;
    p.x = Math.min(sheet.w - sheet.margin - p.bw / 2, Math.max(sheet.margin + p.bw / 2, p.x));
    p.y = Math.min(sheet.h - sheet.margin - p.bh, Math.max(sheet.margin, p.y));
  }
}

/** Lays the graph out from a seeded scatter and runs it to rest. */
export function settle(b: Body[], s: Spring[], sheet: Sheet, seed = 1805, steps = 700) {
  const rand = seeded(seed);
  for (const p of b) {
    if (p.fx !== undefined) {
      p.x = p.fx;
      p.y = p.fy!;
      continue;
    }
    const a = rand() * Math.PI * 2;
    const r = 120 + rand() * 260;
    p.x = sheet.cx + Math.cos(a) * r * (sheet.w / sheet.h);
    p.y = sheet.cy + Math.sin(a) * r;
  }
  let alpha = 1;
  for (let i = 0; i < steps; i++) {
    step(b, s, sheet, alpha);
    alpha = Math.max(0.004, alpha * 0.991);
  }
}

/** How many pairs of edges cross (edges that share a node do not count). */
export function crossings(b: Body[], s: Spring[]): number {
  const side = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) =>
    Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j < s.length; j++) {
      const e = s[i];
      const f = s[j];
      if (e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b) continue;
      const [p, q, r, t] = [b[e.a], b[e.b], b[f.a], b[f.b]];
      if (side(p.x, p.y, q.x, q.y, r.x, r.y) !== side(p.x, p.y, q.x, q.y, t.x, t.y) &&
          side(r.x, r.y, t.x, t.y, p.x, p.y) !== side(r.x, r.y, t.x, t.y, q.x, q.y)) n++;
    }
  }
  return n;
}

/**
 * Settles the graph from several seeds and keeps the calmest: fewest crossing
 * edges, then the shortest edges overall. A force layout's first answer is
 * rarely its best one.
 */
export function settleBest(b: Body[], s: Spring[], sheet: Sheet, seeds = 16): number {
  let best: { seed: number; score: number; at: { x: number; y: number }[] } | null = null;
  for (let seed = 1; seed <= seeds; seed++) {
    settle(b, s, sheet, seed);
    const length = s.reduce((sum, { a, b: c }) => sum + Math.hypot(b[a].x - b[c].x, b[a].y - b[c].y), 0);
    const score = crossings(b, s) + length / 2500;
    if (!best || score < best.score) best = { seed, score, at: b.map(({ x, y }) => ({ x, y })) };
  }
  b.forEach((p, i) => Object.assign(p, best!.at[i]));
  return best!.seed;
}
