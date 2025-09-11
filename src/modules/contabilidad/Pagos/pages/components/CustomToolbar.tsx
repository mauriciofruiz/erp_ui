import {
  AccountEnum,
  EstadoPagoEnum,
} from '@/enums';
import { SucursalType } from '@/types';
import {
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarColumnsButton,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  createMode: boolean;
  editMode: boolean;
  formState: any;
  initialStateDetalle: any;
  isService: boolean;
  sucursalUser: SucursalType;
}
export function CustomToolbar(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    createMode,
    editMode,
    formState,
    initialStateDetalle,
  } = props;

  const stateId = formState.paymentStatusId;

  const handleClick = () => {
    const id = randomId();    
    if (formState.isAdvancePayment) {
      if(formState.provider.isForeign) {
        setRows((oldRows) => [
          ...oldRows,
          {
            id,
            ...initialStateDetalle,
            accountName: AccountEnum.ANTICIPO_PROVEEDORES_EXTERIOR.name,
            accountId: AccountEnum.ANTICIPO_PROVEEDORES_EXTERIOR.id,
            accountNumber: AccountEnum.ANTICIPO_PROVEEDORES_EXTERIOR.number,
            accountTypeId: AccountEnum.ANTICIPO_PROVEEDORES_EXTERIOR.typeId,
            accountTypeName: AccountEnum.ANTICIPO_PROVEEDORES_EXTERIOR.typeName,
            providerId: formState.providerId,
            providerName: formState.providerName,
            branchId: formState.branchId,
            branchName: formState.branchName,
          },
        ]);
      } else {
        setRows((oldRows) => [
          ...oldRows,
          {
            id,
            ...initialStateDetalle,
            accountName: AccountEnum.ANTICIPO_PROVEEDORES_NACIONALES_NO_RELACIONADOS.name,
            accountId: AccountEnum.ANTICIPO_PROVEEDORES_NACIONALES_NO_RELACIONADOS.id,
            accountNumber: AccountEnum.ANTICIPO_PROVEEDORES_NACIONALES_NO_RELACIONADOS.number,
            accountTypeId: AccountEnum.ANTICIPO_PROVEEDORES_NACIONALES_NO_RELACIONADOS.typeId,
            accountTypeName: AccountEnum.ANTICIPO_PROVEEDORES_NACIONALES_NO_RELACIONADOS.typeName,
            providerId: formState.providerId,
            providerName: formState.providerName,
            branchId: formState.branchId,
            branchName: formState.branchName,
          },
        ]);
      }
    } else {
      setRows((oldRows) => [
        ...oldRows,
        {
          id,
          ...initialStateDetalle,
          providerId: formState.providerId,
          providerName: formState.providerName,
          branchId: formState.branchId,
          branchName: formState.branchName,
        },
      ]);
    }
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'accountName' },
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
        startIcon={<AddIcon />}
        onClick={() => handleClick()}
        disabled={
          !(
            (createMode) ||
            (editMode && stateId !== EstadoPagoEnum.CONFIRMADO)
          )
        }
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1, width: '160px' }}
      >
        Agregar
      </Button>
    </GridToolbarContainer>
  );
}
