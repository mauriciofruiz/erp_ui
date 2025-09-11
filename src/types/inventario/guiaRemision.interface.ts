import { TransportistaGuiaInterface } from '../proveedores';

export interface GuiaMainInterface {
  documentId: number;
  documentNumber: string;
  issueDate: string;
  documentNumberOrigin: string;
  issueDateOrigin: string;
  documentTypeName: string;
  branchName: string;
  stateName: string;
}

export type RelatedDocumentsGuiaType = {
  documentId: number;
  issueDate: string;
  documentNumber: number;
  clientId: number;
  clientName: number;
  value: number;
};

export type DetailGuiaRemisionPostType = {
  documentId: number;
  documentDetailId: number;
  productId: number;
  productCode: string;
  productName: string;
  unitMeasureId: number;
  unitMeasureName: string;
  quantity: number;
  quantityToDispatch: number;
  quantityPending: number;
  quantityDispatched: number;
};

export type GuiaRemisionPostType = {
  documentId?: number;
  branchId: number;
  issueDate: string;
  documentNumber?: string;
  accessKey?: string;
  documentStatusId: number;
  clientId: number;
  transport: TransportistaGuiaInterface;
  startDate: string;
  endDate: string;
  address: string;
  relatedDocumentId: number | null;
  relatedDocumentId2: number | null;
  cancellationDate?: string;
  cancellationReason?: string;
  deliveryStateId: number;
  details: DetailGuiaRemisionPostType[];
};

export type GuiaRemisionGetType = Required<GuiaRemisionPostType> & {
  isTransfer: boolean;
  creationUserId: number;
  clientName: string;
};
