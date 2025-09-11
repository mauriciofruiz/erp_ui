import { AutocompleteEditInputCellProps, getDecimalPlaces } from '@/functions';
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
import { useSnackbar } from 'notistack';
import { KeyboardEvent, useCallback, useEffect, useRef } from 'react';

export function InputChangeQuantityApproved(props: {
  productosByBodegaList: ProductoByBodegaType[];
  rows: GridRowsProp;
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const apiRef = useGridApiContext();

  const reference = useRef<HTMLInputElement>(null);

  const { params, setRows } = props;

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = props.rows.find((row) => row.id === id);

    if (row) {
      const product = props.productosByBodegaList.find(
        (item) => item.productCode === row.productCode
      );

      if (product) {
        apiRef.current.setEditCellValue({
          id: id,
          field: 'quantityApproved',
          value: value,
        });

        const updatedWeight = (value * product.weight).toFixed(2);
        apiRef.current.setEditCellValue({
          id: id,
          field: 'weight',
          value: updatedWeight,
        });
        const rowIndex = props.rows.findIndex((rowProp) => rowProp.id === id);

        const newRows = [...props.rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
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
        props.setRows((oldRows) => [
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

        props.setRowModesModel({
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
      precision={getDecimalPlaces(params.row.unitMeasureId as number)}
      onFocus={(e) => e.target.select()}
      style={{ flex: 1 }}
      onKeyDown={handleKeyDown}
    />
  );
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
    (event: React.SyntheticEvent<Element, Event>, newValue: any) => {
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
  const { params, setRows } = props;

  const apiRef = useGridApiContext();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = props.rows.find((row) => row.id === id);
    if (row) {
      const product = props.productosByBodegaList.find(
        (item) => item.productCode === row.productCode
      );

      if (product) {
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
        props.renderAlertMinMax(productoCheck);
        const rowIndex = props.rows.findIndex((rowProp) => rowProp.id === id);

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
        props.setRows((oldRows) => [
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

        props.setRowModesModel({
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
      precision={getDecimalPlaces(params.row.unitMeasureId as number)}
      onFocus={(e) => e.target.select()}
      style={{ flex: 1 }}
      onKeyDown={handleKeyDown}
    />
  );
}

type CustomCellProps = {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

export function CustomNumberCell({ params, rows, setRows }: CustomCellProps) {
  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number) => {
    const row = rows.find((row) => row.id === params.id);
    if (row === undefined) return;

    let quantity = value || 0;

    if (quantity < 0) {
      enqueueSnackbar('La cantidad no puede ser menor a 0', {
        variant: 'error',
      });
      quantity = 0;
    }

    const total = row.denomination * quantity;

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: quantity,
    });

    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'total',
      value: total,
    });

    const rowIndex = rows.findIndex((rowProp) => rowProp.id === params.id);

    const newRows = [...rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      quantity,
      total,
    };

    setRows(newRows);
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return 0;
  }, [params.value]);

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={getValue()}
      onChange={(value) => onQuantityChange(value)}
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={0}
      onFocus={(e) => e.target.select()}
    />
  );
}
