export type EmployeeResumeType = {
  employeeId: number | null;
  personIdentification: string;
  personName: string;
  personCellphone: string;
  personEmail: string;
  imgUser: string;
  positionName: string;
  nameBranch: string;
  employeeSalary: number;
  employeeEntryDate: string | Date;
  employeeReentryDate: string | Date;
  status: boolean;
};

export type FichaEmpleadoType = {
  bankAccount: BankAccountsType[];
  bloodTypeId: number | null;
  bloodTypeName: string;
  branchId: number | null;
  cityName: string;
  cvEmployee: string | null;
  disabilityId: number | null;
  disabilityName: string;
  disabilityPercentage: number;
  driveLicenceEmployee: string | null;
  driverLicenseExpirationDate: Date | null;
  drivingLicenseTypeDescription: string;
  drivingLicenseTypeId: number;
  drivingLicenseTypeName: string;
  educationLevelId: number | null;
  educationLevelName: string;
  emergencyContact: EmergencyContactsType[];
  employeeCellphone: null;
  employeeDisabled: boolean;
  employeeId: number | null;
  employeePhone: string | null;
  employeeTitle: string;
  familyResponsibilities: FamilyResponsibilitiesType[];
  genderId: number | null;
  genderName: string;
  identificationDocCopy: string | null;
  maritalStatusId: number | null;
  maritalStatusName: string;
  parishId: number | null;
  parishName: string;
  personAddress: string;
  personBirthDate: Date | null;
  personCellphone: string;
  personEmail: string;
  personId: number | null;
  personIdentification: string;
  personName: string;
  personResidenceSector: string;
  positionId: number | null;
  provinceName: string;
  img: string;
};

export type FamilyResponsibilitiesType = {
  age: number;
  enableBurdenFml: boolean;
  especialCapacity: boolean;
  familyBurdenId: number | null;
  file: string;
  identification: string;
  idKind: number | null;
  names: string;
  personBirthDate: Date | null;
  relativeName: string;
};

export type EmergencyContactsType = {
  contactEmergencyId: number | null;
  kinId: number | null;
  nameContactEmergency: string;
  name: string;
  cellphoneEmergencyContact: string;
  telephoneEmergencyContact: string;
};

export type BankAccountsType = {
  countBankId: number | null;
  catalogBank: number;
  bankName: string;
  bankAccountTypeId: number;
  accountTypeName: string;
  bankAccountNumber: string;
  accountStatusBank: boolean;
};

export type ContractualInformationType = {
  accumulatedFourteenth: boolean;
  accumulatedThirteenth: boolean;
  accumulatedReserveFundsEmployee: boolean;
  branchId: number | null;
  branchName: string;
  companyEntryDate: Date | null;
  departmentId: number | null;
  departmentName: string;
  departureDate: Date | null;
  departureReason: string;
  employeeReentryDate: Date | null;
  employeeSalary: number;
  employerIESS: boolean;
  employerPatronalIESS: boolean;
  fortnight: boolean;
  fortnightValue: number;
  incomeTax: number;
  jobName: string;
  listContract: ContractType[];
  positionId: number | null;
  reentryReason: string;
  vacationProvision: boolean;
};

export type ContractType = {
  contractHours: number;
  contractId: number | null;
  contractModalityId: number | null;
  contractName: string;
  contractTypeId: number | null;
  endDateContract: Date | null;
  fileContract: string | null;
  nameContractType: string;
  startDateContract: Date | null;
  stateContract: boolean;
};

export type AccountingDataType = {
  countEmployeeId: number | null;
  employeeId: number | null;
  accountId: number | null;
  accountTypeId: number | null;
  accountNumber: string;
  parentAccountNumber: string;
  accountName: string;
};
