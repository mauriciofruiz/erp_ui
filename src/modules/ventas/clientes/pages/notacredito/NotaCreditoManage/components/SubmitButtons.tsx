import { EstadoDocumentoEnum, ParametersEnum, TitlesEnum } from '@/enums';
import { FormState, useAllowVentas, useCommonManage } from '@/hooks';
import {
  DeleteForever,
  EditNote,
  ExitToApp,
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
  } = props;

  const { onEditButtonClick } = useCommonManage();

  const { allowConfirmNCVenta } = useAllowVentas();

  const getJerarquiaEstados = () => {
    if (formState.stateId === EstadoDocumentoEnum.GENERADO) {
      return EstadoDocumentoEnum.CONFIRMADO;
    }
    return formState.stateId;
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
                      documentNumber: formState.creditNoteNumber,
                      edicionMessage: TitlesEnum.NOTA_CREDITO_EDICION,
                      lecturaMessage: TitlesEnum.NOTA_CREDITO_LECTURA,
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
            {formState.stateId === EstadoDocumentoEnum.GENERADO && (
              <Grid item>
                <div style={{ width: '150px', marginRight: 5 }}>
                  <Button
                    type="submit"
                    startIcon={<Save />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        stateId: EstadoDocumentoEnum.GENERADO,
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

            {allowConfirmNCVenta() && (
              <Grid item>
                <div style={{ width: '150px', marginRight: 5 }}>
                  <Button
                    type="button"
                    startIcon={<Send />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        stateId: getJerarquiaEstados(),
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
        )}
        {enableAnulation && (
          <Grid item>
            <Button
              startIcon={<DeleteForever />}
              onClick={() => {
                setFormState({
                  ...formState,
                  stateId: EstadoDocumentoEnum.ANULADO,
                });
                setDialogMessage(ParametersEnum.MENSAJE_ANULACION_GENERICO);
                setIsAnulation(true);
                setOpenDialogAlert(true);
              }}
              // disabled={!editMode}
              sx={{ marginRight: 5 }}
              style={{ width: '150px' }}
            >
              {'Anular'}
            </Button>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
