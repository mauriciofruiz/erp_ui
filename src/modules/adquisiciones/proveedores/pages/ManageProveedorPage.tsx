import { getCuentaById } from '@/backend/contabilidad';
import { downloadFileProveedor, uploadFileProducto } from '@/backend/reportes';
import {
  getAllRetencionesFuente,
  getAllRetencionesIVA,
  getBankCatalogList,
  getCityById,
  getCityByParams,
  getContribuyenteList,
  getFormaDePago,
  getIdentificacionFiscalList,
  getIdentificacionRepetida,
  getPaises,
  getParroquiaById,
  getParroquiaByParams,
  getProvinceById,
  getProvinceByParams,
  getRegimenFiscal,
  getTipoCuenta,
  getUsuarioById,
  saveProveedor,
  updateProveedor,
} from '@/backend/tba';
import { DocumentTypeEnum, ParametersEnum, PathEnum } from '@/enums';
import { FormaPagoEnum } from '@/enums/FormaPagoEnum';
import { ProveedorEnum } from '@/enums/ProveedorEnum';
import {
  PDFViewer,
  TabPanel,
  downloadPdf,
  handleApiError,
  navigateExternal,
  validateCedulaRuc,
} from '@/functions';
import {
  StyledDatePicker,
  VisuallyHiddenInput,
  useAccessDocument,
  useAccountAsync,
  useForm,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import {
  AccountType,
  BankType,
  CityType,
  DetailAccountStatus,
  FormaDePagoType,
  IdentificacionFiscalType,
  PaisType,
  ParroquiaType,
  PersonProvType,
  ProveederDataType,
  ProveedorPersonPostType,
  ProveedorPostType,
  ProvinceType,
  RegimenFiscalType,
  RetencionGeneralInterface,
  TipoContribuyenteType,
  TipoCuentaType,
  UserType,
} from '@/types';
import {
  ArrowBack,
  Description,
  Download,
  EditNote,
  Info,
  LocalGroceryStore,
  PictureAsPdf,
  Save,
  ToggleOff,
  ToggleOn,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import axios from 'axios';
import { parseISO } from 'date-fns';
import dayjs from 'dayjs';
import isEqual from 'lodash.isequal';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetalleManageProveedor } from './DetalleManageProveedor';
import { useDebounceCallback } from '@react-pdf-viewer/core';

export type ManageProveedorPageProps = {};

const initialFormState = {
  providerId: null,
  fiscalTypeId: null,
  vatRetentionId: null,
  personId: null,
  bankCatalogId: null,
  sourceRetentionId: null,
  fiscalIdentificationPaymentId: null,
  accountId: null,
  providerTypeId: ProveedorEnum.SERVICIOS,
  bankAccountTypeId: null,
  paymentConditionId: ProveedorEnum.CONTADO,
  paymentMethodId: null,
  providerCommercialName: null,
  providerAddress2: null,
  providerEmail2: null,
  providerCellphone2: null,
  providerPhone2: null,
  providerWebsite: null,
  providerContact: null,
  providerContactPosition: null,
  providerContactPhone: null,
  providerContactEmail: null,
  providerContactCellphone: null,
  isCredit: false,
  creditAmount: null,
  creditExpirationDate: new Date(),
  creditDays: null,
  warrantyAmount: null,
  creditSupportingDoc: null,
  providerBankAccountNumber: null,
  paymentReference: null,
  advancePaymentBalance: null,
  providerCheckName: null,
  specialContributor: null,
  isTransporter: false,
  vatRetentionCode1: null,
  providerRegistrationDate: '',
  providerStatus: true,
  sourceRetentionCode1: null,
  providerBankAccountId: null,
  providerBankAccountType: null,
  passiveAccount: null,
  expenseAccount: null,
  providerPhoto: null,
  provideFile: null,
  contributorTypeId: null,
  countryId: null,
  parishId: null,
  maritalStatusId: null,
  genderId: null,
  taxIdentificationId: null,
  personIdentification: null,
  personName: null,
  ersonBirthDate: null,
  personAddress: null,
  personCellphone: null,
  personPhone: null,
  personEmail: null,
  isClient: null,
  isEmployee: null,
  isProvider: null,
  personRegistrationDate: null,
  personResidenceNeighborhood: null,
  personResidenceCity: null,
  personResidenceParish: null,
  personResidenceSector: null,
  totalInvoiceValue: null,
  totalQuotaValue: null,
  totalBalanceFee: null,
  totalAdvances: null,
  totalPayable: null,
  total1to30: null,
  otal31to60: null,
  total61to90: null,
  total91more: null,
  detailAccountPayableStatus: [],
  numberInvoices: 0,
  provinceId: null,
  provinceName: '',
  cityId: null,
  cityName: '',
  parishName: '',
};

export const ManageProveedorPage: React.FC<ManageProveedorPageProps> = ({}) => {
  const {
    setFormState,
    formState,
    formErrors,
    setFormErrors,
    onValidacionRazonNombreComerial,
    onValidarCorreo,
    onInputChange,
    onInputJustNumber,
    onAutocompleteChange,
    onBooleanChange,
    onBooleanChangeClick,
    onResetForm,
    onFileChange,
    onDateChange,
  } = useForm({
    ...initialFormState,
    tipoProveedor: false,
    tributacion: '',
    createUser: '',
    modifyUser: '',
    providerFile: null,
  });

  const styles = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const location = useLocation();

  const [rows, setRows] = useState<GridRowsProp>([]);

  const providerId =
    location && location.state ? location.state.providerId : undefined;

  const [title, setTitle] = useState<string>('');

  const [createMode, setCreateMode] = useState(true);

  const [editMode, setEditMode] = useState(false);

  const [proveedorData, setProveedorData] = useState<ProveederDataType>();

  const [tabIndex, setTabIndex] = React.useState(0);

  const navigate = useNavigate();

  const prevFormState = useRef<any | undefined>(undefined);

  const [blobPdf, setBlobPdf] = useState<Blob | undefined>(new Blob());

  const [regimenFiscalList, setRegimenFiscalList] = useState<
    RegimenFiscalType[]
  >([]);

  const [paisList, setPaisList] = useState<PaisType[]>([]);

  const [parroquiaList, setParroquiaList] = useState<ParroquiaType[]>([]);

  const [contriubyenteList, setContriubyenteList] = useState<
    TipoContribuyenteType[]
  >([]);

  const [bancosList, setBancosList] = useState<BankType[]>([]);

  const [tipoCuentaList, setTipoCuentaList] = useState<TipoCuentaType[]>([]);

  const [formaDePagoList, setFormaDePagoList] = useState<FormaDePagoType[]>([]);

  const [retencionFuenteList, setRetencionFuenteList] = useState<
    RetencionGeneralInterface[]
  >([]);

  const [retencionIVAList, setRetencionIVAList] = useState<
    RetencionGeneralInterface[]
  >([]);

  const [cuentaGastosList, setCuentaGastosList] = useState<AccountType[]>([]);

  const [cuentaPasList, setCuentaPasList] = useState<AccountType[]>([]);

  const [cuentaContPasi, setCuentaContPasiList] =
    useState<AccountType | null>();

  const [identificacionFiscalList, setIdentificacionFiscalList] = useState<
    IdentificacionFiscalType[]
  >([]);

  const [provinceList, setProvinceList] = useState<ProvinceType[]>([]);

  const [cityList, setCityList] = useState<CityType[]>([]);

  const [fechaVenciomientoDate, setFechaVencimientoDate] = useState(new Date());

  const [maxLen, setMaxLen] = useState(10);

  const [error, setError] = useState({
    personIdentification: '',
    providerBankAccountId: '',
  });

  const [enableCityProvinceParsih, setEnableCityProvinceParsih] =
    useState<boolean>(false);

  const [searchCity, setSearchCity] = useState('');

  const [searchCuentaGasto, setSearchCuentaGasto] = useState('');

  const [searchCuentaPasi, setSearchCuentaPasi] = useState('');

  const [searchProv, setSearchProv] = useState('');

  const [searchParish, setParish] = useState('');

  const [condiconPago, setCondicionPago] = useState('');

  const { closeDocument } = useAccessDocument();

  const [formularioValido, setFormularioValido] = useState<boolean>(false);

  const [enabledNumeroIden, setEnabledNumeroIden] = useState<boolean>(false);

  const [enabledCupoDias, setEnabledCupoDias] = useState<boolean>(false);

  const [enabledCamposTrans, setEnabledCamposTrans] = useState<boolean>(false);

  // const [enabledidentificacionfis, setEnabledidentificacionfis] =
  //   useState<boolean>(false);

  const [enabledNroCuenta, setEnabledNroCuenta] = useState<boolean>(false);

  const [showInfo, setShowInfo] = useState(false);

  const { fetchAccountByNumber } = useAccountAsync();

  const { fetchProveedorData } = useProveedorAsync();

  //?****************************** VALIDACIONES *******************************************//
  const validarNumeroIdentificacion = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const name = event.target.name;
    // Expresión regular que solo permite letras y números
    const ciRuc = /^[0-9\s]*$/;
    const passport = /^[a-zA-z0-9\s]*$/;
    let valueForm = 0;

    if (
      formState.personIdentification === formState[name] &&
      'personIdentification' === name
    ) {
      valueForm = parseInt(formState.fiscalTypeId, 10);
    } else if (
      formState.providerBankAccountId === formState[name] &&
      'providerBankAccountId' === name
    ) {
      valueForm = formState.providerBankAccountType;
    }

    if (valueForm === parseInt(ProveedorEnum.RUC, 10)) {
      setMaxLen(13);
      if (ciRuc.test(value)) {
        if (value.length === 13) {
          if (validateCedulaRuc(value)) {
            setFormState({
              ...formState,
              [name]: value,
            });
            enqueueSnackbar(<>{'RUC Correcto'}</>, {
              variant: 'success',
            });
          } else {
            setFormState({
              ...formState,
              [name]: value,
            });
            enqueueSnackbar(<>{'RUC Incorrecto'}</>, {
              variant: 'error',
            });
          }
          setError({
            ...error,
            [name]: '',
          });
        } else {
          setFormState({
            ...formState,
            [name]: value,
          });
          setError({
            ...error,
            [name]: 'El número de caracteres tiene que ser igual a 13',
          });
        }
      }
    } else if (valueForm === parseInt(ProveedorEnum.CEDULA, 10)) {
      setMaxLen(10);
      if (ciRuc.test(value)) {
        if (value.length === 10) {
          if (validateCedulaRuc(value)) {
            setFormState({
              ...formState,
              [name]: value,
            });
            enqueueSnackbar(<>{'Cédula Correcta'}</>, {
              variant: 'success',
            });
          } else {
            setFormState({
              ...formState,
              [name]: value,
            });
            enqueueSnackbar(<>{'Cédula Incorrecta'}</>, {
              variant: 'error',
            });
          }
          setError({
            ...error,
            [name]: '',
          });
        } else {
          setFormState({
            ...formState,
            [name]: value,
          });
          setError({
            ...error,
            [name]: 'El número de caracteres tiene que ser igual a 10',
          });
        }
      }
    } else if (
      valueForm === parseInt(ProveedorEnum.PASAPORTE_IDENTIFICACION_EXT, 10)
    ) {
      if (passport.test(value)) {
        setMaxLen(13);
        if (value.length === 10) {
          setFormState({
            ...formState,
            [name]: value,
          });
          setError({
            ...error,
            [name]: '',
          });
        } else {
          setFormState({
            ...formState,
            [name]: value,
          });
          setError({
            ...error,
            [name]: 'El número de caracteres tiene que ser igual a 10',
          });
        }
      }
    }
  };

  const validarExistenciaIdentCI = async () => {
    if (enabledNumeroIden) {
      const response = await getIdentificacionRepetida(
        formState.personIdentification
      );
      if (response?.status === 409) {
        const mensajeError = response.message;
        enqueueSnackbar(
          <>{mensajeError.message + formState.personIdentification}</>,
          {
            variant: 'error',
          }
        );
        setEditMode(true);
        setCreateMode(false);
      } else {
        setEditMode(true);
        setCreateMode(true);
      }
    }
  };

  const handleMouseOver = () => {
    setShowInfo(true);
  };

  const handleMouseOut = () => {
    setShowInfo(false);
  };

  //?**************************************** FUNCIONES************************************************************************///
  const handleCancel = () => {
    if (providerId) {
      closeDocument({
        id: providerId,
        documentType: DocumentTypeEnum.PROVEEDOR,
      });
    }
    navigate(PathEnum.FICHA_PROVEEDOR);
    onResetForm();
  };

  //?**********FUNCIONES REGIMEN******************************/
  const getRegimenFisalList = async () => {
    try {
      const response = (await getRegimenFiscal()) as RegimenFiscalType[];
      if (response) {
        setRegimenFiscalList(response);
      }
    } catch (error) {
      handleApiError(error);
      return Promise.resolve([]);
    }
  };

  //?**********FUNCIONES PAÍS******************************/
  const getPaisList = async () => {
    try {
      const response = (await getPaises()) as PaisType[];
      if (response) {
        setPaisList(response);
      }
    } catch (error) {
      handleApiError(error);
      return Promise.resolve([]);
    }
  };

  //?**********FUNCIONES PARROQUIA******************************/
  useEffect(() => {
    const searchParishes = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getParroquiaByParams(searchParish.toUpperCase());
        if (response) {
          if (response.status === 200) {
            setParroquiaList(response.message);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setParroquiaList([]);
            enqueueSnackbar('No se ha encontrado la parroquia buscada', {
              variant: 'info',
            });
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };
    if (searchParish.length >= 3) {
      searchParishes();
    }
  }, [searchParish]);

  const handleAutocompleteParish = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setParish(inputValue);
    }
  };

  //?**********FUNCIONES PROVINCIA******************************/
  useEffect(() => {
    const searchProvinces = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getProvinceByParams(searchProv.toUpperCase());
        if (response) {
          if (response.status === 200) {
            setProvinceList(response.message);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setProvinceList([]);
            enqueueSnackbar('No se ha encontrado la provincia buscada', {
              variant: 'info',
            });
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };
    if (searchProv.length >= 3) {
      searchProvinces();
    }
  }, [searchProv]);

  const handleAutocompleteProvince = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchProv(inputValue);
    }
  };

  //?**********FUNCIONES CIUDAD********************************/

  useEffect(() => {
    const searchCities = async () => {
      try {
        const response: ServerResponseType | undefined = await getCityByParams(
          searchCity.toUpperCase()
        );
        if (response) {
          if (response.status === 200) {
            setCityList(response.message);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setCityList([]);
            enqueueSnackbar('No se ha encontrado la ciudad buscada', {
              variant: 'info',
            });
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };
    if (searchCity.length >= 3) {
      searchCities();
    }
  }, [searchCity]);

  const handleAutocompleteCity = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchCity(inputValue);
    }
  };

  // **************************TIPO CONTRIBUYENTE**************************************************

  const getTipoContribuyenteList = async () => {
    try {
      const response =
        (await getContribuyenteList()) as TipoContribuyenteType[];
      if (response) {
        setContriubyenteList(response);
      }
    } catch (error) {
      handleApiError(error);
      return Promise.resolve([]);
    }
  };

  //**********************OBTENER BANCOS********************************************************************/
  const getBancoList = async () => {
    try {
      const response = await getBankCatalogList();
      if (response && (response as BankType[])) {
        const bankList = response as BankType[];
        setBancosList(bankList);
      }
    } catch (error) {
      handleApiError(error);
      return Promise.resolve([]);
    }
  };

  const tipoProveedor = (param: number | undefined) => {
    if (param === ProveedorEnum.BIENES) {
      return true;
    } else {
      return false;
    }
  };

  //***********************TIPO CUENTA********************************************************************** */
  const getTipoCuentaList = async () => {
    try {
      const response = await getTipoCuenta();
      if (response) {
        setTipoCuentaList(response);
      }
    } catch (error) {
      handleApiError(error);
      return Promise.resolve([]);
    }
  };

  //************************FORMA DE PAGO********************************************** */

  const getFormaPagoList = async () => {
    try {
      const response = await getFormaDePago();
      if (response) {
        setFormaDePagoList(response);
      }
    } catch (error) {
      handleApiError(error);
      return Promise.resolve([]);
    }
  };

  //***********************RETENCION FUENTE ************************************************************/
  const fetchRetencionesFuente = async () => {
    const response = await getAllRetencionesFuente();
    if (response) {
      setRetencionFuenteList(response);
    }
  };

  //***********************RETENCION IVA ************************************************************/
  const fetchRetencionesIVA = async () => {
    const response = await getAllRetencionesIVA();
    if (response) {
      setRetencionIVAList(response);
    }
  };

  //*******************IDENTIFIACIÓN FISCAL************************************ */

  const getIdenFiscalList = async () => {
    const response = await getIdentificacionFiscalList();
    if (response) {
      setIdentificacionFiscalList(response);
    }
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle(
        'Ficha De Proveedor (Modo Edición) - ' +
          proveedorData?.provider?.providerCommercialName
      );

      enqueueSnackbar(
        <>
          {'Modo edición habilitado'}
          <br />
          {'Modo lectura deshabilitado'}
        </>,
        {
          variant: 'info',
        }
      );
    } else {
      setEditMode(false);
      setTitle(
        'Ficha De Proveedor (Modo Edición) - ' +
          proveedorData?.provider?.providerCommercialName
      );
      enqueueSnackbar(
        <>
          {'Modo edición deshabilitado'}
          <br />
          {'Modo lectura habilitado'}
        </>,
        {
          variant: 'info',
        }
      );
    }
  };

  useEffect(() => {
    const getCuentaContablePasivo = async () => {
      if (formState.countryId === ProveedorEnum.ECUADOR) {
        fetchAccountByNumber(ProveedorEnum.PROVEEDORES_NACIONALES).then(
          (response) => {
            if (response) setCuentaContPasiList(response[0]);
          }
        );
        if (cuentaContPasi) {
          setFormState({
            ...formState,
            passiveAccount: cuentaContPasi['accountId'],
          });
        }
      } else {
        fetchAccountByNumber(ProveedorEnum.PROVEEDORES_EXTERIOR).then(
          (response) => {
            if (response) setCuentaContPasiList(response[0]);
          }
        );
        if (cuentaContPasi) {
          setFormState({
            ...formState,
            passiveAccount: cuentaContPasi['accountId'],
          });
        }
      }
    };
    if (formState.countryId) {
      getCuentaContablePasivo();
    }
  }, [formState.countryId]);

  useEffect(() => {
    const validateSaveForm = () => {
      if (
        error.personIdentification === '' &&
        error.providerBankAccountId === '' &&
        formErrors.personName === undefined &&
        formErrors.providerCommercialName === undefined &&
        formErrors.providerEmail2 === undefined
      ) {
        setFormularioValido(true);
      }
    };
    if (formState) {
      validateSaveForm();
    }
  }, [formState]);

  //?**********FUNCIONES CUENTA GASTOS********************************/

  const searchCuenta = async (param: string, type: number) => {
    fetchAccountByNumber(param).then((response) => {
      if (response) {
        if (type === 1) {
          setCuentaGastosList(response);
        } else {
          setCuentaPasList(response);
        }
      }
    });
  };

  useEffect(() => {
    if (searchCuentaGasto.length >= 3) {
      searchCuenta(searchCuentaGasto, 1);
    }
  }, [searchCuentaGasto]);

  useEffect(() => {
    if (searchCuentaPasi.length >= 3) {
      searchCuenta(searchCuentaPasi, 2);
    }
  }, [searchCuentaPasi]);

  const handleAutocompleteCuentaGas = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchCuentaGasto(inputValue);
    }
  };

  const handleAutocompleteCuentaPasi = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchCuentaPasi(inputValue);
    }
  };

  const nombreComercial = async () => {
    setFormState({
      ...formState,
      providerCommercialName: formState.personName,
    });
  };

  // ? * * * * * * * * * * * * * * * * ********************* USE EFFECT * * * * * * * * * * * * * * * * * ***************************************************************//
  useEffect(() => {
    const fetchDataCuenta = async () => {
      try {
        const response: ServerResponseType | undefined = await getCuentaById(
          formState.expenseAccount
        );
        if (response) {
          if (response.status === 200 && response.message) {
            const listaResult: AccountType[] = [response.message];
            setCuentaGastosList(listaResult);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setCuentaGastosList([]);
            enqueueSnackbar(
              'No se ha encontrado la cuenta solicitada buscado',
              {
                variant: 'info',
              }
            );
          } else {
            enqueueSnackbar('Error Del Servidor: ' + error.message, {
              variant: 'error',
            });
          }
        }
      }
    };

    const fectchDataProvince = async () => {
      const response = await getProvinceById(formState.provinceId);
      if (response) {
        const listaPais: ProvinceType[] = [response];
        setProvinceList(listaPais);
      }
    };

    const fectchDataCiudad = async () => {
      const response = await getCityById(formState.cityId);
      if (response) {
        const listaCiudad: CityType[] = [response];
        setCityList(listaCiudad);
      }
    };

    const fectchDataParroquia = async () => {
      const response = await getParroquiaById(formState.parishId);
      if (response) {
        const listaParroquia: ParroquiaType[] = [response];
        setParroquiaList(listaParroquia);
      }
    };

    const setDateFechaVencimiento = async () => {
      const fechaVenci = formState.creditExpirationDate;
      setFechaVencimientoDate(moment(fechaVenci).toDate());
    };

    if (formState) {
      if (formState.expenseAccount && formState.expenseAccount !== null) {
        fetchDataCuenta();
      }
      if (formState.provinceId && formState.provinceId !== null) {
        fectchDataProvince();
      }
      if (formState.cityId && formState.cityId !== null) {
        fectchDataCiudad();
      }
      if (
        formState.creditExpirationDate &&
        formState.creditExpirationDate !== null
      ) {
        setDateFechaVencimiento();
      }
      if (
        formState.countryId &&
        formState.countryId === ProveedorEnum.ECUADOR
      ) {
        setEnableCityProvinceParsih(true);
      }
      if (formState.parishId && formState.parishId !== null) {
        fectchDataParroquia();
      }
    }
  }, [formState]);

  useEffect(() => {
    if (formState.isCredit) {
      setFormState((prevState: any) => ({
        ...prevState,
        isCredit: true,
        paymentConditionId: ProveedorEnum.CREDITO,
        paymentMethodId: '',
      }));
      setCondicionPago('CREDITO');
      setEnabledCupoDias(true);
    } else {
      setFormState((prevState: any) => ({
        ...prevState,
        isCredit: false,
        paymentConditionId: ProveedorEnum.CONTADO,
        paymentMethodId: '',
        creditAmount: '',
        creditDays: '',
      }));
      setCondicionPago('CONTADO');
      setEnabledCupoDias(false);
    }
  }, [formState.isCredit]);

  useEffect(() => {
    if (formState.tipoProveedor) {
      setFormState({
        ...formState,
        providerTypeId: ProveedorEnum.BIENES,
      });
      setCondicionPago('CREDITO');
    } else {
      setFormState({
        ...formState,
        providerTypeId: ProveedorEnum.SERVICIOS,
      });
    }
  }, [formState.tipoProveedor]);

  useEffect(() => {
    const getProviderData = async (providerId: number) => {
      const response = await fetchProveedorData(providerId);
      if (response) {
        const providerData = response as ProveederDataType;
        const details: DetailAccountStatus[] =
          providerData.accountPayableStatus.detailAccountPayableStatus;
        setProveedorData(providerData);
        if (Array.isArray(details) && details.length > 0) {
          const temporalRows = details.map((row) => ({
            id: randomId(),
            ...row,
          }));
          setRows(temporalRows);
        } else {
          setRows([]);
        }
        useDebounceCallback;
        setBlobPdf(
          await downloadFileProveedor(
            response.provider.providerId
              ? response.provider.providerId.toString()
              : ''
          )
        );
      }
    };

    getRegimenFisalList();
    getPaisList();
    getTipoContribuyenteList();
    getBancoList();
    getTipoCuentaList();
    getFormaPagoList();
    fetchRetencionesFuente();
    fetchRetencionesIVA();
    getIdenFiscalList();
    if (providerId) {
      setCreateMode(false);
      setEditMode(false);
      getProviderData(providerId);
      setEnabledNumeroIden(false);
    } else {
      setCreateMode(true);
      setEditMode(true);
      setEnabledNumeroIden(true);
    }
  }, [providerId]);

  useEffect(() => {
    setTitle(
      createMode
        ? 'Ficha De Nuevo Proveedor'
        : 'Ficha De Proveedor (Modo Lectura) - ' +
            proveedorData?.person?.personName
    );
  }, [createMode, proveedorData]);

  useEffect(() => {
    if (blobPdf && blobPdf.size === 0) {
      const blobUrl = URL.createObjectURL(blobPdf);
      setFormState((prevFormState: any) => ({
        ...prevFormState,
        providerFile: blobUrl,
      }));
    }
  }, [blobPdf]);

  /**
   * * USE EFFECT PARA CARGAR FORMDATA CON LOS DATOS DEL PROVEEDOR
   */
  useEffect(() => {
    let formPrevious: any = {};
    const fetchData = async () => {
      if (proveedorData) {
        formPrevious = {
          ...proveedorData,
          ...proveedorData.provider,
          ...proveedorData.person,
          ...proveedorData.accountPayableStatus,
          tipoProveedor: tipoProveedor(proveedorData.provider.providerTypeId),
          createUser: proveedorData.provider.creationUserId,
          modifyUser: proveedorData.provider.modificationUserId,
          dateRegister: proveedorData.provider.registrationDate,
          dateModified: proveedorData.provider.modificationDate,
        };
        setFormState(formPrevious);
      }
    };
    Promise.all([fetchData()]).then(() => {
      prevFormState.current = formPrevious;
    });
  }, [proveedorData]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let valido = true;

    const proveedor: ProveedorPostType = {
      taxIdentificationTypeId: formState.fiscalTypeId,
      ivaRetentionId: formState.vatRetentionId,
      bankCatalogId: formState.bankCatalogId,
      incomeRetentionId: formState.sourceRetentionId,
      taxIdentificationId: formState.fiscalIdentificationPaymentId,
      accountId: formState.accountId,
      providerTypeId: formState.providerTypeId,
      bankAccountTypeId: formState.bankAccountTypeId,
      paymentConditionId: formState.paymentConditionId,
      paymentCollectionFormId: formState.paymentMethodId,
      providerIdentification: formState.personIdentification,
      providerTradeName: formState.providerCommercialName,
      providerAddress2: formState.providerAddress2,
      providerEmail2: formState.providerEmail2,
      providerCellphone2: formState.providerCellphone2,
      providerPhone2: formState.providerPhone2,
      providerWebsite: formState.providerWebsite,
      providerContact: formState.providerContact,
      providerContactPosition: formState.providerContactPosition,
      providerContactPhone: formState.providerContactPhone,
      providerContactEmail: formState.providerContactEmail,
      providerContactCellphone: formState.providerContactCellphone,
      providerCredit: formState.isCredit,
      providerCreditAmount: formState.creditAmount,
      providerCreditDueDate: fechaVenciomientoDate.toISOString().slice(0, 16),
      providerCreditDays: formState.creditDays,
      providerGuaranteeAmount: formState.warrantyAmount,
      providerCreditDocument: null,
      providerBankAccountNumber: formState.providerBankAccountNumber,
      providerPaymentReference: formState.paymentReference,
      providerAdvancePaymentBalance: 0.0,
      providerCheckName: formState.providerCheckName,
      providerSpecialContribution: formState.contributorTypeId,
      providerTransportation: formState.isTransporter,
      providerIvaRetentionCode1: '01',
      providerRegistrationDate: '',
      providerStatus: formState.providerStatus,
      providerIncomeRetentionCode1: '01',
      providerBankAccountId: formState.providerBankAccountId,
      providerBankAccountType: formState.providerBankAccountType,
      providerExpenseAccount: formState.expenseAccount,
    };

    const personaProveedor: PersonProvType = {
      personId: formState.personId,
      contributorTypeId: formState.contributorTypeId,
      countryId: formState.countryId,
      parishId: formState.parishId,
      maritalStatusId: null,
      genderId: null,
      taxIdentificationId: formState.fiscalTypeId,
      personIdentification: formState.personIdentification,
      personName: formState.personName,
      personBirthDate: null,
      personAddress: formState.personAddress,
      personCellphone: formState.providerContactCellphone,
      personPhone: formState.personPhone,
      personEmail: formState.personEmail,
      isClient: null,
      isEmployee: null,
      isSupplier: null,
      personRegistrationDate: null,
      personResidenceNeighborhood: '',
      personResidenceCity: formState.cityId,
      personResidenceParish: null,
      personResidenceSector: null,
    };

    const proveedorToSave: ProveedorPersonPostType = {
      person: personaProveedor,
      provider: proveedor,
    };

    try {
      if (
        error.personIdentification !== '' ||
        error.providerBankAccountId !== ''
      ) {
        enqueueSnackbar('El número de cédula ingresado es incorrecto', {
          variant: 'error',
        });
        valido = false;
      }
      if (formErrors.personName) {
        setFormErrors({
          personName: 'El número de carateres debe ser mayor a 5',
        });
        valido = false;
      }
      if (formErrors.providerCommercialName) {
        setFormErrors({
          providerCommercialName: 'El número de carateres debe ser mayor a 5',
        });
        valido = false;
      }
      if (formErrors.providerEmail2) {
        setFormErrors({
          providerEmail2: 'El correo ingresado es incorrecto',
        });
        valido = false;
      }
      if (formErrors.providerContactEmail) {
        setFormErrors({
          providerContactEmail: 'El correo ingresado es incorrecto',
        });
        valido = false;
      }
      if (formState.fiscalTypeId === null) {
        enqueueSnackbar('Seleccione un Regimen Fiscal', {
          variant: 'error',
        });
        valido = false;
      }
      if (formErrors.personEmail) {
        enqueueSnackbar('El correo fiscal es incorrecto', {
          variant: 'error',
        });
        valido = false;
      }
      if (formState.countryId === null) {
        enqueueSnackbar('Seleccione un pais', {
          variant: 'error',
        });
        valido = false;
      } else if (formState.countryId === ProveedorEnum.ECUADOR) {
        if (formState.provinceId === null) {
          enqueueSnackbar('Seleccione una provincia', {
            variant: 'error',
          });
          valido = false;
        }
        if (formState.cityId === null) {
          enqueueSnackbar('Seleccione una ciudad', {
            variant: 'error',
          });
          valido = false;
        }
        if (formState.parishId === null) {
          enqueueSnackbar('Seleccione un parroquia', {
            variant: 'error',
          });
          valido = false;
        }
      }

      if (formState.paymentMethodId === FormaPagoEnum.TRANSFERENCIA) {
        if (formState.bankCatalogId === null) {
          enqueueSnackbar('Seleccione un Banco', {
            variant: 'error',
          });
          valido = false;
        }
        if (formState.bankAccountTypeId === null) {
          enqueueSnackbar('Seleccione un tipo de cuenta', {
            variant: 'error',
          });
          valido = false;
        }
        if (formState.providerBankAccountType === null) {
          enqueueSnackbar('Seleccione un Id Apertura Cuenta', {
            variant: 'error',
          });
          valido = false;
        }
      }
      if (formState.isCredit) {
        if (
          !formState.creditAmount ||
          formState.creditAmount === null ||
          formState.creditAmount === ''
        ) {
          enqueueSnackbar('Ingrese el cupo Autorizado', {
            variant: 'error',
          });
          valido = false;
        }
        if (
          !formState.creditDays ||
          formState.creditDays === null ||
          formState.creditDays === ''
        ) {
          enqueueSnackbar('Ingrese los días de Crédito', {
            variant: 'error',
          });
          valido = false;
        }
      }
      if (!formState.paymentMethodId || formState.paymentMethodId === null) {
        enqueueSnackbar('Seleccione una forma de pago', {
          variant: 'error',
        });
        valido = false;
      }

      if (valido) {
        const response =
          providerId !== undefined && providerId !== null
            ? await updateProveedor(providerId, proveedorToSave)
            : await saveProveedor(proveedorToSave);
        if (response) {
          if (response.status === 200) {
            enqueueSnackbar('Guardado Correctamente', {
              variant: 'success',
            });
            handleCancel();
          } else {
            if (
              response.message &&
              Object.keys(response.message).length === 0
            ) {
              enqueueSnackbar(
                `Error al guardar el proveedor: Error Interno del Servidor`,
                {
                  variant: 'error',
                }
              );
            } else {
              enqueueSnackbar(
                `Error al guardar el proveedor: ${response.message}`,
                {
                  variant: 'error',
                }
              );
            }
          }
        }
      }
    } catch (error) {
      enqueueSnackbar(`Error al guardar el proveedor: ${error}`, {
        variant: 'error',
      });
    }

    const uploadFile = async (data: FormData) => {
      const response: ServerResponseType | undefined = await uploadFileProducto(
        2,
        data
      );
      if (response) {
        if (response.status !== 200) {
          enqueueSnackbar(`Error Al Subir Imagen: ${response.message}`, {
            variant: 'error',
          });
        }
      }
    };

    if (
      formState.providerFile &&
      formState.providerFile !== null &&
      typeof formState.providerFile !== 'string'
    ) {
      const formDataPdf = new FormData();
      formDataPdf.append(
        'pdf',
        formState.providerFile,
        `${proveedor.providerTradeName}.pdf`
      );
      uploadFile(formDataPdf);
    }
  };

  useEffect(() => {
    const validarEditForm = () => {
      if (editMode) {
        if (!isEqual(prevFormState.current, formState)) {
          setFormularioValido(true);
        } else {
          setFormularioValido(false);
        }
      } else {
        setFormularioValido(false);
      }
    };
    if (providerId) {
      validarEditForm();
    }
  }, [formState, editMode]);

  useEffect(() => {
    if (formState.paymentMethodId === FormaPagoEnum.TRANSFERENCIA) {
      setEnabledCamposTrans(true);
    } else {
      setEnabledCamposTrans(false);
      setEnabledNroCuenta(false);
      setFormState({
        ...formState,
        bankCatalogId: '',
        bankAccountTypeId: '',
        providerBankAccountNumber: '',
        providerCheckName: '',
        providerBankAccountType: '',
        providerBankAccountId: '',
      });

      //setError('');
    }
  }, [formState.paymentMethodId]);

  const [creationUserName, setCreationUserName] = useState('');
  const [modifyUserName, setModifyUserName] = useState('');

  useEffect(() => {
    const fecthCreateUser = async () => {
      const response: ServerResponseType | UserType = await getUsuarioById(
        formState.createUser
      );
      if (response) {
        const user = response as UserType;
        setCreationUserName(user.nick);
      }
    };
    if (
      formState &&
      formState.createUser !== null &&
      formState.createUser !== ''
    ) {
      fecthCreateUser();
    } else {
      setCreationUserName('');
    }
  }, [formState.createUser]);

  useEffect(() => {
    const fecthModifyUser = async () => {
      const response: ServerResponseType | UserType = await getUsuarioById(
        formState.modifyUser
      );
      if (response) {
        const user = response as UserType;
        setModifyUserName(user.nick);
      }
    };
    if (
      formState &&
      formState.modifyUser !== null &&
      formState.modifyUser !== ''
    ) {
      fecthModifyUser();
    } else {
      setModifyUserName('');
    }
  }, [formState.modifyUser]);

  const [mostrarAutocomplete, setMostrarAutocomplete] = useState(true);

  const handleClick = () => {
    setMostrarAutocomplete(false);
  };

  useEffect(() => {
    if (formState.passiveAccount === null) {
      setCuentaContPasiList(null);
      return;
    }
    if (cuentaContPasi && cuentaContPasi !== null && cuentaPasList.length === 0)
      return;
    const user = cuentaPasList.find(
      (c) => c.accountId === formState.passiveAccount
    );
    if (user) {
      setCuentaContPasiList(user);
    }
  }, [formState.passiveAccount, cuentaPasList]);

  /**
   * * LO QUE SE MUESTRA EN LA PAGINA WEB
   */
  return (
    <>
      <CardLayout title={title}>
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                      <TextField
                        required={true}
                        name="personName"
                        label="Razón Social"
                        value={formState.personName}
                        onBlur={nombreComercial}
                        onChange={onValidacionRazonNombreComerial}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{
                          style: { textTransform: 'uppercase' },
                          maxLength: 500,
                        }}
                        InputLabelProps={{
                          shrink:
                            formState.personName !== '' &&
                            formState.personName != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                      {formErrors != null
                        ? formErrors.personName && (
                            <p style={{ color: 'cornsilk' }}>
                              {formErrors.personName}
                            </p>
                          )
                        : null}
                    </Grid>
                    <Grid item xs={12}>
                      <Autocomplete
                        className={styles.genericFieldStyle}
                        options={regimenFiscalList}
                        readOnly={!createMode && !editMode}
                        getOptionLabel={(option) =>
                          option.fiscalIdentificationTypeName
                        }
                        style={{ width: '100%' }}
                        onChange={(event, value) => {
                          onAutocompleteChange(
                            event,
                            'fiscalTypeId',
                            value?.fiscalIdentificationTypeId
                          );
                          if (value !== null) {
                            setFormState((prevState: any) => ({
                              ...prevState,
                              fiscalTypeId: value.fiscalIdentificationTypeId,
                              fiscalIdentificationPaymentId:
                                value.fiscalIdentificationTypeId,
                              tributacion: value.fiscalIdentificationTypeName,
                              personIdentification: '',
                            }));
                            //setError('');
                            setError({
                              ...error,
                              personIdentification: '',
                            });
                            // setEnabledidentificacionfis(true);
                          }
                          // else {
                          //   setEnabledidentificacionfis(false);
                          // }
                        }}
                        value={
                          formState.fiscalTypeId !== null
                            ? regimenFiscalList.find(
                                (regimen) =>
                                  regimen.fiscalIdentificationTypeId ===
                                  formState.fiscalTypeId
                              )
                            : null
                        }
                        filterOptions={(options) => {
                          return options.filter((option) =>
                            option.fiscalIdentificationTypeTransaction.includes(
                              ParametersEnum.TIPO_TRANSACCION_ID_FISCAL_COMPRA
                            )
                          );
                        }}
                        isOptionEqualToValue={(
                          option: RegimenFiscalType,
                          value: RegimenFiscalType
                        ) =>
                          option && value
                            ? option.fiscalIdentificationTypeId ===
                              value.fiscalIdentificationTypeId
                            : false
                        }
                        noOptionsText="Sin resultados"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Regimen Fiscal"
                            variant="outlined"
                            InputProps={{
                              ...params.InputProps,
                              className: styles.textWhiteStyle,
                            }}
                            InputLabelProps={{
                              ...params.InputLabelProps,
                              className: styles.textGreenStyle,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required={true}
                        name="personAddress"
                        label="Dirección"
                        value={formState.personAddress}
                        onChange={onInputChange}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        InputLabelProps={{
                          shrink:
                            formState.personAddress !== '' &&
                            formState.personAddress != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                      <TextField
                        required={true}
                        name="providerCommercialName"
                        label="Nombre Comercial"
                        value={formState.providerCommercialName}
                        onChange={onValidacionRazonNombreComerial}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{
                          style: { textTransform: 'uppercase' },
                          maxLength: 500,
                        }}
                        InputLabelProps={{
                          shrink:
                            formState.providerCommercialName !== '' &&
                            formState.providerCommercialName != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                      {formErrors != null
                        ? formErrors.providerCommercialName && (
                            <p style={{ color: 'cornsilk' }}>
                              {formErrors.providerCommercialName}
                            </p>
                          )
                        : null}
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required={true}
                        name="personIdentification"
                        label="Número de Identificación"
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        value={formState.personIdentification}
                        onChange={validarNumeroIdentificacion}
                        onBlur={validarExistenciaIdentCI}
                        inputProps={{
                          style: { textTransform: 'uppercase' },
                          maxLength: maxLen,
                        }}
                        InputLabelProps={{
                          shrink:
                            formState.personIdentification !== '' &&
                            formState.personIdentification != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                      {formState.personIdentification != null &&
                      error.personIdentification != ''
                        ? error && (
                            <p style={{ color: 'cornsilk' }}>
                              {error.personIdentification}
                            </p>
                          )
                        : null}
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required={true}
                        name="personEmail"
                        label="Correo Fiscal"
                        value={formState.personEmail}
                        onChange={onValidarCorreo}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        InputLabelProps={{
                          shrink:
                            formState.personEmail !== '' &&
                            formState.personEmail != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                      {formState.personEmail != null &&
                      formErrors.personEmail != ''
                        ? formErrors.personEmail && (
                            <p style={{ color: 'cornsilk' }}>
                              {formErrors.personEmail}
                            </p>
                          )
                        : null}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <Tooltip title="Estado Del Proveedor">
                        <span>
                          <Button
                            disabled={!editMode}
                            startIcon={
                              formState.providerStatus ? (
                                <ToggleOn />
                              ) : (
                                <ToggleOff />
                              )
                            }
                            onClick={() =>
                              onBooleanChangeClick(
                                'providerStatus',
                                !formState.providerStatus
                              )
                            }
                            style={{ width: '100%', height: 82 }}
                          >
                            {formState.providerStatus ? 'Activo' : 'Inactivo'}
                          </Button>
                        </span>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={3}>
                      <Tooltip title="Facturas del Proveedor">
                        <Button
                          startIcon={<Description />}
                          style={{ width: '100%', height: 82 }}
                        >
                          {formState.numberInvoices}
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={3}>
                      <Tooltip title="Número De Compras">
                        <span>
                          <Button
                            startIcon={<LocalGroceryStore />}
                            style={{ width: '100%', height: 82 }}
                            onClick={() =>
                              navigateExternal(PathEnum.ORDEN_COMPRA, {
                                state: {
                                  productPurchaseQuantity:
                                    formState.productPurchaseQuantity,
                                },
                              })
                            }
                          >
                            {formState.productPurchaseQuantity}
                          </Button>
                        </span>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={3}>
                      <Tooltip title="">
                        <span>
                          <Button
                            onMouseOver={handleMouseOver}
                            onMouseOut={handleMouseOut}
                            startIcon={<Info />}
                            style={{ width: '100%', height: 82 }}
                          >
                            {showInfo && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '5px',
                                  backgroundColor: 'white',
                                  padding: '10px',
                                  borderRadius: '10px',
                                  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
                                  zIndex: '999',
                                  maxWidth:
                                    '950px' /* ajusta el ancho máximo según sea necesario */,
                                  textAlign:
                                    'left' /* centrar el texto dentro del bocadillo */,
                                  color: 'black',
                                }}
                              >
                                <span
                                  style={{
                                    marginRight: '10px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Crea:
                                </span>
                                <span>{creationUserName}</span>
                                <br />
                                <span
                                  style={{
                                    marginRight: '10px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Modifica:
                                </span>
                                <span>{modifyUserName}</span>
                                <br />
                                <span
                                  style={{
                                    marginRight: '10px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Creación:
                                </span>
                                <span>
                                  {formState.dateRegister &&
                                  formState.dateRegister !== null &&
                                  formState.dateRegister !== ''
                                    ? formState.dateRegister.split('T')[0]
                                    : ''}
                                </span>
                                <br />
                                <span
                                  style={{
                                    marginRight: '10px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Modificación:
                                </span>
                                <span>
                                  {formState.dateModified &&
                                  formState.dateModified !== null &&
                                  formState.dateModified !== ''
                                    ? formState.dateModified.split('T')[0]
                                    : ''}
                                </span>
                              </div>
                            )}
                          </Button>
                        </span>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                      <TextField
                        required={true}
                        name="providerContactCellphone"
                        label="Celular"
                        value={formState.providerContactCellphone}
                        onChange={onInputJustNumber}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{
                          style: { textTransform: 'uppercase' },
                          maxLength: 10,
                        }}
                        InputLabelProps={{
                          shrink:
                            formState.providerContactCellphone !== '' &&
                            formState.providerContactCellphone != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Autocomplete
                        className={styles.genericFieldStyle}
                        options={paisList}
                        readOnly={!createMode && !editMode}
                        getOptionLabel={(option) => option.countryName}
                        style={{ width: '100%' }}
                        onChange={(event, value) => {
                          onAutocompleteChange(
                            event,
                            'countryId',
                            value?.countryId
                          );
                          if (value?.countryId === ProveedorEnum.ECUADOR) {
                            setEnableCityProvinceParsih(true);
                          } else {
                            setEnableCityProvinceParsih(false);
                            setMostrarAutocomplete(true);
                            setFormState((prevState: any) => ({
                              ...prevState,
                              provinceName: '',
                              cityName: '',
                              parishName: '',
                              parishId: null,
                              cityId: null,
                              provinceId: null,
                            }));
                          }
                        }}
                        value={
                          (formState.countryId !== null
                            ? paisList.find(
                                (pais) => pais.countryId === formState.countryId
                              )
                            : null) || null
                        }
                        isOptionEqualToValue={(
                          option: PaisType,
                          value: PaisType
                        ) => (option && value ? option === value : false)}
                        noOptionsText="Sin resultados"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="País"
                            variant="outlined"
                            InputProps={{
                              ...params.InputProps,
                              className: styles.textWhiteStyle,
                            }}
                            InputLabelProps={{
                              ...params.InputLabelProps,
                              className: styles.textGreenStyle,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Autocomplete
                        className={styles.genericFieldStyle}
                        options={provinceList}
                        disabled={!enableCityProvinceParsih}
                        readOnly={!createMode && !editMode}
                        getOptionLabel={(option) => option.provinceName}
                        style={{ width: '100%' }}
                        onChange={(event, value) => {
                          onAutocompleteChange(
                            event,
                            'provinceId',
                            value?.provinceId
                          );
                        }}
                        value={
                          (formState.provinceId !== null
                            ? provinceList.find(
                                (province) =>
                                  province.provinceId === formState.provinceId
                              )
                            : null) || null
                        }
                        onInputChange={handleAutocompleteProvince}
                        isOptionEqualToValue={(
                          option: ProvinceType,
                          value: ProvinceType
                        ) => (option && value ? option === value : false)}
                        noOptionsText="Sin resultados"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Provincia"
                            variant="outlined"
                            InputProps={{
                              ...params.InputProps,
                              className: styles.textWhiteStyle,
                            }}
                            InputLabelProps={{
                              ...params.InputLabelProps,
                              className: styles.textGreenStyle,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Autocomplete
                        className={styles.genericFieldStyle}
                        disabled={!enableCityProvinceParsih}
                        options={cityList}
                        readOnly={!createMode && !editMode}
                        getOptionLabel={(option) => option.cityName}
                        style={{ width: '100%' }}
                        onChange={(event, value) => {
                          onAutocompleteChange(event, 'cityId', value?.cityId);
                        }}
                        value={
                          (formState.cityId !== null
                            ? cityList.find(
                                (city) => city.cityId === formState.cityId
                              )
                            : null) || null
                        }
                        onInputChange={handleAutocompleteCity}
                        isOptionEqualToValue={(
                          option: CityType,
                          value: CityType
                        ) => (option && value ? option === value : false)}
                        noOptionsText="Sin resultados"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Ciudad"
                            variant="outlined"
                            InputProps={{
                              ...params.InputProps,
                              className: styles.textWhiteStyle,
                            }}
                            InputLabelProps={{
                              ...params.InputLabelProps,
                              className: styles.textGreenStyle,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Autocomplete
                        className={styles.genericFieldStyle}
                        disabled={!enableCityProvinceParsih}
                        options={parroquiaList}
                        readOnly={!createMode && !editMode}
                        getOptionLabel={(option) => option.parishName}
                        style={{ width: '100%' }}
                        onChange={(event, value) => {
                          onAutocompleteChange(
                            event,
                            'parishId',
                            value?.parishId
                          );
                        }}
                        value={
                          formState.parishId !== null
                            ? parroquiaList.find(
                                (parroquia) =>
                                  parroquia.parishId === formState.parishId
                              )
                            : null
                        }
                        onInputChange={handleAutocompleteParish}
                        isOptionEqualToValue={(
                          option: ParroquiaType,
                          value: ParroquiaType
                        ) => (option && value ? option === value : false)}
                        noOptionsText="Sin resultados"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Parroquia"
                            variant="outlined"
                            InputProps={{
                              ...params.InputProps,
                              className: styles.textWhiteStyle,
                            }}
                            InputLabelProps={{
                              ...params.InputLabelProps,
                              className: styles.textGreenStyle,
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                      <TextField
                        name="providerAddress2"
                        label="Dirección Alterna"
                        value={formState.providerAddress2}
                        onChange={onInputChange}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        InputLabelProps={{
                          shrink:
                            formState.providerAddress2 !== '' &&
                            formState.providerAddress2 != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="personPhone"
                        label="Teléfono"
                        value={formState.personPhone}
                        onChange={onInputJustNumber}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{
                          style: { textTransform: 'uppercase' },
                          maxLength: 10,
                        }}
                        InputLabelProps={{
                          shrink:
                            formState.personPhone !== '' &&
                            formState.personPhone != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="providerPhone2"
                        label="Teléfono Alterno"
                        value={formState.providerPhone2}
                        onChange={onInputJustNumber}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{
                          style: { textTransform: 'uppercase' },
                          maxLength: 10,
                        }}
                        InputLabelProps={{
                          shrink:
                            formState.providerPhone2 !== '' &&
                            formState.providerPhone2 != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="providerEmail2"
                        label="Correo Alterno"
                        value={formState.providerEmail2}
                        onChange={onValidarCorreo}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        InputLabelProps={{
                          shrink:
                            formState.providerEmail2 !== '' &&
                            formState.providerEmail2 != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                      {formState.providerEmail2 != null &&
                      formErrors.providerEmail2 != ''
                        ? formErrors.providerEmail2 && (
                            <p style={{ color: 'cornsilk' }}>
                              {formErrors.providerEmail2}
                            </p>
                          )
                        : null}
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="providerWebsite"
                        label="Sitio Web"
                        value={formState.providerWebsite}
                        onChange={onInputChange}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        InputLabelProps={{
                          shrink:
                            formState.providerWebsite !== '' &&
                            formState.providerWebsite != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                      <TextField
                        name="providerContact"
                        label="Nombre de Contacto"
                        value={formState.providerContact}
                        onChange={onInputChange}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        InputLabelProps={{
                          shrink:
                            formState.providerContact !== '' &&
                            formState.providerContact != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="providerContactPhone"
                        label="Número de Contacto"
                        value={formState.providerContactPhone}
                        onChange={onInputJustNumber}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{
                          style: { textTransform: 'uppercase' },
                          maxLength: 10,
                        }}
                        InputLabelProps={{
                          shrink:
                            formState.providerContactPhone !== '' &&
                            formState.providerContactPhone != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="providerContactPosition"
                        label="Cargo de Contacto"
                        value={formState.providerContactPosition}
                        onChange={onInputChange}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        InputLabelProps={{
                          shrink:
                            formState.providerContactPosition !== '' &&
                            formState.providerContactPosition != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="providerContactEmail"
                        label="Correo de Contacto"
                        value={formState.providerContactEmail}
                        onChange={onValidarCorreo}
                        InputProps={{
                          readOnly: !createMode && !editMode,
                        }}
                        inputProps={{ style: { textTransform: 'uppercase' } }}
                        InputLabelProps={{
                          shrink:
                            formState.providerContactEmail !== '' &&
                            formState.providerContactEmail != null
                              ? true
                              : false,
                        }}
                        fullWidth
                      />
                      {formState.providerContactEmail != null &&
                      formErrors.providerContactEmail != ''
                        ? formErrors.providerContactEmail && (
                            <p style={{ color: 'cornsilk' }}>
                              {formErrors.providerContactEmail}
                            </p>
                          )
                        : null}
                    </Grid>
                    <Grid item xs={12} />
                    <Grid item xs={12} />
                    <Grid item xs={12} />
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabIndex}
                onChange={(event: React.SyntheticEvent, newValue: number) => {
                  event ? setTabIndex(newValue) : null;
                }}
              >
                <Tab label="Crédito" />
                <Tab label="Impuestos" />
                <Tab label="Contabilidad" />
                <Tab label="Datos Para Pagos" />
                <Tab label="Estado de Cuenta Por Pagar" />
              </Tabs>
            </Box>
          </Box>
          <TabPanel value={tabIndex} index={0}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      disabled={!createMode && !editMode}
                      checked={formState.isCredit}
                      onChange={(event) => {
                        onBooleanChange(event, 'isCredit');
                      }}
                    />
                  }
                  label={formState.isCredit ? 'Crédito: SI' : 'Crédito: NO'}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required={enabledCupoDias}
                  name="creditAmount"
                  label="Cupo Autorizado"
                  disabled={!enabledCupoDias}
                  value={formState.creditAmount}
                  onChange={onInputJustNumber}
                  type="number"
                  InputProps={{
                    readOnly: !createMode && !editMode,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.creditAmount !== '' &&
                      formState.creditAmount != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required={enabledCupoDias}
                  name="creditDays"
                  label="Días de Crédito"
                  disabled={!enabledCupoDias}
                  value={formState.creditDays}
                  onChange={onInputJustNumber}
                  type="number"
                  InputProps={{
                    readOnly: !createMode && !editMode,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.creditDays !== '' &&
                      formState.creditDays != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="warrantyAmount"
                  label="Monto de Garantía"
                  value={formState.warrantyAmount}
                  onChange={onInputJustNumber}
                  InputProps={{
                    readOnly: !createMode && !editMode,
                  }}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  InputLabelProps={{
                    shrink:
                      formState.warrantyAmount !== '' &&
                      formState.warrantyAmount != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <StyledDatePicker
                  label="Fecha Emisión"
                  views={['year', 'month', 'day']}
                  maxDate={
                    new Date(
                      new Date().getFullYear() + 5,
                      new Date().getMonth(),
                      new Date().getDate()
                    )
                  }
                  format="dd/MM/yyyy"
                  value={
                    typeof formState.creditExpirationDate === 'string'
                      ? parseISO(formState.creditExpirationDate)
                      : formState.creditExpirationDate
                  }
                  onChange={(value) => {
                    const newDate = dayjs(value as Date)
                      .add(Number(formState.creditDays), 'day')
                      .toDate();
                    onDateChange(value as Date, 'creditExpirationDate');
                    onDateChange(newDate, 'creditExpirationDate');
                  }}
                  readOnly={!createMode && !editMode}
                  slotProps={{
                    textField: {
                      className: styles.genericFieldStyle,
                      sx: {
                        minWidth: '100%',
                      },
                      InputProps: {
                        className: styles.textWhiteStyle,
                      },
                      InputLabelProps: {
                        className: styles.textGreenStyle,
                        shrink: true,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Grid item xs={12}>
                  {formState.providerFile instanceof Blob ? (
                    <PDFViewer
                      pdfUrl={URL.createObjectURL(formState.providerFile)}
                    />
                  ) : (
                    formState.providerFile &&
                    formState.providerFile !== null && (
                      <PDFViewer pdfUrl={formState.providerFile} />
                    )
                  )}
                </Grid>
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mt: 2 }}
                >
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<PictureAsPdf />}
                    onClick={() =>
                      enqueueSnackbar(
                        'Para visualizar el nuevo archivo debe guardar el proveedor',
                        { variant: 'info' }
                      )
                    }
                  >
                    {formState.providerFile && formState.providerFile === null
                      ? 'Cargar Archivo'
                      : 'Actualizar Archivo'}
                    <VisuallyHiddenInput
                      type="file"
                      name="providerFile"
                      accept="application/pdf"
                      onChange={onFileChange}
                    />
                  </Button>
                  {blobPdf instanceof Blob && (
                    <Button
                      component="label"
                      variant="contained"
                      sx={{ ml: 2 }}
                      startIcon={<Download />}
                      onClick={async () => {
                        downloadPdf(
                          blobPdf,
                          `ficha_tecnica_${formState.providerId}.pdf`
                        );
                      }}
                    >
                      Descargar PDF
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={contriubyenteList}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) => option.contributorTypeName}
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      'contributorTypeId',
                      value?.contributorTypeId
                    );
                  }}
                  value={
                    formState.contributorTypeId !== null
                      ? contriubyenteList.find(
                          (contribuyente) =>
                            contribuyente.contributorTypeId ===
                            formState.contributorTypeId
                        )
                      : null
                  }
                  isOptionEqualToValue={(
                    option: TipoContribuyenteType,
                    value: TipoContribuyenteType
                  ) => (option && value ? option === value : false)}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo Contribuyente"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        className: styles.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: styles.textGreenStyle,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      disabled={!createMode && !editMode}
                      checked={formState.tipoProveedor}
                      onChange={(event) =>
                        onBooleanChange(event, 'tipoProveedor')
                      }
                    />
                  }
                  label={formState.tipoProveedor ? 'Bienes' : 'Servicios'}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={retencionIVAList}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) =>
                    `${option.annexCode} - ${option.detail}`
                  }
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      'vatRetentionId',
                      value?.retentionId
                    );
                  }}
                  value={
                    formState.vatRetentionId !== null
                      ? retencionIVAList.find(
                          (retencionIva) =>
                            retencionIva.retentionId ===
                            formState.vatRetentionId
                        )
                      : null
                  }
                  isOptionEqualToValue={(
                    option: RetencionGeneralInterface,
                    value: RetencionGeneralInterface
                  ) => (option && value ? option === value : false)}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Retención IVA"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        className: styles.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: styles.textGreenStyle,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={retencionFuenteList}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) =>
                    `${option.percentageValue} - ${option.detail}`
                  }
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      'sourceRetentionId',
                      value?.retentionId
                    );
                  }}
                  value={
                    formState.sourceRetentionId !== null
                      ? retencionFuenteList.find(
                          (retencionFuente) =>
                            retencionFuente.retentionId ===
                            formState.sourceRetentionId
                        )
                      : null
                  }
                  isOptionEqualToValue={(
                    option: RetencionGeneralInterface,
                    value: RetencionGeneralInterface
                  ) => (option && value ? option === value : false)}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Retención Fuente"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        className: styles.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: styles.textGreenStyle,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required={true}
                  name="tributacion"
                  label="Tributación"
                  value={formState.tributacion}
                  InputProps={{
                    readOnly: true,
                  }}
                  inputProps={{
                    style: { textTransform: 'uppercase' },
                    maxLength: 500,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.fiscalIdentificationPaymentId !== '' &&
                      formState.fiscalIdentificationPaymentId != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      disabled={!createMode && !editMode}
                      checked={formState.isTransporter}
                      onChange={(event) =>
                        onBooleanChange(event, 'isTransporter')
                      }
                    />
                  }
                  label={
                    formState.isTransporter
                      ? 'Compañia de Transporte: SI'
                      : 'Compañia de Transporte: NO'
                  }
                />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={6}>
                {mostrarAutocomplete ? (
                  <TextField
                    onClick={handleClick}
                    name="passiveAccount"
                    label="Cuenta Contable/Pasivo"
                    value={
                      cuentaContPasi && cuentaContPasi != null
                        ? `${cuentaContPasi['accountNumber']} - ${cuentaContPasi['accountDescription']}`
                        : ''
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                    inputProps={{
                      style: { textTransform: 'uppercase' },
                      maxLength: 500,
                    }}
                    InputLabelProps={{
                      shrink:
                        cuentaContPasi && cuentaContPasi != null ? true : false,
                    }}
                    fullWidth
                  />
                ) : (
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={cuentaPasList}
                    readOnly={!createMode && !editMode}
                    getOptionLabel={(option) =>
                      `${option.accountNumber} - ${option.accountName}`
                    }
                    style={{ width: '100%' }}
                    onChange={(event, value) => {
                      onAutocompleteChange(
                        event,
                        'passiveAccount',
                        value?.accountId
                      );
                    }}
                    value={cuentaContPasi}
                    onInputChange={handleAutocompleteCuentaPasi}
                    isOptionEqualToValue={(
                      option: AccountType,
                      value: AccountType
                    ) => (option && value ? option === value : false)}
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cuenta Contable/Pasivo"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          className: styles.textWhiteStyle,
                        }}
                        InputLabelProps={{
                          ...params.InputLabelProps,
                          className: styles.textGreenStyle,
                        }}
                      />
                    )}
                  />
                )}
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={cuentaGastosList}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) =>
                    `${option.accountNumber} - ${option.accountName}`
                  }
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      'expenseAccount',
                      value?.accountId
                    );
                  }}
                  value={
                    formState && formState.expenseAccount !== null
                      ? cuentaGastosList.find(
                          (cuentaContable) =>
                            cuentaContable.accountId ===
                            formState.expenseAccount
                        ) || null
                      : null
                  }
                  onInputChange={handleAutocompleteCuentaGas}
                  isOptionEqualToValue={(
                    option: AccountType,
                    value: AccountType
                  ) => (option && value ? option === value : false)}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cuenta Gastos"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        className: styles.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: styles.textGreenStyle,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={tabIndex} index={3}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={6}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={bancosList}
                  disabled={!enabledCamposTrans}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) => option.bankCatalogName}
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      'bankCatalogId',
                      value?.bankCatalogId
                    );
                  }}
                  value={
                    formState.bankCatalogId !== null
                      ? bancosList.find(
                          (banco) =>
                            banco.bankCatalogId === formState.bankCatalogId
                        )
                      : null
                  }
                  isOptionEqualToValue={(option: BankType, value: BankType) =>
                    option && value ? option === value : false
                  }
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Banco"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        className: styles.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: styles.textGreenStyle,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={tipoCuentaList}
                  disabled={!enabledCamposTrans}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) => option.accountTypeName}
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      'bankAccountTypeId',
                      value?.accountTypeId
                    );
                  }}
                  value={
                    formState.bankAccountTypeId !== null
                      ? tipoCuentaList.find(
                          (contribuyente) =>
                            contribuyente.accountTypeId ===
                            formState.bankAccountTypeId
                        )
                      : null
                  }
                  isOptionEqualToValue={(
                    option: TipoCuentaType,
                    value: TipoCuentaType
                  ) => (option && value ? option === value : false)}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo Cuenta"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        className: styles.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: styles.textGreenStyle,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="providerBankAccountNumber"
                  label="Número de Cuenta"
                  required={enabledCamposTrans}
                  disabled={!enabledCamposTrans}
                  value={formState.providerBankAccountNumber}
                  onChange={onInputJustNumber}
                  type="number"
                  InputProps={{
                    readOnly: !createMode && !editMode,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.providerBankAccountNumber !== '' &&
                      formState.providerBankAccountNumber != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="providerCheckName"
                  label="Nombre de Cheque"
                  disabled={!enabledCamposTrans}
                  value={formState.providerCheckName}
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode && !editMode,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.providerCheckName !== '' &&
                      formState.providerCheckName != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={identificacionFiscalList}
                  disabled={!enabledCamposTrans}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) => option.taxIdentificationName}
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      'providerBankAccountType',
                      value?.taxIdentificationId
                    );
                    if (value !== null) {
                      setFormState((prevState: any) => ({
                        ...prevState,
                        providerBankAccountId: '',
                      }));
                      setEnabledNroCuenta(true);
                      setError({
                        ...error,
                        providerBankAccountId: '',
                      });
                    } else {
                      setEnabledNroCuenta(false);
                    }
                  }}
                  value={
                    formState.providerBankAccountType !== null
                      ? identificacionFiscalList.find(
                          (ideFiscal) =>
                            ideFiscal.taxIdentificationId ===
                            formState.providerBankAccountType
                        )
                      : null
                  }
                  isOptionEqualToValue={(
                    option: IdentificacionFiscalType,
                    value: IdentificacionFiscalType
                  ) => (option && value ? option === value : false)}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ID. Apertura Cuenta"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        className: styles.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: styles.textGreenStyle,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="providerBankAccountId"
                  label="N. ID Apertura"
                  disabled={!enabledCamposTrans || !enabledNroCuenta}
                  required={enabledCamposTrans}
                  value={formState.providerBankAccountId}
                  onChange={validarNumeroIdentificacion}
                  inputProps={{
                    readOnly: !createMode && !editMode,
                    maxLength: maxLen,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.providerBankAccountId !== '' &&
                      formState.providerBankAccountId != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
                {formState.providerBankAccountId !== null &&
                error.providerBankAccountId != ''
                  ? error && (
                      <p style={{ color: 'cornsilk' }}>
                        {error.providerBankAccountId}
                      </p>
                    )
                  : null}
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="paymentConditionId"
                  label="Condición de Pago"
                  value={condiconPago}
                  InputProps={{
                    readOnly: !createMode && !editMode,
                  }}
                  InputLabelProps={{
                    shrink:
                      condiconPago !== '' && condiconPago != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={formaDePagoList}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) =>
                    option.paymentCollectionMethodAlias
                  }
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      'paymentMethodId',
                      value?.paymentCollectionMethodId
                    );
                  }}
                  value={
                    formState.paymentMethodId !== null
                      ? formaDePagoList.find(
                          (formaPago) =>
                            formaPago.paymentCollectionMethodId ===
                            formState.paymentMethodId
                        )
                      : null
                  }
                  filterOptions={(options) => {
                    if (formState.isCredit) {
                      return options.filter(
                        (option) => option.paymentCollectionMethodId !== '01'
                      );
                    } else {
                      return options;
                    }
                  }}
                  isOptionEqualToValue={(
                    option: FormaDePagoType,
                    value: FormaDePagoType
                  ) => (option && value ? option === value : false)}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Forma de Pago"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        className: styles.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: styles.textGreenStyle,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={tabIndex} index={4}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={4}>
                <TextField
                  name="totalQuotaValue"
                  label="Saldo Pendiente"
                  value={formState.totalQuotaValue}
                  onChange={onInputChange}
                  type="number"
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.totalQuotaValue !== '' &&
                      formState.totalQuotaValue != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="totalAdvances"
                  label="Anticipos"
                  value={formState.totalAdvances}
                  onChange={onInputChange}
                  type="number"
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.totalAdvances !== '' &&
                      formState.totalAdvances != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="totalPayable"
                  label="Total por pagar"
                  value={formState.totalPayable}
                  onChange={onInputChange}
                  type="number"
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.totalPayable !== '' &&
                      formState.totalPayable != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <DetalleManageProveedor
                  formState={formState}
                  setFormState={setFormState}
                  createMode={createMode}
                  editMode={editMode}
                  rows={rows}
                  setRows={setRows}
                />
              </Grid>
              <Grid item xs={4}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <TextField
                      name="totalInvoiceValue"
                      label="Total Vigente"
                      value={formState.totalInvoiceValue}
                      onChange={onInputChange}
                      type="number"
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink:
                          formState.totalPayable !== '' &&
                          formState.totalPayable != null
                            ? true
                            : false,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="total1to30"
                      label="Total de 1 a 30"
                      value={formState.total1to30}
                      onChange={onInputChange}
                      type="number"
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink:
                          formState.totalPayable !== '' &&
                          formState.totalPayable != null
                            ? true
                            : false,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="total31to60"
                      label="Total de 31 a 60"
                      value={formState.total31to60}
                      onChange={onInputChange}
                      type="number"
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink:
                          formState.totalPayable !== '' &&
                          formState.totalPayable != null
                            ? true
                            : false,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="total61to90"
                      label="Total de 61 a 90"
                      value={formState.total61to90}
                      onChange={onInputChange}
                      type="number"
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink:
                          formState.totalPayable !== '' &&
                          formState.totalPayable != null
                            ? true
                            : false,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="total91more"
                      label="Total +91"
                      value={formState.total91more}
                      onChange={onInputChange}
                      type="number"
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink:
                          formState.totalPayable !== '' &&
                          formState.totalPayable != null
                            ? true
                            : false,
                      }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4} />
              <Grid item xs={4}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                  <Grid item xs={12} />
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Button
              startIcon={<ArrowBack />}
              sx={{ margin: 2 }}
              onClick={() => {
                navigate(PathEnum.FICHA_PROVEEDOR);
                handleCancel();
              }}
              style={{ width: '150px' }}
            >
              {'Regresar'}
            </Button>
            {!createMode && (
              <Button
                startIcon={<EditNote />}
                sx={{ margin: 2 }}
                onClick={onEditButtonClick}
                style={{ width: '150px' }}
              >
                {!editMode ? 'Editar' : 'Leer'}
              </Button>
            )}
            {formularioValido && (
              <Button
                startIcon={<Save />}
                sx={{ margin: 2 }}
                type="submit"
                style={{ width: '150px' }}
              >
                {'Guardar'}
              </Button>
            )}
          </Grid>
        </form>
      </CardLayout>
    </>
  );
};
