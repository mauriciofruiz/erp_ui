import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
import {
  FooterPropsOverrides,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowModes,
  GridRowsProp,
} from '@mui/x-data-grid';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
import {
  EditToolbarOrdenPedido,
  InputChangeDataGridOrden,
} from './OrdenPedidoToolBar';
import { OrdenPedidoFooter } from './OrdenPedidoFooter';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { FormState, useCommonDataGrid } from '@/hooks';
import { EstadoProduccionEnum } from '@/enums';
import { AutocompleteEditProductCell } from './CustomCells';

interface ExtendedFooterPropsOverrides extends FooterPropsOverrides {
  isApprovable?: boolean;
}

export type OrdenPedidoFormProps = {
  createMode: boolean;
  editMode: boolean;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  isApprovable: boolean;
  formState: FormState;
};

export const OrdenPedidoDetalle = (props: OrdenPedidoFormProps) => {
  const { createMode, editMode, rows, setRows, isApprovable, formState } =
    props;
  const firstFieldFocus = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const {
    columns,
    setColumns,
    rowModesModel,
    setRowModesModel,
    handleCancelClick,
    handleEditClick,
    handleDeleteClick,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
  } = useCommonDataGrid(rows, setRows);

  useEffect(() => {
    let tempColumns: GridColDef[] = [
      {
        field: 'productCode',
        headerName: 'Código',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 150,
        flex: 1,
        cellClassName: 'centered-grid',
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
              setRows={setRows}
              enqueueSnackbar={enqueueSnackbar}
            />
          );
        },
      },
      {
        field: 'observation',
        headerName: 'Observaciones',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        minWidth: 150,
        editable: true,
        sortable: false,
        valueGetter: (params) => {
          return params.value ? params.value.toUpperCase() : '';
        },
        valueSetter: (params) => {
          const value = params.value ? params.value.toUpperCase() : '';
          return { ...params.row, observation: value };
        },
      },
      {
        field: 'quantity',
        headerName: 'Cantidad',
        flex: 1,
        minWidth: 100,
        sortable: false,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        editable: createMode || (editMode && isApprovable),
        renderEditCell: (params) => (
          <InputChangeDataGridOrden
            params={params}
            setRows={setRows}
            setRowModesModel={setRowModesModel}
            rowModesModel={rowModesModel}
            firstFieldFocus={firstFieldFocus}
            addButtonRef={addButtonRef}
          />
        ),
      },
    ];
    if (
      editMode &&
      formState.productionStatusId === EstadoProduccionEnum.ENVIADO
    ) {
      if (isApprovable) {
        tempColumns.push({
          field: 'quantityProduced',
          headerName: 'Cantidad Producida',
          flex: 1,
          minWidth: 100,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: false,
          renderEditCell: (params) => (
            <InputChangeDataGridOrden
              params={params}
              setRows={setRows}
              setRowModesModel={setRowModesModel}
              rowModesModel={rowModesModel}
              firstFieldFocus={firstFieldFocus}
              addButtonRef={addButtonRef}
            />
          ),
        });
      }
      tempColumns.push({
        field: 'actions',
        type: 'actions',
        headerName: 'Acciones',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        flex: 0.8,
        minWidth: 80,
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
    } else if (createMode || editMode) {
      tempColumns.push({
        field: 'actions',
        type: 'actions',
        headerName: 'Acciones',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        flex: 0.8,
        minWidth: 80,
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
    }
    setColumns(tempColumns);
  }, [createMode, editMode, isApprovable, rowModesModel, formState]);

  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rows.find((row) => row.id === id);
    if (!currentRow) return;
    const existingRow = rows.find(
      (row) => row.productCode === currentRow.productCode && row.id !== id
    );
    if (existingRow) {
      enqueueSnackbar(
        `Se ha encontrado un producto con el mismo código: ${currentRow.productCode}`,
        {
          variant: 'info',
        }
      );
      const updatedQuantity =
        parseFloat(existingRow.quantity) + parseFloat(currentRow.quantity);
      //const updatedWeight = existingRow.weight + currentRow.weight;

      const updatedRows = rows
        .map((row) =>
          row.productCode === currentRow.productCode
            ? { ...row, quantity: updatedQuantity }
            : row
        )
        .filter((row) => row.id !== currentRow.id);
      setRows(updatedRows);
    } else {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
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
            toolbar: EditToolbarOrdenPedido,
            noRowsOverlay: CustomNoRowsOverlay,
            footer: OrdenPedidoFooter,
          }}
          slotProps={{
            toolbar: {
              setRows: setRows,
              setRowModesModel,
              firstFieldFocus,
              createMode,
              editMode,
              addButtonRef,
              rows: rows,
            },
            footer: {
              rows: rows,
              isApprovable: isApprovable,
            } as ExtendedFooterPropsOverrides,
          }}
          sx={{
            height: rows.length > 0 ? '100%' : '300px',
          }}
        />
      </Grid>
    </Grid>
  );
};
