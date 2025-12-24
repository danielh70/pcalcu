import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  shape: { borderRadius: 6 },
  palette: {
    background: { default: '#f7f9fb', paper: '#ffffff' },
    primary: {
      main: '#1976d2',
      dark: '#115293',
      contrastText: '#fff',
    },
    text: { primary: 'rgba(12, 22, 30, 0.95)', secondary: 'rgba(12,22,30,0.6)' },
  },
  components: {
    MuiTabs: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.95)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          border: '1px solid rgba(2, 6, 23, 0.06)',
          overflow: 'hidden',
        },
        indicator: {
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 650,
          minHeight: 48,
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 14px',
        },
        containedPrimary: {
          boxShadow: '0 6px 18px rgba(2,6,23,0.05)',
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          padding: '6px',
          borderRadius: 10,
          gap: 14,
          display: 'inline-flex',
          overflow: 'visible',
        },
        grouped: {
          margin: 0,
          borderRadius: 8,
          // grouped children will maintain their own border and rounded corners; no inner border-left
          '&:not(:first-of-type)': { marginLeft: 0 },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          transition:
            'transform 150ms cubic-bezier(.2,.8,.2,1), box-shadow 150ms cubic-bezier(.2,.8,.2,1), background-color 150ms cubic-bezier(.2,.8,.2,1)',
          minHeight: 38,
          borderRadius: 6,
          border: '1px solid rgba(0,0,0,0.06)',
          padding: '6px 12px',
          fontWeight: 600,
          letterSpacing: '0.2px',
          boxShadow: '0 4px 12px rgba(2,6,23,0.03)',
          '&:hover': { boxShadow: '0 6px 18px rgba(2,6,23,0.05)', transform: 'translateY(-1px)' },
          // ensure a crisp inner seam between adjacent buttons (horizontal and vertical)
          '&:not(:first-of-type)': {
            boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.06)',
            backgroundClip: 'padding-box',
          },
          '&.Mui-selected': {
            // prominent but subtle selected state; preserve seam visually
            backgroundColor: '#155fa8',
            color: '#ffffff',
            boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.06), 0 0 0 1px #0d3f73',
            transform: 'none',
            border: '1px solid #0d3f73',
            zIndex: 'auto',
          },
          '&.Mui-selected:hover': { backgroundColor: '#0d3f73' },
          '&.Mui-selected svg': { color: '#ffffff', transform: 'scale(1.06)' },
        },
        // ensure grouped buttons keep their individual rounded corners in horizontal and vertical layouts
        groupedHorizontal: { borderRadius: 6, '&:not(:first-of-type)': { marginLeft: 12 } },
        groupedVertical: { borderRadius: 6, '&:not(:first-of-type)': { marginTop: 10 } },
        sizeSmall: { padding: '6px 8px', minHeight: 34 },
        sizeLarge: { padding: '8px 12px', minHeight: 40 },
      },
    },
  },
});

export default theme;
