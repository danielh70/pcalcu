import React from 'react';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faDivide, faXmark } from '@fortawesome/free-solid-svg-icons';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { closestSixteenth, parseLength } from '../utils/measure';

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

const OPS = [
  { value: 'divide', icon: faDivide },
  { value: 'add', icon: faPlus },
  { value: 'subtract', icon: faMinus },
  { value: 'multiply', icon: faXmark },
];

const FRACTIONS = [
  '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16',
  '1/2', '9/16', '5/8', '11/16', '3/4', '13/16', '7/8', '15/16',
];

const KEYS = [
  '7', '8', '9', 'clear',
  '4', '5', '6', 'backspace',
  '1', '2', '3', '0',
];

const keyBtnBase = {
  minHeight: 48,
  minWidth: 0,
  borderRadius: 2,
  border: 'none',
  boxShadow: 'none',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': { boxShadow: 'none' },
};

const numBtnSx = {
  ...keyBtnBase,
  bgcolor: '#f0f0f0',
  color: 'text.primary',
  fontSize: '1.25rem',
  '&:hover': { bgcolor: '#e4e4e4', boxShadow: 'none' },
  '&:active': { bgcolor: '#d8d8d8' },
};

const actionBtnSx = {
  ...keyBtnBase,
  bgcolor: '#e0e0e0',
  color: 'text.secondary',
  fontSize: '1.1rem',
  '&:hover': { bgcolor: '#d4d4d4', boxShadow: 'none' },
  '&:active': { bgcolor: '#c8c8c8' },
};

export default function TapeCalc() {
  const [length1, setLength1] = React.useState('');
  const [length2, setLength2] = React.useState('');
  const [activeField, setActiveField] = React.useState('length1');
  const [result, setResult] = React.useState(null);
  const [view, setView] = React.useState('divide');

  const setActive = activeField === 'length1' ? setLength1 : setLength2;

  const handleDigit = (digit) => {
    setResult(null);
    setActive((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setResult(null);
    setActive((prev) => {
      if (!prev) return prev;
      const m = prev.match(/\s+\d+\/\d+$/);
      if (m) return prev.slice(0, -m[0].length);
      if (/^\d+\/\d+$/.test(prev)) return '';
      return prev.slice(0, -1);
    });
  };

  const handleClearEntry = () => {
    setResult(null);
    setActive('');
  };

  const handleFraction = (frac) => {
    setResult(null);
    setActive((prev) => {
      const t = prev.trim();
      if (!t) return frac;
      if (/^\d+\/\d+$/.test(t)) return frac;
      return t.replace(/\s+\d+\/\d+$/, '') + ' ' + frac;
    });
  };

  const selectOp = (next) => {
    setView(next);
    setActiveField('length2');
    setResult(null);
  };

  const handleSubmit = () => {
    let a, b;
    try {
      a = parseLength(length1);
    } catch {
      return;
    }
    try {
      b = parseLength(length2);
    } catch {
      return;
    }
    try {
      const raw = computeTapeOperation(a, b, view);
      const nearest = closestTapeMeasure(raw);
      setResult({ raw, nearest });
    } catch (err) {
      setResult({ error: err.message });
    }
  };

  const handleReset = () => {
    setLength1('');
    setLength2('');
    setResult(null);
    setActiveField('length1');
    setView('divide');
  };

  const goDisabled = !length1 || !length2;

  const renderDisplay = (label, value, field) => {
    const isActive = activeField === field;
    return (
      <Box
        onClick={() => setActiveField(field)}
        aria-label={label}
        role='button'
        tabIndex={0}
        sx={{
          width: '100%',
          minHeight: 52,
          px: 2,
          py: 1,
          borderRadius: 2,
          border: '2.5px solid',
          borderColor: isActive ? 'primary.main' : 'grey.300',
          bgcolor: isActive ? 'rgba(25, 118, 210, 0.04)' : '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background-color 0.15s',
          userSelect: 'none',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: isActive ? 'primary.main' : 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {label}
        </Typography>
        <Typography
          data-testid={`${field}-value`}
          sx={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: value ? 'text.primary' : 'grey.300',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value || '0'}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
      }}
    >
      {renderDisplay('Length 1', length1, 'length1')}

      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        {OPS.map((op) => (
          <ToggleButton
            key={op.value}
            value={op.value}
            aria-label={op.value}
            selected={view === op.value}
            onClick={() => selectOp(op.value)}
            size='small'
            sx={{ flex: 1, minHeight: 44, borderRadius: 1.5 }}
          >
            <FontAwesomeIcon icon={op.icon} />
          </ToggleButton>
        ))}
      </Box>

      {renderDisplay('Length 2', length2, 'length2')}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.75,
          width: '100%',
        }}
      >
        {KEYS.map((key) => {
          if (key === 'clear') {
            return (
              <Button
                key={key}
                onClick={handleClearEntry}
                aria-label='clear entry'
                sx={actionBtnSx}
              >
                C
              </Button>
            );
          }
          if (key === 'backspace') {
            return (
              <Button
                key={key}
                onClick={handleBackspace}
                aria-label='backspace'
                sx={actionBtnSx}
              >
                &#x232B;
              </Button>
            );
          }
          return (
            <Button key={key} onClick={() => handleDigit(key)} sx={numBtnSx}>
              {key}
            </Button>
          );
        })}
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          width: '100%',
          overflowX: 'auto',
          pb: 0.5,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {FRACTIONS.map((frac) => (
          <Button
            key={frac}
            onClick={() => handleFraction(frac)}
            sx={{
              minWidth: 'auto',
              minHeight: 36,
              px: 1,
              py: 0.25,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              bgcolor: '#f5f5f5',
              borderRadius: 1.5,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#e8e8e8', boxShadow: 'none' },
            }}
          >
            {frac}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={goDisabled}
          aria-label='calculate'
          sx={{ flex: 3, minHeight: 48, fontSize: '1.5rem', fontWeight: 700 }}
        >
          =
        </Button>
        <Button
          variant='outlined'
          onClick={handleReset}
          aria-label='reset'
          sx={{
            flex: 1,
            minHeight: 48,
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'text.secondary',
            borderColor: 'grey.300',
          }}
        >
          Reset
        </Button>
      </Box>

      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
          py: 1.5,
          borderRadius: 2,
          bgcolor: result && !result.error ? 'rgba(25, 118, 210, 0.06)' : 'transparent',
        }}
      >
        <Typography
          variant='h4'
          aria-label='result'
          sx={{
            fontWeight: 700,
            color: result ? (result.error ? 'error.main' : 'primary.dark') : 'grey.400',
            letterSpacing: 0.5,
          }}
        >
          {result ? (result.error ? result.error : result.nearest.toFraction(true)) : '\u2014'}
        </Typography>
      </Box>
    </Box>
  );
}
