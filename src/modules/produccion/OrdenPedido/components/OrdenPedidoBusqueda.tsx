import { getUsuarioByName } from '@/backend';
import { getSucursalByName } from '@/backend/tba/sucursaleServices';
import { EstadoOrdenProduccionEnum } from '@/enums';
import {
  FormState,
  StyledDatePicker,
  useAllowGlobal,
  useStyles,
} from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { SucursalType, UserType } from '@/types';
import { Search } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';

export type OrdenPedidoBusquedaProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
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
  onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const OrdenPedidoBusqueda: React.FC<OrdenPedidoBusquedaProps> = (
  props: OrdenPedidoBusquedaProps
) => {
  const {
    open,
    setOpen,
    onSubmit,
    formState,
    onDateChange,
    onInputChange,
    onAutocompleteChange,
    handleOnSelect,
  } = props;
  const styles = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBranch, setBranch] = useState('');
  const [userList, setUserlist] = useState<UserType[]>([]);
  const { enabledBranchs } = useAllowGlobal();
  const [enable, setEnabled] = useState(false);
  const [sucursal, setSucusral] = useState<SucursalType[]>([]);
  const [userSelected, setUserSelected] = useState<UserType | null>(null);

  const estadoProduccion = Object.keys(EstadoOrdenProduccionEnum)
    .filter((key): key is keyof typeof EstadoOrdenProduccionEnum =>
      isNaN(Number(key))
    )
    .map((key) => ({ label: key, value: EstadoOrdenProduccionEnum[key] }));

  const handleAutocompleteUser = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
    }
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
        BÚSQUEDA AVANZADA ORDEN DE PEDIDO
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Inicio"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                value={formState.startDate !== null ? formState.startDate : null}
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
                label="Fecha Fin"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
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
                name="code"
                label="Número de Pedido"
                value={formState.code !== null ? formState.code : ''}
                type="number"
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.code ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="state-label">Estado</InputLabel>
                <Select
                  name="state"
                  labelId="state-label"
                  id="state-select"
                  label="Estado"
                  value={formState.state === null ? '' : formState.state}
                  onChange={handleOnSelect}
                  fullWidth
                >
                  {estadoProduccion.map((estado) => (
                    <MenuItem
                      key={estado.value}
                      value={parseInt(estado.value?.toString() || '')}
                    >
                      {estado.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={userList}
                getOptionLabel={(option) => option.nick}
                style={{ width: '100%' }}
                onChange={(event, value) =>
                  onAutocompleteChange(event, 'user', value?.userId)
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
