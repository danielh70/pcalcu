export const OP_SYMBOLS = { divide: '\u00f7', add: '+', subtract: '\u2212', multiply: '\u00d7' };
export const OPS = ['divide', 'add', 'subtract', 'multiply'];

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
