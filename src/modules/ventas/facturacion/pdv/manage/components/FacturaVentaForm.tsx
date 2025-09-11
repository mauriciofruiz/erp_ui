'use client';
import { getAllSustentoTributario, getAllTipoComprobante } from '@/backend';
import {
  FormState,
  StyledDatePicker,
  useClienteAsync,
  useCobroAsync,
  usePersonaAsync,
} from '@/hooks';
import {
  AdvanceClientType,
  ClientCategoryType,
  ClientPersonCreditPostType,
  PersonClientType,
  TaxSupportInterface,
  VoucherTypeInterface,
} from '@/types';
import { Autocomplete, Button, Grid, TextField } from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import { GridRowModel } from '@mui/x-data-grid';
import { addDays, parseISO } from 'date-fns';
import { debounce } from 'lodash';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { DocumentosExternos } from './DocumentosExternos';
import { PersonAdd } from '@mui/icons-material';
import { ParametersEnum, PathEnum } from '@/enums';
import { useSnackbar } from 'notistack';

export type FacturaVentaFormProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
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
  rows: readonly GridRowModel[];
  setRows: React.Dispatch<React.SetStateAction<readonly GridRowModel[]>>;
  setSelectedCliente: React.Dispatch<
    React.SetStateAction<ClientPersonCreditPostType | null>
  >;
  setAvailableAdvances: React.Dispatch<
    React.SetStateAction<AdvanceClientType[]>
  >;
};

