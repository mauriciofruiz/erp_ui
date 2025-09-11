export type ReembolsoPostPutType = {
  reimbursementId: number;
  fiscalIdType: string;
  voucherTypeId: string;
  reimbursementIdentification: string;
  reimbursementDocumentNumber: string;
  reimbursementDocumentAuthNumber: string;
  reimbursementDate: string;
  reimbursementIvaRate: number;
  reimbursementIvaAmount: number;
  reimbursementNonIvaRate: number;
  reimbursementCancelled: number;
  reimbursementZeroIvaRate: number;
  accountId: number;
  documentId: number;
  reimbursementTotal: number;
  taxRateId: number;
};
