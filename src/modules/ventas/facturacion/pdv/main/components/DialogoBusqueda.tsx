import { getUsuarioParams } from '@/backend';
import { ComprobanteEstadoEnum } from '@/enums';
import {
  getComprobanteEstadoList,
  getStartDateSystem,
  handleApiError,
} from '@/functions';
import {
  StyledDatePicker,
  useFacturaVentaAsync,
  usePersonaAsync,
  useStyles,
} from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { PaginatedResponseType, PersonClientType, UserType } from '@/types';
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
}) => {
  const styles = useStyles();

  const { fetchMainPage } = useFacturaVentaAsync();

  const { fetchClientPersonByParam } = usePersonaAsync();

  const { sucursales } = useSelector((state: RootState) => state.common);

  const [clientePersonaList, setClientePersonaList] = useState<
    PersonClientType[]
  >([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [searchTermUser, setSearchTermUser] = useState('');

  const [userList, setUserlist] = useState<UserType[]>([]);

  const [userSelected, setUserSelected] = useState<UserType | null>();

  const [clienteSelected, setClientSelected] =
    useState<PersonClientType | null>();

  useEffect(() => {
    if (formState.providerId === null) {
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
  }, [formState.clientId, clientePersonaList]);

  useEffect(() => {
    if (formState.userId === null) {
      setUserSelected(null);
      return;
    }
    if (userSelected && userSelected !== null && userList.length === 0) return;
    const user = userList.find((user) => user.userId === formState.userId);
    setUserSelected(user);
  }, [formState.userId, userList]);

  const handleAutocompleteClient = async (
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
    setFormState({ ...formState, stateIdList: stateIdString });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormState({
      ...formState,
      byCurrentMonth: false,
    });

    const getResult = async () => {
      const paginacion = await fetchMainPage(
        formState.stateIdList,
        formState.clientId,
        formState.documentNumber,
        formState.branchId,
        formState.userId,
        formState.emissionStartDate,
        formState.emissionEndDate,
        false,
        formState.page,
        formState.pageSize,
        formState.sortDirection,
        formState.sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);
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
        BÚSQUEDA AVANZADA FACTURACIÓN PDV
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
                value={formState.emissionStartDate}
                onChange={(value) =>
                  onDateChange(value as Date, 'emissionStartDate')
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
                      shrink: formState.emissionStartDate ? true : false,
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
                minDate={formState.emissionStartDate}
                maxDate={new Date()}
                value={formState.emissionEndDate}
                onChange={(value) =>
                  onDateChange(value as Date, 'emissionEndDate')
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
                      shrink: formState.emissionEndDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={clientePersonaList}
                getOptionLabel={(option) =>
                  option !== null ? option.personName : ''
                }
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  onAutocompleteChange(event, 'clientId', value?.clientId);
                }}
                onInputChange={(event, newInputValue) =>
                  handleAutocompleteClient(event, newInputValue)
                }
                value={clienteSelected}
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
            <Grid item xs={6}>
              <TextField
                name="documentNumber"
                label="Nro. Documento"
                value={
                  formState.documentNumber !== null
                    ? formState.documentNumber
                    : ''
                }
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.documentNumber ? true : false,
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
