export interface RetencionGeneralInterface {
  retentionId: number;

  retentionTypeId: number;

  accountId: number | null;

  detail: string;

  percentageValue: number;

  percentageDescription: string;

  extraField: string;

  annexCode: string;

  isProvider: boolean;

  isClient: boolean;

  retentionState: boolean;
}

// export interface RetencionIVAInterface {
//   retentionIvaId: number;
//   accountId: number | null;
//   retentionIvaCode: string;
//   retentionIvaDescription: string;
//   retentionIvaPercentage: number;
//   canceledRetentionIva: boolean;
// }

export interface RetencionType {
  retentionId: number;
  retencionCode: string;
  retentionDetail: string;
  retentionPercentage: number;
  retentionType: string;
}

export interface RetencionGroupType {
  retentionId: number;
  retencionCode: string;
  retentionDetail: string;
  retentionType: string;
  retentionPercentage: number;
  base: number;
  monto: number;
  isControlled: boolean;
}

export interface RetencionMainInterface {
  retentionId: number;
  retentionNumber: string;
  retentionDate: string;
  branchName: string;
  providerName: string;
  invoiceNumber: string;
  state: string;
  email: string;
  stateSRI: number | null;
  value: number;
}

export interface RetencionResponseInterface {
  retentionId: number;
  retentionNumber: string;
  creationDate: string;
  providerName: string;
  providerIdentification: string;
  invoiceNumber: string;
  autorizationNumber: string;
  accessKey: string;
  details: RetencionDetailInterface[];
}

export interface RetencionDetailInterface {
  code: string;
  name: string;
  base: number;
  percentage: number;
  value: number;
  type: string;
}

export type RetencionMainType = {
  retentionId: number;
  retentionNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  ivaValue: number;
  sourceValue: number;
  totalValue: number;
  state: string;
};

export type RetencionPostPutType = {
  retentionId?: number; // documento -> doc_id_documento
  retentionNumber: string; // documento -> doc_numerodocumento
  retentionDate: string; // documento -> doc_fechaemision
  autorizationNumber: string; // documento -> doc_claveacceso
  invoiceId: number; // documento -> doc_id_documento_relacionado
  stateId: number; // documento -> doc_id_estadodocumento
  clientId: number; // documento -> doc_idcliente
  value: number; // documento -> doc_valor
  voucherTypeCode: string; // documento -> doc_id_tipocomprobante
  entryId?: number; // documento -> doc_id_asiento
  branchId: number; // documento -> doc_id_sucursal
  isPettyCash: boolean; // documento -> es_caja_chica
  cancellationReason: string | null;
  details: RetencionDetailPostPutType[];
};

export type RetencionDetailPostPutType = {
  detailId?: number; // detalle_documento -> ded_id_detalle_documento
  retentionId?: number; // detalle_documento -> ded_id_documento
  sourceId?: number; // detalle_documento -> ded_id_retencionfuente
  taxId?: number; // detalle_documento -> ded_id_retencioniva
  base: number; // detalle_documento -> ded_baseimponible
  value: number; // detalle_documento -> ded_total
};

export type RetencionGetType = Required<RetencionPostPutType> &
  Omit<RetencionPostPutType, 'details'> & {
    clientName: string;
    details: RetencionDetailGetType[];
  };

export type RetencionDetailGetType = Required<RetencionDetailPostPutType> & {
  retentionName: string;
};
