import React from 'react';
import Panel from './components/Panel';
import TopNav from './components/TopNav';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useTapeMeasure from './useTapeMeasure';
import TapeCalc from './components/TapeCalc';

import './App.css';

const Fraction = require('fraction.js');

/**
 * TODO:
 * add calculator below for manual math rounding to nearest 1/16th
 * addition, subtraction, division, maybe multiplication
 *
 */

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function App() {
  let [value, setValue] = React.useState(0);
  // converts a number to the nearest 1/16th and returns the string value

  // function useTapeMeasure(frac) {
  //   return new Fraction(Math.round(16 * Fraction(frac).valueOf()), 16);
  // }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className='App'>
      <TopNav />
      <Tabs value={value} onChange={handleChange}>
        <Tab label='Panel' {...a11yProps(0)}></Tab>
        <Tab label='Tape Calc' {...a11yProps(1)}></Tab>
        <Tab label='Systems' {...a11yProps(2)}></Tab>
      </Tabs>
      <TabPanel value={value} index={0}>
        <Panel />
      </TabPanel>
      <TabPanel value={value} index={1}>
        Tape Calc
      </TabPanel>
      <TabPanel value={value} index={2}>
        Systems
      </TabPanel>

      <Divider />
      {/* <Button onClick={test}>Test</Button> */}
    </div>
  );
}

export default App;
