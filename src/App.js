import React from 'react';
import Panel from './components/Panel';
import TopNav from './components/TopNav';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TapeCalc from './components/TapeCalc';
import Systems from './components/Systems';

import './App.css';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

/**
 * The main application component that renders the top navigation and a set of tabs
 * for navigating between different sections: Panel, Tape Calc, and Systems.
 *
 * @component
 * @returns {JSX.Element} The rendered App component.
 */
export default function App() {
  const [value, setValue] = React.useState(0);
  const handleChange = (_event, newValue) => setValue(newValue);

  return (
    <>
      <TopNav />
      <main className='App' style={{ minHeight: '100vh' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          centered
          variant='fullWidth'
          sx={{ mb: 1 }}
          aria-label='Main navigation tabs'
        >
          <Tab label='Panel' id='tab-0' aria-controls='tabpanel-0' />
          <Tab label='Tape Calc' id='tab-1' aria-controls='tabpanel-1' />
          <Tab label='Systems' id='tab-2' aria-controls='tabpanel-2' />
        </Tabs>
        <Divider sx={{ mb: 2 }} />
        <TabPanel value={value} index={0}>
          <div className='tab-content-card tab-content-card--panel'>
            <Panel />
          </div>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <div className='tab-content-card'>
            <TapeCalc />
          </div>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <div className='tab-content-card'>
            <Systems />
          </div>
        </TabPanel>
      </main>
    </>
  );
}
