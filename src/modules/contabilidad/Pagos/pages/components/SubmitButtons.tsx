import { EstadoPagoEnum, ParametersEnum } from '@/enums';
import { FormState } from '@/hooks';
import {
  DeleteForever,
  EditNote,
  ExitToApp,
  PictureAsPdf,
  Save,
  Send,
} from '@mui/icons-material';
import { Button, Grid } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';

interface SubmitButtonsProps {
  createMode: boolean;
  handleCancel: () => void;
  isEditable: boolean;
  editMode: boolean;
  thereIsChanges: boolean;
  setDialogMessage: (message: string) => void;
  setIsAnulation: (isAnulation: boolean) => void;
  setOpenDialogAlert: (open: boolean) => void;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  rows: GridRowsProp;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  enablePaymentAnulation: boolean;
}

export const SubmitButtons = (props: SubmitButtonsProps) => {
  const {
    createMode,
    handleCancel,
    isEditable,
    editMode,
    thereIsChanges,
    setDialogMessage,
    setIsAnulation,
    setOpenDialogAlert,
    formState,
    setFormState,
    setEditMode,
    setTitle,
    enablePaymentAnulation,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle('Pago (Modo Edición) - N° ' + formState.paymentId);
      enqueueSnackbar(
        <>
          {'Modo edición habilitado'}
          <br />
          {'Modo lectura deshabilitado'}
        </>,
        {
          variant: 'info',
        }
      );
    } else {
      setEditMode(false);
      setTitle('Pago (Modo Lectura) - N° ' + formState.paymentId);
      enqueueSnackbar(
        <>
          {'Modo edición deshabilitado'}
          <br />
          {'Modo lectura habilitado'}
        </>,
        {
          variant: 'info',
        }
      );
    }
  };

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
        {!createMode && (
          <>
            <Grid item>
              <Button
                startIcon={<ExitToApp />}
                sx={{ marginRight: 5 }}
                onClick={handleCancel}
                style={{ width: '150px' }}
              >
                {'Salir'}
              </Button>
            </Grid>

            <Grid item>
              <Button
                startIcon={<PictureAsPdf />}
                sx={{ marginRight: 5 }}
                onClick={() =>
                  alert('Funcionalidad no disponible en esta versión')
                }
                style={{ width: '150px' }}
              >
                {'Descargar PDF'}
              </Button>
            </Grid>

            {isEditable && formState.paymentStatusId !== EstadoPagoEnum.CONFIRMADO && (
              <Grid item>
                <Button
                  startIcon={<EditNote />}
                  sx={{ marginRight: 5 }}
                  onClick={onEditButtonClick}
                  style={{ width: '150px' }}
                >
                  {!editMode ? 'Editar' : 'Leer'}
                </Button>
              </Grid>
            )}
          </>
        )}

        {isEditable && (
          <>
            <>
              {formState.paymentStatusId !== EstadoPagoEnum.CONFIRMADO && formState.paymentStatusId !== EstadoPagoEnum.ANULADO && (
                <Grid item>
                  <div style={{ width: '150px', marginRight: 5 }}>
                    <Button
                      type="submit"
                      startIcon={<Save />}
                      onClick={() => {
                        setFormState({
                          ...formState,
                          paymentStatusId: EstadoPagoEnum.GENERADO,
                        });
                        setIsAnulation(false);
                      }}
                      disabled={!editMode && !createMode}
                      fullWidth
                    >
                      {'Guardar'}
                    </Button>
                  </div>
                </Grid>
              )}
              {formState.paymentStatusId !== EstadoPagoEnum.CONFIRMADO && formState.paymentStatusId !== EstadoPagoEnum.ANULADO && (
                <Grid item>
                  <div style={{ width: '150px', marginRight: 5 }}>
                    <Button
                      type="button"
                      startIcon={<Send />}
                      onClick={() => {
                        setFormState({
                          ...formState,
                          paymentStatusId: EstadoPagoEnum.CONFIRMADO,
                        });
                        setDialogMessage(
                          ParametersEnum.MENSAJE_CONFIRMACION_GENERICO
                        );
                        setIsAnulation(false);
                        setOpenDialogAlert(true);
                      }}
                      disabled={!thereIsChanges}
                      fullWidth
                    >
                      {'Confirmar'}
                    </Button>
                  </div>
                </Grid>
              )}
            </>
            {!createMode &&
              enablePaymentAnulation && (
                <Grid item>
                  <Button
                    startIcon={<DeleteForever />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        paymentStatusId: EstadoPagoEnum.ANULADO,
                      });
                      setDialogMessage(
                        ParametersEnum.MENSAJE_ANULACION_GENERICO
                      );
                      setIsAnulation(true);
                      setOpenDialogAlert(true);
                    }}
                    disabled={(formState.paymentStatusId !== EstadoPagoEnum.GENERADO && formState.paymentStatusId !== EstadoPagoEnum.CONFIRMADO)}
                    sx={{ marginRight: 5 }}
                    style={{ width: '150px' }}
                  >
                    {'Anular'}
                  </Button>
                </Grid>
              )}
          </>
        )}
      </Grid>
    </Grid>
  );
};
