import { EstadoDocumentoEnum, ParametersEnum } from '@/enums';
import { downloadPdf } from '@/functions';
import { FormState, useCobroAsync } from '@/hooks';
import { DeleteForever, ExitToApp, PictureAsPdf } from '@mui/icons-material';
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
    setDialogMessage,
    setIsAnulation,
    setOpenDialogAlert,
    formState,
    setFormState,
    enableAnulation,
  } = props;

  const { fetchCobroPdf } = useCobroAsync();

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
                  if (formState.idCobro)
                    fetchCobroPdf(formState.idCobro).then((response) => {
                      downloadPdf(response, `cobro_${formState.idCobro}.pdf`);
                    });
                }}
                style={{ width: '150px' }}
              >
                {'Descargar PDF'}
              </Button>
            </Grid>
          </>
        )}

        {isEditable && (
          <>
            {enableAnulation && (
              <Grid item>
                <Button
                  startIcon={<DeleteForever />}
                  onClick={() => {
                    setFormState({
                      ...formState,
                      invoiceStatusId: EstadoDocumentoEnum.ANULADO,
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
            )}
          </>
        )}
      </Grid>
    </Grid>
  );
};
