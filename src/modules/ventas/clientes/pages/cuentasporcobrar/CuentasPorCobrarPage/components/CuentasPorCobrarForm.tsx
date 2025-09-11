import { CuentaPorCobrarEnum, DiasVencidoEnum } from '@/enums';
import {
  FormState,
  StyledDatePicker,
  useCuentasPorCobrarAsync,
  usePersonaAsync,
  useStyles,
} from '@/hooks';
import {
  AccountsPayableTypeCXC,
  AdvanceClientType,
  AdvanceTypeCXC,
  PaginatedResponseType,
  PersonClientType,
} from '@/types';
import { Autocomplete, debounce, Grid, TextField } from '@mui/material';
import { GridRowModel } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { parseISO } from 'date-fns';
import React, { ChangeEvent, useEffect, useState } from 'react';

export type CuentasPorCobrarFormProps = {
  formState: FormState;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  setRows: React.Dispatch<React.SetStateAction<readonly GridRowModel[]>>;
  onGenericChange: (value: any, name: string) => void;
  pagination: PaginatedResponseType;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  setAvailableAdvances: React.Dispatch<
    React.SetStateAction<AdvanceClientType[]>
  >;
  setSelectedAdvances: React.Dispatch<React.SetStateAction<AdvanceTypeCXC[]>>;
  isNormalCharge: boolean;
};

interface CXCOptionType {
  label: string;
  value: boolean | null;
}

