import React from 'react';
import Fraction from 'fraction.js';
import { closestSixteenth, parseLength, formatLength } from '../utils/measure';
import {
  OP_SYMBOLS,
  OPS,
  FRAC_GRID,
  QUICK_FRACS,
  ACTIONS,
  HISTORY_KEY,
  HISTORY_LIMIT,
  UNIT_CYCLE,
} from './TapeCalc.constants';
import './TapeCalc.css';

export { ACTIONS };

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

const haptic = () => {
  try { navigator.vibrate(10); } catch (e) { /* no-op on desktop */ }
};

/* ═══════════════════════════════════════════════════════════════
   Reducer — actions, initial state, state machine
   ═══════════════════════════════════════════════════════════════ */

const loadHistory = () => {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
};

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

    case ACTIONS.CLEAR_HISTORY:
      return { ...state, history: [] };

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

const formatDecimal = (frac) => {
  const n = frac.valueOf();
  return Number.parseFloat(n.toFixed(4)).toString();
};

export default function TapeCalc() {
  const [state, dispatch] = React.useReducer(reducer, initialState, (s) => ({
    ...s,
    history: loadHistory(),
  }));
  const { input, operandA, pendingOp, phase, resultText, chainFrac, error, showFracPanel, history } = state;
  const [displayUnit, setDisplayUnit] = React.useState('in');
  const [confirmClear, setConfirmClear] = React.useState(false);
  const confirmTimerRef = React.useRef(null);

  const run = React.useCallback((action) => { haptic(); dispatch(action); }, []);

  // Persist history to localStorage on every change.
  React.useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      }
    } catch { /* quota or privacy mode — silent */ }
  }, [history]);

  React.useEffect(() => () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  }, []);

  const handleClearHistory = () => {
    haptic();
    if (confirmClear) {
      dispatch({ type: ACTIONS.CLEAR_HISTORY });
      setConfirmClear(false);
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
      return;
    }
    setConfirmClear(true);
    confirmTimerRef.current = setTimeout(() => {
      setConfirmClear(false);
      confirmTimerRef.current = null;
    }, 3000);
  };

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
  const mainScale = mainLen > 14 ? 0.56 : mainLen > 10 ? 0.72 : mainLen > 7 ? 0.88 : 1;

  return (
    <div className="tc-calc">
      {/* ── history ── */}
      {history.length > 0 && (
        <div className="tc-history-wrap">
          <div className="tc-history-header">
            <button
              className={`tc-history-clear${confirmClear ? ' tc-history-clear--confirm' : ''}`}
              aria-label={confirmClear ? 'confirm clear history' : 'clear history'}
              onClick={handleClearHistory}
            >
              {confirmClear ? 'Clear history?' : 'Clear'}
            </button>
          </div>
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
          style={{
            transform: `scale(${mainScale})`,
            cursor: canCycleUnit ? 'pointer' : 'default',
          }}
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
