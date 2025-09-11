import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  downloadPdf,
  parseDateWithMiliseconds,
  setCurrencyNumber,
} from '@/functions';
import { useAccessDocument, useCierreCajaAsync } from '@/hooks';
import { Download, OpenInNew } from '@mui/icons-material';
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

  const { fetchCierreCajaPdf } = useCierreCajaAsync();

  const navigate = useNavigate();

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    if (row) {
      openDocument({
        id: row.closingCashId,
        navigation: () =>
          navigate(PathEnum.CIERRE_CAJA + PathEnum.VIEW, {
            state: {
              closingCashId: row.closingCashId,
            },
          }),
        documentType: DocumentTypeEnum.CAJA,
      });
    }
  };

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchCierreCajaPdf(row.closingCashId).then((response) => {
        downloadPdf(response, `arqueo_caja_${row.closingCashId}.pdf`);
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'closingCashId',
      headerName: 'Nro. Cierre',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 80,
      flex: 0.8,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'user',
      headerName: 'Usuario',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'branch',
      headerName: 'Sucursal',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'createDate',
      headerName: 'Fecha Apertura',
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
      field: 'closingDate',
      headerName: 'Fecha Cierre',
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
      field: 'closingTotal',
      headerName: 'Total Cierre',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'closingStatus',
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
          <Tooltip title="Abrir Cierre">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Cierre"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Descargar Arqueo">
            <GridActionsCellItem
              icon={<Download />}
              label="Descargar Arqueo"
              className="textPrimary"
              onClick={handleDownloadClick(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];
  return columns;
};
