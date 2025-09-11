import { FormState } from '@/hooks';
import { DetailOrdenCompraSendType, OrdenCompraSendType } from '@/types';
import { GridValidRowModel } from '@mui/x-data-grid';

export const setHeader = (
  formState: FormState,
  branchId: number
): OrdenCompraSendType => {
  return {
    purchaseOrderId: formState.orderId,
    stateOrderId: formState.stateOrderId,
    providerId: formState.providerId,
    branchId: branchId,
    observation: `${formState.personName} - LP ${formState.importOpeningCode}`,
    deliveryDate: formState.deliveryDate,
    subtotal: formState.subtotal,
    iva: 0,
    totalValue: formState.totalValue,
    isGeneral: false,
    motive: formState.motive ?? '',
    importationCodeId: formState.importOpeningId,
    freight: formState.internationalFreight,
    insurance: formState.insuranceValue,
    otherExpenses: formState.otherExpenses,
    incotermCode: formState.incotermId,
    invoiceNumber: formState.invoiceNumber,
    policyNumber: formState.policyNumber,
    applicationNumber: formState.applicationNumber,
    applicationValue: 0,
    premiumValue: formState.premiumValue,
    discount: 0,
    containerNumber: formState.containerNumber,
    freightValue: formState.freightValue,
    zeroSubtotal: 0,
    declare: true,
    advaloremFreight: formState.advaloremFreight,
    fodinfaFreight: formState.fodinfaFreight,
    advaloremValue: formState.subtototalAdvalorem,
    fodinfaValue: formState.subtototalFodinfa,
    orderListId: formState.orderListId,
  };
};

export const setDetails = (
  rows: readonly GridValidRowModel[]
): DetailOrdenCompraSendType[] => {
  return rows.map((row) => {
    return {
      detailPurchaseOrderId: row.detailOrderId,
      purchaseOrderId: row.purchaseOrderId,
      productId: row.productId,
      quantity: row.quantity,
      quantityReceived: 0,
      unitPrice: row.unitPrice,
      totalPrice: row.totalPrice,
      discountPercentage: 0,
      discountValue: 0,
      documentCode: row.documentCode,
      ivaValue: 0,
      hasIva: false,
      observation: '',
      status: row.status,
      prorrateValue: null,
      advaloremValue: row.advaloremValue,
      fodinfaValue: row.fodinfaValue,
    };
  });
};
