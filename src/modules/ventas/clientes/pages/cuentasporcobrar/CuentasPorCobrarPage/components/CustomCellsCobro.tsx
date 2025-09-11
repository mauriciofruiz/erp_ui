import { CuentaPorCobrarEnum, FormaPagoEnum, ParametersEnum } from '@/enums';
import { setDecimalPlaces } from '@/functions';
import { FormState, useStyles } from '@/hooks';
import { AcquirerInterface, BancoType, CardInterface } from '@/types';
import { Add } from '@mui/icons-material';
import { Autocomplete, Button, TextField } from '@mui/material';
import {
  GridCellParams,
  GridRowModes,
  GridRowModesModel,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import {
  GridRenderEditCellParams,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { InputNumber } from 'antd';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useMemo } from 'react';

// ? ********************** TOOLBAR ************************
interface EditToolbarProps {
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  formState: FormState;
  rows: GridRowsProp;
  isNormalCharge: boolean;
}
export function ToolbarFormaPago(props: EditToolbarProps) {
  const { setRows, setRowModesModel, formState, rows, isNormalCharge } = props;

  const addNewRow = () => {
    const id = randomId();

    const paymentTotal = rows
      .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
      .reduce((acc, row) => acc + row.amount, 0);

    const amount =
      formState.totalToCharge - paymentTotal < 0
        ? 0
        : formState.totalToCharge - paymentTotal;

    if (amount === 0 && isNormalCharge) {
      return;
    }

    const newRow = {
      id,
      paymentMethodId: '',
      amount,
      bankName: '',
      checkNumber: '',
      documentNumber: '',
      cardName: '',
      acquirerName: '',
      batch: '',
      term: '',
    };

    setRows((prevRows) => [...prevRows, newRow]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: '10px',
      }}
    >
      <Button
        color="primary"
        startIcon={<Add />}
        onClick={addNewRow}
        sx={{ mb: 2, mt: 1.5, marginLeft: '10px', mr: 1, width: '200px' }}
      >
        Agregar Forma De Pago
      </Button>
    </GridToolbarContainer>
  );
}
// ? ********************** END TOOLBAR ************************

type CustomCellProps = {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  bankList?: BancoType[];
  cardList?: CardInterface[];
  acquirerList?: AcquirerInterface[];
  formState?: FormState;
  formasPagoList?: { label: string; value: FormaPagoEnum }[];
  setFormState?: React.Dispatch<React.SetStateAction<FormState>>;
  setRowModesModel?: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  paymentMethodId?: FormaPagoEnum;
};

