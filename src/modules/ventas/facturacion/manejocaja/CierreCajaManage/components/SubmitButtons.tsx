import { EstadoCierreCajaEnum, ParametersEnum, TitlesEnum } from '@/enums';
import { downloadPdf } from '@/functions';
import { FormState, useCierreCajaAsync, useCommonManage } from '@/hooks';
import {
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

  const { onEditButtonClick } = useCommonManage();

  const getJerarquiaEstados = () => {
    if (formState.closingStatusId === EstadoCierreCajaEnum.GENERADO) {
      return EstadoCierreCajaEnum.CONFIRMADO;
    }
    return formState.closingStatusId;
  };

  const { fetchCierreCajaPdf } = useCierreCajaAsync();

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
                onClick={() => {
                  if (formState.closingCashId)
                    fetchCierreCajaPdf(formState.closingCashId).then(
                      (response) => {
                        downloadPdf(
                          response,
                          `arqueo_caja_${formState.closingCashId}.pdf`
                        );
                      }
                    );
                }}
                style={{ width: '200px' }}
              >
                {'Descargar Arqueo PDF'}
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
                      documentNumber: formState.closingCashId,
                      edicionMessage: TitlesEnum.CIERRE_CAJA_EDICION,
                      lecturaMessage: TitlesEnum.CIERRE_CAJA_LECTURA,
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
            <>
              {formState.closingStatusId === EstadoCierreCajaEnum.GENERADO ? (
                <Grid item>
                  <div style={{ width: '150px', marginRight: 5 }}>
                    <Button
                      type="submit"
                      startIcon={<Save />}
                      onClick={() => {
                        setFormState({
                          ...formState,
                          closingStatusId: EstadoCierreCajaEnum.GENERADO,
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
              ) : null}

              <Grid item>
                <div style={{ width: '150px', marginRight: 5 }}>
                  <Button
                    type="button"
                    startIcon={<Send />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        closingStatusId: getJerarquiaEstados(),
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

            {/* {enableAnulation && (
              <Grid item>
                <Button
                  startIcon={<DeleteForever />}
                  onClick={() => {
                    setFormState({
                      ...formState,
                      closingStatusId: EstadoCierreCajaEnum.ANULADO,
                    });
                    setDialogMessage(ParametersEnum.MENSAJE_ANULACION_GENERICO);
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
            )} */}
          </>
        )}
      </Grid>
    </Grid>
  );
};
