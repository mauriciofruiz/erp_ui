import React from 'react';
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
import { Info } from '@mui/icons-material';

interface AnulationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (event: React.FormEvent<HTMLFormElement>) => void;
  onStateChange: (state: number) => void;
  motivo: string | null;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AnulationDialog: React.FC<AnulationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  onStateChange,
  motivo,
  onInputChange,
}) => {
  const handleConfirm = () => {
    onStateChange(5); // RequestPurchaseEnum.ANULADO
    onConfirm();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={onConfirm}>
        <DialogContent>
          <Alert severity="info" icon={<Info />}>
            <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
            Los datos no se podrán restablecer después de anular la solicitud
            de compra. ¿Estás seguro de que deseas proceder?
          </Alert>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <TextField
                name="motivo"
                label="Motivo Anulación"
                value={
                  motivo !== null
                    ? motivo.toUpperCase()
                    : motivo
                }
                onChange={onInputChange}
                InputLabelProps={{
                  shrink:
                    motivo !== null && motivo !== ''
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            onClick={handleConfirm}
            disabled={motivo === null || motivo === ''}
          >
            Confirmar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