export function CustomNumberCell(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  isNormalCharge: boolean;
}) {
  const { params, setRows, formState, setFormState, isNormalCharge } = props;

  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number) => {
    const rows = apiRef.current
      .getAllRowIds()
      .map((id) => apiRef.current.getRow(id));
    const row = rows.find((row) => row.id === params.id);
    if (row === undefined) return;

    const formaPagoId = row.paymentMethodId;

    if (formaPagoId === FormaPagoEnum.NOTA_CREDITO) return;

    let amount = value;

    if (!isNormalCharge) {
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: amount,
      });

      const newRow = {
        ...row,
        amount: amount,
      };

      const newRows = rows.map((row) =>
        row.id === params.id ? newRow : row
      ) as GridRowsProp;

      setRows(newRows);
      return;
    }
    const totalRows = rows
      .filter(
        (row) => row.id !== params.id && row.id !== ParametersEnum.ID_ROW_TOTAL
      )
      .reduce((acc, row) => acc + row.amount, 0);

    const allRowsAreEffectivo = rows
      .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
      .every((row) => row.paymentMethodId === FormaPagoEnum.EFECTIVO);

    const totalToCharge = setDecimalPlaces(
      formState.totalToCharge - totalRows,
      2
    );

    const changeValue = allRowsAreEffectivo
      ? setDecimalPlaces(value - totalToCharge, 2)
      : 0;

    setFormState((prev) => ({
      ...prev,
      changeValue,
    }));

    if (formaPagoId === FormaPagoEnum.EFECTIVO) {
      if (value > totalToCharge) {
        amount = totalToCharge;
      }
    } else if (
      formaPagoId === FormaPagoEnum.TARJETA_CREDITO ||
      formaPagoId === FormaPagoEnum.TARJETA_DEBITO
    ) {
      if (value > totalToCharge) {
        enqueueSnackbar(
          'El monto no puede ser mayor al total a cobrar, cuando su forma de pago es por tarjeta',
          {
            variant: 'error',
          }
        );
        amount = totalToCharge;
      }
    }

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: amount,
    });

    const newRow = {
      ...row,
      amount: amount,
    };

    const newRows = rows.map((row) =>
      row.id === params.id ? newRow : row
    ) as GridRowsProp;

    setRows(newRows);
  };

  const getValue = useCallback(() => {
    const row = apiRef.current.getRow(params.id);
    if (row && row.paymentMethodId === FormaPagoEnum.NOTA_CREDITO)
      return row.amount;

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
      precision={2}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function CustomFormaPagoCell({
  params,
  rows,
  setRows,
  formasPagoList,
  setRowModesModel,
  formState,
}: CustomCellProps) {
  const apiRef = useGridApiContext();

  const styles = useStyles();

  const reference = React.useRef<HTMLElement>(null);

  const setRowModesModelCell = useMemo(
    () => setRowModesModel ?? (() => {}),
    [setRowModesModel]
  );

  const formStateCell = useMemo(() => formState ?? {}, [formState]);

  const formasPagoListCell = useMemo(() => {
    const formasPagoWithoutNCandCredito =
      formStateCell.cxcTypeId === CuentaPorCobrarEnum.POSTFECHADO
        ? formasPagoList?.filter(
            (formaPago) =>
              formaPago.value === FormaPagoEnum.TRANSFERENCIA ||
              formaPago.value === FormaPagoEnum.DEPOSITO
          )
        : formasPagoList?.filter(
            (formaPago) =>
              formaPago.value !== FormaPagoEnum.NOTA_CREDITO &&
              formaPago.value !== FormaPagoEnum.CREDITO
          );
    return formasPagoWithoutNCandCredito ?? [];
  }, [formasPagoList]);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: { label: string; value: FormaPagoEnum } | null
  ) => {
    if (!value) return;
    event.stopPropagation();

    const paymentMethodId = value.value;
    if (paymentMethodId) {
      const row = rows.find((row) => row.id === params.id);
      if (row === undefined) return;

      const isDebitCard = paymentMethodId === FormaPagoEnum.TARJETA_DEBITO;
      if (row) {
        let amount = row.amount;
        let term = row.term !== null ? row.term : 1;
        if (isDebitCard) {
          term = 1;
        }
        apiRef.current.setEditCellValue({
          id: params.id,
          field: params.field,
          value: paymentMethodId,
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'amount',
          value: amount,
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'term',
          value: term,
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'bankId',
          value: null,
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'bankName',
          value: '',
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'checkNumber',
          value: '',
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'documentNumber',
          value: '',
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'cardId',
          value: null,
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'cardName',
          value: '',
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'acquirerId',
          value: null,
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'acquirerName',
          value: '',
        });
        apiRef.current.setEditCellValue({
          id: params.id,
          field: 'batch',
          value: '',
        });

        const newRow = {
          ...row,
          amount,
          paymentMethodId,
          term,
          bankId: null,
          bankName: '',
          checkNumber: '',
          documentNumber: '',
          cardId: null,
          cardName: '',
          acquirerId: null,
          acquirerName: '',
          batch: '',
        };

        setRows(rows.map((row) => (row.id === params.row.id ? newRow : row)));
        setRowModesModelCell((oldModel) => ({
          ...oldModel,
          [params.id]: { mode: GridRowModes.View },
        }));
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
        getValue() != null
          ? formasPagoListCell.find((b) => b.value === params.value)
          : null
      }
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.label.toUpperCase().includes(inputValue.toUpperCase())
        );
      }}
      fullWidth
      options={formasPagoListCell}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      getOptionLabel={(option) => option.label ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              className: styles?.textBlackStyle,
            }}
          />
        );
      }}
    />
  );
}

export const isCellEditable = (params: GridCellParams, rows: GridRowsProp) => {
  const currentRow = rows.find((row) => row.id === params.id);
  const { paymentMethodId } = currentRow || {};

  if (currentRow === undefined) return false;
  if (currentRow.id === ParametersEnum.ID_ROW_TOTAL) return false;
  if (paymentMethodId === FormaPagoEnum.NOTA_CREDITO) return false;

  switch (params.field) {
    case 'bankId':
      return [
        FormaPagoEnum.TRANSFERENCIA,
        FormaPagoEnum.DEPOSITO,
        FormaPagoEnum.CHEQUE,
      ].includes(paymentMethodId);
    case 'checkNumber':
      return paymentMethodId === FormaPagoEnum.CHEQUE;
    case 'documentNumber':
      return [FormaPagoEnum.TRANSFERENCIA, FormaPagoEnum.DEPOSITO].includes(
        paymentMethodId
      );
    case 'cardId':
      return [
        FormaPagoEnum.TARJETA_CREDITO,
        FormaPagoEnum.TARJETA_DEBITO,
      ].includes(paymentMethodId);
    case 'acquirerId':
      return [
        FormaPagoEnum.TARJETA_CREDITO,
        FormaPagoEnum.TARJETA_DEBITO,
      ].includes(paymentMethodId);
    case 'batch':
      return [
        FormaPagoEnum.TARJETA_CREDITO,
        FormaPagoEnum.TARJETA_DEBITO,
      ].includes(paymentMethodId);
    case 'term':
      return [FormaPagoEnum.TARJETA_CREDITO].includes(paymentMethodId);
    default:
      return params.colDef.editable ?? true;
  }
};

