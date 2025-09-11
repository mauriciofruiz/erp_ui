import {
  getStartDateSystem,
} from "@/functions";
import {
  StyledDatePicker,
  useCobroAsync,
  usePersonaAsync,
  useStyles,
} from "@/hooks";
import { LabeledInputNumber, PaperComponent } from "@/modules/layout";
import { RootState } from "@/store";
import { PaginatedResponseType, PersonClientType } from "@/types";
import { Search } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import { parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

type DialogoBusquedaProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  formState: any;
  onInputNumberChange: (value: number, field: string) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenericChange: (value: any, field: string) => void;
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
  onGenericChange,
  onAutocompleteChange,
  onInputNumberChange,
  setFormState,
}) => {
  const styles = useStyles();

  const { fetchMainPage } = useCobroAsync();

  const { sucursales } = useSelector((state: RootState) => state.common);

  const { fetchClientPersonByParam } = usePersonaAsync();

  const [clientePersonaList, setClientePersonaList] = useState<
    PersonClientType[]
  >([]);

  const [searchTerm, setSearchTerm] = useState("");

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

  const handleAutocompleteClient = async (
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
      const response = await fetchClientPersonByParam(searchTerm);
      if (response) {
        setClientePersonaList(response as PersonClientType[]);
      }
    };

    if (searchTerm.length >= 3) {
      fetchData();
    }
  }, [searchTerm]);



  

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setFormState({
      ...formState,
      byCurrentMonth: false,
    });

    const getResult = async () => {
      const paginacion = await fetchMainPage(
        formState.chargeId,
        formState.clientId,
        formState.userId,
        formState.invoiceNumber,
        formState.branchId,
        formState.amount,
        formState.startDate,
        formState.endDate,
        false,
        formState.page,
        formState.pageSize,
        formState.sortDirection,
        formState.sortField
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
          position: "fixed",
          top: 0,
        },
      }}
    >
      <DialogTitle
        style={{
          cursor: "move",
          textAlign: "center",
        }}
        id="draggable-dialog-title"
        sx={{ mt: 2 }}
      >
        BÚSQUEDA AVANZADA DE COBROS CLIENTES
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Inicio"
                views={["year", "month", "day"]}
                format="dd/MM/yyyy"
                minDate={getStartDateSystem()}
                maxDate={new Date()}
                value={
                  typeof formState.startDate === 'string'
                    ? parseISO(formState.startDate)
                    : formState.startDate
                }
                onChange={(value) =>
                  onGenericChange((value as Date).toISOString(), 'startDate')
                }
                slotProps={{
                  textField: {
                    className: styles.genericFieldStyle, 
                    sx: {
                      minWidth: "100%",
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
                value={
                  typeof formState.endDate === 'string'
                    ? parseISO(formState.endDate)
                    : formState.endDate
                }
                onChange={(value) =>
                  onGenericChange((value as Date).toISOString(), 'endDate')
                }
                slotProps={{
                  textField: {
                    className: styles.genericFieldStyle,
                    sx: {
                      minWidth: "100%",
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
                name="chargeId"
                label="Nro. Cobro"
                value={
                  formState.chargeId !== null
                    ? formState.chargeId
                    : ""
                }
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.chargeId ? true : false,
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
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
                style={{ width: "100%" }}
                onChange={(event, value) =>
                  onAutocompleteChange(event, "branchId", value?.branchId)
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
              <LabeledInputNumber
                label="Monto"
                inputNumberProps={{
                  onChange: (amount) =>
                    onInputNumberChange(amount as number, "amount"),
                  value: formState.amount,
                  min: 0,
                  defaultValue: 0,
                  controls: false,
                  precision: 2,
                  prefix: "$",
                  onFocus: (e: any) => e.target.select(),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="invoiceNumber"
                label="Factura"
                value={
                  formState.invoiceNumber !== null
                    ? formState.invoiceNumber
                    : ""
                }
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.invoiceNumber ? true : false,
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
              {"Buscar"}
            </Button>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};
