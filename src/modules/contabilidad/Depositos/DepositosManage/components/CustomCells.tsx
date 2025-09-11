import { setDecimalPlaces } from "@/functions";
import { StyledDatePicker, useAccountAsync, useAllowContabilidad, useStyles } from "@/hooks";
import { AccountType } from "@/types";
import { Autocomplete, TextField } from "@mui/material";
import {
  GridRenderEditCellParams,
  GridRowId,
  GridRowsProp,
  GridValidRowModel,
  useGridApiContext,
} from "@mui/x-data-grid";
import { InputNumber } from "antd";
import { parseISO } from "date-fns";
import { useSnackbar } from "notistack";
import React, { useMemo } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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
          variant: "warning",
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

export function AutocompleteEditAccountCell(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
}) {
  const { params, setRows } = props;
  const apiRef = useGridApiContext();
  const styles = useStyles();
  const [accountList, setAccountList] = useState<AccountType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const reference = React.useRef<HTMLElement>(null);
  const { fetchAccountsAutomatic } = useAccountAsync();
  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AccountType
  ) => {
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.accountName,
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
    const fetchAccounts = async () => {
      const responseAccountList = await fetchAccountsAutomatic(inputValue);
      if (responseAccountList) {
        const dto = responseAccountList as AccountType[];
        setAccountList(dto);
      }
    };
    if (inputValue.length > 3) fetchAccounts();
  }, [inputValue]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AccountType | null,
    params: GridRenderEditCellParams
  ) => {
    if (!newValue || !event) return;
    const row = apiRef.current.getRowParams(params.id).row;
    const newRow = {
      ...row,
      accountId: newValue.accountId,
      accountNumber: newValue.accountNumber,
      accountName: newValue.accountName,
      accountTypeName: newValue.accountTypeName,
    };
    const newRows = apiRef.current
      .getAllRowIds()
      .map((r) =>
        r === params.id ? newRow : apiRef.current.getRowParams(r).row
      );
    setRows(newRows);
  };

  return (
    <Autocomplete
      ref={reference}
      value={getValue()}
      className={styles.genericFieldStyle}
      style={{ width: "100%" }}
      onChange={handleChange}
      onInputChange={onInputChange}
      fullWidth
      options={accountList ?? []}
      filterOptions={(options) => options}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      disableClearable
      getOptionLabel={(option) => option.accountName || option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.accountName === value}
      renderOption={(props, option: AccountType) => (
        <li {...props} key={option.accountId}>
          {option.accountNumber} - {option.accountName}
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

export function OnDateChange(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
}) {
  const { params, setRows } = props;

  const apiRef = useGridApiContext();

  const reference = React.useRef<HTMLDivElement>(null);

  const styles = useStyles();

  const { contabilidadPeriodo } = useAllowContabilidad();

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onChange = (value: string, id: GridRowId) => {
    const row = apiRef.current.getRowParams(id).row;
    if (row) {
      apiRef.current.setEditCellValue({
        id: id,
        field: params.field,
        value: value,
      });

      const newRow = { ...row, documentPaymentDate: value };
      const newRows = apiRef.current
        .getAllRowIds()
        .map((r) => (r === id ? newRow : apiRef.current.getRowParams(r).row));
      setRows(newRows);
    }
  };

  const minDate = useMemo(() => {
    if (
      !contabilidadPeriodo?.closingPeriodDate ||
      !params.row.depositDate
    ) {
      return new Date();
    }

    const closingPeriodDate = parseISO(
      new Date(contabilidadPeriodo.closingPeriodDate).toISOString()
    );
    const documentIssueDate = parseISO(params.row.documentIssueDate);

    return closingPeriodDate < documentIssueDate
      ? documentIssueDate
      : closingPeriodDate;
  }, [contabilidadPeriodo, params.row.documentIssueDate]);

  return (
    <StyledDatePicker
      ref={reference}
      views={['year', 'month', 'day']}
      format="dd/MM/yyyy"
      minDate={minDate}
      maxDate={new Date()}
      defaultValue={new Date()}
      value={
        typeof params.row.documentPaymentDate === 'string'
          ? parseISO(params.row.documentPaymentDate)
          : params.row.documentPaymentDate
      }
      onChange={(value) => onChange((value as Date).toISOString(), params.id)}
      slotProps={{
        textField: {
          className: styles.genericFieldStyle,
          sx: {
            minWidth: '100%',
          },
          InputProps: {
            className: styles.textWhiteStyle,
          },
          InputLabelProps: {
            className: styles.textGreenStyle,
            shrink: true,
          },
        },
      }}
    />
  );
}

export function InputQuantityFunction(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
}) {
  const { params, setRows } = props;

  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = apiRef.current.getRowParams(id).row;
    if (row) {
      const depositAmount = row.pendingValueStatic;
      if (value > depositAmount) {
        enqueueSnackbar(
          `La valor ingresado no puede ser mayor al saldo del documento`,
          {
            variant: 'warning',
          }
        );
        value = depositAmount;
      } else if (value < 0) {
        enqueueSnackbar(`El valor ingresado debe ser mayor a 0`, {
          variant: 'warning',
        });
        value = 0;
      }

      const documentBalance = setDecimalPlaces(
        row.pendingValueStatic - value,
        2
      );

      apiRef.current.setEditCellValue({
        id: id,
        field: params.field,
        value: value,
      });

      const newRow = {
        ...row,
        pendingValue: setDecimalPlaces(documentBalance, 2)
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