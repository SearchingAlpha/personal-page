// ── The letter ───────────────────────────────────────────────────────────────
// The home page is a short letter: one paragraph in the first person, with the
// sections of the site linked from inside the sentences. This file is what the
// letter and the section pages share: which sections exist, in what order, and
// the dated "now" line.
//
// Growing the site is adding a section here, its page in src/pages, and its
// count (and a phrase to hang the link on) in src/pages/index.astro. A page
// with several parts (/interests) can hang several links, one per part, by
// counting each part under its own hash ("/interests#books").

export interface Section {
  /** Title of the section page and of its link in the index. */
  label: string;
  /** Route of the section page. A page with this path must exist in src/pages. */
  href: string;
}

/** Display order: it drives the numbering (01, 02…) on the section pages. */
export const sections: Section[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'Writing', href: '/writing' },
  { label: 'Interests', href: '/interests' },
  { label: 'About me', href: '/about' },
  { label: 'Elsewhere', href: '/elsewhere' },
];

// Anything prefixed `TODO —` is a placeholder: outlined on screen, listed by
// `npm run todo`.
export const now = {
  /** One line, present tense: what you are actually doing right now. */
  text: "Working in Amazon building genAI applications. Right now I'm experimenting in the startup world.",
  /** When `text` was last true. Shown next to it — keeps you honest. */
  updated: 'Sep 2026',
};

/** Zero-padded position of a section in display order: "01", "02"… */
export function sectionIndex(s: Section): string {
  return String(sections.indexOf(s) + 1).padStart(2, '0');
}

/** Looks up the section for a page so its title stays single-sourced here. */
export function sectionFor(href: string): Section {
  const hit = sections.find((s) => s.href === href);
  if (!hit) throw new Error(`letter.ts: no section points at "${href}" — add one or fix the page.`);
  return hit;
}
