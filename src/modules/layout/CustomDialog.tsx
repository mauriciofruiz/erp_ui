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
import { Dispatch, SetStateAction } from 'react';

interface CustomDialogProps {
  fieldName: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onDialogConfirm: (event: React.FormEvent<HTMLFormElement>) => void;
  dialogMessage: string;
  isAnulation: boolean;
  motivo: string | null;
  onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  stateIdFieldName?: string;
  setFormState?: Dispatch<SetStateAction<FormState>>;
  prevStateId?: number;
}

export const CustomDialog = (props: CustomDialogProps) => {
  const {
    fieldName,
    open,
    setOpen,
    onDialogConfirm,
    dialogMessage,
    isAnulation,
    motivo,
    onInputChange,
    stateIdFieldName,
    setFormState,
    prevStateId,
  } = props;

  const handleCancel = (
    prevStateId?: number,
    fieldName?: string,
    setFormState?: React.Dispatch<React.SetStateAction<FormState>>
  ) => {
    setOpen(false);
    if (!prevStateId || !fieldName || !setFormState) return;
    setFormState((prevState) => ({
      ...prevState,
      [fieldName]: prevStateId,
    }));
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <form onSubmit={onDialogConfirm}>
        <DialogContent>
          <Alert severity="warning" icon={<Info />}>
            <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
            {dialogMessage}
          </Alert>
          {isAnulation && (
            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  name={fieldName}
                  label="Motivo Anulación"
                  value={motivo}
                  onChange={onInputChange}
                  InputLabelProps={{
                    shrink: motivo !== null && motivo !== '' ? true : false,
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={() =>
              handleCancel(prevStateId, stateIdFieldName, setFormState)
            }
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            disabled={
              isAnulation
                ? motivo === null || motivo === ''
                  ? true
                  : false
                : false
            }
          >
            Confirmar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
