import {
  EstadoDocumentoEnum,
  ParametersEnum,
  TipoDetalleFacturaEnum,
} from '@/enums';
import { getPercentageValue } from '@/functions';
import {
  DetalleFacturaRequest,
  FacturaProveedorRequestInterface,
  RetencionType,
  SucursalType,
  TaxRateInterface,
  UserLoginType,
} from '@/types';
import { GridValidRowModel } from '@mui/x-data-grid';

export const setHeader = (
  formState: any,
  user: UserLoginType | null
): FacturaProveedorRequestInterface => {
  const valorRetencion =
    formState.providerInvoiceStatusId === EstadoDocumentoEnum.GENERADO
      ? 0
      : formState.providerInvoiceRetention;

  const totalAPagar = formState.providerInvoiceTotal - valorRetencion;
  return {
    ...formState,
    providerInvoiceId: formState.providerInvoiceId,
    entryId: formState.entryId,
    paymentMethodId:
      formState.paymentMethodId === '' ? null : formState.paymentMethodId,
    providerId: formState.providerId,
    userId: formState.userId ?? user?.userId,
    paymentConditionId: formState.paymentConditionId,
    paymentTypeId: formState.paymentTypeId,
    providerInvoiceStatusId: formState.providerInvoiceStatusId,
    branchId: formState.branchId ? formState.branchId : null,
    liquidationTypeId: formState.liquidationTypeId,
    voucherTypeCode: formState.voucherTypeCode,
    taxSupportId: formState.taxSupportId,
    providerInvoiceNumber: formState.providerInvoiceNumber,
    providerInvoiceAccessKey: formState.providerInvoiceAuthorizationNumber,
    providerInvoiceAuthorizationNumber:
      formState.providerInvoiceAuthorizationNumber,
    providerInvoiceIssueDate: formState.providerInvoiceIssueDate,
    providerInvoiceDueDate: formState.providerInvoiceDueDate,
    providerInvoiceDescription: formState.observation,
    providerInvoiceSubtotal: formState.providerInvoiceSubtotal,
    providerInvoiceVAT: formState.providerInvoiceVAT,
    providerInvoiceSubtotal2: formState.providerInvoiceSubtotal2,
    providerInvoiceVAT2: formState.providerInvoiceVAT2,
    providerInvoiceTotal: formState.providerInvoiceTotal,
    providerInvoiceToPay: totalAPagar,
    providerInvoiceRetention: valorRetencion,
    providerInvoicePaymentDays: formState.creditDays,
    providerInvoiceDiscount: formState.providerInvoiceDiscount,
    providerRetentionId: formState.providerRetentionId ?? null,
    registrationDate: formState.registrationDate ?? null,
    modificationDate: formState.modificationDate ?? null,
    creationUserId: formState.creationUserId ?? null,
    modificationUserId: formState.modificationUserId ?? null,
    cancellationReason: formState.providerInvoiceCancellationReason
      ? formState.providerInvoiceCancellationReason.toUpperCase()
      : null,
    importOpeningId: formState.importOpeningId,
  };
};

export const setDetails = (
  rows: readonly GridValidRowModel[],
  branches: SucursalType[],
  branchId: number | null,
  providerId: number | null,
  impuestos: TaxRateInterface[]
): DetalleFacturaRequest[] => {
  return rows
    .filter((row) => row.productId && row.productId !== null)
    .map((row) => {
      const selectedBranchId: number = row.branchName
        ? branches.find((sucursal) => sucursal.name === row.branchName)
            ?.branchId || 0
        : branchId || 0;

      const retentionIVAId = row.retentions.find(
        (retention: RetencionType) =>
          retention.retentionType === ParametersEnum.RETENCION_IVA_PARAMETER
      )?.retentionId;

      const retentionSourceId = row.retentions.find(
        (retention: RetencionType) =>
          retention.retentionType === ParametersEnum.RETENCION_FUENTE_PARAMETER
      )?.retentionId;

      const ivaPercetage = impuestos.find(
        (tax) => tax.taxRateId === row.taxRateId
      ) ?? { taxRatePercentage: 0 };

      return {
        providerInvoiceDetailId: row.detailId ?? null,
        providerInvoiceId: row.providerInvoiceId ?? null,
        productId:
          row.detailTypeId === TipoDetalleFacturaEnum.INVENTARIO
            ? row.productId
            : null,
        branchId: selectedBranchId,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
        totalPrice: row.totalPrice,
        isTaxCredit: row.isTaxCredit,
        cancelled: !row.status,
        discount: row.discount,
        employeeId: row.employeeId,
        accountId:
          row.detailTypeId === TipoDetalleFacturaEnum.SERVICIOS
            ? row.productId
            : null,
        hasIva: row.hasIva,
        taxValue: getPercentageValue(
          row.totalPrice,
          ivaPercetage.taxRatePercentage
        ),
        retentionIVAId: retentionIVAId,
        retentionSourceId: retentionSourceId,
        externalDocumentId: row.externalDocumentId,
        additionalCode: row.providerProductCode,
        taxRateId: row.taxRateId,
        projectId: row.projectId,
        groupId: row.groupId,
        providerId: row.providerId !== null ? row.providerId : providerId,
        clientId: row.clientId,
        cashId: row.cashId,
        unitMeasureId: row.unitMeasureId,
        importOpeningId: row.importOpeningId,
      };
    });
};
