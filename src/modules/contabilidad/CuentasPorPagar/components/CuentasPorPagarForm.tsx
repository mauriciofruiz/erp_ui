import { DiasVencidoEnum } from '@/enums';
import {
  FormState,
  StyledDatePicker,
  useCuentasPorPagarAsync,
  useProveedorAsync,
} from '@/hooks';
import {
  AccountsPayableType,
  AdvanceResponseType,
  AdvanceType,
  PaginatedResponseType,
  PersonProviderType,
} from '@/types';
import {
  Autocomplete,
  debounce,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import { GridRowModel } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { parseISO } from 'date-fns';
import React, { ChangeEvent, useEffect, useState } from 'react';

export type CXPFormProps = {
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
  styles: ClassNameMap;
  setRows: React.Dispatch<React.SetStateAction<readonly GridRowModel[]>>;
  onGenericChange: (value: any, name: string) => void;
  pagination: PaginatedResponseType;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  setAvailableAdvances: React.Dispatch<
    React.SetStateAction<AdvanceResponseType[]>
  >;
  setSelectedAdvances: React.Dispatch<React.SetStateAction<AdvanceType[]>>;
};

interface ProviderOptionType {
  label: string;
  value: boolean | null;
}

export const CuentasPorPagarForm: React.FC<CXPFormProps> = ({
  formState,
  onAutocompleteChange,
  onInputChange,
  styles,
  setRows,
  onGenericChange,
  pagination,
  setPagination,
  setAvailableAdvances,
  setSelectedAdvances,
}) => {
  const [proveedorList, setProveedorList] = useState<PersonProviderType[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  const { fetchByParam } = useProveedorAsync();

  const { fetchMainCXP } = useCuentasPorPagarAsync();

  useEffect(() => {
    if (searchTerm.length >= 3) {
      fetchByParam(searchTerm.toUpperCase()).then((response) => {
        if (response) {
          setProveedorList(response);
        }
      });
    }
  }, [searchTerm]);

  const handleAutocompleteProvider = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      setProveedorList([]);
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  const providerTypeList: ProviderOptionType[] = [
    { label: 'TODOS', value: null },
    { label: 'NACIONAL', value: false },
    { label: 'EXTRANJERO', value: true },
  ];

  const statusList: ProviderOptionType[] = [
    { label: 'VIGENTE', value: false },
    { label: 'VENCIDO', value: true },
  ];

  // Asignar el resultado de la función a rangeDaysList
  const rangeDaysList = Array.from(DiasVencidoEnum).map(([value, label]) => ({
    value,
    label,
  }));

  useEffect(() => {
    if (formState.documentNumber !== '' && formState.documentNumber.length <= 3)
      return;

    let endDate = formState.endDate;

    if (formState.documentNumber.length > 3) endDate = null;

    onGenericChange(endDate, 'endDate');

    fetchMainCXP(
      formState.providerId,
      endDate,
      formState.isDue,
      formState.rangeDaysId,
      formState.isForeign,
      formState.documentNumber,
      formState.page,
      formState.pageSize,
      formState.sortDirection,
      formState.sortField
    ).then((response) => {
      if (response) {
        setPagination(response.invoicesToPayList);
        setAvailableAdvances(response.advanceList);
      }
    });
  }, [
    formState.providerId,
    formState.endDate,
    formState.isDue,
    formState.rangeDaysId,
    formState.isForeign,
    formState.documentNumber,
    formState.page,
    formState.pageSize,
    formState.sortDirection,
    formState.sortField,
  ]);

  useEffect(() => {
    if (pagination && pagination.list && pagination.list.length > 0) {
      const documentList = pagination.list as AccountsPayableType[];
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

  return (
    <>
      <Grid item xs={4}>
        <Autocomplete
          className={styles.genericFieldStyle}
          disablePortal
          autoSelect
          options={proveedorList}
          getOptionLabel={(option) => (option ? option.personName : '')}
          style={{ width: '100%' }}
          onChange={(event, option) =>
            onAutocompleteChange(event, 'providerId', option?.providerId)
          }
          onInputChange={debounce(
            (event, newInputValue) =>
              handleAutocompleteProvider(event, newInputValue),
            500
          )}
          value={
            formState.providerId === null
              ? null
              : proveedorList.find(
                  (c) => c.providerId === formState.providerId
                ) || null // Asegurarse de que el valor no sea undefined
          }
          filterOptions={(options) => options}
          isOptionEqualToValue={(
            option: PersonProviderType,
            value: PersonProviderType
          ) =>
            option && value ? option.providerId === value.providerId : false
          }
          noOptionsText="Sin resultados"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar proveedor"
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
      <Grid item xs={8} />
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
      <Grid item xs={2}>
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
      <Grid item xs={2}>
        <Autocomplete
          className={styles.genericFieldStyle}
          disablePortal
          autoSelect
          options={providerTypeList}
          getOptionLabel={(option) => option.label}
          style={{ width: '100%' }}
          onChange={(event, option) =>
            onAutocompleteChange(event, 'isForeign', option?.value)
          }
          value={
            providerTypeList.find(
              (option) => option.value === formState.isForeign
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
              label="Tipo Proveedor"
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
      <Grid item xs={3}>
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
      <Grid item xs={1}>
        <Grid container justifyContent="center">
          <FormControlLabel
            control={
              <Switch
                checked={formState.isIndividual}
                onChange={(event) =>
                  onGenericChange(event.target.checked, 'isIndividual')
                }
              />
            }
            label={formState.isIndividual ? 'Individual' : 'Grupal'}
          />
        </Grid>
      </Grid>
    </>
  );
};
