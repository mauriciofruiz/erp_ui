import React from 'react';
import {
  Button,
  Grid,
} from '@mui/material';
import {
  Check,
  DeleteForever,
  EditNote,
  Error,
  ExitToApp,
  Save,
  Send,
} from '@mui/icons-material';

interface ActionButtonsProps {
  createMode: boolean;
  isEditable: boolean;
  validateAnulado: boolean;
  editMode: boolean;
  isFormValid: boolean;
  isValidDataGrid: boolean;
  isApprovable: boolean;
  requestPurchaseSelected?: any;
  onCancel: () => void;
  onEditButtonClick: () => void;
  onSave: () => void;
  onSend: () => void;
  onAnulate: () => void;
  onDeny: () => void;
  onApprove: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  createMode,
  isEditable,
  validateAnulado,
  editMode,
  isFormValid,
  isValidDataGrid,
  isApprovable,
  requestPurchaseSelected,
  onCancel,
  onEditButtonClick,
  onSave,
  onSend,
  onAnulate,
  onDeny,
  onApprove,
}) => {
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
            onClick={onCancel}
            style={{ width: '120px' }}
          >
            {'Salir'}
          </Button>
          {isEditable && validateAnulado && (
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
      {isEditable && validateAnulado && (
        <>
          <Button
            startIcon={<Save />}
            disabled={!isFormValid || !isValidDataGrid}
            onClick={onSave}
            sx={{ margin: 2 }}
            type="submit"
            style={{ width: '120px' }}
          >
            {'Guardar'}
          </Button>

          <Button
            type="button"
            startIcon={<Send />}
            onClick={onSend}
            disabled={!isFormValid || !isValidDataGrid}
            sx={{ margin: 2 }}
            style={{ width: '120px' }}
          >
            {'Enviar'}
          </Button>
          {!createMode && validateAnulado && (
            <Button
              startIcon={<DeleteForever />}
              onClick={onAnulate}
              sx={{ margin: 2 }}
              type="button"
              style={{ width: '120px' }}
            >
              {'Anular'}
            </Button>
          )}
        </>
      )}
      {isApprovable && validateAnulado && (
        <>
          <Button
            type="submit"
            startIcon={<Error />}
            onClick={onDeny}
            disabled={!isFormValid || !isValidDataGrid}
            sx={{ margin: 2 }}
            style={{ width: '120px' }}
          >
            {'Negar'}
          </Button>

          <Button
            type="submit"
            startIcon={<Check />}
            onClick={onApprove}
            disabled={!isFormValid || !isValidDataGrid}
            sx={{ margin: 2 }}
            style={{ width: '120px' }}
          >
            {'Aprobar'}
          </Button>
        </>
      )}
    </Grid>
  );
};
