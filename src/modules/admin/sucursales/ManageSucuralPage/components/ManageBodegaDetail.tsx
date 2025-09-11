import { TipoBodegaEnum } from '@/enums';
import { FormState } from '@/hooks';
import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import { Grid, SelectChangeEvent, Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  GridRenderEditCellParams,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { enqueueSnackbar } from 'notistack';
import React, { useRef } from 'react';
import { ManageBodegaCell } from './ManageBodegaCell';
import { ManageBodegaToolBar } from './ManageBodegaToolBar';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

export type ManageBodegaDetailProps = {
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
};

export const ManageBodegaDetail = (props: ManageBodegaDetailProps) => {
  const {
    createMode,
    editMode,
    rows,
    setRows,
    rowModesModel,
    setRowModesModel,
    formState,
  } = props;

  const firstFieldFocus = useRef<HTMLInputElement>(null);
  const tipoBodegas = Object.keys(TipoBodegaEnum)
    .filter((key): key is keyof typeof TipoBodegaEnum => isNaN(Number(key)))
    .map((key) => ({ label: key, value: TipoBodegaEnum[key] }));

  const columns: GridColDef[] = [
    {
      field: 'warehouseTypeId',
      headerName: 'Tipo Bodega',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 250,
      editable: true,
      cellClassName: 'centered-grid',
      renderEditCell: (params) => (
        <ManageBodegaCell
          params={params}
          onAutocompleteChange={(event, newValue) =>
            handleAutocompleteChange(event, newValue, params)
          }
          rows={rows}
        />
      ),
      valueGetter: (params) => {
        const state = params.value;
        const stateName = state
          ? tipoBodegas.find((item) => item.value === state)?.label
          : '';
        return stateName;
      },
    },
    {
      field: 'warehouseName',
      headerName: 'Nombre Bodega',
      type: 'string',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
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
          <Tooltip title="Borrar">
            <GridActionsCellItem
              icon={<Delete />}
              label="Borrar"
              onClick={handleDeleteClick(id)}
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
          <GridActionsCellItem
            icon={<Delete />}
            label="Borrar"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    });
  }

  const handleAutocompleteChange = (
    event: SelectChangeEvent<any>,
    newValue: any,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          warehouseTypeId: newValue.props.value,
          warehouseName:
            'BOD ' + newValue.props.children + ' ' + formState.name,
        };
        setRows(newRows);
      }
    }
  };

  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rows.find((row) => row.id === id);
    if (!currentRow) return;
    const existingRow = rows.find(
      (row) =>
        row.warehouseTypeId === currentRow.warehouseTypeId && row.id !== id
    );
    if (existingRow) {
      enqueueSnackbar(
        `Se ha encontrado una Bodega del mismo tipo: ${currentRow.warehouseTypeId}`,
        {
          variant: 'info',
        }
      );
    } else {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    const rowToDelete = rows.find((row) => row.id === id);
    if (rowToDelete) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    const currentRow = rows.find((row) => row.id === params.id);
    if (!currentRow) return;

    const existingRow = rows.find(
      (row) =>
        row.warehouseTypeId === currentRow.warehouseTypeId &&
        row.id !== params.id
    );

    if (existingRow) {
      enqueueSnackbar(
        `Se ha encontrado una Bodega del mismo tipo: ${currentRow.warehouseTypeId}`,
        {
          variant: 'info',
        }
      );
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
      <Grid item xs={12}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          editMode={createMode || editMode ? 'row' : undefined}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          getRowClassName={(params) =>
            params !== null ? `super-app-theme--null` : ''
          }
          processRowUpdate={processRowUpdate}
          rowHeight={30}
          columnHeaderHeight={45}
          slots={{
            toolbar: ManageBodegaToolBar,
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          slotProps={{
            toolbar: {
              setRows,
              setRowModesModel,
              firstFieldFocus,
              createMode,
              editMode,
              formState,
            },
          }}
          sx={{
            height: rows.length > 0 ? '100%' : '300px',
          }}
        />
      </Grid>
    </Grid>
  );
};
