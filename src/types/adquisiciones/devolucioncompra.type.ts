export type DevolucionCompraGetType = {
  devolutionPurchaseId: number | null;
  warehouseId: number;
  warehouseName?: string;
  branchId: number;
  branchName?: string;
  entryId: number | null;
  userId: number;
  userName?: string;
  devolutionDate: Date;
  devolutionDescription: string;
  devolutionDiscount: number;
  devolutionIva: number;
  devolutionSubtotal2: number;
  devolutionSubtotal: number;
  devolutionTotal: number;
  orderStateId: number;
  orderStateName?: string;
  providerId: number;
  providerName?: string;
  receptionPurchaseId: number;
};

export type DetailDevolucionCompraGetType = {
  devolutionDetailId: number | null;
  devolutionPurchaseId: number | null;
  branchId: number;
  branchName?: string;
  productId: number;
  productCode?: string;
  productName?: string;
  devolutionDetailDescription: string;
  returnedQuantity: number;
  devolutionCancelled: boolean;
  receivedReturnDetailCode: number;
  devolutionIva: number;
  devolutionTotal: number;
  devolutionValue: number;
  warehouseId: number;
};

export type DevolucionCompraPackeageSendType = {
  header: DevolucionCompraGetType;
  details: DetailDevolucionCompraGetType[];
};
