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
import { ChangeEvent, useState, useEffect, useMemo } from 'react';

type PaymentDataProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
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
  onGenericChange: (value: any, field: string) => void;
  onBooleanChangeClick: (name: string, value: boolean) => void;
  setError: React.Dispatch<React.SetStateAction<any>>;
  error: any;
};

export const PaymentData: React.FC<PaymentDataProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  onAutocompleteChange,
  onInputChange,
  onGenericChange,
  onBooleanChangeClick,
  error,
  setError,
}) => {
  const styles = useStyles();
  const { contabilidadPeriodo } = useAllowContabilidad();
  const { fetchBankListByBranchId, fetchLastNumberCheckByBankId } =
    useBankAsync();
  const [bankList, setBankList] = useState<BancoType[]>([]);
  const { fetchIsPaymentDocumentNumberAvailable } = usePaymentAsync();

  const bankData = useMemo(() => {
    return bankList.find((bank) => bank.bankId === formState.bankId);
  }, [bankList, formState.bankId]);

  useEffect(() => {
    if (!formState.branchId || !createMode) return;
    const setData = async () => {
      const bankList = await fetchBankListByBranchId(formState.branchId);
      if (bankList) {
        const response = bankList as BancoType[];
        const hasElements = Array.isArray(response) && response.length > 0;
        setFormState((prevState: FormState) => ({
          ...prevState,
          bankId: hasElements ? response[0].bankId : null,
          bankName: hasElements ? response[0].bankName : '',
        }));
        setBankList(response);
      }
    };
    setData();
  }, [formState.branchId, createMode]);

  useEffect(() => {
    const setData = async () => {
      try {
        const numberCheck = await fetchLastNumberCheckByBankId(
          formState.bankId
        );
        if (numberCheck !== undefined) {
          const lastNumber = numberCheck + 1;
          setFormState((prevState: any) => ({
            ...prevState,
            bankId: formState.bankId,
            bankName: formState.bankName,
            documentNumber: lastNumber,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };
    const validatePaymentDocumentNumber = async () => {
      if (
        formState.bankId !== null &&
        formState.accountingDate !== null &&
        formState.documentNumber.trim().length > 3
      ) {
        const sanitizedValue = formState.documentNumber
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
          documentNumber: sanitizedValue,
          isValidDocument: response,
        }));
      }
    };

    if (
      (createMode || editMode) &&
      !formState.isChequePayment &&
      !bankData?.isPettyCash
    ) {
      validatePaymentDocumentNumber();
    } else if (
      formState.isChequePayment &&
      formState.bankId !== null &&
      !bankData?.isPettyCash &&
      createMode
    ) {
      setData();
    } else if (bankData?.isPettyCash) {
      setFormState((prevState: FormState) => ({
        ...prevState,
        isValidDocument: true,
      }));
    }
  }, [
    formState.documentNumber,
    formState.bankId,
    formState.isChequePayment,
    formState.accountingDate,
    createMode,
    editMode,
    bankData,
  ]);

  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" marginBottom={2}>
            <Grid item xs={6}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  {!createMode && !editMode ? (
                    <TextField
                      name="bankName"
                      label="Banco"
                      disabled={true}
                      value={formState.bankName}
                      onChange={onInputChange}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      InputLabelProps={{
                        shrink:
                          formState.bankName !== '' &&
                          formState.bankName != null
                            ? true
                            : false,
                      }}
                      fullWidth
                    />
                  ) : (
                    <Autocomplete
                      className={styles.genericFieldStyle}
                      options={bankList}
                      getOptionLabel={(option) => option.bankName}
                      style={{ width: '100%' }}
                      onChange={(event, value) => {
                        if (value !== null) {
                          setFormState((prevState: any) => ({
                            ...prevState,
                            bankId: value.bankId,
                            bankName: value.bankName,
                          }));
                          setError({
                            ...error,
                          });
                        }
                        onAutocompleteChange(event, 'bankId', value?.bankId);
                        onAutocompleteChange(
                          event,
                          'bankName',
                          value?.bankName
                        );
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
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={4}>
                  <Tooltip title="Tipo Pago">
                    <span>
                      <Button
                        disabled={
                          bankData?.isPettyCash || (!editMode && !createMode)
                        }
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
                    required={!bankData?.isPettyCash}
                    name="documentNumber"
                    type="number"
                    disabled={bankData?.isPettyCash}
                    label={
                      formState.isChequePayment
                        ? 'No. Cheque'
                        : 'No. Transferencia'
                    }
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    value={formState.documentNumber}
                    //   onBlur={validateDocumentNumber}
                    onChange={onInputChange}
                    inputProps={{
                      style: { textTransform: 'uppercase' },
                      step: 1,
                      pattern: '\\d*',
                    }}
                    InputLabelProps={{
                      shrink:
                        formState.documentNumber !== '' &&
                        formState.documentNumber != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                  {formState.documentNumber != null &&
                  error.documentNumber != ''
                    ? error && (
                        <p style={{ color: 'cornsilk' }}>
                          {error.documentNumber}
                        </p>
                      )
                    : null}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12}>
                  <StyledDatePicker
                    label="Fecha Contable"
                    views={['year', 'month', 'day']}
                    format="dd/MM/yyyy"
                    minDate={contabilidadPeriodo?.closingPeriodDate}
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
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};
