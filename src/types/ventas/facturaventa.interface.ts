import {
  ExternalDocumentsIdsType,
  ImpuestoDocumentoInterface,
  RetencionGroupType,
} from '../common';
import { CobroFacturaInterface } from './cobro.interface';

export interface FacturaVentaMain {
  invoiceId: number;
  invoiceNumber: string;
  branchId: number;
  branchName: string;
  clientId: number;
  clientName: string;
  invoiceIssueDate: string; // LocalDateTime se mapea como string en TypeScript para luego ser manejado por alguna librería de fechas como moment.js
  baseIvaZero: number; // BigDecimal se mapea como number en TypeScript
  baseIva: number;
  totalTaxes: number;
  total: number;
  retentionValue: number;
  invoiceStatusId: number;
  invoiceStatusName: string;
  creationUserName: string;
  voucherTypeCode: string;
}

export interface FacturaVentaHeader {
  accessKey: string;
  authorizationNumber: string;
  balance: number;
  branchId: number | null;
  cancellationDate: Date | null;
  cancellationReason: string;
  cashId: number | null;
  categoryDiscount: number;
  chargedValue: number;
  clientAddress: string;
  clientCategoryId: number | null;
  clientCellphone: string;
  clientEmail: string;
  clientId: number | null;
  clientIdentification: string;
  clientName: string;
  creationUserId: number | null;
  description: string;
  discountPercentage: number;
  dueDate: Date;
  dueDays: number;
  entryId: number | null;
  invoiceId: number | null;
  invoiceNumber: string;
  invoiceStatusId: number;
  issueDate: Date;
  iva: number;
  ivaZero: number;
  modificationDate: Date;
  modificationUserId: number | null;
  paymentConditionId: number;
  paymentMethodDiscount: number;
  paymentMethodDiscountPercentage: number;
  paymentMethodId: string;
  promotionDiscount: number;
  registrationDate: Date;
  relatedDocumentId: number | null;
  relatedDocumentId2: number | null;
  retentionId: number | null;
  retentionValue: number;
  specialDiscount: number;
  subtotal: number;
  subtotalNoObjetoIva: number;
  subtotalAfterDiscount: number;
  taxSupportId: string;
  total: number;
  totalDiscount: number;
  totalToCharge: number;
  voucherTypeCode: string;
  hasCredit: boolean;
  creditValue: number;
  ncValue: number;
  ndValue: number;
  externalDocumentsId?: ExternalDocumentsFacturaClienteType;
}

export interface DetalleFacturaVentaInterface {
  id: string; // id de row
  accountId?: number | null;
  assetGroupId?: number | null;
  assetTypeId?: number | null;
  availableQuantity: number;
  branchId: number | null;
  cancelled?: boolean;
  cashId?: number | null;
  categoryDiscountPercentage: number;
  categoryDiscountValue: number;
  clientId: number | null;
  clientPrice: number;
  description: string;
  discountPercentage: number;
  discountValue: number;
  employeeId?: number | null;
  externalDocumentId?: number | null;
  extraDiscountPercentage: number;
  extraDiscountValue: number;
  groupId: number | null;
  hasIva: boolean;
  importOpeningId?: number | null;
  invoiceDetailId: number | null;
  invoiceId: number | null;
  paymentMethodDiscountPercentage: number;
  paymentMethodDiscountValue: number;
  productCode: string;
  productId: number | null;
  productName: string;
  projectId?: number | null;
  promotionDiscountPercentage: number;
  promotionDiscountValue: number;
  providerId?: number | null;
  quantity: number;
  retentionIVAId: number | null;
  retentionSourceId: number | null;
  returnedValue: number;
  returnedQuantity: number;
  specialDiscountPercentage: number;
  specialDiscountValue: number;
  taxableBase: number;
  taxRateId: number;
  taxValue: number;
  totalPrice: number;
  unitMeasureId: number | null;
  unitPrice: number;
}

export type FacturaVentaDto = {
  header: FacturaVentaHeader;
  details: DetalleFacturaVentaInterface[];
  retenciones: RetencionGroupType[];
  taxes: ImpuestoDocumentoInterface[];
  payments: CobroFacturaInterface[];
};

export type FacturaVentaForNC = Omit<
  FacturaVentaDto,
  'payments' | 'retenciones' | 'taxes'
>;

export type FacturasForRetencionType = {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  clientId: number;
  clientName: string;
  invoiceTotal: number;
  sourceBase: number;
  taxBase: number;
};

export type ExternalDocumentsFacturaClienteType = Omit<
  ExternalDocumentsIdsType,
  'invoiceIds' | 'paymentIds'
>;
