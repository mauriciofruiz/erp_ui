import { ImpuestoDocumentoInterface } from "../common";

export type NotaDebitoClienteMain = {
  documentId: number;
  issueDate: string;
  documentNumber: string;
  invoiceNumber: string;
  clientName: string;
  value: number;
  ncTypeId: string;
  documentStatus: string;
};

export type NotaDebitoClienteGet = {
  debitNoteId: number | null;
  debitNoteNumber: string | null;
  entryId: number | null;
  branchId: number;
  branchName: string;
  issueDate: string;
  authorizationNumber: string;
  paymentMethodId: string;
  paymentMethodName: string;
  invoiceId: number;
  invoiceNumber: string;
  invoiceIssueDate: string;
  invoiceValue: number;
  invoiceBalance: number;
  clientId: number | null;
  clientName: string;
  clientIdentification: string;
  observation: string;
  stateId: number;
  stateName: string;
  voucherTypeCode: string;
  voucherTypeName: string;
  subtotal: number;
  vat: number;
  total: number;
  ndTypeId: number | null;
  paymentTypeId: number | null;
  cancellationDate: string | null;
  cancellationReason: string;
  debitNoteDetails: DetalleNDVentaGet[];
  subtotalNoTax: number;
  totalDiscount: number;
  hasCredit: boolean;
  creationUserId: number;
};

export type DetalleNDVentaGet = {
  detailId: number | null;
  debitNoteId: number | null;
  productId: number | null;
  productCode: string | null;
  productName: string | null;
  availableQuantity: number;
  quantity: number;
  unitPrice: number;
  returnedQuantity: number;
  hasIva: boolean;
  taxRateId: number;
  taxValue: number;
  totalPrice: number;
  branchId: number;
  detailTypeId: number;
  projectId: number | null;
  importOpeningId: number | null;
  groupId: number | null;
  providerId: number | null;
  clientId: number;
  cashId: number | null;
  employeeId: number | null;
  accountId: number | null;
  accountName: string | null;
  accountNumber: string | null;
  invoiceDetailId: number;
  invoiceAccountId: number;
  invoiceTotalPrice: number;
  discountValue: number;
};

export type NotaDebitoClientePost = Omit<
  NotaDebitoClienteGet,
  | "clientName"
  | "branchName"
  | "paymentMethodName"
  | "stateName"
  | "debitNoteDetails"
  | "invoiceNumber"
  | "invoiceValue"
  | "invoiceIssueDate"
  | "invoiceBalance"
  | "creationUserId"
  | "clientName"
  | "clientIdentification"
  | "cancellationDate"
  | 'voucherTypeName'
> & {
  debitNoteDetails: DetalleNDVentaPost[];
};

export type DetalleNDVentaPost = Omit<
  DetalleNDVentaGet,
  "productCode" | "productName" | "totalAfterDiscount" | "accountName" | "accountNumber"
>;

export type NotaDebitoClientePostType = {
  header: NotaDebitoClientePost;
  taxes: ImpuestoDocumentoInterface[] | null;
};
