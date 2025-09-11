import { getCuentaByParam } from '@/backend';
import {
  CuentaContableEnum,
  FormaPagoEnum,
  NotaCreditoEnum,
  PathEnum,
  TarifaIvaEnum,
} from '@/enums';
import { extractDateFromAutorizacion, extractFacturaNumber } from '@/functions';
import {
  FormState,
  StyledDatePicker,
  useAllowAdquisicion,
  useAllowGlobal,
  useFacturaProveedorAsync,
  useImpuestoDocumentoAsync,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { LabeledInputNumber } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import {
  AccountType,
  FacturaProveedorResponseInterface,
  ImpuestoDocumentoInterface,
  PersonProviderType,
  SucursalType,
  TaxRateInterface,
} from '@/types';
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { GridRowModesModel, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import axios from 'axios';
import { closestTo, parseISO } from 'date-fns';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NotaCreditoDescuento } from './NotaCreditoDescuento';
import { EventSeat, KeyboardArrowDown } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export type NotaCreditoProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  onDateChange: (value: Date, name: string) => void;
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
  onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
  handleOnSelect: (event: SelectChangeEvent<any>) => void;
  rowsNotaCredito: GridRowsProp;
  setRowsNotaCredito: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  rowModesModel: GridRowModesModel;
  sucursales: SucursalType[];
  impuestos: TaxRateInterface[];
  taxes: ImpuestoDocumentoInterface[];
  setTaxes: React.Dispatch<React.SetStateAction<ImpuestoDocumentoInterface[]>>;
  getNombreFormaPago: (valor: string) => string | undefined;
  proveedorPersonaList: PersonProviderType[];
  setProveedoredorPersonaList: React.Dispatch<
    React.SetStateAction<PersonProviderType[]>
  >;
  invoiceData: FacturaProveedorResponseInterface[];
  setInvoiceData: React.Dispatch<
    React.SetStateAction<FacturaProveedorResponseInterface[]>
  >;
};

