import { getSucursalByName, getUsuarioByName } from '@/backend';
import { ComprobanteEstadoEnum } from '@/enums';
import { getComprobanteEstadoList } from '@/functions';
import {
  FormState,
  StyledDatePicker,
  useAllowGlobal,
  useProveedorAsync,
  useRetencionProveedorAsync,
  useStyles,
} from '@/hooks';
import { LabeledInputNumber, PaperComponent } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import {
  PaginatedResponseType,
  PersonProviderType,
  SucursalType,
  UserType,
} from '@/types';
import { Search } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import axios from 'axios';
import format from 'date-fns/format';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, useEffect, useState } from 'react';

export type RetencionProveedorPaginacionProps = {
  // types...
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  //onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  formState: FormState;
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
  handleOnSelect: (event: SelectChangeEvent<any>) => void;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  onResetForm: () => void;
  onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
  onInputNumberChange: (value: number, field: string) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
};

export const RetencionProveedorBusqueda: React.FC<
  RetencionProveedorPaginacionProps
> = ({
  open,
  setOpen,
  formState,
  onDateChange,
  onAutocompleteChange,
  onInputChange,
  setPagination,
  onResetForm,
  onInputJustNumber,
  onInputNumberChange,
  setFormState,
}) => {
  const styles = useStyles();
  const { enabledBranchs } = useAllowGlobal();
  const { fetchMainPageRP } = useRetencionProveedorAsync();
  const [enable, setEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBranch, setBranch] = useState('');
  const [searchProvider, setSearchProvider] = useState('');
  const [userSelected, setUserSelected] = useState<UserType | null>(null);
  const [sucursal, setSucusral] = useState<SucursalType[]>([]);
  const [userList, setUserlist] = useState<UserType[]>([]);
  const [providerSelected, setProviderSelected] =
    useState<PersonProviderType | null>(null);
  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);

  const { fetchByParam } = useProveedorAsync();

  const [stateIdList, setStateIdList] = useState<
    { label: string; value: ComprobanteEstadoEnum }[]
  >([]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    stateList: { label: string; value: ComprobanteEstadoEnum }[] | null
  ) => {
    event.stopPropagation();
    if (!stateList) return;
    setStateIdList(stateList);
    const stateIdMapped = stateList.map((state) => state.value);

    const stateIdString = stateIdMapped.join(',');
    setFormState({ ...formState, stateId: stateIdString });
  };

  const handleAutocompleteBranch = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setBranch(inputValue);
    }
  };

  const handleAutocompleteProveedor = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchProvider(inputValue);
    }
  };

  const handleAutocompleteUser = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  useEffect(() => {
    const enabledSucursal = enabledBranchs;
    setEnabled(enabledSucursal);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: SucursalType[] | undefined = await getSucursalByName(
          searchBranch.toUpperCase(),
          true
        );
        if (response) {
          setSucusral(response);
        } else {
          setSucusral([]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setSucusral([]);
            enqueueSnackbar('No se ha encontrado la sucursal buscadoa', {
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
    if (searchBranch.length >= 3) {
      fetchData();
    }
  }, [searchBranch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: ServerResponseType | undefined = await getUsuarioByName(
          searchTerm.toUpperCase(),
          true
        );
        if (response) {
          if (response.status === 200) {
            setUserlist(response.message);
          }
        } else {
          setUserlist([]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setUserlist([]);
            enqueueSnackbar('No se ha encontrado el usuario buscado', {
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
    if (searchTerm.length >= 3) {
      fetchData();
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      fetchByParam(searchTerm.toUpperCase()).then((response) => {
        if (response) {
          setProveedoredorPersonaList(response);
        }
      });
    };
    if (searchProvider.length >= 3) {
      fetchData();
    }
  }, [searchProvider]);

  useEffect(() => {
    if (formState.user === null) {
      setUserSelected(null);
      return;
    }
    if (userSelected && userSelected !== null && userList.length === 0) return;
    const user = userList.find((user) => user.userId === formState.user);
    if (user) {
      setUserSelected(user);
    }
  }, [formState.user, userSelected]);

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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const getResult = async () => {
      const paginacion = await fetchMainPageRP(
        formState.startDate !== null
          ? format(formState.startDate, 'dd/MM/yyyy')
          : null,
        formState.endDate !== null
          ? format(formState.endDate, 'dd/MM/yyyy')
          : null,
        formState.retentionNumber,
        formState.invoiceNumber,
        formState.providerId,
        formState.retentionValue,
        formState.invoiceValue,
        formState.branchId,
        formState.stateId,
        formState.userId,
        formState.byCurrentMonth,
        formState.page,
        formState.pageSize,
        formState.sortDirection,
        formState.sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
    onResetForm();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: 0,
        },
      }}
    >
      <DialogTitle
        style={{
          cursor: 'move',
          textAlign: 'center',
        }}
        id="draggable-dialog-title"
        sx={{ mt: 2 }}
      >
        BÚSQUEDA AVANZADA RETENCION PROVEEDOR
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Inicio"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                maxDate={formState.startDate}
                value={
                  formState.startDate !== null ? formState.startDate : null
                }
                onChange={(value) => onDateChange(value as Date, 'startDate')}
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
                      shrink: formState.startDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Inicio"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                minDate={formState.startDate}
                value={formState.endDate !== null ? formState.endDate : null}
                onChange={(value) => onDateChange(value as Date, 'endDate')}
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
                      shrink: formState.endDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="retentionNumber"
                label="Número Retención"
                value={
                  formState.retentionNumber !== null
                    ? formState.retentionNumber
                    : ''
                }
                onChange={onInputJustNumber}
                InputLabelProps={{
                  shrink: formState.retentionNumber ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              {enable ? (
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={sucursal}
                  getOptionLabel={(option) => option.name}
                  style={{ width: '100%' }}
                  onChange={(event, value) =>
                    onAutocompleteChange(event, 'branch', value?.branchId)
                  }
                  onInputChange={(event, newInputValue) =>
                    handleAutocompleteBranch(event, newInputValue)
                  }
                  value={
                    (formState.branch !== null
                      ? sucursal.find(
                          (provider) => provider.branchId === formState.branch
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
              ) : (
                <TextField
                  name="sucursal"
                  label="Sucursal"
                  value={formState.sucursal !== null ? formState.sucursal : ''}
                  onChange={onInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="invoiceNumber"
                label="Número Factura"
                value={
                  formState.invoiceNumber !== null
                    ? formState.invoiceNumber
                    : ''
                }
                onChange={onInputJustNumber}
                InputLabelProps={{
                  shrink: formState.invoiceNumber ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={getComprobanteEstadoList()}
                getOptionLabel={(option) => option.label}
                style={{ width: '100%' }}
                multiple
                onChange={handleChange}
                value={stateIdList}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                filterSelectedOptions
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
            <Grid item xs={6}>
              <Autocomplete
                id="autocomplete-sucursales"
                className={styles.genericFieldStyle}
                options={proveedorPersonaList}
                getOptionLabel={(option) => option.providerName}
                style={{ width: '100%' }}
                onChange={(event, value) =>
                  onAutocompleteChange(event, 'providerId', value?.providerId)
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
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={userList}
                getOptionLabel={(option) => option.nick}
                style={{ width: '100%' }}
                onChange={(event, value) =>
                  onAutocompleteChange(event, 'userId', value?.userId)
                }
                onInputChange={(event, newInputValue) =>
                  handleAutocompleteUser(event, newInputValue)
                }
                value={userSelected}
                isOptionEqualToValue={(option, value) =>
                  option.userId === value.userId
                }
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Usuario"
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
              <LabeledInputNumber
                label="Valor Retención"
                inputNumberProps={{
                  onChange: (value) =>
                    onInputNumberChange(value as number, 'retentionValue'),
                  value: formState.retentionValue,
                  min: 0,
                  defaultValue: 0,
                  controls: false,
                  precision: 2,
                  prefix: '$',
                  onFocus: (e: any) => e.target.select(),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <LabeledInputNumber
                label="Valor Factura"
                inputNumberProps={{
                  onChange: (value) =>
                    onInputNumberChange(value as number, 'invoiceValue'),
                  value: formState.invoiceValue,
                  min: 0,
                  defaultValue: 0,
                  controls: false,
                  precision: 2,
                  prefix: '$',
                  onFocus: (e: any) => e.target.select(),
                }}
              />
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Button startIcon={<Search />} sx={{ margin: 2 }} type="submit">
              {'Buscar'}
            </Button>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};
