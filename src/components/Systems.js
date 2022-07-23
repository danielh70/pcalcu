import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import '../App.css';

const Fraction = require('fraction.js');

export default function SimpleContainer() {
  let [length, setLength] = React.useState('');
  let [result, setResult] = React.useState('');

  let closestTapeMeasure = (frac) => {
    return new Fraction(Math.round(16 * Fraction(frac).valueOf()), 16);
  };

  let calculate = () => {
    let gap = Fraction(length).mod('3 9/16').div('2');
    gap = closestTapeMeasure(gap).toFraction(true);

    setResult(gap);
  };

  let handleLengthChange = (e) => {
    let state = length.slice();

    state = e.target.value;

    setLength(state);
  };

  let handleClear = () => {
    setLength('');
    setResult('');
  };

  return (
    <Container>
      <TextField
        id='outlined-basic'
        className='margin-10'
        label='Length'
        variant='outlined'
        name='length'
        value={length}
        onChange={handleLengthChange}
      />
      <Stack direction='column' justifyContent='center' alignItems='center' spacing={2} m={2}>
        <Button disabled={length < 5} color='primary' variant='contained' onClick={calculate}>
          Go
        </Button>

        <br />
        <Typography variant='h5'> Gap: {result}</Typography>
      </Stack>
      <Box m={1}>
        <Button variant='contained' color='error' onClick={handleClear}>
          Reset
        </Button>
      </Box>
    </Container>
  );
}
