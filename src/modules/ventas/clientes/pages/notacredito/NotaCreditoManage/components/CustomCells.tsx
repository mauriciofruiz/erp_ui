import { ParametersEnum } from '@/enums';
import { allowDecimalsMeaseurementUnit, setDecimalPlaces } from '@/functions';
import { useStyles } from '@/hooks';
import { TaxRateInterface } from '@/types';
import { Autocomplete, TextField } from '@mui/material';
import {
  GridEditBooleanCell,
  GridRowId,
  useGridApiContext,
} from '@mui/x-data-grid';
import { GridRenderEditCellParams, GridRowsProp } from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useRef } from 'react';

export function InputQuantityFunction(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
}) {
  const { params, setRows } = props;

  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = apiRef.current.getRowParams(id).row;
    if (row) {
      const invoiceQuantity = row.invoiceQuantity;
      if (value > invoiceQuantity) {
        enqueueSnackbar(
          `La cantidad ingresada no puede ser mayor a la cantidad de la factura de ${invoiceQuantity}`,
          {
            variant: 'warning',
          }
        );
        value = invoiceQuantity;
      }
      if (value < 0) {
        enqueueSnackbar(`La cantidad ingresado debe ser mayor o igual a 0`, {
          variant: 'warning',
        });
        value = 0;
      }

      apiRef.current.setEditCellValue({
        id: id,
        field: params.field,
        value: value,
      });

      const totalPrice = setDecimalPlaces(row.unitPrice * value, 2);

      const discountPercentage = row.paymentMethodDiscountPercentage;

      const paymentMethodDiscountValue = totalPrice * discountPercentage;

      const totalAfterDiscount = totalPrice - paymentMethodDiscountValue;

      const newRow = {
        ...row,
        returnedQuantity: value,
        totalAfterDiscount,
        totalPrice,
        paymentMethodDiscountValue,
      };
      const newRows = apiRef.current
        .getAllRowIds()
        .map((r) => (r === id ? newRow : apiRef.current.getRowParams(r).row));
      setRows(newRows);
    }
  };

  const getDecimalPlaces = (unitMeasureId: number) => {
    if (allowDecimalsMeaseurementUnit(unitMeasureId)) {
      return 6;
    }
    return 0;
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
    />
  );
}

export function InputValueFunction(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
}) {
  const { params, setRows } = props;

  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = apiRef.current.getRowParams(id).row;
    if (row) {
      if (value < 0) {
        enqueueSnackbar(`La cantidad ingresado debe ser mayor o igual a 0`, {
          variant: 'warning',
        });
        value = 0;
      }

      const unitPrice = setDecimalPlaces(value, 2);
      apiRef.current.setEditCellValue({
        id: id,
        field: params.field,
        value: unitPrice,
      });

      const totalPrice = unitPrice;

      const totalAfterDiscount = totalPrice;

      const newRow = {
        ...row,
        unitPrice,
        totalAfterDiscount,
        totalPrice,
      };
      const newRows = apiRef.current
        .getAllRowIds()
        .map((r) => (r === id ? newRow : apiRef.current.getRowParams(r).row));
      setRows(newRows);
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
      precision={2}
      onFocus={(e) => e.target.select()}
      style={{ flex: 1 }}
    />
  );
}

export function ImpuestoBooleanCell(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
}) {
  const { params, setRows } = props;

  const apiRef = useGridApiContext();

  const handleBooleanChange = (event: React.FormEvent<HTMLLabelElement>) => {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const row = apiRef.current.getRowParams(params.id).row;
    if (row) {
      const hasIva = input.checked;
      const taxRateId = hasIva
        ? ParametersEnum.TAX_RATE_ID_DEFAULT
        : ParametersEnum.TAX_RATE_ID_ZERO;
      const newRow = {
        ...row,
        hasIva,
        taxRateId,
      };
      const newRows = apiRef.current
        .getAllRowIds()
        .map((r) =>
          r === params.id ? newRow : apiRef.current.getRowParams(r).row
        );
      setRows(newRows);
    }
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return false;
  }, [params.value]);

  return (
    <GridEditBooleanCell
      {...params}
      value={getValue()}
      onChange={handleBooleanChange}
    />
  );
}

export function ImpuestoCell(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  impuestos: TaxRateInterface[];
}) {
  const { params, setRows, impuestos } = props;

  const reference = useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const apiRef = useGridApiContext();

  const styles = useStyles();

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: TaxRateInterface | null
  ) => {
    if (newValue === null) return;
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.taxRateId,
    });
    handleAutocompleteChange(event, newValue, params);
  };

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: TaxRateInterface,
    params: GridRenderEditCellParams
  ) => {
    const row = apiRef.current.getRowParams(params.id).row;
    if (event && newValue !== null) {
      if (row) {
        const newRow = {
          ...row,
          taxRateId: newValue.taxRateId,
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

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);

  return (
    <Autocomplete
      ref={reference}
      value={
        getValue() === 0
          ? null
          : impuestos.find((tax) => tax.taxRateId === getValue())
      }
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      options={impuestos}
      getOptionLabel={(option: TaxRateInterface) => option.taxDescription}
      isOptionEqualToValue={(option, value) =>
        option?.taxRateId === value?.taxRateId
      }
      noOptionsText="Sin resultados"
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
