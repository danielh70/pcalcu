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
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Fraction from 'fraction.js';
import { parseLength, closestSixteenth } from '../utils/measure';

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

  // Diagram colour tokens — resolved from theme so they track the brand palette
  const BASE_COLOR = theme.palette.primary.main;       // orange on the base/reference post
  const POST_COLOR = theme.palette.text.secondary;     // muted grey for non-base posts
  const LINE_COLOR = theme.palette.divider;            // hairline white@8% for connectors

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
    py: { xs: 0.75, sm: 1 },
    px: { xs: 1, sm: 2 },
    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
    borderBottomColor: 'divider',
  };

  const numCellSx = {
    ...cellSx,
    textAlign: 'right',
    fontFamily: theme.typography.fontFamilyMonospace,
    fontVariantNumeric: 'tabular-nums',
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 540,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* ── section heading ── */}
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        Post Level
      </Typography>

      {/* ── target height ── */}
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Target post height
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <TextField
            label="Feet"
            type="number"
            value={targetFeet}
            onChange={(e) => {
              setTargetFeet(Number(e.target.value) || 0);
              setResults(null);
            }}
            sx={{ width: 110 }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Inches"
            type="number"
            value={targetInches}
            onChange={(e) => {
              setTargetInches(Number(e.target.value) || 0);
              setResults(null);
            }}
            sx={{ width: 110 }}
            inputProps={{ min: 0, max: 11 }}
          />
        </Stack>
      </Stack>

      {/* ── source actions ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={
            photoLoading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />
          }
          onClick={() => fileInputRef.current?.click()}
          disabled={photoLoading}
          fullWidth
        >
          Upload Photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePhotoUpload}
        />
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={addRow}
          fullWidth
        >
          Add Post
        </Button>
      </Stack>

      {/* ── post readings ── */}
      <Stack spacing={1.25}>
        {measurements.map((m, i) => (
          <Stack
            key={i}
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <Typography
              variant="body2"
              sx={{
                minWidth: 64,
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.75rem',
              }}
            >
              {m.label}
            </Typography>
            <TextField
              size="small"
              value={m.inches}
              onChange={(e) => updateReading(i, e.target.value)}
              placeholder='0'
              fullWidth
            />
            <IconButton
              size="small"
              onClick={() => removeRow(i)}
              disabled={measurements.length <= 1}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'error.main', backgroundColor: alpha(theme.palette.error.main, 0.08) },
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      {error && (
        <Typography
          variant="body2"
          sx={{ color: 'error.main', fontWeight: 500 }}
        >
          {error}
        </Typography>
      )}

      {/* ── primary action ── */}
      <Stack spacing={1.25}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={calculate}
          disabled={!allFilled}
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

      {results && (
        <>
          <Divider />

          {/* ── results table ── */}
          <Box ref={resultsRef} sx={{ width: '100%', scrollMarginTop: 16 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Cut List
            </Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2, overflow: 'hidden' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'secondary.main' }}>
                    <TableCell sx={{ ...cellSx, fontWeight: 700, color: 'text.primary' }}>Post</TableCell>
                    <TableCell sx={{ ...numCellSx, fontWeight: 700, color: 'text.primary' }}>Reading</TableCell>
                    <TableCell sx={{ ...numCellSx, fontWeight: 700, color: 'text.primary' }}>Extra</TableCell>
                    <TableCell sx={{ ...numCellSx, fontWeight: 700, color: 'text.primary' }}>Cut At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row, i) => (
                    <TableRow
                      key={i}
                      sx={{
                        bgcolor: row.isBase
                          ? alpha(theme.palette.primary.main, 0.10)
                          : i % 2 === 1
                            ? alpha('#FFFFFF', 0.025)
                            : 'transparent',
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{row.label}</TableCell>
                      <TableCell sx={numCellSx}>{row.reading}</TableCell>
                      <TableCell
                        sx={{
                          ...numCellSx,
                          ...(row.isBase && {
                            color: 'primary.main',
                            fontWeight: 700,
                          }),
                        }}
                      >
                        {row.isBase ? 'base' : row.extra}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...numCellSx,
                          fontWeight: 700,
                          color: 'primary.main',
                        }}
                      >
                        {row.cutAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* ── site layout diagram ── */}
          {diagramData && (
            <Box
              sx={{
                width: '100%',
                bgcolor: 'background.default',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: { xs: 1.5, sm: 2.5 },
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  mb: 2,
                  color: 'text.secondary',
                  textAlign: 'center',
                  display: 'block',
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
                              bgcolor: isBase
                                ? alpha(theme.palette.primary.main, 0.15)
                                : 'background.paper',
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
                                fontFamily: theme.typography.fontFamilyMonospace,
                              }}
                            >
                              {cell.idx + 1}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: pinSize > 40 ? '0.65rem' : '0.55rem',
                              color: 'text.primary',
                              mt: 0.25,
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                              fontFamily: theme.typography.fontFamilyMonospace,
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
