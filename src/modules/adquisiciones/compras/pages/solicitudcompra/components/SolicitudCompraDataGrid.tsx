import React from 'react';
import { Grid } from '@mui/material';
import { GridRowModesModel, GridRowsProp } from '@mui/x-data-grid';
import { StyledDataGrid, CustomNoRowsOverlay } from '@/hooks/useStyleDataGrid';
import { EditToolbar } from './EditToolbar';
import { ColumnsDefinition } from './ColumnsDefinition';
import { CustomFooterStatusComponent } from './CustomFooterStatusComponent';
import { ProductoByBodegaType } from '@/types/inventario/producto.type';

interface SolicitudCompraDataGridProps {
  rows: GridRowsProp;
  columns: any[];
  editMode: boolean;
  createMode: boolean;
  rowModesModel: GridRowModesModel;
  onRowModesModelChange: (newRowModesModel: GridRowModesModel) => void;
  onRowEditStop: any;
  processRowUpdate: (newRow: any) => any;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  sucursalUser: any;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  productosByBodegaList: ProductoByBodegaType[];
  setProductosByBodegaList: React.Dispatch<React.SetStateAction<ProductoByBodegaType[]>>;
  renderAlertMinMax: (product: ProductoByBodegaType) => void;
}

export const SolicitudCompraDataGrid: React.FC<SolicitudCompraDataGridProps> = ({
  rows,
  columns,
  editMode,
  createMode,
  rowModesModel,
  onRowModesModelChange,
  onRowEditStop,
  processRowUpdate,
  setRows,
  setRowModesModel,
  firstFieldFocus,
  sucursalUser,
  addButtonRef,
  productosByBodegaList,
  setProductosByBodegaList,
  renderAlertMinMax,
}) => {
  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
      <Grid item xs={12}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          editMode={createMode || editMode ? 'row' : undefined}
          rowModesModel={rowModesModel}
          onRowModesModelChange={onRowModesModelChange}
          onRowEditStop={onRowEditStop}
          getRowClassName={(params) =>
            `super-app-theme--${params.row.state}`
          }
          processRowUpdate={processRowUpdate}
          rowHeight={30}
          columnHeaderHeight={45}
          slots={{
            toolbar: EditToolbar,
            noRowsOverlay: CustomNoRowsOverlay,
            footer: CustomFooterStatusComponent,
          }}
          slotProps={{
            toolbar: {
              setRows,
              setRowModesModel,
              firstFieldFocus,
              createMode,
              editMode,
              sucursalUser,
              addButtonRef,
              rows,
              setProductosByBodegaList,
              renderAlertMinMax,
            },
            footer: { rows },
          }}
          sx={{
            height: rows.length > 0 ? '100%' : '300px',
          }}
        />
      </Grid>
    </Grid>
  );
};

