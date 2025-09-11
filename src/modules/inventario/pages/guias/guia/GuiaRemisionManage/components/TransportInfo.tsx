import {
  FormState,
  StyledDatePicker,
  useStyles,
  useTransporteAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { TransportistaGuiaInterface } from '@/types';
import { Add, BackHand } from '@mui/icons-material';
import { Autocomplete, Box, Button, Grid, TextField } from '@mui/material';
import { parseISO } from 'date-fns';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

interface TransportInfoProps {
  formState: FormState;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    listName: string,
    value: any
  ) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onGenericChange: (value: any, field: string) => void;
  createMode: boolean;
  editMode: boolean;
}

export const TransportInfo = (props: TransportInfoProps) => {
  const styles = useStyles();
  const {
    formState,
    onInputChange,
    onAutocompleteChange,
    setFormState,
    onGenericChange,
    createMode,
    editMode,
  } = props;

  const [transportistasList, setTransportistasList] = useState<
    TransportistaGuiaInterface[]
  >([]);

  const { fetchTransportistaByIdentification } = useTransporteAsync();

  const [serchTearm, setSerchTearm] = useState('');

  const [isNew, setIsNew] = useState(false);

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
    if (!formState.transport) {
      return {
        contactId: '',
        contactName: '',
        licensePlate: '',
        transportId: null,
      };
    } else {
      return formState.transport;
    }
  }, [formState.transport]);

  useEffect(() => {
    if (isNew) {
      setTransportistasList([]);
      setFormState((prevState) => ({
        ...prevState,
        transport: undefined,
      }));
    }
  }, [isNew]);

  const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      transport: {
        ...prevState.transport,
        [name]: value,
      },
    }));
  };

  return (
    <Grid item xs={6}>
      <Box
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          mt: 2,
          borderRadius: 1,
        }}
      >
        <CardLayout title={'Información De Transportista'}>
          <Grid container spacing={2} alignItems="center">
            {(createMode || editMode) && (
              <>
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
                        onAutocompleteChange(event, 'transport', value);
                      }}
                      onInputChange={(event, newInputValue) =>
                        handleAutocomplete(event, newInputValue)
                      }
                      value={formState.transport}
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
              </>
            )}
            <Grid item xs={12}>
              <TextField
                name="contactName"
                label="Nombre"
                value={transportistaSelected.contactName}
                onChange={onChangeInput}
                InputProps={{
                  readOnly: !(createMode || editMode) || !isNew,
                }}
                InputLabelProps={{
                  shrink: transportistaSelected.contactName !== '',
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
                  readOnly: !(createMode || editMode) || !isNew,
                }}
                InputLabelProps={{
                  shrink: transportistaSelected.contactId !== '' ? true : false,
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
                  readOnly: !(createMode || editMode) || !isNew,
                }}
                InputLabelProps={{
                  shrink:
                    transportistaSelected.licensePlate !== '' ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Dirección Llegada"
                value={formState.address}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: formState.address !== '' ? true : false,
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
                  typeof formState.endDate === 'string'
                    ? parseISO(formState.endDate)
                    : formState.endDate
                }
                onChange={(value) =>
                  onGenericChange((value as Date).toISOString(), 'endDate')
                }
                readOnly={!createMode && !editMode}
                disableOpenPicker={!createMode && !editMode}
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
      </Box>
    </Grid>
  );
};
