import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Fraction from 'fraction.js';
import { parseLength, closestSixteenth } from '../utils/measure';

const BASE_COLOR = '#2e7d32';
const POST_COLOR = '#424242';
const LINE_COLOR = '#bdbdbd';

export default function PostLevel() {
  const [targetFeet, setTargetFeet] = React.useState(9);
  const [targetInches, setTargetInches] = React.useState(0);
  const [measurements, setMeasurements] = React.useState([
    { label: 'Post 1', inches: '' },
  ]);
  const [results, setResults] = React.useState(null);
  const [grid, setGrid] = React.useState(null);
  const [photoLoading, setPhotoLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const fileInputRef = React.useRef(null);
  const resultsRef = React.useRef(null);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const pinSize = isSmall ? 36 : 48;
  const connW = isSmall ? 16 : 24;
  const connH = isSmall ? 12 : 20;

  const targetHeight = targetFeet * 12 + targetInches;

  const addRow = () => {
    setMeasurements((prev) => [
      ...prev,
      { label: `Post ${prev.length + 1}`, inches: '' },
    ]);
    setResults(null);
  };

  const removeRow = (index) => {
    setMeasurements((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((m, i) => ({ ...m, label: `Post ${i + 1}` }))
    );
    setResults(null);
  };

  const updateReading = (index, value) => {
    setMeasurements((prev) =>
      prev.map((m, i) => (i === index ? { ...m, inches: value } : m))
    );
    setResults(null);
  };

  const calculate = () => {
    try {
      const parsed = measurements.map((m) => ({
        label: m.label,
        value: parseLength(m.inches),
      }));

      const values = parsed.map((p) => p.value.valueOf());
      const minReading = Math.min(...values);
      const target = new Fraction(targetHeight);

      const rows = parsed.map((p) => {
        const extra = p.value.sub(minReading);
        const cutLength = target.add(extra);
        const isBase = extra.valueOf() === 0;
        return {
          label: p.label,
          reading: closestSixteenth(p.value).toFraction(true),
          extra: closestSixteenth(extra).toFraction(true),
          cutAt: closestSixteenth(cutLength).toFraction(true),
          isBase,
        };
      });

      setResults(rows);
      setError('');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } catch (err) {
      setError(err.message);
      setResults(null);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoLoading(true);
    setError('');

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/read-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType: file.type }),
      });

      if (!res.ok) throw new Error('Failed to read photo');

      const data = await res.json();
      if (data.measurements?.length) {
        setMeasurements(data.measurements);
        setGrid(Array.isArray(data.grid) ? data.grid : null);
        setResults(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setMeasurements([{ label: 'Post 1', inches: '' }]);
    setGrid(null);
    setResults(null);
    setError('');
  };

  const allFilled =
    measurements.length > 0 && measurements.every((m) => m.inches.trim() !== '');

  // Source grid: from API or single-row fallback for manual entry
  const sourceGrid = React.useMemo(() => {
    if (!results) return null;
    if (grid) return grid;
    return [results.map((_, i) => i)];
  }, [results, grid]);

  // Build interleaved grid cells for the diagram
  const diagramData = React.useMemo(() => {
    if (!sourceGrid || !results) return null;

    const numRows = sourceGrid.length;
    const numCols = Math.max(...sourceGrid.map((r) => r.length));
    const norm = sourceGrid.map((row) => {
      const padded = [...row];
      while (padded.length < numCols) padded.push(null);
      return padded;
    });

    const hasPost = (r, c) =>
      r >= 0 && r < numRows && c >= 0 && c < numCols && norm[r][c] != null;

    const iRows = 2 * numRows - 1;
    const iCols = 2 * numCols - 1;
    const cells = [];

    for (let ir = 0; ir < iRows; ir++) {
      for (let ic = 0; ic < iCols; ic++) {
        const postRow = ir % 2 === 0;
        const postCol = ic % 2 === 0;

        if (postRow && postCol) {
          const idx = norm[ir / 2][ic / 2];
          cells.push({
            type: 'post',
            idx,
            result: idx != null ? results[idx] : null,
          });
        } else if (postRow && !postCol) {
          cells.push({
            type: 'hline',
            show: hasPost(ir / 2, (ic - 1) / 2) && hasPost(ir / 2, (ic + 1) / 2),
          });
        } else if (!postRow && postCol) {
          cells.push({
            type: 'vline',
            show:
              hasPost((ir - 1) / 2, ic / 2) && hasPost((ir + 1) / 2, ic / 2),
          });
        } else {
          cells.push({ type: 'empty' });
        }
      }
    }

    return { cells, iCols, iRows };
  }, [sourceGrid, results]);

  const cellSx = {
    py: { xs: 0.5, sm: 1 },
    px: { xs: 1, sm: 2 },
    fontSize: { xs: '0.75rem', sm: '0.875rem' },
  };

  const numCellSx = {
    ...cellSx,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 520,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography
        variant='subtitle1'
        sx={{ fontWeight: 500, color: 'text.secondary', mb: 2 }}
      >
        Target Post Height
      </Typography>

      <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 3 }}>
        <TextField
          label='Feet'
          type='number'
          value={targetFeet}
          onChange={(e) => {
            setTargetFeet(Number(e.target.value) || 0);
            setResults(null);
          }}
          sx={{ width: 90 }}
          inputProps={{ min: 0 }}
        />
        <TextField
          label='Inches'
          type='number'
          value={targetInches}
          onChange={(e) => {
            setTargetInches(Number(e.target.value) || 0);
            setResults(null);
          }}
          sx={{ width: 90 }}
          inputProps={{ min: 0, max: 11 }}
        />
      </Stack>

      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <Button
          variant='outlined'
          startIcon={
            photoLoading ? <CircularProgress size={18} /> : <CloudUploadIcon />
          }
          onClick={() => fileInputRef.current?.click()}
          disabled={photoLoading}
        >
          Upload Photo
        </Button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          hidden
          onChange={handlePhotoUpload}
        />
        <Button variant='outlined' startIcon={<AddIcon />} onClick={addRow}>
          Add Post
        </Button>
      </Stack>

      {measurements.map((m, i) => (
        <Stack
          key={i}
          direction='row'
          spacing={1}
          alignItems='center'
          sx={{ mb: 1, width: '100%', maxWidth: 360 }}
        >
          <Typography sx={{ minWidth: 56, fontWeight: 500, fontSize: '0.875rem' }}>
            {m.label}
          </Typography>
          <TextField
            size='small'

            value={m.inches}
            onChange={(e) => updateReading(i, e.target.value)}
            fullWidth
          />
          <IconButton
            size='small'
            onClick={() => removeRow(i)}
            disabled={measurements.length <= 1}
          >
            <RemoveIcon fontSize='small' />
          </IconButton>
        </Stack>
      ))}

      {error && (
        <Typography color='error' sx={{ mt: 1, mb: 1, fontSize: '0.875rem' }}>
          {error}
        </Typography>
      )}

      <Stack direction='row' spacing={2} sx={{ mt: 2, mb: 2 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={calculate}
          disabled={!allFilled}
          sx={{ minWidth: 90 }}
        >
          Go
        </Button>
        <Button
          variant='outlined'
          color='error'
          onClick={handleClear}
          sx={{ minWidth: 90 }}
        >
          Reset
        </Button>
      </Stack>

      {results && (
        <>
          <Divider sx={{ width: '100%', my: 2 }} />

          <Box ref={resultsRef} sx={{ width: '100%', scrollMarginTop: 16 }}>
            <TableContainer
              component={Paper}
              variant='outlined'
              sx={{ borderRadius: 2, overflow: 'hidden' }}
            >
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ ...cellSx, fontWeight: 700 }}>Post</TableCell>
                    <TableCell sx={{ ...numCellSx, fontWeight: 700 }}>
                      Reading
                    </TableCell>
                    <TableCell sx={{ ...numCellSx, fontWeight: 700 }}>
                      Extra
                    </TableCell>
                    <TableCell sx={{ ...numCellSx, fontWeight: 700 }}>
                      Cut At
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row, i) => (
                    <TableRow
                      key={i}
                      sx={{
                        bgcolor: row.isBase
                          ? 'rgba(46, 125, 50, 0.08)'
                          : i % 2 === 1
                            ? 'grey.50'
                            : 'transparent',
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={cellSx}>{row.label}</TableCell>
                      <TableCell sx={numCellSx}>{row.reading}</TableCell>
                      <TableCell
                        sx={{
                          ...numCellSx,
                          ...(row.isBase && {
                            color: 'success.dark',
                            fontWeight: 600,
                          }),
                        }}
                      >
                        {row.isBase ? 'base' : row.extra}
                      </TableCell>
                      <TableCell sx={{ ...numCellSx, fontWeight: 600 }}>
                        {row.cutAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {diagramData && (
            <Box
              sx={{
                mt: 3,
                width: '100%',
                bgcolor: 'grey.50',
                borderRadius: 2,
                p: { xs: 1.5, sm: 2.5 },
                backgroundImage:
                  'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            >
              <Typography
                variant='subtitle2'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                Site Layout
              </Typography>
              <Box
                sx={{
                  overflowX: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  pb: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'inline-grid',
                    gridTemplateColumns: Array.from(
                      { length: diagramData.iCols },
                      (_, i) => (i % 2 === 0 ? `${pinSize}px` : `${connW}px`)
                    ).join(' '),
                    gridTemplateRows: Array.from(
                      { length: diagramData.iRows },
                      (_, i) => (i % 2 === 0 ? 'auto' : `${connH}px`)
                    ).join(' '),
                    alignItems: 'stretch',
                  }}
                >
                  {diagramData.cells.map((cell, i) => {
                    if (cell.type === 'post' && cell.result) {
                      const isBase = cell.result.isBase;
                      const accent = isBase ? BASE_COLOR : POST_COLOR;
                      return (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            pb: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: pinSize,
                              height: pinSize,
                              borderRadius: '50%',
                              border: '2.5px solid',
                              borderColor: accent,
                              bgcolor: isBase ? 'rgba(46,125,50,0.1)' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: pinSize > 40 ? '0.85rem' : '0.7rem',
                                color: accent,
                                lineHeight: 1,
                              }}
                            >
                              {cell.idx + 1}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: pinSize > 40 ? '0.65rem' : '0.55rem',
                              color: 'text.primary',
                              mt: 0.25,
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cell.result.cutAt}
                          </Typography>
                        </Box>
                      );
                    }

                    if (cell.type === 'hline' && cell.show) {
                      return (
                        <Box key={i} sx={{ position: 'relative' }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: pinSize / 2 - 1,
                              left: 0,
                              right: 0,
                              height: 2,
                              bgcolor: LINE_COLOR,
                            }}
                          />
                        </Box>
                      );
                    }

                    if (cell.type === 'vline' && cell.show) {
                      return (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            height: '100%',
                          }}
                        >
                          <Box
                            sx={{
                              width: 2,
                              height: '100%',
                              bgcolor: LINE_COLOR,
                            }}
                          />
                        </Box>
                      );
                    }

                    // Empty post slot, empty connector, or intersection
                    return <Box key={i} />;
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
