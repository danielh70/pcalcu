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

// Format a Fraction of inches for display. Rounds the total to the
// nearest 1/16" before splitting into feet and inches, so boundaries
// like 11 16/16" become 1' 0" rather than 0' 12".
//
//   'in'    → mixed inches, no unit marker ("10 1/2")
//   'ft-in' → feet and inches, marked ("12' 3 1/2\"")
//   'auto'  → ft-in when |value| >= 12", else inches
export function formatLength(fraction, options = {}) {
  const { unit = 'in' } = options;

  const value = new Fraction(fraction);
  const sign = value.valueOf() < 0 ? '-' : '';
  const k = Math.round(16 * Math.abs(value.valueOf())); // total sixteenths
  const rounded = new Fraction(k, 16);

  const useFtIn = unit === 'ft-in' || (unit === 'auto' && k >= 192);

  if (useFtIn) {
    const feet = Math.floor(k / 192);
    const remSixteenths = k - feet * 192;
    const inches = new Fraction(remSixteenths, 16);
    if (feet === 0 && remSixteenths === 0) return `${sign}0"`;
    if (feet === 0) return `${sign}${inches.toFraction(true)}"`;
    if (remSixteenths === 0) return `${sign}${feet}'`;
    return `${sign}${feet}' ${inches.toFraction(true)}"`;
  }

  return `${sign}${rounded.toFraction(true)}`;
}

