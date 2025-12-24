import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function TopNav() {
  return (
    <AppBar
      position='sticky'
      color='primary'
      elevation={2}
      sx={{ minHeight: 56, justifyContent: 'center' }}
    >
      <Toolbar sx={{ minHeight: 56, px: { xs: 1, sm: 3 } }}>
        <Typography variant='h6' sx={{ fontWeight: 700, letterSpacing: 1, flexGrow: 1 }}>
          P-Calc
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
