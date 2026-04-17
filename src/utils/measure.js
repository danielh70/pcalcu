import Fraction from 'fraction.js';

export function closestSixteenth(value) {
  return new Fraction(Math.round(16 * new Fraction(value).valueOf()), 16);
}

// Parse the inches portion of a length: "3", "1/2", "3 1/2", or "3-1/2"
// (hyphen treated as whitespace between whole and fraction). Returns a
// Fraction of inches. Throws on malformed input.
function parseBareInches(s) {
  const normalized = s.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  const mixed = normalized.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    return new Fraction(Number(mixed[1])).add(new Fraction(Number(mixed[2]), Number(mixed[3])));
  }
  if (/^\d+\/\d+$/.test(normalized)) return new Fraction(normalized);
  if (/^\d+$/.test(normalized)) return new Fraction(Number(normalized));
  throw new Error('Invalid length');
}

// Accepts bare inches ("10", "1/2", "10 1/2") and feet-inches forms:
//   "12'", "3\"", "12' 3\"", "12' 3 1/2\"", "12'3-1/2\""
// All returned as a Fraction of inches.
export function parseLength(input) {
  const s = String(input ?? '').trim();
  if (!s) throw new Error('Empty length');

  const hasFt = s.includes("'");
  const hasIn = s.includes('"');

  if (!hasFt && !hasIn) {
    // Preserve original bare-inches behavior: no hyphen normalization,
    // trailing decimals via Number() for e.g. "10.5".
    const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) {
      return new Fraction(Number(mixed[1])).add(new Fraction(Number(mixed[2]), Number(mixed[3])));
    }
    if (/^\d+\/\d+$/.test(s)) return new Fraction(s);
    const n = Number(s);
    if (!Number.isNaN(n)) return new Fraction(n);
    throw new Error('Invalid length');
  }

  let feetStr = '';
  let inchesStr = '';

  if (hasFt) {
    const i = s.indexOf("'");
    feetStr = s.slice(0, i).trim();
    inchesStr = s.slice(i + 1).trim();
    if (!feetStr) throw new Error('Invalid length');
    // A second ' is malformed.
    if (inchesStr.includes("'")) throw new Error('Invalid length');
  } else {
    inchesStr = s;
  }

  if (inchesStr.endsWith('"')) {
    inchesStr = inchesStr.slice(0, -1).trim();
  } else if (hasIn) {
    // An inch mark appearing somewhere other than the end is malformed.
    throw new Error('Invalid length');
  }
  if (inchesStr.includes('"')) throw new Error('Invalid length');

  let feet = new Fraction(0);
  if (feetStr) {
    if (!/^\d+$/.test(feetStr)) throw new Error('Invalid length');
    feet = new Fraction(Number(feetStr));
  }

  let inches = new Fraction(0);
  if (inchesStr) {
    inches = parseBareInches(inchesStr);
  } else if (!feetStr) {
    // e.g. input was just `"` with no digits.
    throw new Error('Invalid length');
  }

  return feet.mul(12).add(inches);
}
