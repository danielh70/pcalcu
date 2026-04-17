import React from 'react';
import Fraction from 'fraction.js';
import { closestSixteenth, parseLength, formatLength } from '../utils/measure';

/* ═══════════════════════════════════════════════════════════════
   Exported calculation logic — unchanged
   ═══════════════════════════════════════════════════════════════ */

export function closestTapeMeasure(value) {
  return closestSixteenth(value);
}

export { parseLength, formatLength };

export function computeTapeOperation(aFraction, bFraction, op) {
  if (!(aFraction && typeof aFraction.valueOf === 'function'))
    throw new Error('Invalid first operand');

  const b = bFraction && typeof bFraction.valueOf === 'function' ? bFraction : undefined;

  switch (op) {
    case 'add':
      if (!b) throw new Error('Missing second operand');
      return aFraction.add(b);
    case 'subtract':
      if (!b) throw new Error('Missing second operand');
      return aFraction.sub(b);
    case 'multiply':
      if (!b) throw new Error('Missing second operand');
      return aFraction.mul(b);
    case 'divide':
      if (!b) throw new Error('Missing second operand');
      if (b.valueOf() === 0) throw new Error('Division by zero');
      return aFraction.div(b);
    default:
      throw new Error(
        `Unknown operation: ${op}. Valid operations are: add, subtract, multiply, divide`
      );
  }
}

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const OP_SYMBOLS = { divide: '\u00f7', add: '+', subtract: '\u2212', multiply: '\u00d7' };
const OPS = ['divide', 'add', 'subtract', 'multiply'];

/* every useful sixteenth in ascending order (simplified forms) */
const FRAC_GRID = [
  '1/16', '1/8',  '3/16', '1/4',
  '5/16', '3/8',  '7/16', '1/2',
  '9/16', '5/8', '11/16', '3/4',
  '13/16', '7/8', '15/16',
];

const haptic = () => {
  try { navigator.vibrate(10); } catch (e) { /* no-op on desktop */ }
};

/* ═══════════════════════════════════════════════════════════════
   Scoped styles
   ═══════════════════════════════════════════════════════════════ */

