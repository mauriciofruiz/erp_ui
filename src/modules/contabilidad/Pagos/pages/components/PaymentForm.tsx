'use client';
import {
  FormState,
  StyledDatePicker,
  useAllowGlobal,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { PersonProviderType } from '@/types';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Menu,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  EventSeat,
  KeyboardArrowDown,
  ToggleOff,
  ToggleOn,
} from '@mui/icons-material';
import { parseISO } from 'date-fns';
import { RootState } from '@/store';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { GridValidRowModel } from '@mui/x-data-grid';
import { PathEnum } from '@/enums';

type PaymentFormProps = {
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
  onBooleanChangeClick: (name: string, value: boolean) => void;
  onNumberChange: (
    event: ChangeEvent<HTMLInputElement>,
    decimalPlaces: number
  ) => void;
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
};

export const PaymentForm: React.FC<PaymentFormProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  onAutocompleteChange,
  onInputChange,
  onBooleanChangeClick,
  onNumberChange,
  setRows,
}) => {
  const styles = useStyles();
  const [error, setError] = useState({ beneficiaryName: '' });
  const { enqueueSnackbar } = useSnackbar();
  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [identification, setIdentification] = useState('');
  const { sucursales } = useSelector((state: RootState) => state.common);
  const { allowCheckEntry } = useAllowGlobal();

  const { fetchProveedorPersonaByProveedor, fetchByParam } =
    useProveedorAsync();
  //  * * * * * * * * * *  HANDLE MENU DOCUMENTOS ADJUNTOS * * * * * * * * * * * * *
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAutocompleteChange = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
      setFormState((prevState: any) => ({
        ...prevState,
        providerName: inputValue,
      }));
    }
  };

  const changePaymentForm = (isManualPayment: boolean) => {
    if (isManualPayment) {
      setFormState((prevState: any) => ({
        ...prevState,
        beneficiaryName: '',
        providerId: null,
        providerName: '',
        provider: null,
      }));
      setIdentification('');
    }
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
    const fetchData = async () => {
      fetchProveedorPersonaByProveedor(formState.providerId)
        .then((response) => {
          if (response) {
            setFormState((prevState: any) => ({
              ...prevState,
              provider: response,
            }));
            setIdentification(response.personIdentification);
          }
        })
        .catch((error) => {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
              enqueueSnackbar('No se ha encontrado el proveedor buscado', {
                variant: 'info',
              });
            } else {
              enqueueSnackbar('Error Del Servidor: ' + error.message, {
                variant: 'error',
              });
            }
          }
        });
    };
    if (
      formState.providerId !== null &&
      (formState.provider === null || formState.provider === undefined)
    )
      fetchData();
  }, [formState.providerId]);

  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  {!createMode && !editMode ? (
                    <TextField
                      name="providerName"
                      label="Proveedor"
                      disabled={true}
                      value={formState.providerName}
                      onChange={onInputChange}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      InputLabelProps={{
                        shrink:
                          formState.providerName !== '' &&
                          formState.providerName != null
                            ? true
                            : false,
                      }}
                      fullWidth
                    />
                  ) : (
                    <Autocomplete
                      className={styles.genericFieldStyle}
                      options={proveedorPersonaList}
                      readOnly={!createMode && !editMode}
                      disabled={formState.isManualPayment}
                      getOptionLabel={(option) =>
                        `${option.personName} - ${option.personIdentification}`
                      }
                      style={{ width: '100%' }}
                      onChange={(event, value) => {
                        if (value !== null) {
                          setFormState((prevState: any) => ({
                            ...prevState,
                            providerId: value.providerId,
                            providerName: value.personName,
                            beneficiaryName: value.personName,
                          }));
                          setIdentification(value.personIdentification);
                          setError({
                            ...error,
                          });
                        }
                        onAutocompleteChange(event, 'provider', value);
                      }}
                      onInputChange={handleAutocompleteChange}
                      value={formState.provider}
                      isOptionEqualToValue={(option, value) =>
                        option?.providerId === value
                      }
                      filterOptions={(options) => options}
                      autoHighlight
                      autoSelect
                      fullWidth
                      handleHomeEndKeys
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
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="beneficiaryName"
                    label="Beneficiario"
                    disabled={!formState.isManualPayment}
                    value={formState.beneficiaryName}
                    onChange={onInputChange}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.beneficiaryName !== '' &&
                        formState.beneficiaryName != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                  {formState.beneficiaryName != null &&
                  error.beneficiaryName != ''
                    ? error && (
                        <p style={{ color: 'cornsilk' }}>
                          {error.beneficiaryName}
                        </p>
                      )
                    : null}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="identification"
                    label="Número de identificación"
                    value={identification}
                    onChange={onInputChange}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        identification !== '' && identification != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="paymentObservation"
                    label="Observación"
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    value={formState.paymentObservation}
                    onChange={onInputChange}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.paymentObservation !== '' &&
                        formState.paymentObservation != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              {formState.entryId !== null && allowCheckEntry() && (
                <Grid item xs={6} mb={2}>
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
                      style={{ width: '98%', height: 35 }}
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
                    </Menu>
                  </Box>
                </Grid>
              )}
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={3}>
                  <Tooltip title="Tipo Pago">
                    <span>
                      <Button
                        disabled={!editMode && !createMode}
                        startIcon={
                          formState.isManualPayment ? (
                            <ToggleOn />
                          ) : (
                            <ToggleOff />
                          )
                        }
                        onClick={() => {
                          onBooleanChangeClick(
                            'isManualPayment',
                            !formState.isManualPayment
                          );
                          changePaymentForm(!formState.isManualPayment);
                        }}
                        style={{ width: '100%', height: 35 }}
                      >
                        {formState.isManualPayment ? 'Manual' : 'Automático'}
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
                <Grid item xs={3}>
                  <Tooltip title="Forma Pago">
                    <span>
                      <Button
                        disabled={!editMode && !createMode}
                        startIcon={
                          formState.isAdvancePayment ? (
                            <ToggleOn />
                          ) : (
                            <ToggleOff />
                          )
                        }
                        onClick={() => {
                          onBooleanChangeClick(
                            'isAdvancePayment',
                            !formState.isAdvancePayment
                          );
                          setFormState((prevState: any) => ({
                            ...prevState,
                            detail: [],
                          }));
                          setRows([]);
                        }}
                        style={{ width: '100%', height: 35 }}
                      >
                        {formState.isAdvancePayment ? 'Anticipo' : 'Pago'}
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
                <Grid item xs={3}>
                  <StyledDatePicker
                    label="Fecha Contable"
                    views={['year', 'month', 'day']}
                    format="dd/MM/yyyy"
                    defaultValue={new Date()}
                    value={
                      typeof formState.accountingDate === 'string'
                        ? parseISO(formState.accountingDate)
                        : formState.accountingDate
                    }
                    readOnly={true}
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
                <Grid item xs={3}>
                  <StyledDatePicker
                    label="Fecha Registro"
                    views={['year', 'month', 'day']}
                    defaultValue={new Date()}
                    format="dd/MM/yyyy"
                    value={
                      typeof formState.registrationDate === 'string'
                        ? parseISO(formState.registrationDate)
                        : new Date()
                    }
                    readOnly={true}
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

              <Grid item xs={12} mt={2}>
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
                      option.name
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
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
              <Grid item xs={12} mt={2}>
                <TextField
                  name="paymentAmount"
                  type="number"
                  label="Monto"
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                    startAdornment: '$',
                  }}
                  value={formState.paymentAmount}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onNumberChange(event, 5)
                  }
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  InputLabelProps={{
                    shrink:
                      formState.paymentAmount !== '' &&
                      formState.paymentAmount != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              {!(formState.entryId !== null && allowCheckEntry()) && (
                <Grid item xs={3} style={{ height: 52 }}></Grid>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};
