import { PaginatedResponseType } from '../common';
import {
  AdvanceClientType,
  CobroFacturaInterface,
  CrossedAdvanceClientType,
} from './cobro.interface';

export type GenericTypeCXC = {
  documentId: number;
  documentNumber: string;
  documentTypeId: number;
  clientId: number;
  clientName: string;
  invoiceFeeId: number;
};

export type AccountsPayableTypeCXC = GenericTypeCXC &
  Pick<cxcReprogramDetailType, 'numberFee' | 'daysCredit'> & {
    documentType: string;
    documentIssueDate: string;
    documentDueDate: string;
    documentAmount: number;
    paymentAmount: number;
    advanceAmount: number;
    documentBalance: number;
    documentStaticBalance: number;
    documentStatus: string;
    allowReprogram: boolean;
    hasPercentagePayment: boolean;
  };

export type AdvanceTypeCXC = Required<CrossedAdvanceClientType> & {
  invoiceFeeId: number;
};

export type AccountsPayableSendTypeCXC = {
  payment: CobroFacturaInterface;
  invoiceFeeIds: number[];
  cxcTypeId: number;
};

export type cxcReprogramDetailType = {
  numberFee: number;
  daysCredit: number;
  expirationDate: string;
  amountFee: number;
};

export type cxcReprogramType = Pick<
  GenericTypeCXC,
  'clientId' | 'invoiceFeeId'
> & {
  cxcReprogramList: cxcReprogramDetailType[];
};

export type PaginatedCXCResponseType = {
  invoicesReceivableList: PaginatedResponseType;
  advancesList: AdvanceClientType[];
};

export type AccountsPayableRequestTypeCXC = {
  cxpList: AccountsPayableSendTypeCXC[];
  paymentMultiple: boolean;
};
