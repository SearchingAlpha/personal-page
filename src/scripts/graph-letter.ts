// ── From the letter to the graph ─────────────────────────────────────────────
// The page opens on the letter. When the reader moves on — scrolls, swipes,
// presses a key, or asks how it all connects — the letter becomes the graph:
// - the plain words dissolve, in reading order;
// - the facts fly to their nodes: "Pablo" to the name at the centre, "Spain"
//   to Valencia, "Amazon's" to Amazon, and so on, changing type on the way;
// - first the links fly to the edges of the screen, each to its section's
//   word — the letter's references become the frame of the place;
// - then the facts fly to their nodes, and what hangs off each node grows out
//   of it the moment it lands.
// "The letter", at the top-left edge, plays it backwards. Reduced motion
// swaps one for the other at once. While the greeting is still being typed
// (letter-intro.ts), moving on waits for it.
//
// What goes where is in the markup (index.astro): data-to="node:<id>" or
// data-to="edge:<href>" on the words that fly.
import type { Graph } from './graph';

const DISSOLVE_STEP = 9; // ms between one plain word and the next
const HANDOVER = 0.08; // the share of a flight in which a word gives way to its flier
const DISSOLVE_MS = 380;
const FLY_AT = 260; // when the first word leaves
const FLY_STEP = 115; // between one word leaving and the next: enough that they do not bunch
const FLY_MS = 1150;
const LIFT = 26; // px: how far a word arcs off the straight line, a little more or less for each

const ease = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;
const inOut = (k: number) => {
  const x = Math.min(1, Math.max(0, k));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

interface Flight {
  from: HTMLElement;
  /** A graph node, or an edge word. */
  node: number;
  edge: HTMLElement | null;
  el: HTMLElement;
  src: HTMLElement;
  dst: HTMLElement;
  a: { x: number; y: number; size: number };
  b: { x: number; y: number; size: number; rot: number };
}

/** Wraps every plain word of the letter in a span, so the words can go one by one. */
function words(lead: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  const walker = document.createTreeWalker(lead, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  for (const t of texts) {
    if (t.parentElement?.closest('[data-to]')) continue;
    const parts = t.data.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const p of parts) {
      if (!p) continue;
      if (/^\s+$/.test(p)) frag.append(p);
      else {
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = p;
        frag.append(s);
        out.push(s);
      }
    }
    t.replaceWith(frag);
  }
  return out;
}

/** The type a flier wears at one end: the source word's, or its target's. */
function wear(layer: HTMLElement, from: Element, size: number) {
  const cs = getComputedStyle(from);
  const fontSize = parseFloat(cs.fontSize) || 16;
  const spacing = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) / fontSize;
  Object.assign(layer.style, {
    fontFamily: cs.fontFamily,
    fontWeight: cs.fontWeight,
    fontStyle: cs.fontStyle,
    textTransform: cs.textTransform,
    letterSpacing: `${spacing}em`,
    color: from instanceof SVGElement ? cs.fill : cs.color,
  });
  layer.dataset.size = String(size);
}

