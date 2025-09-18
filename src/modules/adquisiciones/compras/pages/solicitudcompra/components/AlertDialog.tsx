import React from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { Info } from '@mui/icons-material';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (event: React.FormEvent<HTMLFormElement>) => void;
  onStateChange: (state: number) => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onClose,
  onConfirm,
  onStateChange,
}) => {
  const handleConfirm = () => {
    onStateChange(2); // RequestPurchaseEnum.ENVIADO
    onConfirm();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={onConfirm}>
        <DialogContent>
          <Alert severity="warning" icon={<Info />}>
            <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
            Los datos no se podrán modificar después de enviar la solicitud de
            compra. ¿Estás seguro de que deseas proceder?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