export const CuentasPorCobrarForm: React.FC<CuentasPorCobrarFormProps> = ({
  formState,
  onAutocompleteChange,
  onInputChange,
  setRows,
  onGenericChange,
  pagination,
  setPagination,
  setAvailableAdvances,
  setSelectedAdvances,
  isNormalCharge,
}) => {
  const styles = useStyles();

  const [clientList, setClientList] = useState<PersonClientType[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  const { fetchClientPersonByParam } = usePersonaAsync();

  const { fetchMainCXC } = useCuentasPorCobrarAsync();

  useEffect(() => {
    if (searchTerm.length >= 3) {
      fetchClientPersonByParam(searchTerm.toUpperCase()).then((response) => {
        if (response) {
          setClientList(response as PersonClientType[]);
        }
      });
    }
  }, [searchTerm]);

  const handleAutocompleteProvider = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      setClientList([]);
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  const cxcTypeList = Object.keys(CuentaPorCobrarEnum)
    .filter((key): key is keyof typeof CuentaPorCobrarEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, value: CuentaPorCobrarEnum[key] };
    });

  useEffect(() => {
    if (formState.documentNumber !== '' && formState.documentNumber.length <= 3)
      return;

    let endDate = formState.endDate;

    if (formState.documentNumber.length > 3) endDate = null;

    onGenericChange(endDate, 'endDate');

    fetchMainCXC(
      formState.clientId,
      endDate,
      formState.isDue,
      formState.rangeDaysId,
      formState.documentNumber,
      formState.page,
      formState.pageSize,
      formState.sortDirection,
      formState.sortField
    ).then((response) => {
      if (response) {
        setPagination(response.invoicesReceivableList);
        setAvailableAdvances(response.advancesList);
      }
    });
  }, [
    formState.clientId,
    formState.endDate,
    formState.isDue,
    formState.rangeDaysId,
    formState.documentNumber,
    formState.page,
    formState.pageSize,
    formState.sortDirection,
    formState.sortField,
  ]);

  useEffect(() => {
    if (pagination && pagination.list && pagination.list.length > 0) {
      const documentList = pagination.list as AccountsPayableTypeCXC[];
      if (!documentList) setRows([]);
      setSelectedAdvances([]);
      const rowsData = documentList.map((row) => {
        return {
          id: randomId(),
          ...row,
        };
      });
      setRows(rowsData);
    }
  }, [pagination]);

  const statusList: CXCOptionType[] = [
    { label: 'VIGENTE', value: false },
    { label: 'VENCIDO', value: true },
  ];

  const rangeDaysList = Array.from(DiasVencidoEnum).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <>
      <Grid item xs={4}>
        <Autocomplete
          className={styles.genericFieldStyle}
          disablePortal
          autoSelect
          options={clientList}
          getOptionLabel={(option) => (option ? option.personName : '')}
          style={{ width: '100%' }}
          onChange={(event, option) =>
            onAutocompleteChange(event, 'clientId', option?.clientId)
          }
          onInputChange={debounce(
            (event, newInputValue) =>
              handleAutocompleteProvider(event, newInputValue),
            500
          )}
          value={
            formState.clientId === null
              ? null
              : clientList.find((c) => c.clientId === formState.clientId) ||
                null // Asegurarse de que el valor no sea undefined
          }
          filterOptions={(options) => options}
          isOptionEqualToValue={(
            option: PersonClientType,
            value: PersonClientType
          ) => (option && value ? option.clientId === value.clientId : false)}
          noOptionsText="Sin resultados"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar Cliente"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                className: styles.textWhiteStyle,
              }}
              InputLabelProps={{
                ...params.InputLabelProps,
                className: styles.textGreenStyle,
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <Autocomplete
          className={styles.genericFieldStyle}
          disablePortal
          autoSelect
          options={cxcTypeList}
          getOptionLabel={(option) => option.label}
          style={{ width: '100%' }}
          onChange={(event, option) =>
            onAutocompleteChange(event, 'cxcTypeId', option?.value)
          }
          value={
            cxcTypeList.find(
              (option) => option.value === formState.cxcTypeId
            ) || null
          }
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          noOptionsText="Sin resultados"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tipo"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                className: styles.textWhiteStyle,
              }}
              InputLabelProps={{
                ...params.InputLabelProps,
                className: styles.textGreenStyle,
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          name="observation"
          label="Observación"
          value={formState.observation}
          fullWidth
          onChange={onInputChange}
          InputProps={{
            className: styles.textWhiteStyle,
          }}
          InputLabelProps={{
            shrink: formState.observation != '' ? true : false,
            className: styles.textGreenStyle,
          }}
        />
      </Grid>
      {isNormalCharge && (
        <>
          {' '}
          <Grid item xs={2}>
            <StyledDatePicker
              label="Fecha Corte"
              views={['year', 'month', 'day']}
              format="dd/MM/yyyy"
              value={
                formState.endDate
                  ? typeof formState.endDate === 'string'
                    ? parseISO(formState.endDate)
                    : formState.endDate
                  : null
              }
              onChange={(value) =>
                onGenericChange(
                  value ? (value as Date).toISOString() : null,
                  'endDate'
                )
              }
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
          </Grid>
          <Grid item xs={2}>
            <Autocomplete
              className={styles.genericFieldStyle}
              disablePortal
              autoSelect
              options={statusList}
              getOptionLabel={(option) => option.label}
              style={{ width: '100%' }}
              onChange={(event, option) =>
                onAutocompleteChange(event, 'isDue', option?.value)
              }
              value={
                statusList.find((option) => option.value === formState.isDue) ||
                null
              }
              filterOptions={(options, { inputValue }) => {
                return options.filter((option) =>
                  option.label.toLowerCase().includes(inputValue.toLowerCase())
                );
              }}
              noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Estado Documento"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    className: styles.textGreenStyle,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Autocomplete
              className={styles.genericFieldStyle}
              disablePortal
              autoSelect
              options={rangeDaysList}
              getOptionLabel={(option) => option.label}
              style={{ width: '100%' }}
              onChange={(event, option) =>
                onAutocompleteChange(event, 'rangeDaysId', option?.value)
              }
              value={
                rangeDaysList.find(
                  (option) => option.value === formState.rangeDaysId
                ) || null
              }
              filterOptions={(options, { inputValue }) => {
                return options.filter((option) =>
                  option.label.toLowerCase().includes(inputValue.toLowerCase())
                );
              }}
              noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Rango de días"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    className: styles.textGreenStyle,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="documentNumber"
              label="Nro. Factura"
              value={formState.documentNumber}
              fullWidth
              onChange={onInputChange}
              InputProps={{
                className: styles.textWhiteStyle,
              }}
              InputLabelProps={{
                shrink: formState.documentNumber != '' ? true : false,
                className: styles.textGreenStyle,
              }}
            />
          </Grid>
        </>
      )}
    </>
  );
};
