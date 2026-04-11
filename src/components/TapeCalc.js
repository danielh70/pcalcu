import React from 'react';
import Box from '@mui/material/Box';
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
const FRACTIONS = ['1/16', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'];

const haptic = () => {
  try { navigator.vibrate(10); } catch (e) { /* no-op on desktop */ }
};

/* ═══════════════════════════════════════════════════════════════
   Scoped styles
   ═══════════════════════════════════════════════════════════════ */

const STYLES = `
/* ── button reset ── */
.tc-btn {
  border: none;
  outline: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto Mono', 'SF Mono', 'Menlo', monospace;
  transition: transform 80ms ease, box-shadow 80ms ease, background 80ms ease;
  border-radius: 8px;
}
.tc-btn:active:not(:disabled) {
  transform: translateY(1px);
}

/* ── number keys ── */
.tc-num {
  background: linear-gradient(180deg, #555 0%, #4a4a4a 100%);
  color: #fff;
  font-size: 1.4rem;
  font-weight: 500;
  box-shadow: 0 2px 0 #333, 0 1px 3px rgba(0,0,0,.12);
}
.tc-num:active {
  background: #3a3a3a;
  box-shadow: 0 1px 0 #333;
}

/* ── action keys (C / backspace) ── */
.tc-action {
  background: linear-gradient(180deg, #4a4a4a 0%, #3e3e3e 100%);
  color: #aaa;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 2px 0 #2a2a2a, 0 1px 3px rgba(0,0,0,.12);
}
.tc-action:active {
  background: #333;
  box-shadow: 0 1px 0 #2a2a2a;
}
.tc-action-c { color: #e57373; }

/* ── operator keys ── */
.tc-op {
  background: linear-gradient(180deg, #555 0%, #4a4a4a 100%);
  color: #e8a33e;
  font-size: 1.2rem;
  font-weight: 700;
  box-shadow: 0 2px 0 #333, 0 1px 3px rgba(0,0,0,.12);
}
.tc-op:active {
  background: #3a3a3a;
  box-shadow: 0 1px 0 #333;
}
.tc-op[aria-pressed="true"] {
  background: #e8941a;
  color: #fff;
  box-shadow: 0 2px 0 #b8741a, 0 0 8px rgba(232,148,26,.25);
}
.tc-op[aria-pressed="true"]:active {
  background: #d68418;
  box-shadow: 0 1px 0 #b8741a;
}

/* ── fraction keys ── */
.tc-frac {
  background: #3a4550;
  color: #8bb4d6;
  font-weight: 600;
  font-size: .85rem;
  box-shadow: 0 1px 0 #2a3540;
}
.tc-frac:active {
  background: #2e3a44;
  box-shadow: none;
}
/* ── equals key ── */
.tc-eq {
  background: linear-gradient(180deg, #2eaadc 0%, #2196d3 100%);
  color: #fff;
  font-size: 1.6rem;
  font-weight: 700;
  box-shadow: 0 2px 0 #1a78aa, 0 1px 4px rgba(0,0,0,.15);
}
.tc-eq:active:not(:disabled) {
  background: #1a88bb;
  box-shadow: 0 1px 0 #1a78aa;
}
.tc-eq:disabled {
  opacity: .35;
  cursor: default;
}
`;

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function TapeCalc() {
  const [length1, setLength1] = React.useState('');
  const [length2, setLength2] = React.useState('');
  const [op, setOp] = React.useState(null);
  const [phase, setPhase] = React.useState('length1');
  const [resultDisplay, setResultDisplay] = React.useState('');
  const [chainFrac, setChainFrac] = React.useState(null);
  const [error, setError] = React.useState(null);

  /* ── derived display values ── */

  const mainDisplay = (() => {
    if (phase === 'result') return error || resultDisplay || '0';
    if (phase === 'length2') return length2 || '0';
    return length1 || '0';
  })();

  const expressionTape = (() => {
    if (!op) return '';
    const sym = OP_SYMBOLS[op];
    if (phase === 'length2') return `${length1 || '0'} ${sym}`;
    if (phase === 'result') return `${length1 || '0'} ${sym} ${length2 || '0'} =`;
    return '';
  })();

  /* ── input helpers ── */

  const smartAppendFraction = (setter, frac) => {
    setter((prev) => {
      const t = prev.trim();
      if (!t) return frac;
      if (/^\d+\/\d+$/.test(t)) return frac;
      return t.replace(/\s+\d+\/\d+$/, '') + ' ' + frac;
    });
  };

  const smartBackspace = (setter) => {
    setter((prev) => {
      if (!prev) return prev;
      const m = prev.match(/\s+\d+\/\d+$/);
      if (m) return prev.slice(0, -m[0].length);
      if (/^\d+\/\d+$/.test(prev)) return '';
      return prev.slice(0, -1);
    });
  };

  /* ── handlers ── */

  const handleDigit = (digit) => {
    haptic();
    setError(null);
    if (phase === 'result') {
      setLength1(digit);
      setLength2('');
      setOp(null);
      setChainFrac(null);
      setResultDisplay('');
      setPhase('length1');
      return;
    }
    const setter = phase === 'length1' ? setLength1 : setLength2;
    setter((prev) => {
      if (/\d+\/\d+/.test(prev)) return digit;
      return prev + digit;
    });
  };

  const handleFraction = (frac) => {
    haptic();
    setError(null);
    if (phase === 'result') {
      setLength1(frac);
      setLength2('');
      setOp(null);
      setChainFrac(null);
      setResultDisplay('');
      setPhase('length1');
      return;
    }
    smartAppendFraction(phase === 'length1' ? setLength1 : setLength2, frac);
  };

  const handleBackspace = () => {
    haptic();
    if (phase === 'result') return;
    smartBackspace(phase === 'length1' ? setLength1 : setLength2);
  };

  const handleOp = (newOp) => {
    haptic();
    setError(null);
    if (phase === 'result') {
      setLength1(resultDisplay);
      setLength2('');
      setOp(newOp);
      setPhase('length2');
      return;
    }
    if (phase === 'length1' && !length1) return;
    setOp(newOp);
    if (phase === 'length1') setPhase('length2');
  };

  const handleEquals = () => {
    haptic();
    if (phase !== 'length2' || !length2) return;

    let a, b;
    try {
      a = chainFrac || parseLength(length1);
    } catch {
      setError('Invalid length');
      setPhase('result');
      return;
    }
    try {
      b = parseLength(length2);
    } catch {
      setError('Invalid length');
      setPhase('result');
      return;
    }
    try {
      const raw = computeTapeOperation(a, b, op);
      const nearest = closestTapeMeasure(raw);
      setResultDisplay(nearest.toFraction(true));
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
    setLength1('');
    setLength2('');
    setOp(null);
    setPhase('length1');
    setResultDisplay('');
    setChainFrac(null);
    setError(null);
  };

  /* ── render ── */

  const eqDisabled = phase !== 'length2' || !length2;
  const mainFontSize = mainDisplay.length > 12 ? 24 : mainDisplay.length > 8 ? 30 : 38;

  return (
    <Box
      sx={{
        mx: { xs: '-12px', sm: '-16px' },
        mt: { xs: '-22px', sm: '-32px' },
        mb: { xs: '-26px', sm: '-36px' },
        width: 'auto',
        borderRadius: '14px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 'calc(100vh - 200px)', sm: 'auto' },
        background: '#1c1c1e',
      }}
    >
      <style>{STYLES}</style>

      {/* ── display area ── */}
      <div
        style={{
          background: '#1a1a1c',
          padding: '20px 20px 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          minHeight: 90,
          borderBottom: '1px solid #333',
        }}
      >
        <div
          data-testid='expression-tape'
          style={{
            fontSize: 14,
            color: '#777',
            fontFamily: "'Roboto Mono', 'SF Mono', monospace",
            minHeight: 20,
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'right',
          }}
        >
          {expressionTape}
        </div>
        <div
          data-testid='display-value'
          aria-label='result'
          style={{
            fontSize: mainFontSize,
            fontWeight: 700,
            color: error ? '#e53935' : '#f0f0f0',
            fontFamily: "'Roboto Mono', 'SF Mono', monospace",
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            textAlign: 'right',
            transition: 'font-size 120ms ease',
            minHeight: 46,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          {mainDisplay}
        </div>
      </div>

      {/* ── keypad area ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: 6,
          background: '#2c2c2e',
        }}
      >
        {/* fraction grid — 4x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
          {FRACTIONS.map((frac) => (
            <button
              key={frac}
              className='tc-btn tc-frac'
              onClick={() => handleFraction(frac)}
              style={{ height: 38, borderRadius: 6 }}
            >
              {frac}
            </button>
          ))}
        </div>

        {/* operator row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {OPS.map((key) => (
            <button
              key={key}
              className='tc-btn tc-op'
              aria-label={key}
              aria-pressed={op === key}
              onClick={() => handleOp(key)}
              style={{ height: 46, borderRadius: 8 }}
            >
              {OP_SYMBOLS[key]}
            </button>
          ))}
        </div>

        {/* number pad — fills remaining vertical space */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: 4,
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              className='tc-btn tc-num'
              onClick={() => handleDigit(d)}
              style={{ minHeight: 52, borderRadius: 10 }}
            >
              {d}
            </button>
          ))}
          <button
            className='tc-btn tc-action tc-action-c'
            aria-label='clear'
            onClick={handleClear}
            style={{ minHeight: 52, borderRadius: 10 }}
          >
            C
          </button>
          <button
            className='tc-btn tc-num'
            onClick={() => handleDigit('0')}
            style={{ minHeight: 52, borderRadius: 10 }}
          >
            0
          </button>
          <button
            className='tc-btn tc-action'
            aria-label='backspace'
            onClick={handleBackspace}
            style={{ minHeight: 52, borderRadius: 10, fontSize: '1.2rem' }}
          >
            {'\u232b'}
          </button>
        </div>

        {/* equals */}
        <button
          className='tc-btn tc-eq'
          aria-label='calculate'
          onClick={handleEquals}
          disabled={eqDisabled}
          style={{ minHeight: 52, borderRadius: 10, width: '100%' }}
        >
          =
        </button>
      </div>
    </Box>
  );
}
