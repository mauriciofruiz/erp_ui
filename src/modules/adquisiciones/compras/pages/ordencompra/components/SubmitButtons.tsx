import { EstadoOrdenEnum, ParametersEnum, TitlesEnum } from '@/enums';
import { downloadPdf } from '@/functions';
import { FormState, useCommonManage, useOrdenCompraAsync } from '@/hooks';
import {
  Close,
  DeleteForever,
  EditNote,
  ExitToApp,
  PictureAsPdf,
  Save,
  Send,
} from '@mui/icons-material';
import { Button, Grid } from '@mui/material';
import { GridValidRowModel } from '@mui/x-data-grid';

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
  rows: readonly GridValidRowModel[];
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  enableAnulation: boolean;
  closeOrder: boolean;
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
    enableAnulation,
    closeOrder,
  } = props;

  const { onEditButtonClick } = useCommonManage();

  const getJerarquiaEstados = () => {
    if (formState.stateOrderId === EstadoOrdenEnum.EN_EDICION) {
      return EstadoOrdenEnum.CONFIRMADA;
    }
    return formState.stateOrderId;
  };

  const { fetchDownloadPdf } = useOrdenCompraAsync();

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
                  if (formState.purchaseOrderId) {
                    fetchDownloadPdf(formState.purchaseOrderId).then(
                      (response) => {
                        downloadPdf(
                          response,
                          `OC #${formState.purchaseOrderId} Prov_${formState.providerName}.pdf`
                        );
                      }
                    );
                  }
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
                  onClick={() =>
                    onEditButtonClick({
                      editMode,
                      setEditMode,
                      setTitle,
                      documentNumber: formState.purchaseOrderId,
                      edicionMessage: TitlesEnum.ORDEN_COMPRA_EDICION,
                      lecturaMessage: TitlesEnum.ORDEN_COMPRA_LECTURA,
                    })
                  }
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
            {formState.stateOrderId === EstadoOrdenEnum.EN_EDICION && (
              <Grid item>
                <div style={{ width: '150px', marginRight: 5 }}>
                  <Button
                    type="submit"
                    startIcon={<Save />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        stateOrderId: EstadoOrdenEnum.EN_EDICION,
                      });
                      setIsAnulation(false);
                    }}
                    disabled={!thereIsChanges || (!createMode && !editMode)}
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
                      stateOrderId: getJerarquiaEstados(),
                    });
                    setDialogMessage(
                      ParametersEnum.MENSAJE_CONFIRMACION_GENERICO
                    );
                    setIsAnulation(false);
                    setOpenDialogAlert(true);
                  }}
                  disabled={!thereIsChanges || (!createMode && !editMode)}
                  fullWidth
                >
                  {'Confirmar'}
                </Button>
              </div>
            </Grid>
          </>
        )}
        {enableAnulation && (
          <Grid item>
            <Button
              startIcon={<DeleteForever />}
              onClick={() => {
                setFormState({
                  ...formState,
                  stateOrderId: EstadoOrdenEnum.ANULADA,
                });
                setDialogMessage(ParametersEnum.MENSAJE_ANULACION_GENERICO);
                setIsAnulation(true);
                setOpenDialogAlert(true);
              }}
              sx={{ marginRight: 5 }}
              style={{ width: '150px' }}
            >
              {'Anular'}
            </Button>
          </Grid>
        )}
        {!createMode && closeOrder && (
          <Button
            type="button"
            startIcon={<Close />}
            onClick={() => {
              setFormState({
                ...formState,
                stateOrderId: EstadoOrdenEnum.RECEPCIONADA,
              });
              setDialogMessage(
                'Está por cerrar esta orden, una vez realizada está transacción no podrá efectuar más cambios. ¿Desea cerrar la orden de compra?'
              );
              setIsAnulation(false);
              setOpenDialogAlert(true);
            }}
            sx={{ margin: 2 }}
            style={{ width: '170px' }}
          >
            {'Cerrar Orden'}
          </Button>
        )}
      </Grid>
    </Grid>
  );
};