const STYLES = `
/* ── history list ── */
.tc-history {
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-height: 120px;
  overflow-y: auto;
  background: #141416;
  border-bottom: 1px solid #2d2d30;
  flex-shrink: 0;
}
.tc-history-row {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: .5em;
  padding: 6px 16px;
  background: transparent;
  border: none;
  color: #aaa;
  font-family: 'Roboto Mono', 'SF Mono', 'Menlo', monospace;
  font-size: .75rem;
  text-align: right;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  width: 100%;
}
.tc-history-row:active { background: #23232a; }
.tc-history-expr { color: #888; }
.tc-history-result { color: #f5f5f5; font-weight: 600; }

/* ── calculator shell ── */
.tc-calc {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: #1c1c1e;
  user-select: none;
  -webkit-user-select: none;
  padding-bottom: env(safe-area-inset-bottom);
}
@media (max-width: 600px) {
  .tc-calc { border-radius: 0; flex: 1; }
}

/* ── display area ── */
.tc-display {
  padding: 16px 16px 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  min-height: 80px;
}
@media (min-width: 601px) {
  .tc-display { padding: 20px 20px 14px; min-height: 90px; }
}

.tc-expr {
  font-size: .875rem;
  color: #888;
  font-family: 'Roboto Mono', 'SF Mono', 'Menlo', monospace;
  min-height: 1.25rem;
  line-height: 1.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: right;
}

.tc-main {
  font-weight: 700;
  color: #f5f5f5;
  font-family: 'Roboto Mono', 'SF Mono', 'Menlo', monospace;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: right;
  min-height: 3rem;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  transition: font-size 100ms ease;
}
.tc-main--error { color: #ff3b30; }

/* ── keypad wrapper (positioned for overlay) ── */
.tc-keypad {
  position: relative;
  padding: 6px;
  background: #2d2d30;
}
@media (max-width: 600px) {
  .tc-keypad { flex: 1; display: flex; flex-direction: column; }
}
@media (min-width: 601px) {
  .tc-keypad { padding: 8px; }
}

/* ── normal keys panel ── */
.tc-keys {
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: opacity 150ms ease;
}
@media (max-width: 600px) {
  .tc-keys { flex: 1; justify-content: space-between; }
}
.tc-keys--hidden {
  opacity: 0;
  pointer-events: none;
}

/* ── fraction selection panel (overlay) ── */
.tc-frac-panel {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 5px;
  padding: 6px;
  background: #2d2d30;
  transition: opacity 150ms ease;
  z-index: 1;
}
.tc-frac-panel--hidden {
  opacity: 0;
  z-index: -1;
}

@media (min-width: 601px) {
  .tc-keys { gap: 6px; }
  .tc-frac-panel { gap: 6px; padding: 8px; }
}

/* ── grid row helpers ── */
.tc-row4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
.tc-row3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.tc-row5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; }
@media (min-width: 601px) {
  .tc-row4 { gap: 6px; }
  .tc-row3 { gap: 6px; }
  .tc-row5 { gap: 6px; }
}

/* ── quick-entry row (foot mark + permanent fractions) ── */
.tc-quick {
  background: #3a4a5c;
  color: #a8c4e0;
  font-size: .95rem;
  font-weight: 600;
  min-height: 50px;
}
.tc-quick:active { background: #2e3e50; }

/* ── button base ── */
.tc-btn {
  border: none;
  outline: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto Mono', 'SF Mono', 'Menlo', monospace;
  border-radius: 8px;
  transition: background 60ms ease;
  padding: 0;
  margin: 0;
}

/* ── number buttons (taller now that fraction rows are gone) ── */
.tc-num {
  background: #505055;
  color: #fff;
  font-size: 1.35rem;
  font-weight: 500;
  min-height: 70px;
}
.tc-num:active { background: #3a3a3e; }

/* ── operator buttons ── */
.tc-op {
  background: #505055;
  color: #f5a623;
  font-size: 1.25rem;
  font-weight: 700;
  min-height: 54px;
}
.tc-op:active { background: #3a3a3e; }
.tc-op[aria-pressed="true"] {
  background: #f5a623;
  color: #fff;
}
.tc-op[aria-pressed="true"]:active {
  background: #d4891a;
}

/* ── action buttons (C / backspace) ── */
.tc-action {
  background: #505055;
  color: #aaa;
  font-size: 1.15rem;
  font-weight: 600;
  min-height: 70px;
}
.tc-action:active { background: #3a3a3e; }
.tc-clear { color: #ff3b30; }

/* ── FRAC mode button (bottom row) ── */
.tc-frac-btn {
  background: #3a4a5c;
  color: #a8c4e0;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .05em;
  min-height: 70px;
}
.tc-frac-btn:active { background: #2e3e50; }

/* ── fraction buttons inside the panel ── */
.tc-frac {
  background: #3a4a5c;
  color: #a8c4e0;
  font-size: .9rem;
  font-weight: 600;
}
.tc-frac:active { background: #2e3e50; }

/* ── close button inside fraction panel ── */
.tc-frac-close {
  background: #505055;
  color: #ff3b30;
  font-size: 1.3rem;
  font-weight: 700;
}
.tc-frac-close:active { background: #3a3a3e; }

/* ── equals button ── */
.tc-eq {
  background: #2a7c8c;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  min-height: 58px;
  width: 100%;
}
.tc-eq:active:not(:disabled) { background: #1e5f6b; }
.tc-eq:disabled { opacity: .35; cursor: default; }
`;

/* ═══════════════════════════════════════════════════════════════
   Reducer — actions, initial state, state machine
   ═══════════════════════════════════════════════════════════════ */

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
});

const QUICK_FRACS = ['1/2', '1/4', '3/4', '1/8'];

const HISTORY_LIMIT = 50;

const initialState = {
  input: '',
  operandA: '',
  pendingOp: null,
  phase: 'input',
  resultText: '',
  chainFrac: null,
  error: null,
  showFracPanel: false,
  history: [],
};

// Reset calc state while preserving UI-only bits (showFracPanel).
const cleared = (state) => ({
  ...state,
  input: '',
  operandA: '',
  pendingOp: null,
  phase: 'input',
  resultText: '',
  chainFrac: null,
  error: null,
});

