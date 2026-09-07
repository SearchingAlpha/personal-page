// ── The intro ────────────────────────────────────────────────────────────────
// The first time the letter is opened in a session, the sheet is blank and the
// greeting — the first words of the letter, "Hi, I'm <name>" — is typed where
// it belongs, in its own type, with a caret. When it is whole, the caret goes
// and the rest of the letter eases in around it in reading order: the rest of
// the sentence, the "now" line, the list, the margins. Nothing moves: the intro
// becomes the page. A click or a key skips it; reduced motion, or a second
// visit in the same session, skips it altogether (see the inline script in
// index.astro, which decides that before the first paint so nothing flashes).
// To watch it again, open /#intro.

const TYPE_MS = 70; // per character typed
const HOLD_MS = 550; // after typing, before the reveal
const REVEAL_MS = 1600; // the reveal transitions, in letter.css

const KEY = 'letter-intro';

export function startIntro() {
  const root = document.documentElement;
  const hi = document.querySelector<HTMLElement>('.lead__hi');
  if (!root.classList.contains('intro') || !hi) return;

  const text = hi.dataset.text ?? hi.textContent ?? '';
  let done = false;

  const timers: ReturnType<typeof setTimeout>[] = [];
  const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

  function finish(skipped: boolean) {
    if (done) return;
    done = true;
    for (const t of timers) clearTimeout(t);
    removeEventListener('pointerdown', skip);
    removeEventListener('keydown', skip);
    hi.textContent = text;
    hi.classList.add('is-typed');
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

  // Empty the greeting, show the caret, type; hold; reveal.
  hi.textContent = '';
  hi.classList.add('is-typing');
  let ms = 350;
  for (let i = 1; i <= text.length; i++) {
    later(ms, () => (hi.textContent = text.slice(0, i)));
    ms += TYPE_MS * (0.7 + Math.random() * 0.6);
  }
  later(ms + HOLD_MS, () => finish(false));
}
