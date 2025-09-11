import { EstadoOrdenEnum } from '@/enums';
import { FormState } from '@/hooks';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';

interface ToolbarOrdenExteriorProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  createMode: boolean;
  editMode: boolean;
  formState: FormState;
}

export function ToolbarOrdenExterior(props: ToolbarOrdenExteriorProps) {
  const { setRows, setRowModesModel, createMode, editMode, formState } = props;

  const stateId = formState.stateOrderId;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        detailOrderId: null,
        documentCode: '',
        productId: null,
        productCode: '',
        productName: '',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        fodinfaValue: 0,
        advaloremValue: 0,
        status: true
      },
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' },
    }));
  };
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
      <Button
        color="primary"
        startIcon={<Add />}
        onClick={() => handleClick()}
        disabled={
          !(
            (createMode &&
              formState.providerId !== null &&
              formState.providerId !== 0) ||
            (editMode && stateId !== EstadoOrdenEnum.CONFIRMADA)
          )
        }
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1, width: '160px' }}
      >
        Agregar Producto
      </Button>
    </GridToolbarContainer>
  );
}
