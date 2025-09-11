import { getCostosIndirectos } from '@/backend/inventario/recetaServices';
import { MesureUnit } from '@/enums';
import { RecetaEnum } from '@/enums/RecetaEnum';
import { ServerResponseType } from '@/store';
import { ProductoByBodegaType } from '@/types';
import { CostosIndirectosType } from '@/types/inventario/costosIndirectos.type';
import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
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
import {
  AutocompleteEditLM,
  EditToolbarCostos,
  InputChangeDataGridCostos,
} from './ListaMaterialesToolBar';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { setDecimalPlacesString } from '@/functions';

export type ListaMaterialesCostosProps = {
  //columns: GridColDef[]
  editMode: boolean;
  createMode: boolean;
  rowsCostos: GridRowsProp;
  setRowsCostos: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  costosIndirectos: CostosIndirectosType[];
  setCostosIndirectos: React.Dispatch<
    React.SetStateAction<CostosIndirectosType[]>
  >;
};

export const ListaMaterialesCostos = (props: ListaMaterialesCostosProps) => {
  const {
    // columns,
    createMode,
    editMode,
    rowsCostos,
    setRowsCostos,
    costosIndirectos,
    setCostosIndirectos,
  } = props;
  //const [rowsCostos, setRowsCostos] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const firstFieldFocus = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState('');
  //const [costosIndirectos, setCostosIndirectos] = useState<CostosIndirectosType[]>([])
  const [productosToSelect, setProductosToSelect] = useState<string[]>([]);

  const unitMesure = Object.keys(MesureUnit)
    .filter((key): key is keyof typeof MesureUnit => isNaN(Number(key)))
    .map((key) => ({ label: key, value: MesureUnit[key] }));

  const columns: GridColDef[] = [
    {
      field: 'cifCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 150,
      editable: true,
      cellClassName: 'centered-grid',
      align: 'center',
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
      field: 'cifName',
      headerName: 'Nombre Producto',
      type: 'string',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'unitMeasureId',
      headerName: 'Unidad',
      width: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      valueGetter: (params) => {
        const unit = params.value;
        const unitName = unit
          ? unitMesure.find((item) => item.value === unit)?.label
          : '';
        return unitName;
      },
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
        <InputChangeDataGridCostos
          params={params}
          rowsCostos={rowsCostos}
          setRowsCostos={setRowsCostos}
          costosIndirectos={costosIndirectos}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          firstFieldFocus={firstFieldFocus}
          addButtonRef={addButtonRef}
          renderAlertMinMax={renderAlertMinMax}
        />
      ),
    },
    {
      field: 'unitCostCif',
      headerName: 'Costo Unitario',
      width: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderEditCell: (params) => (
        <InputChangeDataGridCostos
          params={params}
          rowsCostos={rowsCostos}
          setRowsCostos={setRowsCostos}
          costosIndirectos={costosIndirectos}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          firstFieldFocus={firstFieldFocus}
          addButtonRef={addButtonRef}
          renderAlertMinMax={renderAlertMinMax}
        />
      ),
      type: 'number',
      renderCell: (params) => setDecimalPlacesString(params.value, 6),
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
      type: 'number',
      renderCell: (params) => setDecimalPlacesString(params.value, 6),
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
            await getCostosIndirectos(null, newValue.split(' - ')[1], null);
          if (response) {
            if (response.status === 200) {
              const producto: CostosIndirectosType[] = response.message;
              setCostosIndirectos([...costosIndirectos, producto[0]]);
              const rowIndex = rowsCostos.findIndex(
                (row) => row.id === params.id
              );
              const newRows = [...rowsCostos];
              newRows[rowIndex] = {
                ...newRows[rowIndex],
                productId: null,
                labourId: null,
                costTypeId: RecetaEnum.COSTOS_INDIRECTOS,
                cifId: producto[0].cifId,
                cifCode: producto[0].cifCode,
                cifName: producto[0].cifName,
                unitMeasureId: producto[0].unitMeasureId,
                quantity: 1,
                unitCostCif: producto[0].unitCostCif,
                totalCost: 1 * producto[0].unitCostCif,
                recipeCode: '',
                stateRecipe: true,
              };
              setRowsCostos(newRows);
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
      const rowIndex = rowsCostos.findIndex((row) => row.id === params.id);
      const newRows = [...rowsCostos];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        productId: null,
        labourId: null,
        costTypeId: RecetaEnum.COSTOS_INDIRECTOS,
        cifId: null,
        cifCode: '',
        cifName: '',
        unitMeasureId: '',
        quantity: 1,
        unitCostCif: '',
        totalCost: 1,
        recipeCode: '',
        stateRecipe: true,
      };
      setRowsCostos(newRows);
    }
  };

  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rowsCostos.find((row) => row.id === id);
    if (!currentRow) return;
    const existingRow = rowsCostos.find(
      (row) => row.cifCode === currentRow.cifCode && row.id !== id
    );
    if (existingRow) {
      enqueueSnackbar(
        `Se ha encontrado un producto con el mismo código: ${currentRow.cifCode}`,
        {
          variant: 'info',
        }
      );
      const updatedQuantity =
        parseFloat(existingRow.quantity) + parseFloat(currentRow.quantity);
      //const updatedWeight = existingRow.weight + currentRow.weight;

      const updatedRows = rowsCostos
        .map((row) =>
          row.cifCode === currentRow.cifCode
            ? { ...row, quantity: updatedQuantity }
            : row
        )
        .filter((row) => row.id !== currentRow.id);
      setRowsCostos(updatedRows);
    } else {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    const rowToDelete = rowsCostos.find((row) => row.id === id);
    if (rowToDelete) {
      const productCodeToDelete = rowToDelete.cifCode;
      const updatedProductosList = costosIndirectos.filter(
        (item) => item.cifCode !== productCodeToDelete
      );
      setCostosIndirectos(updatedProductosList);
      setRowsCostos(rowsCostos.filter((row) => row.id !== id));
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rowsCostos.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRowsCostos(rowsCostos.filter((row) => row.id !== id));
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    const currentRow = rowsCostos.find((row) => row.id === params.id);
    if (!currentRow) return;

    const existingRow = rowsCostos.find(
      (row) => row.cifCode === currentRow.cifCode && row.id !== params.id
    );

    if (existingRow) {
      enqueueSnackbar(
        `Se ha encontrado un producto con el mismo código: ${currentRow.cifCode}`,
        {
          variant: 'info',
        }
      );
      const updatedQuantity =
        parseFloat(existingRow.quantity) + parseFloat(currentRow.quantity);
      //const updatedWeight = existingRow.weight + currentRow.weight;

      const updatedRows = rowsCostos
        .map((row) =>
          row.productCode === currentRow.productCode
            ? { ...row, quantity: updatedQuantity }
            : row
        )
        .filter((row) => row.id !== currentRow.id);

      setRowsCostos(updatedRows);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRowsCostos(
      rowsCostos.map((row) => (row.id === newRow.id ? updatedRow : row))
    );
    return updatedRow;
  };

  const renderAlertMinMax = (product: ProductoByBodegaType) => {
    const showMinimum =
      product.availableQuantity + product.quantity < product.minimumQuantity;
    const showMaximum =
      product.availableQuantity + product.quantity > product.maximumQuantity;
    if (showMinimum)
      enqueueSnackbar(
        `La cantidad del producto ${product.productCode} está por debajo del MÍNIMO recomendado que es: ${product.minimumQuantity}`,
        {
          variant: 'warning',
        }
      );
    if (showMaximum)
      enqueueSnackbar(
        `La cantidad del producto ${product.productCode} está por arriba del MÁXIMO recomendado que es: ${product.maximumQuantity}`,
        {
          variant: 'warning',
        }
      );
  };

  useEffect(() => {
    if (!inputValue.includes(' ') && inputValue.length >= 3) {
      const fetchData = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getCostosIndirectos(null, null, inputValue);
          if (response) {
            if (response.status === 200) {
              setProductosToSelect(
                response.message.map((p: CostosIndirectosType) =>
                  p.cifId
                    ?.toString()
                    .concat(' - ', p.cifCode.concat(' - ', p.cifName))
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
    <StyledDataGrid
      rows={rowsCostos}
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
        toolbar: EditToolbarCostos,
        noRowsOverlay: CustomNoRowsOverlay,
        //footer: CustomFooterStatusComponent,
      }}
      slotProps={{
        toolbar: {
          setRows: setRowsCostos,
          setRowModesModel,
          firstFieldFocus,
          createMode,
          editMode,
          //sucursalUser,
          addButtonRef,
          rows: rowsCostos,
          setCostosIndirectos,
          renderAlertMinMax,
        },
        footer: { rows: rowsCostos },
      }}
      sx={{
        height: rowsCostos.length > 0 ? '100%' : '300px',
      }}
    />
  );
};
