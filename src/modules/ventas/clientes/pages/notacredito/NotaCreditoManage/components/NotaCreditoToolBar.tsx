import {
  ParametersEnum,
  TipoDetalleFacturaEnum,
  TipoNotaCreditoEnum,
} from '@/enums';
import { AccountType } from '@/types';
import { GridRowsProp, GridToolbarContainer } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { FormState } from '@/hooks';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  createMode: boolean;
  formState: FormState;
  cuentaList: AccountType[];
  rows: GridRowsProp;
}

export function NotaCreditoToolBar(props: EditToolbarProps) {
  const { setRows, createMode, formState, cuentaList } = props;

  const isNotDevolution = formState.ncTypeId !== TipoNotaCreditoEnum.DEVOLUCION;

  const isAccountant = formState.ncTypeId === TipoNotaCreditoEnum.CONTABLE;

  const thereIsInvoice = formState.invoiceId !== null;

  const handleClick = () => {
    const id = randomId();

    const cuenta = cuentaList && cuentaList.length > 0 ? cuentaList[0] : null;

    if (isAccountant) {
      setRows((oldRows) => [
        ...oldRows,
        {
          id,
          detailId: null,
          creditNoteId: formState.creditNoteId,
          productId: null,
          productCode: '',
          providerProductCode: '',
          productName: '',
          quantity: 1,
          unitPrice: 1,
          returnedQuantity: 1,
          hasIva: false,
          taxRateId: ParametersEnum.TAX_RATE_ID_ZERO,
          taxValue: 0,
          totalPrice: 1,
          branchId: formState.branchId,
          detailTypeId: TipoDetalleFacturaEnum.SERVICIOS, // 1: inventario, 2: servicio // usar enum TipoDetalleFacturaEnu,
          projectId: null,
          importOpeningId: null,
          groupId: null,
          providerId: null,
          clientId: null,
          cashId: null,
          employeeId: null,
          accountId: cuenta?.accountId ?? '',
          accountName: cuenta?.accountName ?? '',
          accountNumber: cuenta?.accountNumber ?? '',
          invoiceDetailId: null,
          invoiceAccountId: null,
          paymentMethodDiscountPercentage: 0,
        },
      ]);
    } else {
      setRows((oldRows) => [
        ...oldRows,
        {
          id,
          detailId: null,
          creditNoteId: formState.creditNoteId,
          productId: null,
          productCode: '',
          providerProductCode: '',
          productName: '',
          availableQuantity: 1,
          quantity: 1,
          unitPrice: 1,
          returnedQuantity: 1,
          hasIva: true,
          taxRateId: ParametersEnum.TAX_RATE_ID_DEFAULT, // un valor de la tabla tarifa iva en la bdd, revisar correcto uso en factura proveedo,
          taxValue: 0,
          totalPrice: 1,
          branchId: formState.branchId,
          detailTypeId: TipoDetalleFacturaEnum.SERVICIOS, // 1: inventario, 2: servicio // usar enum TipoDetalleFacturaEnu,
          projectId: null,
          importOpeningId: null,
          groupId: null,
          providerId: null,
          clientId: null,
          cashId: null,
          employeeId: null,
          accountId: cuenta?.accountId ?? null,
          accountName: `${cuenta?.accountNumber} - ${cuenta?.accountName}` ?? '',
          invoiceDetailId: null,
          invoiceAccountId: null,
        },
      ]);
    }
    
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
      {/* <GridToolbarColumnsButton
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
      /> */}
      {createMode && thereIsInvoice && isNotDevolution && (
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleClick()}
          sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1, width: '160px' }}
        >
          Agregar Cuenta
        </Button>
      )}
    </GridToolbarContainer>
  );
}
