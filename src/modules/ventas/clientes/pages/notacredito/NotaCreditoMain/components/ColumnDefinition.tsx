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
        id: row.documentId,
        navigation: () => {
          const combinedId = `${row.documentId}-${ComprobanteTypeEnum.NOTA_DE_CREDITO}`;
          navigate(PathEnum.NOTA_CREDITO_CLIENTE + PathEnum.VIEW, {
            state: {
              ncClienteIdOpened: combinedId,
            },
          });
        },
        documentType: DocumentTypeEnum.NOTA_CREDITO_VENTA,
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'issueDate',
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
      field: 'documentNumber',
      headerName: 'Nro. NC',
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
      field: 'clientName',
      headerName: 'Cliente',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'value',
      headerName: 'Valor',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'ncTypeId',
      headerName: 'Tipo NC',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'documentStatus',
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
