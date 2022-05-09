import React from 'react';
import Panel from './components/Panel';
import TopNav from './components/TopNav';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import useTapeMeasure from './useTapeMeasure';

import './App.css';

const Fraction = require('fraction.js');

/**
 * TODO:
 * add calculator below for manual math rounding to nearest 1/16th
 * addition, subtraction, division, maybe multiplication
 *
 */

function App() {
  // converts a number to the nearest 1/16th and returns the string value

  // function useTapeMeasure(frac) {
  //   return new Fraction(Math.round(16 * Fraction(frac).valueOf()), 16);
  // }

  return (
    <div className='App'>
      <TopNav />
      <Panel />
      <Divider />
      {/* <Button onClick={test}>Test</Button> */}
    </div>
  );
}

export default App;
