export type OrdenPedidoList = {
    creationUserId: number;
    modificationUserId: number;
    registrationDate: Date;
    modificationDate: Date;
    requestId: number;
    userId: number;
    productionStatusId: number;
    totalQuantity: number;
    startDate: Date;
    endDate: Date;
    producedQuantity: number;
    requestNumber: number;
    observation: string;
    reasonCancel: string;
    productionEndDate: Date;
    branchRequestId: number;
    branchProducesId: number;
    userName: string;
}


export type OrdenPedidoGet = {
    creationUserId: any
    modificationUserId: any
    registrationDate: Date
    modificationDate: Date
    requestId: number
    userId: number
    productionStatusId: number
    totalQuantity: number
    startDate: Date
    endDate: Date
    producedQuantity: number
    requestNumber: number
    observation: string
    reasonCancel: string
    productionEndDate: Date
    branchRequestId: number
    branchProducesId: number
    userName: string
    detailRequestList: DetailRequestListGet[]
}

export type DetailRequestListGet = {
    creationUserId: number
    modificationUserId: number
    registrationDate: Date
    modificationDate: Date
    requestDetailId: number
    productId: number
    productCode: string
    productName: string
    recipeId: any
    requestId: number
    quantity: number
    quantityProduced: number
    status: boolean
    observation: any
}


export interface OrdenPedidoPost {
    userId: number
    productionStatusId: number
    totalQuantity: number
    startDate: string
    endDate: string
    producedQuantity: number
    requestNumber: number
    observation: string
    reasonCancel: string
    productionEndDate: Date | null
    branchRequestId: number | null
    branchProducesId: number
    requestDetailList: RequestDetailListPost[]
}

export interface RequestDetailListPost {
    requestDetailId: any | null
    productId: number
    recipeId?: number | null
    requestId: any | null
    quantity: number | null
    quantityProduced: number
    status: boolean
    observation: string
}
