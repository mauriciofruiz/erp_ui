import { DocumentTypeEnum, PathEnum } from '@/enums';
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
        id: row.paymentId,
        navigation: () => {
          const combinedId = `${row.paymentId}-${DocumentTypeEnum.PAGO}`;
          navigate(PathEnum.PAGO + PathEnum.VIEW, {
            state: {
              paymentId: combinedId,
            },
          });
        },
        documentType: DocumentTypeEnum.PAGO,
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'paymentId',
      headerName: 'Nro. Pago',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha Registro',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      type: 'date',
      valueFormatter: (params) => {
        return parseDateWithMiliseconds(new Date(params.value).toISOString());
      },
    },
    {
      field: 'accountingDate',
      headerName: 'Fecha Contable',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      type: 'date',
      valueFormatter: (params) => {
        return parseDateWithMiliseconds(new Date(params.value).toISOString());
      },
    },
    {
      field: 'bankName',
      headerName: 'Banco',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 2,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'beneficiaryName',
      headerName: 'Beneficiario',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'paymentAmount',
      headerName: 'Monto',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'documentNumber',
      headerName: 'No. Documento',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'paymentCollectionMethodName',
      headerName: 'Forma de Pago',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'paymentStatusName',
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
          <Tooltip title="Abrir Documento">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Documento"
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
