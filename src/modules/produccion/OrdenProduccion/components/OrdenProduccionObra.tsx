'use client';
import { setCurrencyNumber, setDecimalPlacesString } from '@/functions';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import React from 'react';

export type OrdenProduccionObraProps = {
  rowsObra: GridRowsProp;
  setRowsObra: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

export const OrdenProduccionObra: React.FC<OrdenProduccionObraProps> = ({
  rowsObra,
  //setRowsObra
}) => {
  const columns: GridColDef[] = [
    {
      field: 'labourCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 200,
      editable: true,
      cellClassName: 'centered-grid',
      sortable: false,
      align: 'center',
    },
    {
      field: 'recipeName',
      headerName: 'Producto',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'producedQuantity',
      headerName: 'Cantidad Producida',
      type: 'number',
      flex: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => setDecimalPlacesString(params.value, 2),
    },
    {
      field: 'unitMeasure',
      headerName: 'Unidad',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'unitCost',
      headerName: 'Costo Unitario',
      type: 'number',
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
        rows={rowsObra}
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
          height: rowsObra.length > 0 ? 'auto' : '300px',
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
