import { getDecimalPlaces } from '@/functions';
import { useStyles } from '@/hooks';
import { ProductoByBodegaType } from '@/types';
import { Autocomplete, Popper, TextField } from '@mui/material';
import {
  GridRenderEditCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { InputNumber } from 'antd';
import { KeyboardEvent, useCallback, useEffect, useRef } from 'react';

export interface AutocompleteEditInputCellProps {
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  params: GridRenderEditCellParams;
  options: any[];
  freeSolo?: boolean;
  multiple?: boolean;
  getOptionLabel?: (option: any) => string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: any,
    params: GridRenderEditCellParams
  ) => void;
}

export function AutocompleteEditInputCell(
  props: AutocompleteEditInputCellProps
) {
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

export function InputChangeDataGrid(props: {
  productosByBodegaList: ProductoByBodegaType[];
  rows: GridRowsProp;
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  renderAlertMinMax: (product: ProductoByBodegaType) => void;
}) {
  const {
    params,
    setRows,
    productosByBodegaList,
    rows,
    renderAlertMinMax,
    setRowModesModel,
  } = props;

  const apiRef = useGridApiContext();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      const product = productosByBodegaList.find(
        (item) => item.productCode === row.productCode
      );

      if (product) {
        if (!product.isService) {
          if (product.availableQuantity < value) {
            value = product.availableQuantity;
          }
        }

        apiRef.current.setEditCellValue({
          id: id,
          field: 'quantity',
          value: value,
        });

        const updatedWeight = (value * product.weight).toFixed(2);
        apiRef.current.setEditCellValue({
          id: id,
          field: 'weight',
          value: updatedWeight,
        });

        const productoCheck = {
          ...product,
          quantity: value,
          weight: Number(updatedWeight),
        };

        if (!product.isService) {
          renderAlertMinMax(productoCheck);
        }
        const rowIndex = rows.findIndex((rowProp) => rowProp.id === id);

        const newRows = [...props.rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          quantity: value,
          quantityApproved: value,
          weight: updatedWeight,
        };
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
            productCode: '',
            productName: '',
            availableQuantity: 0,
            quantity: 0,
            quantityApproved: 0,
            weight: 0,
            productObservation: '',
            state: null,
          },
        ]);

        setRowModesModel({
          ...props.rowModesModel,
          [id]: { mode: GridRowModes.Edit },
        });

        event.preventDefault(); // Prevent default tab behavior
        // Simulate an Enter key press
        const enterEvent = new Event('keydown', {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperties(enterEvent, {
          key: { value: 'Enter' },
          keyCode: { value: 13 },
        });
        event.target.dispatchEvent(enterEvent);

        if (props.addButtonRef.current) {
          setTimeout(() => {
            props.addButtonRef.current?.focus();
          }, 100);
        }
        break;
      default:
    }
  };
  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return 0;
  }, [params.value]);

  return (
    <InputNumber
      ref={reference}
      min={1}
      value={getValue()}
      onChange={(value) => onQuantityChange(value, params.id)}
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={getDecimalPlaces(params.row.measurementUnitId)}
      onFocus={(e) => e.target.select()}
      onKeyDown={handleKeyDown}
    />
  );
}
