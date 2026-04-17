import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

/**
 * Monoline tape-measure mark: stylised hook + tape with tick marks.
 * Stroke in brand orange; currentColor-driven so it can be themed later.
 */
function BrandMark({ size = 26 }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      sx={{
        color: 'primary.main',
        flexShrink: 0,
        display: 'block',
      }}
    >
      {/* tape body */}
      <rect
        x="3.5" y="9" width="25" height="14" rx="2.5"
        fill="none" stroke="currentColor" strokeWidth="2"
      />
      {/* spool hub */}
      <circle cx="11" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
      {/* tape tongue */}
      <path
        d="M28.5 15.5 L31 15.5 L31 18.5 L28.5 18.5"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
      />
      {/* tick marks on tape */}
      <path
        d="M17 12 V14 M19.5 12 V15 M22 12 V14 M24.5 12 V15"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
    </Box>
  );
}

export default function TopNav() {
  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 1.25, px: { xs: 1.5, sm: 3 } }}>
        <BrandMark />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.02em',
            flexGrow: 1,
            color: 'text.primary',
          }}
        >
          Field Calc
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