export function startLetter(graph: Graph) {
  const body = document.body;
  const lead = document.querySelector<HTMLElement>('.letter .lead')!;
  const go = document.querySelector<HTMLButtonElement>('.letter__go')!;
  const edges = [...document.querySelectorAll<HTMLAnchorElement>('.edge')];
  const caption = document.querySelector<HTMLElement>('.caption');
  const art = document.querySelector<HTMLElement>('.letter__art');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plain = words(lead);
  // Links first, then facts; each in reading order.
  const marked = [...lead.querySelectorAll<HTMLElement>('[data-to]')];
  const flying = [...marked.filter((f) => f.dataset.to!.startsWith('edge:')), ...marked.filter((f) => f.dataset.to!.startsWith('node:'))];
  const anchors = flying.filter((f) => f.dataset.to!.startsWith('node:')).map((f) => graph.index(f.dataset.to!.slice(5)));
  const targetEdges = new Set<HTMLElement>();

  let state: 'letter' | 'moving' | 'graph' = 'letter';
  let flights: Flight[] = [];
  graph.hold(anchors);
  graph.stage(-1, new Map());
  body.classList.add('is-letter');
  document.documentElement.classList.remove('letter-first');

  function build(): Flight[] {
    for (const f of flights) f.el.remove();
    targetEdges.clear();
    return flying.map((from) => {
      const [kind, id] = [from.dataset.to!.slice(0, 4), from.dataset.to!.slice(5)];
      const node = kind === 'node' ? graph.index(id) : -1;
      const edge = kind === 'edge' ? edges.find((e) => e.getAttribute('href') === id) ?? null : null;
      if (edge) targetEdges.add(edge);

      const ra = from.getBoundingClientRect();
      const sizeA = parseFloat(getComputedStyle(from).fontSize);
      let rb: DOMRect, sizeB: number, rot = 0, to: Element, text: string;
      if (edge) {
        rb = edge.getBoundingClientRect();
        sizeB = parseFloat(getComputedStyle(edge).fontSize);
        const cs = getComputedStyle(edge);
        if (cs.writingMode.startsWith('vertical')) rot = cs.rotate === '180deg' ? -90 : 90;
        to = edge;
        text = edge.textContent!.trim();
      } else {
        const l = graph.label(node);
        rb = l.rect;
        sizeB = l.size;
        to = l.text;
        text = l.text.textContent!;
      }
      const el = document.createElement('span');
      el.className = 'flier';
      el.setAttribute('aria-hidden', 'true');
      const src = document.createElement('span');
      src.className = 'flier__src';
      src.textContent = from.textContent;
      const dst = document.createElement('span');
      dst.className = 'flier__dst';
      dst.textContent = text;
      wear(src, from, sizeA);
      wear(dst, to, sizeB);
      if (from.matches('a.ref')) src.classList.add('is-ref');
      el.append(src, dst);
      document.body.append(el);
      return {
        from, node, edge, el, src, dst,
        a: { x: ra.left + ra.width / 2, y: ra.top + ra.height / 2, size: sizeA },
        b: { x: rb.left + rb.width / 2, y: rb.top + rb.height / 2, size: sizeB, rot },
      };
    });
  }

  const leaves = (j: number) => FLY_AT + j * FLY_STEP;
  const end = () => leaves(flying.length - 1) + FLY_MS + graph.growMs;

  function render(t: number) {
    plain.forEach((w, k) => (w.style.opacity = String(1 - ease((t - k * DISSOLVE_STEP) / DISSOLVE_MS))));
    go.style.opacity = String(1 - ease(t / 220));
    if (art) art.style.opacity = String(1 - ease(t / 700));
    const landed = new Map<number, number>();
    flights.forEach((f, j) => {
      const q = (t - leaves(j)) / FLY_MS;
      const k = inOut(q);
      // A word waits in the letter for its turn, then hands over to its flier where it stands.
      const hand = ease(q / HANDOVER);
      f.from.style.opacity = String(1 - hand);
      f.el.style.display = q > 0 && k < 1 ? '' : 'none';
      f.el.style.opacity = String(hand);
      if (k >= 1 && f.node >= 0) landed.set(f.node, leaves(j) + FLY_MS);
      if (f.edge) f.edge.style.opacity = k >= 1 ? '' : '0';
      if (q <= 0 || k >= 1) return;
      const lift = Math.sin(Math.PI * k) * LIFT * (j % 2 ? -1 : 1) * (1 + (j % 3) * 0.5);
      const x = lerp(f.a.x, f.b.x, k);
      const y = lerp(f.a.y, f.b.y, k) - lift;
      const size = lerp(f.a.size, f.b.size, k);
      const swap = ease((k - 0.32) / 0.36);
      f.el.style.transform = `translate(${x}px, ${y}px) rotate(${lerp(0, f.b.rot, k)}deg)`;
      f.src.style.fontSize = f.dst.style.fontSize = `${size}px`;
      f.src.style.opacity = String(1 - swap);
      f.dst.style.opacity = String(swap);
    });
    graph.stage(t, landed);
    const rest = ease((t - end() + 700) / 600);
    for (const e of edges) if (!targetEdges.has(e)) e.style.opacity = String(rest);
    if (caption) caption.style.opacity = String(rest);
  }

  function play(forward: boolean) {
    if (state === 'moving' || document.documentElement.classList.contains('intro')) return;
    if (!forward) {
      graph.close();
      graph.hold(anchors);
    }
    flights = build();
    render(forward ? 0 : end()); // the first frame now, so nothing flashes before it
    state = 'moving';
    body.classList.remove('is-letter', 'is-graph');
    body.classList.add('is-moving');
    const total = end();
    const start = performance.now();
    const tick = (now: number) => {
      const e = still ? total : Math.min(total, now - start);
      const t = forward ? e : total - e;
      render(t);
      if (e < total) return requestAnimationFrame(tick);
      done(forward);
    };
    requestAnimationFrame(tick);
  }

  function done(forward: boolean) {
    for (const f of flights) f.el.remove();
    flights = [];
    body.classList.remove('is-moving');
    for (const e of edges) e.style.opacity = '';
    if (caption) caption.style.opacity = '';
    if (forward) {
      state = 'graph';
      body.classList.add('is-graph');
      graph.release();
      history.replaceState(null, '', '#graph');
    } else {
      state = 'letter';
      body.classList.add('is-letter');
      plain.forEach((w) => (w.style.opacity = ''));
      flying.forEach((f) => (f.style.opacity = ''));
      go.style.opacity = '';
      if (art) art.style.opacity = '';
      graph.stage(-1, new Map());
      history.replaceState(null, '', location.pathname);
    }
  }

  // ── Moving on ──
  go.addEventListener('click', () => play(true));
  addEventListener('wheel', (e) => state === 'letter' && e.deltaY > 8 && play(true), { passive: true });
  let touchY: number | null = null;
  addEventListener('touchstart', (e) => (touchY = e.touches[0].clientY), { passive: true });
  addEventListener('touchmove', (e) => {
    if (state === 'letter' && touchY !== null && touchY - e.touches[0].clientY > 40) {
      touchY = null;
      play(true);
    }
  }, { passive: true });
  addEventListener('keydown', (e) => {
    if (state !== 'letter' || (e.target as Element).closest?.('a, button')) return;
    if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
      play(true);
    }
  });

  // ── And back ──
  const home = edges.find((e) => e.getAttribute('href') === '/');
  home?.addEventListener('click', (e) => {
    if (state !== 'graph') return;
    e.preventDefault();
    play(false);
  });
}
