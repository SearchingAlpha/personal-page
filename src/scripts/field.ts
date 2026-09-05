// ── The field ────────────────────────────────────────────────────────────────
// A cellular automaton behind the plate: von Neumann's idea, Conway's rule.
// Cells sit on a lattice of faint dots; live ones glow cobalt and ease in and
// out rather than blink. Whatever the page is about — the atom, a column of
// text — sits in a clearing.
//
// The pointer is a source of life, not a light: cells are born in its wake
// and then evolve like any others; live cells it passes flare briefly; a click
// drops a glider. Nothing is drawn around the cursor itself.

const PITCH = 15; // px between lattice points
const DENSITY = 0.2; // initial live fraction
const STEP_MS = 560; // one generation
const EASE = 0.14; // glow easing per frame
const FLOOR = 0.11; // live fraction below which the vacuum fluctuates
const REACH = 4; // cells: radius within which live cells flare at the pointer
const COOL = 0.93; // flare kept per frame; gone in about half a second
const SEED = 2; // cells: radius of the cluster born as the pointer moves
const COBALT = '31,88,242';
const ICE = '216,234,255';

// A glider, the smallest thing in Life that goes somewhere.
const GLIDER: [number, number][] = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];

/**
 * What the field keeps clear. `round`: nothing inside 0.44 of the element's
 * width from its centre, full field beyond 0.66 — the atom's orbits. `box`:
 * nothing over the element, full field ~110px out from its edges — a column
 * of text.
 */
export interface Clearing {
  el: HTMLElement;
  shape: 'round' | 'box';
}

