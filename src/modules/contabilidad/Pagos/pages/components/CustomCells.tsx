import { getClientPersonaByParam, getEmpleadosActivosByParam } from '@/backend';
import { AperturaImpEnum } from '@/enums';
import { handleApiError } from '@/functions';
import {
  useAccountAsync,
  useAperturaImportacionAsync,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import {
  AccountType,
  AperturaImportacionMainType,
  EmployeeResumeType,
  PersonClientType,
  PersonProviderType,
} from '@/types';
import { Autocomplete, TextField } from '@mui/material';
import {
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
  isForeign?: boolean;
}

export function AutocompleteEditAccountCell(
  props: {
    params: GridRenderEditCellParams;
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  }
) {
  const { params, setRows } = props;
  const apiRef = useGridApiContext();
  const styles = useStyles();
  const [accountList, setAccountList] = useState<AccountType[]>([]);
  const [inputValue, setInputValue] = useState('');
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

  // const handleAutocompleteChange = (
  //   event: React.SyntheticEvent<Element, Event>,
  //   newValue: AccountType | null,
  //   params: GridRenderEditCellParams
  // ) => {
  //   const rowIndex = rows.findIndex((row) => row.id === params.id);
  //   if (event && newValue !== null) {
  //     if (rows[rowIndex]) {
  //       const newRows = [...rows];
  //       newRows[rowIndex] = {
  //         ...newRows[rowIndex],
  //         accountId: newValue.accountId,
  //         accountNumber: newValue.accountNumber,
  //         accountName: newValue.accountName,
  //         accountTypeName: newValue.accountTypeName,
  //       };
  //       setRows(newRows);
  //     }
  //   }
  // };

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

export function AutocompleteEditServiceCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows } = props;
  const apiRef = useGridApiContext();
  const styles = useStyles();
  const [accountList, setAccountList] = useState<AccountType[]>([]);
  const [inputValue, setInputValue] = useState('');
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
      field: 'accountId',
      value: newValue.accountId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'accountNumber',
      value: newValue.accountNumber,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'accountName',
      value: newValue.accountName,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'accountTypeId',
      value: newValue.accountTypeId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'accountTypeName',
      value: newValue.accountTypeName,
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
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          accountId: newValue.accountId,
          accountNumber: newValue.accountNumber,
          accountName: newValue.accountName,
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
      isOptionEqualToValue={(option, value) => option.accountNumber === value}
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

export function AutocompleteEditEmployeeCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows } = props;
  const reference = React.useRef<HTMLElement>(null);
  const apiRef = useGridApiContext();
  const styles = useStyles();
  const [employeeList, setEmployeeList] = useState<EmployeeResumeType[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

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
      field: 'employeeName',
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
    const numberValue = value;
    apiRef.current.setEditCellValue({
      id: id,
      field: props.params.field,
      value: numberValue,
    });

    const rowIndex = props.rows.findIndex((rowProp) => rowProp.id === id);

    const newRows = [...props.rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      detailPaymentAmount: numberValue,
    };

    setRows(newRows);
  };

  return (
    <InputNumber
      ref={reference}
      min={0.01}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRows)
      }
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={2}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function AutocompleteAperturaImportacionCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows, isForeign } = props;

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
            null,
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
      field: 'importOpeningCode',
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
          importCode: newValue.importOpeningCode,
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

export function AutocompleteEditProviderCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows } = props;
  const reference = React.useRef<HTMLElement>(null);
  const apiRef = useGridApiContext();
  const styles = useStyles();
  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);
  const [inputValue, setInputValue] = useState('');

  const { fetchByParam } = useProveedorAsync();

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: PersonProviderType
  ) => {
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'providerId',
      value: newValue.providerId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'providerName',
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
      fetchByParam(inputValue.toUpperCase()).then((response) => {
        if (response) {
          setProveedoredorPersonaList(response);
        }
      });
    };
    if (inputValue.length > 3) fetchEmployeeList();
  }, [inputValue]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: PersonProviderType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          providerId: newValue.providerId,
          providerName: newValue.personName,
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
      options={proveedorPersonaList ?? []}
      filterOptions={(options) => options}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      disableClearable
      getOptionLabel={(option) => option.personName || option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.personName === value}
      renderOption={(props, option: PersonProviderType) => (
        <li {...props} key={option.providerId}>
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

export function AutocompleteEditClientCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows } = props;
  const reference = React.useRef<HTMLElement>(null);
  const apiRef = useGridApiContext();
  const styles = useStyles();
  const [clientePersonaList, setClientePersonaList] = useState<
    PersonClientType[]
  >([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: PersonClientType
  ) => {
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'clientId',
      value: newValue.clientId,
    });
    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'clientName',
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
    const fetchClientList = async () => {
      const response = await getClientPersonaByParam(inputValue);
      if (response) {
        setClientePersonaList(response.message);
      }
    };
    if (inputValue.length > 3) fetchClientList();
  }, [inputValue]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: PersonClientType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          clientId: newValue.clientId,
          clientName: newValue.personName,
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
      options={clientePersonaList ?? []}
      filterOptions={(options) => options}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      disableClearable
      getOptionLabel={(option) => option.personName || option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.personName === value}
      renderOption={(props, option: PersonClientType) => (
        <li {...props} key={option.clientId}>
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
