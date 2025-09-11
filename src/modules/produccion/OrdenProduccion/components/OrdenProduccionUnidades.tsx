'use client';
import { FormState } from '@/hooks';
import {
  FooterPropsOverrides,
  GridColDef,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import React, { useRef } from 'react';
import { CustomFooterStatusComponent } from './OrdenProduccionFooter';
import { InputChangeOrderGrid } from './OrdenProduccionToolbar';
import { setCurrencyNumber, setDecimalPlacesString } from '@/functions';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
interface ExtendedFooterPropsOverrides extends FooterPropsOverrides {
  rowsUnidadesTemp: GridRowsProp;
}

export type OrdenProduccionUnidadesProps = {
  rowsUnidadesProd: GridRowsProp;
  setRowsUnidadesProd: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setExecuteQuantity: React.Dispatch<React.SetStateAction<boolean>>;
  formState: FormState;
};

export const OrdenProduccionUnidades: React.FC<
  OrdenProduccionUnidadesProps
> = ({
  rowsUnidadesProd,
  setRowsUnidadesProd,
  setExecuteQuantity,
  formState,
}) => {
  const firstFieldFocus = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const columns: GridColDef[] = [
    {
      field: 'productCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 100,
      cellClassName: 'centered-grid',
      sortable: false,
      align: 'center',
    },
    {
      field: 'productName',
      headerName: 'Producto',
      type: 'string',
      flex: 350,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'measurementUnitName',
      headerName: 'Unidad',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      type: 'number',
      flex: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderCell: (params) => setDecimalPlacesString(params.value, 2),
      renderEditCell: (params) => {
        return (
          <InputChangeOrderGrid
            params={params}
            rowsUnidadesProd={rowsUnidadesProd}
            setRowsUnidadesProd={setRowsUnidadesProd}
            setRowModesModel={setRowModesModel}
            rowModesModel={rowModesModel}
            firstFieldFocus={firstFieldFocus}
            addButtonRef={addButtonRef}
            setExecuteQuantity={setExecuteQuantity}
            formState={formState}
          />
        );
      },
    },
    {
      field: 'unitPrice',
      headerName: 'Costo Unitario',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => setDecimalPlacesString(params.value, 6),
    },
    {
      field: 'totalCost',
      headerName: 'Costo Total',
      type: 'number',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => setCurrencyNumber(params.value),
    },
  ];

  return (
    <>
      <StyledDataGrid
        rows={rowsUnidadesProd}
        columns={columns}
        getRowClassName={(params) =>
          params !== null ? `super-app-theme--null` : ''
        }
        rowHeight={30}
        // checkboxSelection={createMode || editMode}
        disableRowSelectionOnClick
        columnHeaderHeight={45}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
          footer: CustomFooterStatusComponent,
        }}
        slotProps={{
          footer: {
            rowsUnidadesProd,
          } as unknown as ExtendedFooterPropsOverrides,
        }}
        sx={{
          height: rowsUnidadesProd.length > 0 ? 'auto' : '300px',
        }}
        localeText={{
          ...esES.components.MuiDataGrid.defaultProps.localeText,
          toolbarDensity: 'Densidad',
          toolbarFilters: 'Filtros',
          toolbarColumns: 'Columnas',
          toolbarExport: 'Exportar',
        }}
      />
    </>
  );
};
