import { PathEnum } from '@/enums';
import {
  downloadPdf,
  parseDateWithMiliseconds,
  setCurrencyNumber,
} from '@/functions';
import { useEgresoCajaAsync } from '@/hooks';
import { Download, OpenInNew } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from '@mui/x-data-grid';

interface ColumnsProps {
  rows: GridRowsProp;
}

export const ColumnsDefinition = (props: ColumnsProps): GridColDef[] => {
  const { rows } = props;

  const { fetchEgresoPdf } = useEgresoCajaAsync();

  const handleEditClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    if (row && row.asientoId) {
      // Solo abrir el enlace del asiento contable con el entryId
      window.open(
        `${PathEnum.ASIENTO_EXTERNAL_VIEW}${row.asientoId}`,
        '_blank'
      );
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'flowOutId',
      headerName: 'Nro. Egreso',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 80,
      flex: 0.8,
      cellClassName: 'centered-grid',
      align: 'center',
    },
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
      field: 'cashName',
      headerName: 'Caja',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'branchName',
      headerName: 'Sucursal',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'userName',
      headerName: 'Usuario',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'typeFlowOutName',
      headerName: 'Tipo de Egreso',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'amount',
      headerName: 'Valor',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'description',
      headerName: 'Observacion',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },

    {
      field: 'flowOutStateName',
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
        const idEgreso = rows.find((row) => row.id === id)?.flowOutId;
        return [
          <Tooltip title="Abrir Asiento">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Asiento"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Descargar Egreso">
            <GridActionsCellItem
              icon={<Download />}
              label="Descargar Egreso"
              className="textPrimary"
              onClick={() => {
                fetchEgresoPdf(idEgreso).then((response) => {
                  downloadPdf(response, `egreso_${idEgreso}.pdf`);
                });
              }}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];
  return columns;
};
