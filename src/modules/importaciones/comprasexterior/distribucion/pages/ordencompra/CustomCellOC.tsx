import { getProductosByProveedor } from '@/backend';
import { useStyles } from '@/hooks';
import { ProveedorProductoType } from '@/types';
import { Autocomplete, TextField } from '@mui/material';
import {
  GridRenderEditCellParams,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AutocompleteEditInputCellProps {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  providerId?: number;
}

export function AutocompleteEditProductCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows, providerId } = props;

  const apiRef = useGridApiContext();

  const styles = useStyles();

  const [productoList, setProductosList] = useState<ProveedorProductoType[]>(
    []
  );

  const [inputValue, setInputValue] = useState('');

  const reference = useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: ProveedorProductoType
  ) => {
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'productId',
      value: newValue.productId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'productCode',
      value: newValue.productCode,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.productName,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'unitPrice',
      value: newValue.cost,
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
    if (event !== null && newInputValue.length > 3) {
      event.preventDefault();
      setInputValue(newInputValue);
    }
  };

  useEffect(() => {
    const fetchProductos = async (id: number) => {
      const response = await getProductosByProveedor(inputValue, id);
      if (response) {
        setProductosList(response);
      }
    };
    if (providerId !== undefined && providerId !== 0 && inputValue.length > 3)
      fetchProductos(providerId);
  }, [inputValue]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: ProveedorProductoType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          documentCode: '',
          productId: newValue.productId,
          productCode: newValue.productCode,
          productName: newValue.productName,
          quantity: 0,
          unitPrice: newValue.cost,
          totalPrice: 0,
          fodinfaValue: 0,
          advaloremValue: 0,
          unitMeasureId: newValue.unitMeasureId,
        };
        setRows(newRows);
      }
    }
  };

  return (
    <Autocomplete
      ref={reference}
      value={getValue()}
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      onInputChange={onInputChange}
      fullWidth
      options={productoList ?? []}
      filterOptions={(options) => options}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      disableClearable
      getOptionLabel={(option) => option.productName || option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.productCode === value}
      renderOption={(props, option: ProveedorProductoType) => (
        <li {...props} key={option.providerProductId}>
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
