import {
  getCuentaByParamManuales,
  getEmpleadosActivosByParam,
  getProductosByProveedor,
} from '@/backend';
import {
  AperturaImpEnum,
  ParametersEnum,
  TipoDetalleFacturaEnum,
} from '@/enums';
import {
  getDecimalPlaces,
  handleApiError,
  setDecimalPlaces,
} from '@/functions';
import {
  useAccountAsync,
  useAperturaImportacionAsync,
  useStyles,
} from '@/hooks';
import {
  AccountType,
  AperturaImportacionMainType,
  EmployeeResumeType,
  ProveedorProductoType,
  RetencionType,
  TaxRateInterface,
} from '@/types';
import { Autocomplete, Chip, Popper, TextField, Tooltip } from '@mui/material';
import {
  GridEditBooleanCell,
  GridRenderEditCellParams,
  GridRowId,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

type CustomUpdateTotalCellProps = {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

interface AutocompleteEditInputCellProps {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  providerId?: number;
  isForeign?: boolean;
}

interface RetencionMultipleProps {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  retencionList: RetencionType[];
}

interface ImpuestoProps {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  impuestos: TaxRateInterface[];
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

  const reference = React.useRef<HTMLElement>(null);

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
      field: 'unitMeasureId',
      value: newValue.unitMeasureId,
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
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'hasIva',
      value: newValue.checkIva,
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
          productId: newValue.productId,
          productCode: newValue.productCode,
          productName: newValue.productName,
          providerProductCode: newValue.providerProductCode,
          quantity: 0,
          unitPrice: newValue.cost,
          totalPrice: 0,
          discount: 0,
          priceWithoutTax: 0,
          taxValue: 0,
          hasIva: newValue.checkIva,
          isTaxCredit: true,
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

export function AutocompleteEditServiceCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows } = props;

  const apiRef = useGridApiContext();

  const styles = useStyles();

  const [accountList, setAccountList] = useState<AccountType[]>([]);

  const [inputValue, setInputValue] = useState('');

  const reference = React.useRef<HTMLElement>(null);

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
      field: 'productId',
      value: newValue.accountId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'productCode',
      value: newValue.accountNumber,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.accountName,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'quantity',
      value: 1,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'unitPrice',
      value: 0,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'isTaxCredit',
      value: true,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'hasIva',
      value: true,
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
      const response = await getCuentaByParamManuales(inputValue);
      if (response) {
        setAccountList(response);
      }
    };
    if (inputValue.length > 3) fetchAccounts();
  }, [inputValue]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AccountType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          productId: newValue.accountId,
          productCode: newValue.accountNumber,
          productName: newValue.accountName,
          providerProductCode: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          discount: 0,
          priceWithoutTax: 0,
          taxValue: 0,
          hasIva: true,
          isTaxCredit: true,
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
      options={accountList ?? []}
      filterOptions={(options) => options}
      getOptionLabel={(option) => option.accountName || option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.accountName === value}
      renderOption={(props, option: AccountType) => (
        <li {...props} key={option.accountId}>
          {`${option.accountNumber} - ${option.accountName}`}
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
  const { params, rows, setRows, retencionList } = props;

  const apiRef = useGridApiContext();

  const styles = useStyles();

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
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
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

export function AutocompleteEditEmployeeCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows } = props;

  const reference = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const apiRef = useGridApiContext();

  const styles = useStyles();

  const [employeeList, setEmployeeList] = useState<EmployeeResumeType[]>([]);

  const [inputValue, setInputValue] = useState('');

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: EmployeeResumeType
  ) => {
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'employeeId',
      value: newValue.employeeId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.personName,
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
    const fetchEmployeeList = async () => {
      const response = await getEmpleadosActivosByParam(inputValue);
      if (response) {
        setEmployeeList(response);
      }
    };
    if (inputValue.length > 3) fetchEmployeeList();
  }, [inputValue]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: EmployeeResumeType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          employeeId: newValue.employeeId,
          employeeName: newValue.personName,
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
      options={employeeList ?? []}
      filterOptions={(options) => options}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      disableClearable
      getOptionLabel={(option) => option.personName || option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.personName === value}
      PopperComponent={({ children, ...popperProps }) => (
        <Popper
          {...popperProps}
          placement="bottom-start"
          style={{ width: 'auto', minWidth: '200px' }}
        >
          {children}
        </Popper>
      )}
      renderOption={(props, option: EmployeeResumeType) => (
        <li {...props} key={option.employeeId}>
          {option.personName}
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

export function CustomUpdateTotalCell(props: CustomUpdateTotalCellProps) {
  const apiRef = useGridApiContext();

  const reference = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    const row = props.rows.find((row) => row.id === id);
    if (row === undefined) return;

    const fieldName = props.params.field;
    let totalPrice = 0;
    let quantity =
      row.detailTypeId === TipoDetalleFacturaEnum.INVENTARIO ? row.quantity : 1;
    let unitPrice = row.unitPrice;
    let discountValue = row.discount;
    const numberValue = value;

    if (fieldName === 'quantity') {
      quantity =
        row.detailTypeId === TipoDetalleFacturaEnum.INVENTARIO
          ? numberValue
          : 1;
    } else if (fieldName === 'unitPrice') {
      unitPrice = numberValue;
    } else if (fieldName === 'discount') {
      discountValue = numberValue;
    }
    if (fieldName === 'totalPrice') {
      totalPrice = numberValue;
      const totalAdded = totalPrice + discountValue;
      unitPrice = setDecimalPlaces(totalAdded / quantity, 6);
      apiRef.current.setEditCellValue({
        id: id,
        field: 'unitPrice',
        value: unitPrice,
      });
    } else {
      totalPrice = quantity * unitPrice - discountValue;
      apiRef.current.setEditCellValue({
        id: id,
        field: 'totalPrice',
        value: totalPrice,
      });
    }

    apiRef.current.setEditCellValue({
      id: id,
      field: props.params.field,
      value: numberValue,
    });

    if (row.detailTypeId !== TipoDetalleFacturaEnum.INVENTARIO) {
      apiRef.current.setEditCellValue({
        id: id,
        field: 'quantity',
        value: quantity,
      });
    }

    const rowIndex = props.rows.findIndex((rowProp) => rowProp.id === id);

    const newRows = [...props.rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      quantity: quantity,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      discount: discountValue,
    };

    setRows(newRows);
  };

  const getPrecisionByField = (field: string, unitMeasureId: number) => {
    if (field === 'quantity') return getDecimalPlaces(unitMeasureId);
    if (field === 'unitPrice') return 6;
    return 2;
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRows)
      }
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={getPrecisionByField(
        props.params.field,
        props.params.row.unitMeasureId
      )}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function ImpuestoCell(props: ImpuestoProps) {
  const { params, rows, setRows, impuestos } = props;

  const reference = React.useRef<HTMLElement>(null);

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
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          taxRateId: newValue.taxRateId,
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

export function AutocompleteAperturaImportacionCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows, providerId, isForeign } = props;

  const reference = React.useRef<HTMLElement>(null);

  const { fetchAll, fetchByParameters } = useAperturaImportacionAsync();

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const apiRef = useGridApiContext();

  const styles = useStyles();

  const [aperturaList, setAperturaList] = useState<
    AperturaImportacionMainType[]
  >([]);

  const fetchAperturas = useCallback(async () => {
    try {
      const paginacion = isForeign
        ? await fetchByParameters(
            null,
            providerId ?? null,
            AperturaImpEnum.LIBERADO,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false
          )
        : await fetchAll();

      setAperturaList(paginacion?.list as AperturaImportacionMainType[]);
    } catch (error) {
      handleApiError(error);
    }
  }, []); // Dependencias vacías significa que esto se ejecutará solo una vez

  useEffect(() => {
    fetchAperturas();
  }, [fetchAperturas]); // Dependencia en fetchAperturas para que se ejecute cuando cambie

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AperturaImportacionMainType
  ) => {
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'importOpeningId',
      value: newValue.importOpeningId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.importOpeningCode,
    });

    handleAutocompleteChange(event, newValue, params);
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AperturaImportacionMainType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          importOpeningId: newValue.importOpeningId,
          importOpeningCode: newValue.importOpeningCode,
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
      fullWidth
      options={aperturaList ?? []}
      filterOptions={(options) => options}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      disableClearable
      getOptionLabel={(option) => option.importOpeningCode || option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) =>
        option.importOpeningCode === value
      }
      PopperComponent={({ children, ...popperProps }) => (
        <Popper
          {...popperProps}
          placement="bottom-start"
          style={{ width: 'auto', minWidth: '200px' }}
        >
          {children}
        </Popper>
      )}
      renderOption={(props, option: AperturaImportacionMainType) => (
        <li {...props} key={option.importOpeningId}>
          {option.importOpeningCode}
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

      apiRef.current.setEditCellValue({
        id: params.id,
        field: 'hasIva',
        value: hasIva,
      });
      apiRef.current.setEditCellValue({
        id: params.id,
        field: 'taxRateId',
        value: taxRateId,
      });

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

export function AutocompleteEditAccountCell(props: {
  params: GridRenderEditCellParams;
}) {
  const { params } = props;
  const apiRef = useGridApiContext();
  const styles = useStyles();
  const [accountList, setAccountList] = useState<AccountType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const reference = React.useRef<HTMLElement>(null);
  const { fetchAccountByNumber } = useAccountAsync();

  const [currentName, setCurrentName] = useState('');
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
      value: newValue.accountId,
    });
    setCurrentName(newValue.accountName);
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
      const responseAccountList = await fetchAccountByNumber(inputValue);
      if (responseAccountList) {
        const dto = responseAccountList as AccountType[];
        setAccountList(dto);
      }
    };
    if (inputValue.length > 3) fetchAccounts();
  }, [inputValue]);

  return (
    <Autocomplete
      ref={reference}
      value={getValue() || ''}
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      onInputChange={onInputChange}
      fullWidth
      options={accountList ?? []}
      filterOptions={(options) => options}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      disableClearable
      getOptionLabel={() =>
        currentName || params.row.accountName || 'Sin resultados'
      }
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) =>
        value !== null ? option.accountId === value : false
      }
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
