import { parseDateWithMiliseconds, setCurrencyNumber } from '@/functions';
import { GridColDef } from '@mui/x-data-grid';

// interface ColumnsProps {
//   rows: GridRowsProp;
// }

export const ColumnsDefinition = (): // props: ColumnsProps
GridColDef[] => {
  // const { rows } = props;

  // const handleEditClick = (id: GridRowId) => () => {
  //   const row = rows.find((row) => row.id === id);

  //   if (row && row.asientoId) {
  //     // Solo abrir el enlace del asiento contable con el entryId
  //     window.open(`/contabilidad/asiento/view/${row.asientoId}`, '_blank');
  //   }
  // };

  const columns: GridColDef[] = [
    {
      field: 'depositId',
      headerName: 'Nro. Deposito',
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
      field: 'documentNumber',
      headerName: 'N° Documento',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'bankName',
      headerName: 'Banco',
      minWidth: 90,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'amount',
      headerName: 'Monto',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha Registro',
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
      field: 'statusName',
      headerName: 'Estado',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      cellClassName: 'centered-grid',
      align: 'center',
    },
    // {
    //   field: 'actions',
    //   type: 'actions',
    //   headerName: 'Accion',
    //   align: 'center',
    //   headerClassName: 'super-app-theme--header',
    //   headerAlign: 'center',
    //   flex: 0.5,
    //   cellClassName: 'actions',
    //   getActions: ({ id }) => {
    //     return [
    //       <Tooltip title="Abrir deposito">
    //         <GridActionsCellItem
    //           icon={<OpenInNew />}
    //           label=""
    //           className="textPrimary"

    //           color="inherit"
    //         />
    //       </Tooltip>,
    //     ];
    //   },
    // },
  ];
  return columns;
};
