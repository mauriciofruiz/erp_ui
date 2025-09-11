export type tipoIngresoType = {
  accountId: number | null;
  editable: boolean;
  incomeTypeId: number | null;
  incomeTypeName: string | null;
  isCancelled: boolean;
  isContributable: boolean;
  isRole: boolean;
  priority: number | null;
  typeIngEgr?: tipoIngresoEgresoType[];
};

export type tipoIngresoEgresoType = {
  accountId: number | null;
  accountIngEgrId: number | null;
  accountIngEgrTypeCode: number | null;
  accountName: string | null;
  accountNumber: string | null;
  cancelled: boolean;
  isAdmin: boolean;
  isIncome: boolean;
  isProduction: boolean;
  isSale: boolean;
  name: string | null;
};
