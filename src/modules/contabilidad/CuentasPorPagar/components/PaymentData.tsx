import {
  FormState,
  StyledDatePicker,
  useAllowContabilidad,
  useBankAsync,
  usePaymentAsync,
  useStyles,
} from '@/hooks';
import { BancoType } from '@/types';
import { ToggleOn, ToggleOff } from '@mui/icons-material';
import {
  Box,
  Autocomplete,
  TextField,
  Grid,
  Tooltip,
  Button,
} from '@mui/material';
import { parseISO } from 'date-fns';
import { ChangeEvent, useState, useEffect } from 'react';

type PaymentDataProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onGenericChange: (value: any, name: string) => void;
  onBooleanChangeClick: (name: string, value: boolean) => void;
};

export const PaymentData: React.FC<PaymentDataProps> = ({
  formState,
  setFormState,
  onAutocompleteChange,
  onInputChange,
  onGenericChange,
  onBooleanChangeClick,
}) => {
  const styles = useStyles();

  const { contabilidadPeriodo } = useAllowContabilidad();

  const { fetchIsPaymentDocumentNumberAvailable } = usePaymentAsync();

  const { fetchBankListIsBank, fetchLastNumberCheckByBankId } = useBankAsync();
  const [bankList, setBankList] = useState<BancoType[]>([]);

  useEffect(() => {
    const setData = async () => {
      const numberCheck = await fetchLastNumberCheckByBankId(formState.bankId);
      if (numberCheck !== undefined) {
        const lastNumber = numberCheck + 1;
        setFormState((prevState: any) => ({
          ...prevState,
          bankId: formState.bankId,
          bankName: formState.bankName,
          paymentDocumentNumber: lastNumber,
        }));
      }
    };

    if (formState.isChequePayment && formState.bankId !== null) {
      setData();
    }
  }, [formState.isChequePayment, formState.bankId]);

  useEffect(() => {
    const setData = async () => {
      const bankList = await fetchBankListIsBank();
      if (bankList) {
        setBankList(bankList as BancoType[]);
      }
    };
    setData();
  }, []);

  useEffect(() => {
    const validatePaymentDocumentNumber = async () => {
      if (
        formState.bankId !== null &&
        formState.accountingDate !== null &&
        (formState.isChequePayment ||
          formState.paymentDocumentNumber.trim().length > 3)
      ) {
        const sanitizedValue = formState.paymentDocumentNumber
          .trim()
          .replace(/[.,]/g, '');
        const response = await fetchIsPaymentDocumentNumberAvailable(
          formState.bankId,
          sanitizedValue,
          formState.isChequePayment,
          formState.accountingDate
        );
        setFormState((prevState: FormState) => ({
          ...prevState,
          paymentDocumentNumber: sanitizedValue,
          isValidDocument: response,
        }));
      }
    };

    validatePaymentDocumentNumber();
  }, [
    formState.paymentDocumentNumber,
    formState.bankId,
    formState.isChequePayment,
    formState.accountingDate,
  ]);

  return (
    <>
      <Box
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          mt: 2,
          borderRadius: 1,
        }}
      >
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" marginBottom={2}>
            <Grid item xs={6}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={bankList}
                    getOptionLabel={(option) => option.bankName}
                    style={{ width: '100%' }}
                    onChange={(event, value) => {
                      if (value !== null)
                        onAutocompleteChange(event, 'bankId', value?.bankId);
                    }}
                    value={
                      bankList.find(
                        (bank) => bank.bankId === formState.bankId
                      ) || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option?.bankId === value.bankId
                    }
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Banco"
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
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={4}>
                  <Tooltip title="Tipo Pago">
                    <span>
                      <Button
                        disabled={formState.isIndividual}
                        startIcon={
                          formState.isChequePayment ? (
                            <ToggleOn />
                          ) : (
                            <ToggleOff />
                          )
                        }
                        onClick={() =>
                          onBooleanChangeClick(
                            'isChequePayment',
                            !formState.isChequePayment
                          )
                        }
                        style={{ width: '100%', height: 35 }}
                      >
                        {formState.isChequePayment ? 'Cheque' : 'Transferencia'}
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    disabled={formState.isIndividual}
                    name="paymentDocumentNumber"
                    type="number"
                    label={
                      formState.isChequePayment
                        ? 'No. Cheque'
                        : 'No. Transferencia'
                    }
                    value={formState.paymentDocumentNumber}
                    onChange={onInputChange}
                    inputProps={{
                      style: { textTransform: 'uppercase' },
                      step: 1,
                      pattern: '\\d*',
                    }}
                    InputLabelProps={{
                      shrink:
                        formState.paymentDocumentNumber !== '' ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12}>
                  <StyledDatePicker
                    disabled={formState.isIndividual}
                    label="Fecha Contable"
                    views={['year', 'month', 'day']}
                    format="dd/MM/yyyy"
                    minDate={contabilidadPeriodo?.closingPeriodDate}
                    maxDate={new Date()}
                    defaultValue={new Date()}
                    value={
                      typeof formState.accountingDate === 'string'
                        ? parseISO(formState.accountingDate)
                        : formState.accountingDate
                    }
                    onChange={(value) =>
                      onGenericChange(
                        (value as Date).toISOString(),
                        'accountingDate'
                      )
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
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};
