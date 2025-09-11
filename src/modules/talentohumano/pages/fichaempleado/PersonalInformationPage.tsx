import {
  Autocomplete,
  Avatar,
  Divider,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  TableFooter,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Dispatch, SetStateAction, useRef, useState, useEffect } from 'react';
import {
  BankAccountType,
  BankAccountsType,
  BankCatalogType,
  BloodType,
  DisabilityType,
  DriverLicenseType,
  EducationLevelType,
  EmergencyContactsType,
  FamilyResponsibilitiesType,
  FichaEmpleadoType,
  GenderType,
  MaritalStatusType,
  ParishTransactionType,
  ProvinceCityType,
  RelationshipType,
} from '@/types';
import { StyledDatePicker, useForm, useStyles } from '@/hooks';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import isEqual from 'lodash.isequal';
import SaveIcon from '@mui/icons-material/Save';
import { createApiConfig } from '@/backend';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { AddCircle, SkipNext, Warning } from '@mui/icons-material';
import {
  checkAndSetAsync,
  formatDate,
  validateCedulaRuc,
  validateCellphone,
  validateEmail,
} from '@/functions';
import { defaultFichaEmpleado } from '@/constants';
import { CardLayout, PaperComponent } from '@/modules';
import getServiceUrls from '@/backend/servicesUrl';

const defaultParishTransaction: ParishTransactionType = {
  parishId: 0,
  parishName: '',
  cityId: 0,
  parishCode: '',
};

const defaultProvinceCity: ProvinceCityType = {
  cityCode: '',
  cityName: '',
  provinceId: 0,
  provinceName: '',
};

const defaultFamilyResponsibilitiesType: FamilyResponsibilitiesType = {
  age: 0,
  enableBurdenFml: true,
  especialCapacity: false,
  familyBurdenId: null,
  file: '',
  identification: '',
  idKind: null,
  names: '',
  personBirthDate: null,
  relativeName: '',
};

const defaultEmergencyContact: EmergencyContactsType = {
  contactEmergencyId: null,
  kinId: null,
  nameContactEmergency: '',
  name: '',
  cellphoneEmergencyContact: '',
  telephoneEmergencyContact: '',
};

const defaultBankAccount: BankAccountsType = {
  countBankId: null,
  catalogBank: 0,
  bankName: '',
  bankAccountTypeId: 0,
  accountTypeName: '',
  bankAccountNumber: '',
  accountStatusBank: true,
};

export type PersonalInformationPageProps = {
  selectedEmployee: FichaEmpleadoType;
  setSelectedEmployee: Dispatch<SetStateAction<FichaEmpleadoType>>;
  createMode: boolean;
  handleCancelCreateMode: () => void;
  handleClickNext: () => void;
};

export const PersonalInformationPage: React.FC<
  PersonalInformationPageProps
