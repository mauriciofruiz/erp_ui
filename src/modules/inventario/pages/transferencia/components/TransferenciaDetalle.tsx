import { getProductByStoreCode, getProductosByParams } from '@/backend';
import { FormState } from '@/hooks';
import { ServerResponseType } from '@/store';
import { ProductoByBodegaType, ProductoType, SucursalType } from '@/types';
import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
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
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { CustomFooterStatusComponent } from './TransferenciaFooter';
import {
  AutocompleteEditInputCell,
  InputChangeDataGrid,
} from './TransferenciaTableEdit';
import { EditToolbar } from './TransferenciaToolBar';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

export type TransferDetalleProps = {
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  isApprovable: boolean;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  productosByBodegaList: ProductoByBodegaType[];
  setProductosByBodegaList: React.Dispatch<
    React.SetStateAction<ProductoByBodegaType[]>
  >;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  sucursalUser: SucursalType;
  isForeign: boolean;
};

export const TransferenciaDetalle = (props: TransferDetalleProps) => {
  const {
    createMode,
    editMode,
    isApprovable,
    rows,
    setRows,
    productosByBodegaList,
    setProductosByBodegaList,
    rowModesModel,
    setRowModesModel,
    formState,
    sucursalUser,
    isForeign,
  } = props;

  const firstFieldFocus = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [productosToSelect, setProductosToSelect] = useState<string[]>([]);

  const columns: GridColDef[] = [
    {
      field: 'productCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 150,
      editable: true,
      cellClassName: 'centered-grid',
      renderEditCell: (params) => (
        <AutocompleteEditInputCell
          params={params}
          options={productosToSelect}
          freeSolo={false}
          multiple={false}
          onAutocompleteChange={(event, newValue) =>
            handleAutocompleteChange(event, newValue, params)
          }
          firstFieldFocus={firstFieldFocus}
          setInputValue={setInputValue}
        />
      ),
    },
    {
      field: 'productName',
      headerName: 'Nombre Producto',
      type: 'string',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'availableQuantity',
      headerName: 'Cantidad Disponible',
      width: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      width: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: (createMode || editMode) && !isForeign,
      renderEditCell: (params) => {
        return (
          <InputChangeDataGrid
            params={params}
            rows={rows}
            setRows={setRows}
            productosByBodegaList={productosByBodegaList}
            setRowModesModel={setRowModesModel}
            rowModesModel={rowModesModel}
            firstFieldFocus={firstFieldFocus}
            addButtonRef={addButtonRef}
            renderAlertMinMax={renderAlertMinMax}
          />
        );
      },
    },
    {
      field: 'weight',
      headerName: 'Peso',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      width: 150,
      editable: false,
      sortable: false,
    },
  ];

  if (isApprovable && editMode && !isForeign) {
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
  } else if ((createMode || editMode) && !isForeign) {
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
  } else if (isApprovable && !isForeign) {
    columns.push({
      field: 'factura',
      headerName: 'Facturar',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 90,
      sortable: false,
      type: 'boolean',
      // renderCell: (params) => (
      //   <input
      //     type="checkbox"
      //     checked={params.value}
      //     onChange={(event) => {
      //       // Aquí puedes manejar el cambio de valor del checkbox
      //       console.log(event.target.checked);
      //     }}
      //   />
      // ),
    });
  }

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string | null,
    params: GridRenderEditCellParams
  ) => {
    if (event && newValue !== null) {
      const fetchProductoByBodega = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductByStoreCode(
              formState.departureWarehouse,
              newValue.split(' - ')[1]
            );
          if (response) {
            if (response.status === 200) {
              const producto: ProductoByBodegaType = response.message;
              setProductosByBodegaList([...productosByBodegaList, producto]);
              const rowIndex = rows.findIndex((row) => row.id === params.id);
              const newRows = [...rows];

              if (producto.availableQuantity === 0 && !producto.isService) {
                enqueueSnackbar(
                  `No se pudo cargar el producto, ya que no posee cantidad disponible`,
                  {
                    variant: 'error',
                  }
                );
                const rowToDelete = rows.find((row) => row.id === params.id);
                if (rowToDelete) {
                  const productCodeToDelete = rowToDelete.productCode;
                  const updatedProductosList = productosByBodegaList.filter(
                    (item) => item.productCode !== productCodeToDelete
                  );
                  setProductosByBodegaList(updatedProductosList);
                  setRows(rows.filter((row) => row.id !== params.id));
                }
              } else {
                if (producto.isService) {
                  newRows[rowIndex] = {
                    ...newRows[rowIndex],
                    productCode: producto.productCode,
                    productName: producto.productName,
                    availableQuantity: '',
                    quantity: 1,
                    quantityApproved: 1,
                    isService: producto.isService,
                    weight: '',
                    measurementUnitId: producto.measurementUnitId,
                  };
                  handleRowEditStop;
                  setRows(newRows);
                } else {
                  newRows[rowIndex] = {
                    ...newRows[rowIndex],
                    productCode: producto.productCode,
                    productName: producto.productName,
                    availableQuantity: producto.availableQuantity,
                    quantity: 1,
                    quantityApproved: 1,
                    isService: producto.isService,
                    weight: producto.weight,
                    measurementUnitId: producto.measurementUnitId,
                  };
                  handleRowEditStop;
                  setRows(newRows);
                }
              }
            } else {
              enqueueSnackbar(
                `No se pudo cargar el producto: ${response.status}`,
                {
                  variant: 'error',
                }
              );
            }
          } else {
            enqueueSnackbar(`Debe seleccionar una bodega de origen`, {
              variant: 'warning',
            });
            setRows(rows.filter((row) => row.id !== params.id));
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
      };
      fetchProductoByBodega();
    } else {
      const rowIndex = rows.findIndex((row) => row.id === params.id);
      const newRows = [...rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        productCode: '',
        productName: '',
        availableQuantity: 0,
        quantity: 0,
        quantityApproved: 0,
        isService: false,
        weight: 0,
      };
      setRows(newRows);
    }
  };

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
      const updatedWeight = existingRow.weight + currentRow.weight;

      const updatedRows = rows
        .map((row) =>
          row.productCode === currentRow.productCode
            ? { ...row, quantity: updatedQuantity, weight: updatedWeight }
            : row
        )
        .filter((row) => row.id !== currentRow.id);
      setRows(updatedRows);
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
      const productCodeToDelete = rowToDelete.productCode;
      const updatedProductosList = productosByBodegaList.filter(
        (item) => item.productCode !== productCodeToDelete
      );
      setProductosByBodegaList(updatedProductosList);
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

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    const currentRow = rows.find((row) => row.id === params.id);
    if (!currentRow) return;

    const existingRow = rows.find(
      (row) =>
        row.productCode === currentRow.productCode && row.id !== params.id
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
      const updatedWeight = existingRow.weight + currentRow.weight;

      const updatedRows = rows
        .map((row) =>
          row.productCode === currentRow.productCode
            ? { ...row, quantity: updatedQuantity, weight: updatedWeight }
            : row
        )
        .filter((row) => row.id !== currentRow.id);

      setRows(updatedRows);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const renderAlertMinMax = (product: ProductoByBodegaType) => {
    const showMinimum =
      product.availableQuantity + product.quantity < product.minimumQuantity;
    const showMaximum =
      product.availableQuantity + product.quantity > product.maximumQuantity;
    if (showMinimum) {
      enqueueSnackbar(
        `La cantidad del producto ${product.productCode} está por debajo del MÍNIMO recomendado que es: ${product.minimumQuantity}`,
        {
          variant: 'warning',
        }
      );
    }

    if (showMaximum) {
      enqueueSnackbar(
        `La cantidad del producto ${product.productCode} está por arriba del MÁXIMO recomendado que es: ${product.maximumQuantity}`,
        {
          variant: 'warning',
        }
      );
    }
  };

  useEffect(() => {
    if (!inputValue.includes(' ') && inputValue.length >= 3) {
      const fetchData = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductosByParams(inputValue);
          if (response) {
            if (response.status === 200) {
              setProductosToSelect(
                response.message.map((p: ProductoType) =>
                  p.productId
                    ?.toString()
                    .concat(' - ', p.productCode.concat(' - ', p.shortName))
                )
              );
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
              setProductosToSelect([]);
              enqueueSnackbar('No se ha encontrado el producto buscado', {
                variant: 'info',
              });
            } else {
              enqueueSnackbar('Error Del Servidor: ' + error.message, {
                variant: 'error',
              });
            }
          }
        }
      };
      fetchData();
    } else {
      setProductosToSelect([]);
    }
  }, [inputValue]);

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
            toolbar: isForeign ? null : EditToolbar,
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
              formState,
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
