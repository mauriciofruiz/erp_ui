import { getProductsReceta } from '@/backend/inventario/recetaServices';
import { RecetaEnum } from '@/enums/RecetaEnum';
import { TabPanel } from '@/functions';
import { ServerResponseType } from '@/store';
import {
  CostosIndirectosType,
  ManoObraType,
  ProductoRecetaType,
} from '@/types';
import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import { Box, Tab, Tabs, Tooltip } from '@mui/material';
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
import { ListaMaterialesCostos } from './ListaMaterialesCostos';
import { ListaMaterialesManoObra } from './ListaMaterialesManoObra';
import {
  AutocompleteEditLM,
  EditToolbar,
  InputChangeDataGrid,
} from './ListaMaterialesToolBar';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

export type ListaMaterialesMateriaPrimaProps = {
  rowsMateriaPrima: GridRowsProp;
  setRowsMateriaPrima: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  rowsObra: GridRowsProp;
  setRowsObra: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  rowsCostos: GridRowsProp;
  setRowsCostos: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  createMode: boolean;
  editMode: boolean;
  materiales: ProductoRecetaType[];
  setMateriales: React.Dispatch<React.SetStateAction<ProductoRecetaType[]>>;
  manoObra: ManoObraType[];
  setManoObra: React.Dispatch<React.SetStateAction<ManoObraType[]>>;
  costosIndirectos: CostosIndirectosType[];
  setCostosIndirectos: React.Dispatch<
    React.SetStateAction<CostosIndirectosType[]>
  >;
};

