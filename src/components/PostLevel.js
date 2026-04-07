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
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';

import Fraction from 'fraction.js';
import { parseLength, closestSixteenth } from '../utils/measure';

function formatFeetInches(totalInches) {
  const val = new Fraction(totalInches).valueOf();
  const feet = Math.floor(val / 12);
  const remainder = closestSixteenth(val - feet * 12);
  const inchStr = remainder.toFraction(true);
  if (feet === 0) return `${inchStr}"`;
  if (remainder.valueOf() === 0) return `${feet}' 0"`;
  return `${feet}' ${inchStr}"`;
}

export default function PostLevel() {
  const [targetFeet, setTargetFeet] = React.useState(9);
  const [targetInches, setTargetInches] = React.useState(0);
  const [measurements, setMeasurements] = React.useState([
    { label: 'Post 1', inches: '' },
  ]);
  const [results, setResults] = React.useState(null);
  const [photoLoading, setPhotoLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const fileInputRef = React.useRef(null);

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
        return {
          label: p.label,
          reading: closestSixteenth(p.value).toFraction(true),
          extra: closestSixteenth(extra).toFraction(true),
          cutAt: formatFeetInches(cutLength.valueOf()),
        };
      });

      setResults(rows);
      setError('');
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
    setResults(null);
    setError('');
  };

  const allFilled =
    measurements.length > 0 && measurements.every((m) => m.inches.trim() !== '');

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
            placeholder='e.g. 60 1/4'
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
        <TableContainer sx={{ mt: 2 }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Post</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reading</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Extra</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cut At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{row.reading}</TableCell>
                  <TableCell>{row.extra}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.cutAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
