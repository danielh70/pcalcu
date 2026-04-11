import React from 'react';
import { closestSixteenth, parseLength } from '../utils/measure';

/* ═══════════════════════════════════════════════════════════════
   Exported calculation logic — unchanged
   ═══════════════════════════════════════════════════════════════ */

export function closestTapeMeasure(value) {
  return closestSixteenth(value);
}

export { parseLength };

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
}
@media (max-width: 600px) {
  .tc-calc { border-radius: 0; }
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
@media (min-width: 601px) {
  .tc-row4 { gap: 6px; }
  .tc-row3 { gap: 6px; }
}

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
   Component — state machine: input → operator → input → result
   ═══════════════════════════════════════════════════════════════ */

export default function TapeCalc() {
  const [input, setInput] = React.useState('');
  const [operandA, setOperandA] = React.useState('');
  const [pendingOp, setPendingOp] = React.useState(null);
  const [phase, setPhase] = React.useState('input');
  const [resultText, setResultText] = React.useState('');
  const [chainFrac, setChainFrac] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [showFracPanel, setShowFracPanel] = React.useState(false);

  /* ── derived display ── */

  const mainDisplay = phase === 'result' ? (error || resultText || '0') : (input || '0');

  const expressionTape = (() => {
    if (!pendingOp) return '';
    const sym = OP_SYMBOLS[pendingOp];
    if (phase === 'result') return `${operandA || '0'} ${sym} ${input || '0'} =`;
    return `${operandA || '0'} ${sym}`;
  })();

  /* ── input helpers ── */

  const appendFraction = (frac) => {
    setInput((prev) => {
      const t = prev.trim();
      if (!t) return frac;
      if (/^\d+\/\d+$/.test(t)) return frac;
      return t.replace(/\s+\d+\/\d+$/, '') + ' ' + frac;
    });
  };

  const removeLast = () => {
    setInput((prev) => {
      if (!prev) return prev;
      const m = prev.match(/\s+\d+\/\d+$/);
      if (m) return prev.slice(0, -m[0].length);
      if (/^\d+\/\d+$/.test(prev)) return '';
      return prev.slice(0, -1);
    });
  };

  const clearAll = () => {
    setInput('');
    setOperandA('');
    setPendingOp(null);
    setPhase('input');
    setResultText('');
    setChainFrac(null);
    setError(null);
  };

  /* ── handlers ── */

  const handleDigit = (digit) => {
    haptic();
    setError(null);
    if (phase === 'result') {
      clearAll();
      setInput(digit);
      return;
    }
    if (phase === 'operator') {
      setInput(digit);
      setPhase('input');
      return;
    }
    setInput((prev) => {
      if (/\d+\/\d+/.test(prev)) return digit;
      return prev + digit;
    });
  };

  const handleFraction = (frac) => {
    haptic();
    setError(null);
    if (phase === 'result') {
      clearAll();
      setInput(frac);
      return;
    }
    if (phase === 'operator') {
      setInput(frac);
      setPhase('input');
      return;
    }
    appendFraction(frac);
  };

  const handleFracSelect = (frac) => {
    handleFraction(frac);
    setShowFracPanel(false);
  };

  const handleBackspace = () => {
    haptic();
    if (phase === 'result') { clearAll(); return; }
    if (phase === 'operator') return;
    removeLast();
  };

  const handleOp = (newOp) => {
    haptic();
    setError(null);

    if (phase === 'result') {
      setOperandA(resultText);
      setPendingOp(newOp);
      setInput('');
      setPhase('operator');
      return;
    }

    if (phase === 'operator') {
      setPendingOp(newOp);
      return;
    }

    /* phase === 'input' */
    if (!input) {
      if (pendingOp) setPendingOp(newOp);
      return;
    }

    if (pendingOp) {
      try {
        const a = chainFrac || parseLength(operandA);
        const b = parseLength(input);
        const raw = computeTapeOperation(a, b, pendingOp);
        const nearest = closestTapeMeasure(raw);
        setOperandA(nearest.toFraction(true));
        setChainFrac(nearest);
      } catch (err) {
        setError(err.message);
        setPhase('result');
        return;
      }
    } else {
      setOperandA(input);
    }

    setPendingOp(newOp);
    setInput('');
    setPhase('operator');
  };

  const handleEquals = () => {
    haptic();
    if (phase !== 'input' || !pendingOp || !input) return;

    let a, b;
    try {
      a = chainFrac || parseLength(operandA);
    } catch {
      setError('Invalid length');
      setPhase('result');
      return;
    }
    try {
      b = parseLength(input);
    } catch {
      setError('Invalid length');
      setPhase('result');
      return;
    }
    try {
      const raw = computeTapeOperation(a, b, pendingOp);
      const nearest = closestTapeMeasure(raw);
      setResultText(nearest.toFraction(true));
      setChainFrac(nearest);
      setError(null);
    } catch (err) {
      setError(err.message);
      setChainFrac(null);
    }
    setPhase('result');
  };

  const handleClear = () => {
    haptic();
    clearAll();
  };

  /* ── render ── */

  const eqDisabled = phase !== 'input' || !pendingOp || !input;
  const mainLen = mainDisplay.length;
  const mainFontSize = mainLen > 14 ? '1.4rem' : mainLen > 10 ? '1.8rem' : mainLen > 7 ? '2.2rem' : '2.5rem';

  return (
    <div className="tc-calc">
      <style>{STYLES}</style>

      {/* ── display ── */}
      <div className="tc-display">
        <div className="tc-expr" data-testid="expression-tape">
          {expressionTape}
        </div>
        <div
          className={`tc-main${error && phase === 'result' ? ' tc-main--error' : ''}`}
          data-testid="display-value"
          aria-label="result"
          style={{ fontSize: mainFontSize }}
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
                onClick={() => handleOp(key)}
              >
                {OP_SYMBOLS[key]}
              </button>
            ))}
          </div>

          {/* number rows */}
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, i) => (
            <div key={i} className="tc-row3">
              {row.map((d) => (
                <button key={d} className="tc-btn tc-num" onClick={() => handleDigit(d)}>
                  {d}
                </button>
              ))}
            </div>
          ))}

          {/* bottom row: C, 0, FRAC, ⌫ */}
          <div className="tc-row4">
            <button className="tc-btn tc-action tc-clear" aria-label="clear" onClick={handleClear}>
              C
            </button>
            <button className="tc-btn tc-num" onClick={() => handleDigit('0')}>
              0
            </button>
            <button
              className="tc-btn tc-frac-btn"
              aria-label="fractions"
              onClick={() => { haptic(); setShowFracPanel(true); }}
            >
              FRAC
            </button>
            <button className="tc-btn tc-action" aria-label="backspace" onClick={handleBackspace}>
              {'\u232b'}
            </button>
          </div>

          {/* equals */}
          <button
            className="tc-btn tc-eq"
            aria-label="calculate"
            onClick={handleEquals}
            disabled={eqDisabled}
          >
            =
          </button>
        </div>

        {/* ── fraction selection panel (overlay) ── */}
        <div className={`tc-frac-panel${showFracPanel ? '' : ' tc-frac-panel--hidden'}`}>
          {FRAC_GRID.map((f) => (
            <button key={f} className="tc-btn tc-frac" onClick={() => handleFracSelect(f)}>
              {f}
            </button>
          ))}
          <button
            className="tc-btn tc-frac-close"
            aria-label="close fractions"
            onClick={() => { haptic(); setShowFracPanel(false); }}
          >
            {'\u2715'}
          </button>
        </div>

      </div>
    </div>
  );
}
