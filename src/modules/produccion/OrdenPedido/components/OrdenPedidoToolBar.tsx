import { getProductsReceta } from '@/backend/inventario/recetaServices';
import {
  AutocompleteEditInputCellProps,
  getDecimalPlaces,
  setDecimalPlaces,
} from '@/functions';
import { useStyles } from '@/hooks';
import { ServerResponseType } from '@/store';
import { ProductoRecetaType, SucursalType } from '@/types';
import { Add, CloudUpload } from '@mui/icons-material';
import { Autocomplete, Button, Input, Popper, TextField } from '@mui/material';
import {
  GridRenderEditCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarContainer,
  useGridApiContext,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { InputNumber } from 'antd';
import { useSnackbar } from 'notistack';
import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
} from 'react';
import * as XLSX from 'xlsx';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  createMode: boolean;
  editMode: boolean;
  sucursalUser: SucursalType;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  rows: GridRowsProp;
}

export function AutocompleteEditOP(props: AutocompleteEditInputCellProps) {
  const {
    params,
    options,
    onAutocompleteChange,
    firstFieldFocus,
    setInputValue,
  } = props;
  const apiRef = useGridApiContext();
  const styles = useStyles();

  const handleChange = useCallback(
    async (event: React.SyntheticEvent<Element, Event>, newValue: any) => {
      event.stopPropagation();
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: newValue.split(' - ')[1],
      });
      apiRef.current.setEditCellValue({
        id: params.id,
        field: 'quantity',
        value: 1,
      });

      onAutocompleteChange?.(event, newValue, params);
    },
    [params.id, params.field]
  );

  const getValue = useCallback(() => {
    if (params.value) return params.value;
    return null;
  }, [params.value]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Tab': {
        event.preventDefault();
        if (firstFieldFocus?.current) {
          firstFieldFocus.current.focus();
        }
        break;
      }
      default:
    }
  };

  const onInputChangeFunction = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setInputValue(newInputValue);
    }
  };

  return (
    <div>
      <Autocomplete
        value={getValue()}
        className={styles.genericFieldStyle}
        style={{ width: '100%' }}
        onChange={handleChange}
        onInputChange={onInputChangeFunction}
        fullWidth
        options={options ?? []}
        filterOptions={(options) => options}
        autoHighlight
        autoSelect
        handleHomeEndKeys
        disableClearable
        getOptionLabel={(option) => {
          if (/^\d+ - /.test(option)) {
            return option.substring(option.indexOf(' - ') + 3);
          }
          return option;
        }}
        noOptionsText="Sin resultados"
        isOptionEqualToValue={(option, value) => option.includes(value)}
        PopperComponent={({ children, ...popperProps }) => (
          <Popper
            {...popperProps}
            placement="bottom-start"
            style={{ width: 'auto', minWidth: '200px' }}
          >
            {children}
          </Popper>
        )}
        renderInput={(params) => {
          params.inputProps.onKeyDown = handleKeyDown;
          return (
            <TextField
              {...params}
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                className: styles.textBlackStyle,
              }}
            />
          );
        }}
      />
    </div>
  );
}

export function EditToolbarOrdenPedido(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    createMode,
    editMode,
    addButtonRef,
    rows,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        productId: null,
        productCode: '',
        productName: '',
        quantity: 0,
        observation: '',
      },
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' },
    }));
  };

  const fetchMateriales = async (productFromExcel: any) => {
    try {
      const response: ServerResponseType | undefined = await getProductsReceta(
        productFromExcel.productCode,
        null,
        null,
        true,
        null,
        null
      );
      if (response) {
        if (response.status === 200) {
          const producto: ProductoRecetaType = response.message[0];
          return producto;
        } else {
          enqueueSnackbar(`No se pudo cargar el producto: ${response.status}`, {
            variant: 'error',
          });
          return undefined;
        }
      }
    } catch (error) {
      enqueueSnackbar('Existió un error de conexión', {
        variant: 'error',
      });
      return undefined;
    }
  };

  const fetchAllProductos = async (json: any[]) => {
    const promises = json.map((productFromExcel) =>
      fetchMateriales(productFromExcel)
    );
    return Promise.all(promises);
  };

  const importExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        // parse data
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any = XLSX.utils.sheet_to_json(worksheet);

        const filteredJson = (json as any[]).reduce(
          (acc: any[], producto: any) => {
            const found = acc.find(
              (item) => item.productCode === producto.productCode
            );
            if (found) {
              found.quantity += producto.quantity;
            } else {
              acc.push({ ...producto });
            }
            return acc;
          },
          [] as any[]
        );

        const productosList = await fetchAllProductos(filteredJson);

        filteredJson.forEach((productFromExcel: any) => {
          const producto = productosList.find(
            (item) =>
              item?.productCode === productFromExcel.productCode.toString()
          );

          const existingRow = rows.find(
            (row) => row.productCode === productFromExcel.productCode.toString()
          );

          if (existingRow && producto) {
            enqueueSnackbar(
              `Se ha encontrado un producto con el mismo código: ${productFromExcel.productCode}`,
              {
                variant: 'info',
              }
            );
            const updatedQuantity =
              parseFloat(existingRow.quantity) +
              (isNaN(productFromExcel.quantity)
                ? 0
                : parseFloat(productFromExcel.quantity));
            //renderAlertMinMax({ ...producto, quantity: updatedQuantity });
            // const updatedWeight =
            //     existingRow.weight +
            //     (producto ? producto?.weight * productFromExcel.quantity : 0);

            const updatedRows = rows.map((row) =>
              row.productCode === productFromExcel.productCode.toString()
                ? {
                    ...row,
                    quantity: updatedQuantity,
                    // weight: updatedWeight,
                    // quantityApproved: updatedQuantity,
                  }
                : row
            );

            setRows((oldRows) => (oldRows !== null ? updatedRows : []));
          } else if (producto) {
            const id = randomId();
            const quantityGet = isNaN(productFromExcel.quantity)
              ? 0
              : parseFloat(productFromExcel.quantity);

            //renderAlertMinMax({ ...producto, quantity: quantityGet });
            setRows((oldRows) => [
              ...oldRows,
              {
                id,
                productId: producto.productId,
                productCode: productFromExcel.productCode.toString(),
                productName: producto?.productName,
                quantity: quantityGet,
                observation: '',
              },
            ]);
          } else {
            enqueueSnackbar(
              `No existe el producto con el código: ${productFromExcel.productCode}`,
              {
                variant: 'error',
              }
            );
          }
        });
        enqueueSnackbar('Archivo Cargado Correctamente', {
          variant: 'success',
        });
      };

      reader.readAsBinaryString(file);
    } else {
      enqueueSnackbar('No se pudo cargar el archivo', { variant: 'error' });
    }
  };
  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      {createMode ? (
        <label htmlFor="file-upload">
          <Input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            disabled={!createMode && !editMode}
            onChange={importExcel}
          />
          <Button
            variant="contained"
            color="primary"
            component="span"
            startIcon={<CloudUpload />}
            disabled={!createMode && !editMode}
            fullWidth
            sx={{ mb: 2, mt: 1 }}
          >
            Subir Archivo
          </Button>
        </label>
      ) : null}
      <Button
        id="addButonProduct"
        ref={addButtonRef}
        color="primary"
        startIcon={<Add />}
        onClick={handleClick}
        disabled={!createMode && !editMode}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1 }}
      >
        Agregar Item
      </Button>
    </GridToolbarContainer>
  );
}

