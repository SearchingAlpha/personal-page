// ── The graph, alive ─────────────────────────────────────────────────────────
// The graph is whole without this script (src/pages/index.astro lays it out at
// build time). This makes it a place:
// - the breath: the simulation never quite comes to rest, so the graph drifts;
// - the neighbourhood: a node under the pointer lights up what it touches;
// - the hand: any node can be dragged, and the rest gives way; the sheet pans
//   and zooms (drag the paper, wheel or pinch);
// - the walk: a node opens its card, and the card lists what it connects to,
//   each a step to the next card.
// It can also be held still and staged — shown as so far grown out of a few
// nodes — which is how the letter turns into it (src/scripts/graph-letter.ts),
// and how it blooms out of the name when opened on its own (/#graph).
// On a sheet taller than it is wide, the graph is laid out again to fit.
// Reduced motion keeps the hand and the walk, and drops the breath.
import { bodies, springs, step, settleBest, type Body, type Sheet } from '../lib/graph-sim';
import type { Edge, Kind } from '../data/graph';

interface GNode {
  id: string;
  label: string;
  kind: Kind;
  live: boolean;
  favourite: boolean;
  kindLabel: string;
  meta: string;
  detail: string;
  href: string;
  x: number;
  y: number;
  bw: number;
  bh: number;
}

interface Data {
  sheet: Sheet;
  nodes: GNode[];
  edges: [number, number][];
}

export interface Graph {
  /** A node's index from its id. */
  index(id: string): number;
  /** Hold the graph still, ready to grow out of these nodes. */
  hold(anchors: number[]): void;
  /** Show it at time `t` (ms): each anchor in `landed` reached the sheet at its time, and what hangs off it grows from then. */
  stage(t: number, landed: Map<number, number>): void;
  /** How long the growth takes, for anchors this many rings deep. */
  readonly growMs: number;
  /** Let it go: the physics, the breath and the hand come back. */
  release(): void;
  /** Where a node's label is on screen, and the size its type is drawn at. */
  label(i: number): { rect: DOMRect; size: number; text: SVGTextElement };
  close(): void;
}

const RING_MS = 130; // the delay between one ring and the next
const GROW_MS = 850; // how long each node takes to arrive
const BREATH = 0.035; // how much each node drifts, in units a frame
const ZOOM = [0.6, 3];

const TITLED: Kind[] = ['book', 'podcast'];
const GO: Record<string, string> = { '/': 'The letter', '/projects': 'Projects', '/about': 'About me', '/interests#books': 'Interests', '/interests#podcasts': 'Interests' };

const ease = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;

