import React from 'react';
import TopNav from './components/TopNav';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// import PostLevel from './components/PostLevel';
import TapeCalc from './components/TapeCalc';
import Systems from './components/Systems';
import SquareCheck from './components/SquareCheck';

import './App.css';

function TabPanel({ children, value, index, sx, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={sx ?? { p: { xs: 1, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export default function App() {
  const [value, setValue] = React.useState(0);
  const handleChange = (_event, newValue) => setValue(newValue);

  return (
    <>
      <TopNav />
      {/* No min-height here: the page background is owned by CssBaseline/body,
          and forcing 100vh made the TapeCalc tab (header + locked card) always
          overflow the viewport by the header height. */}
      <main className='App'>
        <Tabs
          value={value}
          onChange={handleChange}
          variant='fullWidth'
          aria-label='Main navigation tabs'
        >
          {/* <Tab label='Post Level' id='tab-0' aria-controls='tabpanel-0' /> */}
          <Tab label='Tape Calc' id='tab-0' aria-controls='tabpanel-0' />
          <Tab label='Systems' id='tab-1' aria-controls='tabpanel-1' />
          <Tab label='Square Check' id='tab-2' aria-controls='tabpanel-2' />
        </Tabs>
        {/* <TabPanel value={value} index={0}>
          <div className='tab-content-card'>
            <PostLevel />
          </div>
        </TabPanel> */}
        {/* TapeCalc is viewport-locked: no panel padding on phones so the
            card can size itself to exactly the space below the tabs. */}
        <TabPanel
          value={value}
          index={0}
          sx={{ p: { xs: 0, sm: 3 }, '@media (max-height: 520px)': { p: 0 } }}
        >
          <div className='tab-content-card tab-content-card--tapecalc'>
            <TapeCalc />
          </div>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <div className='tab-content-card'>
            <Systems />
          </div>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <div className='tab-content-card'>
            <SquareCheck />
          </div>
        </TabPanel>
      </main>
    </>
  );
}
