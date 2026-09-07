// Helpers for the letter design (home and section pages).

// Newsreader, a text serif with optical sizes, for everything that is prose —
// the letter itself, titles, list entries — at 400, plus 600 for the few bold
// words inside a line. Inter, one weight up from the body, for the small
// labels: dates, counts, the header and footer.
export const FONT_LINKS = [
  'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Inter:wght@400;500&display=swap',
];

/** "01", "02"… — the counts as they appear in the small labels. */
export const pad = (n: number) => String(n).padStart(2, '0');

const ONES = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** A count spelled out inside a sentence ("six projects", "twenty-three books"); digits from a hundred. */
export function countWord(n: number): string {
  if (n < 20) return ONES[n] ?? String(n);
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  return String(n);
}

/** "six projects", "one essay". */
export const counted = (n: number, one: string, many: string) => `${countWord(n)} ${n === 1 ? one : many}`;
