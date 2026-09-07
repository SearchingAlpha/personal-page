// ── Interests ────────────────────────────────────────────────────────────────
// What I read and listen to. Books carry a theme, which is how the full list
// is filed on /interests, and a one-line synopsis; the ones marked `favourite`
// also sit on the shelf at the top of the page, as covers. A cover is a file in
// public/covers (the ones here come from Open Library); a favourite without one
// is typeset instead. Each podcast links once, to its Spotify page. Prose
// fields may carry links as [text](url).
//
// Titles are in the language I read them in.

export const themes = [
  'Literature',
  'History',
  'Science & engineering',
  'Money & markets',
  'Business & building',
  'Work & habits',
] as const;

export type Theme = (typeof themes)[number];

export interface Book {
  title: string;
  author: string;
  theme: Theme;
  /** One line: what it is about. */
  blurb?: string;
  /** On the shelf at the top of /interests, with its cover. */
  favourite?: boolean;
  /** Path under public/, e.g. "/covers/trafalgar.jpg". Favourites only. */
  cover?: string;
}

export const books: Book[] = [
  // Literature
  {
    title: 'Trafalgar',
    author: 'Benito Pérez Galdós',
    theme: 'Literature',
    blurb: 'The first of the Episodios Nacionales: a boy from Cádiz aboard the Santísima Trinidad at the battle of 1805.',
    favourite: true,
    cover: '/covers/trafalgar.jpg',
  },
  {
    title: 'La colmena',
    author: 'Camilo José Cela',
    theme: 'Literature',
    blurb: 'Three days in the Madrid of 1943, through some three hundred characters who cross paths in a café.',
  },
  {
    title: 'La familia de Pascual Duarte',
    author: 'Camilo José Cela',
    theme: 'Literature',
    blurb: 'A condemned peasant from Extremadura writes down his life and its violence. The novel that opened tremendismo.',
  },
  {
    title: 'Comedia',
    author: 'Dante Alighieri',
    theme: 'Literature',
    blurb: "Dante's journey through Hell, Purgatory and Paradise, guided first by Virgil and then by Beatrice.",
  },
  {
    title: 'Odisea',
    author: 'Homero',
    theme: 'Literature',
    blurb: "Odysseus's ten-year way home from Troy to Ithaca, and what he finds when he gets there.",
  },

  // History
  {
    title: 'Historia verdadera de la conquista de la Nueva España',
    author: 'Bernal Díaz del Castillo',
    theme: 'History',
    blurb: "A foot soldier's eyewitness account of Cortés's conquest of Mexico, written in old age to set the record straight.",
    favourite: true,
    cover: '/covers/historia-verdadera.jpg',
  },
  {
    title: 'The Box',
    author: 'Marc Levinson',
    theme: 'History',
    blurb: 'How the shipping container, and the fights over its standards, made global trade cheap.',
  },

  // Science & engineering
  {
    title: 'Skunk Works',
    author: 'Ben R. Rich & Leo Janos',
    theme: 'Science & engineering',
    blurb: "The inside story of Lockheed's secret division, from the U-2 and the SR-71 to the F-117 stealth fighter.",
    favourite: true,
    cover: '/covers/skunk-works.jpg',
  },
  {
    title: "Surely You're Joking, Mr. Feynman!",
    author: 'Richard P. Feynman',
    theme: 'Science & engineering',
    blurb: "Feynman's anecdotes: safecracking at Los Alamos, samba in Rio, and how a curious character does physics.",
    favourite: true,
    cover: '/covers/surely-youre-joking.jpg',
  },
  {
    title: 'When We Cease to Understand the World',
    author: 'Benjamín Labatut',
    theme: 'Science & engineering',
    blurb: 'Haber, Schwarzschild, Grothendieck, Heisenberg, Schrödinger: the moments where discovery and madness touch. Part fact, part fiction.',
    favourite: true,
    cover: '/covers/when-we-cease.jpg',
  },

  // Money & markets
  {
    title: 'El inversor inteligente',
    author: 'Benjamin Graham',
    theme: 'Money & markets',
    blurb: "Graham's case for value investing: margin of safety, Mr. Market, and the line between investing and speculating.",
  },
  {
    title: "Poor Charlie's Almanack",
    author: 'Charles T. Munger',
    theme: 'Money & markets',
    blurb: "Munger's talks collected: mental models, the psychology of human misjudgment, and inverting every problem.",
  },
  {
    title: 'The Man Who Solved the Market',
    author: 'Gregory Zuckerman',
    theme: 'Money & markets',
    blurb: 'Jim Simons and Renaissance Technologies: how mathematicians built the most profitable fund in history.',
  },
  {
    title: 'The Trading Game',
    author: 'Gary Stevenson',
    theme: 'Money & markets',
    blurb: 'A Citibank trader from East London bets that the economy will not recover, wins, and walks away.',
  },
  {
    title: 'Padre rico, padre pobre',
    author: 'Robert T. Kiyosaki',
    theme: 'Money & markets',
    blurb: 'Two fathers, two views of money: assets against liabilities, and why school never teaches the difference.',
  },

  // Business & building
  {
    title: 'Titan',
    author: 'Ron Chernow',
    theme: 'Business & building',
    blurb: 'The life of John D. Rockefeller: Standard Oil, the trusts, and the philanthropy that followed.',
  },
  {
    title: 'What It Takes',
    author: 'Stephen A. Schwarzman',
    theme: 'Business & building',
    blurb: 'Schwarzman on building Blackstone, from a two-man M&A shop to the largest alternative asset manager.',
  },
  {
    title: 'The Mom Test',
    author: 'Rob Fitzpatrick',
    theme: 'Business & building',
    blurb: 'How to talk to customers about your idea without them lying to you: ask about their life, not your product.',
  },
  {
    title: 'Built to Sell',
    author: 'John Warrillow',
    theme: 'Business & building',
    blurb: 'A parable about turning a service business that depends on its owner into one that runs, and sells, without them.',
  },
  {
    title: 'Show Your Work!',
    author: 'Austin Kleon',
    theme: 'Business & building',
    blurb: 'Ten ways to share what you make while you make it, and let the work find its audience.',
  },

  // Work & habits
  {
    title: 'Hábitos atómicos',
    author: 'James Clear',
    theme: 'Work & habits',
    blurb: 'Small changes, compounded: make a habit obvious, attractive, easy and satisfying.',
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    theme: 'Work & habits',
    blurb: 'Long, undistracted focus as the rare skill of the knowledge economy, and how to protect it.',
  },
  {
    title: 'Grit',
    author: 'Angela Duckworth',
    theme: 'Work & habits',
    blurb: 'Why sustained passion and perseverance predict achievement better than talent does.',
  },
];

