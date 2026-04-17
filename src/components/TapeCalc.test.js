import { parseLength, computeTapeOperation, closestTapeMeasure, formatLength, reducer, ACTIONS } from './TapeCalc';
import Fraction from 'fraction.js';

const baseState = () => ({
  input: '',
  operandA: '',
  pendingOp: null,
  phase: 'input',
  resultText: '',
  chainFrac: null,
  error: null,
  showFracPanel: false,
  history: [],
});

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

    test('round-trips: parseLength then formatLength ft-in', () => {
      expect(formatLength(parseLength("12' 3 1/2\""), { unit: 'ft-in' })).toBe("12' 3 1/2\"");
      expect(formatLength(parseLength("12'"), { unit: 'ft-in' })).toBe("12'");
      expect(formatLength(parseLength('3-1/2"'), { unit: 'ft-in' })).toBe('3 1/2"');
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

  describe('formatLength', () => {
    test("unit 'in' matches existing mixed-number display", () => {
      expect(formatLength(new Fraction(10.5))).toBe('10 1/2');
      expect(formatLength(new Fraction(10), { unit: 'in' })).toBe('10');
      expect(formatLength(new Fraction(1, 2), { unit: 'in' })).toBe('1/2');
      expect(formatLength(new Fraction(0), { unit: 'in' })).toBe('0');
    });

    test("unit 'in' rounds to nearest 1/16", () => {
      // 10 + 1/32 rounds to 10 1/16
      expect(formatLength(new Fraction(321, 32), { unit: 'in' })).toBe('10 1/16');
    });

    test("unit 'ft-in' formats feet and inches", () => {
      expect(formatLength(new Fraction(147.5), { unit: 'ft-in' })).toBe("12' 3 1/2\"");
      expect(formatLength(new Fraction(144), { unit: 'ft-in' })).toBe("12'");
      expect(formatLength(new Fraction(10.5), { unit: 'ft-in' })).toBe('10 1/2"');
      expect(formatLength(new Fraction(0), { unit: 'ft-in' })).toBe('0"');
    });

    test("unit 'ft-in' rounds total first so 11 15.5/16 becomes 1'", () => {
      // 11.96875 = 191.5/16 → rounds to 192/16 = 12" → 1'
      expect(formatLength(new Fraction(3831, 320), { unit: 'ft-in' })).toBe("1'");
    });

    test("unit 'auto' switches at 12\"", () => {
      expect(formatLength(new Fraction(11.9375), { unit: 'auto' })).toBe('11 15/16');
      expect(formatLength(new Fraction(12), { unit: 'auto' })).toBe("1'");
      expect(formatLength(new Fraction(144), { unit: 'auto' })).toBe("12'");
      expect(formatLength(new Fraction(0), { unit: 'auto' })).toBe('0');
    });

    test('negative values are prefixed with -', () => {
      expect(formatLength(new Fraction(-147.5), { unit: 'ft-in' })).toBe("-12' 3 1/2\"");
      expect(formatLength(new Fraction(-10.5), { unit: 'in' })).toBe('-10 1/2');
      expect(formatLength(new Fraction(-1, 2), { unit: 'auto' })).toBe('-1/2');
    });
  });

  describe('history in reducer', () => {
    test('EQUALS pushes entry with display + raw + timestamp', () => {
      const state = {
        ...baseState(),
        operandA: '10',
        input: '5 1/2',
        pendingOp: 'add',
      };
      const next = reducer(state, { type: ACTIONS.EQUALS });
      expect(next.history).toHaveLength(1);
      const entry = next.history[0];
      expect(entry.a).toBe('10');
      expect(entry.op).toBe('add');
      expect(entry.b).toBe('5 1/2');
      expect(entry.result).toBe('15 1/2');
      expect(new Fraction(entry.aRaw).valueOf()).toBe(10);
      expect(new Fraction(entry.bRaw).valueOf()).toBeCloseTo(5.5);
      expect(new Fraction(entry.resultRaw).valueOf()).toBeCloseTo(15.5);
      expect(typeof entry.timestamp).toBe('number');
    });

    test('history is newest-first and capped at 50', () => {
      let state = baseState();
      for (let i = 1; i <= 60; i++) {
        state = {
          ...state,
          operandA: String(i),
          input: '0',
          pendingOp: 'add',
          phase: 'input',
          chainFrac: null,
        };
        state = reducer(state, { type: ACTIONS.EQUALS });
      }
      expect(state.history).toHaveLength(50);
      // newest first: the most recent calc (i=60) is at index 0
      expect(state.history[0].a).toBe('60');
      // oldest kept is i=11 (60 - 50 + 1)
      expect(state.history[49].a).toBe('11');
    });

    test('failed EQUALS does not push to history', () => {
      const state = {
        ...baseState(),
        operandA: '5',
        input: '0',
        pendingOp: 'divide',
      };
      const next = reducer(state, { type: ACTIONS.EQUALS });
      expect(next.error).toMatch(/Division by zero/);
      expect(next.history).toHaveLength(0);
    });

    test('aRaw survives chained calculations', () => {
      let state = baseState();
      // 10 + 1/2 = 10 1/2
      state = { ...state, operandA: '10', input: '1/2', pendingOp: 'add' };
      state = reducer(state, { type: ACTIONS.EQUALS });
      // Chain: × 2 = 21
      state = { ...state, input: '2', pendingOp: 'multiply', phase: 'input' };
      state = reducer(state, { type: ACTIONS.EQUALS });

      expect(state.history).toHaveLength(2);
      // second entry's a should reflect 10 1/2 (chained from prior chainFrac)
      expect(state.history[0].a).toBe('10 1/2');
      expect(new Fraction(state.history[0].aRaw).valueOf()).toBeCloseTo(10.5);
      expect(state.history[0].result).toBe('21');
    });
  });
});
