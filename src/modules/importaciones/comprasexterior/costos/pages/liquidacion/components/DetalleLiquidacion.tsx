import { setCurrencyNumber, setDecimalPlacesString } from '@/functions';
import { FormState } from '@/hooks';
import { Grid } from '@mui/material';
import {
  GridColumnVisibilityModel,
  GridEventListener,
  GridRenderCellParams,
  GridRowEditStopReasons,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { GridRowModel } from '@mui/x-data-grid';
import { GridColDef, GridRowModesModel, GridRowsProp } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { esES } from '@mui/x-data-grid/locales';
import { FooterLiquidacion } from './FooterLiquidacion';
import { ParametersEnum } from '@/enums';
import { useState } from 'react';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

interface DetalleLiquidacionProps {
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  onInputNumberChange: (value: number, field: string) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  idFacturasAsignadas: number[];
  setIdFacturasAsignadas: React.Dispatch<React.SetStateAction<number[]>>;
}

export const DetalleLiquidacion = (props: DetalleLiquidacionProps) => {
  const {
    rows,
    setRows,
    formState,
    createMode,
    editMode,
    rowModesModel,
    setRowModesModel,
    onInputNumberChange,
    setFormState,
    idFacturasAsignadas,
    setIdFacturasAsignadas,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

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

    const emptyRow = currentRow.productId === null;

    if (emptyRow) {
      handleEmptyRows(currentRow);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEmptyRows = (currentRow: any) => {
    enqueueSnackbar(`No se puede guardar una registro sin un item`, {
      variant: 'info',
    });
    const updatedRows = rows.filter((row) => row.id !== currentRow?.id);

    setRows(updatedRows);
  };

  const columns: GridColDef[] = [
    {
      field: 'productCode',
      headerName: 'Código',
      type: 'string',
      minWidth: 150,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'productName',
      headerName: 'Producto',
      type: 'string',
      minWidth: 300,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      minWidth: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      renderCell: (params: GridRenderCellParams) =>
        setDecimalPlacesString(Number(params.value), 4),
    },
    {
      field: 'fobUnit',
      headerName: 'FOB Unitario',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) =>
        params.value === null ? '' : setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'fob',
      headerName: 'FOB',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'fobPortion',
      headerName: '% FOB',
      minWidth: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 0.5,
      valueFormatter: (params: GridValueFormatterParams) => {
        return new Intl.NumberFormat('es-ES', {
          style: 'percent',
          minimumFractionDigits: 4,
          maximumFractionDigits: 4,
        }).format(params.value as number);
      },
    },
    {
      field: 'policy',
      headerName: 'Poliza',
      minWidth: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 0.7,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'freight',
      headerName: 'Flete',
      minWidth: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 0.7,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'cif',
      headerName: 'CIF',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'tariff',
      headerName: 'Arancel',
      minWidth: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 0.5,
      valueFormatter: (params: GridValueFormatterParams) => {
        return params.value === null
          ? ''
          : new Intl.NumberFormat('es-ES', {
              style: 'percent',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(params.value as number);
      },
    },
    {
      field: 'release',
      headerName: 'Liberación',
      minWidth: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 0.5,
      valueFormatter: (params: GridValueFormatterParams) => {
        return params.value === null
          ? ''
          : new Intl.NumberFormat('es-ES', {
              style: 'percent',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(params.value as number);
      },
    },
    {
      field: 'fodinfa',
      headerName: 'Fodinfa',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'adValorem',
      headerName: 'Advalorem',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'iva',
      headerName: 'IVA',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'totalOtherExpenses',
      headerName: 'Total Otros Gastos',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'totalGeneral',
      headerName: 'Total General',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'cuWithoutIva',
      headerName: 'C.U. sin IVA',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'cuWithIva',
      headerName: 'C.U. con IVA',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'totalCosts',
      headerName: 'Total Costos',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'pvp',
      headerName: 'PVP',
      minWidth: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) =>
        params.value === null
          ? ''
          : setDecimalPlacesString(Number(params.value), 6),
    },
    {
      field: 'profitCost',
      headerName: 'Utilidad vs. Costo',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) =>
        params.value === null ? '' : setCurrencyNumber(Number(params.value)),
    },
  ];

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      release: false,
    });

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          editMode={createMode || editMode ? 'cell' : undefined}
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
              : `super-app-theme--intermitente`
          }
          processRowUpdate={processRowUpdate}
          getRowHeight={() => 'auto'}
          columnHeaderHeight={45}
          sx={{ height: rows.length > 0 ? '100%' : 300 }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            footer: FooterLiquidacion,
            // toolbar: ToolbarListaEmpaque,
          }}
          slotProps={{
            footer: {
              formState,
              rows,
              onInputNumberChange,
              setRows,
              setFormState,
              createMode,
              editMode,
              idFacturasAsignadas,
              setIdFacturasAsignadas,
            },
          }}
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
