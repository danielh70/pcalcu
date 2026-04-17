import { parseLength, computeTapeOperation, closestTapeMeasure } from './TapeCalc';
import Fraction from 'fraction.js';

describe('TapeCalc helpers', () => {
  test('parseLength handles mixed numbers and simple fractions', () => {
    expect(parseLength('10 1/2').valueOf()).toBeCloseTo(10.5);
    expect(parseLength('1/2').valueOf()).toBeCloseTo(0.5);
    expect(parseLength('10').valueOf()).toBeCloseTo(10);
  });

  test('parseLength throws on invalid input', () => {
    expect(() => parseLength('invalid')).toThrow(/Invalid length/);
    expect(() => parseLength('')).toThrow(/Empty length/);
  });

  test('computeTapeOperation add/sub/mul/div', () => {
    const a = parseLength('10');
    const b = parseLength('1/2');
    expect(computeTapeOperation(a, b, 'add').valueOf()).toBeCloseTo(10.5);
    expect(computeTapeOperation(a, b, 'subtract').valueOf()).toBeCloseTo(9.5);
    expect(computeTapeOperation(a, b, 'multiply').valueOf()).toBeCloseTo(5);
    expect(computeTapeOperation(a, b, 'divide').valueOf()).toBeCloseTo(20);
  });

  test('computeTapeOperation division by zero throws', () => {
    const a = parseLength('10');
    const b = parseLength('0');
    expect(() => computeTapeOperation(a, b, 'divide')).toThrow(/Division by zero/);
  });

  test('closestTapeMeasure rounds to nearest 1/16', () => {
    const f = closestTapeMeasure(10.2);
    expect(f).toBeInstanceOf(Fraction);
    expect(f.toFraction(true)).toMatch(/\d+/);
  });

  describe('parseLength ft-in forms', () => {
    const V = (s) => parseLength(s).valueOf();

    test('feet only', () => {
      expect(V("12'")).toBe(144);
      expect(V("1'")).toBe(12);
      expect(V("0'")).toBe(0);
      expect(V("100'")).toBe(1200);
    });

    test('inches only with inch mark', () => {
      expect(V('3"')).toBe(3);
      expect(V('1/2"')).toBe(0.5);
      expect(V('3 1/2"')).toBeCloseTo(3.5);
      expect(V('3-1/2"')).toBeCloseTo(3.5);
    });

    test('feet and inches with space', () => {
      expect(V("12' 3\"")).toBe(147);
      expect(V("12' 3 1/2\"")).toBeCloseTo(147.5);
      expect(V("1' 1/2\"")).toBeCloseTo(12.5);
    });

    test('feet and inches without space, hyphenated mixed', () => {
      expect(V("12'3-1/2\"")).toBeCloseTo(147.5);
      expect(V("12'3\"")).toBe(147);
      expect(V("1'1/2\"")).toBeCloseTo(12.5);
    });

    test('feet with inches but no inch mark (lenient)', () => {
      expect(V("12' 3")).toBe(147);
      expect(V("12' 3 1/2")).toBeCloseTo(147.5);
    });

    test('bare inputs remain unchanged', () => {
      expect(V('10 1/2')).toBeCloseTo(10.5);
      expect(V('1/2')).toBeCloseTo(0.5);
      expect(V('10')).toBe(10);
    });

    test('malformed inputs throw', () => {
      expect(() => parseLength("'")).toThrow(/Invalid length/);
      expect(() => parseLength("'5")).toThrow(/Invalid length/);
      expect(() => parseLength('"')).toThrow(/Invalid length/);
      expect(() => parseLength("12' abc")).toThrow(/Invalid length/);
      expect(() => parseLength("abc'3\"")).toThrow(/Invalid length/);
      expect(() => parseLength("12' 3\" 4")).toThrow(/Invalid length/);
      expect(() => parseLength("12''")).toThrow(/Invalid length/);
      expect(() => parseLength("3\"'")).toThrow(/Invalid length/);
      expect(() => parseLength('12"3"')).toThrow(/Invalid length/);
    });
  });
});