export function startField(plate: HTMLElement, canvas: HTMLCanvasElement, clearing: Clearing | null) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0;
  let h = 0;
  let cols = 0;
  let rows = 0;
  let cells = new Uint8Array(0);
  let next = new Uint8Array(0);
  let glow = new Float32Array(0);
  let fall = new Float32Array(0); // 0 inside the clearing → 1 at full density
  let heat = new Float32Array(0); // pointer warmth, 0–1, cooling each frame
  let cursor: { x: number; y: number } | null = null; // in cell units
  let lattice: HTMLCanvasElement | null = null;
  let dirty = true;

  // Quantised fill styles, so the draw loop allocates no strings.
  const LEVELS = 16;
  const live = Array.from({ length: LEVELS + 1 }, (_, i) => `rgba(${COBALT},${(0.3 + 0.7 * (i / LEVELS)).toFixed(3)})`);

  /** How much field there is at a point of the plate, 0–1. */
  function density(px: number, py: number, r: DOMRect): number {
    if (!clearing) return 1;
    const a = clearing.el.getBoundingClientRect();
    if (clearing.shape === 'round') {
      const d = Math.hypot(px - (a.left - r.left + a.width / 2), py - (a.top - r.top + a.height / 2));
      const r0 = a.width * 0.44;
      const r1 = a.width * 0.66;
      return Math.min(1, Math.max(0, (d - r0) / (r1 - r0)));
    }
    const dx = Math.max(a.left - r.left - px, 0, px - (a.right - r.left));
    const dy = Math.max(a.top - r.top - py, 0, py - (a.bottom - r.top));
    return Math.min(1, Math.max(0, (Math.hypot(dx, dy) - 8) / 110));
  }

  function setup() {
    const r = plate.getBoundingClientRect();
    w = r.width;
    h = r.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(w / PITCH);
    rows = Math.ceil(h / PITCH);
    const n = cols * rows;
    cells = new Uint8Array(n);
    next = new Uint8Array(n);
    glow = new Float32Array(n);
    fall = new Float32Array(n);
    heat = new Float32Array(n);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        fall[y * cols + x] = density(x * PITCH + PITCH / 2, y * PITCH + PITCH / 2, r);
      }
    }

    for (let k = 0; k < n; k++) {
      cells[k] = Math.random() < DENSITY ? 1 : 0;
      glow[k] = cells[k];
    }

    // The dead lattice never changes: draw it once.
    lattice = document.createElement('canvas');
    lattice.width = canvas.width;
    lattice.height = canvas.height;
    const lc = lattice.getContext('2d')!;
    lc.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const f = fall[y * cols + x];
        if (f < 0.02) continue;
        lc.fillStyle = `rgba(${ICE},${(0.14 * f).toFixed(3)})`;
        lc.fillRect(x * PITCH + PITCH / 2 - 0.5, y * PITCH + PITCH / 2 - 0.5, 1, 1);
      }
    }
    dirty = true;
  }

  function step() {
    if (document.hidden) return;
    let pop = 0;
    for (let y = 0; y < rows; y++) {
      const up = ((y + rows - 1) % rows) * cols;
      const mid = y * cols;
      const dn = ((y + 1) % rows) * cols;
      for (let x = 0; x < cols; x++) {
        const l = (x + cols - 1) % cols;
        const rr = (x + 1) % cols;
        const n =
          cells[up + l] + cells[up + x] + cells[up + rr] +
          cells[mid + l] + cells[mid + rr] +
          cells[dn + l] + cells[dn + x] + cells[dn + rr];
        const alive = cells[mid + x] ? n === 2 || n === 3 : n === 3;
        next[mid + x] = alive ? 1 : 0;
        pop += next[mid + x];
      }
    }
    [cells, next] = [next, cells];
    // Life left alone settles into still lifes. A quiet field gets two
    // fluctuations somewhere, so it never quite goes out.
    if (pop < cells.length * FLOOR) {
      for (let i = 0; i < 2; i++) {
        sprinkle(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 3, 0.6);
      }
    }
    dirty = true;
  }

  /** Births in a disc. `sudden` cells appear at full glow instead of easing in. */
  function sprinkle(cx: number, cy: number, radius: number, p: number, sudden = false) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const x = (cx + dx + cols) % cols;
        const y = (cy + dy + rows) % rows;
        if (Math.random() < p) {
          const k = y * cols + x;
          cells[k] = 1;
          if (sudden) glow[k] = 1;
        }
      }
    }
    dirty = true;
  }

  function draw() {
    const c = ctx!;
    c.clearRect(0, 0, w, h);
    if (lattice && lattice.width && lattice.height) c.drawImage(lattice, 0, 0, w, h);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const k = y * cols + x;
        const g = glow[k] * fall[k];
        if (g < 0.03) continue;
        // Life glows cobalt; a passing pointer makes live cells flare.
        const v = Math.min(1, g + heat[k] * 0.6);
        c.fillStyle = live[Math.round(v * LEVELS)];
        const s = 1.6 + 1.8 * v;
        c.fillRect(x * PITCH + PITCH / 2 - s / 2, y * PITCH + PITCH / 2 - s / 2, s, s);
      }
    }
  }

  /** Mark cells under the pointer as flaring: a smooth bump, REACH cells wide.
   *  Only live cells show it — see draw(). */
  function warm() {
    if (!cursor) return;
    const x0 = Math.max(0, Math.floor(cursor.x - REACH));
    const x1 = Math.min(cols - 1, Math.ceil(cursor.x + REACH));
    const y0 = Math.max(0, Math.floor(cursor.y - REACH));
    const y1 = Math.min(rows - 1, Math.ceil(cursor.y + REACH));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x + 0.5 - cursor.x, y + 0.5 - cursor.y) / REACH;
        if (d >= 1) continue;
        const v = 1 - d * d;
        const k = y * cols + x;
        if (v > heat[k]) heat[k] = v;
      }
    }
  }

  function frame() {
    warm();
    let moving = cursor !== null;
    for (let k = 0; k < cells.length; k++) {
      const d = cells[k] - glow[k];
      if (Math.abs(d) > 0.004) {
        glow[k] += d * EASE;
        moving = true;
      } else {
        glow[k] = cells[k];
      }
      if (heat[k] > 0.004) {
        heat[k] *= COOL;
        moving = true;
      } else {
        heat[k] = 0;
      }
    }
    if (moving || dirty) {
      draw();
      dirty = false;
    }
    requestAnimationFrame(frame);
  }

  setup();

  if (still) {
    // One generation, held. No timers, no pointer.
    draw();
    return;
  }

  requestAnimationFrame(frame);
  setInterval(step, STEP_MS);

  // Pointer: a small cluster is born each time it enters a new cell — at full
  // glow, so the response is immediate — and then left to Life. Resting
  // still births nothing, so the field is never flooded.
  let lastCell = -1;
  plate.addEventListener(
    'pointermove',
    (e) => {
      const r = plate.getBoundingClientRect();
      const fx = (e.clientX - r.left) / PITCH;
      const fy = (e.clientY - r.top) / PITCH;
      cursor = { x: fx, y: fy };
      const x = Math.floor(fx);
      const y = Math.floor(fy);
      if (x < 0 || y < 0 || x >= cols || y >= rows) return;
      const k = y * cols + x;
      if (k === lastCell) return;
      lastCell = k;
      if (fall[k] > 0.05) sprinkle(x, y, SEED, 0.4, true);
    },
    { passive: true },
  );

  plate.addEventListener('pointerleave', () => {
    cursor = null;
  });

  // A click on empty plate drops a glider, facing a random way.
  plate.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a, button')) return;
    const r = plate.getBoundingClientRect();
    const cx = Math.floor((e.clientX - r.left) / PITCH);
    const cy = Math.floor((e.clientY - r.top) / PITCH);
    const sx = Math.random() < 0.5 ? 1 : -1;
    const sy = Math.random() < 0.5 ? 1 : -1;
    const swap = Math.random() < 0.5;
    for (const [gx, gy] of GLIDER) {
      let dx = gx - 1;
      let dy = gy - 1;
      if (swap) [dx, dy] = [dy, dx];
      const x = (cx + dx * sx + cols) % cols;
      const y = (cy + dy * sy + rows) % rows;
      cells[y * cols + x] = 1;
    }
    dirty = true;
  });

  // Reseed on resize. The observer also fires once on observe(); skip that,
  // or the field would visibly reseed right after it first appears.
  let timer: ReturnType<typeof setTimeout>;
  let first = true;
  new ResizeObserver(() => {
    if (first) {
      first = false;
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(setup, 150);
  }).observe(plate);
}
