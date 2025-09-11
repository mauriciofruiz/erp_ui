import { getCuentaById } from '@/backend';
import { TipoCuentaEnum } from '@/enums';
import { FormState, useAccountAsync, useStyles } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { AccountType, SucursalType } from '@/types';
import { ToggleOff, ToggleOn } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
} from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, useEffect, useState } from 'react';

export type ManageCuentaBancariaFormProps = {
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
  onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
  onBooleanChangeClick: (name: string, value: boolean) => void;
  sucursales: SucursalType[];
};

export const ManageCuentaBancariaForm: React.FC<
  ManageCuentaBancariaFormProps
> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  onAutocompleteChange,
  onInputChange,
  onBooleanChangeClick,
  onInputJustNumber,
  sucursales,
}) => {
  const styles = useStyles();
  const [cuentasList, setCuentasList] = useState<AccountType[]>([]);
  const [cuentaCont, setCuentaCont] = useState<AccountType | null>();
  const [searchCuenta, setSearchCuenta] = useState('');

  const { fetchAccountByNumber } = useAccountAsync();

  const handleAutocompleteCuentaPasi = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchCuenta(inputValue);
    }
  };

  const tipoCuentas = Object.keys(TipoCuentaEnum)
    .filter((key): key is keyof typeof TipoCuentaEnum => isNaN(Number(key)))
    .map((key) => ({
      label: key.replace(/_/g, ' '),
      value: TipoCuentaEnum[key],
    }));

  const handleOnSelect = (event: SelectChangeEvent<any>) => {
    setFormState((prevState: FormState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    const searchCuentas = async (param: string) => {
      fetchAccountByNumber(param).then((response) => {
        if (response) setCuentasList(response);
      });
    };

    if (searchCuenta.length >= 3) {
      searchCuentas(searchCuenta);
    }
  }, [searchCuenta]);

  useEffect(() => {
    const fetchDataCuenta = async () => {
      try {
        const response: ServerResponseType | undefined = await getCuentaById(
          formState.accountIdTemp
        );
        if (response) {
          if (response.status === 200 && response.message) {
            const listaResult: AccountType[] = [response.message];
            setCuentasList(listaResult);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setCuentasList([]);
            enqueueSnackbar(
              'No se ha encontrado la cuenta solicitada buscado',
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
    if (formState.accountIdTemp && formState.accountIdTemp !== null) {
      fetchDataCuenta();
    }
  }, [formState.accountIdTemp]);

  useEffect(() => {
    if (formState.accountId === null) {
      setCuentaCont(null);
      return;
    }
    if (cuentaCont && cuentaCont !== null && cuentasList.length === 0) return;
    const cuenta = cuentasList.find((c) => c.accountId === formState.accountId);
    if (cuenta) {
      setCuentaCont(cuenta);
    }
  }, [formState.accountId, cuentasList]);

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CardLayout title="Información Banco">
            <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    required={true}
                    name="bankName"
                    label="Nombre"
                    value={formState.bankName}
                    onChange={onInputChange}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.bankName !== '' && formState.bankName != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={sucursales}
                    readOnly={!createMode}
                    getOptionLabel={(option) => option.name}
                    style={{ width: '100%' }}
                    onChange={(event, value) =>
                      onAutocompleteChange(event, 'branchId', value?.branchId)
                    }
                    value={
                      (formState.branchId !== null
                        ? sucursales.find(
                            (sucursal) =>
                              sucursal.branchId === formState.branchId
                          )
                        : null) || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.branchId === value.branchId
                    }
                    noOptionsText="Sin resultados"
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
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="state-label">Tipo Cuenta</InputLabel>
                    <Select
                      readOnly={!createMode && !editMode}
                      name="bankAccountTypeId"
                      labelId="state-label"
                      id="state-select"
                      label="Tipo Cuenta"
                      value={
                        formState.bankAccountTypeId === null
                          ? ''
                          : formState.bankAccountTypeId
                      }
                      onChange={handleOnSelect}
                      fullWidth
                    >
                      {tipoCuentas.map((cuenta) => (
                        <MenuItem
                          key={cuenta.value}
                          value={parseInt(cuenta.value?.toString() || '')}
                        >
                          {cuenta.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={cuentasList}
                    readOnly={!createMode}
                    getOptionLabel={(option) =>
                      `${option.accountNumber} - ${option.accountName}`
                    }
                    style={{ width: '100%' }}
                    onChange={(event, value) => {
                      onAutocompleteChange(
                        event,
                        'accountId',
                        value?.accountId
                      );
                    }}
                    value={
                      cuentaCont && cuentaCont !== null ? cuentaCont : null
                    }
                    onInputChange={handleAutocompleteCuentaPasi}
                    isOptionEqualToValue={(
                      option: AccountType,
                      value: AccountType
                    ) => (option && value ? option === value : false)}
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cuenta Contable"
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
                <Grid item xs={12}>
                  <TextField
                    name="bankAccountNumber"
                    label="Cuenta Bancaria"
                    value={formState.bankAccountNumber}
                    onChange={onInputJustNumber}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.bankAccountNumber !== '' &&
                        formState.bankAccountNumber != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <Tooltip title="Estado Banco">
                    <span>
                      <Button
                        disabled={!createMode && !editMode}
                        startIcon={
                          formState.bankState ? <ToggleOn /> : <ToggleOff />
                        }
                        onClick={() =>
                          onBooleanChangeClick(
                            'bankState',
                            !formState.bankState
                          )
                        }
                        style={{ width: '100%', height: 38 }}
                      >
                        {formState.bankState ? 'Activa' : 'Inactiva'}
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <Tooltip title="Caja Chica">
                    <span>
                      <Button
                        disabled={!createMode && !editMode}
                        startIcon={
                          formState.isPettyCash ? <ToggleOn /> : <ToggleOff />
                        }
                        onClick={() =>
                          onBooleanChangeClick(
                            'isPettyCash',
                            !formState.isPettyCash
                          )
                        }
                        style={{ width: '100%', height: 38 }}
                      >
                        {formState.isPettyCash ? 'Caja Chica' : 'No Caja Chica'}
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>
          </CardLayout>
        </Grid>
        <Grid item xs={6}>
          <CardLayout title="Información Cuenta">
            <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    name="availableBalance"
                    label="Saldo Disponible"
                    value={formState.availableBalance}
                    onChange={onInputJustNumber}
                    InputProps={{
                      readOnly: !createMode,
                    }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.availableBalance !== '' &&
                        formState.availableBalance != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="accountBalance"
                    label="Saldo Contable"
                    value={formState.accountBalance}
                    onChange={onInputJustNumber}
                    InputProps={{
                      readOnly: !createMode,
                    }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.accountBalance !== '' &&
                        formState.accountBalance != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="bankContact"
                    label="Contacto"
                    value={formState.bankContact}
                    onChange={onInputChange}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.bankContact !== '' &&
                        formState.bankContact != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="bankContactTitle"
                    label="Título"
                    value={formState.bankContactTitle}
                    onChange={onInputChange}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.bankContactTitle !== '' &&
                        formState.bankContactTitle != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="bankContactPhone"
                    label="Teléfono"
                    value={formState.bankContactPhone}
                    onChange={onInputJustNumber}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{
                      style: { textTransform: 'uppercase' },
                      maxLength: 10,
                    }}
                    InputLabelProps={{
                      shrink:
                        formState.bankContactPhone !== '' &&
                        formState.bankContactPhone != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="printedCheckNumber"
                    label="Número Cheque"
                    value={formState.printedCheckNumber}
                    onChange={onInputJustNumber}
                    InputProps={{
                      readOnly: true,
                    }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.printedCheckNumber !== '' &&
                        formState.printedCheckNumber != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="lastCheckNumber"
                    label="Último Número Cheque"
                    value={formState.lastCheckNumber}
                    onChange={onInputJustNumber}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    InputLabelProps={{
                      shrink:
                        formState.lastCheckNumber !== '' &&
                        formState.lastCheckNumber != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          </CardLayout>
        </Grid>
      </Grid>
    </Box>
  );
};
