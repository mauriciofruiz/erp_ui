export type PaymentMainInterface = {
  paymentId: number;
  bankId: number;
  bankName: string;
  accountingDate: string;
  documentDate: string;
  registrationDate: string;
  beneficiaryName: string;
  paymentAmount: number;
  documentNumber: string;
  paymentMethodId: string;
  paymentCollectionMethodName: string;
  paymentStatusId: number;
  paymentStatusName: string;
};

export interface PaymentInterface {
  paymentId: number | null;
  entryId?: number | null;
  paymentMethodId: string | null;
  paymentMethodName: string | null;
  bankId: number | null;
  bankName: string | null;
  paymentStatusId: number | null;
  paymentStatusName: string | null;
  providerId: number | null;
  providerName?: string |null;
  documentNumber: string;
  paymentAmount: number;
  crossedAmount?: number;
  paymentObservation: string;
  accountingDate: string | null;
  isChequePayment: boolean;
  isPettyCashPayment: boolean;
  isManualPayment: boolean;
  isAdvancePayment: boolean;
  recoverCheque: boolean;
  branchId: number | null;
  branchName?: string | null;
  conciliationDate: string;
  documentDate: string;
  beneficiaryName: string;
  registrationDate: string | null;
  detail?: PaymentDetailInterface[];
};

export interface PaymentDetailInterface {
  detailPaymentId: number | null;
  paymentId: number | null;
  detailPaymentAmount: number;
  accountId: number | null;
  accountNumber: string | null;
  accountName: string | null;
  accountTypeId: number | null;
  accountTypeName: string | null;
  detailPaymentStatus: boolean;
  detailPaymentObservation: string;
  projectId: number | null;
  projectName: string | null;
  branchId: number | null;
  branchName: string | null;
  employeeId: number | null;
  employeeName: string | null;
  importOpeningId: number | null;
  importCode: string | null;
  providerId: number | null;
  providerName: string | null;
  clientId: number | null;
  clientName: string | null;
}

export interface PaymentPackedInterface {
  payment: PaymentInterface;
  detailPayment: PaymentDetailInterface[];
}
