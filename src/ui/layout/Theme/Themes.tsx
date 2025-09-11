import { createTheme, darken, lighten, Theme } from '@mui/material/styles';
import {
  backgroundColor,
  cardColor,
  contrastText,
  primaryColor,
  primaryColorCompras,
  primaryColorContabilidad,
  primaryColorImportaciones,
  primaryColorTalento,
  primaryColorVentas,
  secondaryColor,
  tertearyColor,
} from './ThemeParameters';

// * MODIFICACIONES PARA EL THEME GENERICO DE LA APLICACIÓN
const createCustomTheme = (primaryColor: string) => (theme: Theme) =>
  createTheme({
    typography: {
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
    },
    palette: {
      primary: {
        main: primaryColor,
        contrastText: contrastText,
        dark: darken(primaryColor, 0.2),
        light: lighten(primaryColor, 0.2),
      },
      secondary: {
        main: secondaryColor,
      },
      background: {
        default: backgroundColor,
        paper: backgroundColor,
      },
      grey: {
        400: '#545454',
      },
    },
    components: {
      MuiTable: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiIconButton: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          sizeSmall: {
            height: '30px',
            width: '30px',
            color: contrastText,
            backgroundColor: primaryColor,
          },
          sizeMedium: {
            color: primaryColor,
          },
        },
      },
      MuiIcon: {
        styleOverrides: {
          root: {
            height: '20px',
            width: '20px',
          },
        },
      },
      MuiAutocomplete: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          clearIndicator: {
            backgroundColor: 'transparent',
            color: contrastText,
          },
          popupIndicator: {
            backgroundColor: 'transparent',
            color: contrastText,
          },
          paper: {
            backgroundColor: backgroundColor,
          },
        },
      },
      MuiNativeSelect: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            color: contrastText,
          },
        },
      },
      MuiInputLabel: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            color: primaryColor,
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          icon: {
            color: primaryColor,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: tertearyColor,
            '& .MuiTableCell-root': {
              color: primaryColor,
              textAlign: 'center',
              '& .MuiTableSortLabel-root': {
                color: primaryColor,
                textAlign: 'center',
                '& .MuiSvgIcon-root': {
                  color: contrastText,
                },
              },
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            backgroundColor: backgroundColor,
            '& .MuiTableCell-root': {
              color: 'white !important',
              textAlign: 'center',
            },
          },
        },
      },
      MuiTableFooter: {
        styleOverrides: {
          root: {
            backgroundColor: backgroundColor,
            '& .MuiTableCell-root': {
              color: contrastText,
              textAlign: 'center',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            height: '35px',
            padding: '0px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(5px)',
            backgroundColor: cardColor,
            padding: theme.spacing(2),
            height: 'auto',
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            marginLeft: '1.5%',
            width: '97%',
            padding: 12,
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            backgroundColor: tertearyColor,
            color: contrastText,
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            backgroundColor: darken(backgroundColor, 0.1),
            color: contrastText,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            backgroundColor: primaryColor,
            color: contrastText,
            '&:hover': {
              backgroundColor: lighten(primaryColor, 0.2), //'#83b437',
            },
            '&:active': {
              backgroundColor: darken(primaryColor, 0.2), //'#b2d877',
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            '& label.Mui-focused': {
              color: primaryColor, // Use the updated primary color
            },
            '& .MuiInput-underline:after': {
              borderBottomColor: primaryColor, // Use the updated primary color
            },
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: contrastText,
              },
              '&.Mui-focused fieldset': {
                borderColor: primaryColor, // Use the updated primary color
              },
            },
            '& .MuiOutlinedInput-root-MuiSelect-root': {
              '&:hover fieldset': {
                borderColor: contrastText,
              },
              '&.Mui-focused fieldset': {
                borderColor: primaryColor, // Use the updated primary color
              },
            },
          },
        },
      },
      MuiDialog: {
        defaultProps: {
          PaperProps: {
            style: {
              backgroundColor: backgroundColor,
              color: contrastText,
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: darken(backgroundColor, 0.5),
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: primaryColor,
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            color: contrastText,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: tertearyColor,
            color: contrastText,
          },
        },
      },
      MuiChip: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            backgroundColor: primaryColor,
            color: contrastText,
            '&:hover': {
              backgroundColor: contrastText,
              color: lighten(primaryColor, 0.2),
            },
            '&:active': {
              backgroundColor: contrastText,
              color: darken(primaryColor, 0.2),
            },
          },
        },
      },
    },
  });

export const customTheme = createCustomTheme(primaryColor);
export const comprasTheme = createCustomTheme(primaryColorCompras);
export const contabilidadTheme = createCustomTheme(primaryColorContabilidad);
export const recursosHumanosTheme = createCustomTheme(primaryColorTalento);
export const importacionesTheme = createCustomTheme(primaryColorImportaciones);
export const ventasTheme = createCustomTheme(primaryColorVentas);
