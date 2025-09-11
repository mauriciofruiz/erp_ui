export type DepositoMainType = {
  depositId: number; // tba_deposito -> id_deposito
  issueDate: string; // tba_deposito -> fecha_contable
  documentNumber: string; // tba_deposito -> numero_referencia
  bankName: string; // tba_deposito -> id_banco -> tba_banco -> nombre_banco
  amount: number; // tba_deposito -> valor
  registrationDate: string; // tba_deposito -> fecha_creacion
  branchName: string; // tba_deposito -> id_sucursal -> tba_sucursal -> nombre_sucursal
  observation: string; // tba_deposito -> concepto
  statusName: string; // tba_deposito -> id_estadodeposito -> tba_estadodeposito -> nombre_estadodeposito
  typeId: number; // tba_deposito -> id_tipo_deposito
  typeName: string; // tba_deposito -> id_tipo_deposito -> tba_tipo_deposito -> nombre
};

export type DepositoPendienteDto = {
  pendingDepositId: number;
  paymentMethodId: string;
  closingCashId: number;
  cashId: number;
  cashName: string;
  closingCashDate: string;
  value: number;
  pendingValue: number;
  depositAmount: number;
  pendingValueStatic: number;
  numberDocument: string;
  depositDate: string;
};

export type DepositoPostDto = {
  depositId: number;
  depositTypeId: number;
  bankId: number;
  documentNumber: string;
  depositDate: string;
  branchId: number;
  depositAmount: number;
  depositDescription: string;
  depositMultiple: boolean;
  depositStatusId: number;
  motiveAnnulment: string;
  depositDetailList: DepositoDetallePost[];
};

export type DepositoDetallePost = {
  pendingDepositId: number;
  accountId: number;
  depositAmount: number;
  bankId: number;
  numberDocument: string;
  depositDate: string;
  employeeId: number;
  importOpeningId: number;
  proyectId: number;
  branchId: number;
  clientId: number;
  providerId: number;
};

export type DepositoGetDto = {
  depositId: number;
  depositTypeId: number;
  depositTypeName: string;
  bankId: number;
  bankName: string;
  documentNumber: string;
  userId: number;
  userName: string;
  branchId: number;
  branchName: string;
  depositAmount: number;
  depositDate: string;
  registerDate: string;
  depositDescription: string;
  depositStatusId: number;
  depositStatusName: string;
  entryId: number;
  depositDetailList: DepositoDetalleGetDto[];
};

export type DepositoDetalleGetDto = {
  depositDetailId: number;
  depositId: number;
  pendingDepositId: number;
  motiveDepositName: string;
  accountId: number;
  accountName: string;
  depositAmount: number;
  bankId: number;
  bankName: string;
  numberDocument: string;
  description: string;
  depositDate: Date;
  employeeId: number;
  employeeName: string;
  importOpeningId: number;
  proyectId: number;
  proyectName: string;
  branchId: number;
  branchName: string;
  clientId: number;
  clientName: string;
  providerId: number;
  providerName: string;
};

// export type RetencionPostPutType = {
//   retentionId?: number; // documento -> doc_id_documento
//   retentionNumber: string; // documento -> doc_numerodocumento
//   retentionDate: string; // documento -> doc_fechaemision
//   autorizationNumber: string; // documento -> doc_claveacceso
//   invoiceId: number; // documento -> doc_id_documento_relacionado
//   stateId: number; // documento -> doc_id_estadodocumento
//   clientId: number; // documento -> doc_idcliente
//   value: number; // documento -> doc_valor
//   voucherTypeCode: string; // documento -> doc_id_tipocomprobante
//   entryId?: number; // documento -> doc_id_asiento
//   branchId: number; // documento -> doc_id_sucursal
//   isPettyCash: boolean; // documento -> es_caja_chica
//   cancellationReason: string | null;
//   details: RetencionDetailPostPutType[];
// };

// export type RetencionDetailPostPutType = {
//   detailId?: number; // detalle_documento -> ded_id_detalle_documento
//   retentionId?: number; // detalle_documento -> ded_id_documento
//   sourceId?: number; // detalle_documento -> ded_id_retencionfuente
//   taxId?: number; // detalle_documento -> ded_id_retencioniva
//   base: number; // detalle_documento -> ded_baseimponible
//   value: number; // detalle_documento -> ded_total
// };

// export type RetencionGetType = Required<RetencionPostPutType> &
//   Omit<RetencionPostPutType, 'details'> & {
//     clientName: string;
//     details: RetencionDetailGetType[];
//   };

// export type RetencionDetailGetType = Required<RetencionDetailPostPutType> & {
//   retentionName: string;
// };