export function AutocompleteBankCell(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  bankList: BancoType[] | null;
}) {
  const { params, setRows, bankList } = props;

  const styles = useStyles();

  const apiRef = useGridApiContext();

  const reference = React.useRef<HTMLElement>(null);

  const bankListCell = useMemo(() => bankList ?? [], [bankList]);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: BancoType | null
  ) => {
    if (newValue === null) return;
    event.stopPropagation();

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.bankId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'bankName',
      value: newValue.bankName,
    });

    const row = apiRef.current.getRowParams(params.id).row;
    const newRow = {
      ...row,
      bankId: newValue.bankId,
      bankName: newValue.bankName,
    };

    const newRows = apiRef.current
      .getAllRowIds()
      .map((r) =>
        r === params.id ? newRow : apiRef.current.getRowParams(r).row
      );
    setRows(newRows);
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);

  return (
    <Autocomplete
      ref={reference}
      value={
        getValue() != null
          ? bankListCell.find((b) => b.bankId === params.value)
          : null
      }
      className={styles?.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.bankName.toUpperCase().includes(inputValue.toUpperCase())
        );
      }}
      fullWidth
      options={bankListCell}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      getOptionLabel={(option) => option.bankName ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.bankId === value.bankId}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              className: styles?.textBlackStyle,
            }}
          />
        );
      }}
    />
  );
}

export function AutocompleteCardCell({
  params,
  rows,
  setRows,
  cardList,
}: CustomCellProps) {
  const apiRef = useGridApiContext();

  const styles = useStyles();

  const reference = React.useRef<HTMLElement>(null);

  const cardListCell = useMemo(() => {
    const currentRow = rows.find((row) => row.id === params.id);
    const currentList = cardList ?? [];
    if (currentRow?.paymentMethodId === FormaPagoEnum.TARJETA_CREDITO) {
      return currentList.filter((card) => card.isCreditCard);
    } else if (currentRow?.paymentMethodId === FormaPagoEnum.TARJETA_DEBITO) {
      return currentList.filter((card) => !card.isCreditCard);
    }
    return [];
  }, [cardList]);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: CardInterface | null
  ) => {
    if (newValue === null) return;
    event.stopPropagation();

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.cardId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'cardName',
      value: newValue.cardName,
    });

    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          cardId: newValue.cardId,
          cardName: newValue.cardName,
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
      value={
        getValue() != null
          ? cardListCell.find((b) => b.cardId === params.value)
          : null
      }
      className={styles?.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.cardName.toUpperCase().includes(inputValue.toUpperCase())
        );
      }}
      fullWidth
      options={cardListCell}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      getOptionLabel={(option) => option.cardName ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.cardId === value.cardId}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              className: styles?.textBlackStyle,
            }}
          />
        );
      }}
    />
  );
}

export function AutocompleteAcquirerCell({
  params,
  rows,
  setRows,
  acquirerList,
}: CustomCellProps) {
  const apiRef = useGridApiContext();

  const styles = useStyles();

  const reference = React.useRef<HTMLElement>(null);

  const acquirerListCell = useMemo(() => acquirerList ?? [], [acquirerList]);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AcquirerInterface | null
  ) => {
    if (newValue === null) return;
    event.stopPropagation();

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.acquirerId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'acquirerName',
      value: newValue.acquirerName,
    });

    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          acquirerId: newValue.acquirerId,
          acquirerName: newValue.acquirerName,
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
      value={
        getValue() != null
          ? acquirerListCell.find((b) => b.acquirerId === params.value)
          : null
      }
      className={styles?.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.acquirerName.toUpperCase().includes(inputValue.toUpperCase())
        );
      }}
      fullWidth
      options={acquirerListCell}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      getOptionLabel={(option) => option.acquirerName ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) =>
        option.acquirerId === value.acquirerId
      }
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              className: styles?.textBlackStyle,
            }}
          />
        );
      }}
    />
  );
}
