import { AppRouter } from './router/AppRouter';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import es from 'date-fns/locale/es';
import { Button } from '@mui/material';
import { StyledMaterialDesignContent } from './hooks';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import LoadingOverlayProvider from './context/loadingOverlay/LoadingOverlayContext';

export const Front = () => {
  return (
    <SnackbarProvider
      preventDuplicate
      maxSnack={5}
      autoHideDuration={5000}
      action={(snackbarId) => (
        <Button
          onClick={() => closeSnackbar(snackbarId)}
          style={{ color: 'white', backgroundColor: 'transparent' }}
        >
          X
        </Button>
      )}
      iconVariant={{
        success: '✅ ',
        error: '✖️ ',
        warning: '⚠️ ',
        info: 'ℹ️ ',
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
      }}
    >
      <LocalizationProvider
        dateAdapter={AdapterDateFns as any}
        adapterLocale={es}
      >
        <LoadingOverlayProvider>
          <AppRouter />
        </LoadingOverlayProvider>
      </LocalizationProvider>
    </SnackbarProvider>
  );
};
