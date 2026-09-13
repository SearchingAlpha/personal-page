// ── Renaissance Technological Field ──────────────────────────────────────────
// A cellular automaton meets Renaissance celestial cartography & technical blueprints
// (Da Vinci codex, Kepler armillary orbits, and Conway's Game of Life in living ink).
//
// Cells evolve on a delicate coordinate lattice. Newly born cells flare in warm rust
// (#b3401e); mature structures settle into deep celestial blueprint indigo (#1e3a8a).
// Subtle constellation lines link adjacent live nodes. The central letter text rests
// in an ethereal clearing so reading remains effortless.

const PITCH = 18; // px between lattice nodes
const DENSITY = 0.18; // initial live fraction
const STEP_MS = 500; // time per generation
const EASE = 0.15; // smooth fade in/out
const REACH = 4.5; // pointer warmth radius (in cells)
const COOL = 0.92; // pointer cooling factor per frame
const SEED = 2; // radius of life born on pointer glide

// Renaissance palette:
// Paper: #fbf9f4, Ink: #1c1a17, Rust: #b3401e, Celestial Indigo: #1e3a8a
const RUST = '179, 64, 30'; // #b3401e
const INDIGO = '28, 54, 98'; // #1c3662 celestial technical ink
const GRID_INK = '30, 45, 75'; // blueprint coordinate lattice

// Classic Glider
const GLIDER: [number, number][] = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];

