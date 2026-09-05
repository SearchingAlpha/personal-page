// ── The intro ────────────────────────────────────────────────────────────────
// The first time the plate is opened in a session, it is empty but for the
// field, and a line (.greeting) is typed in the middle: "Hi, this is <name>".
// The line is laid so that the name lands exactly where the nucleus's name
// will be, in the same type. Then the greeting fades, leaving the name; the
// nucleus frame fades in around it, the orbits grow out from it, the electrons
// and the annotations follow. The name never moves: the intro becomes the
// page. A click or a key skips it; reduced motion, or a second visit in the
// same session, skips it altogether (see the inline script in index.astro,
// which decides that before the first paint so nothing flashes).

const TYPE_MS = 70; // per character typed
const HOLD_MS = 600; // after typing, before the greeting fades
const FADE_MS = 450; // the greeting fading, before the reveal
const REVEAL_MS = 1500; // the reveal transitions, in rutherford.css

const KEY = 'rutherford-intro';

export function startIntro(plate: HTMLElement, text: string, name: string) {
  const root = document.documentElement;
  const line = plate.querySelector<HTMLElement>('.greeting');
  const pre = line?.querySelector<HTMLElement>('.greeting__pre');
  const who = line?.querySelector<HTMLElement>('.greeting__name');
  const nucleusName = plate.querySelector<HTMLElement>('.nucleus__name');
  if (!root.classList.contains('intro') || !line || !pre || !who || !nucleusName) return;

  const greeting = text.endsWith(name) ? text.slice(0, text.length - name.length) : text;
  const typed = { pre: 0, who: 0 };

  // Lay the line so the name's centre is the nucleus name's centre: fill both
  // spans, measure, then show only what has been typed so far.
  const fit = () => {
    pre.textContent = greeting;
    who.textContent = name;
    line.style.fontSize = getComputedStyle(nucleusName).fontSize;
    const p = plate.getBoundingClientRect();
    const n = nucleusName.getBoundingClientRect();
    const w = who.getBoundingClientRect();
    const l = line.getBoundingClientRect();
    line.style.top = `${n.top - p.top}px`;
    line.style.left = `${n.left - p.left + n.width / 2 - (w.left - l.left) - w.width / 2}px`;
    pre.textContent = greeting.slice(0, typed.pre);
    who.textContent = name.slice(0, typed.who);
  };
  let done = false;
  fit();
  addEventListener('resize', fit);
  // The web font may land after the first fit; measured in the fallback font,
  // the name would sit a few pixels off the nucleus's.
  document.fonts?.ready.then(() => !done && fit());

  const timers: ReturnType<typeof setTimeout>[] = [];
  const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

  function finish(skipped: boolean) {
    if (done) return;
    done = true;
    for (const t of timers) clearTimeout(t);
    removeEventListener('resize', fit);
    removeEventListener('pointerdown', skip);
    removeEventListener('keydown', skip);
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {}
    if (skipped) {
      root.classList.remove('intro', 'intro-reveal');
      return;
    }
    root.classList.add('intro-reveal');
    setTimeout(() => root.classList.remove('intro', 'intro-reveal'), REVEAL_MS);
  }
  const skip = () => finish(true);
  addEventListener('pointerdown', skip);
  addEventListener('keydown', skip);

  // Type the greeting, then the name; hold; fade the greeting; reveal.
  let ms = 250;
  for (let i = 1; i <= greeting.length; i++) {
    later(ms, () => (pre.textContent = greeting.slice(0, (typed.pre = i))));
    ms += TYPE_MS * (0.7 + Math.random() * 0.6);
  }
  for (let i = 1; i <= name.length; i++) {
    later(ms, () => (who.textContent = name.slice(0, (typed.who = i))));
    ms += TYPE_MS * (0.7 + Math.random() * 0.6);
  }
  ms += HOLD_MS;
  later(ms, () => {
    fit();
    line.classList.add('is-named');
  });
  later(ms + FADE_MS, () => finish(false));
}
