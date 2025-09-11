import { EstadoOrdenEnum } from '@/enums';
import {
  getDecimalPlaces,
  setCurrencyNumber,
  setDecimalPlacesString,
} from '@/functions';
import { FormState } from '@/hooks';
import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
import { GridEventListener, GridRowEditStopReasons } from '@mui/x-data-grid';
import { GridRowModel } from '@mui/x-data-grid';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { esES } from '@mui/x-data-grid/locales';
import { FooterOrdenExterior } from './FooterOrdenExterior';
import { ToolbarOrdenExterior } from './ToolbarOrdenExterior';
import { AutocompleteEditProductCell } from './CustomCellOC';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
interface DetalleOrdenCompraExtProps {
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  onInputNumberChange: (value: number, field: string) => void;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
}

export const DetalleOrdenCompraExt = (props: DetalleOrdenCompraExtProps) => {
  const {
    rows,
    setRows,
    formState,
    setFormState,
    createMode,
    editMode,
    onInputNumberChange,
    rowModesModel,
    setRowModesModel,
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
  /**
   * Handles the click event for the edit button in the grid row.
   * @param id - The ID of the grid row.
   */
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };
  /**
   * Handles the click event when the save button is clicked for a specific row.
   *
   * @param id - The ID of the row.
   */
  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rows.find((row) => row.id === id);
    if (!currentRow) return;

    const emptyRow = currentRow.productCode === '';

    if (emptyRow) {
      const existingRow = rows.find(
        (row) => row.productCode === currentRow?.productCode && row.id !== id
      );
      if (existingRow) {
        handleEmptyRows(currentRow);
      }
    } else {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  /**
   * Handles the click event for deleting a row.
   * @param id - The ID of the row to be deleted.
   */
  const handleDeleteClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (!row) return;
    if (row.detailId && row.detailId !== null) {
      setRows(
        rows.map((row) => (row.id === id ? { ...row, status: false } : row))
      );
    } else {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  /**
   * Handles the cancel click event for a specific row in the grid.
   * @param id - The ID of the row to cancel.
   */
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
  const columns: GridColDef[] = [
    {
      field: 'documentCode',
      headerName: 'Nro. LP',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 80,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'productCode',
      headerName: 'Código Producto',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 150,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'productName',
      headerName: 'Item',
      type: 'string',
      minWidth: 300,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderEditCell: (params) => {
        return (
          <AutocompleteEditProductCell
            params={params}
            rows={rows}
            setRows={setRows}
            providerId={formState.providerId}
          />
        );
      },
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      editable: true,
      flex: 1,
      renderCell: (params) =>
        setDecimalPlacesString(
          params.value,
          getDecimalPlaces(params.row.unitMeasureId)
        ),
    },
    {
      field: 'unitPrice',
      headerName: 'Precio Unitario',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      editable: true,
      flex: 1,
      valueFormatter: (params) =>
        setDecimalPlacesString(Number(params.value), 6),
    },
    {
      field: 'totalPrice',
      headerName: 'Precio Total',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'fodinfaValue',
      headerName: 'Fodinfa',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'advaloremValue',
      headerName: 'Advalorem',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
  ];

  if (
    createMode ||
    (editMode && formState.statusId === EstadoOrdenEnum.EN_EDICION)
  ) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 120,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <Tooltip title="Guardar">
              <GridActionsCellItem
                icon={<Save />}
                label="Guardar"
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

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <StyledDataGrid
          rows={rows.filter((row) => row.status === true)}
          columns={columns}
          editMode={createMode || editMode ? 'cell' : undefined}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          getRowClassName={(params) =>
            params !== null ? `super-app-theme--null` : ''
          }
          processRowUpdate={processRowUpdate}
          getRowHeight={() => 'auto'}
          columnHeaderHeight={45}
          sx={{ height: rows.length > 0 ? '100%' : 300 }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            footer: FooterOrdenExterior,
            toolbar: ToolbarOrdenExterior,
          }}
          slotProps={{
            footer: {
              createMode,
              editMode,
              formState,
              setFormState,
              rows,
              onInputNumberChange,
            },
            toolbar: {
              setRows,
              setRowModesModel,
              createMode,
              editMode,
              formState,
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
