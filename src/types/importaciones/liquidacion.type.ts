export interface LiquidacionMainInterface {
  liquidationId: number;
  importOpeningId: number;
  importOpeningCode: string;
  invoiceNumber: string;
  liquidationState: number;
  liquidationStateName: string;
  creationUserId: number;
  modificationUserId: number;
  registrationDate: Date;
  modificationDate: Date;
}

export interface LiquidacionInterface {
  liquidationId: number | null;
  entryId: number | null;
  liquidationNumberLiquidation: string;
  observationLiquidation: string;
  importOpeningId: number | null;
  importOpeningCode?: string;
  importDate: Date | null;
  liquidationState: number;
  invoiceNumber: string;
  totalInvoice: number;
  applicationValue: number;
  fodinfa: number;
  adValorem: number;
  freightTransportOtherExpenses: number;
  stowageOtherExpenses: number;
  warehousingOtherExpenses: number;
  localExpensesOtherExpenses: number;
  custodyOtherExpenses: number;
  exonerationOtherExpenses: number;
  agentOtherExpenses: number;
  isdOtherExpenses: number;
  policyOtherExpenses: number;
  landTransportOtherExpenses: number;
  goodViewOtherExpenses: number;
  otherOtherExpenses: number;
  otherExpenses: number;
  totalImportCost: number;
  totalImport: number;
  creationUserId?: number | null;
  userName?: string;
  registrationDate?: Date;
  detail?: DetalleLiquidacionInterface[];
}

export interface DetalleLiquidacionInterface {
  detailLiquidationId: number | null;
  liquidationId: number | null;
  productId: number | null;
  productCode?: string;
  productName?: string;
  quantity: number;
  fobUnit: number;
  fob: number;
  fobPortion: number;
  policy: number;
  freight: number;
  cif: number;
  tariff: number;
  release: number;
  fodinfa: number;
  adValorem: number;
  iva: number;
  freightTransportOtherExpenses: number;
  stowageOtherExpenses: number;
  warehousingOtherExpenses: number;
  localExpensesOtherExpenses: number;
  custodyOtherExpenses: number;
  exonerationOtherExpenses: number;
  agentOtherExpenses: number;
  isdOtherExpenses: number;
  policyOtherExpenses: number;
  landTransportOtherExpenses: number;
  goodViewOtherExpenses: number;
  otherOtherExpenses: number;
  totalOtherExpenses: number;
  totalGeneral: number;
  cuWithoutIva: number;
  cuWithIva: number;
  totalCosts: number;
  pvp: number;
  profitCost: number;
}

export interface LiquidacionPackedInterface {
  header: LiquidacionInterface;
  details: DetalleLiquidacionInterface[];
  idFacturasAsignadas: number[];
}
