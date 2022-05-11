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
  const [view, setView] = React.useState('list');

  let closestTapeMeasure = (frac) => {
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

      <br />
      <Button variant='contained' color='primary' onClick={handleSubmit}>
        Go
      </Button>
    </div>
  );
}
