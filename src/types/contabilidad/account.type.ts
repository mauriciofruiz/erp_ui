export type AccountTreeNodeType = {
  id: number;
  name: string;
  accountNumber: string;
  parentAccountNumber: string;
  children: AccountTreeNodeType[];
};

export type AccountType = {
  accountId: number;
  userId: number;
  userName?: string;
  financialIndexId: number;
  financialIndexName?: string;
  accountTypeId: number;
  accountTypeName?: string;
  accountNumber: string;
  parentAccountNumber: string;
  accountName: string;
  accountDescription: string;
  initialBalance: number;
  manual: boolean;
  automatic: boolean;
  isLabor: boolean;
  hasFixedAsset: boolean;
  requiresProject: boolean;
  requiresEmployee: boolean;
  requiresDepartment: boolean;
  requiresImportation: boolean;
  requiresBranch: boolean;
  requiresInventory: boolean;
  requiresClient: boolean;
  requiresSupplier: boolean;
  requiresCash: boolean;
  creationDate: Date;
  modificationDate: Date | null;
  accountStatus: boolean;
};

export interface AccountSendInterface {
  accountDescription: string;
  accountId: number;
  accountName: string;
  accountNumber: string;
  accountStatus: boolean;
  accountTypeId: number;
  automatic: boolean;
  balance: number;
  creationDate: Date;
  financialIndexId: number;
  hasFixedAsset: boolean;
  initialBalance: number;
  isLabor: boolean;
  manual: boolean;
  modificationDate: Date | null;
  parentAccountNumber: string;
  requiresBranch: boolean;
  requiresCash: boolean;
  requiresClient: boolean;
  requiresDepartment: boolean;
  requiresEmployee: boolean;
  requiresImportation: boolean;
  requiresInventory: boolean;
  requiresProject: boolean;
  requiresSupplier: boolean;
  userId: number;
}

export type financialIndexType = Pick<
  AccountType,
  'financialIndexId' | 'financialIndexName'
>;
export type accountTypeType = Pick<
  AccountType,
  'accountTypeId' | 'accountTypeName' | 'accountDescription'
>;

export type AccountEgresoType = Pick<
  AccountType,
  'accountId' | 'accountTypeId' | 'accountNumber' | 'accountName'
> & {
  outflowTypeId: number;
};

// export type financialIndexType = {
//   financialIndexId: number;
//   financialIndexName: string;
// };

// export type accountTypeType = {
//   accountTypeId: number;
//   accountTypeName: string;
//   accountTypeDescription: string;
// };
