import Fraction from 'fraction.js';

export function closestSixteenth(value) {
  return new Fraction(Math.round(16 * new Fraction(value).valueOf()), 16);
}

// Parses inputs like "10", "1/2", "10 1/2" into a Fraction.
export function parseLength(input) {
  const s = String(input ?? '').trim();
  if (!s) throw new Error('Empty length');

  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const num = Number(mixed[2]);
    const den = Number(mixed[3]);
    return new Fraction(whole).add(new Fraction(num, den));
  }

  if (/^\d+\/\d+$/.test(s)) return new Fraction(s);

  const n = Number(s);
  if (!Number.isNaN(n)) return new Fraction(n);

  throw new Error('Invalid length');
}
