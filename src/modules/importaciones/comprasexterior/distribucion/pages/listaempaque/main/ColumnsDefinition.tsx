import { DocumentTypeEnum, PathEnum } from '@/enums';
import { downloadPdf, onShare } from '@/functions';
import { useAccessDocument, useListaEmpaqueAsync } from '@/hooks';
import { Download, OpenInNew, Share } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

interface ColumnsProps {
  rows: GridRowsProp;
}

export const ColumnsDefinition = (props: ColumnsProps): GridColDef[] => {
  const { rows } = props;

  const { openDocument } = useAccessDocument();

  const { fetchDownloadPdf } = useListaEmpaqueAsync();

  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    if (row) {
      openDocument({
        id: row.packingListId,
        navigation: () =>
          navigate(PathEnum.LISTA_EMPAQUE + PathEnum.VIEW, {
            state: {
              packingListId: row.packingListId,
            },
          }),
        documentType: DocumentTypeEnum.LISTA_EMPAQUE,
      });
    }
  };

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchDownloadPdf(row.packingListId).then((response) => {
        downloadPdf(response, `LE #${row.packingListId} General.pdf`);
      });
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchDownloadPdf(row.packingListId).then((response) => {
        if (response instanceof Blob && response.size > 0) {
          const files: File[] = [
            new File([response], `LE #${row.packingListId} General.pdf`, {
              type: 'application/pdf',
            }),
          ];
          onShare(files);
        } else {
          enqueueSnackbar('No se pudo compartir el documento', {
            variant: 'error',
          });
        }
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'packingListId',
      headerName: 'Nro. Lista Empaque',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'providerName',
      headerName: 'Proveedor',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },

    {
      field: 'importCode',
      headerName: 'Importación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'departureDate',
      headerName: 'F. Salida',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      type: 'date',
      valueFormatter: (params) => params.value as string,
    },
    {
      field: 'arrivalDate',
      headerName: 'F. Llegada',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      type: 'date',
      valueFormatter: (params) => params.value as string,
    },
    {
      field: 'packingListStateName',
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
      flex: 1,
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
          <Tooltip title="Descargar Documento">
            <GridActionsCellItem
              icon={<Download />}
              label="Descargar Documento"
              className="textPrimary"
              onClick={handleDownloadClick(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Compartir Documento">
            <GridActionsCellItem
              icon={<Share />}
              label="Compartir Documento"
              className="textPrimary"
              onClick={handleShareClick(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];
  return columns;
};
