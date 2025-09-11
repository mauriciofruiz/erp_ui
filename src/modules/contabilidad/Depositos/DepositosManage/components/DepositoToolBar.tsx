import { FormState } from "@/hooks";
import { AccountType } from "@/types";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { GridRowsProp, GridToolbarContainer } from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { TipoDepositoEnum } from "@/enums/TipoDepositoEnum";

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  createMode: boolean;
  formState: FormState;
  cuentaList: AccountType[];
  rows: GridRowsProp;
  onGenericChange: (value: any, name: string) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

export function DepositoToolBar(props: EditToolbarProps) {
  const {
    setRows,
    createMode,
    formState,
    cuentaList,
  } = props;

  const handleClick = () => {
    const id = randomId();

    const cuenta = cuentaList && cuentaList.length > 0 ? cuentaList[0] : null;

    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        detailId: null,
        depositId: formState.depositId,
        accountId: cuenta?.accountId ?? "",
        accountName: cuenta?.accountName ?? "",
        accountNumber: cuenta?.accountNumber ?? "",
        depositAmount: 0,
        depositDate: new Date(),
        depositNumber: "",
        projectId: null,
        importOpeningId: null,
        providerId: null,
        clientId: null,
        cashId: null,
        employeeId: null,
      },
    ]);
  };

  return (
    <>
      {formState.depositTypeId === TipoDepositoEnum.CONTABLE && (
        <GridToolbarContainer
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginRight: "10px",
          }}>
          {createMode && (
            <Button
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleClick()}
              sx={{ mb: 2, mt: 1, marginLeft: "10px", mr: 1, width: "160px" }}>
              Agregar Cuenta
            </Button>
          )}
        </GridToolbarContainer>
      )}
    </>
  );
}
