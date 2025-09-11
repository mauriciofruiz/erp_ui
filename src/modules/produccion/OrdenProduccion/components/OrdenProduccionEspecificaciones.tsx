'use client';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import React from 'react';
import { Tooltip } from '@mui/material';
import { Cancel, Edit, Save } from '@mui/icons-material';
import { GridRowId } from '@mui/x-data-grid';
import { setDecimalPlacesString } from '@/functions';

export type OrdenProduccionEspecificacionesProps = {
  rowsEspecificaciones: GridRowsProp;
  setRowEspecificaciones: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  createMode: boolean;
  editMode: boolean;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
};

export const OrdenProduccionEspecificaciones: React.FC<
  OrdenProduccionEspecificacionesProps
> = ({
  rowsEspecificaciones,
  setRowEspecificaciones,
  createMode,
  editMode,
  rowModesModel,
  setRowModesModel,
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
      field: 'productName',
      headerName: 'Producto',
      type: 'string',
      flex: 350,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'quantityProduced',
      headerName: 'Cantidad Producida',
      type: 'number',
      flex: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => setDecimalPlacesString(params.value, 2),
      valueGetter: (params) =>
        Number(params.row.quantityProduced) + Number(params.row.quantity),
    },
    {
      field: 'meters',
      headerName: 'Metros',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
    },
    {
      field: 'weightKg',
      headerName: 'Peso Kg',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
    },
    {
      field: 'scrap',
      headerName: 'Chatarra',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
    },
    {
      field: 'machine',
      headerName: 'Máquina',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
    },
    {
      field: 'blockDetail',
      headerName: 'Detalle Bloques',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
    },
  ];

  if (editMode) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <Tooltip title="Guardar">
              <GridActionsCellItem
                icon={<Save />}
                label="Guardar"
                sx={{
                  color: 'primary.main',
                }}
                onClick={handleSaveClick(id)}
              />
            </Tooltip>,
            <Tooltip title="No Guardar">
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancelar"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            </Tooltip>,
          ];
        }
        return [
          <Tooltip title="Editar">
            <GridActionsCellItem
              icon={<Edit />}
              label="Editar"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    });
  } else if (createMode || editMode) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 95,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <Tooltip title="Guardar">
              <GridActionsCellItem
                icon={<Save />}
                label="Guardar"
                sx={{
                  color: 'primary.main',
                }}
                onClick={handleSaveClick(id)}
              />
            </Tooltip>,
            <Tooltip title="No Guardar">
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancelar"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            </Tooltip>,
          ];
        }
        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Editar"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
        ];
      },
    });
  }

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rowsEspecificaciones.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRowEspecificaciones(
        rowsEspecificaciones.filter((row) => row.id !== id)
      );
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRowEspecificaciones(
      rowsEspecificaciones.map((row) =>
        row.id === newRow.id ? updatedRow : row
      )
    );
    return updatedRow;
  };

  return (
    <>
      <StyledDataGrid
        rows={rowsEspecificaciones}
        columns={columns}
        editMode={createMode || editMode ? 'row' : undefined}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        processRowUpdate={processRowUpdate}
        getRowClassName={(params) =>
          params !== null ? `super-app-theme--null` : ''
        }
        rowHeight={30}
        columnHeaderHeight={45}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        sx={{
          height: rowsEspecificaciones.length > 0 ? 'auto' : '300px',
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
