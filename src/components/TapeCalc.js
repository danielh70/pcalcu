import React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faDivide, faXmark } from '@fortawesome/free-solid-svg-icons';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  { value: 'divide', label: 'Divide', icon: faDivide, tooltip: 'Divide (a ÷ b)' },
  { value: 'add', label: 'Add', icon: faPlus, tooltip: 'Add (a + b)' },
  { value: 'subtract', label: 'Subtract', icon: faMinus, tooltip: 'Subtract (a - b)' },
  { value: 'multiply', label: 'Multiply', icon: faXmark, tooltip: 'Multiply (a × b)' },
];

/**
 * TapeCalc is a React functional component that provides a tape measure calculator UI.
 *
 * Features:
 * - Accepts two length inputs (supports fractional values, e.g., "10 1/2").
 * - Allows users to select an operation (e.g., add, subtract, divide, multiply) between the two lengths.
 * - Validates input and displays errors for invalid lengths.
 * - Computes the result and displays the nearest tape measure value.
 * - Responsive design for small and large screens.
 * - Includes "Go" and "Reset" buttons to perform calculation or clear inputs.
 *
 * State:
 * - length1: string - First length input.
 * - length2: string - Second length input.
 * - result: object|null - Calculation result or error.
 * - view: string - Selected operation.
 * - error1: string - Error message for length1.
 * - error2: string - Error message for length2.
 *
 * Dependencies:
 * - React
 * - Material-UI components (Box, TextField, Button, Typography, useTheme, useMediaQuery)
 * - FontAwesomeIcon for operation icons
 * - Utility functions: parseLength, computeTapeOperation, closestTapeMeasure
 * - OPS: Array of operation definitions (icon, label, value, tooltip)
 *
 * @component
 * @returns {JSX.Element} The rendered tape measure calculator component.
 */
export default function TapeCalc() {
  const [length1, setLength1] = React.useState('');
  const [length2, setLength2] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [view, setView] = React.useState('divide'); // default to 'divide'
  const [error1, setError1] = React.useState('');
  const [error2, setError2] = React.useState('');

  const selectOp = (next) => {
    setView(next);
    setResult(null);
  };

  const validate = (name, value) => {
    try {
      parseLength(value);
      if (name === 'length1') setError1('');
      else setError2('');
      return true;
    } catch (err) {
      if (name === 'length1') setError1(err.message);
      else setError2(err.message);
      return false;
    }
  };

  const handleLengthChange = (e) => {
    const { name, value } = e.target;
    if (name === 'length1') {
      setLength1(value);
      validate('length1', value);
    } else if (name === 'length2') {
      setLength2(value);
      validate('length2', value);
    }
    setResult(null);
  };

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const operatorButtonSx = {
    minWidth: { xs: 48, sm: 110 },
    minHeight: { xs: 36, sm: 40 },
    px: { xs: 1, sm: 1.25 },
    // use inset border to keep seams crisp
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    backgroundColor: 'background.paper',
    boxSizing: 'border-box',
    fontWeight: 600,
    textTransform: 'none',
    gap: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
    '&:hover': { boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' },
    '& svg': { fontSize: { xs: 14, sm: 18 }, color: 'inherit' },
    // subtle rounding to match theme
    borderRadius: 6,
    paddingLeft: 12,
    paddingRight: 12,
  };

  const handleSubmit = () => {
    let a, b;
    try {
      a = parseLength(length1);
    } catch (err) {
      setError1(err.message);
      return;
    }

    try {
      b = parseLength(length2);
    } catch (err) {
      setError2(err.message);
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

  const goDisabled = !length1 || !length2 || !!error1 || !!error2;

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 2, sm: 3 },
          width: '100%',
          maxWidth: 520,
          mx: 'auto',
          mb: 2,
        }}
      >
        <TextField
          id='length-1'
          label='Length 1'
          variant='outlined'
          name='length1'
          value={length1}
          onChange={handleLengthChange}
          helperText={error1 || 'e.g., 10, 10 1/2, 1/2'}
          error={!!error1}
          fullWidth
          sx={{ width: '100%', maxWidth: 360, minWidth: 0 }}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
          }}
        >
          {isSmall ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {OPS.map((op) => (
                <ToggleButton
                  key={op.value}
                  value={op.value}
                  aria-label={op.value}
                  size='small'
                  sx={{ ...operatorButtonSx, width: 220 }}
                  selected={view === op.value}
                  onClick={() => selectOp(op.value)}
                >
                  <Tooltip title={op.tooltip} arrow>
                    <span>
                      <FontAwesomeIcon icon={op.icon} />
                    </span>
                  </Tooltip>
                </ToggleButton>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {OPS.map((op) => (
                <ToggleButton
                  key={op.value}
                  value={op.value}
                  aria-label={op.value}
                  size='large'
                  sx={operatorButtonSx}
                  selected={view === op.value}
                  onClick={() => selectOp(op.value)}
                >
                  <Tooltip title={op.tooltip} arrow>
                    <span>
                      <FontAwesomeIcon icon={op.icon} />
                      <span style={{ marginLeft: 8, fontWeight: 600 }}>{op.label}</span>
                    </span>
                  </Tooltip>
                </ToggleButton>
              ))}
            </Box>
          )}
        </Box>

        <TextField
          id='length-2'
          label='Length 2'
          variant='outlined'
          name='length2'
          value={length2}
          onChange={handleLengthChange}
          helperText={error2 || 'e.g., 10, 10 1/2, 1/2'}
          error={!!error2}
          fullWidth
          sx={{ width: '100%', maxWidth: 360, minWidth: 0 }}
        />
      </Box>

      <Box style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: 16 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleSubmit}
          disabled={!!goDisabled}
          sx={{ minWidth: 90 }}
        >
          Go
        </Button>
        <Button
          variant='outlined'
          color='secondary'
          onClick={() => {
            setLength1('');
            setLength2('');
            setResult(null);
            setError1('');
            setError2('');
          }}
          sx={{ minWidth: 90 }}
        >
          Reset
        </Button>
      </Box>

      <Typography
        variant='h5'
        sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.5, mb: 2 }}
        aria-label='result'
      >
        {result ? (
          result.error ? (
            <span>{result.error}</span>
          ) : (
            <span>{result.nearest.toFraction(true)}</span>
          )
        ) : (
          '—'
        )}
      </Typography>
    </div>
  );
}
