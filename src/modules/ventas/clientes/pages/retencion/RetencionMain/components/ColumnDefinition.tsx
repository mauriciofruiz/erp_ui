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
        id: row.retentionId,
        navigation: () => {
          const combinedId = `${row.retentionId}-${ComprobanteTypeEnum.COMPROBANTE_DE_RETENCION}`;
          navigate(PathEnum.RETENCION_CLIENTE + PathEnum.VIEW, {
            state: {
              retencionIdOpened: combinedId,
            },
          });
        },
        documentType: DocumentTypeEnum.RETENCION_VENTA,
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'retentionNumber',
      headerName: 'Nro. Retención',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 100,
      flex: 1.5,
      cellClassName: 'centered-grid',
      align: 'center',
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
      field: 'invoiceDate',
      headerName: 'Fecha Factura',
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
      field: 'clientName',
      headerName: 'Cliente',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 100,
      flex: 1.5,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'ivaValue',
      headerName: 'Ret. IVA',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'sourceValue',
      headerName: 'Ret. Fuente',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'totalValue',
      headerName: 'Total Retención',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'state',
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
          <Tooltip title="Abrir Guia">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Guia"
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
