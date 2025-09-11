export type PaginatedResponseType = {
  limit: number;
  list: any[];
  page: number;
  totalPages: number;
  totalRecords: number;
};

export type CardType = {
  id: number;
  content: React.ReactNode;
};

export type ParishTransactionType = {
  cityId: number;
  parishCode: string;
  parishId: number | null;
  parishName: string;
};

export type ProvinceCityType = {
  cityCode: string;
  cityName: string;
  provinceId: number | null;
  provinceName: string;
};

export type MaritalStatusType = {
  maritalStatusId: number | null;
  maritalStatusName: string;
  maritalStatusCode: string;
};

export type BloodType = {
  bloodTypeId: number | null;
  bloodTypeName: string;
};

export type GenderType = {
  genderId: number | null;
  genderName: string;
  genderCode: string;
};

export type EducationLevelType = {
  educationLevelId: number | null;
  educationLevelName: string;
};

export type DriverLicenseType = {
  drivingLicenseTypeId: number;
  drivingLicenseTypeName: string;
  drivingLicenseTypeDescription: string;
};

export type DisabilityType = {
  disabilityId: number;
  disabilityName: string;
};

export type RelationshipType = {
  relationshipId: number;
  relationshipName: string;
  isFamilyDependency: boolean;
};

export type BankCatalogType = {
  bankCatalogId: number | null;
  bankCatalogName: string;
  bankCatalogCode: string;
};

export type BankAccountType = {
  accountTypeId: number | null;
  accountTypeName: string;
  accountTypeMnemonic: string;
};

export type DepartmentType = {
  departmentId: number | null;
  departmentName: string;
  departmentStatus: boolean;
  areaGroupId: number;
};

export type PositionType = {
  positionId: number | null;
  departmentId: number | null;
  positionName: string;
  positionState: boolean;
};

export type ContractModeType = {
  contractTypeId: number | null;
  contractTypeName: string;
};

export type ContractModalityType = {
  contractModalityId: number | null;
  contractModalityName: string;
};

export type BitacoraType = {
  logId: number;
  userId: number;
  userName: string;
  identifier: number;
  table: string;
  field: string;
  oldValue: string;
  newValue: string;
  date: Date;
  deviceIp: string;
  deviceName: string;
};

export interface TaxSupportInterface {
  taxSupportId: string;
  taxSupportName: string;
}

export interface VoucherTypeInterface {
  voucherTypeId: number;
  voucherTypeName: string;
  voucherTypeCode: string;
}
export type RegimenFiscalType = {
  fiscalIdentificationTypeId: string;
  fiscalIdentificationTypeName: string;
  fiscalIdentificationTypeTransaction: string;
};

export type PaisType = {
  countryCode: string;
  countryId: number;
  countryName: string;
};

export type ParroquiaType = {
  cityId: number;
  parishCode: string;
  parishId: number;
  parishName: string;
};

export type ProvinceType = {
  countryId: number;
  provinceId: string;
  provinceName: string;
  regionCode: number;
};

export type CityType = {
  cityCode: string;
  cityId: number;
  cityName: string;
  provinceId: string;
};

export type TipoContribuyenteType = {
  contributorTypeCode: string;
  contributorTypeId: string;
  contributorTypeName: string;
};

export interface BankType {
  bankCatalogCode: string;
  bankCatalogId: number | null;
  bankCatalogName: string;
  bankStatus: boolean;
}

export type BancoType = {
  bankId: number | null;
  accountId: number | null;
  bankAccountTypeId: number | null;
  bankName: string;
  bankAccountNumber: string;
  availableBalance: number | null;
  accountBalance: number | null;
  bankContact: string;
  bankContactTitle: string;
  bankContactPhone: string;
  printedCheckNumber: number | null;
  lastCheckNumber: number | null;
  isPettyCash: boolean;
  bankState: boolean;
  recoveredCheck: string;
  depositText: string;
  cardText: string;
  initialBalance: number | null;
  branchId: number | null;
};

export type ListBancosType = {
  accountBalance: number;
  accountId: number;
  availableBalance: number;
  bankAccountNumber: null | string;
  bankAccountTypeId: number;
  bankContact: null;
  bankContactPhone: null;
  bankContactTitle: null;
  bankId: number;
  bankName: string;
  bankState: boolean;
  cardText: null | string;
  depositText: null | string;
  initialBalance: number;
  isPettyCash: boolean;
  lastCheckNumber: number | null;
  printedCheckNumber: number | null;
  recoveredCheck: null;
};

export type TipoCuentaType = {
  accountTypeId: number;
  accountTypeMnemonic: string;
  accountTypeName: string;
};

export type FormaDePagoType = {
  paymentCollectionMethodAlias: string;
  paymentCollectionMethodCode: string;
  paymentCollectionMethodDiscount: number;
  paymentCollectionMethodId: string;
  paymentCollectionMethodName: string;
  paymentCollectionMethodStatus: boolean;
};

export type IdentificacionFiscalType = {
  atsIdentificationCode: string;
  taxIdentificationCode: string;
  taxIdentificationId: number;
  taxIdentificationName: string;
};

export interface TaxRateInterface {
  creationUserId: number | null;
  modificationDate: Date | null;
  modificationUserId: number | null;
  purchaseAccountId: number | null;
  registrationDate: Date | null;
  saleAccountId: number | null;
  taxDescription: string;
  taxRateCode: string;
  taxRateId: number | null;
  taxRatePercentage: number;
  taxRateState: boolean;
}

export interface RoleInterface {
  roleId: number | null;
  roleName: string;
  roleDescription: string;
  roleStartTime: string;
  roleEndTime: string;
  roleTime: number;
  creationUserId: number | null;
  modificationDate: Date | null;
  modificationUserId: number | null;
  registrationDate: Date | null;
}

export interface PeriodInterface {
  closingPeriodDate: Date | string;
  creationUserId: number | null;
  modificationDate: number | null;
  modificationUserId: number | null;
  moduleId: number;
  periodId: number | null;
  previousPeriodDate: Date | string | null;
  registrationDate: Date | null;
}

export interface RolUserPost {
  roleUserId: number | null;
  userId: number | null;
  roleId: number | null;
  roleUserStatus: boolean;
}

export interface RolPost {
  roleName: string;
  roleDescription: string;
  startTime: string;
  endTime: string;
  roleTime: number;
}

export interface AcquirerInterface {
  acquirerId: number | null;
  acquirerName: string;
  acquirerStatus: boolean;
}

export interface CardInterface {
  cardId: number | null;
  accountId: number | null;
  cardName: string;
  isCreditCard: boolean;
  cardStatus: boolean;
}

export type ExternalDocumentsIdsType = {
  debitNoteIds: number[];
  creditNoteIds: number[];
  retentionIds: number[];
  invoiceIds: number[];
  paymentIds: number[];
  chargeIds: number[];
};
