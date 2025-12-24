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
});
