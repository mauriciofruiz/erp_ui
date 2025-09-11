import { getEstadoImportación } from '@/backend/adquisiciones/aperturaImportacionServices';
import {
  FormState,
  StyledDatePicker,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { PersonProviderType } from '@/types';
import { EstadoAperturaType } from '@/types/importaciones/aperturaImportacionType';
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
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, useEffect, useState } from 'react';

export type BusquedaAvanzadaAperturaProps = {
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
};

export const BusquedaAvanzadaApertura: React.FC<
  BusquedaAvanzadaAperturaProps
> = ({
  open,
  setOpen,
  onSubmit,
  formState,
  onDateChange,
  onAutocompleteChange,
  onInputChange,
  handleOnSelect,
}) => {
  const styles = useStyles();
  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoList, setEstadoList] = useState<EstadoAperturaType[]>([]);
  const [providerSelected, setProviderSelected] =
    useState<PersonProviderType | null>(null);

  const { fetchByParam } = useProveedorAsync();

  const handleAutocompleteProveedor = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  const getEstadoApetura = async () => {
    const response = await getEstadoImportación();
    try {
      if (response) {
        setEstadoList(response);
      }
    } catch (error) {
      enqueueSnackbar('Error Del Servidor: ' + error, {
        variant: 'error',
      });
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

  useEffect(() => {
    getEstadoApetura();
  }, []);

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
        BÚSQUEDA AVANZADA APERTURA IMPORTACIÓN
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Inicio"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                maxDate={formState.fechaFin}
                value={
                  formState.fechaInicio !== null ? formState.fechaInicio : null
                }
                onChange={(value) => onDateChange(value as Date, 'fechaInicio')}
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
                      shrink: formState.fechaInicio ? true : false,
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
                maxDate={new Date()}
                value={formState.fechaFin !== null ? formState.fechaFin : null}
                onChange={(value) => onDateChange(value as Date, 'fechaFin')}
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
                      shrink: formState.fechaFin ? true : false,
                    },
                  },
                }}
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
              <FormControl fullWidth>
                <InputLabel id="state-label">Estado</InputLabel>
                <Select
                  name="estado"
                  labelId="state-label"
                  id="state-select"
                  label="Estado"
                  value={formState.estado === null ? '' : formState.estado}
                  onChange={handleOnSelect}
                  fullWidth
                >
                  {estadoList.map((estado) => (
                    <MenuItem
                      key={estado.importStateId}
                      value={estado.importStateId || ''}
                    >
                      {estado.importStateName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="partida"
                label="Partida"
                value={formState.partida !== null ? formState.partida : ''}
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.partida ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="listaPedido"
                label="Lista Pedido"
                value={
                  formState.listaPedido !== null ? formState.listaPedido : ''
                }
                type="number"
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.listaPedido ? true : false,
                }}
                fullWidth
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
