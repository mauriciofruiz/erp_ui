import { PersonType } from '../common';

export type ProveedorProductoType = {
  providerProductId: number | null;
  providerId: number | null;
  providerName: string;
  productId: number;
  productName: string;
  productCode: string;
  providerProductCode: string;
  tariffItem: string;
  releasePercentage: number;
  feePercentage: number;
  cost: number;
  checkIva: boolean;
  isActive: boolean;
  unitMeasureId: number | null;
};

export type ProveedorType = {
  accountId: number | undefined;
  advancePaymentBalance: number | undefined;
  bankAccountTypeId: number | undefined;
  bankCatalogId: number | undefined;
  creationUserId: number | undefined;
  creditAmount: number | undefined;
  creditDays: number | undefined;
  creditExpirationDate: null | undefined;
  creditSupportingDoc: null | undefined;
  expenseAccount: null;
  fiscalIdentificationId: number | undefined;
  fiscalTypeId: string | undefined;
  isCredit: boolean | undefined;
  isTransporter: boolean | undefined;
  modificationDate: null | undefined;
  modificationUserId: number | undefined;
  passiveAccount: null | undefined;
  paymentConditionId: number | undefined;
  paymentMethodId: string | undefined;
  paymentReference: null | undefined;
  personId: number | undefined;
  providerAddress2: null | undefined;
  providerBankAccountId: string | undefined;
  providerBankAccountNumber: string | undefined;
  providerBankAccountType: null | undefined;
  providerCellphone2: null | undefined;
  providerCheckName: string | undefined;
  providerCommercialName: string | undefined;
  providerContact: null | undefined;
  providerContactCellphone: null | undefined;
  providerContactEmail: null | undefined;
  providerContactPhone: null | undefined;
  providerContactPosition: null | undefined;
  providerEmail2: null | undefined;
  providerId: number | undefined;
  providerPhone2: null | undefined;
  registrationDate: null | undefined;
  providerStatus: boolean | undefined;
  providerTypeId: number | undefined;
  providerWebsite: null | undefined;
  sourceRetentionCode1: string | undefined;
  sourceRetentionId: number | undefined;
  specialContributor: null | undefined;
  vatRetentionCode1: string | undefined;
  vatRetentionId: number | undefined;
  warrantyAmount: null | undefined;
};

export interface AccountPayableStatus {
  detailAccountPayableStatus: DetailAccountStatus[];
  total1to30: number | undefined;
  total31to60: number | undefined;
  total61to90: number | undefined;
  total91more: number | undefined;
  totalAdvances: number | undefined;
  totalBalanceFee: number | undefined;
  totalInvoiceValue: number | undefined;
  totalPayable: number | undefined;
  totalQuotaValue: number | undefined;
}

export interface DetailAccountStatus {
  invoiceNumber: string;
  issueDateInvoice: string;
  dueDateInvoice: string;
  daysCredit: number;
  daysLate: number;
  invoiceValue: number;
  quotaValue: number;
  balanceFee: number;
}

export interface ProveederDataType {
  provider: ProveedorType;
  person: PersonType;
  accountPayableStatus: AccountPayableStatus;
  numberInvoices: number;
  provinceId: string;
  provinceName: string;
  cityId: number | undefined;
  cityName: string;
  parishName: string;
}

export interface ProveedorPostType {
  taxIdentificationTypeId: string;
  ivaRetentionId: number;
  bankCatalogId: number;
  incomeRetentionId: number;
  taxIdentificationId: number;
  accountId: number;
  providerTypeId: number;
  bankAccountTypeId: number;
  paymentConditionId: number;
  paymentCollectionFormId: string;
  providerIdentification: string;
  providerTradeName: string;
  providerAddress2: any;
  providerEmail2: any;
  providerCellphone2: any;
  providerPhone2: any;
  providerWebsite: any;
  providerContact: any;
  providerContactPosition: any;
  providerContactPhone: any;
  providerContactEmail: any;
  providerContactCellphone: any;
  providerCredit: boolean;
  providerCreditAmount: number;
  providerCreditDueDate: any;
  providerCreditDays: number;
  providerGuaranteeAmount: any;
  providerCreditDocument: any;
  providerBankAccountNumber: string;
  providerPaymentReference: any;
  providerAdvancePaymentBalance: number;
  providerCheckName: string;
  providerSpecialContribution: any;
  providerTransportation: boolean;
  providerIvaRetentionCode1: string;
  providerRegistrationDate: any;
  providerStatus: boolean;
  providerIncomeRetentionCode1: string;
  providerBankAccountId: string;
  providerBankAccountType: any;
  providerExpenseAccount: number;
}

export interface PersonProvType {
  personId?: number | null;
  contributorTypeId: string;
  countryId: number;
  parishId: number;
  maritalStatusId: number | null;
  genderId: number | null;
  taxIdentificationId: number;
  personIdentification: string;
  personName: string;
  personBirthDate: string | null;
  personAddress: string;
  personCellphone: string;
  personPhone: string;
  personEmail: string;
  isClient: boolean | null;
  isEmployee: boolean | null;
  isSupplier: boolean | null;
  personRegistrationDate: string | null;
  personResidenceNeighborhood: string;
  personResidenceCity: string | null;
  personResidenceParish: string | null;
  personResidenceSector: string | null;
}

export interface ProveedorPersonPostType {
  person: PersonProvType;
  provider: ProveedorPostType;
}
