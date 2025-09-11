'use client';
import { setCurrencyNumber, setDecimalPlacesString } from '@/functions';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import React from 'react';

export type OrdenProduccionMateriaProps = {
  rowsMateriaPrima: GridRowsProp;
  setRowsMateriaPrima: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

export const OrdenProduccionMateria: React.FC<OrdenProduccionMateriaProps> = ({
  rowsMateriaPrima,
  //setRowsMateriaPrima
}) => {
  const columns: GridColDef[] = [
    {
      field: 'productCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 100,
      editable: true,
      cellClassName: 'centered-grid',
      sortable: false,
      align: 'center',
    },
    {
      field: 'recipeName',
      headerName: 'Producto',
      type: 'string',
      flex: 250,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'quantityAvailable',
      headerName: 'Cantidad Disponible',
      type: 'string',
      flex: 180,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => setDecimalPlacesString(params.value, 6),
    },
    {
      field: 'quantityListedMaterial',
      headerName: 'Cantidad Materiales',
      type: 'string',
      flex: 180,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => setDecimalPlacesString(params.value, 6),
    },
    {
      field: 'quantityRequested',
      headerName: 'Cantidad Solictada',
      type: 'string',
      flex: 180,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => setDecimalPlacesString(params.value, 2),
    },
    {
      field: 'unitMeasure',
      headerName: 'Unidad',
      type: 'string',
      flex: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'unitCost',
      headerName: 'Costo Unitario',
      type: 'string',
      flex: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => setDecimalPlacesString(params.value, 6),
    },
    {
      field: 'totalCost',
      headerName: 'Costo Total',
      type: 'string',
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
        rows={rowsMateriaPrima}
        columns={columns}
        getRowClassName={(params) =>
          params !== null ? `super-app-theme--null` : ''
        }
        rowHeight={30}
        columnHeaderHeight={45}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        sx={{
          height: rowsMateriaPrima.length > 0 ? 'auto' : '300px',
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
