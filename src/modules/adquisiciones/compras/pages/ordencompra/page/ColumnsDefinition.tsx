import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  downloadPdf,
  onShare,
  parseDateWithMiliseconds,
  setCurrencyNumber,
} from '@/functions';
import { useAccessDocument, useOrdenCompraAsync } from '@/hooks';
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
  isForeign: boolean;
}

export const ColumnsDefinition = (props: ColumnsProps): GridColDef[] => {
  const { rows, isForeign } = props;

  const { openDocument } = useAccessDocument();

  const { fetchDownloadPdf, fetchDownloadExteriorPdf } = useOrdenCompraAsync();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    const path = isForeign
      ? PathEnum.ORDEN_COMPRA_EXTERIOR
      : PathEnum.ORDEN_COMPRA;

    if (row) {
      openDocument({
        id: row.purchaseOrderId,
        navigation: () => {
          const combinedId = `${row.purchaseOrderId}-${DocumentTypeEnum.ORDEN_COMPRA}`;
          navigate(path + PathEnum.VIEW, {
            state: {
              orderId: combinedId,
            },
          });
        },
        documentType: DocumentTypeEnum.ORDEN_COMPRA,
      });
    }
  };

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    if (row) {
      if (isForeign) {
        fetchDownloadExteriorPdf(row.purchaseOrderId).then((response) => {
          downloadPdf(
            response,
            `OC #${row.purchaseOrderId} Prov_${row.providerName}.pdf`
          );
        });
      } else {
        fetchDownloadPdf(row.purchaseOrderId).then((response) => {
          downloadPdf(
            response,
            `OC #${row.purchaseOrderId} Prov_${row.providerName}.pdf`
          );
        });
      }
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      if (isForeign) {
        fetchDownloadExteriorPdf(row.purchaseOrderId).then((response) => {
          if (response instanceof Blob && response.size > 0) {
            const files: File[] = [
              new File(
                [response],
                `OC #${row.purchaseOrderId} Prov_${row.providerName}.pdf`,
                {
                  type: 'application/pdf',
                }
              ),
            ];
            onShare(files);
          } else {
            enqueueSnackbar('No se pudo compartir el documento', {
              variant: 'error',
            });
          }
        });
      } else {
        fetchDownloadPdf(row.purchaseOrderId).then((response) => {
          if (response instanceof Blob && response.size > 0) {
            const files: File[] = [
              new File(
                [response],
                `OC #${row.purchaseOrderId} Prov_${row.providerName}.pdf`,
                {
                  type: 'application/pdf',
                }
              ),
            ];
            onShare(files);
          } else {
            enqueueSnackbar('No se pudo compartir el documento', {
              variant: 'error',
            });
          }
        });
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'purchaseOrderId',
      headerName: 'Nro. Orden',
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
      field: 'branchName',
      headerName: 'Sucursal',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'creationDate',
      headerName: 'F. Creación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      type: 'date',
      valueFormatter: (params) =>
        parseDateWithMiliseconds(params.value as string),
    },
    {
      field: 'totalValue',
      headerName: 'Valor Total',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'importOpeningCode',
      headerName: 'Importación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'stateOrder',
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
