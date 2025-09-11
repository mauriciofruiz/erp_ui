export type OrdenProduccionMain = {
  creationUserId: number;
  modificationUserId: number;
  registrationDate: string;
  modificationDate: string;
  orderId: number;
  orderStatusId: number;
  requestId: number;
  requestNumber: number;
  orderDate: string;
  scheduledQuantity: number;
  producedQuantity: number;
  totalCost: number;
  startDate: string;
  endDate: string;
  totalCostMP: number;
  totalCostMO: number;
  totalCostCIF: number;
  orderNumber: string;
  observation: string;
  rawMaterialEntryId: number | null;
  workforceEntryId: number | null;
  cifEntryId: number | null;
  closingMPEntryId: number | null;
  hasTransfer: boolean;
};

export type OrderProducctionPost = {
  order: OrderPost;
  unitsProduced: UnitsProducedPost[];
  rawMaterials: RawMaterial[];
};

export type OrderPost = {
  orderId: number | null;
  orderStatusId: number;
  requestId: number;
  scheduledQuantity: number;
  producedQuantity: number;
  totalCost: number;
  startDate: string;
  endDate: string;
  orderNumber: string;
  observation: string;
  rawMaterialEntryId: number | null;
  workforceEntryId: number | null;
  cifEntryId: number | null;
  closingMPEntryId: number | null;
  hasTransfer: boolean;
  closingMOEntryId: number | null;
  closingCIFEntryId: number | null;
};

export type UnitsProducedPost = {
  orderProductId: number | null;
  requestDetailId: number;
  productId: number;
  productCode: string;
  productName: string;
  measurementUnitId: number;
  measurementUnitName: string;
  recipeId: number;
  requestId: number;
  quantity: number;
  quantityProduced: number;
  status: boolean;
  observation: string;
  unitPrice: number;
  totalCost: number;
  meters: string;
  weightKg: string;
  scrap: string;
  machine: string;
  blockDetail: string;
};

export type OrderProdByIdType = {
  order: OrderProd;
  unitsProduced: UnidadesProducidasType[];
  rawMaterials: RawMaterial[];
  labourData: LabourDaum[];
  indirectCosts: IndirectCost[];
};

export type OrderProd = {
  orderId: number;
  orderStatusId: number;
  requestId: number;
  orderDate: string;
  registrationDate: Date;
  scheduledQuantity: number;
  producedQuantity: number;
  totalCost: number;
  startDate: Date;
  endDate: Date;
  totalCostMP: any;
  totalCostMO: any;
  totalCostCIF: any;
  orderNumber: string;
  observation: string;
  branchRequestId: number;
  branchRequestName: string;
  branchProducesId: number;
  branchProducesName: string;
  requestNumber: number;
  rawMaterialEntryId: number | null;
  workforceEntryId: number | null;
  cifEntryId: number | null;
  closingMPEntryId: number | null;
  closingMOEntryId: number | null;
  closingCIFEntryId: number | null;
  hasTransfer: boolean;
};

export type UnidadesDetailsType = {
  unitsProduced: UnidadesProducidasType[];
  rawMaterials: RawMaterial[];
  labourData: LabourDaum[];
  indirectCosts: IndirectCost[];
};

export type UnidadesProducidasType = {
  orderProductId: number | null;
  creationUserId: number;
  modificationUserId: number;
  registrationDate: Date;
  modificationDate: Date;
  requestDetailId: number;
  productId: number;
  productCode: string;
  productName: string;
  measurementUnitId: number;
  measurementUnitName: string;
  recipeId: number;
  requestId: number;
  quantity: number;
  quantityProduced: number;
  status: boolean;
  observation?: string;
  unitPrice: number;
  totalCost: number;
  meters: string;
  weightKg: string;
  scrap: string;
  machine: string;
  blockDetail: string;
};

export type RawMaterial = {
  productId: number;
  productProductionId: number | null;
  productCode: string;
  recipeId: number | null;
  recipeName: string;
  quantityAvailable: number;
  quantityListedMaterial: number;
  quantityRequested: number;
  unitMeasure: string;
  unitCost: string;
  totalCost: string;
};

export type LabourDaum = {
  productProductionId: number | null;
  labourId: number;
  labourCode: string;
  recipeId: number | null;
  recipeName: string;
  producedQuantity: string;
  unitMeasure: string;
  unitCost: string;
  totalCost: string;
};

export type IndirectCost = {
  productProductionId: number | null;
  recipeId: number | null;
  cifId: number;
  cifCode: string;
  recipeName: string;
  producedQuantity: string;
  unitMeasure: string;
  unitCost: string;
  totalCost: string;
};

export interface QuantityType {
  unitsProduced: UnidadesProducidasType[];
  rawMaterials: RawMaterial[];
  labourData: LabourDaum[];
  indirectCosts: IndirectCost[];
}

export type CierreOrdenType = {
  orderId: number;
  branchId: number;
  orderStatusId: number;
  requestId: number;
  orderStatusName: string;
  orderDate: string;
  mpCost: number;
  moCost: number;
  cifCost: number;
  closingMPEntryId: number | null;
  closingMOEntryId: number | null;
  closingCIFEntryId: number | null;
};
