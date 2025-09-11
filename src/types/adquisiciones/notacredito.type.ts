import { ImpuestoDocumentoInterface } from '../common';

export interface NotaCreditoProveedorSender {
  header: NotaCreditoProveedorResponse; // es la misma del get, no crear interfaces innecesarias
  taxes: ImpuestoDocumentoInterface[]; // ya se encuentra creada, ver correcto manejo en la factura proveedor
}

export type NotaCreditoMain = {
  id: number;
  creditNoteNumber: string;
  emmisionDate: Date;
  invoiceNumber: string;
  ncTypeId: number;
  ncTypeName: string;
  providerId: number;
  providerName: string;
  creditNoteValue: number;
  crossedValue: number;
  creditNoteStatusId: number;
  creditNoteStatusName: string;
};

export type NotaCreditoProveedorResponse = {
  creditNoteId: number | null;
  creditNoteNumber: string;
  entryId: number | null;
  reserveEntryId: number | null;
  branchId: number | null;
  branchName: string;
  issueDate: Date | null;
  authorizationNumber: string;
  paymentMethodId: string;
  paymentMethodName: string;
  invoiceId: number | null;
  invoiceNumber: string;
  invoiceIssueDate: Date | null;
  invoiceValue: number;
  invoiceBalance: number;
  providerId: number | null;
  providerName: string;
  providerIdentification: string;
  observation: string;
  stateId: number; // definir el estado inicial desde ComprobanteEstadoEnum con valor inicial de GENERADO
  stateName: string; // asignar los valores string desde el enum
  voucherTypeCode: string; // definir el estado inicial desde ComprobanteTypeEnum con valor inicial de NOTA_DE_CREDITO, este valor nunca variara
  voucherTypeName: string; // asignar los valores string desde el enum
  subtotal: number;
  subtotalNoTax: number;
  vat: number;
  total: number;
  ncTypeId: number; // definir el valor inicial desde un nuevo enum (crear) que se llamara TipoNotaCreditoEnum con valor inicial de DESCUENTO, revisar la tabla tba_tipo_nc en la bdd
  paymentTypeId: number | null; // definir el valor inicial desde un nuevo enum (crear) que se llamara FormaPagoEnum con valor inicial de EFECTIVO, revisar la tabla tba_formapagocobro en la bdd
  cancellationDate: Date | null;
  cancellationReason: string;
  creditNoteDetails: DetalleNCProveedorResponse[]; // You need to define this interface as well
  endDate: Date | null;
};

export interface DetalleNCProveedorResponse {
  detailId: number | null;
  creditNoteId: number | null;
  productId: number | null;
  productCode: string;
  providerProductCode: string;
  productName: string;
  availableQuantity: number;
  quantity: number;
  unitPrice: number;
  returnedQuantity: number;
  hasIva: boolean;
  taxRateId: number | null; // un valor de la tabla tarifa iva en la bdd, revisar correcto uso en factura proveedor
  taxValue: number;
  totalPrice: number;
  branchId: number | null;
  detailTypeId: number; // 1: inventario, 2: servicio // usar enum TipoDetalleFacturaEnum
  projectId: number | null;
  importOpeningId: number | null;
  groupId: number | null;
  providerId: number | null;
  clientId: number | null;
  cashId: number | null;
  employeeId: number | null;
  accountId: number | null;
  invoiceDetailId: number | null;
  invoiceAccountId: number | null;
  invoiceTotalPrice: number;
}
