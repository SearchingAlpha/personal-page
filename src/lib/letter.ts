// Helpers for the letter design (home and section pages).

// Nunito Sans for everything (src/styles/tokens.css): 400 for the words, 700
// for what can be followed and the few words that matter most, and the
// italics of both for titles.
export const FONT_LINKS = [
  'https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap',
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
