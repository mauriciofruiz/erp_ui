import { FormState, StyledDatePicker } from '@/hooks';
import { LabeledInputNumber } from '@/modules/layout';
import { SucursalType, UserLoginType } from '@/types';
import { Grid, TextField } from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import { parseISO } from 'date-fns';

export type CierreCajaFormProps = {
  formState: FormState;
  styles: ClassNameMap;
  user: UserLoginType | undefined;
  sucursal: SucursalType | undefined;
  createMode: boolean;
  onGenericChange: (value: any, field: string) => void;
};
export const CierreCajaForm: React.FC<CierreCajaFormProps> = ({
  formState,
  styles,
  user,
  sucursal,
  createMode,
  onGenericChange,
}) => {
  return (
    <>
      <Grid item xs={4}>
        <TextField
          label="Usuario"
          value={user?.userName}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: user?.userName !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <StyledDatePicker
          label="Fecha Inicio"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          value={
            typeof formState.openingDate === 'string'
              ? parseISO(formState.openingDate)
              : formState.openingDate
          }
          readOnly
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
          label="Fecha Cierre"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          value={
            typeof formState.closingDate === 'string'
              ? parseISO(formState.closingDate)
              : formState.closingDate
          }
          readOnly
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
        <TextField
          label="Sucursal"
          value={sucursal?.name}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{
            style: { textTransform: 'uppercase' },
          }}
          InputLabelProps={{
            shrink: sucursal?.name !== '' ? true : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <LabeledInputNumber
          label="Saldo Inicial"
          inputNumberProps={{
            onChange: (value) =>
              onGenericChange(value as number, 'initialAmount'),
            value: formState.initialAmount,
            min: 0.01,
            defaultValue: 0,
            controls: false,
            precision: 2,
            prefix: '$',
            readOnly: !createMode,
            onFocus: (e: any) => e.target.select(),
            style: { paddingRight: '10px', paddingLeft: '10px' },
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <LabeledInputNumber
          label="Transacciones"
          inputNumberProps={{
            value: formState.transactionsValue,
            min: 0,
            defaultValue: 0,
            controls: false,
            precision: 2,
            prefix: '$',
            readOnly: true,
            style: { paddingRight: '10px', paddingLeft: '10px' },
          }}
        />
      </Grid>
    </>
  );
};
