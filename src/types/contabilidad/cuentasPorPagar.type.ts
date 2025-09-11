import { PaginatedResponseType } from '../common';

export type GenericType = {
  documentId: number;
  documentNumber: string;
  documentTypeId: number;
  providerId: number;
  providerName: string;
  invoiceFeeId: number;
};

export type AccountsPayableType = GenericType &
  Pick<cxpReprogramDetailType, 'numberFee' | 'daysCredit'> & {
    documentType: string;
    documentIssueDate: string;
    documentExpirationDate: string;
    documentValue: number;
    paymentAmount: number;
    advanceAmount: number;
    documentBalance: number;
    documentStaticBalance: number;
    documentStatus: string;
    documentPayment: string;
    documentPaymentDate: string;
    allowReprogram: boolean;
  };

export type AdvanceType = Omit<GenericType, 'providerName'> & {
  advanceAmount: number;
};

export type AccountsPayableDetailType = Omit<GenericType, 'providerName'> & {
  advancesList: AdvanceType[];
  paymentAmount: number;
  documentNumberPayment?: string;
  paymentDate?: string;
  paymentMethodId?: string;
};

export type AccountsPayableSendType = Pick<
  AccountsPayableDetailType,
  'paymentAmount' | 'paymentMethodId'
> & {
  cxpDetailList: AccountsPayableDetailType[];
  // paymentMultiple: boolean;
  bankId: number;
  advanceAmount: number;
  providerId?: number;
  documentNumberPayment?: string;
  paymentDate?: string;
};

export type cxpReprogramDetailType = {
  numberFee: number;
  daysCredit: number;
  expirationDate: string;
  amountFee: number;
};

export type cxpReprogramType = Pick<
  GenericType,
  'providerId' | 'invoiceFeeId'
> & {
  cxpReprogramList: cxpReprogramDetailType[];
};

export type AdvanceResponseType = {
  documentId: number;
  documentTypeId: number | null;
  documentTypeName: string;
  documentNumber: string;
  providerId: number;
  providerName: string;
  advanceAmount: number;
  availableAmount: number;
  amountToCross: number;
  availableStaticAmount: number;
};
export type PaginatedCXPResponseType = {
  invoicesToPayList: PaginatedResponseType;
  advanceList: AdvanceResponseType[];
};

export type AccountsPayableRequestType = {
  cxpList: AccountsPayableSendType[];
  paymentMultiple: boolean;
};
