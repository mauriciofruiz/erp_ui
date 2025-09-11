import {
  FormState,
  StyledDatePicker,
  useRetencionClienteAsync,
  useStyles,
} from '@/hooks';
import { Grid, TextField } from '@mui/material';
import { parseISO } from 'date-fns';
import React, { useEffect } from 'react';

export type RetencionFormInfoProps = {
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  onGenericChange: (value: any, field: string) => void;
  minDate: string;
  maxDate: string;
};

export const RetencionFormInfo: React.FC<RetencionFormInfoProps> = ({
  formState,
  createMode,
  editMode,
  onGenericChange,
  minDate,
  maxDate,
}) => {
  const styles = useStyles();

  const { fetchIsDocumentNumberAvailable } = useRetencionClienteAsync();

  useEffect(() => {
    if (!createMode) {
      onGenericChange(true, 'isValidNumber');
      return;
    }
    if (formState.clientId === null || formState.retentionNumber === null)
      return;
    if (
      formState.retentionNumber.length < 15 ||
      formState.retentionNumber.length > 15
    ) {
      onGenericChange(false, 'isValidNumber');
      return;
    }
    fetchIsDocumentNumberAvailable(
      formState.clientId,
      formState.retentionNumber
    ).then((res) => {
      onGenericChange(res, 'isValidNumber');
    });
  }, [formState.clientId, formState.retentionNumber, createMode]);

  return (
    <>
      <Grid item xs={4}>
        <TextField
          name="retentionNumber"
          label="Nro. Retención"
          value={formState.retentionNumber}
          InputProps={{
            readOnly: !createMode && !editMode,
          }}
          onChange={(e: any) => {
            const re = /^[0-9\b]+$/;
            if (e.target.value === '' || re.test(e.target.value)) {
              onGenericChange(e.target.value, 'retentionNumber');
            }
          }}
          InputLabelProps={{
            shrink:
              formState.retentionNumber !== '' &&
              formState.retentionNumber != null
                ? true
                : false,
          }}
          fullWidth
          error={
            formState.retentionNumber !== '' &&
            formState.retentionNumber.length !== 15
          }
          helperText={
            formState.retentionNumber !== '' &&
            formState.retentionNumber.length !== 15
              ? 'La longitud debe ser de 15 dígitos'
              : ''
          }
          inputProps={{
            maxLength: 15,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          name="autorizationNumber"
          label="Nro. Autorización"
          value={formState.autorizationNumber}
          InputProps={{
            readOnly: !createMode && !editMode,
          }}
          onChange={(e: any) => {
            const re = /^[0-9\b]+$/;
            if (e.target.value === '' || re.test(e.target.value)) {
              onGenericChange(e.target.value, 'autorizationNumber');
            }
          }}
          InputLabelProps={{
            shrink:
              formState.autorizationNumber !== '' &&
              formState.autorizationNumber != null
                ? true
                : false,
          }}
          fullWidth
          error={
            formState.autorizationNumber !== '' &&
            formState.autorizationNumber.length !== 47 &&
            formState.autorizationNumber.length !== 49
          }
          helperText={
            formState.autorizationNumber !== '' &&
            formState.autorizationNumber.length !== 47 &&
            formState.autorizationNumber.length !== 49
              ? 'La longitud debe ser de 47 o 49 dígitos'
              : ''
          }
          inputProps={{
            maxLength: 49,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <StyledDatePicker
          label="Fecha Emisión"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          minDate={createMode || editMode ? new Date(minDate) : undefined}
          maxDate={createMode || editMode ? new Date(maxDate) : undefined}
          readOnly={!(createMode || editMode)}
          value={
            typeof formState.retentionDate === 'string'
              ? parseISO(formState.retentionDate)
              : formState.retentionDate
          }
          onChange={(date) =>
            onGenericChange((date as Date).toISOString(), 'retentionDate')
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
    </>
  );
};
