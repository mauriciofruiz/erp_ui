import { AdvanceResponseType } from '../contabilidad';

export type DetalleCobroFacturaInterface = {
  paymentDetailId: number | null;
  paymentMethodId: string;
  amount: number;
  bankId: number | null;
  bankName: string;
  documentNumber: string;
  checkNumber: string;
  quotaAvailable: number;
  creditBalance: number;
  cardId: number | null;
  cardName: string;
  acquirerId: number | null;
  acquirerName: string;
  batch: number;
  term: number;
  crosses: CrossedAdvanceClientType[];
};

export type crosesDetailsInterface = {
  invoiceNumber: string;
  invoiceValue: number;
  idInvoicePayment: number | null;
  paymentValue: number;
};

export type CobroGetType = Pick<
  CobroFacturaInterface,
  'advancePayment' | 'transportAdvancePayment' | 'changeValue'
> & {
  idCobro: number | null;
  clientId: number | null;
  clientIdentification: string;
  clientName: string;
  cashId: number | null;
  cashName: number | null;
  status: boolean;
  creationUserId: number | null;
  creationUserName: string;
  amount: number;
  entryId: number | null;
  paymentDetails: DetalleCobroFacturaInterface[];
  crosesDetails: crosesDetailsInterface[];
};

export interface CobroFacturaInterface {
  paymentId: number | null;
  cashId: number | null;
  clientId: number | null;
  cashClosingId: number | null;
  paymentTotal: number;
  advancePayment: number;
  transportAdvancePayment: number;
  changeValue: number;
  isRecoveryPayment: boolean;
  observation?: string;
  paymentDetails: DetalleCobroFacturaInterface[];
}

export interface DetalleCobroCierreCajaInterface {
  chargeDetailId: number | null;
  paymentMethodId: string;
  quantity: number;
  totalCharged: number;
  issueDate: string;
  isPhysicallyChecked: boolean;
}

export type AdvanceClientType = Omit<
  AdvanceResponseType,
  'providerId' | 'providerName'
> & {
  issueDate: string;
  branchId: number;
  branchName: string;
  paymentMethodId: string | null;
  paymentMethodName: string;
  hasCreditCard: boolean;
  clientId: number;
  clientName: string;
};

export type CrossedAdvanceClientType = {
  crossedAdvanceId: number | null;
  documentId: number;
  documentNumber: string;
  documentTypeId: number;
  hasCreditCard: boolean;
  clientId: number;
  advanceAmount: number;
};

export type CobroMainType = {
  paymentId: number;
  clientId: number;
  clientName: string;
  branchId: number;
  branchName: string;
  amount: number;
  issueDate: string;
  paymentMethodId: string;
  paymentMethodName: string;
  status: boolean;
};
