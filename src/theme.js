import { createTheme, alpha } from '@mui/material/styles';

/* ═══════════════════════════════════════════════════════════════
   Brand palette — premium-tool orange on warm near-black.
   Secondary #2E2E2E (20 units above paper #1A1A1A) for real
   surface separation on OLED. Error red is intentionally cool so
   it reads as distinct from primary orange.
   ═══════════════════════════════════════════════════════════════ */

const BRAND_ORANGE = '#F57C00';
const BRAND_ORANGE_HOVER = '#FF8F1F';
const BRAND_ORANGE_ACTIVE = '#D96C00';

const MONO_STACK = `'Roboto Mono', ui-monospace, 'SF Mono', Menlo, monospace`;
const SANS_STACK = `'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`;

const palette = {
  mode: 'dark',
  primary: {
    main: BRAND_ORANGE,
    light: BRAND_ORANGE_HOVER,
    dark: BRAND_ORANGE_ACTIVE,
    contrastText: '#0E0E0F',
  },
  secondary: {
    main: '#2E2E2E',
    light: '#3F3F3F',
    dark: '#1F1F1F',
    contrastText: '#F5F5F5',
  },
  background: {
    default: '#0E0E0F',
    paper: '#1A1A1A',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#A8A8A8',
    disabled: '#595959',
  },
  divider: 'rgba(255,255,255,0.08)',
  error: {
    main: '#E53935',
    light: '#EF5350',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FFB300',
    contrastText: '#0E0E0F',
  },
};

/* ═══════════════════════════════════════════════════════════════
   Typography — Inter sans / Roboto Mono numeric.
   Custom numeric* variants are registered under
   components.MuiTypography.variants so <Typography variant="numeric">
   resolves at runtime without TS augmentation.
   ═══════════════════════════════════════════════════════════════ */

