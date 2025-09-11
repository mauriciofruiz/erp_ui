import { FormState } from '@/hooks';
import {
  EditNote,
  ExitToApp,
  Save,
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
  setIsAnulation: (isAnulation: boolean) => void;
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
    formState,
    setEditMode,
    setTitle,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const onEditButtonClick = () => {
    if (!editMode) {
      if (formState.clientStatus) {
        setEditMode(true);
      }else{
        setEditMode(false);
        enqueueSnackbar(
          <>
            {'El cliente este inactivo, no se puede editar'}
            <br />
            {'Habilite el cliente para poder editar'}
          </>,
          {
            variant: 'info',
          }
        );
      }

      setTitle('Cliente (Modo Edición) - N° ' + formState.clientId);
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
      setTitle('Cliente (Modo Lectura) - N° ' + formState.clientId);
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
              <Grid item>
                <div style={{ width: '150px', marginRight: 5 }}>
                  <Button
                    type="submit"
                    startIcon={<Save />}
                    onClick={() => {

                    }}
                    disabled={!thereIsChanges}
                    fullWidth
                  >
                    {'Guardar'}
                  </Button>
                </div>
              </Grid>
            </>
          </>
        )}
      </Grid>
    </Grid>
  );
};