export function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.DIGIT: {
      if (state.phase === 'result') {
        return { ...cleared(state), input: action.digit };
      }
      if (state.phase === 'operator') {
        return { ...state, error: null, input: action.digit, phase: 'input' };
      }
      const newInput = /\d+\/\d+/.test(state.input) ? action.digit : state.input + action.digit;
      // Editing a RECALL'd input invalidates its chainFrac shortcut.
      const chainFrac = state.operandA === '' ? null : state.chainFrac;
      return { ...state, error: null, input: newInput, chainFrac };
    }

    case ACTIONS.FRAC: {
      if (state.phase === 'result') {
        return { ...cleared(state), input: action.frac };
      }
      if (state.phase === 'operator') {
        return { ...state, error: null, input: action.frac, phase: 'input' };
      }
      const t = state.input.trim();
      let newInput;
      if (!t) newInput = action.frac;
      else if (/^\d+\/\d+$/.test(t)) newInput = action.frac;
      else newInput = t.replace(/\s+\d+\/\d+$/, '') + ' ' + action.frac;
      const chainFrac = state.operandA === '' ? null : state.chainFrac;
      return { ...state, error: null, input: newInput, chainFrac };
    }

    case ACTIONS.OP: {
      if (state.phase === 'result') {
        if (state.error) return cleared(state);
        return {
          ...state,
          error: null,
          operandA: state.resultText,
          pendingOp: action.op,
          input: '',
          phase: 'operator',
        };
      }
      if (state.phase === 'operator') {
        return { ...state, error: null, pendingOp: action.op };
      }
      // phase === 'input'
      if (!state.input) {
        if (state.pendingOp) return { ...state, error: null, pendingOp: action.op };
        return { ...state, error: null };
      }
      if (state.pendingOp) {
        try {
          const a = state.chainFrac || parseLength(state.operandA);
          const b = parseLength(state.input);
          const raw = computeTapeOperation(a, b, state.pendingOp);
          const nearest = closestTapeMeasure(raw);
          return {
            ...state,
            error: null,
            operandA: nearest.toFraction(true),
            chainFrac: nearest,
            pendingOp: action.op,
            input: '',
            phase: 'operator',
          };
        } catch (err) {
          return { ...state, error: err.message, phase: 'result' };
        }
      }
      return {
        ...state,
        error: null,
        operandA: state.input,
        pendingOp: action.op,
        input: '',
        phase: 'operator',
      };
    }

    case ACTIONS.EQUALS: {
      if (state.phase !== 'input' || !state.pendingOp || !state.input) return state;
      let a, b;
      try {
        a = state.chainFrac || parseLength(state.operandA);
      } catch {
        return { ...state, error: 'Invalid length', phase: 'result' };
      }
      try {
        b = parseLength(state.input);
      } catch {
        return { ...state, error: 'Invalid length', phase: 'result' };
      }
      try {
        const raw = computeTapeOperation(a, b, state.pendingOp);
        const nearest = closestTapeMeasure(raw);
        const resultDisplay = nearest.toFraction(true);
        const aDisplay = state.chainFrac ? state.chainFrac.toFraction(true) : state.operandA;
        const entry = {
          a: aDisplay,
          aRaw: a.toFraction(),
          op: state.pendingOp,
          b: state.input,
          bRaw: b.toFraction(),
          result: resultDisplay,
          resultRaw: nearest.toFraction(),
          timestamp: Date.now(),
        };
        return {
          ...state,
          resultText: resultDisplay,
          chainFrac: nearest,
          error: null,
          phase: 'result',
          history: [entry, ...state.history].slice(0, HISTORY_LIMIT),
        };
      } catch (err) {
        return { ...state, error: err.message, chainFrac: null, phase: 'result' };
      }
    }

    case ACTIONS.BACKSPACE: {
      if (state.phase === 'result') return cleared(state);
      if (state.phase === 'operator') return state;
      const prev = state.input;
      if (!prev) return state;
      const chainFrac = state.operandA === '' ? null : state.chainFrac;
      const m = prev.match(/\s+\d+\/\d+$/);
      if (m) return { ...state, input: prev.slice(0, -m[0].length), chainFrac };
      if (/^\d+\/\d+$/.test(prev)) return { ...state, input: '', chainFrac };
      return { ...state, input: prev.slice(0, -1), chainFrac };
    }

    case ACTIONS.CLEAR:
      return cleared(state);

    case ACTIONS.OPEN_FRAC:
      return { ...state, showFracPanel: true };

    case ACTIONS.CLOSE_FRAC:
      return { ...state, showFracPanel: false };

    // RECALL loads a prior result as the current input and pre-seeds
    // chainFrac from the raw Fraction string, so a following operator +
    // equals skips the parseLength round-trip. Editing the input before
    // the operator clears chainFrac (handled in DIGIT/FRAC/BACKSPACE/
    // FOOT_MARK via the operandA === '' guard).
    case ACTIONS.RECALL: {
      let chainFrac = null;
      if (action.raw) {
        try { chainFrac = new Fraction(action.raw); } catch { /* fall through */ }
      }
      return { ...cleared(state), input: action.display, chainFrac };
    }

    // A foot mark can only follow a bare integer, and only once. Trailing
    // space is part of the token so subsequent inputs render cleanly.
    case ACTIONS.FOOT_MARK: {
      if (state.phase !== 'input') return state;
      if (!/^\d+$/.test(state.input)) return state;
      const chainFrac = state.operandA === '' ? null : state.chainFrac;
      return { ...state, error: null, input: state.input + "' ", chainFrac };
    }

    default:
      return state;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Component — thin wrapper over reducer; haptic side-effect lives here
   ═══════════════════════════════════════════════════════════════ */

