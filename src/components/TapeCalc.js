import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';

const Fraction = require('fraction.js');

export default function TapeCalc(props) {
  let [length1, setLength1] = React.useState('');
  let [length2, setLength2] = React.useState('');
  let [result, setResult] = React.useState('');
  const [view, setView] = React.useState('list');

  let ctm = (frac) => {
    return new Fraction(Math.round(16 * Fraction(frac).valueOf()), 16);
  };

  let handleLengthChange = (e) => {
    switch (e.target.name) {
      case 'length1': {
        let state = length1.slice();
        state = e.target.value;
        return setLength1(state);
      }
      case 'length2': {
        let state = length2.slice();
        state = e.target.value;
        return setLength2(state);
      }
      default:
        return;
    }
  };

  let handleSubmit = () => {
    // let ftest = Fraction(length1).add(length2).toFraction(true);

    switch (view) {
      case 'add': {
        let num1 = ctm(Fraction(length1).add(length2)).toFraction(true);
        return setResult(num1);
      }
      case 'subtract': {
        let num2 = ctm(Fraction(length1).sub(length2)).toFraction(true);
        return setResult(num2);
      }
      case 'divide': {
        let num3 = ctm(Fraction(length1).div(length2)).toFraction(true);
        return setResult(num3);
      }
      case 'multiply': {
        let num4 = ctm(Fraction(length1).mul(length2)).toFraction(true);
        return setResult(num4);
      }
      default: {
        console.log('default....');
        break;
      }
    }

    // console.log('ftest', ftest.toFraction(true));

    let n1 = length1.split(' ');
    let n2 = length2.split(' ');
    let nums1 = length1[1].split('/').map((x) => parseInt(x)) || 0;
    let nums2 = length2[1].split('/').map((x) => parseInt(x)) || 0;
    let n1ToDecimal = nums1[0] / nums1[1] || 0;
    let n2ToDecimal = nums2[0] / nums2[1] || 0;
    console.log('1', length1, '2', length2);
  };

  const handleOperatorChange = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
    setView(nextView);
  };

  return (
    <div>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TextField
          className='margin-10'
          id='outlined-basic'
          label='Length'
          variant='outlined'
          name='length1'
          value={length1}
          onChange={handleLengthChange}
        />
        <ToggleButtonGroup
          orientation='vertical'
          value={view}
          exclusive
          onChange={handleOperatorChange}
        >
          <ToggleButton value='divide' aria-label='divide'>
            <i class='fa-solid fa-divide'></i>
          </ToggleButton>
          <ToggleButton value='add' aria-label='add'>
            <i class='fa-solid fa-plus-large'></i>
          </ToggleButton>
          <ToggleButton value='subtract' aria-label='subtract'>
            <i class='fa-solid fa-minus'></i>
          </ToggleButton>
          <ToggleButton value='multiply' aria-label='multiply'>
            <i class='fa-solid fa-xmark-large'></i>
          </ToggleButton>
        </ToggleButtonGroup>
        <TextField
          className='margin-10'
          id='outlined-basic'
          label='Length'
          variant='outlined'
          name='length2'
          value={length2}
          onChange={handleLengthChange}
        />
      </Box>
      <br />
      <Button variant='contained' color='primary' onClick={handleSubmit}>
        Go
      </Button>
      <br />
      <br />
      <Typography variant='h5'>{result}</Typography>
    </div>
  );
}
