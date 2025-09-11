import {
  FormState,
  useAllowGlobal,
  useAllowVentas,
  usePersonaAsync,
  useRetencionClienteAsync,
  useStyles,
} from '@/hooks';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  FacturasForRetencionType,
  PersonClientType,
  RetencionGeneralInterface,
} from '@/types';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AdsClick,
  EventSeat,
  ExpandMore,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import {
  addWorkdays,
  getPercentageValue,
  parseDateWithMiliseconds,
  setCurrencyNumber,
  setDecimalPlaces,
} from '@/functions';
import { GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { ParametersEnum, PathEnum } from '@/enums';
import { enqueueSnackbar } from 'notistack';

export type RetencionFormProps = {
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
  ivaListRetention: RetencionGeneralInterface[];
  sourceListRetention: RetencionGeneralInterface[];
  setMinDate: React.Dispatch<React.SetStateAction<string>>;
  setMaxDate: React.Dispatch<React.SetStateAction<string>>;
};

interface PettyCashOptionType {
  label: string;
  value: boolean;
}

export const RetencionForm: React.FC<RetencionFormProps> = ({
  formState,
  createMode,
  editMode,
  onAutocompleteChange,
  onGenericChange,
  setFormState,
  setRows,
  ivaListRetention,
  sourceListRetention,
  setMinDate,
  setMaxDate,
}) => {
  const styles = useStyles();

  const { ventasPeriodo } = useAllowVentas();

  const pettyCashList: PettyCashOptionType[] = [
    { label: 'NORMAL', value: false },
    { label: 'CAJA CHICA', value: true },
  ];

  const { fetchClientPersonByParam } = usePersonaAsync();

  const { allowCheckEntry } = useAllowGlobal();

  const [clientePersonaList, setClientePersonaList] = useState<
    PersonClientType[]
  >([]);

  const { fetchInvoices } = useRetencionClienteAsync();

  const [searchTerm, setSearchTerm] = useState('');

  const [clienteSelected, setClientSelected] =
    useState<PersonClientType | null>();

  const [invoiceList, setInvoiceList] = useState<FacturasForRetencionType[]>(
    []
  );

  const isRucClient = useMemo(() => {
    if (!clienteSelected) return false;
    const isRuc =
      clienteSelected.personIdentification.length === 13 &&
      clienteSelected.taxIdentificationCode === 'R';

    if (!isRuc) {
      enqueueSnackbar('El cliente seleccionado no tiene un RUC asociado', {
        variant: 'error',
      });
    }
    return isRuc;
  }, [clienteSelected]);

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
      } else {
        setClientePersonaList([]);
      }
    };

    if (searchTerm.length >= 3) {
      fetchData();
    } else {
      setClientePersonaList([]);
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

    onGenericChange(client?.personName, 'clientName');
    setRows([]);
  }, [formState.clientId, clientePersonaList, createMode]);

  useEffect(() => {
    if (!formState.clientId || formState.clientId === null) return;
    if (formState.isPettyCash === undefined) return;
    if (!createMode) return;
    if (!isRucClient) return;

    fetchInvoices(formState.clientId, formState.isPettyCash).then(
      (response) => {
        if (response) {
          setInvoiceList(response as FacturasForRetencionType[]);
        }
      }
    );
  }, [formState.clientId, formState.isPettyCash, createMode, isRucClient]);

  const handleSelectInvoice = (invoice: FacturasForRetencionType) => {
    const sourceRetention = sourceListRetention.find(
      (source) =>
        source.retentionId === ParametersEnum.RETENTION_SOURCE_ID_DEFAULT
    );

    const ivaRetention = ivaListRetention.find(
      (iva) => iva.retentionId === ParametersEnum.RETENTION_IVA_ID_DEFAULT
    );
    const newRows: GridRowsProp = [
      {
        id: randomId(),
        retentionTypeId: sourceRetention?.retentionId,
        sourceId: sourceRetention?.retentionId,
        base: invoice.sourceBase,
        value: setDecimalPlaces(
          getPercentageValue(
            invoice.sourceBase,
            sourceRetention?.percentageValue || 0
          ),
          2
        ),
      },
      {
        id: randomId(),
        retentionTypeId: ivaRetention?.retentionId,
        taxId: ivaRetention?.retentionId,
        base: invoice.taxBase,
        value: setDecimalPlaces(
          getPercentageValue(
            invoice.taxBase,
            ivaRetention?.percentageValue || 0
          ),
          2
        ),
      },
    ];

    const retentionDate = new Date(invoice.invoiceDate);
    retentionDate.setHours(23, 59, 59, 999);

    setFormState((prevState) => ({
      ...prevState,
      retentionDate: retentionDate.toISOString(),
      retentionNumber: '',
      autorizationNumber: '',
      invoiceId: invoice.invoiceId,
    }));
    setRows(newRows);

    if (ventasPeriodo?.closingPeriodDate) {
      const closingPeriodDate = new Date(ventasPeriodo.closingPeriodDate);
      const invoiceDate = retentionDate;

      const maxInvoiceDate = addWorkdays(invoiceDate.toISOString(), 5);
      const currentDate = new Date().toISOString();

      const finalMaxDate =
        maxInvoiceDate.toISOString() > currentDate
          ? currentDate
          : maxInvoiceDate.toISOString();

      setMaxDate(finalMaxDate);

      const minDateBetweenDocumento = new Date(
        Math.max(closingPeriodDate.getTime(), invoiceDate.getTime())
      ).toISOString();

      setMinDate(minDateBetweenDocumento);
    }
  };

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
      <Grid item xs={2}>
        <Autocomplete
          className={styles.genericFieldStyle}
          disablePortal
          autoSelect
          options={pettyCashList}
          getOptionLabel={(option) => option.label}
          style={{ width: '100%' }}
          onChange={(event, option) =>
            onAutocompleteChange(event, 'isPettyCash', option?.value)
          }
          value={
            pettyCashList.find(
              (option) => option.value === formState.isPettyCash
            ) || null
          }
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          readOnly={!createMode}
          noOptionsText="Sin resultados"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tipo Retención"
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
      {!createMode && allowCheckEntry() && (
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
      )}
      {createMode && (
        <Grid item xs={12}>
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <div
                style={{
                  display: 'width',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>
                  Facturas Disponibles
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {invoiceList.length === 0 ? (
                <Typography>No existen facturas disponibles</Typography>
              ) : (
                <div className={styles.tableContainer}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>N° Factura</TableCell>
                          <TableCell>Fecha Emisión</TableCell>
                          <TableCell>Cliente</TableCell>
                          <TableCell>Valor Factura</TableCell>
                          <TableCell>Base Fuente</TableCell>
                          <TableCell>Base IVA</TableCell>
                          <TableCell>Asignar/Reemplazar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoiceList.map(
                          (
                            factura: FacturasForRetencionType,
                            index: number
                          ) => (
                            <TableRow key={index}>
                              <TableCell>{factura.invoiceNumber}</TableCell>
                              <TableCell>
                                {parseDateWithMiliseconds(factura.invoiceDate)}
                              </TableCell>
                              <TableCell>{factura.clientName}</TableCell>
                              <TableCell>
                                {setCurrencyNumber(factura.invoiceTotal)}
                              </TableCell>
                              <TableCell>
                                {setCurrencyNumber(factura.sourceBase)}
                              </TableCell>
                              <TableCell>
                                {setCurrencyNumber(factura.taxBase)}
                              </TableCell>
                              <TableCell>
                                <div className={styles.iconContainer}>
                                  <Tooltip title="Sincronizar">
                                    <IconButton
                                      onClick={() =>
                                        handleSelectInvoice(factura)
                                      }
                                    >
                                      <AdsClick />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      )}
    </>
  );
};
