import { BodegaGetInterface } from '../inventario';

export interface ListaEmpaqueMainInterface {
  packingListId: number;
  importOpeningId: number;
  importCode: string;
  arrivalDate: Date;
  departureDate: Date;
  packingListStateId: number;
  packingListStateName: string;
  providerId: number;
  providerName: string;
}

export interface ListaEmpaqueSendInterface {
  packingListId: number | null;
  packingListStateId: number;
  importOpeningId: number;
  containerDimensionId: number;
  arrivalDate: Date;
  departureDate: Date;
  ship: string;
  shippingCompany: string;
  bl: string;
  blPathFile: string;
  policy: string;
  application: string;
  freeDays: number;
  containers: number;
  observation: string;
  warehouse: string;
  agent: string;
  numberOfInvoices: number;
}

export interface ListaEmpaqueGetInterface {
  packingListId: number | null;
  packingListStateId: number;
  importOpeningId: number | null;
  importCode: string;
  userId: number | null;
  userName: string;
  registrationDate: Date;
  numberOfInvoices: number;
  policy: string;
  providerId: number | null;
  personName: string;
  arrivalDate: Date | null;
  departureDate: Date | null;
  ship: string;
  shippingCompany: string;
  bl: string;
  blPathFile: string;
  warehouse: string;
  application: string;
  agent: string;
  numberContainers: number;
  containerDimensionId: number;
  freeDays: number;
  totalQuantity: number;
  multipleInvoice: boolean;
  observation: string;
  detailPackingList: DetalleListaEmpaqueGetInterface[];
}

export interface DetalleListaEmpaqueSendInterface {
  packingListDetailId: number | null;
  packingListId: number | null;
  branchId: number;
  containerNumber: number;
  quantity: number;
  container: string;
  transportValue: number;
  transportInvoice: string;
  purchaseOrderDetailId: number;
  observation: string;
  transportShift: Date;
  receptionDate: Date;
  transportProviderId: number | null;
  stevedoringValue: number;
  productId: number;
  isTransfered: boolean;
}

export interface DetalleListaEmpaqueGetInterface {
  packingListDetailId: number | null;
  packingListId: number | null;
  purchaseOrderDetailId: number | null;
  containerNumber: number;
  container: string;
  branchId: number;
  productId: number | null;
  productCode: string;
  productName: string;
  quantity: number;
  transportShift: Date;
  transportValue: number;
  transportProviderId: number | null;
  transportInvoice: string;
  transportProviderName: string;
  stevedoringValue: number;
  receptionDate: Date;
  observation: string;
  isTransfered: boolean;
}

export interface ListaEmpaquePackedSendInterface {
  header: ListaEmpaqueSendInterface;
  details: DetalleListaEmpaqueSendInterface[];
}

export interface ListaEmpaqueTransferencia {
  arrivalDate: Date;
  details: DetalleListaEmpaqueTransferencia[];
  openingImportCode: string;
  openingImportId: number;
  packingListId: number;
}

export interface DetalleListaEmpaqueTransferencia {
  branchId: number;
  branchName: string;
  containerName: string;
  containerNumber: number;
  packingListId: number;
  invoiceNumber: string;
  observation: string;
  warehouseList: BodegaGetInterface[];
}
