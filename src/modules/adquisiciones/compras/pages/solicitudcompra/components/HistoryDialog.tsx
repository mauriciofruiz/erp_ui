import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { StyledDatePicker } from '@/hooks';
import { useStyles } from '@/hooks';

interface HistoryDialogProps {
  open: boolean;
  onClose: () => void;
  formState: any;
}

export const HistoryDialog: React.FC<HistoryDialogProps> = ({
  open,
  onClose,
  formState,
}) => {
  const styles = useStyles();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        style={{
          cursor: 'move',
          textAlign: 'center',
        }}
        id="draggable-dialog-title"
        sx={{ mt: 2 }}
      >
        Historial
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Grid item xs={4}>
            <TextField
              name="usuarioEnvia"
              label="Usuario Creación"
              value={
                formState.usuarioEnvia === null ? '' : formState.usuarioEnvia
              }
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                shrink: formState.usuarioEnvia !== null ? true : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="usuarioAprueba"
              label="Usuario Aprueba"
              value={
                formState.usuarioAprueba === null
                  ? ''
                  : formState.usuarioAprueba
              }
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                shrink: formState.usuarioAprueba !== null ? true : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="usuarioAnula"
              label="Usuario Anula"
              value={
                formState.usuarioAnula === null ? '' : formState.usuarioAnula
              }
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                shrink: formState.usuarioAnula !== null ? true : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <StyledDatePicker
              label="Fecha Solicitud"
              disableOpenPicker
              readOnly
              format="dd/MM/yyyy"
              value={formState.fechaSolicitud}
              slotProps={{
                textField: {
                  className: styles.genericFieldStyle,
                  sx: {
                    minWidth: '100%',
                  },
                  InputProps: {
                    className: styles.textWhiteStyle,
                  },
                  InputLabelProps: {
                    className: styles.textGreenStyle,
                    shrink: true,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <StyledDatePicker
              label="Fecha Aprobación"
              disableOpenPicker
              readOnly
              format="dd/MM/yyyy"
              value={formState.fechaAprobacion}
              slotProps={{
                textField: {
                  required: false,
                  className: styles.genericFieldStyle,
                  sx: {
                    minWidth: '100%',
                  },
                  InputProps: {
                    className: styles.textWhiteStyle,
                  },
                  InputLabelProps: {
                    className: styles.textGreenStyle,
                    shrink: true,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <StyledDatePicker
              label="Fecha Modificación"
              disableOpenPicker
              readOnly
              format="dd/MM/yyyy"
              value={formState.fechaModificacion}
              slotProps={{
                textField: {
                  className: styles.genericFieldStyle,
                  sx: {
                    minWidth: '100%',
                  },
                  InputProps: {
                    className: styles.textWhiteStyle,
                  },
                  InputLabelProps: {
                    className: styles.textGreenStyle,
                    shrink: true,
                  },
                },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
