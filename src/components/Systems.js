import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function SimpleContainer() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth='sm' minHeight='400px' style={{ border: '1px solid black' }}>
        {/* <Box sx={{ bgcolor: '#cfe8fc', height: '100vh' }} /> */}
        Hello
      </Container>
    </React.Fragment>
  );
}
