import { TipoBodegaEnum } from '@/enums';
import {
  FormState,
  StyledDatePicker,
  useAllowAdquisicion,
  useBodegaAsync,
  useStyles,
} from '@/hooks';
import { BodegaGetInterface } from '@/types';
import { Autocomplete, Box, Grid, TextField } from '@mui/material';
import { ChangeEvent, useEffect } from 'react';

export type TransferenciaFormProps = {
  formState: FormState;
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
  wareHouseList: BodegaGetInterface[];
  setWareHouseList: React.Dispatch<React.SetStateAction<BodegaGetInterface[]>>;
  wareHouseDestiny: BodegaGetInterface[];
  setWareHouseDestiny: React.Dispatch<
    React.SetStateAction<BodegaGetInterface[]>
  >;
  isRecepted: boolean;
  isApprovable: boolean;
  isForeign: boolean;
};

export const TransferenciaForm = (props: TransferenciaFormProps) => {
  const {
    formState,
    createMode,
    editMode,
    onDateChange,
    onAutocompleteChange,
    onInputChange,
    wareHouseList,
    setWareHouseList,
    wareHouseDestiny,
    setWareHouseDestiny,
    isRecepted,
    isApprovable,
    isForeign,
  } = props;

  const styles = useStyles();
  const { adquisicionPeriodo } = useAllowAdquisicion();

  const { fetchBySucursal, fetchAll } = useBodegaAsync();

  useEffect(() => {
    if (formState.branch !== null) {
      const getWarehouses = async () => {
        fetchBySucursal(formState.branch.branchId).then((response) => {
          if (response) {
            const filteredWarehouses = isForeign
              ? response.filter(
                  (warehouse) =>
                    warehouse.warehouseTypeId === TipoBodegaEnum.IMPORTACION
                )
              : response;
            setWareHouseList(filteredWarehouses);
          }
        });
      };
      getWarehouses();
    } else {
      setWareHouseList([]);
    }
  }, [formState.branch]);

  useEffect(() => {
    if (formState.branch !== null) {
      const getWarehouses = async () => {
        fetchAll().then((response) => {
          if (response) {
            setWareHouseDestiny(response);
          }
        });
      };
      getWarehouses();
    } else {
      setWareHouseDestiny([]);
    }
  }, []);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Autocomplete
              className={styles.genericFieldStyle}
              options={wareHouseList}
              readOnly={!createMode && !editMode}
              getOptionLabel={(option) => option.warehouseName}
              style={{ width: '100%' }}
              onChange={(event, value) => {
                onAutocompleteChange(
                  event,
                  'departureWarehouse',
                  value?.warehouseId
                );
              }}
              value={
                (formState.departureWarehouse !== null
                  ? wareHouseList.find(
                      (warehouse) =>
                        warehouse.warehouseId === formState.departureWarehouse
                    )
                  : null) || null
              }
              isOptionEqualToValue={(
                option: BodegaGetInterface,
                value: BodegaGetInterface
              ) => (option && value ? option === value : false)}
              noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Bodega Salida"
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
            <StyledDatePicker
              label="Fecha Registro"
              views={['year', 'month', 'day']}
              readOnly
              format="dd/MM/yyyy"
              value={
                formState.registerDate !== null ? formState.registerDate : ''
              }
              onChange={(value) => onDateChange(value as Date, 'registerDate')}
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
                    shrink: formState.registerDate ? true : false,
                  },
                },
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Autocomplete
              className={styles.genericFieldStyle}
              options={wareHouseDestiny}
              readOnly={!createMode && !editMode}
              getOptionLabel={(option) => option.warehouseName}
              style={{ width: '100%' }}
              onChange={(event, value) => {
                onAutocompleteChange(
                  event,
                  'destinationWarehouse',
                  value?.warehouseId
                );
              }}
              value={
                (formState.destinationWarehouse !== null
                  ? wareHouseDestiny.find(
                      (warehouse) =>
                        warehouse.warehouseId === formState.destinationWarehouse
                    )
                  : null) || null
              }
              isOptionEqualToValue={(
                option: BodegaGetInterface,
                value: BodegaGetInterface
              ) => (option && value ? option === value : false)}
              noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Bodega Destino"
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
            {(isApprovable || isRecepted) && (
              <StyledDatePicker
                label="Fecha Recepción"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                readOnly={isRecepted}
                minDate={adquisicionPeriodo?.closingPeriodDate}
                maxDate={isApprovable ? formState.registerDate : undefined}
                value={
                  formState.receptionDate !== null
                    ? formState.receptionDate
                    : ''
                }
                onChange={(value) =>
                  onDateChange(value as Date, 'receptionDate')
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
                      shrink: formState.receptionDate ? true : false,
                    },
                  },
                }}
              />
            )}
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Grid item xs={12}>
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
                  formState.observation !== '' && formState.observation != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
