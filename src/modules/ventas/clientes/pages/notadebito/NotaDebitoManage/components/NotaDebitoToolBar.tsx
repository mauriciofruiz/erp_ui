import { ParametersEnum, TipoDetalleFacturaEnum } from "@/enums";
import { FormState } from "@/hooks";
import { AccountType } from "@/types";
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { GridRowsProp, GridToolbarContainer } from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  createMode: boolean;
  formState: FormState;
  cuentaList: AccountType[];
  rows: GridRowsProp;
}

export function NotaDebitoToolBar(props: EditToolbarProps) {
  const { setRows, createMode, formState, cuentaList } = props;

  const handleClick = () => {
    const id = randomId();

    const cuenta = cuentaList && cuentaList.length > 0 ? cuentaList[0] : null;

    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        detailId: null,
        debitNoteId: formState.debitNoteId,
        productId: null,
        productCode: "",
        providerProductCode: "",
        productName: "",
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
        accountId: cuenta?.accountId ?? "",
        accountName: cuenta?.accountName ?? "",
        accountNumber: cuenta?.accountNumber ?? "",
        invoiceDetailId: null,
        invoiceAccountId: null,
        paymentMethodDiscountPercentage: 0,
      },
    ]);
  };

  return (
    <GridToolbarContainer
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        marginRight: "10px",
      }}>
      {createMode && formState.clientId && formState.invoiceId && (
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleClick()}
          sx={{ mb: 2, mt: 1, marginLeft: "10px", mr: 1, width: "160px" }}>
          Agregar Cuenta
        </Button>
      )}
    </GridToolbarContainer>
  );
}
