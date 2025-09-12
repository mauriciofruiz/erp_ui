import { Button, IconButton, Paper, TableCell } from '@mui/material';
import { createTheme, styled, Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { InputNumber } from 'antd';
import { MaterialDesignContent } from 'notistack';

export const StyledMaterialDesignContent = styled(MaterialDesignContent)(
  () => ({
    '&.notistack-MuiContent-success': {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    '&.notistack-MuiContent-error': {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    '&.notistack-MuiContent-warning': {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    '&.notistack-MuiContent-info': {
      color: '#ffffff',
      fontWeight: 'bold',
    },
  })
);
// * MODIFICACIONES PARA EL THEME GENERICO DE LA APLICACIÓN

export const useStyles = makeStyles((theme: Theme) => {
  // Merge the custom theme with the default theme
  const mergedTheme = createTheme(theme);

  return {
    textFieldNoBorder: {
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
    genericStyleComponent: {
      backgroundColor: mergedTheme.palette.background.default,
      color: mergedTheme.palette.primary.contrastText,
    },
    containerCentered: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    },
    centeredGrid: {
      display: 'grid',
      placeItems: 'center',
    },
    headerTitleGreen: {
      color: mergedTheme.palette.primary.main, // Use the updated primary color
      textAlign: 'center', // Center the title text
    },
    headerTitleWhite: {
      color: mergedTheme.palette.primary.contrastText, // Use the updated primary color
      textAlign: 'center', // Center the title text
    },
    headerTitleWhiteLeft: {
      color: mergedTheme.palette.primary.contrastText, // Use the updated primary color
      textAlign: 'left',
    },
    textGreenStyle: {
      color: mergedTheme.palette.primary.main, // Use the updated primary color
    },
    textWhiteStyle: {
      color: mergedTheme.palette.primary.contrastText,
    },
    textBlackStyle: {
      color: '#000000',
    },
    genericFieldStyle: {
      '& label.Mui-focused': {
        color: mergedTheme.palette.primary.main, // Use the updated primary color
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: mergedTheme.palette.primary.main, // Use the updated primary color
      },
      '& .MuiOutlinedInput-root': {
        '&:hover fieldset': {
          borderColor: mergedTheme.palette.primary.contrastText,
        },
        '&.Mui-focused fieldset': {
          borderColor: mergedTheme.palette.primary.main, // Use the updated primary color
        },
      },
      '& .MuiOutlinedInput-root-MuiSelect-root': {
        '&:hover fieldset': {
          borderColor: theme.palette.primary.contrastText,
        },
        '&.Mui-focused fieldset': {
          borderColor: mergedTheme.palette.primary.main, // Use the updated primary color
        },
      },
    },
    tableContainer: {
      width: '100%',
      overflowX: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      margin: '0 auto',
    },
    paperMenuStyle: {
      width: '15%',
      maxHeight: 200,
      overflowY: 'auto',
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: mergedTheme.palette.primary.contrastText,
    },
    progressContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    progressText: {
      marginTop: '8px',
      fontSize: '14px',
    },
    button: {
      backgroundColor: mergedTheme.palette.primary.main,
      color: mergedTheme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: mergedTheme.palette.primary.dark,
      },
      '&:active': {
        backgroundColor: mergedTheme.palette.primary.light,
      },
    },
    selectContainer: {
      '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
        borderColor: mergedTheme.palette.primary.contrastText, // White border on hover
      },
      '& .MuiInput-underline.Mui-focused:before': {
        borderColor: mergedTheme.palette.primary.main, // Green border on focus
      },
    },
    iconContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: theme.spacing(1), // Ajusta el espaciado entre los iconos
      alignItems: 'center', // Centra los iconos verticalmente
      justifyContent: 'center', // Centra horizontalmente los iconos en el contenedor
    },
    customCheckBox: {
      /* Estilo para el icono no marcado */
      '.custom-checkbox .MuiSvgIcon-root': {
        fill: mergedTheme.palette.primary
          .main /* Cambia #ff0000 al color que desees */,
      },

      /* Estilo para el icono marcado */
      '.custom-checkbox .Mui-checked .MuiSvgIcon-root': {
        fill: mergedTheme.palette.primary
          .main /* Cambia #00ff00 al color que desees */,
      },
    },
    navigateBarColor: {
      borderRight: `6px solid ${mergedTheme.palette.primary.main}`,
    },
    tagOneColumn: {
      display: 'flex',
      flexWrap: 'wrap',
      flexDirection: 'column',
    },
  };
});

export const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  backdropFilter: 'blur(55px)',
  '& .MuiPickersDay-root.Mui-selected:hover': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiPickersDay-root.Mui-selected': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiPickersDay-root:hover': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.background.default,
  },
  '& .MuiPickersYear-yearButton.Mui-selected:hover': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiPickersYear-yearButton.Mui-selected': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiPickersYear-yearButton:hover': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.background.default,
  },
  '& .MuiPickersMonth-monthButton.Mui-selected:hover': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiPickersMonth-monthButton.Mui-selected': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiPickersMonth-monthButton:hover': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.background.default,
  },
  '& .MuiIconButton-root': {
    backgroundColor: 'transparent',
  },
}));

