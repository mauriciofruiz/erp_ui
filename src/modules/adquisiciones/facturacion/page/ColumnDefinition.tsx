import { ComprobanteTypeEnum, DocumentTypeEnum, PathEnum } from '@/enums';
import {
  downloadPdf,
  onShare,
  parseDateWithMiliseconds,
  setCurrencyNumber,
} from '@/functions';
import { useAccessDocument, useFacturaProveedorAsync } from '@/hooks';
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

  const { fetchLiquidacionPdf } = useFacturaProveedorAsync();

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    if (row) {
      openDocument({
        id: row.providerInvoiceId,
        navigation: () =>
          navigate(PathEnum.FACTURA_PROVEEDOR + PathEnum.VIEW, {
            state: {
              facturaId: row.providerInvoiceId,
              voucherTypeCode: row.voucherTypeCode,
            },
          }),
        documentType: DocumentTypeEnum.FACTURA_COMPRA,
      });
    }
  };

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchLiquidacionPdf(row.providerInvoiceId).then((response) => {
        downloadPdf(response, `liquidacion_${row.providerInvoiceId}.pdf`);
      });
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchLiquidacionPdf(row.providerInvoiceId).then((response) => {
        if (response instanceof Blob && response.size > 0) {
          const files: File[] = [
            new File([response], `liquidacion_${row.providerInvoiceId}.pdf`, {
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
      field: 'providerInvoiceNumber',
      headerName: 'Nro. Factura',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1.5,
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
      field: 'providerName',
      headerName: 'Proveedor',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'providerInvoiceIssueDate',
      headerName: 'F. Emisión',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      type: 'date',
      valueFormatter: (params) =>
        parseDateWithMiliseconds(params.value as string),
    },
    {
      field: 'registrationDate',
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
      field: 'baseIvaZero',
      headerName: 'Base 0%',
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
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'providerInvoiceStatusName',
      headerName: 'Estado',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'userName',
      headerName: 'Usuario',
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
        const isLiquidacion =
          rows.find((row) => row.id === id)?.voucherTypeCode ===
          ComprobanteTypeEnum.LIQUIDACION;

        if (isLiquidacion) {
          return [
            <Tooltip title="Abrir Factura">
              <GridActionsCellItem
                icon={<OpenInNew />}
                label="Abrir Apertura Importación"
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
        } else {
          return [
            <Tooltip title="Abrir Factura">
              <GridActionsCellItem
                icon={<OpenInNew />}
                label="Abrir Apertura Importación"
                className="textPrimary"
                onClick={handleEditClick(id)}
                color="inherit"
              />
            </Tooltip>,
          ];
        }
      },
    },
  ];
  return columns;
};
