export type AperturaImportacionType = {
  limit: number;
  list: AperturaImportacionMainType[];
  page: number;
  totalPages: number;
  totalRecords: number;
};

export type AperturaImportacionMainType = {
  importOpeningCode: string;
  importOpeningId: number;
  importStateId: number;
  importStateName: string;
  multiInvoice: boolean;
  registrationDate: Date;
};

export type EstadoAperturaType = {
  importStateId: number;
  importStateName: string;
};

export type AperturaPostType = {
  importStateId: number;
  providerId: number;
  userId?: number;
  accountId: number;
  registrationDate: string;
  importCode: string;
  reference: string;
  detail: string;
  referenceDetail: string;
  observation: string;
  multiInvoice: boolean;
  importOpeningId?: number;
};

export type AperturaGetType = {
  accountId: number;
  accountName: string;
  contact: null;
  registrationDate: Date;
  emailList: Array<null | string>;
  identification: string;
  importCode: string;
  importDetail: string;
  importOpeningId: number;
  importStateId: number;
  importStateName: string;
  multiInvoice: boolean;
  observation: string;
  phoneList: Array<null | string>;
  providerAddress: string;
  providerId: number;
  providerName: string;
  reference: string;
  referenceDetail: string;
  userId: number;
  userNick: string;
  orderListId: string;
};

export interface CodigosAperturaType {
  importOpeningId: number;
  importCode: string;
}
