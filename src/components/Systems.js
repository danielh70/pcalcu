import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
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
  if (addGap > 3.59) {
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

  const isGoDisabled = React.useMemo(() => {
    try {
      const v = parseLength(length).valueOf();
      return !Number.isFinite(v) || v < 5;
    } catch {
      return true;
    }
  }, [length]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* ── section heading ── */}
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        Spindle Spacing
      </Typography>

      {/* ── input ── */}
      <TextField
        id="spindle-length-input"
        label="Length"
        variant="outlined"
        name="length"
        value={length}
        onChange={handleLengthChange}
        helperText={error}
        error={!!error}
        fullWidth
        autoComplete="off"
      />

      {/* ── primary action ── */}
      <Stack spacing={1.25}>
        <Button
          disabled={isGoDisabled}
          color="primary"
          variant="contained"
          size="large"
          onClick={calculate}
          fullWidth
        >
          Go
        </Button>
        <Button
          variant="text"
          color="primary"
          onClick={handleClear}
          size="small"
          sx={{ alignSelf: 'center' }}
        >
          Reset
        </Button>
      </Stack>

      <Divider />

      {/* ── result readout ── */}
      <Stack spacing={1} alignItems="flex-start">
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Gap:
        </Typography>
        <Typography
          variant="numericLarge"
          sx={{
            color: result ? 'primary.main' : 'text.disabled',
            fontSize: { xs: '2.25rem', sm: '2.75rem' },
            lineHeight: 1,
          }}
        >
          {result || '—'}
        </Typography>
      </Stack>
    </Box>
  );
}
