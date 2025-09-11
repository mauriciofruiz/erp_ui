import {
  FormaPagoEnum,
  ParametersEnum,
  PathEnum,
  TipoDetalleFacturaEnum,
} from '@/enums';
import {
  FormState,
  StyledDatePicker,
  useAllowGlobal,
  useFacturaVentaAsync,
  usePersonaAsync,
  useStyles,
} from '@/hooks';
import { LabeledInputNumber } from '@/modules/layout';
import { RootState } from '@/store';
import { FacturaVentaForNC, PersonClientType } from '@/types';
import { EventSeat, KeyboardArrowDown } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Menu,
  TextField,
  Typography,
} from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export type NotaDebitoFormProps = {
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onGenericChange: (value: any, field: string) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
};

export const NotaDebitoForm: React.FC<NotaDebitoFormProps> = ({
  formState,
  createMode,
  editMode,
  onAutocompleteChange,
  onGenericChange,
  setFormState,
  setRows,
  onInputChange,
}) => {
  const styles = useStyles();
  const { fetchClientPersonByParam } = usePersonaAsync();

  const { enableAdmin, allowCheckEntry } = useAllowGlobal();

  const [clientePersonaList, setClientePersonaList] = useState<
    PersonClientType[]
  >([]);

  const { fecthFacturasForDebitNote } = useFacturaVentaAsync();

  const [searchTerm, setSearchTerm] = useState('');

  const [clienteSelected, setClientSelected] =
    useState<PersonClientType | null>();

  const [searchInvoice, setSearchInvoice] = useState('');

  const [invoiceData, setInvoiceData] = useState<FacturaVentaForNC[]>([]);

  const { sucursales } = useSelector((state: RootState) => state.common);

  const [invoiceSelected, setInvoiceSelected] =
    useState<FacturaVentaForNC | null>(null);

  const handleAutocompleteClient = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchClientPersonByParam(searchTerm);
      if (response) {
        setClientePersonaList(response as PersonClientType[]);
      }
    };

    if (searchTerm.length >= 3) {
      fetchData();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!createMode) return;
    if (formState.clientId === null) {
      setClientSelected(null);
      return;
    }
    if (
      clienteSelected &&
      clienteSelected !== null &&
      clientePersonaList.length === 0
    )
      return;
    const client = clientePersonaList.find(
      (cliente) => cliente.clientId === formState.clientId
    );
    setClientSelected(client);
    const observation = ParametersEnum.MENSAJE_ND_GENERICO.replace(
      '$',
      client?.personName || '$'
    ).replace('#', formState.invoiceNumber || '#');

    onGenericChange(client?.personName, 'clientName');
    onGenericChange(observation, 'observation');
  }, [formState.clientId, clientePersonaList, createMode]);

  const handleAutocompleteInvoice = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchInvoice(inputValue);
    }
  };

  useEffect(() => {
    if (createMode) return;
    if (!editMode || !formState.invoiceNumber) return;

    setSearchInvoice(formState.invoiceNumber);
  }, [editMode, formState.invoiceNumber]);

  useEffect(() => {
    const fetchDataInvoice = async (clientId: number, docNumber: string) => {
      fecthFacturasForDebitNote(clientId, docNumber).then((response) => {
        if (response) {
          const invoiceList = response as FacturaVentaForNC[];
          createMode
            ? setInvoiceData(invoiceList)
            : setInvoiceSelected(invoiceList[0]);
        }
      });
    };
    if (formState.clientId !== null && searchInvoice.length >= 3) {
      fetchDataInvoice(formState.clientId, searchInvoice);
    }
  }, [
    formState.clientId,
    searchInvoice,
    formState.ncTypeId,
    createMode,
    editMode,
  ]);

  useEffect(() => {
    if (!createMode) return;
    if (formState.invoiceId === null) {
      setInvoiceSelected(null);
      return;
    }
    if (invoiceSelected && invoiceSelected !== null && invoiceData.length === 0)
      return;
    const invoice = invoiceData.find(
      (factura) => factura.header.invoiceId === formState.invoiceId
    );
    if (invoice) {
      setInvoiceSelected(invoice);
      const observation = ParametersEnum.MENSAJE_ND_GENERICO.replace(
        '$',
        formState.clientName || '$'
      ).replace('#', invoice.header.invoiceNumber || '#');
      onGenericChange(observation, 'observation');
    }
  }, [formState.invoiceId, invoiceData, createMode]);

  useEffect(() => {
    if (createMode) {
      if (invoiceSelected && invoiceSelected !== null) {
        setFormState((prevFormState) => ({
          ...prevFormState,
          invoiceId: invoiceSelected.header.invoiceId,
          invoiceNumber: invoiceSelected.header.invoiceNumber,
          invoiceIssueDate: invoiceSelected.header.issueDate
            ? parseISO(invoiceSelected.header.issueDate.toString())
            : null,
          invoiceValue: invoiceSelected.header.total,
          branchId: invoiceSelected.header.branchId,
          invoiceBalance: invoiceSelected.header.balance,
          paymentMethodDiscount: 0,
          paymentMethodDiscountPercentage:
            invoiceSelected.header.paymentMethodDiscountPercentage,
          paymentMethodId:
            invoiceSelected.header.paymentMethodId ?? FormaPagoEnum.CREDITO,
          previousNdValue: invoiceSelected.header.ndValue,
        }));
        const detail = {
          id: randomId(),
          detailId: null,
          debitNoteId: null,
          productId: null,
          returnedQuantity: 1,
          accountId: null,
          accountNumber: '',
          branchId: invoiceSelected.header.branchId,
          hasIva: false,
          taxRateId: ParametersEnum.TAX_RATE_ID_ZERO,
          taxValue: 0,
          detailTypeId: TipoDetalleFacturaEnum.SERVICIOS,
          unitPrice: 0,
          totalPrice: 0,
          totalAfterDiscount: 0,
          paymentMethodDiscountPercentage: 0,
        };
        setRows([detail]);
      }
    } else if (invoiceSelected && invoiceSelected !== null) {
      setFormState((prevFormState) => ({
        ...prevFormState,
        previousNdValue: invoiceSelected.header.ndValue,
      }));
    }
  }, [invoiceSelected, formState.ncTypeId, createMode]);

  useEffect(() => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        return {
          ...row,
          branchId: formState.branchId,
        };
      })
    );
  }, [formState.branchId]);

  //  * * * * * * * * * *  HANDLE MENU DOCUMENTOS ADJUNTOS * * * * * * * * * * * * *
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Grid item xs={4}>
        {createMode ? (
          <Autocomplete
            className={styles.genericFieldStyle}
            options={clientePersonaList}
            getOptionLabel={(option) =>
              option !== null ? option.personName : ''
            }
            readOnly={!createMode && !editMode}
            style={{ width: '100%' }}
            onChange={(event, value) => {
              onAutocompleteChange(event, 'clientId', value?.clientId);
            }}
            onInputChange={(event, newInputValue) =>
              handleAutocompleteClient(event, newInputValue)
            }
            value={clienteSelected || null}
            isOptionEqualToValue={(option, value) =>
              option.clientId === value.clientId
            }
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
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
        ) : (
          <TextField
            name="clientName"
            label="Cliente"
            value={formState.clientName}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{ style: { textTransform: 'uppercase' } }}
            InputLabelProps={{
              shrink:
                formState.clientName !== '' && formState.clientName != null
                  ? true
                  : false,
            }}
            fullWidth
          />
        )}
      </Grid>
      {!createMode ? (
        <Grid item xs={4}>
          <TextField
            name="debitNoteId"
            label="Nro Nota Crédito"
            value={formState.debitNoteId}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{ style: { textTransform: 'uppercase' } }}
            InputLabelProps={{
              shrink:
                formState.debitNoteId !== '' && formState.debitNoteId != null
                  ? true
                  : false,
            }}
            fullWidth
          />
        </Grid>
      ) : (
        <Grid item xs={4} />
      )}
      {formState.debitNoteId !== null && allowCheckEntry() ? (
        <>
          <Grid item xs={4}>
            <Box display="width" justifyContent="center">
              <Button
                id="demo-customized-button"
                aria-controls={open ? 'demo-customized-menu' : undefined}
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
                {' '}
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
              </Menu>
            </Box>
          </Grid>
        </>
      ) : (
        <Grid item xs={4} />
      )}
      <Grid item xs={4}>
        {createMode ? (
          <Autocomplete
            className={styles.genericFieldStyle}
            readOnly={!createMode}
            options={invoiceData}
            getOptionLabel={(option) => option.header.invoiceNumber}
            style={{ width: '100%' }}
            onChange={(event, value) =>
              onAutocompleteChange(event, 'invoiceId', value?.header.invoiceId)
            }
            onInputChange={(event, newInputValue) =>
              handleAutocompleteInvoice(event, newInputValue)
            }
            value={invoiceSelected}
            isOptionEqualToValue={(option, value) =>
              option.header.invoiceId === value.header.invoiceId
            }
            disabled={formState.clientId === null}
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
                    formState.clientId === null && formState.ncTypeId === null,
                }}
                InputLabelProps={{
                  ...params.InputLabelProps,
                  className: styles.textGreenStyle,
                }}
              />
            )}
          />
        ) : (
          <TextField
            name="invoiceNumber"
            label="Nro Factura"
            value={formState.invoiceNumber}
            InputProps={{
              readOnly: true,
            }}
            inputProps={{ style: { textTransform: 'uppercase' } }}
            InputLabelProps={{
              shrink:
                formState.invoiceNumber !== '' &&
                formState.invoiceNumber != null
                  ? true
                  : false,
            }}
            fullWidth
          />
        )}
      </Grid>
      <Grid item xs={2}>
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
      <Grid item xs={2}>
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
      <Grid item xs={2}>
        <StyledDatePicker
          label="Fecha Emisión Factura"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          value={
            typeof formState.invoiceIssueDate === 'string'
              ? parseISO(formState.invoiceIssueDate)
              : formState.invoiceIssueDate
          }
          readOnly
          disableOpenPicker
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
        <StyledDatePicker
          label="Fecha Emisión"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          minDate={new Date(formState.invoiceIssueDate)}
          maxDate={new Date()}
          readOnly={!((createMode || editMode) && enableAdmin())}
          value={
            typeof formState.issueDate === 'string'
              ? parseISO(formState.issueDate)
              : formState.issueDate
          }
          onChange={(date) =>
            onGenericChange((date as Date).toISOString(), 'issueDate')
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
      <Grid item xs={4}>
        <Autocomplete
          className={styles.genericFieldStyle}
          options={sucursales}
          getOptionLabel={(option) => option.name}
          style={{ width: '100%' }}
          onChange={(event, value) =>
            onAutocompleteChange(event, 'branchId', value?.branchId)
          }
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.name.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          value={
            (formState.branchId !== null
              ? sucursales.find(
                  (sucursal) => sucursal.branchId === formState.branchId
                )
              : null) || null
          }
          isOptionEqualToValue={(option, value) =>
            option.branchId === value.branchId
          }
          noOptionsText="Sin resultados"
          readOnly={!(createMode || editMode)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sucursal"
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
      <Grid item xs={8}>
        <TextField
          name="observation"
          label="Observación"
          value={formState.observation}
          onChange={onInputChange}
          InputProps={{
            readOnly: !createMode && !editMode,
          }}
          inputProps={{ style: { textTransform: 'uppercase' } }}
          InputLabelProps={{
            shrink:
              formState.observation !== '' && formState.observation != null
                ? true
                : false,
          }}
          fullWidth
        />
      </Grid>
    </>
  );
};