const typography = {
  fontFamily: SANS_STACK,
  fontFamilyMonospace: MONO_STACK,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,

  h1: { fontSize: '2.25rem',   fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' },
  h2: { fontSize: '1.75rem',   fontWeight: 700, lineHeight: 1.20, letterSpacing: '-0.015em' },
  h3: { fontSize: '1.375rem',  fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' },
  h4: { fontSize: '1.1875rem', fontWeight: 600, lineHeight: 1.30 },
  h5: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.35 },
  h6: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.40, letterSpacing: '0.01em' },

  body1:    { fontSize: '1rem',      fontWeight: 400, lineHeight: 1.5 },
  body2:    { fontSize: '0.875rem',  fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.01em' },
  button:   { fontSize: '0.9375rem', fontWeight: 600, letterSpacing: 0, textTransform: 'none' },
  caption:  { fontSize: '0.75rem',   fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.03em' },
  overline: { fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.4, letterSpacing: '0.10em', textTransform: 'uppercase' },
};

const shape = { borderRadius: 8 };

/* ═══════════════════════════════════════════════════════════════
   Component overrides — Button only in this pass.
   Tabs, Tab, AppBar, Paper, TextField, ToggleButton land in B/C.
   Disabled-state colours are decoupled from primary so orange
   never dims into unreadable brown on dark.
   ═══════════════════════════════════════════════════════════════ */

const theme = createTheme({
  palette,
  typography,
  shape,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          color: palette.text.primary,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },

    MuiTypography: {
      variants: [
        {
          props: { variant: 'numericLarge' },
          style: { fontFamily: MONO_STACK, fontSize: '2rem', fontWeight: 500, lineHeight: 1.0, letterSpacing: 0 },
        },
        {
          props: { variant: 'numeric' },
          style: { fontFamily: MONO_STACK, fontSize: '1rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: 0 },
        },
        {
          props: { variant: 'numericSmall' },
          style: { fontFamily: MONO_STACK, fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: 0 },
        },
      ],
    },

    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          backgroundImage: 'none',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        }),
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 56,
          '@media (min-width: 600px)': { minHeight: 64 },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 52,
        }),
        indicator: ({ theme }) => ({
          height: 3,
          borderRadius: '2px 2px 0 0',
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },

    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontFamily: SANS_STACK,
          fontWeight: 600,
          fontSize: '0.9375rem',
          letterSpacing: 0,
          minHeight: 52,
          /* 10px side padding + nowrap: three tabs ("Square Check" is the
             long one) must fit one line at 390px — a wrapped label makes
             the Tabs bar taller than the 53px chrome the viewport-locked
             TapeCalc card subtracts, forcing page scroll. */
          padding: '14px 10px',
          whiteSpace: 'nowrap',
          color: theme.palette.text.secondary,
          transition: 'color 120ms ease, background-color 120ms ease',
          '&:hover': {
            color: theme.palette.text.primary,
            backgroundColor: alpha('#FFFFFF', 0.03),
          },
          '&.Mui-selected': {
            color: theme.palette.text.primary,
            fontWeight: 700,
          },
          '&.Mui-focusVisible': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
        }),
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: 'transparent',
          borderRadius: 8,
          transition: 'border-color 120ms ease, background-color 120ms ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider,
            transition: 'border-color 120ms ease',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha('#FFFFFF', 0.20),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.error.main,
          },
        }),
        input: ({ theme }) => ({
          fontFamily: MONO_STACK,
          fontSize: '1rem',
          fontWeight: 500,
          letterSpacing: 0,
          color: theme.palette.text.primary,
          padding: '14px 14px',
          '&::placeholder': {
            color: theme.palette.text.disabled,
            opacity: 1,
          },
        }),
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontFamily: SANS_STACK,
          fontWeight: 500,
          color: theme.palette.text.secondary,
          '&.Mui-focused': { color: theme.palette.primary.main },
          '&.Mui-error': { color: theme.palette.error.main },
        }),
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontFamily: SANS_STACK,
          fontSize: '0.8125rem',
          marginLeft: 2,
          color: theme.palette.text.secondary,
          '&.Mui-error': { color: theme.palette.error.main },
        }),
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: false,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          padding: '8px 18px',
          minHeight: 40,
          fontWeight: 600,
          letterSpacing: 0,
          textTransform: 'none',
          transition: 'background-color 120ms ease, box-shadow 120ms ease, border-color 120ms ease, color 120ms ease',
        }),
        sizeLarge: { minHeight: 48, padding: '10px 22px', fontSize: '1rem' },
        sizeSmall: { minHeight: 34, padding: '6px 12px', fontSize: '0.8125rem' },

        /* ── contained primary — 44px to hit Apple HIG gloved-hand target ── */
        containedPrimary: ({ theme }) => ({
          minHeight: 44,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.4)}, 0 6px 16px -6px ${alpha(theme.palette.primary.main, 0.6)}`,
          },
          '&:active': {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: 'none',
          },
          '&.Mui-focusVisible': {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}`,
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.secondary.main,
            color: alpha('#FFFFFF', 0.5),
          },
        }),

        containedSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: theme.palette.secondary.light,
            borderColor: alpha('#FFFFFF', 0.16),
          },
          '&:active': {
            backgroundColor: theme.palette.secondary.dark,
          },
          '&.Mui-focusVisible': {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}`,
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.secondary.main,
            color: alpha('#FFFFFF', 0.35),
            borderColor: theme.palette.divider,
          },
        }),

        outlinedPrimary: ({ theme }) => ({
          borderWidth: 1.5,
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          backgroundColor: 'transparent',
          '&:hover': {
            borderWidth: 1.5,
            borderColor: theme.palette.primary.light,
            backgroundColor: alpha(theme.palette.primary.main, 0.10),
          },
          '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, 0.18),
            borderColor: theme.palette.primary.dark,
          },
          '&.Mui-focusVisible': {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
          '&.Mui-disabled': {
            borderColor: theme.palette.divider,
            color: alpha(theme.palette.text.primary, 0.5),
          },
        }),

        textPrimary: ({ theme }) => ({
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
          '&:active': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
          },
          '&.Mui-focusVisible': {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
          '&.Mui-disabled': {
            color: alpha(theme.palette.text.primary, 0.5),
          },
        }),
      },
    },
  },
});

export default theme;
