import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { PaginatedResponseType } from '@/types';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import React from 'react';

export type OrdenProduccionPedidoProps = {
  columns: GridColDef[];
  rowsOrdenPedido: GridRowsProp;
  setRowsOrdenPedido: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  pagination: PaginatedResponseType;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
};

export const OrdenProduccionPedidoPaginacion: React.FC<
  OrdenProduccionPedidoProps
> = ({ columns, rowsOrdenPedido }) => {
  return (
    <>
      <StyledDataGrid
        rows={rowsOrdenPedido}
        columns={columns}
        pagination
        getRowClassName={(params) =>
          params !== null ? `super-app-theme--null` : ''
        }
        rowHeight={30}
        columnHeaderHeight={45}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        sx={{
          height: rowsOrdenPedido.length > 0 ? 'auto' : '300px',
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
