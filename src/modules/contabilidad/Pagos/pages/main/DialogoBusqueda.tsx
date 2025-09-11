import { useLoadingOverlayContext } from '@/context';
import { EstadoPagoEnum, FormaPagoCobroEnum } from '@/enums';
import { getStartDateSystem, handleApiError } from '@/functions';
import {
  FormState,
  StyledDatePicker,
  useBankAsync,
  usePaymentAsync,
  useStyles,
} from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { BancoType, PaginatedResponseType } from '@/types';
import { CleaningServices, Search } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { formatISO } from 'date-fns';
import { useEffect, useState } from 'react';

type DialogoBusquedaProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  formState: FormState;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    name: string,
    value: any
  ) => void;
  onDateChange: (value: Date, name: string) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onInputChangeTwoDecimal: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const DialogoBusqueda: React.FC<DialogoBusquedaProps> = ({
  open,
  setOpen,
  setPagination,
  formState,
  onInputChange,
  setFormState,
  onAutocompleteChange,
  onInputChangeTwoDecimal,
}) => {
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const styles = useStyles();
  const { fetchMainPagePayment } = usePaymentAsync();
  const { fetchBankList } = useBankAsync();
  const [bankList, setBankList] = useState<BancoType[]>([]);
  const [stateIdList, setStateIdList] = useState<
    { label: string; value: EstadoPagoEnum }[]
  >([]);
  const [paymentMethodIdList, setPaymentMethodIdList] = useState<
    { label: string; value: FormaPagoCobroEnum }[]
  >([]);

  useEffect(() => {
    if (!open) {
      setBankList([]);
      return;
    }

    const setData = async () => {
      try {
        const bankList = await fetchBankList();
        if (bankList) {
          setBankList(bankList as BancoType[]);
        }
      } catch (error) {
        handleApiError(error);
      }
    };
    setData();
  }, [open]);

  const handleBlurDecimal = (event: any) => {
    const { name, value } = event.target;
    // Si el valor termina en una coma o un punto, agregar "00"
    if (value.endsWith(',') || value.endsWith('.')) {
      const updatedValue = value.replace(/[.,]$/, ',00');
      setFormState({
        ...formState,
        [name]: updatedValue,
      });
    }
  };

  const paymentMethods = () => {
    return Object.keys(FormaPagoCobroEnum)
      .filter((key): key is keyof typeof FormaPagoCobroEnum =>
        isNaN(Number(key))
      )
      .map((key) => {
        const label = key.replace(/_/g, ' ');
        return { label: label, value: FormaPagoCobroEnum[key] };
      });
  };

  const paymentStates = () => {
    return Object.keys(EstadoPagoEnum)
      .filter((key): key is keyof typeof EstadoPagoEnum => isNaN(Number(key)))
      .map((key) => {
        const label = key.replace(/_/g, ' ');
        return { label: label, value: EstadoPagoEnum[key] };
      });
  };

  const handleChangePaymentState = (
    event: React.SyntheticEvent<Element, Event>,
    paymentMethodIdList: { label: string; value: FormaPagoCobroEnum }[] | null
  ) => {
    event.stopPropagation();
    if (!paymentMethodIdList) return;
    setPaymentMethodIdList(paymentMethodIdList);
    const stateIdMapped = paymentMethodIdList.map((state) => state.value);
    const stateIdString = stateIdMapped.join(',');
    setFormState({ ...formState, paymentMethodIds: stateIdString });
  };

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    stateList: { label: string; value: EstadoPagoEnum }[] | null
  ) => {
    event.stopPropagation();
    if (!stateList) return;
    setStateIdList(stateList);
    const stateIdMapped = stateList.map((state) => state.value);
    const stateIdString = stateIdMapped.join(',');
    setFormState({ ...formState, stateIds: stateIdString });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    showLoading();

    event.preventDefault();

    setFormState({
      ...formState,
      byCurrentMonth: false,
    });

    const getResult = async () => {
      try {
        const paginacion = await fetchMainPagePayment(
          formState.bankId,
          formState.documentNumber,
          formState.beneficiaryName,
          formState.paymentAmount,
          formState.stateIds,
          formState.paymentMethodIds,
          formState.documentDateStart !== null ||
            formState.documentDateStart === ''
            ? formatISO(formState.documentDateStart)
            : formState.documentDateStart,
          formState.documentDateEnd !== null || formState.documentDateEnd === ''
            ? formatISO(formState.documentDateEnd)
            : formState.documentDateEnd,
          formState.startDate !== null || formState.startDate === ''
            ? formatISO(formState.startDate)
            : formState.startDate,
          formState.endDate !== null || formState.endDate === ''
            ? formatISO(formState.endDate)
            : formState.endDate,
          false,
          formState.page,
          formState.pageSize,
          formState.sortDirection,
          formState.sortColumn
        );
        setPagination(paginacion as PaginatedResponseType);

        hideLoading();
      } catch (error) {
        const paginacion = await fetchMainPagePayment(
          formState.bankId,
          formState.documentNumber,
          formState.beneficiaryName,
          formState.paymentAmount,
          formState.stateIds,
          formState.paymentMethodIds,
          null,
          null,
          null,
          null,
          false,
          formState.page,
          formState.pageSize,
          formState.sortDirection,
          formState.sortColumn
        );
        setPagination(paginacion as PaginatedResponseType);

        hideLoading();
      }
    };
    getResult();
    setOpen(false);
  };

  const handleDateChange = (value: Date, name: string) => {
    setFormState((prevState: FormState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleClick = () => {
    setPaymentMethodIdList([]);
    setStateIdList([]);
    setFormState({
      ...formState,
      bankId: '',
      documentNumber: '',
      beneficiaryName: '',
      paymentAmount: '',
      stateIds: null,
      paymentMethodIds: null,
      documentDateStart: null,
      documentDateEnd: null,
      startDate: null,
      endDate: null,
      byCurrentMonth: true,
      page: 0,
      pageSize: 10,
      sortDirection: null,
      sortColumn: null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: 0,
        },
      }}
    >
      <DialogTitle
        style={{
          cursor: 'move',
          textAlign: 'center',
        }}
        id="draggable-dialog-title"
        sx={{ mt: 2 }}
      >
        {'Búsqueda Avanzada Pagos'}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Emisión Inicio"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                minDate={getStartDateSystem()}
                maxDate={new Date()}
                value={formState.documentDateStart}
                onChange={(value) =>
                  handleDateChange(value as Date, 'documentDateStart')
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
                      shrink: formState.documentDateStart ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Emisión Fin"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                minDate={formState.documentDateStart}
                maxDate={new Date()}
                value={formState.documentDateEnd}
                onChange={(value) =>
                  handleDateChange(value as Date, 'documentDateEnd')
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
                      shrink: formState.documentDateEnd ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Registro Inicio"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                minDate={getStartDateSystem()}
                maxDate={new Date()}
                value={formState.startDate}
                onChange={(value) =>
                  handleDateChange(value as Date, 'startDate')
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
                      shrink: formState.startDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Registro Fin"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                minDate={formState.startDate}
                maxDate={new Date()}
                value={formState.endDate}
                onChange={(value) => handleDateChange(value as Date, 'endDate')}
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
                      shrink: formState.endDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="documentNumber"
                label="Número de Documento"
                value={formState.documentNumber}
                onChange={onInputChange}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.documentNumber !== '' &&
                    formState.documentNumber != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="beneficiaryName"
                label="Nombre Beneficiario"
                value={formState.beneficiaryName}
                onChange={onInputChange}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.beneficiaryName !== '' &&
                    formState.beneficiaryName != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="paymentAmount"
                label="Monto Pago"
                type="number"
                value={formState.paymentAmount}
                onChange={onInputChangeTwoDecimal}
                onBlur={handleBlurDecimal}
                inputProps={{
                  style: { textTransform: 'uppercase' },
                }}
                InputLabelProps={{
                  shrink:
                    formState.paymentAmount !== '' &&
                    formState.paymentAmount != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={paymentStates()}
                getOptionLabel={(option) => option.label}
                style={{ width: '100%' }}
                multiple
                onChange={handleChange}
                value={stateIdList}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                filterSelectedOptions
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Estado"
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
              <Autocomplete
                className={styles.genericFieldStyle}
                options={bankList}
                getOptionLabel={(option) => option.bankName}
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  onAutocompleteChange(event, 'bankId', value?.bankId);
                }}
                value={
                  formState.bankId !== null
                    ? bankList.find((bank) => bank.bankId === formState.bankId)
                    : null
                }
                isOptionEqualToValue={(option: BancoType, value: BancoType) =>
                  option && value ? option === value : false
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
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={paymentMethods()}
                getOptionLabel={(option) => option.label}
                style={{ width: '100%' }}
                multiple
                onChange={handleChangePaymentState}
                value={paymentMethodIdList}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                filterSelectedOptions
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Método de pago"
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

          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid
              item
              xs={6}
              container
              direction="row"
              justifyContent="right"
              alignItems="right"
              sx={{ mt: 2 }}
            >
              <Button
                startIcon={<Search />}
                sx={{ margin: 2, width: 150 }}
                type="submit"
              >
                {'Buscar'}
              </Button>
            </Grid>
            <Grid
              item
              xs={6}
              container
              direction="row"
              justifyContent="left"
              alignItems="left"
              sx={{ mt: 2 }}
            >
              <Button
                startIcon={<CleaningServices />}
                sx={{ margin: 2, width: 150 }}
                type="button"
                onClick={handleClick}
              >
                {'Limpiar Filtros'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};