> = ({
  selectedEmployee,
  setSelectedEmployee,
  createMode,
  handleCancelCreateMode,
  handleClickNext,
}) => {
  const serviceUrls = getServiceUrls();

  const apiTba = createApiConfig(serviceUrls.tbaServiceUrl);

  const apiRRHH = createApiConfig(serviceUrls.tbaServiceUrl);

  const classesHook = useStyles();

  const [parishes, setParishes] = useState<ParishTransactionType[]>([]);

  const [selectedParish, setSelectedParish] = useState<ParishTransactionType>(
    defaultParishTransaction
  );

  const [selectedCityProvince, setSelectedCityProvince] =
    useState<ProvinceCityType>(defaultProvinceCity);

  const [inputValueParish, setInputValueParish] = useState(
    selectedEmployee.parishName
  );

  const [editMode, setEditMode] = useState(false);

  const prevSelectedEmployee = useRef<FichaEmpleadoType | undefined>(undefined);

  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatusType[]>(
    []
  );

  const [bloodTypeNames, setBloodTypeNames] = useState<BloodType[]>([]);

  const [genderTypeNames, setGenderTypeNames] = useState<GenderType[]>([]);

  const [educationLevelNames, setEducationLevelNames] = useState<
    EducationLevelType[]
  >([]);

  const [driverLicenseTypeNames, setDriverLicenseTypeNames] = useState<
    DriverLicenseType[]
  >([]);

  const [disabilityTypeNames, setDisabilityTypeNames] = useState<
    DisabilityType[]
  >([]);

  const [relationshipTypes, setRelationshipTypes] = useState<
    RelationshipType[]
  >([]);

  const [bankCatalogs, setBankCatalogs] = useState<BankCatalogType[]>([]);

  const [bankAccounts, setBankAccounts] = useState<BankAccountType[]>([]);

  const [selectedFamilyResponsability, setSelectedFamilyResponsability] =
    useState<FamilyResponsibilitiesType>(defaultFamilyResponsibilitiesType);

  const [selectedEmergencyContact, setSelectedEmergencyContact] =
    useState<EmergencyContactsType>(defaultEmergencyContact);

  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccountsType>(defaultBankAccount);

  const [open, setOpen] = useState(false);

  const [dialogContentCase, setDialogContentCase] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  const {
    onInputChange: onInputChangeFamilyResponsability,
    formState: formStateFamilyResponsability,
    setFormState: setFormStateFamilyResponsability,
    isFormValid: buttonStateFamilyResponsability,
  } = useForm({
    identification: '',
    names: '',
  });

  const {
    onInputChange: onInputChangeEmergencyContact,
    formState: formStateEmergencyContact,
    setFormState: setFormStateEmergencyContact,
    isFormValid: buttonStateEmergencyContact,
  } = useForm({
    nameContactEmergency: '',
    cellphoneEmergencyContact: '',
    telephoneEmergencyContact: '',
  });

  const {
    onInputChange: onInputChangeBankAccount,
    formState: formStateBankAccount,
    setFormState: setFormStateBankAccount,
    isFormValid: buttonStateBankAccount,
  } = useForm({
    bankAccountNumber: '',
  });

  const enabledDisabled = () => {
    if (editMode) {
      return true;
    } else if (!editMode && createMode) {
      return true;
    } else {
      return false;
    }
  };

  // * * * *  *  * * * * * * * * * * * * * * * * * * *  FUNCTIONS * * * * * * * * * * * * * * * * * * * *
  const setSelectedParishAsync = async (valueSearchParish: string = '') => {
    try {
      const response = await apiTba.get(
        `/parroquia/get?param=${valueSearchParish}`
      );

      if (response.status === 200) {
        setParishes(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  const setMaritalStatusesAsync = async () => {
    try {
      const response = await apiTba.get('/estado_civil/get');
      if (response.status === 200) {
        setMaritalStatuses(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  const setBloodTypeNameAsync = async () => {
    try {
      const response = await apiRRHH.get('/tipo_sangre/get');
      if (response.status === 200) {
        setBloodTypeNames(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  const setGenderTypeNamesAsync = async () => {
    try {
      const response = await apiTba.get('/genero');
      if (response.status === 200) {
        setGenderTypeNames(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  const setEducationLevelAsync = async () => {
    try {
      const response = await apiRRHH.get('/nivel_estudio/get');
      if (response.status === 200) {
        setEducationLevelNames(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  const setDriverLicenseTypeNamesAsync = async () => {
    try {
      const response = await apiRRHH.get('/licencias_conducir/get');
      if (response.status === 200) {
        setDriverLicenseTypeNames(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  const setDisabilityTypeNamesAsync = async () => {
    try {
      const response = await apiRRHH.get('/discapacidad/get');
      if (response.status === 200) {
        setDisabilityTypeNames(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };
  const setRelationshipTypesAsync = async () => {
    try {
      const response = await apiRRHH.get('/parentesco/get');
      if (response.status === 200) {
        setRelationshipTypes(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  const setBankCatalogsAsync = async () => {
    try {
      const response = await apiTba.get('/catalogo_banco/get');
      if (response.status === 200) {
        setBankCatalogs(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  const setBankAccountsAsync = async () => {
    try {
      const response = await apiTba.get('/tipo_cuenta/get');
      if (response.status === 200) {
        setBankAccounts(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Del Servidor: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  // * * * * * * * * * * * * * * * * * * * * USE EFFECT * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

  useEffect(() => {
    if (parishes && parishes.length > 0 && selectedEmployee?.parishId) {
      const matchingParish = parishes.find(
        (p) => p.parishId === selectedEmployee.parishId
      );
      if (matchingParish) {
        setSelectedParish(matchingParish);
      } else {
        setSelectedParish(defaultParishTransaction);
      }
    }
  }, [parishes]);

  useEffect(() => {
    const updateEmployeeData = async () => {
      try {
        getCityAndProvince();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          enqueueSnackbar('Error Del Servidor: ' + error.message, {
            variant: 'error',
          });
        }
      }
    };

    const getCityAndProvince = async () => {
      try {
        const response = await apiTba.get(
          `/parroquia/ciudad/get/${selectedParish?.parishId}`
        );

        if (response.status === 200) {
          setSelectedCityProvince(response.data);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          enqueueSnackbar('Error Del Servidor: ' + error.message, {
            variant: 'error',
          });
        }
      }
    };

    if (selectedParish && selectedParish.parishId !== 0) {
      updateEmployeeData();
    } else {
      setSelectedCityProvince(defaultProvinceCity);
    }
  }, [selectedParish]);

  useEffect(() => {
    if (inputValueParish.length >= 4) {
      const fetchData = () => setSelectedParishAsync(inputValueParish);
      fetchData();
    }
  }, [inputValueParish]);

  useEffect(() => {
    if (enabledDisabled())
      setSelectedEmployee((prevState) => {
        const effectivePrevState = prevState || defaultFichaEmpleado;
        return {
          ...effectivePrevState,
          parishId: selectedParish?.parishId || null,
          parishName: selectedParish?.parishName || '',
          cityName: selectedCityProvince?.cityName || '',
          provinceName: selectedCityProvince?.provinceName || '',
        };
      });
  }, [selectedCityProvince]);

  useEffect(() => {
    checkAndSetAsync(maritalStatuses, setMaritalStatusesAsync);
    checkAndSetAsync(bloodTypeNames, setBloodTypeNameAsync);
    checkAndSetAsync(genderTypeNames, setGenderTypeNamesAsync);
    checkAndSetAsync(educationLevelNames, setEducationLevelAsync);
    checkAndSetAsync(driverLicenseTypeNames, setDriverLicenseTypeNamesAsync);
    checkAndSetAsync(disabilityTypeNames, setDisabilityTypeNamesAsync);
    checkAndSetAsync(relationshipTypes, setRelationshipTypesAsync);
    checkAndSetAsync(bankCatalogs, setBankCatalogsAsync);
    checkAndSetAsync(bankAccounts, setBankAccountsAsync);
  }, [enabledDisabled()]);

  useEffect(() => {
    if (dialogContentCase !== 0) {
      setOpen(true);
      switch (dialogContentCase) {
        case 1:
          setFormStateFamilyResponsability({
            identification: selectedFamilyResponsability?.identification || '',
            names: selectedFamilyResponsability?.names || '',
          });
          break;

        case 2:
          setFormStateEmergencyContact({
            nameContactEmergency: selectedEmergencyContact.nameContactEmergency,
            cellphoneEmergencyContact:
              selectedEmergencyContact.cellphoneEmergencyContact,
            telephoneEmergencyContact:
              selectedEmergencyContact.telephoneEmergencyContact,
          });
          break;

        case 3:
          setFormStateBankAccount({
            bankAccountNumber: selectedBankAccount.bankAccountNumber,
          });
          break;
      }
    }
  }, [
    selectedFamilyResponsability,
    selectedEmergencyContact,
    selectedBankAccount,
  ]);

  useEffect(() => {
    switch (dialogContentCase) {
      case 1:
        setSelectedFamilyResponsability((prevState) => {
          if (!prevState) return prevState;

          const updatedState = { ...prevState };
          updatedState.identification =
            formStateFamilyResponsability.identification;
          updatedState.names = formStateFamilyResponsability.names;

          return updatedState;
        });
        break;

      case 2:
        setSelectedEmergencyContact((prevState) => {
          if (!prevState) return prevState;

          const updatedState = { ...prevState };
          updatedState.nameContactEmergency =
            formStateEmergencyContact.nameContactEmergency;
          updatedState.cellphoneEmergencyContact =
            formStateEmergencyContact.cellphoneEmergencyContact;
          updatedState.telephoneEmergencyContact =
            formStateEmergencyContact.telephoneEmergencyContact;

          return updatedState;
        });
        break;

      case 3:
        setSelectedBankAccount((prevState) => {
          if (!prevState) return prevState;

          const updatedState = { ...prevState };
          updatedState.bankAccountNumber =
            formStateBankAccount.bankAccountNumber;
          return updatedState;
        });
        break;
    }
  }, [
    formStateFamilyResponsability,
    formStateEmergencyContact,
    formStateBankAccount,
  ]);

  const handleEditClick = () => {
    prevSelectedEmployee.current = selectedEmployee;
    setParishes([]);
    setSelectedParishAsync(selectedEmployee?.parishName ?? '');
    setEditMode(true);
    enqueueSnackbar('Modo edición habilitado', {
      variant: 'info',
    });
  };

  const handleSelect = (
    event: SelectChangeEvent<string>,
    caseSelect: number
  ) => {
    const valueFromSelect = event.target.value;
    switch (caseSelect) {
      case 1:
        const selectedStatus = maritalStatuses.find(
          (status) => status.maritalStatusName === valueFromSelect
        );

        setSelectedEmployee((prevState) => {
          const effectivePrevState = prevState || defaultFichaEmpleado;
          return {
            ...effectivePrevState,
            maritalStatus: selectedStatus?.maritalStatusId || null,
            maritalStatusName: selectedStatus?.maritalStatusName || '',
          };
        });
        break;

      case 2:
        const selectedBloodType = bloodTypeNames.find(
          (blood) => blood.bloodTypeName === valueFromSelect
        );

        setSelectedEmployee((prevState) => {
          const effectivePrevState = prevState || defaultFichaEmpleado;
          return {
            ...effectivePrevState,
            bloodTypeName: selectedBloodType?.bloodTypeName || '',
            bloodTypeId: selectedBloodType?.bloodTypeId || 0,
          };
        });
        break;
      case 3:
        const selectedGenderType = genderTypeNames.find(
          (gender) => gender.genderName === valueFromSelect
        );

        setSelectedEmployee((prevState) => {
          const effectivePrevState = prevState || defaultFichaEmpleado;
          return {
            ...effectivePrevState,
            genderId: selectedGenderType?.genderId || 0,
            genderName: selectedGenderType?.genderName || '',
          };
        });
        break;

      case 4:
        const selectedEducationLevel = educationLevelNames.find(
          (level) => level.educationLevelName === valueFromSelect
        );

        setSelectedEmployee((prevState) => {
          const effectivePrevState = prevState || defaultFichaEmpleado;
          return {
            ...effectivePrevState,
            educationLevelId: selectedEducationLevel?.educationLevelId || 0,
            educationLevelName:
              selectedEducationLevel?.educationLevelName || '',
          };
        });
        break;
      case 5:
        const selectedDriverLicense = driverLicenseTypeNames.find(
          (license) => license.drivingLicenseTypeName === valueFromSelect
        );

        setSelectedEmployee((prevState) => {
          const effectivePrevState = prevState || defaultFichaEmpleado;
          return {
            ...effectivePrevState,
            drivingLicenseTypeId:
              selectedDriverLicense?.drivingLicenseTypeId || 0,
            drivingLicenseTypeName:
              selectedDriverLicense?.drivingLicenseTypeName || '',
            drivingLicenseTypeDescription:
              selectedDriverLicense?.drivingLicenseTypeDescription || '',
            driverLicenseExpirationDate:
              selectedDriverLicense?.drivingLicenseTypeId === 99
                ? null
                : selectedEmployee?.driverLicenseExpirationDate || null,
          };
        });
        break;

      case 6:
        const selectedDisability = disabilityTypeNames.find(
          (disability) => disability.disabilityName === valueFromSelect
        );

        setSelectedEmployee((prevState) => {
          const effectivePrevState = prevState || defaultFichaEmpleado;
          return {
            ...effectivePrevState,
            disabilityId: selectedDisability?.disabilityId || 0,
            disabilityName: selectedDisability?.disabilityName || '',
          };
        });
        break;

      case 7:
        const selectedRelativeType = relationshipTypes.find(
          (relationshiptype) =>
            relationshiptype.relationshipName === valueFromSelect
        );

        setSelectedFamilyResponsability((prevState) => {
          const effectivePrevState =
            prevState || defaultFamilyResponsibilitiesType;
          return {
            ...effectivePrevState,
            idKind: selectedRelativeType?.relationshipId || 0,
            relativeName: selectedRelativeType?.relationshipName || '',
          };
        });
        break;
      case 8:
        const selectedRelativeTypeEmergency = relationshipTypes.find(
          (relationshiptype) =>
            relationshiptype.relationshipName === valueFromSelect
        );

        setSelectedEmergencyContact((prevState) => {
          const effectivePrevState =
            prevState || defaultFamilyResponsibilitiesType;
          return {
            ...effectivePrevState,
            kinId: selectedRelativeTypeEmergency?.relationshipId || 0,
            name: selectedRelativeTypeEmergency?.relationshipName || '',
          };
        });
        break;
      case 9:
        const bankCatalog = bankCatalogs.find(
          (bankCatalog) => bankCatalog.bankCatalogName === valueFromSelect
        );

        setSelectedBankAccount((prevState) => {
          const effectivePrevState = prevState || defaultBankAccount;
          return {
            ...effectivePrevState,
            catalogBank: bankCatalog?.bankCatalogId || 0,
            bankName: bankCatalog?.bankCatalogName || '',
          };
        });
        break;

      case 10:
        const bankAccount = bankAccounts.find(
          (bankAccount) => bankAccount.accountTypeName === valueFromSelect
        );

        setSelectedBankAccount((prevState) => {
          const effectivePrevState = prevState || defaultBankAccount;
          return {
            ...effectivePrevState,
            bankAccountTypeId: bankAccount?.accountTypeId || 0,
            accountTypeName: bankAccount?.accountTypeName || '',
          };
        });
        break;
    }
  };

  const handleInputChangeFields = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    if (name === 'disabilityPercentage') {
      let newValue = Math.min(100, Math.max(0, parseInt(value, 10)));
      setSelectedEmployee((prevState) =>
        prevState ? { ...prevState, [name]: newValue } : prevState
      );
    } else {
      if (name === 'personEmail') {
        setSelectedEmployee((prevState) =>
          prevState ? { ...prevState, [name]: value } : prevState
        );
      } else {
        let newValue = value.toUpperCase();
        setSelectedEmployee((prevState) =>
          prevState ? { ...prevState, [name]: newValue } : prevState
        );
      }
    }
  };

  const handleDateChange = (value: Date | null, field: string) => {
    setSelectedEmployee((prevState) => {
      if (!prevState) return prevState;

      const updatedState = { ...prevState };
      if (field === 'driverLicenseExpirationDate') {
        updatedState.driverLicenseExpirationDate = value;
      } else if (field === 'personBirthDate') {
        updatedState.personBirthDate = value;
      }

      return updatedState;
    });
  };

  const handleSaveClick = async () => {
    setEditMode(false);
    if (!isEqual(prevSelectedEmployee.current, selectedEmployee)) {
      try {
        const response = await apiTba.put(
          `/empleado/update/${selectedEmployee.employeeId}`,
          selectedEmployee
        );
        if (response.status === 200) {
          prevSelectedEmployee.current = selectedEmployee;
          enqueueSnackbar('Los cambios se guardarón exitósamente', {
            variant: 'success',
          });
        } else {
          enqueueSnackbar('Los cambios lo pudieron guardarse', {
            variant: 'error',
          });
        }
      } catch (error) {
        enqueueSnackbar(
          'Existió un error de conexión, los cambios no se guardaron',
          { variant: 'error' }
        );
      }
    } else {
      enqueueSnackbar('No se realizó ningún cambio al momento de editar', {
        variant: 'info',
      });
    }
  };

  const handleCancelClick = () => {
    setEditMode(false);
    if (prevSelectedEmployee.current) {
      setSelectedEmployee(prevSelectedEmployee.current);
    }
    enqueueSnackbar('Se canceló el modo edición', {
      variant: 'info',
    });
  };

  const handleClickOpen = (
    caseDialog: number,
    obj: FamilyResponsibilitiesType | BankAccountsType | EmergencyContactsType
  ) => {
    setDialogContentCase(caseDialog);
    switch (caseDialog) {
      case 1:
        setSelectedFamilyResponsability(obj as FamilyResponsibilitiesType);
        break;
      case 2:
        setSelectedEmergencyContact(obj as EmergencyContactsType);
        break;
      case 3:
        setSelectedBankAccount(obj as BankAccountsType);
        break;
    }
  };

  const handleDateChangeTable = (value: Date | null) => {
    setSelectedFamilyResponsability((prevState) => {
      if (!prevState) return prevState;

      const updatedState = { ...prevState };
      updatedState.personBirthDate = value;

      return updatedState;
    });
  };

  const handleAutocompleteChange = (
    event: React.ChangeEvent<{}>,
    newValue: ParishTransactionType | null
  ) => {
    if (event !== null) {
      event.preventDefault();
    }
    setSelectedParish(defaultParishTransaction);
    const newParishTemp = newValue as ParishTransactionType;
    setSelectedParish(newParishTemp);
  };

  const handleInputChangeAutocomplete = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setInputValueParish(newInputValue);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDialogContentCase(0);
  };

  const handleChangeBoolean = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    switch (dialogContentCase) {
      case 1:
        setSelectedFamilyResponsability((prevState) => {
          if (!prevState) return prevState;

          const updatedState = { ...prevState, [name]: event.target.checked };
          return updatedState;
        });
        break;

      case 3:
        setSelectedBankAccount((prevState) => {
          if (!prevState) return prevState;

          const updatedState = { ...prevState, [name]: event.target.checked };

          return updatedState;
        });
        break;
    }
  };

  const handleSaveFamilyResponsibility = () => {
    const indexToModify = selectedEmployee.familyResponsibilities.findIndex(
      (responsibility) =>
        responsibility.familyBurdenId ===
        selectedFamilyResponsability?.familyBurdenId
    );

    if (indexToModify !== -1) {
      const updatedFamilyResponsibilities = [
        ...selectedEmployee.familyResponsibilities,
      ];
      updatedFamilyResponsibilities[indexToModify] = {
        ...(selectedFamilyResponsability ||
          updatedFamilyResponsibilities[indexToModify]),
      };

      setSelectedEmployee((prevState) => {
        if (!prevState) return prevState;

        const updatedState = { ...prevState };
        updatedState.familyResponsibilities = updatedFamilyResponsibilities;

        return updatedState;
      });
    } else {
      if (selectedFamilyResponsability) {
        setSelectedEmployee((prevState) => {
          if (!prevState) return prevState;

          const updatedState = { ...prevState };
          updatedState.familyResponsibilities = [
            ...prevState.familyResponsibilities,
            selectedFamilyResponsability,
          ];

          return updatedState;
        });
      }
    }
  };

  const handleSaveBankAccount = () => {
    const indexToModify = selectedEmployee.bankAccount.findIndex(
      (bank) => bank.countBankId === selectedBankAccount?.countBankId
    );

    if (indexToModify !== -1) {
      const updatedBankAccount = [...selectedEmployee.bankAccount];
      updatedBankAccount[indexToModify] = {
        ...(selectedBankAccount || updatedBankAccount[indexToModify]),
      };

      setSelectedEmployee((prevState) => {
        if (!prevState) return prevState;

        const updatedState = { ...prevState };
        updatedState.bankAccount = updatedBankAccount;

        return updatedState;
      });
    } else {
      if (selectedBankAccount) {
        setSelectedEmployee((prevState) => {
          if (!prevState) return prevState;

          const updatedState = { ...prevState };
          updatedState.bankAccount = [
            ...prevState.bankAccount,
            selectedBankAccount,
          ];

          return updatedState;
        });
      }
    }
  };

  const handleSaveEmergencyContact = () => {
    const indexToModify = selectedEmployee.emergencyContact.findIndex(
      (contact) =>
        contact.contactEmergencyId ===
        selectedEmergencyContact?.contactEmergencyId
    );
    if (indexToModify !== -1) {
      const updatedContactEmergency = [...selectedEmployee.emergencyContact];
      updatedContactEmergency[indexToModify] = {
        ...(selectedEmergencyContact || updatedContactEmergency[indexToModify]),
      };
      setSelectedEmployee((prevState) => {
        if (!prevState) return prevState;

        const updatedState = { ...prevState };
        updatedState.emergencyContact = updatedContactEmergency;

        return updatedState;
      });
    } else {
      if (selectedEmergencyContact) {
        setSelectedEmployee((prevState) => {
          if (!prevState) return prevState;

          const updatedState = { ...prevState };
          updatedState.emergencyContact = [
            ...prevState.emergencyContact,
            selectedEmergencyContact,
          ];

          return updatedState;
        });
      }
    }
  };

  const handleSaveDialog = () => {
    switch (dialogContentCase) {
      case 1:
        handleSaveFamilyResponsibility();
        break;
      case 2:
        handleSaveEmergencyContact();
        break;
      case 3:
        handleSaveBankAccount();
        break;
    }
    setOpen(false);
    setDialogContentCase(0);
  };

  const handleNewRow = (caseNew: number) => {
    setOpen(true);
    setDialogContentCase(caseNew);
    switch (caseNew) {
      case 1:
        setSelectedFamilyResponsability(defaultFamilyResponsibilitiesType);
        break;
      case 2:
        setSelectedEmergencyContact(defaultEmergencyContact);
        break;
      case 3:
        setSelectedBankAccount(defaultBankAccount);
        break;
    }
  };

  const [enableNextPage, setEnableNextPage] = useState(false);

  useEffect(() => {
    const validateName = selectedEmployee.personName !== '';
    setEnableNextPage(
      validateCedulaRuc(selectedEmployee.personIdentification) &&
        validateEmail(selectedEmployee.personEmail) &&
        validateCellphone(selectedEmployee.personCellphone) &&
        validateCellphone(selectedEmployee.employeeCellphone) &&
        validateName
    );
  }, [
    selectedEmployee.personName,
    selectedEmployee.personIdentification,
    selectedEmployee.personEmail,
    selectedEmployee.personCellphone,
    selectedEmployee.employeeCellphone,
  ]);

  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        maxWidth="md"
      >
        <DialogTitle
          style={{
            cursor: 'move',
            textAlign: 'center',
            marginTop: 5,
          }}
          id="draggable-dialog-title"
        >
          {dialogContentCase === 1
            ? 'Carga Familiar'
            : dialogContentCase === 2
            ? 'Contactos De Emergencia'
            : 'Cuentas Bancarias'}
        </DialogTitle>
        {dialogContentCase === 1 ? (
          <DialogContent>
            <form>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="relationshiptype-label">
                      Parentesco
                    </InputLabel>
                    <Select
                      required
                      labelId="relationshiptype-label"
                      id="relationshiptype-select"
                      label="Parentesco"
                      value={selectedFamilyResponsability?.relativeName || ''}
                      onChange={(event) => handleSelect(event, 7)}
                      fullWidth
                    >
                      {relationshipTypes.map((status) => (
                        <MenuItem
                          key={status.relationshipId}
                          value={status.relationshipName}
                        >
                          {status.relationshipName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    name="identification"
                    label="Indentificación"
                    value={formStateFamilyResponsability.identification}
                    fullWidth
                    InputLabelProps={{
                      shrink: formStateFamilyResponsability.identification
                        ? true
                        : false,
                    }}
                    onChange={onInputChangeFamilyResponsability}
                    inputProps={{ maxLength: 10 }}
                    error={
                      !validateCedulaRuc(
                        formStateFamilyResponsability.identification
                      )
                    }
                    helperText={
                      !validateCedulaRuc(
                        formStateFamilyResponsability.identification
                      )
                        ? 'Cédula no válida'
                        : ''
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="names"
                    label="Nombres"
                    value={formStateFamilyResponsability.names}
                    fullWidth
                    InputLabelProps={{
                      shrink: formStateFamilyResponsability.names
                        ? true
                        : false,
                    }}
                    onChange={onInputChangeFamilyResponsability}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <StyledDatePicker
                    label="Fecha De Nacimiento"
                    views={['year', 'month', 'day']}
                    minDate={new Date(1950, 1, 1)}
                    maxDate={new Date()}
                    format="dd/MM/yyyy"
                    value={
                      selectedFamilyResponsability?.personBirthDate
                        ? new Date(selectedFamilyResponsability.personBirthDate)
                        : null
                    }
                    onChange={(value) => handleDateChangeTable(value as Date)}
                    slotProps={{
                      textField: {
                        sx: {
                          minWidth: '100%',
                        },
                        InputProps: {
                          className: classesHook.textBlackStyle,
                        },
                        InputLabelProps: {
                          className: classesHook.textGreenStyle,
                          shrink: selectedFamilyResponsability?.personBirthDate
                            ? true
                            : false,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  container
                  justifyContent="center"
                  alignItems="center"
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedFamilyResponsability?.especialCapacity}
                        onChange={(event) =>
                          handleChangeBoolean(event, 'especialCapacity')
                        }
                      />
                    }
                    label="Discapacidad"
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  container
                  justifyContent="center"
                  alignItems="center"
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedFamilyResponsability?.enableBurdenFml}
                        onChange={(event) =>
                          handleChangeBoolean(event, 'enableBurdenFml')
                        }
                      />
                    }
                    label="Carga Activa/Inactiva"
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
        ) : dialogContentCase === 2 ? (
          <DialogContent>
            <form>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="relationshiptype-label">
                      Parentesco
                    </InputLabel>
                    <Select
                      required
                      labelId="relationshiptype-label"
                      id="relationshiptype-select"
                      label="Parentesco"
                      value={selectedEmergencyContact?.name}
                      onChange={(event) => handleSelect(event, 8)}
                      fullWidth
                    >
                      {relationshipTypes.map((status) => (
                        <MenuItem
                          key={status.relationshipId}
                          value={status.relationshipName}
                        >
                          {status.relationshipName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    name="nameContactEmergency"
                    label="Nombre"
                    value={formStateEmergencyContact.nameContactEmergency}
                    fullWidth
                    InputLabelProps={{
                      shrink: formStateEmergencyContact.nameContactEmergency
                        ? true
                        : false,
                    }}
                    onChange={onInputChangeEmergencyContact}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="cellphoneEmergencyContact"
                    label="Celular"
                    value={formStateEmergencyContact.cellphoneEmergencyContact}
                    fullWidth
                    InputLabelProps={{
                      shrink:
                        formStateEmergencyContact.cellphoneEmergencyContact
                          ? true
                          : false,
                    }}
                    onChange={onInputChangeEmergencyContact}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name="telephoneEmergencyContact"
                    label="Teléfono"
                    value={formStateEmergencyContact.telephoneEmergencyContact}
                    fullWidth
                    InputLabelProps={{
                      shrink:
                        formStateEmergencyContact.telephoneEmergencyContact
                          ? true
                          : false,
                    }}
                    onChange={onInputChangeEmergencyContact}
                    required
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
        ) : (
          <DialogContent>
            <form>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="bank-type-label">Banco</InputLabel>
                    <Select
                      required
                      labelId="bank-type-label"
                      id="bank-type-select"
                      label="Banco"
                      value={selectedBankAccount?.bankName || ''}
                      onChange={(event) => handleSelect(event, 9)}
                      fullWidth
                    >
                      {bankCatalogs.map((status) => (
                        <MenuItem
                          key={status.bankCatalogId}
                          value={status.bankCatalogName}
                        >
                          {status.bankCatalogName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="bank-account-type-label">
                      Tipo De Cuenta
                    </InputLabel>
                    <Select
                      required
                      labelId="bank-account-type-label"
                      id="bank-account-type-select"
                      label="Tipo De Cuenta"
                      value={selectedBankAccount?.accountTypeName || ''}
                      onChange={(event) => handleSelect(event, 10)}
                      fullWidth
                    >
                      {bankAccounts.map((status) => (
                        <MenuItem
                          key={status.accountTypeId}
                          value={status.accountTypeName}
                        >
                          {status.accountTypeName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    required
                    name="bankAccountNumber"
                    label="Número De Cuenta"
                    value={formStateBankAccount.bankAccountNumber}
                    fullWidth
                    InputLabelProps={{
                      shrink: formStateBankAccount.bankAccountNumber
                        ? true
                        : false,
                    }}
                    onChange={onInputChangeBankAccount}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  container
                  justifyContent="center"
                  alignItems="center"
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedBankAccount?.accountStatusBank}
                        onChange={(event) =>
                          handleChangeBoolean(event, 'accountStatusBank')
                        }
                      />
                    }
                    label="Cuenta Activa/Inactiva"
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
        )}

        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cancelar Registro
          </Button>
          <Tooltip
            title={
              buttonStateFamilyResponsability ||
              buttonStateEmergencyContact ||
              buttonStateBankAccount
                ? 'Guardar Registro'
                : 'Debe Llenar Los Campos Obligatorios Para Activar Este Botón'
            }
          >
            <Button
              onClick={handleSaveDialog}
              disabled={
                !(
                  buttonStateFamilyResponsability ||
                  buttonStateEmergencyContact ||
                  buttonStateBankAccount
                )
              }
            >
              Guardar Registro
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
      <CardLayout
        title="INFORMACIÓN PERSONAL"
        createMode={createMode}
        cancelFunction={handleCancelCreateMode}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="personName"
                  label="Nombre"
                  value={selectedEmployee?.personName || ''}
                  fullWidth
                  InputProps={{
                    readOnly: !enabledDisabled(),
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.personName ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                  onChange={handleInputChangeFields}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="personIdentification"
                  label="Indentificación"
                  value={selectedEmployee?.personIdentification || ''}
                  fullWidth
                  InputProps={{
                    readOnly: !createMode,
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.personIdentification
                      ? true
                      : false,
                    className: classesHook.textGreenStyle,
                  }}
                  onChange={handleInputChangeFields}
                  error={
                    !validateCedulaRuc(selectedEmployee?.personIdentification)
                  }
                  helperText={
                    !validateCedulaRuc(selectedEmployee?.personIdentification)
                      ? 'Cédula no válida'
                      : ''
                  }
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={6}>
                <StyledDatePicker
                  label="Fecha De Nacimiento"
                  views={['year', 'month', 'day']}
                  minDate={new Date(1950, 1, 1)}
                  maxDate={dayjs(new Date()).subtract(15, 'year').toDate()}
                  format="dd/MM/yyyy"
                  readOnly={!enabledDisabled()}
                  value={
                    selectedEmployee?.personBirthDate
                      ? new Date(selectedEmployee.personBirthDate)
                      : null
                  }
                  onChange={(value) =>
                    handleDateChange(value as Date, 'personBirthDate')
                  }
                  slotProps={{
                    textField: {
                      className: classesHook.genericFieldStyle,
                      sx: {
                        minWidth: '100%',
                      },
                      InputProps: {
                        className: classesHook.textWhiteStyle,
                      },
                      InputLabelProps: {
                        className: classesHook.textGreenStyle,
                        shrink: selectedEmployee?.personBirthDate
                          ? true
                          : false,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                {enabledDisabled() ? (
                  <Autocomplete
                    id="autocomplete-parish"
                    className={classesHook.genericFieldStyle}
                    options={parishes.map((parish, index) => ({
                      ...parish,
                      key: `${parish.parishId}-${index}`, // Creating a unique key
                    }))}
                    style={{ width: '100%', marginBottom: '20px' }}
                    onChange={(event, newValue) =>
                      handleAutocompleteChange(event, newValue)
                    }
                    onInputChange={(event, newInputValue) =>
                      handleInputChangeAutocomplete(event, newInputValue)
                    }
                    value={
                      selectedParish?.parishId !== 0
                        ? selectedParish
                        : null || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.parishId === value.parishId
                    }
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Parroquia Nacimiento"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          className: classesHook.textWhiteStyle,
                        }}
                        InputLabelProps={{
                          ...params.InputLabelProps,
                          className: classesHook.textGreenStyle,
                        }}
                      />
                    )}
                    getOptionLabel={(option) => option.parishName}
                  />
                ) : (
                  <TextField
                    label="Parroquia Nacimiento"
                    placeholder="Parroquia Nacimiento"
                    value={selectedEmployee?.parishName || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedEmployee?.parishName ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Ciudad Nacimiento"
                  placeholder="Ciudad Nacimiento"
                  value={selectedEmployee?.cityName || ''}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.cityName ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Provincia Nacimiento"
                  placeholder="Provincia Nacimiento"
                  value={selectedEmployee?.provinceName || ''}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.provinceName ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                {enabledDisabled() ? (
                  <FormControl fullWidth>
                    <InputLabel
                      id="marital-status-label"
                      shrink={
                        selectedEmployee?.maritalStatusName ? true : false
                      }
                      className={classesHook.textGreenStyle}
                    >
                      Estado Civil
                    </InputLabel>
                    <Select
                      labelId="marital-status-label"
                      id="marital-status-select"
                      label="Estado Civil"
                      value={selectedEmployee?.maritalStatusName}
                      onChange={(event) => handleSelect(event, 1)}
                      fullWidth
                      className={classesHook.genericFieldStyle}
                      inputProps={{
                        className: classesHook.textWhiteStyle,
                      }}
                    >
                      {maritalStatuses.map((status) => (
                        <MenuItem
                          key={status.maritalStatusId}
                          value={status.maritalStatusName}
                        >
                          {status.maritalStatusName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Estado Civil"
                    placeholder="Estado Civil"
                    value={selectedEmployee?.maritalStatusName || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedEmployee?.maritalStatusName
                        ? true
                        : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
                {enabledDisabled() ? (
                  <FormControl fullWidth>
                    <InputLabel
                      id="blood-type-label"
                      shrink={selectedEmployee?.bloodTypeName ? true : false}
                      className={classesHook.textGreenStyle}
                    >
                      Tipo De Sangre
                    </InputLabel>
                    <Select
                      labelId="blood-type-label"
                      id="blood-type-select"
                      label="Tipo De Sangre"
                      value={selectedEmployee?.bloodTypeName}
                      onChange={(event) => handleSelect(event, 2)}
                      fullWidth
                      className={classesHook.genericFieldStyle}
                      inputProps={{
                        className: classesHook.textWhiteStyle,
                      }}
                    >
                      {bloodTypeNames.map((status) => (
                        <MenuItem
                          key={status.bloodTypeId}
                          value={status.bloodTypeName}
                        >
                          {status.bloodTypeName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Tipo De Sangre"
                    placeholder="Tipo De Sangre"
                    value={selectedEmployee?.bloodTypeName || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedEmployee?.bloodTypeName ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
                {enabledDisabled() ? (
                  <FormControl fullWidth>
                    <InputLabel
                      id="gender-type-label"
                      shrink={selectedEmployee?.genderName ? true : false}
                      className={classesHook.textGreenStyle}
                    >
                      Género
                    </InputLabel>
                    <Select
                      labelId="gender-type-label"
                      id="gender-type-select"
                      label="Género"
                      value={selectedEmployee?.genderName}
                      onChange={(event) => handleSelect(event, 3)}
                      fullWidth
                      className={classesHook.genericFieldStyle}
                      inputProps={{
                        className: classesHook.textWhiteStyle,
                      }}
                    >
                      {genderTypeNames.map((status) => (
                        <MenuItem
                          key={status.genderId}
                          value={status.genderName}
                        >
                          {status.genderName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Género"
                    placeholder="Género"
                    value={selectedEmployee?.genderName || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedEmployee?.genderName ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
                {enabledDisabled() ? (
                  <FormControl fullWidth>
                    <InputLabel
                      id="education-level-label"
                      shrink={
                        selectedEmployee?.educationLevelName ? true : false
                      }
                      className={classesHook.textGreenStyle}
                    >
                      Nivel De Estudios
                    </InputLabel>
                    <Select
                      labelId="education-level-label"
                      id="education-level-select"
                      label="Nivel De Estudios"
                      value={selectedEmployee?.educationLevelName}
                      onChange={(event) => handleSelect(event, 4)}
                      fullWidth
                      className={classesHook.genericFieldStyle}
                      inputProps={{
                        className: classesHook.textWhiteStyle,
                      }}
                    >
                      {educationLevelNames.map((status) => (
                        <MenuItem
                          key={status.educationLevelId}
                          value={status.educationLevelName}
                        >
                          {status.educationLevelName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Nivel De Estudios"
                    placeholder="Nivel De Estudios"
                    value={selectedEmployee?.educationLevelName || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedEmployee?.educationLevelName
                        ? true
                        : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="employeeTitle"
                  label="Título"
                  placeholder="Título"
                  value={selectedEmployee?.employeeTitle || ''}
                  fullWidth
                  InputProps={{
                    readOnly: !enabledDisabled(),
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.employeeTitle ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                  onChange={handleInputChangeFields}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Avatar
              alt={selectedEmployee.personName}
              src={selectedEmployee.img}
              style={{
                height: '320px',
                left: '678px',
                objectFit: 'cover',
                position: 'absolute',
                top: '145px',
                width: '230px',
                borderRadius: '0',
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="personAddress"
                  label="Dirección Domicilio"
                  value={selectedEmployee?.personAddress || ''}
                  fullWidth
                  InputProps={{
                    readOnly: !enabledDisabled(),
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.personAddress ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                  onChange={handleInputChangeFields}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="personResidenceSector"
                  label="Sector Residencia"
                  placeholder="Sector Residencia"
                  value={selectedEmployee?.personResidenceSector || ''}
                  fullWidth
                  InputProps={{
                    readOnly: !enabledDisabled(),
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.personResidenceSector
                      ? true
                      : false,
                    className: classesHook.textGreenStyle,
                  }}
                  onChange={handleInputChangeFields}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="personEmail"
                  label="Email Personal"
                  placeholder="empleado@mail.com"
                  value={selectedEmployee?.personEmail || ''}
                  fullWidth
                  InputProps={{
                    readOnly: !enabledDisabled(),
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.personEmail ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                  onChange={handleInputChangeFields}
                  error={!validateEmail(selectedEmployee?.personEmail)}
                  helperText={
                    !validateEmail(selectedEmployee?.personEmail)
                      ? 'Correo electrónico no válido'
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="personCellphone"
                  label="Celular Personal"
                  placeholder="09999999999"
                  value={selectedEmployee?.personCellphone || ''}
                  fullWidth
                  InputProps={{
                    readOnly: !enabledDisabled(),
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.personCellphone ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                  onChange={handleInputChangeFields}
                  error={!validateCellphone(selectedEmployee?.personCellphone)}
                  helperText={
                    !validateCellphone(selectedEmployee?.personCellphone)
                      ? 'El número celular debe tener 10 dígitos'
                      : ''
                  }
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="employeePhone"
                  label="Celular De Trabajo"
                  value={selectedEmployee?.employeePhone || ''}
                  fullWidth
                  InputProps={{
                    readOnly: !enabledDisabled(),
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.employeePhone ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                  onChange={handleInputChangeFields}
                  error={!validateCellphone(selectedEmployee?.employeePhone)}
                  helperText={
                    !validateCellphone(selectedEmployee?.employeePhone)
                      ? 'El número celular debe tener 10 dígitos'
                      : ''
                  }
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
            </Grid>
            <Divider sx={{ height: '2px', margin: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                {enabledDisabled() ? (
                  <FormControl fullWidth>
                    <InputLabel
                      id="driver-license-label"
                      shrink={
                        selectedEmployee?.drivingLicenseTypeName ? true : false
                      }
                      className={classesHook.textGreenStyle}
                    >
                      Licencia De Conducir
                    </InputLabel>
                    <Select
                      labelId="driver-license-label"
                      id="driver-license-select"
                      label="Licencia De Conducir"
                      value={selectedEmployee?.drivingLicenseTypeName}
                      onChange={(event) => handleSelect(event, 5)}
                      fullWidth
                      className={classesHook.genericFieldStyle}
                      inputProps={{
                        className: classesHook.textWhiteStyle,
                      }}
                    >
                      {driverLicenseTypeNames.map((status) => (
                        <MenuItem
                          key={status.drivingLicenseTypeId}
                          value={status.drivingLicenseTypeName}
                        >
                          {status.drivingLicenseTypeName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Licencia De Conducir"
                    placeholder="Licencia De Conducir"
                    value={selectedEmployee?.drivingLicenseTypeName || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedEmployee?.drivingLicenseTypeName
                        ? true
                        : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Descripción De Licencia"
                  placeholder="Descripción De Licencia"
                  value={selectedEmployee?.drivingLicenseTypeDescription || ''}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: selectedEmployee?.drivingLicenseTypeDescription
                      ? true
                      : false,
                    className: classesHook.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <StyledDatePicker
                  label="Fecha Caducidad Licencia"
                  views={['year', 'month', 'day']}
                  minDate={dayjs(new Date()).subtract(6, 'year').toDate()}
                  maxDate={dayjs(new Date()).add(6, 'year').toDate()}
                  format="dd/MM/yyyy"
                  readOnly={!enabledDisabled()}
                  value={
                    selectedEmployee?.driverLicenseExpirationDate
                      ? new Date(selectedEmployee.driverLicenseExpirationDate)
                      : null
                  }
                  onChange={(value) =>
                    handleDateChange(
                      value as Date,
                      'driverLicenseExpirationDate'
                    )
                  }
                  slotProps={{
                    textField: {
                      className: classesHook.genericFieldStyle,
                      sx: {
                        minWidth: '100%',
                      },
                      InputProps: {
                        className: classesHook.textWhiteStyle,
                      },
                      InputLabelProps: {
                        className: classesHook.textGreenStyle,
                        shrink: selectedEmployee?.driverLicenseExpirationDate
                          ? true
                          : false,
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Divider sx={{ height: '2px', margin: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                {enabledDisabled() ? (
                  <FormControl
                    fullWidth
                    className={classesHook.selectContainer}
                  >
                    <InputLabel
                      id="disability-label"
                      shrink={
                        selectedEmployee?.drivingLicenseTypeName ? true : false
                      }
                      className={classesHook.textGreenStyle}
                    >
                      Discapacidad
                    </InputLabel>
                    <Select
                      labelId="disability-label"
                      id="disability-select"
                      label="Discapacidad"
                      value={selectedEmployee?.disabilityName}
                      onChange={(event) => handleSelect(event, 6)}
                      fullWidth
                      inputProps={{
                        className: classesHook.textWhiteStyle,
                      }}
                    >
                      {disabilityTypeNames.map((status) => (
                        <MenuItem
                          key={status.disabilityId}
                          value={status.disabilityName}
                        >
                          {status.disabilityName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Dispacidad"
                    placeholder="Dispacidad"
                    value={selectedEmployee?.disabilityName || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedEmployee?.disabilityName ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="disabilityPercentage"
                  label="Porcentaje Discapacidad"
                  placeholder="0%"
                  value={
                    selectedEmployee?.disabilityPercentage === 0
                      ? ''
                      : selectedEmployee?.disabilityPercentage
                  }
                  fullWidth
                  type="number"
                  InputProps={{
                    readOnly: !enabledDisabled(),
                    className: classesHook.textWhiteStyle,
                    endAdornment: (
                      <InputAdornment position="end">
                        <span style={{ color: '#92C83E' }}>%</span>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: (
                      selectedEmployee?.disabilityPercentage === 0
                        ? ''
                        : selectedEmployee?.disabilityPercentage
                    )
                      ? true
                      : false,
                    className: classesHook.textGreenStyle,
                  }}
                  inputProps={{
                    min: 0,
                    max: 100,
                  }}
                  onChange={handleInputChangeFields}
                />
              </Grid>
            </Grid>
            <Divider sx={{ height: '2px', margin: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  className={classesHook.headerTitleWhite}
                  sx={{ mb: 2 }}
                >
                  CARGAS FAMILIARES
                </Typography>
                <div className={classesHook.tableContainer}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Parentesco</TableCell>
                          <TableCell>Identificación</TableCell>
                          <TableCell>Nombres</TableCell>
                          <TableCell>Fecha De Nacimiento</TableCell>
                          <TableCell>Discapacidad</TableCell>
                          <TableCell>Edad</TableCell>
                          {enabledDisabled() ? (
                            <TableCell>Acciones</TableCell>
                          ) : null}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedEmployee?.familyResponsibilities
                          .filter((row) => row.enableBurdenFml)
                          .map((row) => (
                            <TableRow key={row.familyBurdenId}>
                              <TableCell>{row.relativeName}</TableCell>
                              <TableCell>{row.identification}</TableCell>
                              <TableCell>{row.names}</TableCell>
                              <TableCell>
                                {formatDate(row.personBirthDate)}
                              </TableCell>
                              <TableCell>
                                {row.especialCapacity ? 'Sí' : 'No'}
                              </TableCell>
                              <Tooltip title="La edad se calcula en base a la fecha de nacimiento, los cambios los verá reflejados despues de guardar los cambios de la ficha">
                                <TableCell>{row.age}</TableCell>
                              </Tooltip>

                              {enabledDisabled() ? (
                                <TableCell>
                                  <div className={classesHook.iconContainer}>
                                    <Tooltip title="Editar Carga">
                                      <IconButton
                                        sx={{ ml: 2 }}
                                        onClick={() => handleClickOpen(1, row)}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </div>
                                </TableCell>
                              ) : null}
                            </TableRow>
                          ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={12}
                            style={{ textAlign: 'center' }}
                          >
                            {enabledDisabled() ? (
                              <Tooltip title="Nueva Carga">
                                <Button
                                  onClick={() => handleNewRow(1)}
                                  startIcon={<AddCircle />}
                                >
                                  Nueva Carga
                                </Button>
                              </Tooltip>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </div>
              </Grid>
            </Grid>
            <Divider sx={{ height: '2px', margin: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  className={classesHook.headerTitleWhite}
                  sx={{ mb: 2 }}
                >
                  CONTACTOS DE EMERGENCIA
                </Typography>
                <div className={classesHook.tableContainer}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Parentesco</TableCell>
                          <TableCell>Celular</TableCell>
                          <TableCell>Teléfono</TableCell>
                          {enabledDisabled() ? (
                            <TableCell>Acciones</TableCell>
                          ) : null}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedEmployee?.emergencyContact.map((row) => (
                          <TableRow key={row.contactEmergencyId}>
                            <TableCell>{row.nameContactEmergency}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>
                              {row.cellphoneEmergencyContact}
                            </TableCell>
                            <TableCell>
                              {row.telephoneEmergencyContact}
                            </TableCell>
                            {enabledDisabled() ? (
                              <TableCell>
                                <div className={classesHook.iconContainer}>
                                  <Tooltip title="Editar Contacto De Emergencia">
                                    <IconButton
                                      sx={{ ml: 6 }}
                                      onClick={() => handleClickOpen(2, row)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={12}
                            style={{ textAlign: 'center' }}
                          >
                            {enabledDisabled() ? (
                              <Tooltip title="Nuevo Contacto De Emergencia">
                                <Button
                                  onClick={() => handleNewRow(2)}
                                  startIcon={<AddCircle />}
                                >
                                  Nuevo Contacto De Emergencia
                                </Button>
                              </Tooltip>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </div>
              </Grid>
            </Grid>
            <Divider sx={{ height: '2px', margin: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  className={classesHook.headerTitleWhite}
                  sx={{ mb: 2 }}
                >
                  CUENTAS BANCARIAS
                </Typography>
                <div className={classesHook.tableContainer}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Banco</TableCell>
                          <TableCell>Tipo De Cuenta</TableCell>
                          <TableCell>Número De Cuenta</TableCell>
                          <TableCell>Estado</TableCell>
                          {enabledDisabled() ? (
                            <TableCell>Acciones</TableCell>
                          ) : null}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedEmployee?.bankAccount
                          .filter((row) => row.accountStatusBank)
                          .map((row) => (
                            <TableRow key={row.bankAccountNumber}>
                              <TableCell>{row.bankName}</TableCell>
                              <TableCell>{row.accountTypeName}</TableCell>
                              <TableCell>{row.bankAccountNumber}</TableCell>
                              <TableCell>
                                {row.accountStatusBank ? 'Activa' : 'Inactiva'}
                              </TableCell>
                              {enabledDisabled() ? (
                                <TableCell>
                                  <div className={classesHook.iconContainer}>
                                    <Tooltip title="Editar Cuenta Bancaria">
                                      <IconButton
                                        sx={{ ml: 5 }}
                                        onClick={() => handleClickOpen(3, row)}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </div>
                                </TableCell>
                              ) : null}
                            </TableRow>
                          ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={12}
                            style={{ textAlign: 'center' }}
                          >
                            {createMode ? (
                              <Tooltip title="Nueva Cuenta Bancaria">
                                <Button
                                  onClick={() => handleNewRow(3)}
                                  startIcon={<AddCircle />}
                                >
                                  Nueva Cuenta Bancaria
                                </Button>
                              </Tooltip>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </TableContainer>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          {createMode ? (
            <>
              <Button
                startIcon={<SkipNext />}
                onClick={() => setOpenDialogAlert(true)}
                disabled={!enableNextPage}
                sx={{ margin: 2 }}
              >
                {'Siguiente Página'}
              </Button>
              <Dialog
                open={openDialogAlert}
                onClose={() => setOpenDialogAlert(false)}
              >
                <DialogContent>
                  <Alert severity="warning" icon={<Warning />}>
                    <AlertTitle sx={{ fontWeight: 'bold' }}>
                      Atención
                    </AlertTitle>
                    Los datos no se podrán modificar después de continuar.
                    ¿Estás seguro de que deseas proceder?
                  </Alert>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setOpenDialogAlert(false)}
                    color="primary"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleClickNext} color="primary">
                    Confirmar
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <>
              <Button
                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                onClick={editMode ? handleSaveClick : handleEditClick}
                sx={{ margin: 2 }}
                variant="contained"
              >
                {editMode ? 'Guardar' : 'Editar'}
              </Button>

              {editMode && (
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancelClick}
                  sx={{ margin: 2 }}
                  variant="contained"
                >
                  Cancelar
                </Button>
              )}
            </>
          )}
        </Grid>
      </CardLayout>
    </>
  );
};
