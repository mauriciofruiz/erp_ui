import { ParametersEnum, TipoDetalleFacturaEnum } from '@/enums';
import { AccountType, FacturaProveedorResponseInterface } from '@/types';
import {
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import {
  GridRowsProp,
  GridToolbarColumnsButton,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { FormState } from '@/hooks';
import { useEffect, useState } from 'react';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  rows: GridRowsProp;
  createMode: boolean;
  formState: FormState;
  cuentaGastosList: AccountType[];
  invoiceSelected: FacturaProveedorResponseInterface | null;
}

export function CustomToolbarNotaCredito(props: EditToolbarProps) {
  const {
    setRows,
    createMode,
    formState,
    rows,
    cuentaGastosList,
    invoiceSelected,
  } = props;

  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (!rows) return;
    setIsEmpty(rows.length === 0);
  }, [rows]);

  const handleClick = () => {
    const id = randomId();

    const cuentaGastos =
      cuentaGastosList && cuentaGastosList.length > 0
        ? cuentaGastosList[0]
        : null;

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
        branchId: invoiceSelected?.branchId,
        detailTypeId: TipoDetalleFacturaEnum.SERVICIOS, // 1: inventario, 2: servicio // usar enum TipoDetalleFacturaEnu,
        projectId: null,
        importOpeningId: null,
        groupId: null,
        providerId: invoiceSelected?.providerId,
        clientId: null,
        cashId: null,
        employeeId: null,
        accountId: cuentaGastos?.accountId ?? null,
        accountName: `${cuentaGastos?.accountNumber} - ${cuentaGastos?.accountName}`,
        invoiceDetailId: null,
        invoiceAccountId: null,
        valueNC: 0,
        invoiceTotalPrice:
          (invoiceSelected?.providerInvoiceVAT2 ?? 0) +
          (invoiceSelected?.providerInvoiceSubtotal ?? 0),
        totalCost: 0,
      },
    ]);
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
      {createMode && isEmpty && (
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
