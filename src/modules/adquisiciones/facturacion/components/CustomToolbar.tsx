import {
  EstadoDocumentoEnum,
  ParametersEnum,
  TipoDetalleFacturaEnum,
} from '@/enums';
import { RetencionType, SucursalType } from '@/types';
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
import { Receipt } from '@mui/icons-material';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  createMode: boolean;
  editMode: boolean;
  formState: any;
  getRetencionesNamesByDetalles: (
    retentionSourceId: number,
    retentionIVAId: number
  ) => RetencionType[];
  initialStateDetalle: any;
  isService: boolean;
  sucursalUser: SucursalType;
  open: boolean;
  setOpen: (open: boolean) => void;
}
export function CustomToolbar(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    createMode,
    editMode,
    formState,
    getRetencionesNamesByDetalles,
    initialStateDetalle,
    sucursalUser,
    open,
    setOpen,
  } = props;

  const stateId = formState.providerInvoiceStatusId;

  const handleClick = (detailType: number) => {
    const id = randomId();
    const newRetentions = formState.isForeign
      ? []
      : getRetencionesNamesByDetalles(
          formState.retentionSourceId,
          formState.retentionIVAId
        );
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        ...initialStateDetalle,
        branchId: sucursalUser.branchId,
        branchName: sucursalUser.name,
        providerId: formState.providerId,
        retentions: newRetentions,
        detailTypeId: detailType,
        status: true,
        taxRateId: formState.isForeign
          ? ParametersEnum.TAX_RATE_ID_ZERO
          : ParametersEnum.TAX_RATE_ID_DEFAULT,
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
        startIcon={<AddIcon />}
        onClick={() => handleClick(TipoDetalleFacturaEnum.SERVICIOS)}
        disabled={
          !(
            (createMode && formState.providerId !== null) ||
            (editMode && stateId !== EstadoDocumentoEnum.CONFIRMADO)
          )
        }
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1, width: '160px' }}
      >
        Agregar Servicio
      </Button>
      <Button
        color="primary"
        startIcon={<Receipt />}
        onClick={() => setOpen(true)}
        disabled={
          open ||
          !(
            (createMode && formState.providerId !== null) ||
            (editMode && stateId !== EstadoDocumentoEnum.CONFIRMADO)
          )
        }
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1, width: '160px' }}
      >
        Reembolso
      </Button>
    </GridToolbarContainer>
  );
}
