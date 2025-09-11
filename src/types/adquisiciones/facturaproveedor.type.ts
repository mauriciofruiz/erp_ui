import {
  ExternalDocumentsIdsType,
  ImpuestoDocumentoInterface,
  RetencionGroupType,
} from '../common';
import { OrdenCompraGetType } from './ordencompra.type';
import { ReembolsoPostPutType } from './reembolso.type';

export interface FacturaProveedorMainInterface {
  baseIva: number;
  baseIvaZero: number;
  branchId: number;
  branchName: string;
  providerId: number;
  providerInvoiceId: number;
  providerInvoiceIssueDate: Date | null;
  providerInvoiceNumber: string;
  registrationDate: Date | null;
  providerInvoiceStatusId: number;
  providerInvoiceStatusName: string;
  providerName: string;
  total: number;
  totalTaxes: number;
  userId: number;
  userName: string;
  voucherTypeCode: string;
}

// * * * * * * * * * RESPONSE INTERFACES * * * * * * * * * * * * * * * *
export interface FacturaProveedorResponseInterface {
  providerInvoiceId: number | null;
  providerInvoiceNumber: string;
  entryId: number | null;
  branchId: number | null;
  branchName: string;
  providerInvoiceAuthorizationNumber: string;
  paymentConditionId: number;
  paymentConditionName: string;
  creditDays: number;
  contributorTypeId: string;
  contributorTypeName: string;
  providerId: number;
  providerName: string;
  providerIdentification: string;
  personId: number;
  personName: string;
  paymentMethodId: string;
  paymentMethodName: string;
  providerInvoiceIssueDate: Date | null;
  providerInvoiceRegistrationDate: Date | null;
  providerInvoiceDueDate: Date | null;
  providerInvoiceSubtotal: number;
  providerInvoiceSubtotal2: number;
  totalTaxes: number;
  providerInvoiceTotal: number;
  providerInvoiceStatusId: number | null;
  providerInvoiceStatusName: string;
  userId: number;
  userName: string;
  voucherTypeCode: string;
  voucherTypeName: string;
  paymentTypeId: number;
  paymentTypeName: string;
  liquidationTypeId: number;
  liquidationTypeName: string;
  taxSupportId: string;
  taxSupportName: string;
  retentionId: number | null;
  retentionNumber: string;
  retentionSourceId: number | null;
  retentionIVAId: number | null;
  observation: string;
  relatedDocumentId2: number | null;
  relatedDocumentId: number | null;
  providerInvoiceVAT: number;
  providerInvoiceVAT2: number;
  providerInvoiceToPay: number;
  providerInvoiceRetention: number;
  providerInvoiceDiscount: number;
  registrationDate: Date | null;
  modificationDate: Date | null;
  creationUserId: number | null;
  modificationUserId: number | null;
  details: DetalleFacturaProveedorResponseInterface[];
  purchaseOrderList: OrdenCompraGetType[];
  isForeign: boolean;
  importOpeningId: number | null;
  importOpeningCode: string;
  hasOrder: boolean;
  reserveEntryId: number | null;
  extraEntryId: number | null;
  cardAccountId: number | null;
  balance?: number;
  ncValue: number;
  ndValue: number;
  paidValue: number;
  externalDocumentsId: ExternalDocumentsFacturaProveedorType;
}

export type ExternalDocumentsFacturaProveedorType = Omit<
  ExternalDocumentsIdsType,
  'invoiceIds' | 'chargeIds'
>;

export interface DetalleFacturaProveedorResponseInterface {
  detailId: number | null;
  providerInvoiceId: number | null;
  productId: number | null;
  productCode: string;
  providerProductCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  priceWithoutTax: number;
  hasIva: boolean;
  taxRateId: number;
  taxValue: number;
  totalPrice: number;
  isTaxCredit: boolean;
  retentionSourceId: number | null;
  retentionIVAId: number | null;
  branchId: number | null;
  employeeId: number | null;
  detailTypeId: number | null;
  projectId: number | null;
  groupId: number | null;
  providerId: number | null;
  clientId: number | null;
  cashId: number | null;
  unitMeasureId: number | null;
  importOpeningId: number | null;
  availableQuantity?: number;
  returnedValue?: number;
  unitPriceDiscount?: number;
  taxableBase: number;
}

// * * * * * * * * * REQUEST INTERFACES * * * * * * * * * * * * * * * *
export interface FacturaProveedorRequestInterface {
  providerInvoiceId: number | null;
  entryId: number | null;
  paymentMethodId: string;
  providerId: number;
  paymentConditionId: number;
  paymentTypeId: number;
  providerInvoiceStatusId: number;
  branchId: number | null;
  liquidationTypeId: number;
  voucherTypeCode: string;
  taxSupportId: string;
  providerInvoiceNumber: string;
  providerInvoiceAccessKey: string;
  providerInvoiceAuthorizationNumber: string;
  providerInvoiceIssueDate: Date | null;
  providerInvoiceDueDate: Date | null;
  providerInvoiceDescription: string;
  providerInvoiceSubtotal: number;
  providerInvoiceVAT: number;
  providerInvoiceSubtotal2: number;
  providerInvoiceVAT2: number;
  providerInvoiceTotal: number;
  providerInvoiceToPay: number;
  providerInvoiceRetention: number;
  relatedDocumentId2?: number;
  providerInvoiceCancellationReason: string;
  providerInvoiceImportCode?: string;
  providerInvoicePaymentDays: number;
  providerInvoiceDiscount: number;
  documentTypeId?: number;
  providerInvoiceBalance?: number;
  relatedDocumentId?: number;
  providerRetentionId: number | null;
  registrationDate: Date | null;
  modificationDate: Date | null;
  creationUserId: number;
  modificationUserId: number;
  importOpeningId: number | null;
  hasOrder: boolean;
  reserveEntryId: number | null;
  extraEntryId: number | null;
  cardAccountId: number | null;
}

export interface DetalleFacturaRequest {
  providerInvoiceDetailId: number | null;
  providerInvoiceId: number | null;
  productId: number;
  branchId: number;
  quantity: number;
  unitPrice: number;
  taxValue?: number;
  totalPrice: number;
  isTaxCredit: boolean;
  externalDocumentId: number | null;
  fobPercentage?: number;
  importValue?: number;
  importOpeningId?: number | null;
  cancelled: boolean;
  discount: number;
  employeeId: number;
  accountId: number;
  buyTypeGnrlId?: number;
  assetGroupId?: number;
  assetTypeId?: number;
  description?: string;
  returnedValue?: number;
  registerAsset?: boolean;
  projectId?: number;
  hasIva: boolean;
  retentionIVAId: number;
  retentionSourceId: number;
  additionalCode?: string;
  groupId?: number;
  taxRateId: number;
  providerId?: number;
  clientId?: number;
  cashId?: number;
  unitMeasureId?: number;
}

export interface FacturaProveedorSender {
  header: FacturaProveedorRequestInterface;
  details: DetalleFacturaRequest[];
  retenciones: RetencionGroupType[];
  taxes: ImpuestoDocumentoInterface[];
  reimbursement: ReembolsoPostPutType[];
}

export interface FacturaProveedorResumeInterface {
  id: number;
  invoicenumber: string;
  providername: string;
  memo: string;
  subtotal: number;
}
