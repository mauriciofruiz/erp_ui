export interface RecetaGetType {
    limit: number;
    list: ListReceta[];
    page: number;
    totalPages: number;
    totalRecords: number;
}

export interface ListReceta {
    cost: number;
    creationUserId: number;
    detailRecipe: null;
    instructions: string;
    modificationDate: null;
    modificationUserId: null;
    observation: string;
    productCode: string;
    productId: number;
    productName: string;
    recipeId: number;
    registrationDate: Date;
    state: boolean;
    userId: number;
    userName: string;
    userNick: string;
}


export interface RecetaPostType {
    recipe: RecipePost
    detailRecipe: DetailRecipePost[]
}

export interface RecipePost {
    recipeId: number
    productId: number
    userId: number
    registrationDate: string
    cost: number
    instructions: string
    observation: string
    state: boolean
    //detailRecipe: DetailRecipePost[]
}

export interface DetailRecipePost {
    productId: number
    labourId: number
    cifId: number
    costTypeId: number
    unitMeasureId: number
    recipeName: string
    quantityRecipe: number
    unitCostRecipe: number
    totalCostRecipe: number
    recipeCode: string
    stateRecipe: boolean
    detailRecipeId: number
}

export interface RecetaGetIdType {
    creationUserId: any
    modificationUserId: any
    measurementUnitId: number
    measurementUnitName: string,
    registrationDate: string
    modificationDate: any
    recipeId: number
    productId: number
    productName: string
    productCode: string
    groupId: number,
    userId: number
    userName: string
    userNick: string
    cost: number
    instructions: string
    observation: string
    state: boolean
    detailRecipe: DetailRecipeTypeId[]
}

export interface DetailRecipeTypeId {
    creationUserId: any
    modificationUserId: number
    registrationDate: any
    modificationDate: string
    detailRecipeId: any
    productId: number
    productName: string
    productCode: string
    cifId: any
    cifName: any
    cifCode: string
    costTypeId: number
    costTypeName: string
    recipeId: any
    unitMeasureId: number
    measurementUnitName: string
    labourId: any
    labourName: any
    labourCode: string
    recipeName: string
    quantityRecipe: number
    unitCostRecipe: number
    totalCostRecipe: number
    recipeCode: string
    stateRecipe: boolean
}