import { FormState } from '@/hooks';
import { Grid } from '@mui/material';
import {
  GridColumnVisibilityModel,
  GridEventListener,
  GridRowEditStopReasons,
  GridValidRowModel,
  useGridApiRef,
} from '@mui/x-data-grid';
import { GridRowModel } from '@mui/x-data-grid';
import { GridRowModesModel } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { esES } from '@mui/x-data-grid/locales';
import { EstadoPagoEnum, ParametersEnum } from '@/enums';
import React from 'react';
import { ColumnsDefinition } from './ColumnsDefinition';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { CustomToolbar } from './CustomToolbar';
import { PaymentDetailInterface } from '@/types';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

interface DetallePagoProps {
  rows: readonly GridValidRowModel[];
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
}

const initialStateDetalle: PaymentDetailInterface = {
  detailPaymentId: null,
  paymentId: null,
  detailPaymentAmount: 0.01,
  accountId: null,
  accountNumber: '',
  accountName: '',
  accountTypeId: null,
  accountTypeName: '',
  detailPaymentStatus: false,
  detailPaymentObservation: '',
  projectId: null,
  projectName: '',
  branchId: null,
  branchName: '',
  employeeId: null,
  employeeName: '',
  importOpeningId: null,
  importCode: '',
  providerId: null,
  providerName: '',
  clientId: null,
  clientName: '',
};

export const DetallePago: React.FC<DetallePagoProps> = ({
  rows,
  setRows,
  formState,
  createMode,
  editMode,
  rowModesModel,
  setRowModesModel,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { sucursales } = useSelector((state: RootState) => state.common);
  const apiRef = useGridApiRef();

  // ********************************** DATA GRID *********************************************
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      providerName: false,
      projectName: false,
      branchName: false,
      employeeName: false,
      importOpeningCode: false,
    });

  /**
   * Handles the editing of rows in the ManageFacturacionProveedorPage component.
   *
   * @param existingRow - The existing row to be updated.
   * @param currentRow - The current row with updated values.
   */
  const handleEmptyRows = (currentRow: any) => {
    enqueueSnackbar(`No se puede guardar una registro sin un item`, {
      variant: 'info',
    });
    const updatedRows = rows.filter((row) => row.id !== currentRow?.id);

    setRows(updatedRows);
  };

  const columns = ColumnsDefinition({
    createMode,
    editMode,
    rows,
    setRows,
    accountId: formState.accountId,
    sucursales,
    rowModesModel,
    setRowModesModel,
    handleEmptyRows,
    isAdvancePayment: formState.isAdvancePayment,
    paymentStatusId: formState.paymentStatusId,
    totalValue: formState.paymentAmount,
  });

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    const currentRow = rows.find((row) => row.id === params.id);
    if (!currentRow) return;

    const emptyRow = currentRow.accountId === null;

    if (emptyRow) {
      handleEmptyRows(currentRow);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <StyledDataGrid
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          editMode={createMode || editMode ? 'row' : undefined}
          rowModesModel={rowModesModel}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          getRowClassName={(params) =>
            params.id === ParametersEnum.ID_ROW_TOTAL
              ? `super-app-theme--true`
              : `super-app-theme--null`
          }
          processRowUpdate={processRowUpdate}
          getRowHeight={() => 'auto'}
          isCellEditable={(params) => {
            if (createMode) return true;
            else if (
              editMode &&
              formState.paymentStatusId === EstadoPagoEnum.GENERADO &&
              params.id !== ParametersEnum.ID_ROW_TOTAL
            ) {
              return true;
            } else {
              return false;
            }
          }}
          columnHeaderHeight={45}
          onCellKeyDown={(params, event) => {
            if (event.key === 'Tab' && params.field === 'accountName') {
              setTimeout(() => {
                apiRef.current.setCellFocus(params.id, 'detailPaymentAmount');
              }, 100);
              event.preventDefault();
            }
          }}
          sx={{ height: rows.length > 0 ? '100%' : 300 }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            toolbar: CustomToolbar,
          }}
          slotProps={{
            toolbar: {
              setRows,
              setRowModesModel,
              createMode,
              editMode,
              formState,
              initialStateDetalle,
            },
          }}
          hideFooter
          localeText={{
            ...esES.components.MuiDataGrid.defaultProps.localeText,
            toolbarDensity: 'Densidad',
            toolbarFilters: 'Filtros',
            toolbarColumns: 'Columnas',
            toolbarExport: 'Exportar',
          }}
        />
      </Grid>
    </Grid>
  );
};
