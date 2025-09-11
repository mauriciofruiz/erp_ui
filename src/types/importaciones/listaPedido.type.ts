import { ProveedorProductoType } from "../proveedores";

export type ListaPedidoType = {
    limit: number;
    list: List[];
    page: number;
    totalPages: number;
    totalRecords: number;
}

export type List = {
    creationDate: Date;
    importCode: null | string;
    importOpeningId: number | null;
    orderListId: number;
    providerId: number;
    providerName: string;
    stateId: number;
    stateName: string;
}

export type EstadoPedidoType = {
    stateId: number;
    stateName: string;
}

export interface ListaPedidoGet {
    orderList: OrderList;
    orderListDetail: OrderListDetailList[];
}

export type OrderList = {
    branchId: null;
    branchName: null;
    registrationDate: Date;
    deliveryDate: Date;
    detailOrderList: null;
    importOpeningCode: null;
    importOpeningId: null;
    loadingDate: Date;
    observation: string;
    providerId: number;
    providerIdentification: string;
    providerName: string;
    stateId: number;
    stateName: string;
    userId: number;
    userNick: string;
    plant: string;
    cancellationReason: string;
}

export type OrderListDetailList = {
    containerNumber: number;
    observation: null | string;
    productCode: string;
    productId: number;
    productName: string;
    quantity: number;
}

export type DetailPurchaseOrderListGet = {
    cancelled: boolean;
    containerNumber: number;
    detailOrderId: number;
    observation: string;
    orderListId: number;
    productId: number;
    quantity: number;
    quantityOC: null;
    unitsPerPallet: null;
}

export type ListaPedidoPostType = {
    stateId: number
    userId: number
    providerId: number
    branchId: number | null,
    creationDate: string
    loadingDate: string
    estimatedArrivalDate: string
    observation: string
    linkedToOC: boolean
    modifiedByUser: string
    testUser1: string
    testUser2: string
    modificationDate: string
    approvalDate: string
    importOpeningId: any
    packingList: number
    plant: string
    orderListDetail: DetailPurchaseOrderList[]
}

export type DetailPurchaseOrderList = {
    productId: number;
    quantity: number;
    unitsPerPallet: number | null;
    observation: string;
    quantityOC: number | null;
    containerNumber: number;
    cancelled: boolean;
    orderListId: number;
    detailOrderId: number;
}


export type PurchaseOrder = {
    detailPurchaseOrderList: DetailPurchaseOrderList[];
}


export interface RowModelProduct {
    id: number,
    productCode: ProductoUpdate,
    quantity: QuantityUpdate,
    observacion: ObservacionUpdate
}

export interface ProductoUpdate {
    [key: number]: ProveedorProductoType
}

interface QuantityUpdate {
    [key: number]: number;
}

interface ObservacionUpdate {
    [key: number]: string;
}


export type ListaPedidoMain = {
    registrationDate: Date;
    importCode: null | string;
    importOpeningId: number | null;
    orderListId: number;
    providerId: number;
    providerName: string;
    stateId: number;
    stateName: string;
}
