'use client';
import { CuentaPorCobrarEnum, FormaPagoEnum, ParametersEnum } from '@/enums';
import {
  FormState,
  useAllowVentas,
  useCommonManage,
  useCuentasPorCobrarAsync,
  useForm,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import {
  AccountsPayableSendTypeCXC,
  AdvanceClientType,
  AdvanceTypeCXC,
  CobroFacturaInterface,
  CrossedAdvanceClientType,
  DetalleCobroFacturaInterface,
  PaginatedResponseType,
} from '@/types';
import { Grid } from '@mui/material';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowSelectionModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import React, { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CuentasPorCobrarForm } from './components/CuentasPorCobrarForm';
import { CuentaPorCobrarDetalles } from './components/CuentaPorCobrarDetalles';
import { CobroRows } from './components/CobroRows';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { GridValidRowModel } from '@mui/x-data-grid';
import { SubmitButtons } from './components/SubmitButtons';

type CuentasPorCobrarPageProps = {
  // types...
};

const initialFormState: FormState = {
  clientId: null,
  observation: '',
  endDate: new Date().toISOString(),
  isDue: null,
  rangeDaysId: null,
  documentNumber: '',
  cxcTypeId: CuentaPorCobrarEnum.COBRO,
  page: 1,
  pageSize: 10,
  sortDirection: 'asc',
  sortField: 'documentDueDate',
  changeValue: 0,
  advancePayment: 0,
  transportAdvancePayment: 0,
  paymentTotal: 0,
  totalToCharge: 0,
  isRecoveryPayment: true,
};

const initialPagination: PaginatedResponseType = {
  limit: 0,
  list: [],
  page: 0,
  totalPages: 0,
  totalRecords: 0,
};

export const CuentasPorCobrarPage: React.FC<
  CuentasPorCobrarPageProps
> = ({}) => {
  const {
    onInputChange,
    onAutocompleteChange,
    setFormState,
    formState,
    onGenericChange,
  } = useForm(initialFormState);

  const {
    stopEnterEvent,
    dialogMessage,
    openDialogAlert,
    setOpenDialogAlert,
    rows,
    setRows,
    setDialogMessage,
    enqueueSnackbar,
  } = useCommonManage(formState);

  const queryClient = new QueryClient();

  const { fecthSaveCharge } = useCuentasPorCobrarAsync();

  const { user } = useSelector((state: RootState) => state.auth);

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  const [rowsCobros, setRowsCobros] = useState<GridRowsProp>([]);

  const [rowModesModelCobros, setRowModesModelCobros] =
    useState<GridRowModesModel>({});

  const [diferencia, setDiferencia] = useState(0);

  const [selectedAdvances, setSelectedAdvances] = useState<AdvanceTypeCXC[]>(
    []
  );

  const [availableAdvances, setAvailableAdvances] = useState<
    AdvanceClientType[]
  >([]);

  const { ventasPeriodo } = useAllowVentas();

  const [pagination, setPagination] =
    useState<PaginatedResponseType>(initialPagination);

  const selectedRows = useMemo(
    () => rows.filter((row) => rowSelectionModel.includes(row.id)),
    [rowSelectionModel, rows]
  );

  const isNormalCharge = useMemo(
    () => formState.cxcTypeId === CuentaPorCobrarEnum.COBRO,
    [formState.cxcTypeId]
  );

  const availablePostdatedCharge = useMemo(() => {
    if (formState.cxcTypeId !== CuentaPorCobrarEnum.POSTFECHADO) return true;

    if (ventasPeriodo === null) return false;

    const currentDate = new Date();
    const lastDayFromPastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );

    const lastDayFromPastMonthDateOnly = new Date(
      lastDayFromPastMonth.getFullYear(),
      lastDayFromPastMonth.getMonth(),
      lastDayFromPastMonth.getDate()
    );

    const closingDateDate = new Date(ventasPeriodo.closingPeriodDate);

    const closingPeriodDateOnly = new Date(
      closingDateDate.getFullYear(),
      closingDateDate.getMonth(),
      closingDateDate.getDate()
    );

    const isAvailable = lastDayFromPastMonthDateOnly > closingPeriodDateOnly;

    if (!isAvailable) {
      enqueueSnackbar(
        'No es posible realizar cobros postfechados fuera del periodo contable',
        { variant: 'error' }
      );
    }
    return isAvailable;
  }, [formState.cxcTypeId, ventasPeriodo]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const crosses: CrossedAdvanceClientType[] = selectedAdvances.filter(
      (advance) => advance.advanceAmount > 0
    );

    const paymentDetails: DetalleCobroFacturaInterface[] = rowsCobros
      .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
      .map((row) => {
        if (row.paymentMethodId === FormaPagoEnum.NOTA_CREDITO) {
          return {
            ...(row as DetalleCobroFacturaInterface),
            crosses,
          };
        }
        return {
          ...(row as DetalleCobroFacturaInterface),
        };
      });

    const isRecoveryPayment = isNormalCharge;

    const advancePayment = !isNormalCharge ? formState.paymentTotal : 0;

    const payment: CobroFacturaInterface = {
      paymentId: null,
      cashId: user?.cashId || null,
      clientId: formState.clientId,
      cashClosingId: null,
      paymentTotal: formState.paymentTotal,
      advancePayment,
      transportAdvancePayment: 0,
      changeValue: formState.changeValue,
      observation: formState.observation,
      isRecoveryPayment,
      paymentDetails,
    };

    // Función para agrupar filas por providerId
    const groupRowsByInvoiceId = (
      rows: GridValidRowModel[]
    ): Record<string, GridValidRowModel[]> => {
      return rows.reduce(
        (acc: Record<string, GridValidRowModel[]>, row: GridValidRowModel) => {
          if (!acc[row.invoiceFeeId]) {
            acc[row.invoiceFeeId] = [];
          }
          acc[row.invoiceFeeId].push(row);
          return acc;
        },
        {}
      );
    };

    const invoiceFeeIds: number[] = !isNormalCharge
      ? []
      : Object.keys(groupRowsByInvoiceId(selectedRows)).map((id) => Number(id));

    const body: AccountsPayableSendTypeCXC = {
      payment,
      invoiceFeeIds,
      cxcTypeId: formState.cxcTypeId,
    };

    if (!validateForm(payment)) return;

    fecthSaveCharge(body).then(() => {
      handleFinishTransaction();
    });
  };

  const validateForm = (payment: CobroFacturaInterface): boolean => {
    if (!availablePostdatedCharge) {
      enqueueSnackbar(
        'No es posible realizar cobros postfechados fuera del periodo contable',
        { variant: 'error' }
      );
      return false;
    }
    if (!payment.clientId) {
      enqueueSnackbar('Debe seleccionar un cliente', { variant: 'error' });
      return false;
    }
    if (!payment.cashId) {
      enqueueSnackbar(
        'Necesita tener asignada una caja para realizar un cobro',
        { variant: 'error' }
      );
      return false;
    }
    if (diferencia !== 0) {
      enqueueSnackbar(
        'La diferencia entre el total del cobro y el total a cobrar debe ser 0',
        { variant: 'error' }
      );
      return false;
    }
    const thereIsARowEditing = rowsCobros.some((row) => {
      return rowModesModelCobros[row.id]?.mode === GridRowModes.Edit;
    });
    if (thereIsARowEditing) {
      enqueueSnackbar('Debe guardar los cambios en el detalle de cobro', {
        variant: 'error',
      });
      return false;
    }
    for (const row of payment.paymentDetails) {
      if (
        !row.paymentMethodId ||
        row.paymentMethodId === null ||
        row.paymentMethodId === ''
      ) {
        enqueueSnackbar('Debe seleccionar una forma de pago', {
          variant: 'error',
        });
        return false;
      }
      if (row.amount <= 0) {
        enqueueSnackbar('El monto de todos los cobros debe ser mayor a 0', {
          variant: 'error',
        });
        return false;
      }
      if (
        row.paymentMethodId === FormaPagoEnum.TRANSFERENCIA ||
        row.paymentMethodId === FormaPagoEnum.DEPOSITO
      ) {
        if (!row.bankId || row.bankId === null) {
          enqueueSnackbar('Debe seleccionar un banco', {
            variant: 'error',
          });
          return false;
        }
        if (
          !row.documentNumber ||
          row.documentNumber === null ||
          row.documentNumber === ''
        ) {
          enqueueSnackbar('Debe ingresar un número de documento', {
            variant: 'error',
          });
          return false;
        }
      } else if (row.paymentMethodId === FormaPagoEnum.CHEQUE) {
        if (!row.bankId || row.bankId === null) {
          enqueueSnackbar('Debe seleccionar un banco', {
            variant: 'error',
          });
          return false;
        }
        if (
          !row.checkNumber ||
          row.checkNumber === null ||
          row.checkNumber === ''
        ) {
          enqueueSnackbar('Debe ingresar un número de cheque', {
            variant: 'error',
          });
          return false;
        }
      } else if (
        row.paymentMethodId === FormaPagoEnum.TARJETA_CREDITO ||
        row.paymentMethodId === FormaPagoEnum.TARJETA_DEBITO
      ) {
        if (!row.cardId || row.cardId === null) {
          enqueueSnackbar('Debe seleccionar una tarjeta', {
            variant: 'error',
          });
          return false;
        }
        if (!row.acquirerId || row.acquirerId === null) {
          enqueueSnackbar('Debe seleccionar un adquiriente', {
            variant: 'error',
          });
          return false;
        }
        if (!row.batch || row.batch === null) {
          enqueueSnackbar('Debe ingresar un número de lote', {
            variant: 'error',
          });
          return false;
        }
        if (!row.term || row.term === null) {
          enqueueSnackbar('Debe ingresar un número de plazo', {
            variant: 'error',
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleFinishTransaction = () => {
    //window.location.reload();
    setRows([]);
    setRowSelectionModel([]);
    setSelectedAdvances([]);
    setAvailableAdvances([]);
    setPagination(initialPagination);
    setFormState(initialFormState);
    setRowsCobros([]);
  };

  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  return (
    <>
      <CustomDialog
        fieldName="any"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={false}
        motivo={null}
        onInputChange={onInputChange}
      />
      <CardLayout
        title={'Cuentas Por Cobrar'}
        createMode={false}
        cancelFunction={() => []}
      >
        <form onSubmit={onSubmit} onKeyDown={stopEnterEvent}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <CuentasPorCobrarForm
              formState={formState}
              onAutocompleteChange={onAutocompleteChange}
              onInputChange={onInputChange}
              setRows={setRows}
              onGenericChange={onGenericChange}
              pagination={pagination}
              setPagination={setPagination}
              setAvailableAdvances={setAvailableAdvances}
              setSelectedAdvances={setSelectedAdvances}
              isNormalCharge={isNormalCharge}
            />
            {isNormalCharge && (
              <QueryClientProvider client={queryClient}>
                <CuentaPorCobrarDetalles
                  rows={rows}
                  setRows={setRows}
                  pagination={pagination}
                  setPagination={setPagination}
                  formState={formState}
                  setFormState={setFormState}
                  rowSelectionModel={rowSelectionModel}
                  setRowSelectionModel={setRowSelectionModel}
                  availableAdvances={availableAdvances}
                  setAvailableAdvances={setAvailableAdvances}
                  selectedAdvances={selectedAdvances}
                  setSelectedAdvances={setSelectedAdvances}
                  handleFinishTransaction={handleFinishTransaction}
                  selectedRows={selectedRows}
                  isNormalCharge={isNormalCharge}
                />
              </QueryClientProvider>
            )}
            <CobroRows
              rows={rowsCobros}
              setRows={setRowsCobros}
              formState={formState}
              diferencia={diferencia}
              setDiferencia={setDiferencia}
              rowModesModel={rowModesModelCobros}
              setRowModesModel={setRowModesModelCobros}
              setFormState={setFormState}
              selectedAdvances={selectedAdvances}
              selectedRows={selectedRows}
              isNormalCharge={isNormalCharge}
            />
            <SubmitButtons
              setDialogMessage={setDialogMessage}
              setOpenDialogAlert={setOpenDialogAlert}
            />
          </Grid>
        </form>
      </CardLayout>
    </>
  );
};
