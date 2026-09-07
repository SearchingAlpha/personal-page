// ── Prose in data ────────────────────────────────────────────────────────────
// Prose fields in the data files (a project's blurb, a fact about me) may carry
// two kinds of mark-up: links written as [text](url), which become the site's
// numbered references (<a class="ref">), and **bold** for the few words that
// matter most in a line. Everything else is escaped, so a blurb stays plain
// text to write and no HTML lives in the data. Render the result with
// `set:html`. The reference number itself is a CSS counter (letter.css,
// "References"): reading order, never typed by hand.

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MARK = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export function refs(text: string): string {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(MARK)) {
    out += escape(text.slice(last, m.index));
    out +=
      m[3] !== undefined
        ? `<strong>${escape(m[3])}</strong>`
        : `<a class="ref" href="${escape(m[2])}">${escape(m[1])}</a>`;
    last = m.index + m[0].length;
  }
  return out + escape(text.slice(last));
}