const UNIT_CYCLE = { in: 'ft-in', 'ft-in': 'decimal', decimal: 'in' };

const formatDecimal = (frac) => {
  const n = frac.valueOf();
  return Number.parseFloat(n.toFixed(4)).toString();
};

export default function TapeCalc() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { input, operandA, pendingOp, phase, resultText, chainFrac, error, showFracPanel, history } = state;
  const [displayUnit, setDisplayUnit] = React.useState('in');

  const run = React.useCallback((action) => { haptic(); dispatch(action); }, []);

  const canCycleUnit = phase === 'result' && !error && chainFrac;
  const cycleUnit = () => {
    if (!canCycleUnit) return;
    haptic();
    setDisplayUnit((u) => UNIT_CYCLE[u] || 'in');
  };

  /* ── keyboard input ── */

  React.useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) return;
      if (e.isComposing) return;
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) {
        return;
      }
      let action = null;
      const k = e.key;
      if (k >= '0' && k <= '9') action = { type: ACTIONS.DIGIT, digit: k };
      else if (k === '+') action = { type: ACTIONS.OP, op: 'add' };
      else if (k === '-') action = { type: ACTIONS.OP, op: 'subtract' };
      else if (k === '*') action = { type: ACTIONS.OP, op: 'multiply' };
      else if (k === '/') action = { type: ACTIONS.OP, op: 'divide' };
      else if (k === 'Enter' || k === '=') action = { type: ACTIONS.EQUALS };
      else if (k === 'Backspace') action = { type: ACTIONS.BACKSPACE };
      else if (k === 'Escape' || k === 'c' || k === 'C') action = { type: ACTIONS.CLEAR };
      if (action) {
        e.preventDefault();
        run(action);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [run]);

  /* ── derived display ── */

  const mainDisplay = (() => {
    if (phase !== 'result') return input || '0';
    if (error) return error;
    if (!chainFrac) return resultText || '0';
    if (displayUnit === 'decimal') return formatDecimal(chainFrac);
    return formatLength(chainFrac, { unit: displayUnit });
  })();

  const expressionTape = (() => {
    if (!pendingOp) return '';
    const sym = OP_SYMBOLS[pendingOp];
    if (phase === 'result') return `${operandA || '0'} ${sym} ${input || '0'} =`;
    return `${operandA || '0'} ${sym}`;
  })();

  const eqDisabled = phase !== 'input' || !pendingOp || !input;
  const mainLen = mainDisplay.length;
  const mainFontSize = mainLen > 14 ? '1.4rem' : mainLen > 10 ? '1.8rem' : mainLen > 7 ? '2.2rem' : '2.5rem';

  return (
    <div className="tc-calc">
      <style>{STYLES}</style>

      {/* ── history ── */}
      {history.length > 0 && (
        <div className="tc-history" data-testid="history-list">
          {history.map((entry, idx) => (
            <button
              key={`${entry.timestamp}-${idx}`}
              className="tc-history-row"
              aria-label={`recall ${entry.result}`}
              onClick={() => run({
                type: ACTIONS.RECALL,
                display: entry.result,
                raw: entry.resultRaw,
              })}
            >
              <span className="tc-history-expr">
                {entry.a} {OP_SYMBOLS[entry.op]} {entry.b}
              </span>
              <span className="tc-history-expr">=</span>
              <span className="tc-history-result">{entry.result}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── display ── */}
      <div className="tc-display">
        <div className="tc-expr" data-testid="expression-tape">
          {expressionTape}
        </div>
        <div
          className={`tc-main${error && phase === 'result' ? ' tc-main--error' : ''}`}
          data-testid="display-value"
          aria-label="result"
          role={canCycleUnit ? 'button' : undefined}
          tabIndex={canCycleUnit ? 0 : undefined}
          onClick={cycleUnit}
          style={{ fontSize: mainFontSize, cursor: canCycleUnit ? 'pointer' : 'default' }}
        >
          {mainDisplay}
        </div>
      </div>

      {/* ── keypad (positioned container for panel overlay) ── */}
      <div className="tc-keypad">

        {/* ── normal keys ── */}
        <div className={`tc-keys${showFracPanel ? ' tc-keys--hidden' : ''}`}>
          {/* operators */}
          <div className="tc-row4">
            {OPS.map((key) => (
              <button
                key={key}
                className="tc-btn tc-op"
                aria-label={key}
                aria-pressed={pendingOp === key}
                onClick={() => run({ type: ACTIONS.OP, op: key })}
              >
                {OP_SYMBOLS[key]}
              </button>
            ))}
          </div>

          {/* number rows */}
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, i) => (
            <div key={i} className="tc-row3">
              {row.map((d) => (
                <button
                  key={d}
                  className="tc-btn tc-num"
                  onClick={() => run({ type: ACTIONS.DIGIT, digit: d })}
                >
                  {d}
                </button>
              ))}
            </div>
          ))}

          {/* quick-entry row: foot mark + permanent fractions */}
          <div className="tc-row5">
            <button
              className="tc-btn tc-quick"
              aria-label="foot mark"
              onClick={() => run({ type: ACTIONS.FOOT_MARK })}
            >
              {"'"}
            </button>
            {QUICK_FRACS.map((f) => (
              <button
                key={f}
                className="tc-btn tc-quick"
                aria-label={`quick ${f}`}
                onClick={() => run({ type: ACTIONS.FRAC, frac: f })}
              >
                {f}
              </button>
            ))}
          </div>

          {/* bottom row: C, 0, FRAC, ⌫ */}
          <div className="tc-row4">
            <button
              className="tc-btn tc-action tc-clear"
              aria-label="clear"
              onClick={() => run({ type: ACTIONS.CLEAR })}
            >
              C
            </button>
            <button
              className="tc-btn tc-num"
              onClick={() => run({ type: ACTIONS.DIGIT, digit: '0' })}
            >
              0
            </button>
            <button
              className="tc-btn tc-frac-btn"
              aria-label="fractions"
              onClick={() => run({ type: ACTIONS.OPEN_FRAC })}
            >
              FRAC
            </button>
            <button
              className="tc-btn tc-action"
              aria-label="backspace"
              onClick={() => run({ type: ACTIONS.BACKSPACE })}
            >
              {'\u232b'}
            </button>
          </div>

          {/* equals */}
          <button
            className="tc-btn tc-eq"
            aria-label="calculate"
            onClick={() => run({ type: ACTIONS.EQUALS })}
            disabled={eqDisabled}
          >
            =
          </button>
        </div>

        {/* ── fraction selection panel (overlay) ── */}
        <div className={`tc-frac-panel${showFracPanel ? '' : ' tc-frac-panel--hidden'}`}>
          {FRAC_GRID.map((f) => (
            <button
              key={f}
              className="tc-btn tc-frac"
              onClick={() => {
                haptic();
                dispatch({ type: ACTIONS.FRAC, frac: f });
                dispatch({ type: ACTIONS.CLOSE_FRAC });
              }}
            >
              {f}
            </button>
          ))}
          <button
            className="tc-btn tc-frac-close"
            aria-label="close fractions"
            onClick={() => run({ type: ACTIONS.CLOSE_FRAC })}
          >
            {'\u2715'}
          </button>
        </div>

      </div>
    </div>
  );
}
