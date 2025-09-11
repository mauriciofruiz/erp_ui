import { getUsuarioParams } from '@/backend';
import { EstadoCierreCajaEnum } from '@/enums';
import { getStartDateSystem, handleApiError } from '@/functions';
import { StyledDatePicker, useCierreCajaAsync, useStyles } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { PaginatedResponseType, UserType } from '@/types';
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
  onDateChange,
  onAutocompleteChange,
  setFormState,
}) => {
  const styles = useStyles();

  const { fetchMainPage } = useCierreCajaAsync();

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
    { label: string; value: EstadoCierreCajaEnum }[]
  >([]);

  const getEstadoCierreList = () => {
    return Object.keys(EstadoCierreCajaEnum)
      .filter((key): key is keyof typeof EstadoCierreCajaEnum =>
        isNaN(Number(key))
      )
      .map((key) => {
        const label = key.replace(/_/g, ' ');
        return { label: label, value: EstadoCierreCajaEnum[key] };
      });
  };

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    stateList: { label: string; value: EstadoCierreCajaEnum }[] | null
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

    setFormState({
      ...formState,
      byCurrentMonth: false,
    });

    const getResult = async () => {
      const paginacion = await fetchMainPage(
        formState.stateIds,
        formState.branchId,
        formState.userId,
        false,
        formState.startDate,
        formState.endDate,
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
        BÚSQUEDA AVANZADA DE CIERRE DE CAJA
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
              <Autocomplete
                className={styles.genericFieldStyle}
                options={getEstadoCierreList()}
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
                    label="Estado Cierre"
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
