export const OP_SYMBOLS = { divide: '\u00f7', add: '+', subtract: '\u2212', multiply: '\u00d7' };
export const OPS = ['divide', 'add', 'subtract', 'multiply'];

/* Right-edge operator column, top \u2192 bottom. iOS-calculator order puts +
   at the bottom, nearest the resting thumb \u2014 it's the most-used op. */
export const OP_COLUMN = ['divide', 'multiply', 'subtract', 'add'];

/* Digit grid, calculator convention (7-8-9 on top, like every desk and
   phone calculator app \u2014 not phone-dial order). */
export const DIGIT_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
];

/* Labels for the unit chip beside the result readout. */
export const UNIT_LABELS = { in: 'IN', 'ft-in': 'FT-IN', decimal: 'DEC' };

/* every useful sixteenth in ascending order (simplified forms) */
export const FRAC_GRID = [
  '1/16', '1/8',  '3/16', '1/4',
  '5/16', '3/8',  '7/16', '1/2',
  '9/16', '5/8', '11/16', '3/4',
  '13/16', '7/8', '15/16',
];

export const QUICK_FRACS = ['1/2', '1/4', '3/4', '1/8'];

/**
 * Action types dispatched to the TapeCalc reducer. Frozen so callers can
 * rely on referential stability.
 * @type {Readonly<Record<string, string>>}
 */
export const ACTIONS = Object.freeze({
  DIGIT: 'DIGIT',
  FRAC: 'FRAC',
  OP: 'OP',
  EQUALS: 'EQUALS',
  BACKSPACE: 'BACKSPACE',
  CLEAR: 'CLEAR',
  OPEN_FRAC: 'OPEN_FRAC',
  CLOSE_FRAC: 'CLOSE_FRAC',
  RECALL: 'RECALL',
  FOOT_MARK: 'FOOT_MARK',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
});

export const HISTORY_KEY = 'tapecalc.history.v1';
export const HISTORY_LIMIT = 50;

export const UNIT_CYCLE = { in: 'ft-in', 'ft-in': 'decimal', decimal: 'in' };
