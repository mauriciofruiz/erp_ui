import { ParametersEnum } from '@/enums';
import { FormState, useCommonDataGrid, useOrdenProduccionAsync } from '@/hooks';
import { Grid } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { useEffect } from 'react';
import { parseDateWithMiliseconds, setCurrencyNumber } from '@/functions';
import { randomId } from '@mui/x-data-grid-generator';
import { CierreOrdenType } from '@/types';

type CierreProduccionDetailsProps = {
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  formState: FormState;
};

export const CierreProduccionDetails: React.FC<
  CierreProduccionDetailsProps
> = ({ rows, setRows, formState }) => {
  const { rowModesModel, processRowUpdate, columns, setColumns } =
    useCommonDataGrid(rows, setRows);

  const { fetchAllOrdersToClose } = useOrdenProduccionAsync();

  useEffect(() => {
    fetchAllOrdersToClose(formState.startDate, formState.endDate).then(
      (response) => {
        const r = response as CierreOrdenType[];
        const newRows = r.map((row) => ({
          ...row,
          id: randomId(),
        }));
        const totalRow = {
          id: ParametersEnum.ID_ROW_TOTAL,
          orderDate: null,
          orderId: '',
          requestId: '',
          orderStatusName: 'Total',
          mpCost: newRows.reduce((acc, row) => acc + row.mpCost, 0),
          moCost: newRows.reduce((acc, row) => acc + row.moCost, 0),
          cifCost: newRows.reduce((acc, row) => acc + row.cifCost, 0),
        };
        setRows([...newRows, totalRow]);
      }
    );
  }, [formState.startDate, formState.endDate]);

  useEffect(() => {
    setColumns([
      {
        field: 'orderDate',
        headerName: 'Fecha Orden',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        flex: 0.7,
        renderCell: (params) => {
          if(params.value === null) return '';
          return parseDateWithMiliseconds(new Date(params.value).toISOString());
        }
      },
      {
        field: 'orderId',
        headerName: 'Nro. Orden',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
      },
      {
        field: 'requestId',
        headerName: 'Nro. Pedido',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
      },
      {
        field: 'orderStatusName',
        headerName: 'Estado',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'mpCost',
        headerName: 'Costo MP',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
        renderCell: (params) => setCurrencyNumber(params.value),
      },
      {
        field: 'moCost',
        headerName: 'Costo MO',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
        renderCell: (params) => setCurrencyNumber(params.value),
      },
      {
        field: 'cifCost',
        headerName: 'Costo CIF',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
        renderCell: (params) => setCurrencyNumber(params.value),
      },
    ]);
  }, [rows.length]);

  return (
    <Grid item xs={12}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        rowModesModel={rowModesModel}
        getRowClassName={(params) =>
          params.id === ParametersEnum.ID_ROW_TOTAL
            ? `super-app-theme--true`
            : 'super-app-theme--null'
        }
        processRowUpdate={processRowUpdate}
        getRowHeight={() => 'auto'}
        columnHeaderHeight={45}
        sx={{ height: rows.length > 0 ? '100%' : 300 }}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        hideFooter
      />
    </Grid>
  );
};
