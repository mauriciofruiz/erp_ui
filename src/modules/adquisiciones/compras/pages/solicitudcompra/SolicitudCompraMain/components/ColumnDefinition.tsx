import { DocumentTypeEnum, PathEnum } from '@/enums';
import { parseDateWithMiliseconds } from '@/functions';
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
        id: row.requestPurchaseId,
        navigation: () => {
          const combinedId = row.requestPurchaseId;
          navigate(PathEnum.SOLICITUD_COMPRA + PathEnum.VIEW, {
            state: {
              requestId: combinedId,
            },
          });
        },
        documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'requestPurchaseId',
      headerName: 'Nro. Solicitud',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      maxWidth: 90,
      flex: 1.5,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'branchName',
      headerName: 'Sucursal',
      minWidth: 80,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'typeAdquisitionName',
      headerName: 'Tipo',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'dateCreationRequestPurchase',
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
      field: 'nickUser',
      headerName: 'Realizado por',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'nameAdquisitionType',
      headerName: 'CDA Solicitado',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'stateRequestPurchaseName',
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
          <Tooltip title="Abrir Solicitud Compra">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Solicitud Compra"
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
