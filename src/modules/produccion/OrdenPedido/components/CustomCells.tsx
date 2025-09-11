import { getProductsReceta } from '@/backend';
import { useStyles } from '@/hooks';
import { ServerResponseType } from '@/store';
import { ProductoRecetaType } from '@/types';
import { Autocomplete, TextField } from '@mui/material';
import {
  GridRenderEditCellParams,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

export function AutocompleteEditProductCell(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  enqueueSnackbar: (message: string, options?: any) => void;
}) {
  const styles = useStyles();

  const { params, setRows, enqueueSnackbar } = props;

  const apiRef = useGridApiContext();

  const [productosList, setProductosList] = useState<ProductoRecetaType[]>([]);

  const [inputValue, setInputValue] = useState('');

  const reference = useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: ProductoRecetaType
  ) => {
    event.stopPropagation();
    setInputValue('');

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.productName,
    });

    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'quantity',
      value: 1,
    });

    handleAutocompleteChange(event, newValue, params);
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);

  const onInputChange = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    const regex = /^[a-zA-Z0-9]+$/; // Esta regex permite letras, números
    const validInput = newInputValue.length > 3 && regex.test(newInputValue);
    if (event !== null && validInput) {
      event.preventDefault();
      setInputValue(newInputValue);
    }
  };

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: ProductoRecetaType | null,
    params: GridRenderEditCellParams
  ) => {
    if (!newValue || !event) return;
    const row = apiRef.current.getRowParams(params.id).row;
    const newRow = {
      ...row,
      productId: newValue.productId,
      productCode: newValue.productCode,
      productName: newValue.productName,
      quantity: 1,
      observation: '',
      currentAverageCost: newValue.currentAverageCost,
      measurementUnitId: newValue.measurementUnitId,
    };
    const newRows = apiRef.current
      .getAllRowIds()
      .map((r) =>
        r === params.id ? newRow : apiRef.current.getRowParams(r).row
      );
    setRows(newRows);
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getProductsReceta(inputValue, null, true, null, true, null);
        if (response) {
          if (response.status === 200) {
            const producto: ProductoRecetaType[] = response.message;
            setProductosList(producto);
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
    if (inputValue.length > 3) {
      fetchProductos();
    }
  }, [inputValue]);

  return (
    <Autocomplete
      ref={reference}
      value={getValue()}
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      onInputChange={debounce(onInputChange, 300)}
      filterOptions={(options) => options}
      fullWidth
      options={productosList}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      getOptionLabel={(option) => option.productName ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) =>
        option.productName.includes(value)
      }
      renderOption={(props, option: ProductoRecetaType) => (
        <li {...props} key={option.productId}>
          {option.productCode} - {option.productName}
        </li>
      )}
      renderInput={(params) => {
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
  );
}
