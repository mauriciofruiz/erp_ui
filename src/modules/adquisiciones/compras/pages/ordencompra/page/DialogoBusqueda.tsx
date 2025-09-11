import { getUsuarioParams } from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { EstadoOrdenEnum } from '@/enums';
import { getStartDateSystem, handleApiError } from '@/functions';
import {
  StyledDatePicker,
  useAperturaImportacionAsync,
  useOrdenCompraAsync,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import {
  AperturaImportacionMainType,
  PaginatedResponseType,
  PersonProviderType,
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
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

type DialogoBusquedaProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  formState: any;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (value: Date, name: string) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    name: string,
    value: any
  ) => void;
  setFormState: React.Dispatch<React.SetStateAction<any>>;
  isForeign: boolean;
};

export const DialogoBusqueda: React.FC<DialogoBusquedaProps> = ({
  open,
  setOpen,
  setPagination,
  formState,
  onInputChange,
  onDateChange,
  onAutocompleteChange,
  setFormState,
  isForeign,
}) => {
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const styles = useStyles();

  const { fetchMainPage } = useOrdenCompraAsync();

  const { fetchAll } = useAperturaImportacionAsync();

  const { sucursales } = useSelector((state: RootState) => state.common);

  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [providerSelected, setProviderSelected] =
    useState<PersonProviderType | null>();

  const [searchTermUser, setSearchTermUser] = useState('');

  const [aperturaList, setAperturaList] = useState<
    AperturaImportacionMainType[]
  >([]);

  const [userList, setUserlist] = useState<UserType[]>([]);

  const [userSelected, setUserSelected] = useState<UserType | null>();

  const { fetchByParam } = useProveedorAsync();

  const purchaseOrderStates = () => {
    return Object.keys(EstadoOrdenEnum)
      .filter((key): key is keyof typeof EstadoOrdenEnum => isNaN(Number(key)))
      .map((key) => {
        const label = key.replace(/_/g, ' ');
        return { label: label, value: EstadoOrdenEnum[key] };
      });
  };

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
    setProviderSelected(provider);
  }, [formState.providerId, proveedorPersonaList]);

  useEffect(() => {
    if (formState.userId === null) {
      setUserSelected(null);
      return;
    }
    if (userSelected && userSelected !== null && userList.length === 0) return;
    const user = userList.find((user) => user.userId === formState.userId);
    setUserSelected(user);
  }, [formState.userId, userList]);

  const handleAutocompleteProveedor = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  const handleAutocompleteUsuario = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTermUser(inputValue);
    }
  };

  useEffect(() => {
    if (!open && isForeign) {
      setAperturaList([]);
      return;
    }

    const fetchAperturas = async () => {
      try {
        const paginacion = await fetchAll();
        setAperturaList(paginacion?.list as AperturaImportacionMainType[]);
      } catch (error) {
        handleApiError(error);
      }
    };
    isForeign && fetchAperturas();
  }, [open, isForeign]);

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
      try {
        const response: ServerResponseType | undefined = await getUsuarioParams(
          searchTermUser.toUpperCase(),
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
        handleApiError(error);
      }
    };

    if (searchTermUser.length >= 3) {
      fetchData();
    }
  }, [searchTermUser]);

  const [stateIdList, setStateIdList] = useState<
    { label: string; value: EstadoOrdenEnum }[]
  >([]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    stateList: { label: string; value: EstadoOrdenEnum }[] | null
  ) => {
    event.stopPropagation();
    if (!stateList) return;
    setStateIdList(stateList);
    const stateIdMapped = stateList.map((state) => state.value);

    const stateIdString = stateIdMapped.join(',');
    setFormState({ ...formState, stateIdList: stateIdString });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    showLoading();

    event.preventDefault();

    setFormState({
      ...formState,
      byCurrentMonth: false,
    });

    const getResult = async () => {
      const paginacion = await fetchMainPage(
        formState.stateIdList,
        formState.orderId,
        formState.userId,
        formState.providerId,
        formState.branchId,
        formState.importOpeningId,
        formState.productId,
        formState.starDate,
        formState.endDate,
        false,
        isForeign,
        formState.page,
        formState.pageSize,
        formState.sortDirection,
        formState.sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);

      hideLoading();
    };
    getResult();
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
        {'Búsqueda Avanzada Orden de Compra'}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Inicio"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                minDate={getStartDateSystem()}
                maxDate={new Date()}
                value={formState.starDate}
                onChange={(value) => onDateChange(value as Date, 'starDate')}
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
                      shrink: formState.starDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Fin"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                minDate={formState.endDate}
                maxDate={new Date()}
                value={formState.endDate}
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
              <Autocomplete
                className={styles.genericFieldStyle}
                options={proveedorPersonaList}
                getOptionLabel={(option) =>
                  option !== null ? option.providerName : ''
                }
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  onAutocompleteChange(event, 'providerId', value?.providerId);
                }}
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
              <TextField
                name="orderId"
                label="Nro. Orden"
                value={formState.orderId !== null ? formState.orderId : ''}
                type="number"
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.orderId ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={purchaseOrderStates()}
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
                className={styles.genericFieldStyle}
                options={sucursales}
                getOptionLabel={(option) => option.name}
                style={{ width: '100%' }}
                onChange={(event, value) =>
                  onAutocompleteChange(event, 'branchId', value?.branchId)
                }
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
            {isForeign && (
              <Grid item xs={6}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={aperturaList}
                  getOptionLabel={(option) => option.importOpeningCode}
                  style={{ width: '100%' }}
                  onChange={(event, value) =>
                    onAutocompleteChange(
                      event,
                      'importOpeningId',
                      value?.importOpeningId
                    )
                  }
                  value={
                    (formState.importOpeningId !== null
                      ? aperturaList.find(
                          (apertura) =>
                            apertura.importOpeningId ===
                            formState.importOpeningId
                        )
                      : null) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.importOpeningId === value.importOpeningId
                  }
                  filterOptions={(options, params) => {
                    const filtered = options.filter(
                      (option) =>
                        option.importOpeningCode
                          .toUpperCase()
                          .indexOf(params.inputValue.toUpperCase()) !== -1
                    );

                    return filtered;
                  }}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Apertura Importación"
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
            )}
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={userList}
                getOptionLabel={(option) =>
                  option !== null ? option.nick : ''
                }
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  onAutocompleteChange(event, 'userId', value?.userId);
                }}
                onInputChange={(event, newInputValue) =>
                  handleAutocompleteUsuario(event, newInputValue)
                }
                value={userSelected}
                isOptionEqualToValue={(option, value) =>
                  value && option.userId === value.userId
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