export function startGraph({ bloom = true } = {}): Graph {
  const data: Data = JSON.parse(document.getElementById('graph-data')!.textContent!);
  const svg = document.querySelector<SVGSVGElement>('.net')!;
  const world = svg.querySelector<SVGGElement>('.world')!;
  const els = [...svg.querySelectorAll<SVGAElement>('.node')];
  const lines = [...svg.querySelectorAll<SVGLineElement>('.links line')];
  const card = document.querySelector<HTMLElement>('.card')!;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = data.nodes.length;

  // Neighbours, for the light, the walk and the growth.
  const near: Set<number>[] = data.nodes.map(() => new Set());
  for (const [a, b] of data.edges) {
    near[a].add(b);
    near[b].add(a);
  }
  const me = data.nodes.findIndex((x) => x.kind === 'me');

  // Bodies from the build's layout, with each label's real width once the fonts are in.
  const nodes = data.nodes.map(({ id, label, kind, favourite }) => ({ id, label, kind, favourite }));
  const edgesById: Edge[] = data.edges.map(([a, b]) => [data.nodes[a].id, data.nodes[b].id]);
  const body: Body[] = bodies(nodes);
  body.forEach((b, i) => Object.assign(b, { x: data.nodes[i].x, y: data.nodes[i].y }));
  const springsList = springs(nodes, edgesById);
  let sheet = data.sheet;

  const portrait = innerWidth < innerHeight;
  if (portrait) {
    sheet = { w: 640, h: 1380, cx: 320, cy: 640, gx: 0.02, gy: 0.007, margin: 30 };
    svg.setAttribute('viewBox', `0 0 ${sheet.w} ${sheet.h}`);
  }
  body[me].fx = sheet.cx;
  body[me].fy = sheet.cy;

  let alpha = 0.02;
  function measure() {
    els.forEach((el, i) => {
      const t = el.querySelector<SVGTextElement>('.node__label');
      if (t) body[i].bw = t.getComputedTextLength() + 12;
    });
  }
  measure();
  if (portrait) settleBest(body, springsList, sheet, 8);
  else for (let i = 0; i < 80; i++) step(body, springsList, sheet, 0.08);
  document.fonts?.ready.then(() => {
    measure();
    if (!staged) alpha = Math.max(alpha, 0.15);
  });

  // ── Drawing ──
  const shown = body.map((b) => ({ x: b.x, y: b.y }));
  const seen = new Array(n).fill(1);
  function draw() {
    for (let i = 0; i < n; i++) {
      els[i].setAttribute('transform', `translate(${shown[i].x.toFixed(1)} ${shown[i].y.toFixed(1)})`);
      els[i].style.opacity = staged ? String(seen[i]) : '';
    }
    for (const [k, [a, b]] of data.edges.entries()) {
      const l = lines[k];
      l.setAttribute('x1', shown[a].x.toFixed(1));
      l.setAttribute('y1', shown[a].y.toFixed(1));
      l.setAttribute('x2', shown[b].x.toFixed(1));
      l.setAttribute('y2', shown[b].y.toFixed(1));
      l.style.opacity = staged ? String(Math.min(seen[a], seen[b])) : '';
    }
  }

  // ── Staging: grown so far out of a few nodes ──
  // Every node grows out of its nearest anchor, ring by ring: it travels out
  // from the anchor's place to its own, and fades in on the way.
  let staged: { t: number; landed: Map<number, number>; anchors: Set<number> } | null = null;
  let origin: number[] = new Array(n).fill(me);
  let ring: number[] = new Array(n).fill(0);
  function rings(from: number[]) {
    ring = new Array(n).fill(Infinity);
    origin = new Array(n).fill(from[0]);
    for (const a of from) (ring[a] = 0), (origin[a] = a);
    for (const queue = [...from]; queue.length; ) {
      const i = queue.shift()!;
      for (const j of near[i]) if (ring[j] === Infinity) (ring[j] = ring[i] + 1), (origin[j] = origin[i]), queue.push(j);
    }
  }
  function grow({ t, landed, anchors }: NonNullable<typeof staged>) {
    for (let i = 0; i < n; i++) {
      if (anchors.has(i)) {
        shown[i].x = body[i].x;
        shown[i].y = body[i].y;
        seen[i] = landed.has(i) ? 1 : 0;
        continue;
      }
      const o = origin[i];
      const since = landed.has(o) ? t - landed.get(o)! - (ring[i] - 1) * RING_MS : -1;
      const k = ease(since / GROW_MS);
      shown[i].x = body[o].x + (body[i].x - body[o].x) * k;
      shown[i].y = body[o].y + (body[i].y - body[o].y) * k;
      seen[i] = ease(since / (GROW_MS * 0.6));
    }
  }

  // ── The breath ──
  const phase = body.map(() => Math.random() * Math.PI * 2);
  function frame(now: number) {
    if (staged) grow(staged);
    else {
      if (!still) {
        for (let i = 0; i < n; i++) {
          body[i].vx += Math.cos(now * 0.00035 + phase[i]) * BREATH;
          body[i].vy += Math.sin(now * 0.00029 + phase[i] * 1.7) * BREATH;
        }
      }
      if (!still || alpha > 0.02) step(body, springsList, sheet, alpha);
      alpha = Math.max(0.02, alpha * 0.97);
      for (let i = 0; i < n; i++) {
        shown[i].x = body[i].x;
        shown[i].y = body[i].y;
      }
    }
    draw();
    requestAnimationFrame(frame);
  }
  draw();
  requestAnimationFrame(frame);

  // ── The view: pan and zoom ──
  const view = { tx: 0, ty: 0, k: 1 };
  const applyView = () => world.setAttribute('transform', `translate(${view.tx} ${view.ty}) scale(${view.k})`);
  const toSheet = (cx: number, cy: number) => {
    const p = svg.createSVGPoint();
    p.x = cx;
    p.y = cy;
    return p.matrixTransform(svg.getScreenCTM()!.inverse());
  };
  const toWorld = (cx: number, cy: number) => {
    const p = toSheet(cx, cy);
    return { x: (p.x - view.tx) / view.k, y: (p.y - view.ty) / view.k };
  };
  function zoomAt(cx: number, cy: number, factor: number) {
    const p = toSheet(cx, cy);
    const k = Math.min(ZOOM[1], Math.max(ZOOM[0], view.k * factor));
    view.tx = p.x - ((p.x - view.tx) * k) / view.k;
    view.ty = p.y - ((p.y - view.ty) * k) / view.k;
    view.k = k;
    applyView();
  }
  svg.addEventListener('wheel', (e) => {
    if (staged) return;
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });

  // ── The hand: drag a node, or the paper ──
  const pointers = new Map<number, { x: number; y: number }>();
  let held: { i: number; moved: boolean; sx: number; sy: number } | null = null;
  let panning: { x: number; y: number } | null = null;
  let pinch: { d: number } | null = null;

  svg.addEventListener('pointerdown', (e) => {
    if (staged) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    svg.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
      held = null;
      panning = null;
      return;
    }
    const el = (e.target as Element).closest<SVGAElement>('.node');
    if (el) {
      held = { i: Number(el.dataset.i), moved: false, sx: e.clientX, sy: e.clientY };
    } else {
      panning = { x: e.clientX, y: e.clientY };
      svg.classList.add('is-panning');
    }
  });

  svg.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId)!;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinch.d);
      pinch.d = d;
      return;
    }
    if (held) {
      if (!held.moved && Math.hypot(e.clientX - held.sx, e.clientY - held.sy) < 5) return;
      held.moved = true;
      const p = toWorld(e.clientX, e.clientY);
      body[held.i].fx = p.x;
      body[held.i].fy = p.y;
      alpha = 0.3;
    } else if (panning) {
      const a = toSheet(prev.x, prev.y);
      const b = toSheet(e.clientX, e.clientY);
      view.tx += b.x - a.x;
      view.ty += b.y - a.y;
      applyView();
    }
  });

  const release = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    svg.classList.remove('is-panning');
    if (held) {
      const { i, moved } = held;
      if (i !== me) {
        delete body[i].fx;
        delete body[i].fy;
      }
      if (!moved) open(i);
      held = null;
    } else if (panning) {
      const { x, y } = panning;
      if (Math.hypot(e.clientX - x, e.clientY - y) < 5) close();
      panning = null;
    }
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  // Links would leave the page: a node opens its card instead (the keyboard's Enter too).
  svg.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<SVGAElement>('.node');
    if (!el) return;
    e.preventDefault();
    if (e.detail === 0 && !staged) open(Number(el.dataset.i));
  });

  // ── The neighbourhood ──
  let opened = -1;
  function light(i: number) {
    svg.classList.toggle('is-hot', i >= 0);
    els.forEach((el, j) => el.classList.toggle('is-near', i >= 0 && (j === i || near[i].has(j))));
    data.edges.forEach(([a, b], k) => lines[k].classList.toggle('is-near', i >= 0 && (a === i || b === i)));
  }
  svg.addEventListener('pointerover', (e) => {
    if (staged || held?.moved || panning) return;
    const el = (e.target as Element).closest<SVGAElement>('.node');
    light(el ? Number(el.dataset.i) : opened);
  });
  svg.addEventListener('pointerleave', () => light(opened));

  // ── The walk ──
  const meta = card.querySelector('.card__meta')!;
  const title = card.querySelector('.card__title')!;
  const detail = card.querySelector<HTMLElement>('.card__detail')!;
  const list = card.querySelector('.card__near')!;
  const go = card.querySelector<HTMLAnchorElement>('.card__go')!;
  const ORDER: Kind[] = ['me', 'idea', 'work', 'study', 'project', 'place', 'hub', 'theme', 'book', 'podcast'];

  function open(i: number) {
    const d = data.nodes[i];
    opened = i;
    els.forEach((el, j) => el.classList.toggle('is-open', j === i));
    light(i);
    meta.textContent = [d.kindLabel, d.meta].filter(Boolean).join(' · ');
    title.textContent = d.label;
    title.classList.toggle('is-title', TITLED.includes(d.kind));
    detail.innerHTML = d.detail; // the site's own words, escaped at build (index.astro)
    detail.hidden = !d.detail;
    list.innerHTML = '';
    for (const j of [...near[i]].sort((a, b) => ORDER.indexOf(data.nodes[a].kind) - ORDER.indexOf(data.nodes[b].kind))) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = data.nodes[j].label;
      b.classList.toggle('is-title', TITLED.includes(data.nodes[j].kind));
      b.addEventListener('click', () => open(j));
      li.append(b);
      list.append(li);
    }
    go.href = d.href || '/';
    go.textContent = d.href.startsWith('http') ? 'Visit' : (GO[d.href] ?? 'Open');
    card.hidden = false;
  }

  function close() {
    if (card.hidden) return;
    card.hidden = true;
    opened = -1;
    els.forEach((el) => el.classList.remove('is-open'));
    light(-1);
  }
  card.querySelector('.card__close')!.addEventListener('click', close);
  addEventListener('keydown', (e) => e.key === 'Escape' && close());

  const graph: Graph = {
    index: (id) => data.nodes.findIndex((x) => x.id === id),
    hold(anchors) {
      rings(anchors);
      staged = { t: 0, landed: new Map(), anchors: new Set(anchors) };
      svg.classList.add('is-staged');
      for (const p of body) p.vx = p.vy = 0;
    },
    stage(t, landed) {
      if (staged) (staged.t = t), (staged.landed = landed);
    },
    get growMs() {
      return Math.max(...ring.filter(Number.isFinite)) * RING_MS + GROW_MS;
    },
    release() {
      staged = null;
      svg.classList.remove('is-staged');
      alpha = 0.06;
    },
    label(i) {
      const text = els[i].querySelector<SVGTextElement>('.node__label')!;
      const scale = svg.getScreenCTM()!.a * view.k;
      return { rect: text.getBoundingClientRect(), size: parseFloat(getComputedStyle(text).fontSize) * scale, text };
    },
    close,
  };

  // Opened on its own: everything grows out of the name.
  if (bloom) {
    graph.hold([me]);
    const start = performance.now();
    const landed = new Map([[me, 0]]);
    const run = (now: number) => {
      const t = still ? Infinity : now - start;
      graph.stage(t, landed);
      if (t < graph.growMs) requestAnimationFrame(run);
      else graph.release();
    };
    requestAnimationFrame(run);
  }
  return graph;
}
