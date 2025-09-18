import React from 'react';
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import { History } from '@mui/icons-material';
import { FormState, StyledDatePicker } from '@/hooks';
import { useStyles } from '@/hooks';
import { SucursalType, RazonSolicitudCompraType, TipoAdquisicionType } from '@/types';
import dayjs from 'dayjs';

interface SolicitudCompraFormProps {
  formState: FormState;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (value: Date, field: string) => void;
  OnSelectChange: (event: any) => void;
  onAutocompleteChange: (event: any, field: string, value: any) => void;
  sucursales: SucursalType[];
  tipoAdquisicionList: TipoAdquisicionType[];
  razonesSolicitudList: RazonSolicitudCompraType[];
  createMode: boolean;
  editMode: boolean;
  enabledBranchs: () => boolean;
  requestPurchaseSelected?: any;
  onOpenHistory: () => void;
}

export const SolicitudCompraForm: React.FC<SolicitudCompraFormProps> = ({
  formState,
  onInputChange,
  onDateChange,
  OnSelectChange,
  onAutocompleteChange,
  sucursales,
  tipoAdquisicionList,
  razonesSolicitudList,
  createMode,
  editMode,
  enabledBranchs,
  requestPurchaseSelected,
  onOpenHistory,
}) => {
  const styles = useStyles();

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
      <Grid item xs={4}>
        <TextField
          name="usuario"
          label="Usuario"
          value={formState.usuario.userNick}
          InputProps={{
            readOnly: true,
          }}
          InputLabelProps={{
            shrink: true,
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
        <Autocomplete
          className={styles.genericFieldStyle}
          options={sucursales}
          getOptionLabel={(option) => option.name}
          style={{ width: '100%' }}
          onChange={(event, value) =>
            onAutocompleteChange(event, 'branchId', value?.branchId)
          }
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.name.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
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
          readOnly={!(createMode || editMode) || !enabledBranchs()}
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
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="abastecimiento-label">
            Lugar Abastecimiento
          </InputLabel>
          <Select
            name="tipoAbastecimiento"
            labelId="abastecimiento-label"
            id="abastecimiento-select"
            label="Lugar Abastecimiento"
            value={formState.tipoAbastecimiento}
            onChange={OnSelectChange}
            fullWidth
            readOnly={!createMode && !editMode}
          >
            <MenuItem value="">Seleccione Un Estado</MenuItem>
            {tipoAdquisicionList.map((component) => (
              <MenuItem
                key={component.requestTypeId}
                value={parseInt(
                  component.requestTypeId?.toString() || ''
                )}
              >
                {component.requestTypeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <StyledDatePicker
          label="Fecha Requerida"
          views={['year', 'month', 'day']}
          minDate={formState.fechaSolicitud}
          maxDate={dayjs(new Date()).add(1, 'month').toDate()}
          format="dd/MM/yyyy"
          value={formState.fechaRequerida}
          onChange={(value) =>
            onDateChange(value as Date, 'fechaRequerida')
          }
          readOnly={!createMode && !editMode}
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
                shrink: formState.fechaRequerida ? true : false,
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={4}>
        {!createMode ? (
          <TextField
            name="stateName"
            label="Estado"
            value={requestPurchaseSelected?.stateRequestPurchaseName}
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        ) : null}
      </Grid>
      <Grid item xs={12}>
        <TextField
          name="observacion"
          label="Observación"
          value={formState.observacion.toUpperCase()}
          onChange={onInputChange}
          InputProps={{
            readOnly: !createMode && !editMode,
          }}
          InputLabelProps={{
            shrink: formState.observacion !== null ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid
        container
        direction="row"
        alignItems="center"
        marginLeft={2.5}
        marginTop={2}
      >
        <Grid item marginRight={2}>
          <FormControl>
            <FormLabel>Razón Solicitud: </FormLabel>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="razonSolicitud"
              value={formState.razonSolicitud}
              onChange={onInputChange}
              row
            >
              {razonesSolicitudList.map((razon) => (
                <FormControlLabel
                  key={razon.idRazonSolicitud}
                  value={razon.idRazonSolicitud}
                  control={<Radio />}
                  label={razon.nombreRazonSolicitud}
                  disabled={!createMode && !editMode}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <Tooltip title="Historial De Cambios">
            <IconButton onClick={onOpenHistory}>
              <History />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  );
};