export function InputChangeDataGridOrden(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const { params, setRows, setRowModesModel, addButtonRef } = props;

  const apiRef = useGridApiContext();

  const reference = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = params.row;
    if (row) {
      const fieldName = params.field;
      if (fieldName === 'quantity') {
        apiRef.current.setEditCellValue({
          id: id,
          field: 'quantity',
          value: value,
        });
        const updateTotalCost = setDecimalPlaces(
          value * row.currentAverageCost,
          2
        );
        apiRef.current.setEditCellValue({
          id: id,
          field: 'totalCost',
          value: updateTotalCost,
        });
        const newRow = {
          ...row,
          quantity: value,
          totalCost: updateTotalCost,
        };
        const newRows = apiRef.current
          .getAllRowIds()
          .map((r) =>
            r === params.id ? newRow : apiRef.current.getRowParams(r).row
          );
        setRows(newRows);
      } else if (fieldName === 'quantityProduced') {
        apiRef.current.setEditCellValue({
          id: id,
          field: 'quantityProduced',
          value: value,
        });
        const newRow = {
          ...row,
          quantityProduced: value,
        };
        const newRows = apiRef.current
          .getAllRowIds()
          .map((r) =>
            r === params.id ? newRow : apiRef.current.getRowParams(r).row
          );
        setRows(newRows);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Delete':
        event.currentTarget.value = '';
        break;

      case 'Tab':
        const id = randomId();
        setRows((oldRows) => [
          ...oldRows,
          {
            id,
            productId: null,
            productCode: '',
            productName: '',
            quantity: 0,
            observation: '',
          },
        ]);

        setRowModesModel((oldModel) => ({
          ...oldModel,
          [id]: { mode: GridRowModes.Edit },
        }));

        event.preventDefault(); // Prevent default tab behavior

        if (addButtonRef.current) {
          setTimeout(() => {
            addButtonRef.current?.focus();
          }, 100);
        }
        break;
      default:
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={params.value !== null ? params.value : 0}
      onChange={(value) => onQuantityChange(value, params.id)}
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      onKeyDown={handleKeyDown}
      onFocus={(e) => e.target.select()}
      precision={getDecimalPlaces(params.row.measurementUnitId)}
    />
  );
}

export function InputObersvationGridOrden(props: {
  materiales: ProductoRecetaType[];
  rows: GridRowsProp;
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const apiRef = useGridApiContext();
  const reference = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onObservationChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: GridRowId,
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    let inputValue = event.target.value;

    apiRef.current.setEditCellValue({
      id: id,
      field: 'observation',
      value: event.target.value,
    });

    const rowIndex = props.rows.findIndex((rowProp) => rowProp.id === id);

    const newRows = [...props.rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      observation: inputValue,
    };
    setRows(newRows);
  };

  return (
    <div>
      <input
        id="myInput"
        ref={reference}
        type="text"
        value={props.params.value !== null ? props.params.value : ''}
        onChange={(event) =>
          onObservationChange(event, props.params.id, props.setRows)
        }
        onFocus={(e) => e.target.select()}
        style={{ width: '95%', border: 'none', boxShadow: 'none' }}
      />
    </div>
  );
}
