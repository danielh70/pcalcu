import { computeLocations, closestTapeMeasure } from './Panel';

describe('computeLocations', () => {
  test('returns structure for valid input', () => {
    const res = computeLocations(100, '1/2', 2);
    expect(res).toHaveProperty('decimal');
    expect(Array.isArray(res.decimal)).toBe(true);
    expect(res.decimal.length).toBe(3); // start + holes + last point
    expect(res.holeCount).toBe(2);
    expect(typeof res.baseDistance).toBe('number');
    expect(typeof res.totalLength).toBe('number');

    // decimal start and end correctness
    expect(res.decimal[0]).toBe(10);
    expect(res.decimal[res.decimal.length - 1]).toBeCloseTo(res.totalLength - 10);
  });

  test('throws on invalid fraction', () => {
    expect(() => computeLocations(100, 'invalid', 2)).toThrow(/Invalid fraction/);
  });

  test('throws on small length', () => {
    expect(() => computeLocations(20, '', 1)).toThrow(/Invalid length/);
  });

  test('uses at least one hole when requested 0', () => {
    const res = computeLocations(100, '', 0);
    expect(res.holeCount).toBeGreaterThanOrEqual(1);
  });

  test('auto hole count targets 15–20 inch spacing when feasible', () => {
    // totalLength = 100 => usable = 80, so holeCount=4 yields 20" spacing.
    const res = computeLocations(100, '', 0);
    expect(res.baseDistance).toBeGreaterThanOrEqual(15);
    expect(res.baseDistance).toBeLessThanOrEqual(20);
    // Should include interior points (not just 10 and end).
    expect(res.decimal.length).toBeGreaterThan(2);
  });

  test('baseDistance calculation includes fraction input', () => {
    const res = computeLocations(100, '1/2', 2);
    // totalLength should be 100.5
    expect(res.totalLength).toBeCloseTo(100.5);
    // baseDistance = (100.5 - 20) / 2
    expect(res.baseDistance).toBeCloseTo((100.5 - 20) / 2);
  });

  test('closestTapeMeasure returns a fractional string representation', () => {
    const f = closestTapeMeasure(10.2).toFraction(true);
    expect(typeof f).toBe('string');
  });
});
