'use client';
import { FormState, StyledDatePicker, useStyles, } from '@/hooks';
import React, { ChangeEvent, useEffect } from 'react';
import { FormControlLabel, Grid, Switch, TextField, } from '@mui/material';
import { TabPanel } from '@/functions';
import { parseISO } from 'date-fns';

type CreditoTabProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  tabIndex: number;
  onInputChange: (event: ChangeEvent<HTMLInputElement>, listName?: string, index?: number) => void;
  onDateChange: (value: Date, name: string) => void;
  onBooleanChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string,
    index?: number,
    listName?: string
  ) => void;
  onInputChangeTwoDecimal: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const CreditoTab: React.FC<CreditoTabProps> = ({
  formState,
  createMode,
  setFormState,
  editMode,
  tabIndex,
  onInputChange,
  onDateChange,
  onBooleanChange,
  onInputChangeTwoDecimal
}) => {
  const styles = useStyles();

  const onInputChangeNumber = (event: any) => {
    const { name, value } = event.target;
    if (/^\d*$/.test(value)) { // Solo permite números enteros
      setFormState({
        ...formState,
        [name]: value
      });
    } else {
      setFormState({
        ...formState
      });
    }
  };

  useEffect(() => {
    if (formState.creditDays === null) {
      setFormState({
        ...formState,
        creditDays: 0
      });
      return;
    }
    const creditDaysString = formState.creditDays.toString(); // Asegúrate de que es una cadena
    const sanitizedValue = creditDaysString.replace(/[.,]/g, ''); // Elimina comas y puntos

    if (/^\d*$/.test(sanitizedValue)) { // Solo permite números enteros
      setFormState({
        ...formState,
        creditDays: sanitizedValue
      });
    }

    if (formState.creditDays.length > 1) {
      setFormState({
        ...formState,
        creditDays: formState.creditDays.replace(/^0+/, '')
      });
    }

    if (formState.creditDays === '' || formState.creditDays === null) {
      setFormState({
        ...formState,
        creditDays: 0
      });
    }
  }, [formState.creditDays]);

  return (
    <>
      <TabPanel value={tabIndex} index={1}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <TextField
              name="authorizedCreditLimit"
              label="Cupo Autorizado"
              type="number"
              value={formState.authorizedCreditLimit}
              onChange={onInputChangeTwoDecimal}
              InputProps={{
                readOnly: !createMode && !editMode,
                startAdornment: '$',
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.authorizedCreditLimit !== undefined ||
                    formState.authorizedCreditLimit != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="creditDays"
              label="Días de crédito"
              type="number"
              value={formState?.creditDays || 0}
              onChange={onInputChangeNumber}
              InputProps={{
                readOnly: !createMode && !editMode,
              }}
              inputProps={{
                style: { textTransform: 'uppercase' },
                step: 1,
                pattern: "\\d*"
              }}
              InputLabelProps={{
                shrink:
                  formState?.creditDays !== undefined || formState.creditDays != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="usedCreditLimit"
              label="Cupo Utilizado"
              type="number"
              value={formState.usedCreditLimit}
              onChange={onInputChangeTwoDecimal}
              InputProps={{
                readOnly: !createMode && !editMode,
                startAdornment: '$',
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.usedCreditLimit !== undefined ||
                    formState.usedCreditLimit != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="availableCreditLimit"
              label="Cupo Disponible"
              type="number"
              value={formState.availableCreditLimit}
              onChange={onInputChangeTwoDecimal}
              InputProps={{
                readOnly: !createMode && !editMode,
                startAdornment: '$',
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.availableCreditLimit !== undefined ||
                    formState.availableCreditLimit != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="overlimit"
              label="Sobre cupo"
              type="number"
              value={formState?.overlimit}
              onChange={onInputChangeTwoDecimal}
              InputProps={{
                readOnly: !createMode && !editMode,
                startAdornment: '$',
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.overlimit !== undefined ||
                    formState.overlimit != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <StyledDatePicker
              label="Fecha Vencimiento Sobre cupo"
              minDate={new Date()}
              views={['year', 'month', 'day']}
              maxDate={new Date(new Date().getFullYear() + 5, new Date().getMonth(), new Date().getDate())}
              format="dd/MM/yyyy"
              value={
                typeof formState.overlimitExpirationDate === 'string'
                  ? parseISO(formState.overlimitExpirationDate)
                  : formState.overlimitExpirationDate
              }
              onChange={(value) => {

                onDateChange(value as Date, 'overlimitExpirationDate');
              }}
              readOnly={!createMode && !editMode}
              slotProps={{
                textField: {
                  className: styles.genericFieldStyle,
                  sx: { minWidth: '100%', },
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
          <Grid item xs={6}>
            <TextField
              name="guaranteeAmount"
              label="Monto de Garantía"
              type="number"
              value={formState.guaranteeAmount}
              onChange={onInputChangeTwoDecimal}
              InputProps={{
                readOnly: !createMode && !editMode,
                startAdornment: '$',
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.guaranteeAmount !== undefined ||
                    formState.guaranteeAmount != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <StyledDatePicker
              label="Fecha Vencimiento Garantía"
              minDate={new Date()}
              views={['year', 'month', 'day']}
              maxDate={new Date(new Date().getFullYear() + 5, new Date().getMonth(), new Date().getDate())}
              format="dd/MM/yyyy"
              value={
                typeof formState.guaranteeDate === 'string'
                  ? parseISO(formState.guaranteeDate)
                  : formState.guaranteeDate
              }
              onChange={(value) => {
                onDateChange(value as Date, 'guaranteeDate');
              }}
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
                    shrink: true,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="creditObservation"
              label="Notas"
              value={formState.creditObservation}
              onChange={onInputChange}
              InputProps={{
                readOnly: !createMode && !editMode,
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.creditObservation !== '' &&
                    formState.creditObservation != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  disabled={!createMode && !editMode}
                  checked={formState.clientCashInvoice}
                  onChange={(event) => {
                    onBooleanChange(event, 'clientCashInvoice');
                  }}
                />
              }
              label={formState.clientCashInvoice ? 'Factura de contado: SI' : 'Factura de contado: NO'}
            />
          </Grid>
        </Grid>
      </TabPanel>
    </>
  );
};
