import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { closestSixteenth, parseLength } from '../utils/measure';

// Backwards-compatible exports (kept for clarity/testing)
export { closestSixteenth };
export const parseLengthInput = parseLength;

export function computeSpindleGap(lengthInput) {
  const lengthFrac = parseLength(lengthInput);

  // calculate leftover length between spindles
  let gap = lengthFrac.mod('4 3/8');
  // add starting measurement and divide by 2 for gap
  let addGap = gap.add('3 19/32').div(2).valueOf();

  // if measurement lands on a spindle, we subtract the length of a spindle instead
  if (addGap > 3.2) {
    addGap = gap.sub('25/32').div(2).valueOf();
  }

  return closestSixteenth(addGap).toFraction(true);
}

export default function Systems() {
  const [length, setLength] = React.useState('');
  const [result, setResult] = React.useState('');
  const [error, setError] = React.useState('');

  const calculate = () => {
    try {
      const gap = computeSpindleGap(length);
      setResult(gap);
      setError('');
    } catch (err) {
      setResult('');
      setError(err.message);
    }
  };

  const handleLengthChange = (e) => {
    const next = e.target.value;
    setLength(next);
    setResult('');
    try {
      parseLength(next);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    setLength('');
    setResult('');
    setError('');
  };

  const isGoDisabled = (() => {
    try {
      const v = parseLength(length).valueOf();
      return !Number.isFinite(v) || v < 5;
    } catch {
      return true;
    }
  })();

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <TextField
        id='outlined-basic'
        label='Length'
        variant='outlined'
        name='length'
        value={length}
        onChange={handleLengthChange}
        helperText={error || 'e.g., 8 3/4'}
        error={!!error}
        fullWidth
        sx={{ maxWidth: 360, minWidth: 0, flex: 1, mb: 2 }}
      />
      <Stack
        direction='row'
        justifyContent='center'
        alignItems='center'
        spacing={2}
        sx={{ width: '100%', mb: 2 }}
      >
        <Button
          disabled={isGoDisabled}
          color='primary'
          variant='contained'
          onClick={calculate}
          sx={{ minWidth: 90 }}
        >
          Go
        </Button>
        <Button variant='outlined' color='error' onClick={handleClear} sx={{ minWidth: 90 }}>
          Reset
        </Button>
      </Stack>
      <Typography variant='subtitle1' sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
        Gap:
      </Typography>
      <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.5 }}>
        {result || '—'}
      </Typography>
    </Box>
  );
}
