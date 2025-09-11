import { EstadoLogisticaEnum } from '@/enums';
import {
  FormState,
  StyledDatePicker,
  useStyles,
  useTransporteAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { TransportistaGuiaInterface } from '@/types';
import { Add, BackHand, Info } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { parseISO } from 'date-fns';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

interface TransferenciaDialogoProps {
  openDialogAlert: boolean;
  setOpenDialogAlert: React.Dispatch<React.SetStateAction<boolean>>;
  openAnulation: boolean;
  setOpenAnulation: React.Dispatch<React.SetStateAction<boolean>>;
  openReception: boolean;
  setOpenReception: React.Dispatch<React.SetStateAction<boolean>>;
  openHistory: boolean;
  setOpenHistory: React.Dispatch<React.SetStateAction<boolean>>;
  formState: FormState;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  setStateForRequest: React.Dispatch<React.SetStateAction<number>>;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    listName: string,
    value: any
  ) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const TransferenciaDialogo = (props: TransferenciaDialogoProps) => {
  const styles = useStyles();
  const {
    openDialogAlert,
    setOpenDialogAlert,
    openAnulation,
    setOpenAnulation,
    openReception,
    setOpenReception,
    formState,
    onInputChange,
    openHistory,
    setOpenHistory,
    setStateForRequest,
    onAutocompleteChange,
    setFormState,
    onSubmit,
  } = props;
  const [transDialogo, setTransDialog] = useState(false);

  const [transportistasList, setTransportistasList] = useState<
    TransportistaGuiaInterface[]
  >([]);

  const { fetchTransportistaByIdentification } = useTransporteAsync();

  const [serchTearm, setSerchTearm] = useState('');

  const [isNew, setIsNew] = useState(false);

  const [validTransportist, setValidTransportist] = useState(false);

  const handleAutocomplete = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSerchTearm(inputValue);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchTransportistaByIdentification(serchTearm);
      if (response) {
        setTransportistasList(response);
      }
    };
    if (serchTearm.length >= 3) {
      fetchData();
    }
  }, [serchTearm]);

  const transportistaSelected: TransportistaGuiaInterface = useMemo(() => {
    if (!formState.transportista) {
      setValidTransportist(false);
      return {
        contactId: '',
        contactName: '',
        licensePlate: '',
        transportId: null,
      };
    } else {
      let isValid = false;
      if (
        formState.transportista.contactId !== '' &&
        formState.transportista.contactName !== '' &&
        formState.transportista.licensePlate !== '' &&
        formState.transportista.addressTransporter !== ''
      ) {
        isValid = true;
      }
      setValidTransportist(isValid);
      return formState.transportista;
    }
  }, [formState.transportista]);

  const onDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenAnulation(false);
    setOpenReception(false);
    setOpenDialogAlert(false);
    setTransDialog(false);

    onSubmit(event);
  };

  const openTransporter = () => {
    setOpenDialogAlert(false);
    setTransDialog(true);
  };

  useEffect(() => {
    if (isNew) {
      setTransportistasList([]);
      setFormState((prevState) => ({
        ...prevState,
        transportista: undefined,
      }));
    }
  }, [isNew]);

  const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      transportista: {
        ...prevState.transportista,
        [name]: value,
      },
    }));
  };

  return (
    <>
      <Dialog open={openDialogAlert} onClose={() => setOpenDialogAlert(false)}>
        <form onSubmit={onDialogConfirm}>
          <DialogContent>
            <Alert severity="warning" icon={<Info />}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
              La transferencia posee Guia de Remisión?
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button
              type="submit"
              color="primary"
              onClick={() => setStateForRequest(EstadoLogisticaEnum.CONFIRMADA)}
            >
              No
            </Button>
            <Button color="primary" onClick={openTransporter}>
              Si
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openAnulation} onClose={() => setOpenAnulation(false)}>
        <form onSubmit={onDialogConfirm}>
          <DialogContent>
            <Alert severity="info" icon={<Info />}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
              Los datos no se podrán restablecer después de anular la lista
              transferencia. ¿Estás seguro de que deseas proceder?
            </Alert>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  name="cancellObservation"
                  label="Motivo Anulación"
                  value={
                    formState.cancellObservation !== null
                      ? formState.cancellObservation
                      : ''
                  }
                  onChange={onInputChange}
                  InputLabelProps={{
                    shrink:
                      formState.cancellObservation !== null &&
                      formState.cancellObservation !== ''
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAnulation(false)} color="primary">
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              onClick={() => setStateForRequest(EstadoLogisticaEnum.ANULADA)}
              disabled={
                formState.cancellObservation === null ||
                formState.cancellObservation === ''
              }
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={transDialogo} onClose={() => setTransDialog(false)}>
        <form onSubmit={onDialogConfirm}>
          <DialogContent>
            <CardLayout title={'Transportista'}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sx={{ mb: 1 }}>
                  <Button
                    startIcon={isNew ? <BackHand /> : <Add />}
                    onClick={() => setIsNew(!isNew)}
                    style={{ width: '120px' }}
                  >
                    {isNew ? 'Existente' : 'Nuevo'}
                  </Button>
                </Grid>
                {!isNew && (
                  <Grid item xs={12}>
                    <Autocomplete
                      className={styles.genericFieldStyle}
                      options={transportistasList}
                      getOptionLabel={(option) =>
                        option !== null ? option.contactName : ''
                      }
                      style={{ width: '100%' }}
                      onChange={(event, value) => {
                        onAutocompleteChange(event, 'transportista', value);
                      }}
                      onInputChange={(event, newInputValue) =>
                        handleAutocomplete(event, newInputValue)
                      }
                      value={formState.transportista}
                      isOptionEqualToValue={(option, value) =>
                        value && option.userId === value.userId
                      }
                      readOnly={isNew}
                      noOptionsText="Sin resultados"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Transportista"
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
                <Grid item xs={12}>
                  <TextField
                    name="contactName"
                    label="Nombre"
                    value={transportistaSelected.contactName}
                    onChange={onChangeInput}
                    InputProps={{
                      readOnly: !isNew,
                    }}
                    InputLabelProps={{
                      shrink:
                        transportistaSelected.contactName !== '' ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="contactId"
                    label="Indentificación"
                    value={transportistaSelected.contactId}
                    onChange={onChangeInput}
                    InputProps={{
                      readOnly: !isNew,
                    }}
                    InputLabelProps={{
                      shrink:
                        transportistaSelected.contactId !== '' ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="licensePlate"
                    label="Placa"
                    value={transportistaSelected.licensePlate}
                    onChange={onChangeInput}
                    InputProps={{
                      readOnly: !isNew,
                    }}
                    InputLabelProps={{
                      shrink:
                        transportistaSelected.licensePlate !== ''
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="addressTransporter"
                    label="Dirección Llegada"
                    value={formState.addressTransporter}
                    onChange={onInputChange}
                    InputLabelProps={{
                      shrink:
                        formState.addressTransporter !== '' ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledDatePicker
                    label="Fecha Llegada"
                    minDate={new Date()}
                    format="dd/MM/yyyy"
                    value={
                      typeof formState.arrivalDate === 'string'
                        ? parseISO(formState.arrivalDate)
                        : formState.arrivalDate
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
                          shrink: true,
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardLayout>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransDialog(false)} color="primary">
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={!validTransportist}
              onClick={() => setTransDialog(false)}
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openReception} onClose={() => setOpenReception(false)}>
        <form onSubmit={onDialogConfirm}>
          <DialogContent>
            <Alert severity="info" icon={<Info />}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
              ¿Estás seguro de que deseas proceder con la recepción?
            </Alert>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  name="motive"
                  label="Motivo Recpeción"
                  value={
                    formState.motive !== null
                      ? formState.motive
                      : formState.motive
                  }
                  onChange={onInputChange}
                  InputLabelProps={{
                    shrink:
                      formState.motive !== null && formState.motive !== ''
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReception(false)} color="primary">
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              onClick={() =>
                setStateForRequest(EstadoLogisticaEnum.RECEPCIONADA)
              }
              disabled={formState.motive === null || formState.motive === ''}
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={openHistory} onClose={() => setOpenHistory(false)}>
        <DialogTitle
          style={{
            cursor: 'move',
            textAlign: 'center',
          }}
          id="draggable-dialog-title"
          sx={{ mt: 2 }}
        >
          Historial
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField
                name="usuarioEnvia"
                label="Usuario Creación"
                value={
                  formState.usuarioEnvia === null ? '' : formState.usuarioEnvia
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: formState.usuarioEnvia !== null ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="usuarioAprueba"
                label="Usuario Aprueba"
                value={
                  formState.usuarioAprueba === null
                    ? ''
                    : formState.usuarioAprueba
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: formState.usuarioAprueba !== null ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="usuarioAnula"
                label="Usuario Anula"
                value={
                  formState.usuarioAnula === null ? '' : formState.usuarioAnula
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: formState.usuarioAnula !== null ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Solicitud"
                disableOpenPicker
                readOnly
                format="dd/MM/yyyy"
                value={formState.fechaSolicitud}
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
                      shrink: true,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Aprobación"
                disableOpenPicker
                readOnly
                format="dd/MM/yyyy"
                value={formState.fechaAprobacion}
                slotProps={{
                  textField: {
                    required: false,
                    className: styles.genericFieldStyle,
                    sx: {
                      minWidth: '100%',
                    },
                    InputProps: {
                      className: styles.textWhiteStyle,
                    },
                    InputLabelProps: {
                      className: styles.textGreenStyle,
                      shrink: true,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Modificación"
                disableOpenPicker
                readOnly
                format="dd/MM/yyyy"
                value={formState.fechaModificacion}
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
                      shrink: true,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistory(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
