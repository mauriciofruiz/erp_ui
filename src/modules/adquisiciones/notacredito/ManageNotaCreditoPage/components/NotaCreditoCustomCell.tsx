import { ParametersEnum, TipoDetalleFacturaEnum } from '@/enums';
import { setDecimalPlaces } from '@/functions';
import { useStyles } from '@/hooks';
import { AccountType, TaxRateInterface } from '@/types';
import { Autocomplete, TextField } from '@mui/material';
import { GridEditBooleanCell, GridRowsProp } from '@mui/x-data-grid';
import { GridRowId } from '@mui/x-data-grid';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import React, { useCallback, useEffect, useRef } from 'react';

interface CuentaProps {
  params: GridRenderEditCellParams;
  rowsNotaCredito: GridRowsProp;
  setRowsNotaCredito: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  cuentaGastosList: AccountType[];
  setSearchCuentaGasto: React.Dispatch<React.SetStateAction<string>>;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AccountType,
    params: GridRenderEditCellParams
  ) => void;
}

export function CuentaContableCell(props: CuentaProps) {
  const {
    params,
    cuentaGastosList,
    setSearchCuentaGasto,
    onAutocompleteChange,
  } = props;

  const reference = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const apiRef = useGridApiContext();
  const styles = useStyles();

  const handleChange = useCallback(
    async (event: React.SyntheticEvent<Element, Event>, newValue: any) => {
      if (newValue === null) return;
      event.stopPropagation();
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: `${newValue.accountNumber} - ${newValue.accountName}`,
        //value: newValue.accountId
      });
      onAutocompleteChange(event, newValue, params);
    },
    [params.id, params.field]
  );

  const getValue = useCallback(() => {
    if (params.value) return params.value;
    return null;
  }, [params.value]);

  const onInputChangeFunction = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchCuentaGasto(newInputValue);
    }
  };

  return (
    <Autocomplete
      ref={reference}
      value={
        getValue() === undefined
          ? null
          : cuentaGastosList.find((account) => account.accountId === getValue())
      }
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      onInputChange={onInputChangeFunction}
      options={cuentaGastosList}
      getOptionLabel={(option: AccountType) =>
        `${option.accountNumber} - ${option.accountName}`
      }
      isOptionEqualToValue={(option, value) => option === value}
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

export function InputChangeNC(props: {
  rowsNotaCredito: GridRowsProp;
  params: GridRenderEditCellParams;
  setRowsNotaCredito: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  enqueueSnackbar: (message: string, options?: any) => void;
}) {
  const apiRef = useGridApiContext();

  const reference = React.useRef<HTMLInputElement>(null);

  const { params, setRowsNotaCredito } = props;

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = apiRef.current.getRowParams(id).row;
    if (!row) return;

    const fieldName = props.params.field;

    let newQuantity =
      row.detailTypeId === TipoDetalleFacturaEnum.INVENTARIO ? row.quantity : 1;

    let newDevolutionQuantity =
      row.detailTypeId === TipoDetalleFacturaEnum.INVENTARIO
        ? row.returnedQuantity
        : 1;

    let quantity = row.availableQuantity ?? 0;

    let invoiceTotalPrice = row.invoiceTotalPrice ?? 0;

    if (fieldName === 'valueNC') {
      if (value > parseFloat(invoiceTotalPrice)) {
        props.enqueueSnackbar('El valor NC, no puede ser mayor al valor FC', {
          variant: 'error',
        });
        newQuantity = invoiceTotalPrice;
      } else {
        newQuantity = value;
      }
      apiRef.current.setEditCellValue({
        id: id,
        field: 'valueNC',
        value: newQuantity,
      });
      apiRef.current.setEditCellValue({
        id: id,
        field: 'unitPrice',
        value: newQuantity,
      });

      const rowIndex = props.rowsNotaCredito.findIndex(
        (rowProp) => rowProp.id === id
      );
      apiRef.current.setEditCellValue({
        id: id,
        field: 'totalCost',
        value: newQuantity,
      });
      const newRows = [...props.rowsNotaCredito];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        valueNC: newQuantity,
        totalCost: newQuantity,
        unitPrice: newQuantity,
      };
      setRowsNotaCredito(newRows);
    } else if (fieldName === 'returnedQuantity') {
      newDevolutionQuantity = value;
      if (parseFloat(quantity) >= parseFloat(newDevolutionQuantity)) {
        apiRef.current.setEditCellValue({
          id: id,
          field: 'returnedQuantity',
          value: newDevolutionQuantity,
        });
        const updateTotalCost = setDecimalPlaces(
          newDevolutionQuantity * row.unitPrice,
          2
        );

        apiRef.current.setEditCellValue({
          id: id,
          field: 'totalCost',
          value: updateTotalCost,
        });
        const newRow = {
          ...row,
          returnedQuantity: newDevolutionQuantity,
          totalCost: updateTotalCost,
        };
        const newRows = apiRef.current
          .getAllRowIds()
          .map((r) => (r === id ? newRow : apiRef.current.getRowParams(r).row));
        setRowsNotaCredito(newRows);
      } else {
        props.enqueueSnackbar(
          'La cantidad de devolución, no puede ser mayor a la disponible',
          {
            variant: 'error',
          }
        );
      }
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
