import { CurrencyExchange } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import {
  GridRenderEditCellParams,
  GridRowId,
  GridValidRowModel,
  useGridApiContext,
} from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { StyledDatePicker, useAllowContabilidad, useStyles } from '@/hooks';
import { parseISO } from 'date-fns';
import { setDecimalPlaces } from '@/functions';

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
      const advanceAmount = row.advanceAmount;
      const currentBalance = setDecimalPlaces(
        row.documentStaticBalance - advanceAmount,
        2
      );
      if (value > currentBalance) {
        enqueueSnackbar(
          `La valor ingresado no puede ser mayor al saldo del documento`,
          {
            variant: 'warning',
          }
        );
        value = currentBalance;
      } else if (value < 0) {
        enqueueSnackbar(`El valor ingresado debe ser mayor a 0`, {
          variant: 'warning',
        });
        value = 0;
      }

      const documentBalance = setDecimalPlaces(
        row.documentStaticBalance - value - advanceAmount,
        2
      );

      apiRef.current.setEditCellValue({
        id: id,
        field: params.field,
        value: value,
      });

      const newRow = {
        ...row,
        paymentAmount: setDecimalPlaces(value, 2),
        documentBalance,
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

export function InputAdvanceFunction(props: {
  params: GridRenderEditCellParams;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentRow: React.Dispatch<React.SetStateAction<GridValidRowModel>>;
}) {
  const { params, setOpenDialog, setCurrentRow } = props;

  const reference = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <InputNumber
        ref={reference}
        min={0}
        value={params.value !== null ? params.value : 0}
        readOnly
        size="small"
        variant="borderless"
        controls={false}
        className="mi-input-number"
        precision={2}
        onFocus={(e) => e.target.select()}
        style={{ flex: 1 }}
      />
      <div>
        <InputAdornment
          component={(props) => (
            <motion.div
              {...props}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          )}
          position="end"
          style={{ transform: 'scale(0.85)' }}
        >
          <IconButton
            onClick={() => {
              setCurrentRow(params.row);
              setOpenDialog(true);
            }}
          >
            <CurrencyExchange />
          </IconButton>
        </InputAdornment>
      </div>
    </div>
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
      !params.row.documentIssueDate
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
