export interface DetailKardexViewInterface {
  id: number;
  date: Date;
  productCode: string;
  productName: string;
  movement: string;
  description: string;
  branch: string;
  warehouse: string;
  quantityEntry: number;
  costUnitEntry: number;
  costTotalEntry: number;
  quantityExit: number;
  costUnitExit: number;
  costTotalExit: number;
  quantityInventory: number;
  costUnitInventory: number;
  costTotalInventory: number;
  document: string;
}

export interface DetailKardexSearcherInterface {
  productId: number;
  branchId: number | null;
  warehouseId: number[] | null;
  movementTypeId: number[] | null;
  startDate: Date;
  endDate: Date;
}

export interface KardexViewInterface {
  productCode: string;
  productName: string;
  productGroup: string;
  quantityAvailable: number;
  averageCost: number;
}

export interface KardexMain {
  creationUserId: number;
  modificationUserId: number;
  registrationDate: Date;
  modificationDate: Date;
  id: number;
  date: Date;
  productCode: string;
  productName: string;
  movement: string;
  warehouse: string;
  quantityEntry?: number;
  costUnitEntry?: number;
  costTotalEntry?: number;
  quantityExit?: number;
  costUnitExit?: number;
  costTotalExit?: number;
  quantityInventory: number;
  costUnitInventory: number;
  costTotalInventory: number;
  document: string;
}
