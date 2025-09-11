import { ParametersEnum } from '@/enums';
import { PictureAsPdf, Send } from '@mui/icons-material';
import { Button, Grid } from '@mui/material';

interface SubmitButtonsProps {
  setDialogMessage: (message: string) => void;
  setOpenDialogAlert: (open: boolean) => void;
}

export const SubmitButtons = (props: SubmitButtonsProps) => {
  const { setDialogMessage, setOpenDialogAlert } = props;

  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      sx={{ mt: 5 }}
    >
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item>
          <Button
            startIcon={<PictureAsPdf />}
            sx={{ marginRight: 5 }}
            onClick={() => alert('Funcionalidad no disponible en esta versión')}
            style={{ width: '200px' }}
          >
            {'Descargar'}
          </Button>
        </Grid>

        <Grid item>
          <div style={{ width: '200px', marginRight: 5 }}>
            <Button
              type="button"
              startIcon={<Send />}
              onClick={() => {
                setDialogMessage(ParametersEnum.MENSAJE_CONFIRMACION_GENERICO);
                setOpenDialogAlert(true);
              }}
              fullWidth
            >
              {'Confirmar'}
            </Button>
          </div>
        </Grid>
      </Grid>
    </Grid>
  );
};
