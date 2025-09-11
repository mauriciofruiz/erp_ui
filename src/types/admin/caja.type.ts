export type CajaGetType = {
    cashBoxId: number;
    accountId: number;
    branchId: number;
    cashBoxName: string;
    cashBoxNumber: number;
    cashBoxInvoiceSeq: number;
    cashBoxGuideSeq: number;
    cashBoxNcSeq: number;
    cashBoxNdSeq: number;
    cashBoxRetSeq: number;
    cashBoxState: boolean;
    cashBoxLiquidationSeq: number;
}

export type CajaPostType = {
    cashBoxId: number | null;
    accountId: number | null;
    branchId: number | null;
    cashBoxName: string;
    cashBoxNumber: number;
    cashBoxInvoiceSeq: number;
    cashBoxGuideSeq: number;
    cashBoxNcSeq: number;
    cashBoxNdSeq: number;
    cashBoxRetSeq: number;
    cashBoxState: boolean;
    cashBoxLiquidationSeq: number;
}