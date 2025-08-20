import { createTheme } from '@mui/material/styles'

// Sims 4 inspired color palette
const simsColors = {
  primary: {
    main: '#00BCD4', // Sims 4 turquoise/teal
    light: '#4DD0E1',
    dark: '#00838F',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#4CAF50', // Sims 4 green for actions/success
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#FFFFFF'
  },
  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#C62828'
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00'
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2'
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C'
  },
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF'
  },
  text: {
    primary: '#212121',
    secondary: '#757575'
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    ...simsColors
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: simsColors.primary.main
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: simsColors.primary.main
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500
    },
    button: {
      fontWeight: 600,
      textTransform: 'none' as const
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px'
        },
        containedPrimary: {
          background: `linear-gradient(45deg, ${simsColors.primary.main} 30%, ${simsColors.primary.light} 90%)`,
          boxShadow: '0 3px 5px 2px rgba(0, 188, 212, .3)',
          '&:hover': {
            background: `linear-gradient(45deg, ${simsColors.primary.dark} 30%, ${simsColors.primary.main} 90%)`,
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(45deg, ${simsColors.primary.main} 30%, ${simsColors.primary.light} 90%)`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(180deg, ${simsColors.background.paper} 0%, #FAFAFA 100%)`,
          borderRight: `1px solid ${simsColors.primary.light}33`
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            background: simsColors.primary.main,
            color: simsColors.primary.contrastText
          },
          '&.MuiChip-colorSecondary': {
            background: simsColors.secondary.main,
            color: simsColors.secondary.contrastText
          }
        }
      }
    }
  }
})