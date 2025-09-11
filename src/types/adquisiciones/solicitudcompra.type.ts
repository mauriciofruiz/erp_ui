export type SolicitudCompraType = {
  branchId: number;
  branchName: string;
  codUsrAprob: string;
  codUsrSend: string;
  codUsrAnula: string;
  dateApprovedSc: Date | null;
  dateCreationRequestPurchase: Date;
  dateModificationRequestPurchase: Date | null;
  dateRequiredRequestPurchase: Date | null;
  daysRequestSc: number | null;
  nameAdquisitionType: string;
  nickUser: string;
  obsRequestPurchase: string;
  reasonRequestId: number | null;
  reasonRequestPurchase: string;
  requestPurchaseId: number;
  stateRequestPurchaseId: number;
  stateRequestPurchaseName: string;
  transfer: number | null;
  typeAdquisitionId: number;
  typeAdquisitionName: string;
  typeRequestId: number;
  userId: number;
};

export type SolicitudCompraSendType = {
  branchId: number | null;
  codUsrAprob: string;
  codUsrSend: string;
  codUsrAnula: string;
  dateApprovedSc: Date | null;
  dateCreationRequestPurchase: Date | null;
  dateModificationRequestPurchase: Date | null;
  dateRequiredRequestPurchase: Date | string | null;
  daysRequestSc: number | null;
  obsRequestPurchase: string;
  reasonRequestId: number | null;
  reasonRequestPurchase: string | null;
  requestPurchaseId: number | null;
  stateRequestPurchaseId: number;
  transfer: boolean;
  typeAdquisitionId: number | null;
  typeRequestId: number | null;
  userId: number | null;
};

export type SolicitudCompraDetailSendType = {
  branchId: number | null;
  detailProductRequestPurchaseId: number | null;
  gestionadoDetailProduct: boolean | null;
  obsDetailRequestProduct: string;
  productId: number | null;
  quantityApprovedDetailProduct: number;
  quantityRequestDetailProduct: number;
  quantityTransferedDetail: number;
  requestProductPurchaseId: number | null;
  stateDetailRequestProduct: boolean;
  transfer: boolean;
};

export type SolicitudCompraDetailType = {
  branchId: number;
  detailProductRequestPurchaseId: number;
  gestionadoDetailProduct: boolean;
  obsDetailRequestProduct: string;
  productId: number;
  productName: string;
  productCode: string;
  quantityApprovedDetailProduct: number;
  quantityAvailableBranch: number;
  quantityRequestDetailProduct: number;
  quantityTransferedDetail: number;
  quantityManagedDetailProduct: number;
  requestProductPurchaseId: number;
  stateDetailRequestProduct: boolean;
  transfer: boolean;
  weight: number;
};

export type SolicitudCompraSaveType = {
  requestPurchase: SolicitudCompraSendType;
  requestPurchaseDetail: SolicitudCompraDetailSendType[];
};

export type EstadosSolicitudCompraType = {
  idEstadoSolicitud: number | null;
  nombreEstadoSolicitud: string;
};

export type TipoAdquisicionType = {
  requestTypeId: number | null;
  requestTypeRoleId: number;
  requestTypeBranchId: number;
  requestTypeName: string;
  requestTypeState: boolean;
};

export type TipoSolicitudCompraType = {
  idTipoSolicitud: number | null;
  nombreTipoSolicitud: string;
};

export type RazonSolicitudCompraType = {
  idRazonSolicitud: number | null;
  nombreRazonSolicitud: string;
  estadoRazonSolicitud: boolean;
};