export const FacturaVentaForm: React.FC<FacturaVentaFormProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  onAutocompleteChange,
  onInputChange,
  styles,
  rows,
  setRows,
  setSelectedCliente,
  setAvailableAdvances,
}) => {
  const { fetchClientPersonByParam } = usePersonaAsync();

  const { fecthAdvancesByClientId } = useCobroAsync();

  const { fetchGetClientById, fetchGetClientCategoryList } = useClienteAsync();

  const [clientePersonaList, setClientePersonaList] = useState<
    PersonClientType[]
  >([]);

  const [taxSupportList, setTaxSupportList] = useState<TaxSupportInterface[]>(
    []
  );

  const [voucherTypeList, setVoucherTypeList] = useState<
    VoucherTypeInterface[]
  >([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [clienteCategoryList, setClienteCategoryList] = useState<
    ClientCategoryType[]
  >([]);

  const { enqueueSnackbar } = useSnackbar();

  // * USE EFFECT INICIAL
  useEffect(() => {
    const fetchCategoryList = async () => {
      const response = await fetchGetClientCategoryList();
      if (response) {
        const categoryList = response as ClientCategoryType[];

        setClienteCategoryList(categoryList);
      }
    };

    const fetchAllSustentoTributario = async () => {
      const response = await getAllSustentoTributario();
      if (response) {
        setTaxSupportList(response);
      }
    };

    const fetchAllTipoComprobante = async () => {
      const response = await getAllTipoComprobante();
      if (response) {
        setVoucherTypeList(response);
      }
    };
    fetchAllSustentoTributario();
    fetchAllTipoComprobante();
    fetchCategoryList();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const fetchData = async () => {
        const response = await fetchClientPersonByParam(searchTerm);
        if (response) {
          setClientePersonaList(response as PersonClientType[]);
        }
      };
      if (searchTerm.length >= 3) {
        fetchData();
      } else {
        setClientePersonaList([]);
      }
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchSelectedCliente = async () => {
      const response = await fetchGetClientById(formState.clientId);
      if (response) {
        const cliente = response as ClientPersonCreditPostType;
        setSelectedCliente(cliente);
        const isConsumidorFinal =
          cliente.personIdentification === ParametersEnum.CONSUMIDOR_FINAL_ID;
        if (createMode || editMode) {
          const issueDate =
            typeof formState.issueDate === 'string'
              ? parseISO(formState.issueDate)
              : formState.issueDate;

          setFormState({
            ...formState,
            clientAddress: cliente.personAddress,
            clientCategoryId: cliente.clientCategoryId,
            clientCellphone: cliente.personCellphone,
            clientEmail: cliente.personEmail,
            clientIdentification: cliente.personIdentification,
            clientName: cliente.personName,
            dueDays: cliente.creditDays ?? 0,
            dueDate: addDays(issueDate, cliente.creditDays ?? 0),
            taxSupportId: taxSupportList.find(
              (taxSupport) => taxSupport.taxSupportId === '01'
            )?.taxSupportId,
            voucherTypeCode: voucherTypeList.find(
              (voucherType) => voucherType.voucherTypeCode === '01'
            )?.voucherTypeCode,
            retentionSourceId: cliente.sourceRetentionId, //cliente.retentionSourceId,
            retentionIVAId: cliente.ivaRetentionId, //cliente.retentionIVAId,
            isConsumidorFinal,
          });

          if (rows.length > 0) {
            const newRows = rows.map((row) => {
              return {
                ...row,
                retentions: [],
                retentionIVAId: null,
                retentionSourceId: null,
              };
            });
            setRows(newRows);
          }

          if (cliente.billingAlert && cliente.billingAlert !== '') {
            enqueueSnackbar(cliente.billingAlert, {
              variant: 'warning',
              autoHideDuration: 10000,
            });
          }
          if (cliente.generalAlert && cliente.generalAlert !== '') {
            enqueueSnackbar(cliente.generalAlert, {
              variant: 'warning',
              autoHideDuration: 10000,
            });
          }
          if (cliente.collectionAlert && cliente.collectionAlert !== '') {
            enqueueSnackbar(cliente.collectionAlert, {
              variant: 'warning',
              autoHideDuration: 10000,
            });
          }
        }
        setFormState((prevState) => ({
          ...prevState,
          isConsumidorFinal,
        }));
      }
    };

    if (formState.clientId && formState.clientId !== null) {
      fetchSelectedCliente();
      fecthAdvancesByClientId(formState.clientId).then((response) => {
        if (response) {
          setAvailableAdvances(response);
        }
      });
    }
  }, [formState.clientId, createMode, editMode]);

  useEffect(() => {
    if (formState.clientCategoryId) {
      const category = clienteCategoryList.find(
        (c) => c.clientCategoryId === formState.clientCategoryId
      );
      if (category) {
        setFormState({
          ...formState,
          categoryDiscount: category.clientCategoryDiscount ?? 0,
        });
      }
    }
  }, [formState.clientCategoryId]);

  const handleAutocompleteClient = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      setClientePersonaList([]);
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  return (
    <>
      <Grid item xs={4}>
        {createMode && (
          <Autocomplete
            className={styles.genericFieldStyle}
            disablePortal
            autoHighlight
            autoSelect
            options={clientePersonaList}
            readOnly={!createMode}
            getOptionLabel={(option) => (option ? option.personName : '')}
            style={{ width: '100%' }}
            onChange={(event, option) =>
              onAutocompleteChange(event, 'clientId', option?.clientId)
            }
            onInputChange={debounce(
              (event, newInputValue) =>
                handleAutocompleteClient(event, newInputValue),
              500
            )}
            value={
              formState.clientName === ''
                ? formState.clientId === null
                  ? null
                  : clientePersonaList.find(
                      (c) => c.clientId === formState.clientId
                    ) || null // Asegurarse de que el valor no sea undefined
                : null
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
                label="Buscar cliente"
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
        )}
      </Grid>
      <Grid item xs={2}>
        {createMode && (
          <Button
            startIcon={<PersonAdd />}
            onClick={() => {
              window.open(
                PathEnum.FICHA_CLIENTE + PathEnum.NEW,
                '_blank',
                'noreferrer'
              );
            }}
            style={{ width: '200px' }}
          >
            {'NUEVO CLIENTE'}
          </Button>
        )}
      </Grid>
      <Grid item xs={2}></Grid>
      <DocumentosExternos formState={formState} />
      <Grid item xs={4}>
        <TextField
          label="Razón Social"
          value={formState.clientName}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: formState.clientName !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Identificación"
          value={formState.clientIdentification}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: formState.clientIdentification !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Célular"
          value={formState.clientCellphone}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: formState.clientCellphone !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <StyledDatePicker
          label="Fecha Emisión"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          value={
            typeof formState.issueDate === 'string'
              ? parseISO(formState.issueDate)
              : formState.issueDate
          }
          readOnly
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
      <Grid item xs={4}>
        <StyledDatePicker
          label="Fecha Vencimiento"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          value={
            typeof formState.dueDate === 'string'
              ? parseISO(formState.dueDate)
              : formState.dueDate
          }
          readOnly
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
      <Grid item xs={4}>
        <TextField
          label="Días Crédito"
          value={formState.dueDays}
          InputProps={{
            readOnly: true,
          }}
          InputLabelProps={{
            shrink: formState.dueDays !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          name="clientAddress"
          label="Dirección"
          value={formState.clientAddress}
          onChange={onInputChange}
          InputProps={{
            readOnly: !createMode && !editMode,
          }}
          InputLabelProps={{
            shrink: formState.clientAddress !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          name="clientEmail"
          label="Correo Electrónico"
          value={formState.clientEmail}
          onChange={onInputChange}
          InputProps={{
            readOnly: !createMode && !editMode,
          }}
          InputLabelProps={{
            shrink: formState.clientEmail !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <Autocomplete
          className={styles.genericFieldStyle}
          disablePortal
          autoSelect
          options={clienteCategoryList}
          readOnly
          getOptionLabel={(option) => (option ? option.clientCategoryName : '')}
          style={{ width: '100%' }}
          value={
            formState.clientCategoryId === null
              ? null
              : clienteCategoryList.find(
                  (c) => c.clientCategoryId === formState.clientCategoryId
                )
          }
          filterOptions={(options) => options}
          isOptionEqualToValue={(
            option: ClientCategoryType,
            value: ClientCategoryType
          ) =>
            option && value
              ? option.clientCategoryId === value.clientCategoryId
              : false
          }
          noOptionsText="Sin resultados"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Categoría Cliente"
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
          options={taxSupportList}
          readOnly={!createMode && !editMode}
          getOptionLabel={(option) =>
            `${option.taxSupportId} - ${option.taxSupportName}`
          }
          style={{ width: '100%' }}
          onChange={(event, option) =>
            onAutocompleteChange(event, 'taxSupportId', option?.taxSupportId)
          }
          value={
            taxSupportList.find(
              (taxSupport) => taxSupport.taxSupportId === formState.taxSupportId
            ) || null
          }
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.taxSupportName
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            );
          }}
          isOptionEqualToValue={(
            option: TaxSupportInterface,
            value: TaxSupportInterface
          ) =>
            option && value ? option.taxSupportId === value.taxSupportId : false
          }
          noOptionsText="Sin resultados"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sustento Tributario"
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
          options={voucherTypeList}
          readOnly={true}
          getOptionLabel={(option) => option.voucherTypeName}
          style={{ width: '100%' }}
          onChange={(event, option) =>
            onAutocompleteChange(
              event,
              'voucherTypeCode',
              option?.voucherTypeCode
            )
          }
          value={
            voucherTypeList.find(
              (voucher) => voucher.voucherTypeCode === formState.voucherTypeCode
            ) || null
          }
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.voucherTypeName
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            );
          }}
          isOptionEqualToValue={(
            option: VoucherTypeInterface,
            value: VoucherTypeInterface
          ) =>
            option && value
              ? option.voucherTypeCode === value.voucherTypeCode
              : false
          }
          noOptionsText="Sin resultados"
          renderOption={(props, option: VoucherTypeInterface) => (
            <li {...props}>
              {`${option.voucherTypeCode} - ${option.voucherTypeName}`}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tipo De Comprobante"
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
          name="description"
          label="Observaciones"
          value={formState.description}
          onChange={onInputChange}
          InputProps={{
            readOnly: !createMode && !editMode,
          }}
          InputLabelProps={{
            shrink: formState.description !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
    </>
  );
};
