import { DocumentTypeEnum, PathEnum } from "@/enums";
import { parseDateWithMiliseconds, setCurrencyNumber } from "@/functions";
import { useAccessDocument } from "@/hooks";
import { OpenInNew } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

interface ColumnDefinition {
  rows: GridRowsProp;
}

export const ColumnDefinition = (props: ColumnDefinition): GridColDef[] => {
  const { rows } = props;

  const { openDocument } = useAccessDocument();

  const navigate = useNavigate();

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    
    if (row) {
      openDocument({
        id: row.depositId,
        navigation: () => {
          const combinedId = `${row.depositId}-${DocumentTypeEnum.DEPOSITO}`;
          navigate(PathEnum.DEPOSITOS + PathEnum.VIEW, {
            state: {
              depostiosIdOpened: combinedId,
            },
          });
        },
        documentType: DocumentTypeEnum.DEPOSITO,
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "issueDate",
      headerName: "Fecha Emision",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      minWidth: 70,
      flex: 1,
      type: "date",
      valueFormatter: (params) =>
        parseDateWithMiliseconds(params.value as string),
    },
    {
      field: "documentNumber",
      headerName: "Nro. Documento",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      minWidth: 70,
      flex: 1,
      cellClassName: "centered-grid",
      align: "center",
    },
    {
      field: "bankName",
      headerName: "Banco",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      minWidth: 70,
      flex: 1.5,
      cellClassName: "centered-grid",
      align: "center",
    },
    {
      field: "amount",
      headerName: "Monto",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      minWidth: 70,
      flex: 1,
      cellClassName: "centered-grid",
      align: "center",
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: "registrationDate",
      headerName: "Fecha Registro",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      align: "center",
      minWidth: 70,
      flex: 1,
      type: "date",
      valueFormatter: (params) =>
        parseDateWithMiliseconds(params.value as string),
    },
    {
      field: "branchName",
      headerName: "Sucursal",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      minWidth: 70,
      flex: 1,
      cellClassName: "centered-grid",
      align: "center",
    },
    {
      field: "observation",
      headerName: "Observacion",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      minWidth: 70,
      flex: 1.5,
      cellClassName: "centered-grid",
      align: "center",
    },
    {
      field: "statusName",
      headerName: "Estado",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      minWidth: 70,
      flex: 1,
      cellClassName: "centered-grid",
      align: "center",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Accion",
      align: "center",
      headerClassName: "super-app-theme--header",
      headerAlign: "center",
      flex: 0.5,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <Tooltip title="Abrir Deposito">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Deposito"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];

  return columns;
};
