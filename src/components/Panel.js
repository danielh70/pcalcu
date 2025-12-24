import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Frame from './Frame';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import Fraction from 'fraction.js';
import { parseLength, closestSixteenth } from '../utils/measure';

// Converts a number to the nearest 1/16th and returns a Fraction
export function closestTapeMeasure(value) {
  return closestSixteenth(value);
}

const pickAutoHoleCount = (usableLength, opts = {}) => {
  const minSpacing = Number.isFinite(opts.minSpacing) ? opts.minSpacing : 15;
  const maxSpacing = Number.isFinite(opts.maxSpacing) ? opts.maxSpacing : 20;
  const maxHoleCount = Number.isInteger(opts.maxHoleCount) ? opts.maxHoleCount : 10;

  const target = (minSpacing + maxSpacing) / 2;
  const minH = Math.ceil(usableLength / maxSpacing);
  const maxH = Math.floor(usableLength / minSpacing);

  const clampedMin = Math.max(1, minH);
  const clampedMax = Math.min(maxHoleCount, maxH);

  if (clampedMin <= clampedMax) return clampedMin;
  return Math.min(maxHoleCount, Math.max(1, Math.round(usableLength / target)));
};

// Pure, testable function that computes hole locations and other metadata
// Supports either a combined input like "101 7/8" OR a separate fraction input for backwards compatibility.
export function computeLocations(lengthInput, fractionInput = '', holeCountInput = 0) {
  const lengthFrac = parseLength(lengthInput);

  let fracDecimal = 0;
  if (fractionInput !== '' && fractionInput !== null && fractionInput !== undefined) {
    const s = String(fractionInput).trim();
    if (s.length && !/^\d+\/\d+$/.test(s)) throw new Error('Invalid fraction');
    if (s.length) fracDecimal = new Fraction(s).valueOf();
  }

  const totalLength = lengthFrac.add(fracDecimal).valueOf();
  if (!isFinite(totalLength) || totalLength < 30) throw new Error('Invalid length');

  const usable = totalLength - 20; // 10 inches each end
  if (usable <= 0) throw new Error('Invalid length');

  let holeCount = Number(holeCountInput);
  if (!Number.isInteger(holeCount) || holeCount < 1) {
    // Auto-select a sensible starting holeCount so spacing tends to land 15–20" apart.
    holeCount = pickAutoHoleCount(usable, { minSpacing: 15, maxSpacing: 20, maxHoleCount: 10 });
  }

  const baseDistance = usable / holeCount;

  const decimal = [10];
  const fraction = [closestTapeMeasure(10).toFraction(true)];

  for (let i = 1; i < holeCount; i++) {
    const loc = 10 + baseDistance * i;
    decimal.push(loc);
    fraction.push(closestTapeMeasure(loc).toFraction(true));
  }

  decimal.push(totalLength - 10);
  fraction.push(new Fraction(totalLength - 10).toFraction(true));

  return {
    decimal,
    fraction,
    holeCount,
    baseDistance,
    totalLength,
  };
}

export default function Panel() {
  const [length, setLength] = React.useState('');
  const [totalLength, setTotalLength] = React.useState('');
  const [distance, setDistance] = React.useState('');
  const [locs, setLocs] = React.useState({ decimal: [], fraction: [], holeCount: 0 });
  const [error, setError] = React.useState('');

  const lastComputedHoleCountRef = React.useRef(null);

  const initialLocs = { decimal: [], fraction: [], holeCount: 0 };

  const isValidLength = (value) => {
    try {
      const frac = parseLength(value);
      return isFinite(frac.valueOf()) && frac.valueOf() >= 30;
    } catch {
      return false;
    }
  };

  React.useEffect(() => {
    if (locs.holeCount === 0) return;
    if (!isValidLength(length)) return;
    if (lastComputedHoleCountRef.current === locs.holeCount) return;
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locs.holeCount]);

  const calculate = () => {
    try {
      const result = computeLocations(length, '', locs.holeCount);
      lastComputedHoleCountRef.current = result.holeCount;
      setTotalLength(result.totalLength);
      setDistance(closestTapeMeasure(result.baseDistance).toFraction(true));
      setLocs((prev) => ({
        ...prev,
        decimal: result.decimal,
        fraction: result.fraction,
        holeCount: result.holeCount,
      }));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLengthChange = (e) => {
    setLength(e.target.value);
    setLocs(initialLocs);
    lastComputedHoleCountRef.current = null;
    setError('');
  };

  const handleAddHole = () => {
    setLocs((prev) => ({ ...prev, holeCount: Math.min(10, prev.holeCount + 1) }));
  };

  const handleRemoveHole = () => {
    setLocs((prev) => ({ ...prev, holeCount: Math.max(0, prev.holeCount - 1) }));
  };

  const handleClear = () => {
    setLength('');
    setTotalLength('');
    setDistance('');
    setLocs(initialLocs);
    setError('');
  };

  return (
    <div>
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction={{ xs: 'column' }}
        alignItems='center'
        justifyContent='center'
        sx={{ width: '100%', maxWidth: 400, mx: 'auto', mb: 2 }}
      >
        <TextField
          id='outlined-length'
          label='Length'
          variant='outlined'
          name='length'
          value={length}
          onChange={handleLengthChange}
          helperText={error || 'e.g., 101 7/8 (min 30)'}
          error={!!error}
          fullWidth
          sx={{ maxWidth: 320, minWidth: 0, flex: 1 }}
        />
      </Stack>
      <Stack
        direction='row'
        justifyContent='center'
        alignItems='center'
        spacing={2}
        sx={{ width: '100%', mb: 2 }}
      >
        <Button
          onClick={handleAddHole}
          variant='outlined'
          startIcon={<AddIcon />}
          disabled={locs.holeCount >= 10}
          sx={{ minWidth: 90 }}
        >
          hole
        </Button>
        <Button
          disabled={!isValidLength(length)}
          color='primary'
          variant='contained'
          onClick={calculate}
          sx={{ minWidth: 90 }}
        >
          Go
        </Button>
        <Button
          onClick={handleRemoveHole}
          variant='outlined'
          startIcon={<RemoveIcon />}
          disabled={locs.holeCount <= 0}
          sx={{ minWidth: 90 }}
        >
          hole
        </Button>
      </Stack>
      <Box m={1}>
        <Button variant='contained' color='error' onClick={handleClear} sx={{ minWidth: 90 }}>
          Reset
        </Button>
      </Box>
      <br />
      <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.5 }}>
        Distance: {distance || '—'}
      </Typography>
      <br />
      <Frame
        locs={locs}
        length={length}
        distance={distance}
        tapeMeasure={closestTapeMeasure}
        totalLength={totalLength}
      />
    </div>
  );
}
