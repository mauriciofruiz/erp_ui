import { ParametersEnum } from '@/enums';
import { FormState, useCommonDataGrid } from '@/hooks';
import { Grid } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

export type DetalleManageProveedorProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

export const DetalleManageProveedor: React.FC<DetalleManageProveedorProps> = ({
  formState,
  createMode,
  editMode,
  rows,
  setRows,
}) => {
  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    columns,
    setColumns,
  } = useCommonDataGrid(rows, setRows);

  useEffect(() => {
    setColumns([
      {
        field: 'invoiceNumber',
        headerName: 'Nro de Factura',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        cellClassName: 'centered-grid',
        flex: 1,
      },
      {
        field: 'issueDateInvoice',
        headerName: 'Fecha Emisión',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        cellClassName: 'centered-grid',
        type: 'number',
        editable: createMode || editMode,
        flex: 1,
      },
      {
        field: 'dueDateInvoice',
        headerName: 'Fecha Vencimiento',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        cellClassName: 'centered-grid',
        type: 'number',
        editable: createMode || editMode,
        flex: 1,
      },
      {
        field: 'daysCredit',
        headerName: 'Días Crédito',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        cellClassName: 'centered-grid',
        type: 'number',
        editable: createMode || editMode,
        flex: 1,
      },
      {
        field: 'daysLate',
        headerName: 'Días Mora',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        cellClassName: 'centered-grid',
        type: 'number',
        editable: createMode || editMode,
        flex: 1,
      },
      {
        field: 'invoiceValue',
        headerName: 'Valor Factura',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        cellClassName: 'centered-grid',
        type: 'number',
        editable: createMode || editMode,
        flex: 1,
      },
      {
        field: 'quotaValue',
        headerName: 'Valor Cuota',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        cellClassName: 'centered-grid',
        type: 'number',
        editable: createMode || editMode,
        flex: 1,
      },
      {
        field: 'balanceFee',
        headerName: 'Saldo Cuota',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        cellClassName: 'centered-grid',
        type: 'number',
        editable: createMode || editMode,
        flex: 1,
      },
    ]);
  }, [rows.length]);

  useEffect(() => {
    if (Array.isArray(rows) && rows.length > 0) {
      const rowsNoTotal = rows.filter(
        (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
      );
      if (rowsNoTotal.length > 0) {
        const totalInvoiceValue = rowsNoTotal
          .map((row) => row.invoiceValue)
          .reduce((a, b) => a + b, 0);
        const totalQuotaValue = rowsNoTotal
          .map((row) => row.quotaValue)
          .reduce((a, b) => a + b, 0);
        const totalBalanceFee = rowsNoTotal
          .map((row) => row.balanceFee)
          .reduce((a, b) => a + b, 0);

        const totalRow = {
          id: ParametersEnum.ID_ROW_TOTAL,
          daysLate: 'TOTAL',
          invoiceValue: totalInvoiceValue,
          quotaValue: totalQuotaValue,
          balanceFee: totalBalanceFee,
        };
        setRows([...rowsNoTotal, totalRow]);
      }
    }
  }, [JSON.stringify(rows.map((row) => row.invoiceValue))]);

  return (
    <Grid item xs={12}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        editMode="cell"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        getRowClassName={(params) =>
          params.id === ParametersEnum.ID_ROW_TOTAL
            ? `super-app-theme--true`
            : 'super-app-theme--null'
        }
        processRowUpdate={processRowUpdate}
        getRowHeight={() => 'auto'}
        columnHeaderHeight={45}
        sx={{ height: rows.length > 0 ? '100%' : 200 }}
        rowHeight={30}
        isCellEditable={(params) => {
          return (
            (createMode || editMode) &&
            !formState.isTransfer &&
            params.id !== ParametersEnum.ID_ROW_TOTAL
          );
        }}
        hideFooter
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
      />
    </Grid>
  );
};
