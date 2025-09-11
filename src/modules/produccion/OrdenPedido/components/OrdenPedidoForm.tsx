import {
  getSucursalById,
  getSucursalProduction,
} from '@/backend/tba/sucursaleServices';
import { FormState, StyledDatePicker, useStyles } from '@/hooks';
import { SucursalType } from '@/types';
import { Autocomplete, Box, Divider, Grid, TextField } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect } from 'react';
import { OrdenPedidoDetalle } from './OrdenPedidoDetalle';
import { ServerResponseType } from '@/store';

export type OrdenPedidoFormProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
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
  sucursal: SucursalType[];
  setSucursal: React.Dispatch<React.SetStateAction<SucursalType[]>>;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  isApprovable: boolean;
};

export const OrdenPedidoForm = (props: OrdenPedidoFormProps) => {
  const {
    formState,
    createMode,
    editMode,
    onInputChange,
    onAutocompleteChange,
    onDateChange,
    sucursal,
    setSucursal,
    rows,
    setRows,
    isApprovable,
  } = props;

  const styles = useStyles();

  useEffect(() => {
    const fetchSucursalData = async () => {
      try {
        const response: SucursalType | ServerResponseType =
          await getSucursalById(formState.branchProduceId);
        if (response) {
          if (response) {
            const sucursal: SucursalType[] = [response as SucursalType];
            setSucursal(sucursal);
          }
        } else {
          setSucursal([]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setSucursal([]);
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
    if (formState.branchProduceId) {
      fetchSucursalData();
    }
  }, [formState.branchProduceId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: SucursalType[] | undefined =
          await getSucursalProduction();
        if (response) {
          setSucursal(response);
        } else {
          setSucursal([]);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setSucursal([]);
            enqueueSnackbar('No se ha encontrado la sucursal buscada', {
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
    fetchData();
  }, []);

  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField
                name="user"
                label="Usuario"
                value={formState.user !== null ? formState.user : ''}
                InputProps={{
                  readOnly: true,
                }}
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="branchRequest"
                label="Sucursal Solicita"
                value={
                  formState.branchRequest !== null
                    ? formState.branchRequest
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                onChange={onInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={sucursal}
                readOnly={!createMode && !editMode}
                getOptionLabel={(option) => option.name}
                style={{ width: '100%' }}
                onChange={(event, value) =>
                  onAutocompleteChange(event, 'branchProduce', value?.branchId)
                }
                value={
                  (formState.branchProduce !== null
                    ? sucursal.find(
                        (provider) =>
                          provider.branchId === formState.branchProduce
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
                    label="Sucursal Produce"
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
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Solictud"
                readOnly={!createMode && !editMode}
                views={['year', 'month', 'day']}
                minDate={new Date()}
                format="dd/MM/yyyy"
                value={
                  formState.requestDate !== null ? formState.requestDate : null
                }
                onChange={(value) => onDateChange(value as Date, 'requestDate')}
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
                      shrink: formState.requestDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Entrega"
                readOnly={!createMode && !editMode}
                minDate={new Date()}
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                value={
                  formState.deliverDate !== null ? formState.deliverDate : null
                }
                onChange={(value) => onDateChange(value as Date, 'deliverDate')}
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
                      shrink: formState.deliverDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="observation"
                label="Observación"
                value={formState.observation}
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.observation !== '' &&
                    formState.observation != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Divider sx={{ mt: 4, height: 4 }} />
      <OrdenPedidoDetalle
        createMode={createMode}
        editMode={editMode}
        rows={rows}
        setRows={setRows}
        isApprovable={isApprovable}
        formState={formState}
      />
    </>
  );
};
