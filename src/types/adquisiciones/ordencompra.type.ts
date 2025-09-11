import { ImpuestoDocumentoInterface } from '../common';

export type OrdenCompraGetType = {
  purchaseOrderId: number;
  stateOrderId: number;
  stateOrder: string;
  providerId: number;
  providerName: string;
  creationDate: Date;
  branchName: string;
  branchId: number;
  totalValue: number;
  deliveryDate: Date;
  warehouseId: number;
  observation: string;
  motive: string;
  importOpeningId: number | null;
  importOpeningCode: string;
  paymentConditionId: number;
  taxes: ImpuestoDocumentoInterface[];
};

export type DetailOrdenCompraGetType = {
  detailPurchaseOrderId: number;
  productId: number;
  productCode: number;
  productName: string;
  branchId: number;
  branchName: string;
  availableQuantity: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountPercentage: number;
  discountValue: number;
  hasIva: boolean;
  ivaValue: number;
  quantityReceived: number;
  purchaseOrderSelected: number;
  documentCode: string;
  observation: string;
  status: boolean;
  taxRateId: number;
  providerProductCode?: string;
  measurementUnitId: number;
};

export type OrdenCompraSendType = {
  purchaseOrderId: number | null;
  stateOrderId: number | null;
  providerId: number | null;
  branchId: number;
  warehouseId?: number | null;
  observation: string | null;
  deliveryDate: Date | null;
  subtotal: number | null;
  iva: number | null;
  totalValue: number | null;
  isGeneral: boolean;
  motive?: string | null;
  importationCodeId?: number | null;
  quotationNumber?: string | null;
  freight?: number | null;
  insurance?: number | null;
  otherExpenses?: number | null;
  incotermCode?: number | null;
  invoiceNumber?: string | null;
  policyNumber?: string | null;
  applicationNumber?: string | null;
  applicationValue?: number | null;
  premiumValue?: number | null;
  discount?: number | null;
  containerNumber?: number | null;
  dimension?: string | null;
  daiNumber?: string | null;
  davNumber?: string | null;
  freightValue?: number | null;
  zeroSubtotal: number | null;
  declare?: boolean | null;
  advaloremFreight?: number | null;
  fodinfaFreight?: number | null;
  advaloremValue?: number | null;
  fodinfaValue?: number | null;
  orderListId?: number | null;
  paymentConditionId?: number;
};

export type DetailOrdenCompraSendType = {
  detailPurchaseOrderId: number | null;
  purchaseOrderId: number | null;
  productId: number;
  branchId?: number;
  quantity: number;
  quantityReceived: number;
  unitPrice: number;
  totalPrice: number;
  discountPercentage: number;
  discountValue: number;
  documentCode: string;
  ivaValue: number;
  hasIva: boolean;
  observation: string;
  status: boolean;
  taxRateId?: number;
  prorrateValue?: number | null;
  advaloremValue?: number;
  fodinfaValue?: number;
};

export type OrdenCompraPackeageSendType = {
  purchaseOrder: OrdenCompraSendType;
  purchaseOrderDetail: DetailOrdenCompraSendType[];
  taxes: ImpuestoDocumentoInterface[];
};

export type DetailOrdenCompraSetType = {
  personId: number;
  requestPurchaseListId: number[];
};

export interface OrdenExteriorGetInterface {
  orderId: number | null;
  stateOrderId: number;
  orderListId: number | null;
  branchId: number | null;
  providerId: number | null;
  personName: string;
  providerIdentification: string;
  registrationDate: Date;
  applicationNumber: string;
  policyNumber: string;
  invoiceNumber: string;
  importOpeningId: number | null;
  importOpeningCode: string;
  incotermId: number;
  deliveryDate: Date | null;
  containerNumber: number;
  premiumValue: number;
  fodinfaFreight: number;
  advaloremFreight: number;
  freightValue: number;
  observation: string;
  internationalFreight: number;
  insuranceValue: number;
  otherExpenses: number;
  totalValue: number;
  detailPurchaseOrderImport: DetalleOrdenExteriorGetInterface[];
  subtotal: number;
  subtototalFodinfa: number;
  subtototalAdvalorem: number;
}

export interface DetalleOrdenExteriorGetInterface {
  detailOrderId: number | null;
  purchaseOrderId: number | null;
  documentCode: string;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  fodinfaValue: number;
  advaloremValue: number;
  unitMeasureId: number;
}