export function startRenaissanceField(canvas: HTMLCanvasElement, textContainer: HTMLElement | null) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0;
  let h = 0;
  let cols = 0;
  let rows = 0;
  let cells = new Uint8Array(0);
  let next = new Uint8Array(0);
  let glow = new Float32Array(0);
  let age = new Uint8Array(0); // 0 = newborn, increments to 10
  let fall = new Float32Array(0); // 0 inside text clearing -> 1 in margins
  let heat = new Float32Array(0); // pointer energy
  let cursor: { x: number; y: number } | null = null;
  let blueprintCanvas: HTMLCanvasElement | null = null;
  let dirty = true;

  /** Calculates falloff around the central letter so text stays crisp and readable */
  function getFalloff(px: number, py: number): number {
    if (!textContainer) return 1;
    const rect = textContainer.getBoundingClientRect();
    // Padding inside the text column where cells should be softest
    const dx = Math.max(rect.left - px, 0, px - rect.right);
    const dy = Math.max(rect.top - py, 0, py - rect.bottom);
    const dist = Math.hypot(dx, dy);
    // Smooth transition: 0 inside text area, increasing to 1.0 about 120px outward
    return Math.min(1, Math.max(0.08, (dist - 12) / 130));
  }

  /** Pre-renders static Renaissance technical blueprint markings */
  function renderBlueprint() {
    blueprintCanvas = document.createElement('canvas');
    blueprintCanvas.width = canvas.width;
    blueprintCanvas.height = canvas.height;
    const bctx = blueprintCanvas.getContext('2d');
    if (!bctx) return;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. Draw delicate grid lattice ticks (+)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * PITCH + PITCH / 2;
        const py = y * PITCH + PITCH / 2;
        const f = fall[y * cols + x];
        if (f < 0.12) continue;

        const alpha = (0.16 * f).toFixed(3);
        bctx.strokeStyle = `rgba(${GRID_INK}, ${alpha})`;
        bctx.lineWidth = 0.65;

        // Micro-crosshairs (+) at major nodes
        if (x % 3 === 0 && y % 3 === 0) {
          bctx.beginPath();
          bctx.moveTo(px - 2.5, py);
          bctx.lineTo(px + 2.5, py);
          bctx.moveTo(px, py - 2.5);
          bctx.lineTo(px, py + 2.5);
          bctx.stroke();
        } else if (Math.random() < 0.25) {
          // Tiny delicate coordinate dot
          bctx.fillStyle = `rgba(${GRID_INK}, ${(0.18 * f).toFixed(3)})`;
          bctx.fillRect(px - 0.5, py - 0.5, 1, 1);
        }
      }
    }

    // 2. Renaissance celestial / technical armillary rings
    const cx = w * 0.5;
    const cy = h * 0.42;

    bctx.strokeStyle = `rgba(${GRID_INK}, 0.05)`;
    bctx.lineWidth = 0.75;
    bctx.setLineDash([3, 6]);

    // Concentric celestial circles
    const radii = [w * 0.25, w * 0.38, w * 0.52, Math.max(w, h) * 0.68];
    for (const r of radii) {
      bctx.beginPath();
      bctx.arc(cx, cy, r, 0, Math.PI * 2);
      bctx.stroke();
    }

    // Diagonal technical quadrant lines
    bctx.setLineDash([2, 8]);
    bctx.beginPath();
    bctx.moveTo(cx - radii[2], cy - radii[2] * 0.5);
    bctx.lineTo(cx + radii[2], cy + radii[2] * 0.5);
    bctx.moveTo(cx - radii[2] * 0.7, cy + radii[2] * 0.7);
    bctx.lineTo(cx + radii[2] * 0.7, cy - radii[2] * 0.7);
    bctx.stroke();

    bctx.setLineDash([]);
  }

  function setup() {
    w = window.innerWidth;
    h = window.innerHeight;
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
    age = new Uint8Array(n);
    fall = new Float32Array(n);
    heat = new Float32Array(n);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        fall[y * cols + x] = getFalloff(x * PITCH + PITCH / 2, y * PITCH + PITCH / 2);
      }
    }

    for (let k = 0; k < n; k++) {
      // Seed cells with higher density in outer margins, very sparse in center
      const prob = DENSITY * fall[k];
      cells[k] = Math.random() < prob ? 1 : 0;
      glow[k] = cells[k];
      age[k] = cells[k] ? 5 : 0;
    }

    renderBlueprint();
    dirty = true;
  }

  /** One Conway generation */
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

        const isAlive = cells[mid + x] === 1;
        const willLive = isAlive ? n === 2 || n === 3 : n === 3;
        const k = mid + x;

        if (willLive) {
          next[k] = 1;
          age[k] = isAlive ? Math.min(10, age[k] + 1) : 0; // 0 = newly born
          pop++;
        } else {
          next[k] = 0;
        }
      }
    }
    [cells, next] = [next, cells];

    // Spontaneous gentle fluctuations if population thins
    if (pop < cells.length * 0.08) {
      for (let i = 0; i < 2; i++) {
        const rx = Math.floor(Math.random() * cols);
        const ry = Math.floor(Math.random() * rows);
        if (fall[ry * cols + rx] > 0.4) {
          sprinkle(rx, ry, 3, 0.5);
        }
      }
    }
    dirty = true;
  }

  function sprinkle(cx: number, cy: number, radius: number, p: number, sudden = false) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const x = (cx + dx + cols) % cols;
        const y = (cy + dy + rows) % rows;
        if (Math.random() < p) {
          const k = y * cols + x;
          cells[k] = 1;
          age[k] = 0;
          if (sudden) glow[k] = 1;
        }
      }
    }
    dirty = true;
  }

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

  function draw() {
    const c = ctx!;
    c.clearRect(0, 0, w, h);

    // Draw background architectural blueprint
    if (blueprintCanvas) {
      c.drawImage(blueprintCanvas, 0, 0, w, h);
    }

    // 1. Draw delicate constellation micro-bridges between adjacent live cells
    c.lineWidth = 0.75;
    for (let y = 0; y < rows; y++) {
      const mid = y * cols;
      const dn = ((y + 1) % rows) * cols;
      for (let x = 0; x < cols; x++) {
        const k = mid + x;
        const g = glow[k] * fall[k];
        if (g < 0.25) continue;

        const px = x * PITCH + PITCH / 2;
        const py = y * PITCH + PITCH / 2;

        // Check right neighbor
        const kr = mid + ((x + 1) % cols);
        const gr = glow[kr] * fall[kr];
        if (gr > 0.25) {
          const bridgeAlpha = (Math.min(g, gr) * 0.18).toFixed(3);
          c.strokeStyle = `rgba(${INDIGO}, ${bridgeAlpha})`;
          c.beginPath();
          c.moveTo(px, py);
          c.lineTo(px + PITCH, py);
          c.stroke();
        }

        // Check bottom neighbor
        const kd = dn + x;
        const gd = glow[kd] * fall[kd];
        if (gd > 0.25) {
          const bridgeAlpha = (Math.min(g, gd) * 0.18).toFixed(3);
          c.strokeStyle = `rgba(${INDIGO}, ${bridgeAlpha})`;
          c.beginPath();
          c.moveTo(px, py);
          c.lineTo(px, py + PITCH);
          c.stroke();
        }
      }
    }

    // 2. Draw live nodes
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const k = y * cols + x;
        const g = glow[k] * fall[k];
        if (g < 0.04) continue;

        const px = x * PITCH + PITCH / 2;
        const py = y * PITCH + PITCH / 2;

        const warmth = heat[k];
        const isNewborn = age[k] <= 2;
        const color = isNewborn || warmth > 0.3 ? RUST : INDIGO;
        const alpha = Math.min(0.65, (g * 0.45 + warmth * 0.4)).toFixed(3);

        c.fillStyle = `rgba(${color}, ${alpha})`;

        // Draw refined circular node
        const size = Math.max(1.8, 1.8 + g * 1.6 + warmth * 1.2);
        c.beginPath();
        c.arc(px, py, size / 2, 0, Math.PI * 2);
        c.fill();
      }
    }
  }

  function frame() {
    warm();
    let moving = cursor !== null;
    for (let k = 0; k < cells.length; k++) {
      const d = cells[k] - glow[k];
      if (Math.abs(d) > 0.005) {
        glow[k] += d * EASE;
        moving = true;
      } else {
        glow[k] = cells[k];
      }

      if (heat[k] > 0.005) {
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

  if (reducedMotion) {
    draw();
    return;
  }

  requestAnimationFrame(frame);
  const stepInterval = setInterval(step, STEP_MS);

  // Pointer interactions: moving glides life
  let lastCell = -1;
  const onPointerMove = (e: PointerEvent) => {
    const fx = e.clientX / PITCH;
    const fy = e.clientY / PITCH;
    cursor = { x: fx, y: fy };
    const x = Math.floor(fx);
    const y = Math.floor(fy);
    if (x < 0 || y < 0 || x >= cols || y >= rows) return;
    const k = y * cols + x;
    if (k === lastCell) return;
    lastCell = k;
    if (fall[k] > 0.2) {
      sprinkle(x, y, SEED, 0.35, true);
    }
  };

  const onPointerLeave = () => {
    cursor = null;
  };

  // Clicking drops a celestial glider
  const onClick = (e: MouseEvent) => {
    if ((e.target as Element)?.closest('a, button')) return;
    const cx = Math.floor(e.clientX / PITCH);
    const cy = Math.floor(e.clientY / PITCH);
    const sx = Math.random() < 0.5 ? 1 : -1;
    const sy = Math.random() < 0.5 ? 1 : -1;
    for (const [gx, gy] of GLIDER) {
      const x = (cx + (gx - 1) * sx + cols) % cols;
      const y = (cy + (gy - 1) * sy + rows) % rows;
      cells[y * cols + x] = 1;
      age[y * cols + x] = 0;
      glow[y * cols + x] = 1;
    }
    dirty = true;
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('click', onClick);

  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  });

  return () => {
    clearInterval(stepInterval);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('click', onClick);
  };
}
