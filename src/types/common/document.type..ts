export interface ImpuestoDocumentoInterface {
  taxId: number | null;
  documentId: number | null;
  documentTypeId: number | null;
  voucherId: number | null;
  taxPercentage: number;
  taxDescription: string;
  taxCode: string;
  accountId: number | null;
  taxBase: number;
  taxAmount: number;
  taxState: boolean;
}
