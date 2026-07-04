import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
// TEMPORARILY DISABLED — measured-diagonal deviation feature (imports below
// only served the deviation UI; re-enable together with it).
// import Divider from '@mui/material/Divider';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '@mui/material/styles';
import { closestSixteenth, parseLength, formatLength } from '../utils/measure';

// Length fields opt out of the phone keyboard's text mangling: smart
// punctuation is also normalized in parseLength, but suppressing
// autocorrect/capitalization avoids the visible rewrite while typing.
const LENGTH_INPUT_PROPS = { autoCorrect: 'off', autoCapitalize: 'none', spellCheck: false };

// Target diagonal in inches, rounded to the nearest 1/16", as a Fraction.
function diagonalSixteenths(legAInput, legBInput) {
  const a = parseLength(legAInput).valueOf();
  const b = parseLength(legBInput).valueOf();
  // Zero-length legs parse fine but make a degenerate triangle.
  if (!(a > 0) || !(b > 0)) throw new Error('Invalid length');
  return closestSixteenth(Math.sqrt(a * a + b * b));
}

/**
 * Target diagonal for legs A and B, formatted for display
 * (feet + inches once it reaches 12").
 */
export function computeSquareDiagonal(legAInput, legBInput) {
  return formatLength(diagonalSixteenths(legAInput, legBInput), { unit: 'auto' });
}

/**
 * TEMPORARILY DISABLED — the measured-diagonal UI that consumed this is
 * commented out below; the function stays exported so it (and its skipped
 * tests) can be re-enabled without a rewrite.
 *
 * Compare a measured diagonal against the 1/16"-rounded target.
 * The comparison is against the rounded target (not the exact root) so a
 * tape reading that matches the displayed target always reports square.
 *
 * @returns {{status: 'square'|'long'|'short', deviation: string|null}}
 *   deviation is a mixed-inches string like "5/16" (null when square).
 */
export function checkSquare(legAInput, legBInput, measuredInput) {
  const target = diagonalSixteenths(legAInput, legBInput);
  const measured = parseLength(measuredInput);
  const deltaSixteenths = Math.round(16 * measured.sub(target).valueOf());
  if (deltaSixteenths === 0) return { status: 'square', deviation: null };
  return {
    status: deltaSixteenths > 0 ? 'long' : 'short',
    deviation: formatLength(Math.abs(deltaSixteenths) / 16),
  };
}

// Right angle at bottom-left; leg A along the bottom, leg B up the left,
// diagonal C in brand orange. Decorative only — hidden from screen readers.
function TriangleDiagram() {
  const theme = useTheme();
  const leg = theme.palette.text.secondary;
  const diagonal = theme.palette.primary.main;
  return (
    <Box
      component="svg"
      viewBox="0 0 200 116"
      aria-hidden="true"
      sx={{ width: 190, height: 'auto', display: 'block', mx: 'auto' }}
    >
      <polyline points="24,14 24,94 182,94" fill="none" stroke={leg} strokeWidth="2" />
      <line x1="24" y1="14" x2="182" y2="94" stroke={diagonal} strokeWidth="2.5" />
      <rect x="24" y="82" width="12" height="12" fill="none" stroke={leg} strokeWidth="1.5" />
      <text x="103" y="111" fill={leg} fontSize="13" textAnchor="middle">A</text>
      <text x="10" y="58" fill={leg} fontSize="13" textAnchor="middle">B</text>
      <text x="112" y="44" fill={diagonal} fontSize="13" fontWeight="600">C</text>
    </Box>
  );
}

// '' when the field is empty or parses to a usable length; error text otherwise.
function fieldError(value) {
  if (!String(value).trim()) return '';
  try {
    return parseLength(value).valueOf() > 0 ? '' : 'Invalid length';
  } catch (err) {
    return err.message;
  }
}

export default function SquareCheck() {
  const [legA, setLegA] = React.useState('');
  const [legB, setLegB] = React.useState('');
  // TEMPORARILY DISABLED — measured-diagonal deviation feature.
  // const [measured, setMeasured] = React.useState('');

  const legAError = fieldError(legA);
  const legBError = fieldError(legB);
  // TEMPORARILY DISABLED — measured-diagonal deviation feature.
  // const measuredError = fieldError(measured);

  const legsReady = legA.trim() && legB.trim() && !legAError && !legBError;

  const target = React.useMemo(() => {
    if (!legsReady) return '';
    try {
      return computeSquareDiagonal(legA, legB);
    } catch {
      return '';
    }
  }, [legsReady, legA, legB]);

  /* TEMPORARILY DISABLED — measured-diagonal deviation feature.
  const check = React.useMemo(() => {
    if (!target || !measured.trim() || measuredError) return null;
    try {
      return checkSquare(legA, legB, measured);
    } catch {
      return null;
    }
  }, [target, legA, legB, measured, measuredError]);
  */

  const handleReset = () => {
    setLegA('');
    setLegB('');
    // TEMPORARILY DISABLED — measured-diagonal deviation feature.
    // setMeasured('');
  };

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
        Square Check
      </Typography>

      <TriangleDiagram />

      {/* ── leg inputs ── */}
      <Stack direction="row" spacing={1.5}>
        <TextField
          id="square-check-leg-a"
          label="Leg A"
          variant="outlined"
          name="legA"
          value={legA}
          onChange={(e) => setLegA(e.target.value)}
          helperText={legAError}
          error={!!legAError}
          fullWidth
          autoComplete="off"
          inputProps={LENGTH_INPUT_PROPS}
        />
        <TextField
          id="square-check-leg-b"
          label="Leg B"
          variant="outlined"
          name="legB"
          value={legB}
          onChange={(e) => setLegB(e.target.value)}
          helperText={legBError}
          error={!!legBError}
          fullWidth
          autoComplete="off"
          inputProps={LENGTH_INPUT_PROPS}
        />
      </Stack>

      {/* ── target readout ── */}
      <Stack spacing={1} alignItems="flex-start">
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Target Diagonal (C):
        </Typography>
        <Typography
          variant="numericLarge"
          sx={{
            color: target ? 'primary.main' : 'text.disabled',
            fontSize: { xs: '2.25rem', sm: '2.75rem' },
            lineHeight: 1,
          }}
        >
          {target || '—'}
        </Typography>
      </Stack>

      {/* TEMPORARILY DISABLED — measured-diagonal deviation feature.
          Re-enable this block (plus the state, memo, imports, and
          checkSquare tests) to restore the square/deviation readout.

      <Divider />

      <TextField
        id="square-check-measured"
        label="Measured Diagonal"
        variant="outlined"
        name="measured"
        value={measured}
        onChange={(e) => setMeasured(e.target.value)}
        helperText={measuredError}
        error={!!measuredError}
        fullWidth
        autoComplete="off"
        inputProps={LENGTH_INPUT_PROPS}
      />

      {check &&
        (check.status === 'square' ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: '2rem' }} />
            <Typography
              variant="numericLarge"
              sx={{ color: 'success.main', fontSize: '1.75rem', lineHeight: 1 }}
            >
              Square
            </Typography>
          </Stack>
        ) : (
          <Typography
            variant="numericLarge"
            sx={{ color: 'error.main', fontSize: '1.75rem', lineHeight: 1 }}
          >
            {`${check.deviation}" too ${check.status}`}
          </Typography>
        ))}
      */}

      <Button
        variant="text"
        color="primary"
        onClick={handleReset}
        size="small"
        sx={{ alignSelf: 'center' }}
      >
        Reset
      </Button>
    </Box>
  );
}
