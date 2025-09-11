import { ComprobanteEstadoEnum, ParametersEnum } from '@/enums';
import { FormState } from '@/hooks';
import {
  DeleteForever,
  EditNote,
  ExitToApp,
  Save,
  Send,
} from '@mui/icons-material';
import { Button, Grid } from '@mui/material';
import { GridRowModesModel } from '@mui/x-data-grid';
import { GridRowModes, GridRowsProp } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';

interface NotaCreditoButtonsProps {
  createMode: boolean;
  handleCancel: () => void;
  isEditable: boolean;
  editMode: boolean;
  thereIsChanges: boolean;
  setDialogMessage: (message: string) => void;
  setOpenDialogAlert: (open: boolean) => void;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  rows: GridRowsProp;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  getNombreEstado: (valor: number) => string | undefined;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  setIsAnulation: (isAnulation: boolean) => void;
  enabledAnulation: boolean;
  existDocumentNumber: boolean;
}

export const NotaCreditoButtons = (props: NotaCreditoButtonsProps) => {
  const {
    createMode,
    handleCancel,
    isEditable,
    editMode,
    thereIsChanges,
    setDialogMessage,
    setOpenDialogAlert,
    formState,
    setFormState,
    rows,
    setEditMode,
    setTitle,
    getNombreEstado,
    rowModesModel,
    setRowModesModel,
    setIsAnulation,
    enabledAnulation,
    existDocumentNumber,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle('Nota Credito (Modo Edición) - N° ' + formState.creditNoteId);
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
      rows.forEach((row) => {
        setRowModesModel({
          ...rowModesModel,
          [row.id]: { mode: GridRowModes.View },
        });
      });
      setTitle('Nota Credito (Modo Lectura) - N° ' + formState.creditNoteId);
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
      sx={{ mt: 2 }}
    >
      {!createMode && (
        <>
          <Button
            startIcon={<ExitToApp />}
            sx={{ margin: 2 }}
            onClick={handleCancel}
            style={{ width: '120px' }}
          >
            {'Salir'}
          </Button>
          {isEditable && (
            <Button
              startIcon={<EditNote />}
              sx={{ margin: 2 }}
              onClick={onEditButtonClick}
              style={{ width: '120px' }}
            >
              {!editMode ? 'Editar' : 'Leer'}
            </Button>
          )}
        </>
      )}
      {isEditable && (
        <>
          <Button
            startIcon={<Save />}
            disabled={!thereIsChanges || existDocumentNumber}
            onClick={() => {
              setFormState({
                ...formState,
                stateId: ComprobanteEstadoEnum.GENERADO,
                stateName: getNombreEstado(ComprobanteEstadoEnum.GENERADO),
              });
              setIsAnulation(false);
            }}
            sx={{ margin: 2 }}
            type="submit"
            style={{ width: '120px' }}
          >
            {'Guardar'}
          </Button>
          <Button
            type="button"
            startIcon={<Send />}
            onClick={() => {
              setFormState({
                ...formState,
                stateId: ComprobanteEstadoEnum.CONFIRMADO,
                stateName: getNombreEstado(ComprobanteEstadoEnum.CONFIRMADO),
              });
              setDialogMessage(ParametersEnum.MENSAJE_CONFIRMACION_GENERICO);
              setOpenDialogAlert(true);
              setIsAnulation(false);
            }}
            disabled={!thereIsChanges || existDocumentNumber}
            sx={{ margin: 2 }}
            style={{ width: '120px' }}
          >
            {'Confirmar'}
          </Button>
          {enabledAnulation && (
            <Grid item>
              <Button
                startIcon={<DeleteForever />}
                onClick={() => {
                  setFormState({
                    ...formState,
                    cancellationDate: new Date(),
                    stateId: ComprobanteEstadoEnum.ANULADO,
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
  );
};
