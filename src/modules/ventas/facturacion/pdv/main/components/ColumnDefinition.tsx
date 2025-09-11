import { ComprobanteTypeEnum, DocumentTypeEnum, PathEnum } from '@/enums';
import { parseDateWithMiliseconds, setCurrencyNumber } from '@/functions';
import { useAccessDocument } from '@/hooks';
import { OpenInNew } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

interface ColumnsProps {
  rows: GridRowsProp;
}

export const ColumnsDefinition = (props: ColumnsProps): GridColDef[] => {
  const { rows } = props;

  const { openDocument } = useAccessDocument();

  const navigate = useNavigate();

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    if (row) {
      openDocument({
        id: row.invoiceId,
        navigation: () => {
          const combinedId = `${row.invoiceId}-${ComprobanteTypeEnum.FACTURA}`;
          navigate(PathEnum.FACTURA_VENTA + PathEnum.VIEW, {
            state: {
              facturaIdOpened: combinedId,
            },
          });
        },
        documentType: DocumentTypeEnum.FACTURA_VENTA,
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'invoiceIssueDate',
      headerName: 'Fecha',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      type: 'date',
      valueFormatter: (params) =>
        parseDateWithMiliseconds(params.value as string),
    },
    {
      field: 'invoiceNumber',
      headerName: 'Nro. Factura',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 100,
      flex: 1.5,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'branchName',
      headerName: 'Sucursal',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'clientName',
      headerName: 'Cliente',
      minWidth: 150,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'baseIvaZero',
      headerName: 'Base 0%',
      minWidth: 70,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'baseIva',
      headerName: 'Base IVA',
      flex: 1,
      minWidth: 70,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'totalTaxes',
      headerName: 'Impuestos',
      flex: 1,
      minWidth: 70,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'total',
      headerName: 'Total',
      flex: 1,
      minWidth: 70,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'retentionValue',
      headerName: 'Retención',
      flex: 1,
      minWidth: 70,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'invoiceStatusName',
      headerName: 'Estado',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Accion',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 0.5,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <Tooltip title="Abrir Factura">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Factura"
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
