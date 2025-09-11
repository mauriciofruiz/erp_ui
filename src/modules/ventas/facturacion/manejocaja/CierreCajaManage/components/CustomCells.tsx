import { ParametersEnum } from '@/enums';
import { allowDecimalsMeaseurementUnit } from '@/functions';
import { useProductoAsync } from '@/hooks';
import { ProductoByBodegaType, RetencionType } from '@/types';
import { Autocomplete, Chip, TextField, Tooltip } from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import {
  GridRenderEditCellParams,
  GridRowId,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import { debounce } from 'lodash';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';

interface AutocompleteEditInputCellProps {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  sucursalId: number;
  enqueueSnackbar: (message: string, options?: any) => void;
  styles: ClassNameMap;
}

interface RetencionMultipleProps {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  retencionList: RetencionType[];
  styles: ClassNameMap;
}

export function AutocompleteEditProductCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows, sucursalId, enqueueSnackbar, styles } = props;

  const apiRef = useGridApiContext();

  const [productosList, setProductosList] = useState<ProductoByBodegaType[]>(
    []
  );

  const { fetchBySucursalAndParam } = useProductoAsync();

  const [inputValue, setInputValue] = useState('');

  const reference = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: ProductoByBodegaType
  ) => {
    event.stopPropagation();
    setInputValue('');
    if (newValue.availableQuantity <= 0) {
      enqueueSnackbar('No hay dispone de este producto en su bodega', {
        variant: 'warning',
      });
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: '',
      });
      setProductosList([]);
    } else {
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: newValue.productName,
      });
      apiRef.current.setEditCellValue({
        field: 'quantity',
        id: params.id,
        value: 1,
      });

      apiRef.current.setEditCellValue({
        id: params.id,
        field: 'unitMeasureId',
        value: newValue.measurementUnitId,
      });

      handleAutocompleteChange(event, newValue, params);
    }
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
    newValue: ProductoByBodegaType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          productId: newValue.productId,
          productCode: newValue.productCode,
          productName: newValue.productName,
          quantity: 1,
          unitPrice: newValue.unitPrice,
          availableQuantity: newValue.availableQuantity,
          unitMeasureId: newValue.measurementUnitId,
        };
        setRows(newRows);
      }
    }
  };

  useEffect(() => {
    const fetchProductos = async (id: number) => {
      const response = await fetchBySucursalAndParam(id, inputValue);
      if (response) {
        setProductosList(response as ProductoByBodegaType[]);
      }
    };
    if (sucursalId && sucursalId !== null && inputValue.length > 3) {
      fetchProductos(sucursalId);
    }
  }, [inputValue]);

  return (
    <Autocomplete
      ref={reference}
      value={getValue()}
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      onInputChange={debounce(onInputChange, 500)}
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
      renderOption={(props, option: ProductoByBodegaType) => (
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

export function RetencionMultipleCell(props: RetencionMultipleProps) {
  const { params, rows, setRows, retencionList, styles } = props;

  const apiRef = useGridApiContext();

  const reference = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: RetencionType[]
  ) => {
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue,
    });
    handleAutocompleteChange(event, newValue, params);
  };

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: RetencionType[],
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      const retentionSourceId = newValue.find(
        (retencion) =>
          retencion.retentionType ===
          ParametersEnum.RETENCION_FUENTE_PARAMETER.toString()
      )?.retentionId;
      const retentionIVAId = newValue.find(
        (retencion) =>
          retencion.retentionType ===
          ParametersEnum.RETENCION_IVA_PARAMETER.toString()
      )?.retentionId;
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          retentionSourceId,
          retentionIVAId,
          retentions: newValue,
        };
        setRows(newRows);
      }
    }
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);

  return (
    <Autocomplete
      ref={reference}
      value={getValue()}
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      multiple
      options={retencionList}
      getOptionLabel={(option) =>
        `${option.retencionCode} - ${option.retentionDetail}`
      }
      isOptionEqualToValue={(option, value) => option === value}
      filterSelectedOptions
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
      renderTags={(value, getTagProps) => (
        <div style={{ display: 'width', maxWidth: '350px' }}>
          {value.map((option, index) => (
            <Tooltip
              title={`${option.retencionCode} - ${option.retentionDetail}`}
              placement="top-start"
            >
              <Chip
                variant="outlined"
                {...getTagProps({ index })}
                style={{ maxWidth: '100%', marginBottom: '5px' }}
                label={`${option.retencionCode} - ${option.retentionDetail}`}
              />
            </Tooltip>
          ))}
        </div>
      )}
    />
  );
}

export function InputQuantityFunction(props: {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
}) {
  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = props.rows.find((row) => row.id === id);
    if (row === undefined) return;

    if (row) {
      let returnQuantity = value;
      const availableQuantity = row.availableQuantity;
      if (returnQuantity > availableQuantity) {
        enqueueSnackbar(
          `La cantidad ingresada supera la cantidad disponible del producto`,
          {
            variant: 'warning',
          }
        );
        returnQuantity = availableQuantity;
      } else if (returnQuantity <= 0) {
        enqueueSnackbar(`La cantidad ingresada debe ser mayor a 0`, {
          variant: 'warning',
        });
        returnQuantity = 1;
      }
      apiRef.current.setEditCellValue({
        id: id,
        field: props.params.field,
        value: returnQuantity,
      });
    }
  };

  const getDecimalPlaces = (id: GridRowId) => {
    const row = props.rows.find((row) => row.id === id);
    const allowedDecimals =
      row && allowDecimalsMeaseurementUnit(row.unitMeasureId);

    return allowedDecimals ? 4 : 0;
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) => onQuantityChange(value, props.params.id)}
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={getDecimalPlaces(props.params.id)}
      onFocus={(e) => e.target.select()}
    />
  );
}
