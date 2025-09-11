export type ManoObraType = {
    creationUserId?: number
    modificationUserId?: number
    registrationDate: string
    modificationDate: string
    labourId: number
    unitMeasureId: number
    labourName: string
    unitCostLabour: number
    labourCode: string
    expenseAccountCode: string
    deviationAccountCode?: string
    productCodeLabour?: string
    status: boolean
}
