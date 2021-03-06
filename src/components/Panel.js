import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Frame from './Frame';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TopNav from './TopNav';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import '../App.css';

const Fraction = require('fraction.js');

export default function Panel() {
  let [length, setLength] = React.useState('');
  let [totalLength, setTotalLength] = React.useState('');
  let [fraction, setFraction] = React.useState('');
  let [distance, setDistance] = React.useState('');
  let [locs, setLocs] = React.useState({
    decimal: [],
    fraction: [],
    holeCount: 0,
  });

  const initialState = {
    locs: {
      decimal: [],
      fraction: [],
      holeCount: 0,
    },
  };

  React.useEffect(() => {
    if (locs.holeCount === 0) return;
    calculate();
  }, [locs.holeCount]);

  // converts a number to the nearest 1/16th and returns the string value
  let closestTapeMeasure = (frac) => {
    return new Fraction(Math.round(16 * Fraction(frac).valueOf()), 16);
  };

  let calculate = () => {
    let locState = { ...locs };
    let locations = [10];
    let locationsToFraction = ['10'];
    let { holeCount } = locState;
    let nums = fraction.split('/').map((x) => parseInt(x)) || 0;
    let toDecimal = nums[0] / nums[1] || 0;

    for (let i = locState.holeCount > 0 ? locState.holeCount : 0; i < 10; i++) {
      holeCount = i;
      // subtract 20 for fixed end measurements ( 10 inches )
      if ((length - 20 + toDecimal) / i <= 20 || locState.holeCount > 0) {
        // decimal of distance between points
        let baseDistance = (length - 20 + toDecimal) / i;

        // converts hole locations to fractions
        for (let i = 1; i < locState.holeCount; i++) {
          // adds distance to previous measurement
          let num = locations[locations.length - 1] + baseDistance;

          locations.push(num);
          locationsToFraction.push(closestTapeMeasure(num).toFraction(true));
        }

        let totalLength;
        // adds user entered length together into one number
        if (fraction.length) {
          totalLength = Fraction(length).add(fraction).valueOf();
        } else {
          totalLength = Fraction(length).valueOf();
        }

        // just return if really short measurement entered
        if (length < 30) return;

        locationsToFraction.push(Fraction(totalLength - 10).toFraction(true));

        // add the last hole 10 inches from end
        locations.push(totalLength - 10);

        locState.decimal = locations;
        locState.fraction = locationsToFraction;
        locState.holeCount = holeCount;

        // converts decimal distance to a fraction ( nearest 1/16th )
        let finalMeasurement = closestTapeMeasure(baseDistance).toFraction(true);

        setTotalLength(totalLength);
        setDistance(finalMeasurement);
        setLocs(locState);
        break;
      }
    }
  };

  let handleLengthChange = (e) => {
    let state = length.slice();
    let locState = { ...locs };

    locState.holeCount = 0;

    state = e.target.value;
    setLocs(locState);
    setLength(state);
  };

  let handleFractionChange = (e) => {
    let state = fraction.slice();

    state = e.target.value;
    setFraction(state);
  };

  let handleAddHole = () => {
    let locState = { ...locs };

    locState.holeCount = locState.holeCount + 1;
    setLocs(locState);
  };

  let handleRemoveHole = () => {
    let locState = { ...locs };

    locState.holeCount = locState.holeCount - 1;
    setLocs(locState);
  };

  //  shitty way to reset state, maybe fix later
  let handleClear = () => {
    setLength('');
    setTotalLength('');
    setFraction('');
    setDistance('');
    setLocs(initialState.locs);
  };

  return (
    <div>
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction={{ xs: 'column' }}
        alignItems='center'
        justifyContent='center'
      >
        <TextField
          id='outlined-basic'
          className='margin-10'
          label='Length'
          variant='outlined'
          name='length'
          value={length}
          onChange={handleLengthChange}
        />

        <TextField
          className='margin-10'
          id='outlined-basic'
          label='Fraction'
          variant='outlined'
          name='fraction'
          value={fraction}
          onChange={handleFractionChange}
        />
      </Stack>

      <Stack direction='row' justifyContent='center' alignItems='center' spacing={2} m={2}>
        <Button
          onClick={handleAddHole}
          variant='outlined'
          startIcon={<AddIcon />}
          disabled={locs.holeCount >= 10 || locs.holeCount < 1}
        >
          hole
        </Button>

        <Button disabled={length < 30} color='primary' variant='contained' onClick={calculate}>
          Go
        </Button>
        <Button
          onClick={handleRemoveHole}
          variant='outlined'
          startIcon={<RemoveIcon />}
          disabled={locs.holeCount < 2 || length < 30}
        >
          hole
        </Button>
      </Stack>

      <Box m={1}>
        <Button variant='contained' color='error' onClick={handleClear}>
          Reset
        </Button>
      </Box>

      <br />

      <Typography variant='h5'>Distance: {distance}</Typography>
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
