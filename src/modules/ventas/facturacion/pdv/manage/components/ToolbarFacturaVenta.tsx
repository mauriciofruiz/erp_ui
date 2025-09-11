import { EstadoDocumentoEnum } from '@/enums';
import {
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { Button, IconButton } from '@mui/material';
import { FormState, PopupBody } from '@/hooks';
import React from 'react';
import { Help } from '@mui/icons-material';
import { Unstable_Popup as BasePopup } from '@mui/base/Unstable_Popup';

interface EditToolbarProps {
  createMode: boolean;
  editMode: boolean;
  formState: FormState;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  addNewRow: () => void;
}
export function ToolbarFacturaVenta(props: EditToolbarProps) {
  const { createMode, editMode, formState, addButtonRef, addNewRow } = props;

  const stateId = formState.invoiceStatusId;

  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  const handlePopUp = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchor ? null : event.currentTarget);
  };

  const open = Boolean(anchor);
  const id = open ? 'simple-popper' : undefined;

  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: '10px',
      }}
    >
      <GridToolbarColumnsButton
        sx={{
          mb: 2,
          mt: 1,
          marginLeft: '10px',
          mr: 1,
          width: '100px',
          backgroundColor: 'transparent',
        }}
      />
      <GridToolbarFilterButton
        sx={{
          mb: 2,
          mt: 1,
          marginLeft: '10px',
          mr: 1,
          width: '100px',
          backgroundColor: 'transparent',
        }}
      />
      <GridToolbarDensitySelector
        sx={{
          mb: 2,
          mt: 1,
          marginLeft: '10px',
          mr: 1,
          width: '100px',
          backgroundColor: 'transparent',
        }}
      />
      <GridToolbarExport
        sx={{
          mb: 2,
          mt: 1,
          marginLeft: '10px',
          mr: 1,
          width: '100px',
          backgroundColor: 'transparent',
        }}
      />
      <div style={{ marginBottom: '0.5%' }}>
        <IconButton aria-describedby={id} color="primary" onClick={handlePopUp}>
          <Help />
        </IconButton>
        <BasePopup id={id} open={open} anchor={anchor}>
          <PopupBody>
            <p>
              * Presione <kbd className="menu">Ctrl</kbd> +{' '}
              <kbd className="menu">Enter</kbd> en cualquier caja de texto para
              agregar una nueva fila.
            </p>
            <p>
              * Presione <kbd className="menu">Enter</kbd> para guardar el
              producto seleccionado
            </p>
            <p>
              * Presione <kbd className="menu">Ctrl</kbd> +{' '}
              <kbd className="menu">Shift</kbd> +{' '}
              <kbd className="menu">Enter</kbd> + en cualquier caja de texto
              para grabar TODOS los valores de los productos y calcular los
              totales.
            </p>
            <p>
              * IMPORTANTE: Antes o después de cualquier acción presionar{' '}
              <kbd className="menu">Shift</kbd> en caso de que el comando no se
              ejecute
            </p>
          </PopupBody>
        </BasePopup>
      </div>
      <Button
        ref={addButtonRef}
        color="primary"
        startIcon={<AddIcon />}
        onClick={addNewRow}
        disabled={
          !(
            (createMode && formState.clientId && formState.clientId !== null) ||
            (editMode && stateId !== EstadoDocumentoEnum.CONFIRMADO)
          )
        }
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1, width: '160px' }}
      >
        Agregar Producto
      </Button>
    </GridToolbarContainer>
  );
}
