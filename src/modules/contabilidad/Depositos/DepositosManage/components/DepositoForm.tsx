import { FormaPagoEnum } from '@/enums';
import { TipoDepositoEnum } from '@/enums/TipoDepositoEnum';
import { getDepositTypeList, getPaymentMethodList } from '@/functions';
import {
  FormState,
  StyledDatePicker,
  useAllowContabilidad,
  useAllowGlobal,
  useBankAsync,
  useDepositosAsync,
  useStyles,
} from '@/hooks';
import { LabeledInputNumber } from '@/modules/layout';
import { RootState } from '@/store';
import { BancoType } from '@/types';
import { EventSeat, KeyboardArrowDown } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Grid,
  Menu,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import parseISO from 'date-fns/parseISO';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export type DepositoProps = {
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onGenericChange: (value: any, field: string) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
};

export const DepositoForm: React.FC<DepositoProps> = ({
  formState,
  createMode,
  editMode,
  onAutocompleteChange,
  onGenericChange,
  setFormState,
  onInputChange,
}) => {
  const styles = useStyles();

  const { allowCheckEntry } = useAllowGlobal();

  const { allowCreateDepositAdmin, contabilidadPeriodo } =
    useAllowContabilidad();

  const { sucursales } = useSelector((state: RootState) => state.common);

  const [bankList, setBankList] = useState<BancoType[]>([]);

  const { fetchBankListIsBank } = useBankAsync();

  const { fetchIsDepositDocumentNumberAvailable } = useDepositosAsync();

  const excludedPaymentMethods = [
    FormaPagoEnum.CREDITO,
    FormaPagoEnum.NOTA_CREDITO,
    FormaPagoEnum.TARJETA_CREDITO,
    FormaPagoEnum.TARJETA_DEBITO,
  ];

  const paymentMethodList = useMemo(() => {
    const paymentMethodList = getPaymentMethodList();
    const paymentMethodListFiltered = paymentMethodList.filter(
      (paymentMethod) => !excludedPaymentMethods.includes(paymentMethod.value)
    );
    return paymentMethodListFiltered;
  }, []);

  useEffect(() => {
    const setData = async () => {
      const bankList = await fetchBankListIsBank();
      if (bankList) {
        const response = bankList as BancoType[];
        setBankList(response);
      }
    };
    setData();
  }, []);

  useEffect(() => {
    const validatePaymentDocumentNumber = async () => {
      if (
        formState.bankId !== null &&
        formState.depositDate !== null &&
        formState.documentNumber &&
        formState.documentNumber.trim().length > 3
      ) {
        const sanitizedValue = formState.documentNumber
          .trim()
          .replace(/[.,]/g, '');
        const response = await fetchIsDepositDocumentNumberAvailable(
          formState.bankId,
          sanitizedValue
        );
        setFormState((prevState: FormState) => ({
          ...prevState,
          documentNumber: sanitizedValue,
          isValidDocument: response,
        }));
      }
    };

    if (createMode || editMode) validatePaymentDocumentNumber();
  }, [
    createMode,
    editMode,
    formState.documentNumber,
    formState.bankId,
    formState.depositDate,
  ]);

  //  * * * * * * * * * *  HANDLE MENU DOCUMENTOS ADJUNTOS * * * * * * * * * * * * *
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const depositosTypeList = useMemo(
    () =>
      getDepositTypeList().filter(
        (depositType) => depositType.value !== TipoDepositoEnum.TARJETA
      ),
    []
  );
  return (
    <>
      <Grid item xs={4}>
        <Autocomplete
          className={styles.genericFieldStyle}
          disablePortal
          autoSelect
          disabled={!allowCreateDepositAdmin()}
          options={depositosTypeList}
          readOnly={!createMode && !editMode}
          getOptionLabel={(option) => option.label}
          style={{ width: '100%' }}
          onChange={(event, option) =>
            onAutocompleteChange(event, 'depositTypeId', option?.value)
          }
          value={
            depositosTypeList.find(
              (option) => option.value === formState.depositTypeId
            ) || null
          }
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          noOptionsText="Sin resultados"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tipo de depósito"
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
        <Autocomplete
          className={styles.genericFieldStyle}
          options={sucursales}
          getOptionLabel={(option) => option.name}
          disabled={!allowCreateDepositAdmin()}
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
          readOnly={!createMode}
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
      <Grid item xs={2}>
        <StyledDatePicker
          label="Fecha Contable"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          minDate={contabilidadPeriodo?.closingPeriodDate}
          defaultValue={new Date()}
          disabled={formState.depositMultiple}
          value={
            typeof formState.depositDate === 'string'
              ? parseISO(formState.depositDate)
              : formState.depositDate
          }
          onChange={(value) =>
            onGenericChange((value as Date).toISOString(), 'depositDate')
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
      <Grid item xs={2}>
        <StyledDatePicker
          label="Fecha Registro"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          defaultValue={new Date()}
          value={
            typeof formState.registerDate === 'string'
              ? parseISO(formState.registerDate)
              : formState.registerDate
          }
          readOnly={true}
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
            }
            onAutocompleteChange(event, 'bankId', value?.bankId);
            onAutocompleteChange(event, 'bankName', value?.bankName);
          }}
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.bankName.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          value={
            (formState.bankId !== null
              ? bankList.find((bank) => bank.bankId === formState.bankId)
              : null) || null
          }
          isOptionEqualToValue={(option, value) =>
            option.bankId === value.bankId
          }
          noOptionsText="Sin resultados"
          readOnly={!createMode}
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
      <Grid item xs={4}>
        <TextField
          name="documentNumber"
          label="N° de Documento"
          value={formState.documentNumber}
          disabled={formState.depositMultiple}
          onChange={onInputChange}
          InputProps={{
            readOnly: !createMode && !editMode,
          }}
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
      <Grid item xs={2}>
        <LabeledInputNumber
          label="Valor Depósito"
          inputNumberProps={{
            value: formState.depositAmount,
            min: 0,
            defaultValue: 0,
            controls: false,
            precision: 2,
            prefix: '$',
            onFocus: (e: any) => e.target.select(),
            readOnly: true,
          }}
        />
      </Grid>
      <Grid item xs={2}>
        <TextField
          name="userName"
          label="Usuario"
          value={formState.userName}
          onChange={onInputChange}
          InputProps={{
            readOnly: true,
          }}
          inputProps={{ style: { textTransform: 'uppercase' } }}
          InputLabelProps={{
            shrink:
              formState.userName !== '' && formState.userName != null
                ? true
                : false,
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={8}>
        <TextField
          name="depositDescription"
          label="Observación"
          value={formState.depositDescription}
          onChange={onInputChange}
          InputProps={{
            readOnly: !createMode,
          }}
          inputProps={{ style: { textTransform: 'uppercase' } }}
          InputLabelProps={{
            shrink:
              formState.observation !== '' &&
              formState.depositDescription != null
                ? true
                : false,
          }}
          fullWidth
        />
      </Grid>
      {formState.depositId !== null &&
      allowCheckEntry() &&
      formState.entryId !== null ? (
        <>
          <Grid item xs={4}>
            <Box display="width" justifyContent="center">
              <Button
                id="demo-customized-button"
                aria-controls={open ? 'demo-customized-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="contained"
                disableElevation
                onClick={handleClick}
                endIcon={<KeyboardArrowDown />}
                fullWidth
              >
                Documentos Adjuntos
              </Button>
              <Menu
                id="demo-customized-menu"
                MenuListProps={{
                  'aria-labelledby': 'demo-customized-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={() => {
                  setAnchorEl(null);
                }}
                classes={{ paper: styles.paperMenuStyle }}
              >
                {' '}
                {formState.entryId && (
                  <Link
                    to={`/contabilidad/asiento/view/${formState.entryId}`}
                    target="_blank"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <EventSeat
                      style={{ marginLeft: '5px', marginRight: '10px' }}
                    />
                    <Typography>Asiento Contable</Typography>
                  </Link>
                )}
              </Menu>
            </Box>
          </Grid>
        </>
      ) : (
        formState.depositTypeId === TipoDepositoEnum.VENTAS &&
        createMode && (
          <>
            <Grid item xs={2}>
              <Autocomplete
                className={styles.genericFieldStyle}
                disablePortal
                autoSelect
                options={paymentMethodList}
                readOnly={!createMode && !editMode}
                getOptionLabel={(option) => option.label}
                style={{ width: '100%' }}
                onChange={(event, option) =>
                  onAutocompleteChange(event, 'paymentMethodId', option?.value)
                }
                value={
                  paymentMethodList.find(
                    (option) => option.value === formState.paymentMethodId
                  ) || null
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter((option) =>
                    option.label
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
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
            <Grid item xs={2}>
              <Grid container justifyContent="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formState.depositMultiple}
                      onChange={(event) =>
                        onGenericChange(event.target.checked, 'depositMultiple')
                      }
                    />
                  }
                  label={formState.depositMultiple ? 'Multiple' : 'Individual'}
                />
              </Grid>
            </Grid>
          </>
        )
      )}
    </>
  );
};
