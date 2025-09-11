import { ComprobanteEstadoEnum, ParametersEnum } from '@/enums';
import { downloadPdf } from '@/functions';
import { FormState, useLiquidacionAsync } from '@/hooks';
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
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { fetchLiquidacionPdf } = useLiquidacionAsync();

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle('Liquidación (Modo Edición) - N° ' + formState.liquidationId);
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
      setTitle('Liquidación (Modo Lectura) - N° ' + formState.liquidationId);
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
                sx={{ margin: 2 }}
                onClick={() => {
                  fetchLiquidacionPdf(formState.liquidationId).then(
                    (response) => {
                      downloadPdf(
                        response,
                        `liquidacion_${formState.liquidationId}.pdf`
                      );
                    }
                  );
                }}
                style={{ width: '130px' }}
              >
                {'Descargar PDF'}
              </Button>
            </Grid>

            {isEditable && (
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
              {formState.liquidationState ===
                ComprobanteEstadoEnum.GENERADO && (
                <Grid item>
                  <div style={{ width: '150px', marginRight: 5 }}>
                    <Button
                      type="submit"
                      startIcon={<Save />}
                      onClick={() => {
                        setFormState({
                          ...formState,
                          liquidationState: ComprobanteEstadoEnum.GENERADO,
                        });
                        setIsAnulation(false);
                      }}
                      disabled={!thereIsChanges}
                      fullWidth
                    >
                      {'Guardar'}
                    </Button>
                  </div>
                </Grid>
              )}

              <Grid item>
                <div style={{ width: '150px', marginRight: 5 }}>
                  <Button
                    type="button"
                    startIcon={<Send />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        liquidationState: ComprobanteEstadoEnum.CONFIRMADO,
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
            </>

            {!createMode &&
              formState.liquidationState !== ComprobanteEstadoEnum.ANULADO && (
                <Grid item>
                  <Button
                    startIcon={<DeleteForever />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        liquidationState: ComprobanteEstadoEnum.ANULADO,
                      });
                      setDialogMessage(
                        ParametersEnum.MENSAJE_ANULACION_GENERICO
                      );
                      setIsAnulation(true);
                      setOpenDialogAlert(true);
                    }}
                    disabled={!editMode}
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
