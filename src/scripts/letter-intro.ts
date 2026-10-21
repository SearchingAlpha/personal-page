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
//
// It types into the greeting's own text nodes rather than rewriting its text,
// so whatever markup the greeting holds is still there when it is whole: on
// /graph the name inside it is a span that later flies to the graph.

const TYPE_MS = 70; // per character typed
const HOLD_MS = 550; // after typing, before the reveal
const REVEAL_MS = 1600; // the reveal transitions, in letter.css

const KEY = 'letter-intro';

export function startIntro() {
  const root = document.documentElement;
  const hi = document.querySelector<HTMLElement>('.lead__hi');
  if (!root.classList.contains('intro') || !hi) return;

  // Each text node of the greeting and its words; typing shows the first `count` characters across them.
  const texts: { node: Text; full: string }[] = [];
  for (const walker = document.createTreeWalker(hi, NodeFilter.SHOW_TEXT); walker.nextNode(); ) {
    texts.push({ node: walker.currentNode as Text, full: (walker.currentNode as Text).data });
  }
  const total = texts.reduce((n, t) => n + t.full.length, 0);
  const show = (count: number) => {
    let left = count;
    for (const t of texts) {
      const k = Math.max(0, Math.min(t.full.length, left));
      t.node.data = t.full.slice(0, k);
      left -= k;
    }
  };
  let done = false;

  const timers: ReturnType<typeof setTimeout>[] = [];
  const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

  function finish(skipped: boolean) {
    if (done) return;
    done = true;
    for (const t of timers) clearTimeout(t);
    removeEventListener('pointerdown', skip);
    removeEventListener('keydown', skip);
    show(total);
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
  show(0);
  hi.classList.add('is-typing');
  let ms = 350;
  for (let i = 1; i <= total; i++) {
    later(ms, () => show(i));
    ms += TYPE_MS * (0.7 + Math.random() * 0.6);
  }
  later(ms + HOLD_MS, () => finish(false));
}
