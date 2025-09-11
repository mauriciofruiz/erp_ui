import { ParametersEnum } from '@/enums';
import {
  PaymentDetailInterface,
  PaymentInterface,
  ProjectType,
  SucursalType,
} from '@/types';
import { GridValidRowModel } from '@mui/x-data-grid';

export const setHeader = (formState: any): PaymentInterface => {
  return {
    ...formState,
    paymentId: formState.paymentId,
    entryId: formState.entryId,
    paymentMethodId: formState.paymentMethodId,
    paymentMethodName: formState.paymentMethodName,
    bankId: formState.bankId,
    bankName: formState.bankName,
    paymentStatusId: formState.paymentStatusId,
    paymentStatusName: formState.paymentStatusName,
    providerId: formState.providerId,
    providerName: formState.providerName,
    documentNumber: formState.documentNumber,
    paymentAmount: formState.paymentAmount,
    crossedAmount: formState.crossedAmount,
    paymentObservation: formState.paymentObservation,
    accountingDate: formState.accountingDate,
    isChequePayment: formState.isChequePayment,
    isPettyCashPayment: formState.isPettyCashPayment,
    isManualPayment: formState.isManualPayment,
    isAdvancePayment: formState.isAdvancePayment,
    recoverCheque: formState.recoverCheque,
    branchId: formState.branchId,
    branchName: formState.branchName,
    conciliationDate: formState.conciliationDate,
    documentDate: formState.documentDate,
    beneficiaryName: formState.beneficiaryName,
    registrationDate: formState.registrationDate,
  };
};

export const setDetails = (
  rows: readonly GridValidRowModel[],
  branches: SucursalType[],
  branchId: number | null,
  projects: ProjectType[]
): PaymentDetailInterface[] => {
  return rows
    .filter((row) => row.accountId && row.accountId !== null)
    .map((row) => {
      const selectedBranchId: number | null = row.branchName
        ? branches.find((sucursal) => sucursal.name === row.branchName)
            ?.branchId || null
        : branchId || null;
      const selectedProjectId: number | null = row.projectName
        ? projects.find((project) => project.projectName === row.projectName)
            ?.projectId || null
        : 0;
      return {
        detailPaymentId: row.detailPaymentId,
        paymentId: row.paymentId,
        detailPaymentAmount: row.detailPaymentAmount,
        accountId: row.accountId,
        accountNumber: row.accountNumber,
        accountName: row.accountName,
        accountTypeId: row.accountTypeId,
        accountTypeName: row.accountTypeName,
        detailPaymentStatus: row.detailPaymentStatus,
        detailPaymentObservation: row.detailPaymentObservation,
        projectId: selectedProjectId !== 0 ? selectedProjectId : row.projectId,
        projectName: row.projectName,
        branchId: selectedBranchId,
        branchName: row.branchName,
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        importOpeningId: row.importOpeningId,
        importCode: row.importCode,
        providerId: row.providerId,
        providerName: row.providerName,
        clientId: row.clientId,
        clientName: row.clientName,
      };
    });
};

export const setSummaryRow = (
  rows: readonly GridValidRowModel[]
): readonly GridValidRowModel[] => {
  const summaryRow = rows.reduce(
    (acc, row) => {
      if (row.id !== ParametersEnum.ID_ROW_TOTAL) {
        acc.detailPaymentAmount += row.detailPaymentAmount;
        return acc;
      }
      return acc;
    },
    {
      id: ParametersEnum.ID_ROW_TOTAL,
      accountTypeName: '',
      detailPaymentObservation: 'TOTALES',
      detailPaymentAmount: 0,
    }
  );
  const newRows = rows.concat(summaryRow);

  return newRows;
};
