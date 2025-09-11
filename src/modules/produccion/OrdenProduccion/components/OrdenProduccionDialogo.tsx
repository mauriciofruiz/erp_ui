import { EstadoOrdenProduccionEnum } from '@/enums';
import { FormState } from '@/hooks';
import { Info } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
} from '@mui/material';
import { ChangeEvent } from 'react';

interface OrdenProduccionDialogoProps {
  openDialogAlert: boolean;
  setOpenDialogAlert: React.Dispatch<React.SetStateAction<boolean>>;
  openAnulation: boolean;
  setOpenAnulation: React.Dispatch<React.SetStateAction<boolean>>;
  formState: FormState;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  setStateForRequest: React.Dispatch<React.SetStateAction<number>>;
  dialogCloseAlert: boolean;
  setDialogCloseAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

export const OrdenProduccionDialogo = (props: OrdenProduccionDialogoProps) => {
  const {
    openDialogAlert,
    setOpenDialogAlert,
    openAnulation,
    setOpenAnulation,
    formState,
    onInputChange,
    setStateForRequest,
    dialogCloseAlert,
    setDialogCloseAlert,
    setFormState,
  } = props;

  const onDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenAnulation(false);
    setOpenDialogAlert(false);
    setDialogCloseAlert(false);
  };

  return (
    <>
      <Dialog open={openAnulation} onClose={() => setOpenAnulation(false)}>
        <form onSubmit={onDialogConfirm}>
          <DialogContent>
            <Alert severity="info" icon={<Info />}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
              Los datos no se podrán restablecer después de anular la orden de
              producción. ¿Estás seguro de que deseas proceder?
            </Alert>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  name="cancellObservation"
                  label="Motivo Anulación"
                  value={
                    formState.cancellObservation !== null
                      ? formState.cancellObservation
                      : ''
                  }
                  onChange={onInputChange}
                  InputLabelProps={{
                    shrink:
                      formState.cancellObservation !== null &&
                      formState.cancellObservation !== ''
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAnulation(false)} color="primary">
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              onClick={() =>
                setStateForRequest(EstadoOrdenProduccionEnum.ANULADO)
              }
              disabled={
                formState.cancellObservation === null ||
                formState.cancellObservation === ''
              }
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openDialogAlert} onClose={() => setOpenDialogAlert(false)}>
        <form onSubmit={onDialogConfirm}>
          <DialogContent>
            <Alert severity="info" icon={<Info />}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
              ¿Estás seguro de que deseas proceder con la confirmación?
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogAlert(false)} color="primary">
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              onClick={() =>
                setStateForRequest(EstadoOrdenProduccionEnum.PRODUCIDO)
              }
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={dialogCloseAlert}
        onClose={() => setDialogCloseAlert(false)}
      >
        <form onSubmit={onDialogConfirm}>
          <DialogContent>
            <Alert severity="info" icon={<Info />}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
              ¿Desea transferir la producción al cerrar la orden?
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button
              type="submit"
              color="primary"
              onClick={() => {
                setStateForRequest(EstadoOrdenProduccionEnum.CERRADO);
                setFormState((prevState) => ({
                  ...prevState,
                  hasTransfer: false,
                  endDate: new Date(),
                }));
              }}
            >
              NO
            </Button>
            <Button
              type="submit"
              color="primary"
              onClick={() => {
                setStateForRequest(EstadoOrdenProduccionEnum.CERRADO);
                setFormState((prevState) => ({
                  ...prevState,
                  hasTransfer: true,
                  endDate: new Date(),
                }));
              }}
            >
              SI
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};
