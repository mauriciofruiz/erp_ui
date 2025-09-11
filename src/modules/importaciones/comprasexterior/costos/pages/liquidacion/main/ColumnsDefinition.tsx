import { DocumentTypeEnum, PathEnum } from '@/enums';
import { downloadPdf, formatDateBackEnd, onShare } from '@/functions';
import { useAccessDocument, useLiquidacionAsync } from '@/hooks';
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

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { fetchLiquidacionPdf } = useLiquidacionAsync();

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    if (row) {
      openDocument({
        id: row.liquidationId,
        navigation: () =>
          navigate(PathEnum.LIQUIDACION + PathEnum.VIEW, {
            state: {
              liquidationId: row.liquidationId,
            },
          }),
        documentType: DocumentTypeEnum.LIQUIDACION,
      });
    }
  };

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchLiquidacionPdf(row.liquidationId).then((response) => {
        downloadPdf(response, `liquidacion_${row.liquidationId}.pdf`);
      });
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchLiquidacionPdf(row.liquidationId).then((response) => {
        if (response instanceof Blob && response.size > 0) {
          const files: File[] = [
            new File([response], `liquidacion_${row.liquidationId}.pdf`, {
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
      field: 'liquidationId',
      headerName: 'Nro. Liquidación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'importOpeningCode',
      headerName: 'Partida',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },

    {
      field: 'invoiceNumber',
      headerName: 'Nro. Facturas',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 2,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      type: 'date',
      valueFormatter: (params) => params.value as string,
      renderCell: (params) => {
        return params.value ? formatDateBackEnd(params.value) : '';
      },
    },
    {
      field: 'liquidationStateName',
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
