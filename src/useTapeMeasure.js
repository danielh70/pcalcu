const Fraction = require('fraction.js');

export default function useTapeMeasure(x) {
  return new Fraction(Math.round(16 * Fraction(x).valueOf()), 16);
}
