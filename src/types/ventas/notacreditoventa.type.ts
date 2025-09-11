import { ImpuestoDocumentoInterface } from '../common';

export type NotaCreditoVentaMain = {
  documentId: number;
  issueDate: string;
  documentNumber: string;
  invoiceNumber: string;
  clientName: string;
  value: number;
  ncTypeId: string;
  documentStatus: string;
};

export type NCVentaDetalleGet = {
  accountId: number | null;
  accountName: string | null;
  accountNumber: string | null;
  availableQuantity: number;
  branchId: number;
  cashId: number | null;
  clientId: number | null;
  creditNoteId: number;
  detailId: number;
  detailTypeId: number;
  paymentMethodDiscountPercentage: number;
  paymentMethodDiscount: number;
  employeeId: number | null;
  groupId: number | null;
  hasIva: number;
  importOpeningId: number | null;
  invoiceAccountId: number;
  invoiceDetailId: number;
  invoiceTotalPrice: number;
  productCode: number;
  productId: number;
  productName: number;
  projectId: number | null;
  providerId: number | null;
  quantity: number;
  returnedQuantity: number;
  taxRateId: number;
  taxValue: number;
  taxeableBase: number;
  totalPrice: number;
  unitMeasureId: number;
  unitPrice: number;
};

export type NCVentaDetallePost = Omit<
  NCVentaDetalleGet,
  'productCode' | 'productName' | 'availableQuantity' | 'totalAfterDiscount'
>;

export type NotaCreditoVentaGet = {
  authorizationNumber: string;
  branchId: number;
  branchName: string;
  cancellationDate: string | null;
  cancellationReason: string;
  clientId: number;
  clientIdentification: string;
  clientName: string;
  creditNoteId: number | null;
  creditNoteNumber: string;
  entryId: number | null;
  invoiceBalance: number;
  invoiceId: number;
  invoiceIssueDate: string;
  invoiceNumber: string;
  invoiceValue: number;
  issueDate: string;
  ncTypeId: number;
  observation: string;
  paymentMethodId: number;
  paymentMethodName: number;
  stateId: number;
  stateName: string;
  subtotal: number;
  subtotalNoTax: number;
  total: number;
  taxValue: number;
  voucherTypeCode: string;
  voucherTypeName: string;
  creationUserId: number;
  paymentMethodDiscount: number;
  paymentMethodDiscountPercentage: number;
  cashId: number | null;
};

export type NotaCreditoVentaPost = Omit<
  NotaCreditoVentaGet,
  | 'branchName'
  | 'paymentMethodName'
  | 'clientName'
  | 'clientIdentification'
  | 'stateName'
  | 'voucherTypeName'
  | 'invoiceBalance'
  | 'invoiceIssueDate'
  | 'invoiceNumber'
  | 'invoiceValue'
  | 'creationUserId'
  | 'cancellationDate'
>;

export type NotaCreditoPostType = {
  header: NotaCreditoVentaPost;
  details: NCVentaDetallePost[];
  taxes: ImpuestoDocumentoInterface[];
};

export type NotaCreditoGetType = {
  header: NotaCreditoVentaGet;
  details: NCVentaDetalleGet[];
  taxes: ImpuestoDocumentoInterface[];
};
