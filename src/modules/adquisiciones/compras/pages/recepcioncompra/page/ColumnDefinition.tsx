import { DocumentTypeEnum, PathEnum } from '@/enums';
import { downloadPdf, onShare, parseDateWithMiliseconds } from '@/functions';
import { useAccessDocument, useRecepcionProveedorAsync } from '@/hooks';
import { Download, OpenInNew, Share } from '@mui/icons-material';
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

  const { fetchDownloadPdf } = useRecepcionProveedorAsync();

  const navigate = useNavigate();

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    if (row) {
      openDocument({
        id: row.receptionPurchaseId,
        navigation: () =>
          navigate(PathEnum.RECEPCION_COMPRA + PathEnum.VIEW, {
            state: {
              receptionId: row.receptionPurchaseId,
            },
          }),
        documentType: DocumentTypeEnum.RECEPCION_COMPRA,
      });
    }
  };

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchDownloadPdf(row.receptionPurchaseId).then((response) => {
        downloadPdf(
          response,
          `RC #${row.receptionPurchaseId} - ${row.personName}.pdf`
        );
      });
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchDownloadPdf(row.receptionPurchaseId).then((response) => {
        if (response instanceof Blob) {
          const files: File[] = [
            new File(
              [response],
              `RC #${row.receptionPurchaseId} - ${row.personName}.pdf`,
              {
                type: 'application/pdf',
              }
            ),
          ];
          onShare(files);
        }
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'receptionPurchaseId',
      headerName: 'Nro. Recepción',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'personName',
      headerName: 'Proveedor',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'invoiceNumber',
      headerName: 'Nro. Factura',
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
      field: 'receptionDate',
      headerName: 'F. Recepción',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      type: 'date',
      valueFormatter: (params) =>
        parseDateWithMiliseconds(params.value as string),
    },
    {
      field: 'receptionStateName',
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