export const ListaMaterialesMateriaPrima = (
  props: ListaMaterialesMateriaPrimaProps
) => {
  const {
    rowsMateriaPrima,
    setRowsMateriaPrima,
    rowsObra,
    setRowsObra,
    rowsCostos,
    setRowsCostos,
    createMode,
    editMode,
    materiales,
    setMateriales,
    manoObra,
    setManoObra,
    costosIndirectos,
    setCostosIndirectos,
  } = props;

  const [tabIndex, setTabIndex] = React.useState(0);
  const [inputValue, setInputValue] = useState('');
  const firstFieldFocus = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [productosToSelect, setProductosToSelect] = useState<string[]>([]);
  //const [materiales, setMateriales] = useState<ProductoRecetaType[]>([])

  const columns: GridColDef[] = [
    {
      field: 'productCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 100,
      editable: true,
      cellClassName: 'centered-grid',
      renderEditCell: (params) => (
        <AutocompleteEditLM
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
      field: 'measurementUnitName',
      headerName: 'Unidad',
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
      editable: true,
      renderEditCell: (params) => (
        <InputChangeDataGrid
          params={params}
          rowsMateriaPrima={rowsMateriaPrima}
          setRowsMateriaPrima={setRowsMateriaPrima}
          materiales={materiales}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          firstFieldFocus={firstFieldFocus}
          addButtonRef={addButtonRef}
        />
      ),
    },
    {
      field: 'currentAverageCost',
      headerName: 'Costo Unitario',
      width: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderEditCell: (params) => (
        <InputChangeDataGrid
          params={params}
          rowsMateriaPrima={rowsMateriaPrima}
          setRowsMateriaPrima={setRowsMateriaPrima}
          materiales={materiales}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          firstFieldFocus={firstFieldFocus}
          addButtonRef={addButtonRef}
        />
      ),
    },
    {
      field: 'totalCost',
      headerName: 'Costo Total',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      width: 150,
      editable: false,
      sortable: false,
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
    event: React.SyntheticEvent<Element, Event>,
    newValue: string | null,
    params: GridRenderEditCellParams
  ) => {
    if (event && newValue !== null) {
      const fetchProductoByBodega = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductsReceta(
              newValue.split(' - ')[1],
              null,
              null,
              true,
              null,
              null
            );
          if (response) {
            if (response.status === 200) {
              const producto: ProductoRecetaType[] = response.message;
              setMateriales([...materiales, producto[0]]);
              const rowIndex = rowsMateriaPrima.findIndex(
                (row) => row.id === params.id
              );
              const newRows = [...rowsMateriaPrima];
              newRows[rowIndex] = {
                ...newRows[rowIndex],
                productId: producto[0].productId,
                labourId: null,
                cifId: null,
                costTypeId: RecetaEnum.MATERIA_PRIMA,
                productCode: producto[0].productCode,
                productName: producto[0].productName,
                measurementUnitName: producto[0].measurementUnitName,
                measurementUnitId: producto[0].measurementUnitId,
                quantity: 1,
                currentAverageCost: producto[0].currentAverageCost,
                totalCost: producto[0].currentAverageCost,
                recipeCode: '',
                stateRecipe: true,
              };
              setRowsMateriaPrima(newRows);
            } else {
              enqueueSnackbar(
                `No se pudo cargar el producto: ${response.status}`,
                {
                  variant: 'error',
                }
              );
            }
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
      };
      fetchProductoByBodega();
    } else {
      const rowIndex = rowsMateriaPrima.findIndex(
        (row) => row.id === params.id
      );
      const newRows = [...rowsMateriaPrima];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        productId: null,
        labourId: null,
        cifId: null,
        costTypeId: RecetaEnum.MATERIA_PRIMA,
        productCode: '',
        productName: '',
        measurementUnitName: '',
        measurementUnitId: '',
        quantity: 0,
        currentAverageCost: '',
        totalCost: 0,
        recipeCode: '',
        stateRecipe: true,
      };
      setRowsMateriaPrima(newRows);
    }
  };

  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rowsMateriaPrima.find((row) => row.id === id);
    if (!currentRow) return;
    const existingRow = rowsMateriaPrima.find(
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

      const updatedRows = rowsMateriaPrima
        .map((row) =>
          row.productCode === currentRow.productCode
            ? { ...row, quantity: updatedQuantity, weight: updatedWeight }
            : row
        )
        .filter((row) => row.id !== currentRow.id);
      setRowsMateriaPrima(updatedRows);
    } else {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    const rowToDelete = rowsMateriaPrima.find((row) => row.id === id);
    if (rowToDelete) {
      const productCodeToDelete = rowToDelete.productCode;
      const updatedProductosList = materiales.filter(
        (item) => item.productCode !== productCodeToDelete
      );
      setMateriales(updatedProductosList);
      setRowsMateriaPrima(rowsMateriaPrima.filter((row) => row.id !== id));
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rowsMateriaPrima.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRowsMateriaPrima(rowsMateriaPrima.filter((row) => row.id !== id));
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    const currentRow = rowsMateriaPrima.find((row) => row.id === params.id);
    if (!currentRow) return;

    const existingRow = rowsMateriaPrima.find(
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

      const updatedRows = rowsMateriaPrima
        .map((row) =>
          row.productCode === currentRow.productCode
            ? { ...row, quantity: updatedQuantity, weight: updatedWeight }
            : row
        )
        .filter((row) => row.id !== currentRow.id);

      setRowsMateriaPrima(updatedRows);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRowsMateriaPrima(
      rowsMateriaPrima.map((row) => (row.id === newRow.id ? updatedRow : row))
    );
    return updatedRow;
  };

  useEffect(() => {
    if (!inputValue.includes(' ') && inputValue.length >= 3) {
      const fetchData = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductsReceta(null, null, null, true, null, inputValue);
          if (response) {
            if (response.status === 200) {
              setProductosToSelect(
                response.message.map((p: ProductoRecetaType) =>
                  p.productId
                    ?.toString()
                    .concat(' - ', p.productCode.concat(' - ', p.productName))
                )
              );
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
              setProductosToSelect([]);
              enqueueSnackbar('No se ha encontrado el material buscado', {
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
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabIndex}
            onChange={(event: React.SyntheticEvent, newValue: number) => {
              event ? setTabIndex(newValue) : null;
            }}
          >
            <Tab label="Materia Prima" />
            <Tab label="Mano de Obra" />
            <Tab label="Costos Indirectos" />
          </Tabs>
        </Box>
      </Box>
      <TabPanel value={tabIndex} index={0}>
        <StyledDataGrid
          rows={rowsMateriaPrima}
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
            toolbar: EditToolbar,
            noRowsOverlay: CustomNoRowsOverlay,
            //footer: CustomFooterStatusComponent,
          }}
          slotProps={{
            toolbar: {
              setRows: setRowsMateriaPrima,
              setRowModesModel,
              firstFieldFocus,
              createMode,
              editMode,
              addButtonRef,
              rows: rowsMateriaPrima,
              setMateriales,
            },
            footer: { rows: rowsMateriaPrima },
          }}
          sx={{
            height: rowsMateriaPrima.length > 0 ? '100%' : '300px',
          }}
        />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <ListaMaterialesManoObra
          rowsObra={rowsObra}
          setRowsObra={setRowsObra}
          createMode={createMode}
          editMode={editMode}
          manoObra={manoObra}
          setManoObra={setManoObra}
        />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <ListaMaterialesCostos
          createMode={createMode}
          editMode={editMode}
          rowsCostos={rowsCostos}
          setRowsCostos={setRowsCostos}
          costosIndirectos={costosIndirectos}
          setCostosIndirectos={setCostosIndirectos}
        />
      </TabPanel>
    </>
  );
};
