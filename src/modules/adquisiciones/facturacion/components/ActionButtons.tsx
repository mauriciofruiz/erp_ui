import {
  ComprobanteTypeEnum,
  EstadoDocumentoEnum,
  ParametersEnum,
} from '@/enums';
import { downloadPdf } from '@/functions';
import { FormState, useFacturaProveedorAsync } from '@/hooks';
import {
  DeleteForever,
  EditNote,
  ExitToApp,
  PictureAsPdf,
  Save,
  Send,
} from '@mui/icons-material';
import { Button, FormHelperText, Grid } from '@mui/material';

interface ActionButtonsProps {
  createMode: boolean;
  handleCancel: () => void;
  isEditable: boolean;
  onEditButtonClick: () => void;
  editMode: boolean;
  showButtonChanges: boolean;
  setDialogMessage: (message: string) => void;
  setIsAnulation: (isAnulation: boolean) => void;
  setOpenDialogAlert: (open: boolean) => void;
  validatedByOrden: boolean;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  existDocumentNumber: boolean;
}

const mensajeValidacion = 'El Valor De La Factura No Coincide Con La OC';

export const ActionButtons = (props: ActionButtonsProps) => {
  const {
    createMode,
    handleCancel,
    isEditable,
    onEditButtonClick,
    editMode,
    setDialogMessage,
    setIsAnulation,
    setOpenDialogAlert,
    validatedByOrden,
    formState,
    setFormState,
    existDocumentNumber,
  } = props;

  const getJerarquiaEstados = () => {
    if (formState.providerInvoiceStatusId === EstadoDocumentoEnum.GENERADO) {
      return EstadoDocumentoEnum.CONFIRMADO;
    }
    return formState.providerInvoiceStatusId;
  };

  const { fetchLiquidacionPdf } = useFacturaProveedorAsync();

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

            {formState.providerInvoiceId != null &&
              formState.voucherTypeCode === ComprobanteTypeEnum.LIQUIDACION && (
                <Grid item>
                  <Button
                    startIcon={<PictureAsPdf />}
                    sx={{ margin: 2 }}
                    onClick={() => {
                      fetchLiquidacionPdf(formState.providerInvoiceId).then(
                        (response) => {
                          downloadPdf(
                            response,
                            `liquidacion_${formState.providerInvoiceId}.pdf`
                          );
                        }
                      );
                    }}
                    style={{ width: '130px' }}
                  >
                    {'Descargar PDF'}
                  </Button>
                </Grid>
              )}

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
              {formState.providerInvoiceStatusId === null ||
              formState.providerInvoiceStatusId ===
                EstadoDocumentoEnum.GENERADO ? (
                <Grid item>
                  <div style={{ width: '150px', marginRight: 5 }}>
                    <Button
                      type="submit"
                      disabled={existDocumentNumber}
                      startIcon={<Save />}
                      onClick={() => {
                        setFormState({
                          ...formState,
                          providerInvoiceStatusId: EstadoDocumentoEnum.GENERADO,
                        });
                        setIsAnulation(false);
                      }}
                      fullWidth
                    >
                      {'Guardar'}
                    </Button>
                    <div style={{ height: '0px' }}>
                      {!validatedByOrden && (
                        <FormHelperText error sx={{ textAlign: 'center' }}>
                          {mensajeValidacion}
                        </FormHelperText>
                      )}
                    </div>
                  </div>
                </Grid>
              ) : null}

              <Grid item>
                <div style={{ width: '150px', marginRight: 5 }}>
                  <Button
                    type="button"
                    disabled={existDocumentNumber}
                    startIcon={<Send />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        providerInvoiceStatusId: getJerarquiaEstados(),
                      });
                      setDialogMessage(
                        ParametersEnum.MENSAJE_CONFIRMACION_GENERICO
                      );
                      setIsAnulation(false);
                      setOpenDialogAlert(true);
                    }}
                    fullWidth
                  >
                    {'Confirmar'}
                  </Button>
                  <div style={{ height: '0px' }}>
                    {!validatedByOrden && (
                      <FormHelperText error sx={{ textAlign: 'center' }}>
                        {mensajeValidacion}
                      </FormHelperText>
                    )}
                  </div>
                </div>
              </Grid>
            </>

            {!createMode &&
              formState.statusId?.providerInvoiceStatusId !==
                EstadoDocumentoEnum.ANULADO && (
                <Grid item>
                  <Button
                    startIcon={<DeleteForever />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        cancellationDate: new Date(),
                        providerInvoiceStatusId: EstadoDocumentoEnum.ANULADO,
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
