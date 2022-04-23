import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Frame from './components/Frame';
import './App.css';

/**
 * TODO:
 * handle whole number measurement without fractions
 * handle smaller frame sizes
 * update frame display
 * add button to add/remove hole counts
 */

const Fraction = require('fraction.js');

function App() {
  let [length, setLength] = React.useState('');
  let [totalLength, setTotalLength] = React.useState();
  let [fraction, setFraction] = React.useState('0');
  let [distance, setDistance] = React.useState('');
  let [locs, setLocs] = React.useState({
    decimal: [],
    fraction: [],
  });

  // converts a number to the nearest 1/16th and returns the string value
  let closestTapeMeasure = (frac) => {
    return new Fraction(Math.round(16 * Fraction(frac).valueOf()), 16);
  };

  let calculate = () => {
    let locState = { ...locs };
    let locations = [10];
    let locationsToFraction = ['10'];
    let holeCount = 0;
    let nums = fraction.split('/').map((x) => parseInt(x));
    let toDecimal = nums[0] / nums[1];

    for (let i = 0; i < 10; i++) {
      holeCount = i;
      // subtract 20 for fixed end measurements ( 10 inches )
      if ((length - 20 + toDecimal) / i <= 20) {
        // decimal of distance between points
        let baseDistance = (length - 20 + toDecimal) / i;

        // converts hole locations to fractions
        for (let i = 1; i < holeCount; i++) {
          // adds distance to previous measurement
          let num = locations[locations.length - 1] + baseDistance;

          locations.push(num);
          locationsToFraction.push(closestTapeMeasure(num).toFraction(true));
        }

        // adds user entered length together into one number
        let totalLength;

        if (fraction.length) {
          totalLength = Fraction(length).add(fraction).valueOf();
        } else {
          totalLength = Fraction(length).valueOf();
        }

        if (length < 30) return;

        locationsToFraction.push(Fraction(totalLength - 10).toFraction(true));

        // add the last hole 10 inches from end
        locations.push(totalLength - 10);
        console.log('locs', locations);

        locState.decimal = locations;
        locState.fraction = locationsToFraction;

        // converts decimal distance to a fraction ( nearest 1/16th )
        let finalMeasurement =
          closestTapeMeasure(baseDistance).toFraction(true);

        setTotalLength(totalLength);
        setDistance(finalMeasurement);
        setLocs(locState);
        break;
      }
    }
  };

  let handleLengthChange = (e) => {
    let state = length.slice();

    state = e.target.value;
    setLength(state);
  };

  let handleFractionChange = (e) => {
    let state = fraction.slice();

    state = e.target.value;
    setFraction(state);
  };

  return (
    <div className='App'>
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

      <br />

      <Button className='margin-10' variant='contained' onClick={calculate}>
        Go
      </Button>

      <br />
      <Typography>Distance: {distance}</Typography>
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

export default App;
