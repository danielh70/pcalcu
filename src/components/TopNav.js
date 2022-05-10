import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

export default function ButtonAppBar() {
  return (
    <Box
      style={{ marginBottom: 10, marginLeft: '0px', marginRight: '0px', width: '100%' }}
      sx={{ flexGrow: 1 }}
    >
      <AppBar position='static'>
        <Toolbar></Toolbar>
      </AppBar>
    </Box>
  );
}
