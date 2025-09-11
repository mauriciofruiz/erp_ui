import { CardLayout, CustomDialog } from '@/modules/layout';
import { Grid } from '@mui/material';
import React, { useState } from 'react';
import { CuentasPorPagarForm } from './components';
import {
  FormState,
  useCommonManage,
  useCuentasPorPagarAsync,
  useForm,
} from '@/hooks';
import {
  GridRowSelectionModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import {
  AccountsPayableDetailType,
  AccountsPayableRequestType,
  AccountsPayableSendType,
  AdvanceResponseType,
  AdvanceType,
  PaginatedResponseType,
} from '@/types';
import { QueryClient, QueryClientProvider } from 'react-query';
import { PaginacionDetalles } from './components/PaginacionDetalles';
import { PaymentData } from './components/PaymentData';
import { SubmitButtons } from './components/SubmitButtons';
import { FormaPagoEnum } from '@/enums';

export type CuentasPorPagarProps = {
  // types...
};

const initialFormState: FormState = {
  providerId: null,
  endDate: new Date().toISOString(),
  isDue: null,
  rangeDaysId: null,
  isForeign: null,
  documentNumber: '',
  page: 1,
  pageSize: 10,
  sortDirection: 'desc',
  sortField: 'documentExpirationDate',
  bankId: null,
  isChequePayment: false,
  paymentDocumentNumber: '',
  accountingDate: new Date().toISOString(),
  isIndividual: false,
};

const initialPagination: PaginatedResponseType = {
  limit: 0,
  list: [],
  page: 0,
  totalPages: 0,
  totalRecords: 0,
};

export const CuentasPorPagarPage: React.FC<CuentasPorPagarProps> = ({}) => {
  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  const [dialogMessage, setDialogMessage] = useState('');

  const { stopEnterEvent, styles, enqueueSnackbar } = useCommonManage();

  const queryClient = new QueryClient();

  const [rows, setRows] = useState<GridRowsProp>([]);

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  const [selectedAdvances, setSelectedAdvances] = useState<AdvanceType[]>([]);

  const [availableAdvances, setAvailableAdvances] = useState<
    AdvanceResponseType[]
  >([]);

  const [pagination, setPagination] =
    useState<PaginatedResponseType>(initialPagination);

  const {
    onInputChange,
    onAutocompleteChange,
    setFormState,
    formState,
    onGenericChange,
    onBooleanChangeClick,
  } = useForm(initialFormState);

  const { fecthSavePayments } = useCuentasPorPagarAsync();

  const validateForm = (selectedRows: readonly GridValidRowModel[]) => {
    const thereAreRows = selectedRows.length > 0;

    const allRowsHasChangeBalance = selectedRows.every(
      (row) => row.documentBalance !== row.documentStaticBalance
    );
    if (!allRowsHasChangeBalance) {
      enqueueSnackbar(
        'Todos los documentos seleccionados deben tener un valor a pagar o cruzar distinto al saldo inicial',
        {
          variant: 'error',
        }
      );
      return false;
    }

    if (formState.bankId === null) {
      enqueueSnackbar('Debe seleccionar un banco', {
        variant: 'error',
      });
      return false;
    }

    if (thereAreRows && !formState.isIndividual) {
      if (formState.paymentDocumentNumber === '') {
        enqueueSnackbar('Debe ingresar un número de documento', {
          variant: 'error',
        });
        return false;
      }

      const minIssueDate = selectedRows.reduce((acc, row) => {
        return row.documentIssueDate > acc ? row.documentIssueDate : acc;
      }, selectedRows[0].documentIssueDate);

      if (new Date(formState.accountingDate) < new Date(minIssueDate)) {
        enqueueSnackbar(
          'La fecha de contabilización no puede ser menor a la fecha de emisión del documento más antiguo',
          {
            variant: 'error',
          }
        );
        return false;
      }
      if (!formState.isValidDocument) {
        enqueueSnackbar('El número de documento no es válido', {
          variant: 'error',
        });
        return false;
      }
    } else if (thereAreRows && formState.isIndividual) {
      const allRowsHasDocumentNumber = selectedRows.every(
        (row) => row.documentPayment !== null && row.documentPayment !== ''
      );

      if (!allRowsHasDocumentNumber) {
        enqueueSnackbar(
          'Todos los documentos seleccionados deben tener un número de documento',
          {
            variant: 'error',
          }
        );
        return false;
      }

      const allRowsHasAccountingDate = selectedRows.every(
        (row) =>
          row.documentPaymentDate !== null && row.documentPaymentDate !== ''
      );

      if (!allRowsHasAccountingDate) {
        enqueueSnackbar(
          'Todos los documentos seleccionados deben tener una fecha de contabilización',
          {
            variant: 'error',
          }
        );
        return false;
      }

      const allRowsHasCorrectDate = selectedRows.every(
        (row) =>
          new Date(row.documentPaymentDate) >= new Date(row.documentIssueDate)
      );
      if (!allRowsHasCorrectDate) {
        enqueueSnackbar(
          'La fecha de contabilización no puede ser menor a la fecha de emisión del documento',
          {
            variant: 'error',
          }
        );
        return false;
      }

      const allDocumentsAreValid = selectedRows.every(
        (row) => row.isValidDocument
      );
      if (!allDocumentsAreValid) {
        enqueueSnackbar('Alguno de los documentos no tiene un número válido', {
          variant: 'error',
        });
        return false;
      }
    } else if (!thereAreRows) {
      enqueueSnackbar('Debe seleccionar al menos un documento', {
        variant: 'error',
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedRows = rows.filter((row) =>
      rowSelectionModel.includes(row.id)
    );

    if (!validateForm(selectedRows)) return;

    // Función para agrupar filas por providerId
    const groupRowsByProvider = (
      rows: GridValidRowModel[]
    ): Record<string, GridValidRowModel[]> => {
      return rows.reduce(
        (acc: Record<string, GridValidRowModel[]>, row: GridValidRowModel) => {
          if (!acc[row.providerId]) {
            acc[row.providerId] = [];
          }
          acc[row.providerId].push(row);
          return acc;
        },
        {}
      );
    };

    // Función para mapear filas agrupadas a AccountsPayableSendType
    const mapGroupedRowsToAccountsPayableSendType = (
      groupedRows: Record<string, GridValidRowModel[]>,
      formState: FormState,
      selectedAdvances: AdvanceType[]
    ): AccountsPayableSendType[] => {
      return Object.keys(groupedRows).map((providerId) => {
        const rows = groupedRows[providerId];

        const cxpDetailList: AccountsPayableDetailType[] = rows.map((row) => {
          const advancesList: AdvanceType[] = selectedAdvances.filter(
            (advance) => advance.invoiceFeeId === row.invoiceFeeId
          );

          return {
            documentId: row.documentId,
            documentNumber: row.documentNumber,
            documentTypeId: row.documentTypeId,
            providerId: row.providerId,
            invoiceFeeId: row.invoiceFeeId,
            paymentAmount: row.paymentAmount,
            advancesList,
            documentNumberPayment: row.documentPayment,
            paymentDate: row.documentPaymentDate,
          };
        });

        return {
          cxpDetailList,
          bankId: formState.bankId,
          paymentAmount: rows.reduce((acc, row) => acc + row.paymentAmount, 0),
          paymentMethodId: formState.isChequePayment
            ? FormaPagoEnum.CHEQUE
            : FormaPagoEnum.TRANSFERENCIA,
          advanceAmount: rows.reduce((acc, row) => acc + row.advanceAmount, 0),
          providerId: rows[0].providerId,
          documentNumberPayment: formState.paymentDocumentNumber,
          paymentDate: formState.accountingDate,
        };
      });
    };

    // Lógica principal
    const newBody: AccountsPayableRequestType = formState.isIndividual
      ? {
          cxpList: [
            {
              cxpDetailList: selectedRows.map((row) => {
                const advancesList: AdvanceType[] = selectedAdvances.filter(
                  (advance) => advance.invoiceFeeId === row.invoiceFeeId
                );

                return {
                  documentId: row.documentId,
                  documentNumber: row.documentNumber,
                  documentTypeId: row.documentTypeId,
                  providerId: row.providerId,
                  invoiceFeeId: row.invoiceFeeId,
                  paymentAmount: row.paymentAmount,
                  advancesList,
                  documentNumberPayment: row.documentPayment,
                  paymentDate: row.documentPaymentDate,
                };
              }),
              bankId: formState.bankId,
              paymentAmount: selectedRows.reduce(
                (acc, row) => acc + row.paymentAmount,
                0
              ),
              paymentMethodId: formState.isChequePayment
                ? FormaPagoEnum.CHEQUE
                : FormaPagoEnum.TRANSFERENCIA,
              advanceAmount: selectedRows.reduce(
                (acc, row) => acc + row.advanceAmount,
                0
              ),
              providerId: selectedRows[0].providerId,
              documentNumberPayment: formState.paymentDocumentNumber,
              paymentDate: formState.accountingDate,
            },
          ],
          paymentMultiple: false,
        }
      : {
          cxpList: mapGroupedRowsToAccountsPayableSendType(
            groupRowsByProvider(selectedRows),
            formState,
            selectedAdvances
          ),
          paymentMultiple: true,
        };

    fecthSavePayments(newBody).then(() => {
      handleFinishTransaction();
    });
  };

  const handleFinishTransaction = () => {
    //window.location.reload();
    setRows([]);
    setRowSelectionModel([]);
    setSelectedAdvances([]);
    setAvailableAdvances([]);
    setPagination(initialPagination);
    setFormState(initialFormState);
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
        title={'Cuentas Por Pagar'}
        createMode={false}
        cancelFunction={() => []}
      >
        <form onSubmit={onSubmit} onKeyDown={stopEnterEvent}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <CuentasPorPagarForm
              formState={formState}
              onAutocompleteChange={onAutocompleteChange}
              onInputChange={onInputChange}
              styles={styles}
              setRows={setRows}
              onGenericChange={onGenericChange}
              pagination={pagination}
              setPagination={setPagination}
              setAvailableAdvances={setAvailableAdvances}
              setSelectedAdvances={setSelectedAdvances}
            />
            <QueryClientProvider client={queryClient}>
              <PaginacionDetalles
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
              />
            </QueryClientProvider>
            <PaymentData
              formState={formState}
              setFormState={setFormState}
              onGenericChange={onGenericChange}
              onInputChange={onInputChange}
              onAutocompleteChange={onAutocompleteChange}
              onBooleanChangeClick={onBooleanChangeClick}
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
