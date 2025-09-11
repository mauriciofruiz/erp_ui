import { TransportistaGuiaInterface } from '../proveedores';

export interface TransferenciaInterface {
  list: ListTransEmpaque[];
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface ListTransEmpaque {
  transfer: Transferencia;
  packingList: PackingList;
}

export interface Transferencia {
  creationUserId: number;
  modificationUserId: number;
  registrationDate: string;
  modificationDate: string;
  transferId: number;
  logisticStateId: number;
  userId: number;
  transferDetail: string;
  warehouseOrigin: number;
  warehouseDestination: number;
  totalQuantity: number;
  transportCode: number;
  receptionDate: string;
  transferred: boolean;
  packingListId: number;
  purchaseRequestId: number | null;
  observation: string;
  referenceNumber: any;
  receiverUserId: number;
  canceledUserId: number;
  confirmUserId: number;
  cancellationDate: any;
  cancellationObservation: string;
  deliveryStateId: number;
  hasGuide: boolean;
}

export interface PackingList {
  packingListId: any;
  packingListStateId: any;
  importOpeningId: any;
  containerDimensionId: any;
  userId: any;
  creationDate: any;
  arrivalDate: any;
  departureDate: any;
  ship: any;
  shippingCompany: any;
  bl: any;
  blPathFile: any;
  policy: any;
  application: any;
  freeDays: any;
  containers: any;
  observation: any;
  warehouse: any;
  agent: any;
  numberOfInvoices: any;
}

export interface TransferenciaGet {
  creationUserId: number;
  modificationUserId: number;
  registrationDate: Date;
  modificationDate: string;
  transferId: number;
  userId: number;
  userNick: string;
  warehouseOriginId: number;
  warehouseOriginName: string;
  warehouseDestinationId: number;
  warehouseDestinationName: string;
  observation: string;
  logisticStateId: number;
  logisticStateName: string;
  receptionDate: Date;
  deliveryStateId: number;
  deliveryStateName: string;
  receiverUserId: number;
  canceledUserId: number;
  confirmUserId: number;
  cancellationObservation: string;
  packingListId: number | null;
  purchaseRequestId: number | null;
  containerNumber: number | null;
  transferDetailList: TransferDetailListGet[];
  hasGuide: boolean;
  addressTransporter: string;
  arrivalDate: string;
}

export interface TransferDetailListGet {
  creationUserId: number;
  modificationUserId: number;
  registrationDate: Date;
  modificationDate: string;
  detailTransferId: number;
  transferId: number;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  weight: number;
  packingListDetailId: any;
  supplyRequestDetailId: any;
  toBill: boolean;
  canceled: boolean;
  pendingQuantity: number;
  availableQuantity: number;
  isService: boolean;
}

export interface TransferDetailtGet {
  creationUserId: number;
  modificationUserId: number;
  registrationDate: string;
  modificationDate: string;
  detailTransferId: number;
  transferId: number;
  productId: number;
  quantity: number;
  weight: number;
  packingListDetailId: any;
  supplyRequestDetailId: any;
  toBill: boolean;
  canceled: boolean;
  quantityToDispatch: number;
}

export interface TransferenciaPost {
  logisticStateId: number;
  userId: number;
  transferDetail: string;
  warehouseOrigin: number;
  warehouseDestination: number;
  totalQuantity: number;
  transportCode: number;
  receptionDate: string;
  transferred: boolean;
  purchaseRequestId: number | null;
  observation: string;
  referenceNumber: number | null;
  finalReceptionDate: string;
  receiverUserId: number;
  canceledUserId: number;
  confirmUserId: number;
  cancellationDate: string;
  cancellationObservation: string;
  deliveryStateId: number;
  containerNumber: number | null;
  packingListId: number | null;
  transferDetailList: TransferDetailList[];
  transportista: TransportistaGuiaInterface;
  hasGuide: boolean;
  addressTransporter: string;
  arrivalDate: string;
}

export interface TransferDetailList {
  productId: number | null;
  quantity: number;
  weight: number;
  abasRequestCode: string;
  toBill: boolean;
  canceled: boolean;
  quantityToDispatch: number;
  detailTransferId: number | null;
}

export type TransferenciaSaveType = {
  requestPurchase: TransferenciaPost;
  requestPurchaseDetail: TransferDetailList[];
};
