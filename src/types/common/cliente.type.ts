import { CreditoClienteType } from "../ventas";
import { PersonType } from "./persona.type";

export type CategoriaClientePvpType = {
  categoryId: number;
  categoryName: string;
  discount: number;
  pvp: number;
};

export type ClientCategoryType = {
  clientCategoryId: number | null;
  clientCategoryName: string;
  clientCategoryDiscount: number;
  specialCategory: boolean;
  categoryActive: boolean;
};

export type ClienteType = {
  accountId?: number | null;
  billingAlert?: string;
  clientAddress2?: string;
  clientBalance?: number | null;
  clientCashInvoice?: boolean;
  clientCategoryId?: number | null;
  clientCellphone2?: string;
  clientChangeNumber?: number | null;
  clientCommercialName: string;
  clientContact?: string;
  clientContactCellphone?: string;
  clientContactEmail?: string;
  clientContactPhone?: string;
  clientContactPosition?: string;
  clientDiscount?: number | null;
  clientEmail2?: string;
  clientInactiveReason?: string;
  clientPhone2?: string;
  clientPolicy?: string;
  clientStatus?: boolean;
  clientUnlockCode?: string;
  collectionAlert?: string;
  discountExpirationDate?: Date | null;
  discountObservation?: string;
  fiscalIdentificationTypeId: string;
  generalAlert?: string;
  incomeOriginId?: number | null;
  ivaRetentionId?: number | null;
  personId?: number | null;
  salesUserId?: number | null;
  sourceRetentionId?: number | null;
  specialCategory?: string;
  specialDiscount?: number | null;
};

export interface ClientPersonCreditType {
  person: PersonType;
  client: ClienteType;
  credit: CreditoClienteType;
}

export interface ClientPersonCreditPostType {
  accountId?: number | null;
  authorizedCreditLimit?: number | null;
  availableCreditLimit?: number | null;
  billingAlert?: string;
  cityId?: number | null;
  clientAddress2?: string;
  clientBalance?: number | null;
  clientCashInvoice?: boolean;
  clientCategoryId?: number | null;
  clientCellphone2?: string;
  clientChangeNumber?: number | null;
  clientCommercialName: string;
  clientContact?: string;
  clientContactCellphone?: string;
  clientContactEmail?: string;
  clientContactPhone?: string;
  clientContactPosition?: string;
  clientDiscount?: number | null;
  clientEmail2?: string;
  clientId?: number | null;
  clientInactiveReason?: string;
  clientPhone2?: string;
  clientPolicy?: string;
  clientStatus?: boolean;
  clientUnlockCode?: string;
  collectionAlert?: string;
  contributorTypeId?: string | null;
  countryId?: number | null;
  creditClientId?: number | null;
  creditDays?: number | null;
  creditObservation: string;
  discountExpirationDate?: Date | null;
  discountObservation?: string;
  fiscalIdentificationTypeId?: string | null;
  genderId?: number | null;
  generalAlert?: string;
  guaranteeAmount?: number | null;
  guaranteeDate?: Date | null;
  incomeOriginId?: number | null;
  isClient: boolean;
  isEmployee: boolean;
  isSupplier: boolean;
  ivaRetentionId?: number | null;
  maritalStatusId?: number | null;
  modificationDate?: Date | null;
  overlimit?: number | null;
  overlimitExpirationDate?: Date | null;
  parishId?: number | null;
  personAddress: string;
  personBirthDate: Date | null;
  personCellphone: string;
  personEmail: string;
  personId?: number | null;
  personIdentification: string;
  personName: string;
  personPhone: string;
  personRegistrationDate: Date | null;
  personResidenceCity: string;
  personResidenceNeighborhood: string;
  personResidenceParish: string;
  personResidenceSector: string;
  provinceId?: number | null;
  registrationDate?: Date | null;
  salesUserId?: number | null;
  sourceRetentionId?: number | null;
  specialCategory?: string;
  specialDiscount?: number | null;
  taxIdentificationId?: number | null;
  usedCreditLimit?: number | null;
  plate?: string;
  exceptions?: ExcepcionClienteDescuentoPostType[];
  statementAccount: StatementAccountClientType;
}

export interface ExcepcionClienteDescuentoPostType {
  exceptionId: number | null;
  clientId: number;
  exceptionTypeId: number;
  parameterId: number;
  parameterValue: string;
  discountPortion: number;
  startDate: Date | null;
  endDate: Date | null;
  status: boolean;
}

export interface StatementAccountClientType {
  totalInvoiceValue: number;
  totalCurrent: number;
  totalBalanceFee: number;
  totalAdvances: number;
  totalOverdue: number;
  total1to30: number;
  total31to60: number;
  total61to90: number;
  total91more: number;
  detailAccountPayableStatus: DetailStatementAccountClientType[];
};

export interface DetailStatementAccountClientType {
  invoiceNumber: string;
  issueDateInvoice: string; 
  dueDateInvoice: string; 
  daysCredit: number;
  daysLate: number;
  invoiceValue: number;
  quotaValue: number;
  balanceFee: number;
};