export const StyledIconButton = styled(IconButton)`
  width: 150px;
  height: 130px;

  @media (max-width: 600px) {
    width: 80px;
    height: 80px;
    .MuiSvgIcon-root {
      width: 50%; // Adjust the size of the icon
    }

    .MuiTypography-root {
      font-size: 10px; // Adjust the font size of the text
    }
  }
`;

export const StyledPaper = styled(Paper)`
  width: 150px;
  height: 130px;

  @media (max-width: 600px) {
    width: 80px;
    height: 80px;
  }
`;

export const PaginationWrapper = styled('div')`
  .pagination {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 5;
    justify-content: center;
  }

  .pagination > li > a,
  .pagination > li > span {
    color: ${({ theme }) => theme.palette.primary.main};
    background-color: ${({ theme }) => theme.palette.background.default};
    border: 1px solid ${({ theme }) => theme.palette.primary.contrastText};
    text-decoration: none;
    cursor: pointer;
    border-radius: 4px;
  }

  .pagination > .active > a,
  .pagination > .active > a:focus,
  .pagination > .active > a:hover,
  .pagination > .active > span,
  .pagination > .active > span:focus,
  .pagination > .active > span:hover {
    color: ${({ theme }) => theme.palette.primary.contrastText};
    background-color: ${({ theme }) => theme.palette.primary.main};
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

export const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
  zIndex: 2,
});

export const HiddenInput = styled('input')({
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
});

export const ImageButton = styled(Button as any)(({ theme }) => ({
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    width: '100% !important',
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.2,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      visibility: 'visible', // Show Typography on hover
    },
  },
  '&:not(:hover):not(.Mui-focusVisible) .MuiTypography-root': {
    visibility: 'hidden', // Hide Typography when not hovered
  },
}));

export const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
  width: '100%', // Make it responsive
  height: '100%', // Make it responsive
});

export const Image = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

export const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0,
  transition: theme.transitions.create('opacity'),
}));

interface StyledTableCellProps {
  textAlign?: 'left' | 'right' | 'center';
  fontWeight?: 'normal' | 'bold';
}

export const StyledTableCell = styled(TableCell)<StyledTableCellProps>`
  && {
    font-size: 14px;
    border: 1px solid #ffffff;
    padding: 0 5px;
  }

  && > div {
    text-align: ${(props) => props.textAlign || 'left'};
    font-weight: ${(props) => props.fontWeight || 'normal'};
  }
`;

export const PopupBody = styled('div')(
  ({ theme }) => `
  width: max-content;
  padding: 12px 16px;
  margin: 8px;
  border-radius: 8px;
  border: 1px solid ${theme.palette.primary.main};
  background-color: ${
    theme.palette.mode === 'light' ? theme.palette.background.default : '#fff'
  };
  box-shadow: ${
    theme.palette.mode === 'dark'
      ? `0px 4px 8px rgb(0 0 0 / 0.7)`
      : `0px 4px 8px rgb(0 0 0 / 0.1)`
  };
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  z-index: 1;
`
);

export const StyledLabel = styled('label')(
  ({ theme }) => `
  font-size: 12px;
  color: ${theme.palette.primary.main};
  margin-bottom: 5px;
  position: absolute;
  top: -6px;
  left: 10px;
  z-index: 2;  // Asegúrate de que el z-index sea mayor
  background-color: 'inherit';
`
);

export const StyledInputNumber = styled(InputNumber)`
  &&& {
    width: 100%;
    text-align: right;
    padding: 3px;
    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.palette.grey[400]};
    font-size: 14px;
    background-color: transparent;
    transition: border-color 0.3s;
    color: ${(props) => props.theme.palette.primary.contrastText};
    z-index: 1; // Asegúrate de que el z-index sea menor
    &:hover {
      border-color: ${(props) => props.theme.palette.primary.contrastText};
      background-color: transparent;
    }
    &:focus {
      border: 1px solid ${(props) => props.theme.palette.primary.main};
      background-color: transparent;
    }
    &:active {
      border-color: ${(props) => props.theme.palette.primary.main} !important;
    }
    .ant-input-number-input {
      &:focus,
      &:active {
        border-color: ${(props) => props.theme.palette.primary.main} !important;
        background-color: transparent !important;
      }
      &:focus {
        background-color: transparent !important;
      }
    }
    &:active:hover {
      border-color: ${(props) =>
        props.theme.palette.primary.contrastText} !important;
    }
    &.ant-input-number-focused {
      .ant-input-number-input {
        background-color: transparent !important;
      }
    }
  }
`;
