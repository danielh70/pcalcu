import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function TopNav() {
  return (
    <AppBar
      position='sticky'
      color='primary'
      elevation={0}
      sx={{ minHeight: 56, justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
    >
      <Toolbar sx={{ minHeight: 56, px: { xs: 1, sm: 3 } }}>
        <Typography variant='h6' sx={{ fontWeight: 700, letterSpacing: 1, flexGrow: 1 }}>
          Field Calc
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
