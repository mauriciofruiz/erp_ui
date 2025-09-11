import { RequestPurchaseEnum } from '@/enums';
import { FormState } from '@/hooks';
import { ProductoByBodegaType } from '@/types';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderEditCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction } from 'react';
import {
  AutocompleteEditInputCell,
  InputChangeDataGrid,
  InputChangeQuantityApproved,
} from './CustomCells';
import { Tooltip } from '@mui/material';
import { Cancel, Delete, DoNotDisturb, Edit, Save } from '@mui/icons-material';
import { getDecimalPlaces, setDecimalPlacesString } from '@/functions';

interface ColumnsDefinitionProps {
  createMode: boolean;
  editMode: boolean;
  formState: FormState;
  rows: readonly GridValidRowModel[];
  setRows: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  rowModesModel: GridRowModesModel;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  productosByBodegaList: ProductoByBodegaType[];
  setProductosByBodegaList: Dispatch<SetStateAction<ProductoByBodegaType[]>>;
  isApprovable: boolean;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  productosToSelect: any[];
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: any,
    params: GridRenderEditCellParams
  ) => void;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  renderAlertMinMax: (product: ProductoByBodegaType) => void;
}

export const ColumnsDefinition = (
  props: ColumnsDefinitionProps
): GridColDef[] => {
  const {
    formState,
    createMode,
    editMode,
    rows,
    setRows,
    rowModesModel,
    setRowModesModel,
    productosByBodegaList,
    setProductosByBodegaList,
    isApprovable,
    firstFieldFocus,
    addButtonRef,
    productosToSelect,
    onAutocompleteChange,
    setInputValue,
    renderAlertMinMax,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
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

  const handleNegateClick = (id: GridRowId) => () => {
    const currentRow = rows.find((row) => row.id === id);
    const currentState = currentRow?.state == null ? false : null;
    if (!currentRow) return;

    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, state: currentState } : row
    );
    setRows(updatedRows);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    // Find the row to be deleted in rows
    const rowToDelete = rows.find((row) => row.id === id);

    if (rowToDelete) {
      // Get the product code of the row to be deleted
      const productCodeToDelete = rowToDelete.productCode;

      // Filter out the item with the matching productCode from productosByBodegaList
      const updatedProductosList = productosByBodegaList.filter(
        (item) => item.productCode !== productCodeToDelete
      );

      // Update the productosByBodegaList with the filtered list
      setProductosByBodegaList(updatedProductosList);

      // Finally, remove the row from rows state
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

  const columns: GridColDef[] = [
    {
      field: 'productCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      editable: true,
      cellClassName: 'centered-grid',
      renderEditCell: (params) => (
        <AutocompleteEditInputCell
          params={params}
          options={productosToSelect}
          freeSolo={false}
          multiple={false}
          onAutocompleteChange={(event, newValue) =>
            onAutocompleteChange(event, newValue, params)
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
      align: 'left',
      minWidth: 70,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
    },
    {
      field: 'availableQuantity',
      headerName: 'Cantidad Disponible',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      renderCell: (params) =>
        setDecimalPlacesString(
          params.value,
          getDecimalPlaces(params.row.measurementUnitId)
        ),
    },
    {
      field: 'quantity',
      headerName: 'Cantidad Solicitada',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      minWidth: 50,
      flex: 0.5,
      editable: !isApprovable,
      sortable: false,
      renderCell: (params) =>
        setDecimalPlacesString(
          params.value,
          getDecimalPlaces(params.row.measurementUnitId)
        ),
      renderEditCell: (params) => (
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
      ),
    },
    {
      field: 'weight',
      headerName: 'Peso',
      align: 'right',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => setDecimalPlacesString(params.value, 4),
    },
  ];

  if (formState.tipoAbastecimiento !== 1) {
    columns.push({
      field: 'cdaQuantity',
      headerName: 'Cantidad CDA',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      type: 'number',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      renderCell: (params) =>
        setDecimalPlacesString(
          params.value,
          getDecimalPlaces(params.row.measurementUnitId)
        ),
    });
  }

  if (
    isApprovable ||
    (!createMode &&
      formState &&
      (formState.stateRequestPurchaseId === RequestPurchaseEnum.APROBADO ||
        formState.stateRequestPurchaseId === RequestPurchaseEnum.NEGADO))
  ) {
    columns.push(
      {
        field: 'productObservation',
        headerName: 'Observación',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        type: 'string',
        minWidth: 100,
        flex: 1,
        editable: isApprovable,
        sortable: false,
        valueGetter: (params) => {
          return params.row.productObservation
            ? params.row.productObservation.toUpperCase()
            : '';
        },
      },
      {
        field: 'quantityApproved',
        headerName: 'Cantidad Aprobada',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'right',
        minWidth: 50,
        flex: 0.5,
        editable: isApprovable,
        sortable: false,
        renderCell: (params) =>
          setDecimalPlacesString(
            params.value,
            getDecimalPlaces(params.row.measurementUnitId)
          ),
        renderEditCell: (params) => (
          <InputChangeQuantityApproved
            params={params}
            rows={rows}
            setRows={setRows}
            productosByBodegaList={productosByBodegaList}
            setRowModesModel={setRowModesModel}
            rowModesModel={rowModesModel}
            firstFieldFocus={firstFieldFocus}
            addButtonRef={addButtonRef}
          />
        ),
      }
    );
  }

  if (isApprovable && editMode) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 50,
      flex: 0.5,
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
            <Tooltip title="Negar / Aprobar">
              <GridActionsCellItem
                icon={<DoNotDisturb />}
                label="Negar"
                sx={{
                  color: 'primary.main',
                }}
                onClick={handleNegateClick(id)}
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

  return columns;
};
