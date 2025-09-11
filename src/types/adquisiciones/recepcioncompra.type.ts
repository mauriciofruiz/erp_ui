export type RecepcionCompraGetType = {
  receptionPurchaseId: number;
  receptionStateId: number;
  receptionStateName: string;
  invoiceId: number;
  invoiceNumber: string;
  providerId: number;
  personName: string;
  userId: number;
  userName: string;
  creationDate: Date;
  receptionDate: Date | null;
  branchName: string;
  branchId: number;
  warehouseId: number | null;
  warehouseName: string;
  documents: string;
  origin: string;
  transport: string;
  receivedBy: string;
  deliveredBy: string;
  observation: string;
  motive: string;
};

export type DetailRecepcionCompraGetType = {
  detailReceptionProductId: number;
  receptionPurchaseId: number;
  productId: number;
  productCode: number;
  productName: string;
  branchId: number;
  branchName: string;
  requestedQuantity: number;
  receivedQuantity: number;
  toReceiveQuantity: number;
  pendingQuantity: number;
  price: number;
  detailPurchaseOrderId: number;
  returnedQuantity: number;
};

export type RecepcionCompraSendType = {
  adjustmentCode: number;
  branchId: number;
  canceledEntryCode: string;
  creationDate: Date;
  deliveredBy: string;
  documents: string;
  isInvoiced: boolean;
  motive: string;
  observation: string;
  origin: string;
  receivedBy: string;
  receptionDate: Date | null;
  receptionPurchaseId: number | null;
  receptionStateId: number;
  transport: string;
  userId: number;
  warehouseId: number | null;
};

export type DetailRecepcionCompraSendType = {
  detailReceptionProductId: number | null;
  branchId: number;
  productId: number;
  receptionPurchaseId: number | null;
  requestedQuantity: number;
  receivedQuantity: number;
  pendingQuantity: number;
  price: number;
  detailOrderId: number;
  returnedQuantity: number;
};

export type RecepcionCompraPackeageSendType = {
  receptionPurchase: RecepcionCompraSendType;
  receptionPurchaseDetails: DetailRecepcionCompraSendType[];
};