export const NotaCreditoForm: React.FC<NotaCreditoProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  onInputChange,
  onDateChange,
  //onInputJustNumber,
  handleOnSelect,
  onAutocompleteChange,
  rowsNotaCredito,
  setRowsNotaCredito,
  rowModesModel,
  impuestos,
  sucursales,
  taxes,
  setTaxes,
  getNombreFormaPago,
  proveedorPersonaList,
  setProveedoredorPersonaList,
  invoiceData,
  setInvoiceData,
}) => {
  const { allowCheckEntry } = useAllowGlobal();
  const styles = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInvoice, setSearchInvoice] = useState('');
  const { fetchFacturaProveedorParams } = useFacturaProveedorAsync();
  const { adquisicionPeriodo } = useAllowAdquisicion();
  const notaType = Object.keys(NotaCreditoEnum)
    .filter((key): key is keyof typeof NotaCreditoEnum => isNaN(Number(key)))
    .map((key) => ({ label: key, value: NotaCreditoEnum[key] }));
  const [providerSelected, setProviderSelected] =
    useState<PersonProviderType | null>(null);
  const [invoiceSelected, setInvoiceSelected] =
    useState<FacturaProveedorResponseInterface | null>(null);
  const [cuentaGastosList, setCuentaGastosList] = useState<AccountType[]>([]);
  const [searchCuentaGasto, setSearchCuentaGasto] = useState('');
  const { fetchByDocument } = useImpuestoDocumentoAsync();

  const { fetchProveedorPersonaByProveedor, fetchByParam } =
    useProveedorAsync();

  const formaPago = Object.keys(FormaPagoEnum)
    .filter((key): key is keyof typeof FormaPagoEnum => isNaN(Number(key)))
    .map((key) => ({ label: key, value: FormaPagoEnum[key] }));

  const endDate = useMemo(() => {
    const today = new Date();
    const datesToCompare = [parseISO(formState.endDate)].filter(Boolean);

    if (adquisicionPeriodo?.closingPeriodDate) {
      datesToCompare.push(adquisicionPeriodo.closingPeriodDate as Date);
    }
    const closestDate = closestTo(today, datesToCompare);

    return closestDate;
  }, [adquisicionPeriodo?.closingPeriodDate, formState.endDate]);

  const handleAutocompleteProveedor = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  const handleAutocompleteInvoice = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchInvoice(inputValue);
    }
  };

  const handleOnSelectPayment = (event: SelectChangeEvent<any>) => {
    setFormState((prevState: FormState) => ({
      ...prevState,
      paymentMethodName: getNombreFormaPago(event.target.value),
      [event.target.name]: event.target.value,
    }));
  };

  const fetchTaxes = async (id: number) => {
    const taxesResponse = await fetchByDocument(id, null, null);
    setTaxes(taxesResponse as ImpuestoDocumentoInterface[]);
  };

  useEffect(() => {
    const fetchData = async () => {
      fetchByParam(searchTerm.toUpperCase()).then((response) => {
        if (response) {
          setProveedoredorPersonaList(response);
        }
      });
    };
    if (searchTerm.length >= 3) {
      fetchData();
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchDataProviderById = async () => {
      fetchProveedorPersonaByProveedor(formState.provider).then((response) => {
        if (response) {
          setProveedoredorPersonaList([response]);
        }
      });
    };
    if (formState.provider) {
      fetchDataProviderById();
    }
  }, [formState.provider]);

  useEffect(() => {
    if (formState.providerId === null) {
      setProviderSelected(null);
      return;
    }
    if (
      providerSelected &&
      providerSelected !== null &&
      proveedorPersonaList.length === 0
    )
      return;
    const provider = proveedorPersonaList.find(
      (provider) => provider.providerId === formState.providerId
    );
    if (provider) {
      setProviderSelected(provider);
    }
  }, [formState.providerId, proveedorPersonaList]);

  useEffect(() => {
    const fetchDataInvoice = async (providerId: number, tipoNC: number) => {
      try {
        const response = await fetchFacturaProveedorParams(
          providerId,
          searchInvoice,
          tipoNC
        );
        if (response) {
          setInvoiceData(response as FacturaProveedorResponseInterface[]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            enqueueSnackbar('No se ha encontrado la factura buscada', {
              variant: 'info',
            });
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };
    if (
      formState.providerId !== null &&
      formState.ncTypeId !== null &&
      searchInvoice.length >= 3
    ) {
      fetchDataInvoice(formState.providerId, formState.ncTypeId);
    }
  }, [searchInvoice]);

  useEffect(() => {
    if (formState.invoiceId === null) {
      setInvoiceSelected(null);
      return;
    }
    if (invoiceSelected && invoiceSelected !== null && invoiceData.length === 0)
      return;
    const invoice = invoiceData.find(
      (provider) => provider.providerInvoiceId === formState.invoiceId
    );
    if (invoice) {
      setInvoiceSelected(invoice);
    }
  }, [formState.invoiceId, invoiceData]);

  useEffect(() => {
    if (createMode) {
      if (invoiceSelected && invoiceSelected !== null) {
        setFormState((prevFormState) => ({
          ...prevFormState,
          invoiceNumber: invoiceSelected.providerInvoiceNumber,
          invoiceIssueDate: invoiceSelected.providerInvoiceIssueDate
            ? parseISO(invoiceSelected.providerInvoiceIssueDate?.toString())
            : null,
          invoiceValue: invoiceSelected.providerInvoiceTotal,
          providerName: invoiceSelected.providerName,
          branchId: invoiceSelected.branchId,
          invoiceBalance: invoiceSelected.balance,
          endDate: invoiceSelected.providerInvoiceIssueDate,
          previousNcValue: invoiceSelected.ncValue,
        }));
        const detailRows =
          invoiceSelected.details?.map((row) => {
            const totalPrice = row.totalPrice - (row?.returnedValue ?? 0);
            return {
              id: randomId(),
              ...row,
              productId:
                formState.ncTypeId === NotaCreditoEnum.DESCUENTO
                  ? null
                  : row.productId,
              detailId: null,
              unitPrice: row.unitPriceDiscount,
              returnedQuantity:
                formState.ncTypeId === NotaCreditoEnum.DESCUENTO ? 1 : 0,
              invoiceDetailId: row.detailId,
              accountName:
                formState.ncTypeId === NotaCreditoEnum.DESCUENTO
                  ? `${cuentaGastosList[0]?.accountNumber} - ${cuentaGastosList[0]?.accountName}`
                  : null,
              accountId:
                formState.ncTypeId === NotaCreditoEnum.DESCUENTO
                  ? cuentaGastosList[0]?.accountId
                  : null,
              invoiceAccountId:
                formState.ncTypeId === NotaCreditoEnum.DESCUENTO
                  ? row.productId
                  : null,
              totalPrice:
                formState.ncTypeId === NotaCreditoEnum.DESCUENTO
                  ? row.totalPrice
                  : 0,
              invoiceTotalPrice: totalPrice,
              totalCost:
                formState.ncTypeId === NotaCreditoEnum.DESCUENTO ? 0 : 0,
            };
          }) ?? [];

        setRowsNotaCredito(detailRows);
        if (invoiceSelected.providerInvoiceId !== null) {
          fetchTaxes(invoiceSelected.providerInvoiceId);
        }
      }
    } else if (invoiceSelected && invoiceSelected !== null) {
      setFormState((prevFormState) => ({
        ...prevFormState,
        previousNcValue: invoiceSelected.ncValue,
      }));
    }
  }, [invoiceSelected]);

  useEffect(() => {
    const fetchDataInvoice = async (
      providerId: number,
      tipoNC: number,
      invoice: string
    ) => {
      try {
        const response = await fetchFacturaProveedorParams(
          providerId,
          invoice,
          tipoNC
        );
        if (response) {
          setInvoiceData(response as FacturaProveedorResponseInterface[]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            enqueueSnackbar('No se ha encontrado la factura buscada', {
              variant: 'info',
            });
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };
    if (formState.provider && formState.typeNC && formState.invoiceNumber) {
      fetchDataInvoice(
        formState.provider,
        formState.typeNC,
        formState.invoiceNumber
      );
    }
  }, [formState.provider, formState.typeNC, formState.invoiceNumber]);

  useEffect(() => {
    const searchGastoContable = async (param: string) => {
      try {
        const response: AccountType[] | ServerResponseType =
          await getCuentaByParam(param);
        if (response) {
          setCuentaGastosList(response as AccountType[]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setCuentaGastosList([]);
            enqueueSnackbar(
              'No se ha encontrado la cuenta solicitada buscada',
              {
                variant: 'info',
              }
            );
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };
    if (!searchCuentaGasto.includes(' ') && searchCuentaGasto.length >= 3) {
      searchGastoContable(searchCuentaGasto);
    } else {
      searchGastoContable(CuentaContableEnum.DESCUENTOS_COMPRA);
    }
  }, [searchCuentaGasto]);

  //  * * * * * * * * * *  HANDLE MENU DOCUMENTOS ADJUNTOS * * * * * * * * * * * * *
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    const thereIsNoIva = rowsNotaCredito.some((row) => !row.hasIva);
    if (thereIsNoIva) {
      const newRows = rowsNotaCredito.map((row) => {
        return {
          ...row,
          taxRateId: row.hasIva ? row.taxRateId : TarifaIvaEnum.CERO,
        };
      });
      setRowsNotaCredito(newRows);
    }
  }, [JSON.stringify(rowsNotaCredito.map((item) => item.hasIva))]);

  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="state-label">Tipo NC</InputLabel>
                    <Select
                      name="ncTypeId"
                      labelId="state-label"
                      id="state-select"
                      label="Estado"
                      value={formState.ncTypeId === 0 ? '' : formState.ncTypeId}
                      onChange={handleOnSelect}
                      readOnly={!createMode && !editMode}
                      fullWidth
                    >
                      {notaType.map((tipNota) => (
                        <MenuItem
                          key={tipNota.value}
                          value={parseInt(tipNota.value?.toString() || '')}
                        >
                          {tipNota.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={proveedorPersonaList}
                    readOnly={!createMode && !editMode}
                    getOptionLabel={(option) => option.providerName}
                    style={{ width: '100%' }}
                    onChange={(event, value) =>
                      onAutocompleteChange(
                        event,
                        'providerId',
                        value?.providerId
                      )
                    }
                    onInputChange={(event, newInputValue) =>
                      handleAutocompleteProveedor(event, newInputValue)
                    }
                    value={providerSelected}
                    isOptionEqualToValue={(option, value) =>
                      option.providerId === value.providerId
                    }
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Proveedor"
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
                {formState.creditNoteId !== null && allowCheckEntry() ? (
                  <Grid item xs={12}>
                    <Box display="width" justifyContent="center">
                      <Button
                        id="demo-customized-button"
                        aria-controls={
                          open ? 'demo-customized-menu' : undefined
                        }
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        variant="contained"
                        disableElevation
                        onClick={handleClick}
                        endIcon={<KeyboardArrowDown />}
                        fullWidth
                      >
                        Documentos Adjuntos
                      </Button>
                      <Menu
                        id="demo-customized-menu"
                        MenuListProps={{
                          'aria-labelledby': 'demo-customized-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => {
                          setAnchorEl(null);
                        }}
                        classes={{ paper: styles.paperMenuStyle }}
                      >
                        {formState.entryId && (
                          <Link
                            to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.entryId}`}
                            target="_blank"
                            style={{
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <EventSeat
                              style={{ marginLeft: '5px', marginRight: '10px' }}
                            />
                            <Typography>Asiento Contable</Typography>
                          </Link>
                        )}
                        {formState.reserveEntryId && (
                          <Link
                            to={`${PathEnum.ASIENTO_EXTERNAL_VIEW}${formState.reserveEntryId}`}
                            target="_blank"
                            style={{
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <EventSeat
                              style={{ marginLeft: '5px', marginRight: '10px' }}
                            />
                            <Typography>Asiento Reserva</Typography>
                          </Link>
                        )}
                      </Menu>
                    </Box>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Autocomplete
                      className={styles.genericFieldStyle}
                      readOnly={!createMode && !editMode}
                      options={invoiceData}
                      getOptionLabel={(option) => option.providerInvoiceNumber}
                      style={{ width: '100%' }}
                      onChange={(event, value) =>
                        onAutocompleteChange(
                          event,
                          'invoiceId',
                          value?.providerInvoiceId
                        )
                      }
                      onInputChange={(event, newInputValue) =>
                        handleAutocompleteInvoice(event, newInputValue)
                      }
                      value={invoiceSelected}
                      isOptionEqualToValue={(option, value) =>
                        option.providerInvoiceId === value.providerInvoiceId
                      }
                      noOptionsText="Sin resultados"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Facturas"
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            className: styles.textWhiteStyle,
                            readOnly:
                              formState.providerId === null &&
                              formState.ncTypeId === null,
                          }}
                          InputLabelProps={{
                            ...params.InputLabelProps,
                            className: styles.textGreenStyle,
                          }}
                        />
                      )}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    name="invoiceNumber"
                    label="Número de factura"
                    value={
                      formState.invoiceNumber !== null
                        ? formState.invoiceNumber
                        : ''
                    }
                    InputLabelProps={{
                      shrink: formState.invoiceNumber ? true : false,
                    }}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabeledInputNumber
                    label="Valor Factura"
                    inputNumberProps={{
                      value: formState.invoiceValue,
                      min: 0,
                      defaultValue: 0,
                      controls: false,
                      precision: 2,
                      prefix: '$',
                      onFocus: (e: any) => e.target.select(),
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <LabeledInputNumber
                    label="Saldo Factura"
                    inputNumberProps={{
                      value: formState.invoiceBalance,
                      min: 0,
                      defaultValue: 0,
                      controls: false,
                      precision: 2,
                      prefix: '$',
                      onFocus: (e: any) => e.target.select(),
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledDatePicker
                    label="Fecha Factura"
                    readOnly
                    maxDate={new Date()}
                    views={['year', 'month', 'day']}
                    format="dd/MM/yyyy"
                    value={
                      formState.invoiceIssueDate !== null
                        ? formState.invoiceIssueDate
                        : null
                    }
                    onChange={(value) =>
                      onDateChange(value as Date, 'invoiceIssueDate')
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
                          shrink: formState.invoiceIssueDate ? true : false,
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    name="authorizationNumber"
                    label="Nro. Autorización"
                    value={formState.authorizationNumber}
                    onChange={(e: any) => {
                      const re = /^[0-9\b]+$/;
                      if (e.target.value === '' || re.test(e.target.value)) {
                        setFormState({
                          ...formState,
                          authorizationNumber: e.target.value,
                          creditNoteNumber: extractFacturaNumber(
                            e.target.value
                          ),
                          issueDate: extractDateFromAutorizacion(
                            formState.issueDate,
                            e.target.value
                          ),
                          observation: `${
                            formState.providerName
                          } - N° NC: ${extractFacturaNumber(e.target.value)}. `,
                        });
                      }
                    }}
                    error={
                      formState.authorizationNumber !== '' &&
                      formState.authorizationNumber.length !== 10 &&
                      formState.authorizationNumber.length !== 47 &&
                      formState.authorizationNumber.length !== 49
                    }
                    helperText={
                      formState.authorizationNumber !== '' &&
                      formState.authorizationNumber.length !== 10 &&
                      formState.authorizationNumber.length !== 47 &&
                      formState.authorizationNumber.length !== 49
                        ? 'La longitud debe ser de 10, 47 o 49 dígitos'
                        : ''
                    }
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    InputLabelProps={{
                      shrink:
                        formState.authorizationNumber !== '' ? true : false,
                    }}
                    inputProps={{
                      maxLength: 49,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="creditNoteNumber"
                    label="Número NC"
                    value={
                      formState.creditNoteNumber !== null
                        ? formState.creditNoteNumber
                        : ''
                    }
                    onChange={onInputChange}
                    InputLabelProps={{
                      shrink: formState.creditNoteNumber ? true : false,
                    }}
                    inputProps={{
                      maxLength: 15,
                    }}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledDatePicker
                    label="Fecha Emisión"
                    views={['year', 'month', 'day']}
                    minDate={endDate}
                    maxDate={new Date()}
                    format="dd/MM/yyyy"
                    value={
                      typeof formState.issueDate === 'string'
                        ? parseISO(formState.issueDate)
                        : formState.issueDate
                    }
                    onChange={(value) => {
                      onDateChange(value as Date, 'issueDate');
                    }}
                    readOnly={!createMode}
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
              </Grid>
            </Grid>
            <Grid item xs={8}>
              <TextField
                name="observation"
                label="Observación"
                value={
                  formState.observation !== null ? formState.observation : ''
                }
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.observation ? true : false,
                }}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="state-label">Forma de Pago</InputLabel>
                <Select
                  name="paymentMethodId"
                  labelId="paymentMethodId-label"
                  id="paymentMethodId-select"
                  label="Estado"
                  value={
                    formState.paymentMethodId === null
                      ? ''
                      : formState.paymentMethodId
                  }
                  onChange={handleOnSelectPayment}
                  readOnly={!createMode && !editMode}
                  fullWidth
                >
                  {formaPago.map((estado) => (
                    <MenuItem
                      key={estado.value}
                      value={estado.value?.toString() || ''}
                    >
                      {estado.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Divider sx={{ mt: 4, height: 4 }} />
      {formState.ncTypeId !== 0 && (
        <>
          <NotaCreditoDescuento
            formState={formState}
            setFormState={setFormState}
            rowsNotaCredito={rowsNotaCredito}
            setRowsNotaCredito={setRowsNotaCredito}
            createMode={createMode}
            editMode={editMode}
            rowModesModel={rowModesModel}
            sucursales={sucursales}
            impuestos={impuestos}
            taxes={taxes}
            setTaxes={setTaxes}
            cuentaGastosList={cuentaGastosList}
            setSearchCuentaGasto={setSearchCuentaGasto}
            invoiceSelected={invoiceSelected}
          />
        </>
      )}
    </>
  );
};