export interface Podcast {
  name: string;
  /** Who makes it. */
  by: string;
  /** Its Spotify page — the title links here. */
  spotify: string;
  /** One line: what it is. */
  blurb: string;
}

export const podcasts: Podcast[] = [
  {
    name: 'Kapital',
    by: 'Joan Tubau',
    spotify: 'https://open.spotify.com/show/4LV2hhtduA5qOUbzf5Ek6C',
    blurb: 'Long conversations about money, work and how to think about both. In Spanish.',
  },
  {
    name: 'Podcast de itnig',
    by: 'itnig',
    spotify: 'https://open.spotify.com/show/75ao7vbM0cH7SKIsyYN3iZ',
    blurb: 'Weekly conversations with founders, executives and investors on business cases and tech news.',
  },
  {
    name: 'La Ingobernable',
    by: 'microbio & Singular Solving',
    spotify: 'https://open.spotify.com/show/0qbRXQ0I7wTQbtWstTQCzq',
    blurb: 'A podcast about Marca España: how Spain is run, and how it is seen.',
  },
  {
    name: 'Conferencias de la March',
    by: 'Fundación Juan March',
    spotify: 'https://open.spotify.com/show/17uhaPMDTV3w8DHlJlAMx3',
    blurb: 'The lectures given at the Fundación Juan March in Madrid and Palma, as audio.',
  },
];

/** The shelf: favourites, in the order they are listed above. */
export const favourites = (): Book[] => books.filter((b) => b.favourite);

/** The full list filed by theme, in `themes` order; empty themes are skipped. */
export function booksByTheme(): { theme: Theme; books: Book[] }[] {
  return themes
    .map((theme) => ({ theme, books: books.filter((b) => b.theme === theme) }))
    .filter((t) => t.books.length > 0);
}
