import { ReceiptPurchaseEnum } from '@/enums';
import { getStartDateSystem } from '@/functions';
import {
  StyledDatePicker,
  useProveedorAsync,
  useRecepcionProveedorAsync,
  useStyles,
} from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { RootState } from '@/store';
import { PaginatedResponseType, PersonProviderType } from '@/types';
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

  const { fetchMainPage } = useRecepcionProveedorAsync();

  const { sucursales } = useSelector((state: RootState) => state.common);

  const { fetchByParam } = useProveedorAsync();

  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [providerSelected, setProviderSelected] =
    useState<PersonProviderType | null>();

  const receptionStates = Object.keys(ReceiptPurchaseEnum)
    .filter((key): key is keyof typeof ReceiptPurchaseEnum =>
      isNaN(Number(key))
    )
    .map((key) => ({ label: key, value: ReceiptPurchaseEnum[key] }));

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

  const handleAutocompleteProveedor = async (
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

  const [stateIdList, setStateIdList] = useState<
    { label: string; value: ReceiptPurchaseEnum }[]
  >([]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    stateList: { label: string; value: ReceiptPurchaseEnum }[] | null
  ) => {
    event.stopPropagation();
    if (!stateList) return;
    setStateIdList(receptionStates);
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
        formState.receptionId,
        formState.invoiceNumber,
        formState.providerId,
        formState.branchId,
        formState.starDate,
        formState.endDate,
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
        BÚSQUEDA AVANZADA RECEPCIÓN PROVEEDOR
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
                name="receptionId"
                label="Nro. Recepción"
                value={
                  formState.receptionId !== null ? formState.receptionId : ''
                }
                type="number"
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.receptionId ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="invoiceNumber"
                label="Nro. Factura"
                value={
                  formState.invoiceNumber !== null
                    ? formState.invoiceNumber
                    : ''
                }
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.invoiceNumber ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={receptionStates}
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
