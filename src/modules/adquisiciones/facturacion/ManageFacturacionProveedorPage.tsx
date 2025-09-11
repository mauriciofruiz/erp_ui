'use client';
import {
  getAllRetencionesFuente,
  getAllRetencionesIVA,
  getAllSustentoTributario,
  getAllTipoComprobante,
  getCuentaById,
} from '@/backend';
import {
  ComprobanteEstadoEnum,
  ComprobanteTypeEnum,
  CondicionPagoEnum,
  DocumentTypeEnum,
  EstadoDocumentoEnum,
  EstadoOrdenEnum,
  ParametersEnum,
  PathEnum,
  TipoDetalleFacturaEnum,
  TipoLiquidacionEnum,
  TitlesEnum,
} from '@/enums';
import {
  extractDateFromAutorizacion,
  extractFacturaNumber,
  handleApiError,
} from '@/functions';
import {
  FormState,
  StyledDatePicker,
  useAccessDocument,
  useAccountAsync,
  useAllowAdquisicion,
  useDocumentAsync,
  useFacturaProveedorAsync,
  useForm,
  useImpuestoDocumentoAsync,
  useOrdenCompraAsync,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import {
  AccountType,
  DetalleFacturaProveedorResponseInterface,
  FacturaProveedorResponseInterface,
  ImpuestoDocumentoInterface,
  OrdenCompraGetType,
  PersonProviderType,
  ReembolsoPostPutType,
  RetencionGeneralInterface,
  RetencionGroupType,
  RetencionType,
  SucursalType,
  TaxSupportInterface,
  VoucherTypeInterface,
} from '@/types';
import { ToggleOff, ToggleOn } from '@mui/icons-material';
import {
  Autocomplete,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
} from '@mui/material';
import {
  GridColumnVisibilityModel,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { randomId } from '@mui/x-data-grid-generator';
import { parseISO } from 'date-fns';
import dayjs from 'dayjs';
import isEqual from 'lodash.isequal';
import { useSnackbar } from 'notistack';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AccordionOrdenes } from './components/AccordionOrdenes';
import { ActionButtons } from './components/ActionButtons';
import { ColumnsDefinition } from './components/ColumnsDefinition';
import { CustomDialog } from '../../layout/CustomDialog';
import { CustomFooterFacturaC } from './components/CustomFooterFacturaC';
import { CustomToolbar } from './components/CustomToolbar';
import { setDetails, setHeader } from './SubmitFunctions';
import { useGridApiRef } from '@mui/x-data-grid';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { DocumentosExternos } from './components/DocumentosExternos';
import { ReembolsoDialog } from './components/ReembolsoDialog';

export type ManageFacturacionProveedorPageProps = {
  // types...
};

const initialState: FormState = {
  providerInvoiceId: null,
  providerInvoiceNumber: '',
  entryId: null,
  branchId: null,
  branchName: '',
  providerInvoiceAuthorizationNumber: '',
  paymentConditionId: null,
  paymentConditionName: '',
  creditDays: 0,
  contributorTypeId: '',
  contributorTypeName: '',
  providerId: null,
  providerName: '',
  providerIdentification: '',
  personId: null,
  personName: '',
  paymentMethodId: '',
  paymentMethodName: '',
  providerInvoiceIssueDate: new Date(),
  providerInvoiceRegistrationDate: new Date(),
  providerInvoiceDueDate: null,
  providerInvoiceSubtotal: 0,
  providerInvoiceSubtotal2: 0,
  totalTaxes: 0,
  providerInvoiceTotal: 0,
  providerInvoiceStatusId: EstadoDocumentoEnum.GENERADO,
  providerInvoiceStatusName: '',
  userId: 0,
  userName: '',
  voucherTypeCode: '',
  voucherTypeName: '',
  paymentTypeId: 0,
  paymentTypeName: '',
  liquidationTypeId: 0,
  liquidationTypeName: '',
  taxSupportId: '',
  taxSupportName: '',
  retentionId: null,
  retentionNumber: 'RETENCIÓN ACTIVADA',
  retentionSourceId: null,
  retentionIVAId: null,
  observation: '',
  relatedDocumentId2: null,
  relatedDocumentId: null,
  providerInvoiceVAT: 0,
  providerInvoiceVAT2: 0,
  providerInvoiceToPay: 0,
  providerInvoiceRetention: 0,
  providerInvoiceDiscount: 0,
  registrationDate: new Date(),
  modificationDate: new Date(),
  creationUserId: null,
  modificationUserId: null,
  details: [],
  purchaseOrderList: [],
  isForeign: false,
  importOpeningId: null,
  importOpeningCode: '',
  hasOrder: false,
  reserveEntryId: null,
  extraEntryId: null,
  cardAccountId: null,
  ncValue: 0,
  ndValue: 0,
  paidValue: 0,
};

const initialStateDetalle: FormState = {
  detailId: null,
  providerInvoiceId: null,
  productId: null,
  productCode: '',
  providerProductCode: '',
  productName: '',
  quantity: 0,
  unitPrice: 0,
  discount: 0,
  priceWithoutTax: 0,
  hasIva: true,
  taxValue: 0,
  totalPrice: 0,
  isTaxCredit: true,
  retentionSourceId: null,
  retentionIVAId: null,
  branchId: null,
  employeeId: null,
  detailTypeId: null,
  taxRateId: Number(ParametersEnum.TAX_RATE_ID_DEFAULT),
  projectId: null,
  groupId: null,
  providerId: null,
  clientId: null,
  cashId: null,
  unitMeasureId: null,
  importOpeningId: null,
  taxableBase: 0,
};

export const ManageFacturacionProveedorPage: React.FC<
  ManageFacturacionProveedorPageProps
> = ({}) => {
  // ********************* DECLARACION DE VARIABLES *********************

  const apiRef = useGridApiRef();

  const styles = useStyles();

  const location = useLocation();

  const { saveFacturaBackEnd, updateFacturaBackEnd, fetchFacturaResponseById } =
    useFacturaProveedorAsync();

  const { validateExistDocumentAsync } = useDocumentAsync();

  const [taxes, setTaxes] = useState<ImpuestoDocumentoInterface[]>([]);

  const [rowsReembolsos, setRowsReembolsos] = useState<GridRowsProp>([]);

  const { fetchOrdenCompraById, fetchOrdenesCompraByProveedor } =
    useOrdenCompraAsync();

  const { fetchByDocument } = useImpuestoDocumentoAsync();

  const facturaXml: FacturaProveedorResponseInterface =
    location && location.state && location.state.facturaXml
      ? location.state.facturaXml
      : localStorage.getItem('state')
      ? JSON.parse(localStorage.getItem('state') || '').facturaXml || undefined
      : undefined;

  const facturaId =
    location && location.state && location.state.facturaId
      ? location.state.facturaId
      : localStorage.getItem('state')
      ? JSON.parse(localStorage.getItem('state') || '').facturaId || undefined
      : undefined;

  const voucherTypeCode =
    location && location.state && location.state.voucherTypeCode
      ? location.state.voucherTypeCode
      : localStorage.getItem('state')
      ? JSON.parse(localStorage.getItem('state') || '').voucherTypeCode ||
        undefined
      : undefined;

  const [facturaSelected, setFacturaSelected] =
    useState<FacturaProveedorResponseInterface>();

  const [openReembolsosDialog, setOpenReembolsoDialog] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  const { sucursales, impuestos } = useSelector(
    (state: RootState) => state.common
  );

  const [createMode, setCreateMode] = useState(true);

  const [editMode, setEditMode] = useState(false);

  const sucursalUser = useMemo(
    () => sucursales.find((s) => s.branchId === user?.branchId),
    [sucursales, user?.branchId]
  );

  const { closeDocument } = useAccessDocument();

  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const prevFormState = useRef<FormState | undefined>(undefined);

  const prevRows = useRef<GridRowsProp | undefined>(undefined);

  const {
    formState,
    setFormState,
    onInputChange,
    onDateChange,
    onAutocompleteChange,
  } = useForm(initialState);

  const { enableEditingFProvider, adquisicionPeriodo } = useAllowAdquisicion();

  const [proveedoresList, setProveedoresList] = useState<PersonProviderType[]>(
    []
  );

  const [isEditable, setIsEditable] = useState(false);

  const [isService, setIsService] = useState(false);

  const condicionesPagoOptions = Object.keys(CondicionPagoEnum)
    .filter((key): key is keyof typeof CondicionPagoEnum => isNaN(Number(key)))
    .map((key) => ({ label: key, value: CondicionPagoEnum[key] }));

  const [thereIsRetention, setThereIsRetention] = useState(true);

  const metodoPagoOptions = Object.keys(TipoLiquidacionEnum)
    .filter((key): key is keyof typeof TipoLiquidacionEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, value: TipoLiquidacionEnum[key] };
    });

  const [thereIsChanges, setThereIsChanges] = useState<boolean>(false);

  const [dialogMessage, setDialogMessage] = useState('');

  const [isAnulation, setIsAnulation] = useState(false);

  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  const [groupedRetenciones, setGroupedRetenciones] = useState<
    RetencionGroupType[]
  >([]);

  const [taxSupportList, setTaxSupportList] = useState<TaxSupportInterface[]>(
    []
  );

  const [voucherTypeList, setVoucherTypeList] = useState<
    VoucherTypeInterface[]
  >([]);

  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<OrdenCompraGetType>();

  const [validatedByOrden, setValidatedByOrden] = useState(false);

  const [validatedRetentionValue, setValidatedRetentionValue] = useState(false);

  const [existDocumentNumber, setExistDocumentNumber] = useState(false);

  const { fetchAccountCreditCard } = useAccountAsync();

  const [listaTarjetas, setListaTarjetas] = useState<AccountType[]>([]);

  const { fetchByParam } = useProveedorAsync();

  useEffect(() => {
    if (
      formState.liquidationTypeId === TipoLiquidacionEnum.TARJETA_DE_CREDITO
    ) {
      const fetchCreditCards = async () => {
        const account = await fetchAccountCreditCard();
        if (Array.isArray(account)) {
          setListaTarjetas(account);
        } else {
          setListaTarjetas([]);
        }
      };

      fetchCreditCards();
    } else {
      setListaTarjetas([]);
    }
  }, [formState.liquidationTypeId]);

  // * * * * * * * * * * * * *  RETENCIONES * * * * * * * * * * * * * * *
  const [retencionFuenteList, setRetencionFuenteList] = useState<
    RetencionGeneralInterface[]
  >([]);

  const [retencionIVAList, setRetencionIVAList] = useState<
    RetencionGeneralInterface[]
  >([]);

  const [retencionList, setRetencionList] = useState<RetencionType[]>([]);

  useEffect(() => {
    let retencionList: RetencionType[] = [];
    if (retencionFuenteList && retencionFuenteList.length > 0) {
      retencionList = retencionFuenteList.map((retencion) => {
        return {
          retentionId: retencion.retentionId,
          retencionCode: retencion.annexCode,
          retentionDetail: retencion.detail,
          retentionPercentage: retencion.percentageValue,
          retentionType: ParametersEnum.RETENCION_FUENTE_PARAMETER.toString(),
        };
      });
    }
    if (retencionIVAList && retencionIVAList.length > 0) {
      retencionList = [
        ...retencionList,
        ...retencionIVAList.map((retencion) => {
          return {
            retentionId: retencion.retentionId,
            retencionCode: retencion.annexCode,
            retentionDetail: retencion.detail,
            retentionPercentage: retencion.percentageValue,
            retentionType: ParametersEnum.RETENCION_IVA_PARAMETER.toString(),
          };
        }),
      ];
    }
    setRetencionList(retencionList);
  }, [retencionFuenteList, retencionIVAList]);

  const getRetencionesNamesByDetalles = useCallback(
    (retentionSourceId?: number, retentionIVAId?: number) => {
      if (!retencionList) return [];
      let retencionsReturn = [];
      if (retentionSourceId) {
        const retencionFuente: RetencionType | undefined = retencionList.find(
          (retencion) =>
            retencion.retentionId === retentionSourceId &&
            retencion.retentionType ===
              ParametersEnum.RETENCION_FUENTE_PARAMETER.toString()
        );
        if (retencionFuente) {
          retencionsReturn.push(retencionFuente);
        }
      }
      if (retentionIVAId) {
        const retencionIva: RetencionType | undefined = retencionList.find(
          (retencion) =>
            retencion.retentionId === retentionIVAId &&
            retencion.retentionType ===
              ParametersEnum.RETENCION_IVA_PARAMETER.toString()
        );
        if (retencionIva) {
          retencionsReturn.push(retencionIva);
        }
      }

      return retencionsReturn;
    },
    [retencionList]
  );

  const fetchTaxes = async (id: number) => {
    const taxesResponse = await fetchByDocument(id, null, null);
    setTaxes(taxesResponse as ImpuestoDocumentoInterface[]);
  };

  // ********************************** DATA GRID *********************************************
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      providerProductCode: false,
      retentions: false,
      branchName: false,
      employeeName: false,
      taxRateId: false,
      discount: false,
      importOpeningCode: false,
    });

  /**
   * Handles the editing of rows in the ManageFacturacionProveedorPage component.
   *
   * @param existingRow - The existing row to be updated.
   * @param currentRow - The current row with updated values.
   */
  const handleEmptyRows = (currentRow: any) => {
    enqueueSnackbar(`No se puede guardar una registro sin un item`, {
      variant: 'info',
    });
    const updatedRows = rows.filter((row) => row.id !== currentRow?.id);

    setRows(updatedRows);
  };

  const columns = ColumnsDefinition({
    createMode,
    editMode,
    rows,
    setRows,
    providerId: formState.providerId,
    retencionList,
    sucursales,
    rowModesModel,
    setRowModesModel,
    handleEmptyRows,
    invoiceStatusId: formState.providerInvoiceStatusId,
    impuestos,
    isForeign: formState.isForeign,
    totalValue: formState.providerInvoiceToPay,
  });

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    const currentRow = rows.find((row) => row.id === params.id);
    if (!currentRow) return;

    const emptyRow = currentRow.productId === null;

    if (emptyRow) {
      handleEmptyRows(currentRow);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  // ********************* USE EFFECTS *********************
  useEffect(() => {
    const fetchRetencionesFuente = async () => {
      const response = await getAllRetencionesFuente();
      if (response) {
        setRetencionFuenteList(response);
      }
    };
    const fetchRetencionesIVA = async () => {
      const response = await getAllRetencionesIVA();
      if (response) {
        setRetencionIVAList(response);
      }
    };

    const fetchAllSustentoTributario = async () => {
      const response = await getAllSustentoTributario();
      if (response) {
        setTaxSupportList(response);
      }
    };

    const fetchAllTipoComprobante = async () => {
      const response = await getAllTipoComprobante();
      if (response) {
        const list: VoucherTypeInterface[] = response.filter(
          (voucherType) =>
            voucherType.voucherTypeCode === ComprobanteTypeEnum.FACTURA ||
            voucherType.voucherTypeCode === ComprobanteTypeEnum.LIQUIDACION
        );
        setVoucherTypeList(list);
      }
    };

    fetchRetencionesFuente();
    fetchRetencionesIVA();
    fetchAllSustentoTributario();
    fetchAllTipoComprobante();
  }, []);

  useEffect(() => {
    const getFacturaResponse = async (
      id: number,
      idTipoComprobante: string
    ) => {
      const response = await fetchFacturaResponseById(id, idTipoComprobante);
      setFacturaSelected(response as FacturaProveedorResponseInterface);
    };

    if (facturaId && voucherTypeCode) {
      getFacturaResponse(facturaId, voucherTypeCode);
      fetchTaxes(facturaId);
    }
  }, [facturaId, voucherTypeCode]);

  useEffect(() => {
    if (facturaSelected) {
      const enableEditing =
        facturaSelected.providerInvoiceStatusId !== EstadoDocumentoEnum.ANULADO
          ? enableEditingFProvider(
              facturaSelected &&
                facturaSelected.providerInvoiceStatusId !== null
                ? facturaSelected.providerInvoiceStatusId
                : EstadoDocumentoEnum.GENERADO,
              facturaSelected.providerInvoiceIssueDate ?? new Date()
            )
          : false;
      setFormState({
        ...facturaSelected,
      });

      prevFormState.current = facturaSelected;

      Promise.all(
        facturaSelected.details.map(async (detail) => {
          const retentions = await getRetencionesNamesByDetalles(
            detail.retentionSourceId || undefined,
            detail.retentionIVAId || undefined
          );
          const sucursal = sucursales.find(
            (s) => s.branchId === detail.branchId
          );
          return {
            id: randomId(),
            branchName: sucursal?.name ?? '',
            retentions,
            status: true,
            ...detail,
            taxRateId: detail.taxRateId ?? ParametersEnum.TAX_RATE_ID_DEFAULT,
          };
        })
      ).then((rows) => {
        prevRows.current = rows;
        setRows(rows);
      });

      getProveedoresListByParam(facturaSelected.personName);
      setCreateMode(false);

      setIsEditable(enableEditing);
    }
  }, [facturaSelected]);

  useEffect(() => {
    if (facturaSelected) {
      setTitle(
        createMode
          ? 'Nueva Facturación De Proveedor'
          : 'Facturación Proveedor (Modo Lectura) - N° ' +
              facturaSelected.providerInvoiceNumber
      );
    }
  }, [createMode, facturaSelected]);

  useEffect(() => {
    if (facturaXml) {
      const enableEditing = enableEditingFProvider(
        EstadoDocumentoEnum.GENERADO,
        facturaXml.providerInvoiceIssueDate ?? new Date()
      );
      setIsEditable(enableEditing);

      setFormState({
        ...facturaXml,
        branchId: sucursalUser?.branchId ?? null,
        branchName: sucursalUser?.name ?? '',
        observation: `${facturaXml.personName} - N° Factura: ${facturaXml.providerInvoiceNumber}. `,
        isControlledRetencion: true,
        relatedDocumentId: null,
      });

      setCreateMode(!facturaId);
      setTitle(
        facturaId
          ? 'Editar Factura de Proveedor'
          : 'Factura Importada de Proveedor'
      );
      Promise.all(
        facturaXml.details.map(async (detail) => {
          const retentions: RetencionType[] =
            await getRetencionesNamesByDetalles(
              detail.retentionSourceId || undefined,
              detail.retentionIVAId || undefined
            );
          return {
            id: randomId(),
            branchName: '',
            employeeName: '',
            retentions,
            status: true,
            ...detail,
          };
        })
      ).then((rows) => {
        setRows(rows);
      });

      getProveedoresListByParam(facturaXml.providerIdentification);
    } else if (createMode) {
      setTitle('Crear Factura de Proveedor');
      setIsEditable(true);
    }
  }, [facturaXml, getRetencionesNamesByDetalles, createMode]);

  useEffect(() => {
    if (rows.length > 0) {
      const thereIsServiceType = rows.some(
        (row) => row.detailTypeId === TipoDetalleFacturaEnum.SERVICIOS
      );
      setIsService(thereIsServiceType);
    } else {
      setIsService(true);
      return;
    }

    if (
      !isEqual(prevFormState.current, formState) ||
      !isEqual(prevRows.current, rows)
    ) {
      let sameTotal = true;
      if (
        formState.providerInvoiceStatusId &&
        prevFormState.current &&
        prevFormState.current.providerInvoiceStatusId &&
        formState.providerInvoiceStatusId === EstadoDocumentoEnum.CONFIRMADO
      ) {
        sameTotal =
          prevFormState.current.providerInvoiceTotal ===
          formState.providerInvoiceTotal;
      }
      if (!sameTotal && editMode) {
        enqueueSnackbar(
          'El total de la factura ha cambiado, por favor verifique los datos cambiados',
          {
            variant: 'error',
          }
        );
      }
      setThereIsChanges(sameTotal);
    } else {
      setThereIsChanges(false);
    }
  }, [formState, rows]);

  useEffect(() => {
    if (isService) {
      setValidatedByOrden(true);
    } else if (
      selectedPurchaseOrder &&
      selectedPurchaseOrder.totalValue === formState.providerInvoiceTotal
    ) {
      setValidatedByOrden(true);
    } else {
      setValidatedByOrden(false);
    }
  }, [isService, selectedPurchaseOrder, formState.providerInvoiceTotal]);

  useEffect(() => {
    const updateRetenciones = groupedRetenciones.map((group) => {
      return {
        ...group,
        isControlled: formState.isControlledRetencion,
      };
    });

    setGroupedRetenciones(updateRetenciones);
  }, [formState.isControlledRetencion]);

  useEffect(() => {
    const fetchSelectedOrden = async () => {
      if (
        !isService &&
        !createMode &&
        formState.relatedDocumentId &&
        formState.relatedDocumentId !== null
      ) {
        const selectedOrden = await fetchOrdenCompraById(
          formState.relatedDocumentId
        );
        setSelectedPurchaseOrder(selectedOrden as OrdenCompraGetType);
      }
    };

    fetchSelectedOrden();
  }, [createMode, isService, formState.relatedDocumentId]);

  useEffect(() => {
    const fetchValidatedDocument = async () => {
      if (
        !formState.isForeign &&
        formState.providerInvoiceNumber &&
        (prevFormState.current === undefined ||
          prevFormState.current.providerInvoiceNumber !==
            formState.providerInvoiceNumber)
      ) {
        const validatedDocument = await validateExistDocumentAsync(
          formState.providerId,
          ComprobanteTypeEnum.FACTURA,
          formState.providerInvoiceNumber
        );
        setExistDocumentNumber(validatedDocument as boolean);

        if (validatedDocument) {
          enqueueSnackbar(
            'El número de factura ya está registrada para este proveedor',
            {
              variant: 'error',
            }
          );
        }
      }
    };

    if (createMode || editMode) fetchValidatedDocument();
  }, [
    formState.providerInvoiceNumber,
    formState.isForeign,
    createMode,
    editMode,
  ]);

  useEffect(() => {
    if (formState.providerInvoiceIssueDate && formState.creditDays) {
      const newDate = dayjs(formState.providerInvoiceIssueDate as Date)
        .add(Number(formState.creditDays), 'day')
        .toDate();
      setFormState({
        ...formState,
        providerInvoiceDueDate: newDate,
      });
    }
  }, [formState.providerInvoiceIssueDate, formState.creditDays]);

  // ********************* FUNCIONES ***********************

  /**
   * Handles the cancel action for the factura (invoice) management page.
   */
  const handleCancel = () => {
    const idFactura = facturaXml ? facturaXml.providerInvoiceId : facturaId;
    if (idFactura) {
      closeDocument({
        id: idFactura,
        documentType: DocumentTypeEnum.FACTURA_COMPRA,
      });
    }
    navigate(PathEnum.FACTURA_PROVEEDOR);
  };

  /**
   * Handles the input change event for the proveedor input field.
   * Calls the getProveedoresListByParam function if the input value is longer than 3 characters.
   *
   * @param event - The input change event.
   * @param inputValue - The current value of the input field.
   */
  const onInputChangeProveedor = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event && inputValue.length > 3) {
      try {
        await getProveedoresListByParam(inputValue);
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  /**
   * Retrieves a list of providers based on a given parameter.
   * @param param - The parameter used to filter the providers list.
   */
  const getProveedoresListByParam = async (param: string) => {
    fetchByParam(param.toUpperCase()).then((response) => {
      if (response) {
        setProveedoresList(response);
      }
    });
  };

  /**
   * Handles the change event of the provider selection.
   *
   * @param event - The change event object.
   * @param value - The selected provider value.
   */
  const onChangeProveedor = async (
    event: React.ChangeEvent<{}>,
    value: PersonProviderType | null
  ) => {
    if (event && value && value !== null) {
      const ordenesCompraProvider =
        (await fetchOrdenesCompraByProveedor(
          value.providerId as number,
          value.isForeign ? EstadoOrdenEnum.CERRADA : EstadoOrdenEnum.CONFIRMADA
        )) ?? [];

      setThereIsRetention(!value.isForeign);

      setColumnVisibilityModel({
        ...columnVisibilityModel,
        branchName: value.isForeign ?? false,
      });

      setFormState({
        ...formState,
        providerId: value.providerId,
        providerName: value.providerName,
        personId: value.personId,
        personName: value.personName,
        providerIdentification: value.personIdentification,
        retentionSourceId: value.retentionSourceId,
        retentionIVAId: value.retentionIVAId,
        observation: `${value.personName} - N° Factura: ${formState.providerInvoiceNumber}. `,
        creditDays: value.creditDays,
        providerInvoiceDueDate: dayjs(formState.providerInvoiceIssueDate)
          .add(Number(value.creditDays), 'day')
          .toDate(),
        purchaseOrderList: ordenesCompraProvider,
        isControlledRetencion: true,
        paymentConditionId: value.paymentConditionId,
        liquidationTypeId: TipoLiquidacionEnum.CUENTA_POR_PAGAR,
        branchId: sucursalUser?.branchId ?? null,
        taxSupportId: taxSupportList.find(
          (taxSupport) => taxSupport.taxSupportId === '01'
        )?.taxSupportId,
        voucherTypeCode: voucherTypeList.find(
          (voucherType) => voucherType.voucherTypeCode === '01'
        )?.voucherTypeCode,
        isForeign: value.isForeign,
      });

      if (value.expenseAccountId && value.expenseAccountId !== null) {
        const accountPayableResponsive = value.expenseAccountId
          ? await getCuentaById(value.expenseAccountId)
          : null;

        const accountPayable: AccountType = accountPayableResponsive?.message;

        const newRetentions = await getRetencionesNamesByDetalles(
          value.retentionSourceId || undefined,
          value.retentionIVAId || undefined
        );

        const intialRow = {
          id: randomId(),
          detailId: null,
          providerInvoiceId: value.providerId,
          productId: accountPayable.accountId,
          productCode: accountPayable.accountNumber,
          providerProductCode: accountPayable.accountNumber,
          productName: accountPayable.accountName,
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          priceWithoutTax: 0,
          hasIva: true,
          taxValue: 0,
          totalPrice: 0,
          isTaxCredit: true,
          branchId: sucursalUser?.branchId ?? null,
          employeeId: null,
          detailTypeId: TipoDetalleFacturaEnum.SERVICIOS,
          taxRateId: ParametersEnum.TAX_RATE_ID_DEFAULT,
          branchName: sucursalUser?.name,
          retentions: newRetentions,
          status: true,
          providerId: value.providerId,
        };

        setRows([intialRow]);
      } else {
        setRows([]);
      }
    }
  };

  /**
   * Handles the change event for the retencion checkbox.
   * Updates the state variables and performs additional actions based on the checkbox value.
   */
  const onChangeRetencion = () => {
    setThereIsRetention((prevState) => !prevState);
    setFormState((prevState: any) => ({
      ...prevState,
      retentionNumber: !thereIsRetention
        ? 'RETENCIÓN ACTIVADA'
        : 'SIN RETENCIÓN',
    }));

    if (!thereIsRetention) {
      Promise.all(
        rows.map(async (row) => {
          const retentions = await getRetencionesNamesByDetalles(
            row.retentionSourceId || undefined,
            row.retentionIVAId || undefined
          );
          return {
            ...row,
            retentions,
          };
        })
      ).then((newRows) => setRows(newRows));
    } else {
      setRows(
        rows.map((row) => {
          return {
            ...row,
            retentions: [],
          };
        })
      );
    }
  };

  /**
   * Handles the click event of the edit button.
   * If edit mode is disabled, enables it and updates the title.
   * If edit mode is enabled, disables it and updates the title.
   * Also updates the row modes and displays a snackbar message.
   */
  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle(
        'Factura Proveedor (Modo Edición) - N° ' +
          formState.providerInvoiceNumber
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
      rows.forEach((row) => {
        setRowModesModel({
          ...rowModesModel,
          [row.id]: { mode: GridRowModes.View },
        });
      });
      setTitle(
        'Factura Proveedor (Modo Lectura) - N° ' +
          formState.providerInvoiceNumber
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

  // * * * * * * * * * * * * *  ACTIONS * * * * * * * * * * * * * * * * * * * * *

  const validateForm = () => {
    if (formState.voucherTypeCode !== ComprobanteTypeEnum.LIQUIDACION) {
      if (formState.providerInvoiceNumber === '') {
        enqueueSnackbar('El número de factura es requerido', {
          variant: 'error',
        });
        return false;
      }
      if (formState.providerInvoiceAuthorizationNumber === '') {
        enqueueSnackbar('El número de autorización es requerido', {
          variant: 'error',
        });
        return false;
      }
    }

    if (formState.providerInvoiceIssueDate === '') {
      enqueueSnackbar('La fecha de emisión es requerida', {
        variant: 'error',
      });
      return false;
    }
    if (formState.providerInvoiceDueDate === '') {
      enqueueSnackbar('La fecha de vencimiento es requerida', {
        variant: 'error',
      });
      return false;
    }
    if (formState.branchId === 0 && formState.branchId === null) {
      enqueueSnackbar('La sucursal es requerida', {
        variant: 'error',
      });
      return false;
    }
    if (
      formState.paymentConditionId === 0 &&
      formState.paymentConditionId === null
    ) {
      enqueueSnackbar('La condición de pago es requerida', {
        variant: 'error',
      });
      return false;
    }
    if (
      formState.contributorTypeId === 0 &&
      formState.contributorTypeId === null
    ) {
      enqueueSnackbar('El tipo de contribuyente es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.providerId === 0 && formState.providerId === null) {
      enqueueSnackbar('El proveedor es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.paymentMethodId === 0 && formState.paymentMethodId === null) {
      enqueueSnackbar('El método de pago es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.paymentTypeId === 0 && formState.paymentTypeId === null) {
      enqueueSnackbar('El tipo de pago es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.voucherTypeCode === '') {
      enqueueSnackbar('El tipo de comprobante es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (
      formState.liquidationTypeId === 0 &&
      formState.liquidationTypeId === null
    ) {
      enqueueSnackbar('El tipo de liquidación es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.taxSupportId === '') {
      enqueueSnackbar('El sustento tributario es requerido', {
        variant: 'error',
      });
      return false;
    }

    if (
      adquisicionPeriodo?.closingPeriodDate &&
      formState.providerInvoiceIssueDate < adquisicionPeriodo.closingPeriodDate
    ) {
      enqueueSnackbar(TitlesEnum.MENSAJE_CIERRE_PERIODO_ADQUSICIONES, {
        variant: 'error',
      });
      return false;
    }

    if (!validatedRetentionValue) {
      enqueueSnackbar(
        'El valor base de la retención no coincide con el total de la factura',
        {
          variant: 'error',
        }
      );
      return false;
    }

    if (rows.length === 0) {
      enqueueSnackbar('Debe agregar al menos un detalle en la factura', {
        variant: 'error',
      });
      return false;
    }

    if (rows.length > 0) {
      const thereIsARowWithZeroPrice = rows.some(
        (row) => row.unitPrice === 0 || row.quantity === 0
      );

      if (thereIsARowWithZeroPrice) {
        enqueueSnackbar('El precio unitario o la cantidad no pueden ser cero', {
          variant: 'error',
        });
        return false;
      }
    }

    if (formState.relatedDocumentId) {
      if (!validatedByOrden) {
        enqueueSnackbar(
          'El total de la factura no coincide con el total de la orden de compra relacionada',
          {
            variant: 'error',
          }
        );
        return false;
      }
    }

    if (
      formState.liquidationTypeId === TipoLiquidacionEnum.TARJETA_DE_CREDITO
    ) {
      if (formState.cardAccountId === null) {
        enqueueSnackbar('Debe seleccionar una tarjeta de crédito', {
          variant: 'error',
        });
        return false;
      }
    } else {
      setFormState({
        ...formState,
        cardAccountId: null,
      });
    }

    if (formState.providerInvoiceIssueDate > new Date()) {
      enqueueSnackbar(
        'La fecha de emisión no puede ser superior a la fecha actual',
        {
          variant: 'error',
        }
      );
      return false;
    }

    if (formState.providerInvoiceStatusId === EstadoDocumentoEnum.ANULADO) {
      if (formState.ncValue > 0) {
        enqueueSnackbar(
          'No es posible anular una factura con notas de crédito asociadas',
          {
            variant: 'error',
          }
        );
        return false;
      }
      if (formState.ndValue > 0) {
        enqueueSnackbar(
          'No es posible anular una factura con notas de débito asociadas',
          {
            variant: 'error',
          }
        );
        return false;
      }
      if (formState.paidValue > 0) {
        enqueueSnackbar(
          'No es posible anular una factura con pagos asociados',
          {
            variant: 'error',
          }
        );
        return false;
      }
    }

    return true;
  };

  /**
   * Handles the form submission event.
   * @param event - The form submission event.
   */
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      setFormState({
        ...formState,
        providerInvoiceStatusId: prevFormState.current
          ? prevFormState.current.providerInvoiceStatusId
          : ComprobanteEstadoEnum.GENERADO,
      });
      return;
    }

    const header = setHeader(formState, user);

    const details = setDetails(
      rows,
      sucursales,
      header.branchId,
      header.providerId,
      impuestos
    );

    const reimbursement: ReembolsoPostPutType[] = rowsReembolsos.map((row) => {
      return {
        reimbursementId: row.reimbursementId,
        fiscalIdType: row.fiscalIdType,
        voucherTypeId: row.voucherTypeId,
        reimbursementIdentification: row.reimbursementIdentification,
        reimbursementDocumentNumber: row.reimbursementDocumentNumber,
        reimbursementDocumentAuthNumber: row.reimbursementDocumentAuthNumber,
        reimbursementDate: row.reimbursementDate,
        reimbursementIvaRate: row.reimbursementIvaRate,
        reimbursementIvaAmount: row.reimbursementIvaAmount,
        reimbursementNonIvaRate: row.reimbursementNonIvaRate,
        reimbursementCancelled: row.reimbursementCancelled,
        reimbursementZeroIvaRate: row.reimbursementZeroIvaRate,
        accountId: row.accountId,
        documentId: row.documentId,
        reimbursementTotal: row.reimbursementTotal,
        taxRateId: row.taxRateId,
      };
    });

    const response =
      header.providerInvoiceId === null
        ? await saveFacturaBackEnd(
            header,
            details,
            groupedRetenciones,
            taxes,
            reimbursement
          )
        : await updateFacturaBackEnd(
            header,
            details,
            groupedRetenciones,
            taxes,
            reimbursement
          );

    if (response && (response as ServerResponseType).status === 400) {
      return;
    }
    handleCancel();
  };

  /**
   * Handles the confirmation dialog for the form submission.
   *
   * @param event - The form event.
   */
  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    rows.forEach((row) => {
      setRowModesModel({
        ...rowModesModel,
        [row.id]: { mode: GridRowModes.View },
      });
    });
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  useEffect(() => {
    if (
      formState.voucherTypeCode === ComprobanteTypeEnum.LIQUIDACION &&
      formState.providerInvoiceStatusId === EstadoDocumentoEnum.GENERADO
    ) {
      setFormState({
        ...formState,
        providerInvoiceAuthorizationNumber: '',
        providerInvoiceNumber: '',
      });
    }
  }, [formState.voucherTypeCode, formState.providerInvoiceStatusId]);

  const updateAllBranchesInRows = (branch: SucursalType) => {
    const updatedRows = rows.map((row) => {
      if (row.detailTypeId === TipoDetalleFacturaEnum.SERVICIOS)
        return {
          ...row,
          branchId: branch.branchId,
          branchName: branch.name,
        };
      return row;
    });
    setRows(updatedRows);
  };

  return (
    <>
      <CustomDialog
        fieldName="providerInvoiceCancellationReason"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.providerInvoiceCancellationReason ?? ''}
        onInputChange={onInputChange}
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
      >
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Grid item xs={4}>
              <Autocomplete
                className={styles.genericFieldStyle}
                disablePortal
                autoSelect
                options={proveedoresList}
                readOnly={!createMode}
                getOptionLabel={(option) => option.personName}
                style={{ width: '100%' }}
                onChange={(event, option) => onChangeProveedor(event, option)}
                onInputChange={(event, value) =>
                  onInputChangeProveedor(event, value)
                }
                value={
                  formState.providerId === 0
                    ? null
                    : proveedoresList.find(
                        (proveedor) =>
                          proveedor.providerId === formState.providerId
                      )
                }
                filterOptions={(options) => options}
                isOptionEqualToValue={(
                  option: PersonProviderType,
                  value: PersonProviderType
                ) =>
                  option && value
                    ? option.providerId === value.providerId
                    : false
                }
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Proveedor"
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
            <Grid item xs={4}>
              <TextField
                label="Identificación"
                value={formState.providerIdentification}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{
                  style: { textTransform: 'uppercase' },
                }}
                InputLabelProps={{
                  shrink:
                    formState.providerIdentification !== '' ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <DocumentosExternos formState={formState} />
            <Grid item xs={4}>
              <TextField
                name="providerInvoiceAuthorizationNumber"
                label="Nro. Autorización"
                disabled={
                  formState.voucherTypeCode === ComprobanteTypeEnum.LIQUIDACION
                }
                value={formState.providerInvoiceAuthorizationNumber}
                onChange={(e: any) => {
                  const re = /^[0-9\b]+$/;
                  if (e.target.value === '' || re.test(e.target.value)) {
                    setFormState({
                      ...formState,
                      providerInvoiceAuthorizationNumber: e.target.value,
                      providerInvoiceNumber: extractFacturaNumber(
                        e.target.value
                      ),
                      providerInvoiceIssueDate: extractDateFromAutorizacion(
                        formState.providerInvoiceIssueDate,
                        e.target.value
                      ),
                      observation: `${
                        formState.personName
                      } - N° Factura: ${extractFacturaNumber(
                        e.target.value
                      )}. `,
                    });
                  }
                }}
                error={
                  formState.providerInvoiceAuthorizationNumber !== '' &&
                  formState.providerInvoiceAuthorizationNumber.length !== 10 &&
                  formState.providerInvoiceAuthorizationNumber.length !== 47 &&
                  formState.providerInvoiceAuthorizationNumber.length !== 49
                }
                helperText={
                  formState.providerInvoiceAuthorizationNumber !== '' &&
                  formState.providerInvoiceAuthorizationNumber.length !== 10 &&
                  formState.providerInvoiceAuthorizationNumber.length !== 47 &&
                  formState.providerInvoiceAuthorizationNumber.length !== 49
                    ? 'La longitud debe ser de 10, 47 o 49 dígitos'
                    : ''
                }
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink:
                    formState.providerInvoiceAuthorizationNumber !== ''
                      ? true
                      : false,
                }}
                inputProps={{
                  maxLength: 49,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Emisión"
                views={['year', 'month', 'day']}
                minDate={adquisicionPeriodo?.closingPeriodDate}
                maxDate={new Date()}
                format="dd/MM/yyyy"
                value={
                  typeof formState.providerInvoiceIssueDate === 'string'
                    ? parseISO(formState.providerInvoiceIssueDate)
                    : formState.providerInvoiceIssueDate
                }
                onChange={(value) => {
                  onDateChange(value as Date, 'providerInvoiceIssueDate');
                }}
                readOnly={!createMode}
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
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Vencimiento"
                views={['year', 'month', 'day']}
                format="dd/MM/yyyy"
                value={
                  typeof formState.providerInvoiceDueDate === 'string'
                    ? parseISO(formState.providerInvoiceDueDate)
                    : formState.providerInvoiceDueDate
                }
                readOnly={true}
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
            <Grid item xs={4}>
              <TextField
                name="providerInvoiceNumber"
                label="Nro. Factura"
                value={formState.providerInvoiceNumber}
                disabled={
                  formState.voucherTypeCode === ComprobanteTypeEnum.LIQUIDACION
                }
                onChange={(event) => {
                  setFormState({
                    ...formState,
                    providerInvoiceNumber: event.target.value,
                    observation: `${formState.personName} - N° Factura: ${event.target.value}. `,
                  });
                }}
                error={
                  !formState.isForeign &&
                  formState.providerInvoiceNumber !== '' &&
                  formState.providerInvoiceNumber.length !== 15
                }
                helperText={
                  !formState.isForeign &&
                  formState.providerInvoiceNumber !== '' &&
                  formState.providerInvoiceNumber.length !== 15
                    ? 'La longitud debe ser de 15 dígitos'
                    : ''
                }
                InputProps={{
                  readOnly: !createMode,
                }}
                InputLabelProps={{
                  shrink: formState.providerInvoiceNumber !== '' ? true : false,
                }}
                inputProps={{
                  maxLength: formState.isForeign ? 99 : 15,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                id="autocomplete-state"
                className={styles.genericFieldStyle}
                disablePortal
                options={condicionesPagoOptions}
                readOnly={!createMode && !editMode}
                getOptionLabel={(option) => option.label}
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  if (value && value !== null) {
                    onAutocompleteChange(
                      event,
                      'paymentConditionId',
                      value.value
                    );
                    onAutocompleteChange(
                      event,
                      'paymentConditionName',
                      value.label
                    );
                  }
                }}
                value={
                  formState.paymentConditionId === 0
                    ? null
                    : condicionesPagoOptions.find(
                        (condicion) =>
                          condicion.value === formState.paymentConditionId
                      )
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter((option) =>
                    option.label
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.value === value?.value
                }
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Condición de Pago"
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
            <Grid item xs={4}>
              <Autocomplete
                id="autocomplete-sucursales"
                className={styles.genericFieldStyle}
                options={sucursales}
                getOptionLabel={(option) => option.name}
                style={{ width: '100%' }}
                onChange={(event, value): void => {
                  if (event !== null && value !== null) {
                    setFormState({
                      ...formState,
                      branchName: value.name,
                      branchId: value.branchId,
                    });
                    updateAllBranchesInRows(value);
                  }
                }}
                value={
                  formState.branchId && formState.branchId !== ''
                    ? sucursales.find(
                        (sucursal) => sucursal.branchId === formState.branchId
                      )
                    : null
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter((option) =>
                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
                isOptionEqualToValue={(option, value) => option === value}
                noOptionsText="Sin resultados"
                readOnly={!createMode && selectedPurchaseOrder !== null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sucursal"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      className: styles.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      className: styles.textGreenStyle,
                    }}
                    error={formState.branch === null}
                    helperText={
                      formState.branch === null
                        ? 'Debe seleccionar una sucursal'
                        : ''
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="creditDays"
                label="Días Crédito"
                value={formState.creditDays}
                onChange={(event) => {
                  const newDate = dayjs(new Date())
                    .add(Number(event.target.value), 'day')
                    .toDate();
                  onInputChange(event as ChangeEvent<HTMLInputElement>);
                  onDateChange(newDate, 'providerInvoiceDueDate');
                }}
                type="number"
                InputProps={{
                  readOnly:
                    (!createMode || !editMode) &&
                    formState.providerInvoiceIssueDate !== null &&
                    formState.paymentConditionId === CondicionPagoEnum.CONTADO,
                }}
                InputLabelProps={{
                  shrink: formState.creditDays !== '' ? true : false,
                }}
                fullWidth
              />
            </Grid>
            {formState.isForeign ? (
              <Grid item xs={4}>
                <TextField
                  label="Importación"
                  value={formState.importOpeningCode}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink: formState.importOpeningCode !== '' ? true : false,
                  }}
                />
              </Grid>
            ) : (
              <Grid item xs={4}>
                <TextField
                  name="retentionNumber"
                  label={
                    !isNaN(Number(formState.retentionNumber))
                      ? 'Nro. Retención'
                      : 'Retención'
                  }
                  value={formState.retentionNumber}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          disabled={!isNaN(Number(formState.retentionNumber))}
                          onClick={onChangeRetencion}
                          sx={{ backgroundColor: 'transparent' }}
                        >
                          {thereIsRetention ? <ToggleOn /> : <ToggleOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: formState.retentionNumber !== '' ? true : false,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={4}>
              <Autocomplete
                className={styles.genericFieldStyle}
                disablePortal
                options={metodoPagoOptions}
                getOptionLabel={(option) => option.label}
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  if (value && value !== null) {
                    onAutocompleteChange(
                      event,
                      'liquidationTypeId',
                      value.value
                    );
                    onAutocompleteChange(
                      event,
                      'liquidationTypeName',
                      value.label
                    );
                  }
                }}
                value={
                  formState.liquidationTypeId === 0
                    ? null
                    : metodoPagoOptions.find(
                        (metodo) => metodo.value === formState.liquidationTypeId
                      )
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter((option) =>
                    option.label
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.value === value?.value
                }
                readOnly={!createMode && !editMode}
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Método de Pago"
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
            {formState.liquidationTypeId ===
              TipoLiquidacionEnum.TARJETA_DE_CREDITO && (
              <Grid item xs={4}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  disablePortal
                  options={listaTarjetas}
                  getOptionLabel={(option) => option.accountName}
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    if (value && value !== null) {
                      onAutocompleteChange(
                        event,
                        'cardAccountId',
                        value.accountId
                      );
                    }
                  }}
                  value={
                    formState.cardAccountId === null ||
                    listaTarjetas.length === 0
                      ? null
                      : listaTarjetas.find(
                          (cuenta) =>
                            cuenta.accountId === formState.cardAccountId
                        )
                  }
                  filterOptions={(options, { inputValue }) => {
                    return options.filter((option) =>
                      option.accountName
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option?.accountId === value?.accountId
                  }
                  readOnly={!createMode && !editMode}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cuenta Tarjeta Crédito"
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
            )}
            <Grid item xs={4}>
              <Autocomplete
                className={styles.genericFieldStyle}
                disablePortal
                autoSelect
                options={taxSupportList}
                readOnly={!createMode && !editMode}
                getOptionLabel={(option) =>
                  `${option.taxSupportId} - ${option.taxSupportName}`
                }
                style={{ width: '100%' }}
                onChange={(event, option) =>
                  onAutocompleteChange(
                    event,
                    'taxSupportId',
                    option?.taxSupportId
                  )
                }
                value={
                  formState.taxSupportId === ''
                    ? null
                    : taxSupportList.find(
                        (taxSupport) =>
                          taxSupport.taxSupportId === formState.taxSupportId
                      )
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter((option) =>
                    option.taxSupportName
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  );
                }}
                isOptionEqualToValue={(
                  option: TaxSupportInterface,
                  value: TaxSupportInterface
                ) =>
                  option && value
                    ? option.taxSupportId === value.taxSupportId
                    : false
                }
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sustento Tributario"
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
            <Grid item xs={4}>
              <Autocomplete
                className={styles.genericFieldStyle}
                disablePortal
                autoSelect
                options={voucherTypeList}
                readOnly={!createMode && !editMode}
                getOptionLabel={(option) => option.voucherTypeName}
                style={{ width: '100%' }}
                onChange={(event, option) =>
                  onAutocompleteChange(
                    event,
                    'voucherTypeCode',
                    option?.voucherTypeCode
                  )
                }
                value={
                  formState.voucherTypeCode === ''
                    ? null
                    : voucherTypeList.find(
                        (voucher) =>
                          voucher.voucherTypeCode === formState.voucherTypeCode
                      )
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter((option) =>
                    option.voucherTypeName
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  );
                }}
                isOptionEqualToValue={(
                  option: VoucherTypeInterface,
                  value: VoucherTypeInterface
                ) =>
                  option && value
                    ? option.voucherTypeCode === value.voucherTypeCode
                    : false
                }
                noOptionsText="Sin resultados"
                renderOption={(props, option: VoucherTypeInterface) => (
                  <li {...props}>
                    {`${option.voucherTypeCode} - ${option.voucherTypeName}`}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo De Comprobante"
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
            {!createMode && (
              <Grid item xs={4}>
                <TextField
                  label="Estado Factura"
                  value={formState.providerInvoiceStatusName}
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
              </Grid>
            )}
            {formState.isForeign && (
              <Grid item xs={4}>
                <Grid container justifyContent="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.hasOrder}
                        onChange={(event) =>
                          setFormState &&
                          setFormState({
                            ...formState,
                            hasOrder: event.target.checked,
                          })
                        }
                      />
                    }
                    label={formState.hasOrder ? 'Orden Atada' : 'Atar Orden'}
                  />
                </Grid>
              </Grid>
            )}
            {createMode && (
              <Grid item xs={12}>
                <AccordionOrdenes
                  formState={formState}
                  setFormState={setFormState}
                  setRows={setRows}
                  getRetencionesNamesByDetalles={getRetencionesNamesByDetalles}
                  rows={rows}
                  selectedPurchaseOrder={selectedPurchaseOrder}
                  setSelectedPurchaseOrder={setSelectedPurchaseOrder}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <StyledDataGrid
                apiRef={apiRef}
                rows={rows.filter((row) => row.status === true)}
                columns={columns}
                editMode={createMode || editMode ? 'row' : undefined}
                rowModesModel={rowModesModel}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) =>
                  setColumnVisibilityModel(newModel)
                }
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                getRowClassName={(params) =>
                  params !== null ? `super-app-theme--null` : ''
                }
                processRowUpdate={processRowUpdate}
                getRowHeight={() => 'auto'}
                isCellEditable={(params) => {
                  if (createMode) return true;
                  else if (
                    editMode &&
                    formState.providerInvoiceStatusId ===
                      EstadoDocumentoEnum.GENERADO
                  ) {
                    return true;
                  } else if (
                    (editMode &&
                      formState.providerInvoiceStatusId ===
                        EstadoDocumentoEnum.CONFIRMADO) ||
                    formState.providerInvoiceStatusId ===
                      EstadoDocumentoEnum.RECHAZADO
                  ) {
                    return (
                      params.row.detailTypeId ===
                      TipoDetalleFacturaEnum.SERVICIOS
                    );
                  } else {
                    return false;
                  }
                }}
                columnHeaderHeight={45}
                onCellKeyDown={(params, event) => {
                  if (event.key === 'Tab' && params.field === 'productName') {
                    setTimeout(() => {
                      apiRef.current.setCellFocus(params.id, 'unitPrice');
                    }, 100);
                    event.preventDefault();
                  }
                }}
                sx={{ height: rows.length > 0 ? '100%' : 300 }}
                slots={{
                  noRowsOverlay: CustomNoRowsOverlay,
                  footer: CustomFooterFacturaC,
                  toolbar: CustomToolbar,
                }}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    createMode,
                    editMode,
                    formState,
                    getRetencionesNamesByDetalles,
                    initialStateDetalle,
                    sucursalUser,
                    open: openReembolsosDialog,
                    setOpen: setOpenReembolsoDialog,
                  },
                  footer: {
                    rows,
                    setRows,
                    createMode,
                    editMode,
                    retencionList,
                    formState,
                    setFormState,
                    thereIsRetention,
                    setGroupedRetenciones,
                    setValidatedRetentionValue,
                    impuestos,
                    taxes,
                    setTaxes,
                  },
                }}
                localeText={{
                  ...esES.components.MuiDataGrid.defaultProps.localeText,
                  toolbarDensity: 'Densidad',
                  toolbarFilters: 'Filtros',
                  toolbarColumns: 'Columnas',
                  toolbarExport: 'Exportar',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="observation"
                label="Observación"
                value={formState.observation}
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink: formState.observation !== '' ? true : false,
                }}
                fullWidth
              />
            </Grid>
          </Grid>
          <ActionButtons
            createMode={createMode}
            handleCancel={handleCancel}
            isEditable={isEditable}
            onEditButtonClick={onEditButtonClick}
            editMode={editMode}
            showButtonChanges={thereIsChanges}
            setDialogMessage={setDialogMessage}
            setIsAnulation={setIsAnulation}
            setOpenDialogAlert={setOpenDialogAlert}
            validatedByOrden={validatedByOrden}
            formState={formState}
            setFormState={setFormState}
            existDocumentNumber={existDocumentNumber}
          />
        </form>
        <ReembolsoDialog
          rows={rowsReembolsos}
          setRows={setRowsReembolsos}
          open={openReembolsosDialog}
          setOpen={setOpenReembolsoDialog}
          formState={formState}
          createMode={createMode}
          editMode={editMode}
          impuestos={impuestos}
        />
      </CardLayout>
    </>
  );
};
