export type EntryType = {
  entryId: number;
  entryState: string;
  userCreateId: number;
  userCreateName: string;
  userCancelId: number | null;
  userCancelName: string;
  movementType: string;
  entryType: string;
  branchName: string;
  entryDate: Date;
  accountingDate: Date;
  modificationDate: Date | null;
  observation: string;
  reference: string;
  totalDebit: number;
  totalAssets: number;
  modificationReason: string | null;
  cancellationReason: string | null;
  anulated: boolean;
};

export type EntryDetailsType = {
  detailEntryId: number;
  entryId: number;
  account: string;
  accountNumber: string;
  branchName: string;
  reference: string | null;
  debit: number;
  credit: number;
  importation: string;
  employee: string;
  client: string;
  provider: string;
  project: string;
  inventory: string;
  cash: string;
  tax: string;
  retention: string;
};

export interface EntryDtoInterface {
  entry: EntryType;
  details: EntryDetailsType[];
}
