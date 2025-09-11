import { getUsuarioParams } from '@/backend';
import { EstadoEgresoEnum } from '@/enums';
import { getStartDateSystem, handleApiError } from '@/functions';
import { StyledDatePicker, useEgresoCajaAsync, useStyles } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { PaginatedResponseType, UserType } from '@/types';
import { CleaningServices, Search } from '@mui/icons-material';
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
  onInputChangeTwoDecimal: (event: React.ChangeEvent<HTMLInputElement>) => void;

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
  onInputChangeTwoDecimal,
}) => {
  const styles = useStyles();

  const { fetchMainPage } = useEgresoCajaAsync();

  const { sucursales } = useSelector((state: RootState) => state.common);

  const [searchTermUser, setSearchTermUser] = useState('');

  const [userList, setUserlist] = useState<UserType[]>([]);

  const [userSelected, setUserSelected] = useState<UserType | null>();

  useEffect(() => {
    if (formState.userId === null) {
      setUserSelected(null);
      return;
    }
    if (userSelected && userSelected !== null && userList.length === 0) return;
    const user = userList.find((user) => user.userId === formState.userId);
    setUserSelected(user);
  }, [formState.userId, userList]);

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
    { label: string; value: EstadoEgresoEnum }[]
  >([]);

  const getEstadoEgresoList = () => {
    return Object.keys(EstadoEgresoEnum)
      .filter((key): key is keyof typeof EstadoEgresoEnum =>
        isNaN(Number(key))
      )
      .map((key) => {
        const label = key.replace(/_/g, ' ');
        return { label: label, value: EstadoEgresoEnum[key] };
      });
  };

  const handleBlurDecimal = (event: any) => {
    const { name, value } = event.target;
    // Si el valor termina en una coma o un punto, agregar "00"
    if (value.endsWith(',') || value.endsWith('.')) {
      const updatedValue = value.replace(/[.,]$/, ',00');
      setFormState({
        ...formState,
        [name]: updatedValue,
      });
    }
  };

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    stateList: { label: string; value: EstadoEgresoEnum }[] | null
  ) => {
    event.stopPropagation();
    if (!stateList) return;
    setStateIdList(stateList);
    const stateIdMapped = stateList.map((state) => state.value);

    const stateIdString = stateIdMapped.join(',');
    setFormState({ ...formState, stateIds: stateIdString });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    debugger;
    setFormState({
      ...formState,
      byCurrentMonth: false,
    });

    const getResult = async () => {
      const paginacion = await fetchMainPage(
        formState.stateIds,
        formState.branchId,
        formState.flowOutId,
        formState.amount,
        formState.description,
        formState.userId,
        false,
        formState.startDate,
        formState.endDate,
        formState.page,
        formState.pageSize,
        formState.sortColumn,
        formState.sortDirection,
        
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
    setOpen(false);
  };
  const handleClick = () => {
    setStateIdList([]);
    setFormState({
      ...formState,
      stateIds:null,
      branchId: '',
      flowOutId: '',
      amount: '',
      description: '',
      userId: null,
      startDate: null,
      endDate: null,
      byCurrentMonth: true,
      page: 0,
      pageSize: 10,
      sortColumn: null,
      sortDirection: null,
    });
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
        BÚSQUEDA AVANZADA DE EGRESO DE CAJA
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
                value={formState.startDate}
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
                minDate={formState.startDate}
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
                name="flowOutId"
                label="Número de Egreso"
                type="number"
                value={formState.flowOutId}
                onChange={onInputChange}
                InputLabelProps={{
                  shrink:
                    formState.flowOutId !== '' &&
                    formState.flowOutId != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={getEstadoEgresoList()}
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
                    label="Estado Egreso"
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
                name="amount"
                label="Monto"
                type="number"
                value={formState.amount}
                onChange={onInputChangeTwoDecimal}
                onBlur={handleBlurDecimal}
                inputProps={{
                  style: { textTransform: 'uppercase' },
                }}
                InputLabelProps={{
                  shrink:
                    formState.amount !== '' &&
                    formState.amount != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Observación"
                                value={formState.description !== '' ? formState.description : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.description ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
          </Grid>

          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid
              item
              xs={6}
              container
              direction="row"
              justifyContent="right"
              alignItems="right"
              sx={{ mt: 2 }}
            >
              <Button
                startIcon={<Search />}
                sx={{ margin: 2, width: 150 }}
                type="submit"
              >
                {'Buscar'}
              </Button>
            </Grid>
            <Grid
              item
              xs={6}
              container
              direction="row"
              justifyContent="left"
              alignItems="left"
              sx={{ mt: 2 }}
            >
              <Button
                startIcon={<CleaningServices />}
                sx={{ margin: 2, width: 150 }}
                type="button"
                onClick={handleClick}
              >
                {'Limpiar Filtros'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};
