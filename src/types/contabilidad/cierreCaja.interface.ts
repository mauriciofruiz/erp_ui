export interface CierreCajaMainInterface {
  closingCashId: number;
  user: string;
  branch: string;
  createDate: string;
  closingDate: string;
  closingTotal: number;
  closingStatus: string;
}

export type CierrePostType = {
  closingCashId: number | null;
  cashId: number;
  initialAmount: number;
  finalAmount: number;
  openingDate: string;
  closingDate: string;
  isManual: boolean;
  closingStatusId: number;
  details: CierreDetailInterface[];
  egresos: EgresoInterface[];
};

export type CierreGetType = Required<CierrePostType> &
  Omit<CierrePostType, 'egresos'> & {
    creationUserId: number;
    egresos: EgresoGetInterface[];
    cashValue: number;
  };

export interface CierreDetailInterface {
  chargeDetailId: number | null;
  closingCashDetailId: number | null;
  closingCashId: number | null;
  paymentMethodId: string;
  cashDenominationId: number | null;
  quantity: number;
  amount: number;
  status: boolean;
  isPhysicallyChecked: boolean;
}

export type EgresoInterface = {
  accountId: number;
  amount: number;
  cashId: number;
  cashOutflowId: number | null;
  closingCashId: number | null;
  confirmationUserId: number | null;
  description: string;
  entryId: number | null;
  issueDate: string;
  outflowStatusId: number;
  outflowTypeId: number;
  packingListId: number | null;
  containerNumber: number | null;
};

export type EgresoGetInterface = Required<EgresoInterface> & {
  importOpeningCode: string;
  containerName: string;
};

export type ImportacionesEgresoType = {
  packingListId: number;
  importOpeningCode: string;
  containersList: ContenedorEgresoType[];
};

export type ContenedorEgresoType = {
  packingListId: number;
  importOpeningId: number;
  importOpeningCode: string;
  containerNumber: number;
  containerName: string;
  branchId: number;
};

export interface DenominacionEfectivoInterface {
  cashDenominationId: number;
  denomination: number;
  status: boolean;
}
