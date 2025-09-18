import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { parseISO } from 'date-fns';
import {
  getDetailSolicitudCompraById,
  getRazonesSolicitud,
  getSolicitudCompraById,
  getTipoAdquisicion,
} from '@/backend/adquisiciones';
import { defaultTypeAdquisicion } from '@/constants';
import {
  DocumentTypeEnum,
  PathEnum,
  RequestPurchaseEnum,
} from '@/enums';
import {
  useAccessDocument,
  useAllowAdquisicion,
  useAllowGlobal,
  useForm,
  useProductoAsync,
  useSolicitudCompraAsync,
} from '@/hooks';
import { RootState } from '@/store';
import {
  RazonSolicitudCompraType,
  SolicitudCompraDetailType,
  SolicitudCompraType,
  SucursalType,
  TipoAdquisicionType,
} from '@/types';
import {
  ProductoByBodegaType
} from '@/types/inventario/producto.type';

export const useSolicitudCompraLogic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const requestId = location && location.state ? location.state.requestId : undefined;

  const [validateAnulado, setValidateAnulado] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isApprovable, setIsApprovable] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [stateForRequest, setStateForRequest] = useState<number>(RequestPurchaseEnum.EDICION);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const [openAnulation, setOpenAnulation] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const [requestPurchaseSelected, setRequestPurchaseSelected] = useState<SolicitudCompraType>();
  const [requestPurchaseDetailsSelected, setRequestPurchaseDetailsSelected] = useState<SolicitudCompraDetailType[]>([]);
  const [tipoAdquisicionList, setTipoAdquisicionList] = useState<TipoAdquisicionType[]>(defaultTypeAdquisicion);
  const [razonesSolicitudList, setRazonesSolicitudList] = useState<RazonSolicitudCompraType[]>([]);
  const [productosToSelect, setProductosToSelect] = useState<string[]>([]);
  const [productosByBodegaList, setProductosByBodegaList] = useState<ProductoByBodegaType[]>([]);
  const [isValidDataGrid, setIsValidDataGrid] = useState(true);

  const addButtonRef = useRef<HTMLButtonElement>(null);
  const firstFieldFocus = useRef<HTMLInputElement>(null);
  const prevFormState = useRef<any | undefined>(undefined);

  const { user } = useSelector((state: RootState) => state.auth);
  const { sucursales } = useSelector((state: RootState) => state.common);

  const { enableApproveSC, enableEditingSC, adquisicionPeriodo } = useAllowAdquisicion();
  const { navigateBetweenDocuments, enabledBranchs } = useAllowGlobal();
  const { closeDocument, openDocument } = useAccessDocument();
  const { fetchBySucursalIdAndCode } = useProductoAsync();
  const { fetchSave, fetchUpdate } = useSolicitudCompraAsync();

  const sucursalUser: SucursalType = useMemo(() => {
    if (!sucursales || !user || !user.branchId) return sucursales[0];
    const foundSucursal = sucursales.find(
      (sucursal) => sucursal.branchId === user.branchId
    );
    return foundSucursal ? foundSucursal : sucursales[0];
  }, [sucursales, user?.branchId]);

  const {
    onInputChange,
    onDateChange,
    OnSelectChange,
    formState,
    onResetForm,
    isFormValid,
    setFormState,
    onAutocompleteChange,
  } = useForm({
    usuario: user,
    branchId: sucursalUser.branchId,
    fechaSolicitud: new Date(),
    fechaRequerida: new Date(),
    fechaAprobacion: null,
    fechaModificacion: new Date(),
    tipoSolicitud: 1,
    tipoAbastecimiento: 1,
    razonSolicitud: 1,
    observacion: '',
    usuarioEnvia: null,
    usuarioAprueba: null,
    usuarioAnula: null,
    motivo: null,
  });

  const handleCancel = async () => {
    if (requestId) {
      closeDocument({
        id: requestId,
        documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
      });
    }
    navigate(PathEnum.SOLICITUD_COMPRA);
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle(
        'Solicitud De Compra (Modo Edición) - N° ' +
          requestPurchaseSelected?.requestPurchaseId
      );
      enqueueSnackbar(
        'Modo edición habilitado - Modo lectura deshabilitado',
        {
          variant: 'info',
        }
      );
    } else {
      setEditMode(false);
      setTitle(
        'Solicitud De Compra (Modo Lectura) - N° ' +
          requestPurchaseSelected?.requestPurchaseId
      );
      enqueueSnackbar(
        'Modo edición deshabilitado - Modo lectura habilitado',
        {
          variant: 'info',
        }
      );
    }
  };

  // Load initial data
  useEffect(() => {
    if (requestId) {
      setCreateMode(false);
      loadRequestPurchaseData();
    }
  }, [requestId]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    updateFormState();
  }, [requestPurchaseSelected]);

  useEffect(() => {
    setTitle(
      createMode
        ? 'Nueva Solicitud De Compra'
        : 'Solicitud De Compra (Modo Lectura) - N° ' + requestId
    );
  }, [createMode, requestId]);

  const loadRequestPurchaseData = async () => {
    try {
      const [requestResponse, detailsResponse] = await Promise.all([
        getSolicitudCompraById(Number(requestId)),
        getDetailSolicitudCompraById(Number(requestId))
      ]);

      if (requestResponse?.status === 200 && requestResponse.message) {
        setRequestPurchaseSelected(requestResponse.message);
      } else {
        handleCancel();
        enqueueSnackbar(
          `No se pudo abrir la solicitud de compra seleccionada`,
          { variant: 'error' }
        );
        return;
      }

      if (detailsResponse?.status === 200) {
        setRequestPurchaseDetailsSelected(detailsResponse.message);
      } else {
        enqueueSnackbar(
          `No se pudieron abrir los detalles de solicitud de compra seleccionada`,
          { variant: 'error' }
        );
      }
    } catch (error) {
      enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
    }
  };

  const loadInitialData = async () => {
    try {
      const [tipoResponse, razonResponse] = await Promise.all([
        getTipoAdquisicion(),
        getRazonesSolicitud()
      ]);

      if (tipoResponse?.status === 200) {
        setTipoAdquisicionList(tipoResponse.message);
      } else {
        enqueueSnackbar(
          `No se pudieron cargar los estados: ${tipoResponse?.message}`,
          { variant: 'error' }
        );
      }

      if (razonResponse?.status === 200) {
        setRazonesSolicitudList(razonResponse.message);
      } else {
        enqueueSnackbar(
          `No se pudieron cargar los registros de razones: ${razonResponse?.message}`,
          { variant: 'error' }
        );
      }

      setStateForRequest(RequestPurchaseEnum.EDICION);
    } catch (error) {
      enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
    }
  };

  const updateFormState = () => {
    const anulacionTemp =
      requestPurchaseSelected &&
      requestPurchaseSelected.stateRequestPurchaseId !==
        RequestPurchaseEnum.GESTIONADOPARCIAL &&
      requestPurchaseSelected.stateRequestPurchaseId !==
        RequestPurchaseEnum.GESTIONADO;

    setValidateAnulado(anulacionTemp || true);

    const enableEditing = enableEditingSC(
      requestPurchaseSelected
        ? requestPurchaseSelected?.stateRequestPurchaseId
        : RequestPurchaseEnum.EDICION,
      requestPurchaseSelected?.dateRequiredRequestPurchase ?? new Date()
    );

    const enableApprove = enableApproveSC(
      requestPurchaseSelected
        ? requestPurchaseSelected?.stateRequestPurchaseId
        : 0,
      requestPurchaseSelected?.dateRequiredRequestPurchase ?? new Date()
    );

    setIsEditable(enableEditing);
    setIsApprovable(enableApprove);

    if (requestPurchaseSelected) {
      const dateRequest = requestPurchaseSelected?.dateCreationRequestPurchase
        ? requestPurchaseSelected?.dateCreationRequestPurchase
        : '';

      const dateSolicitud = requestPurchaseSelected?.dateRequiredRequestPurchase
        ? requestPurchaseSelected?.dateRequiredRequestPurchase
        : '';

      const dateAprobacion =
        requestPurchaseSelected?.dateApprovedSc &&
        requestPurchaseSelected?.dateApprovedSc !== null
          ? requestPurchaseSelected?.dateApprovedSc
          : '';

      const dateModificacion =
        requestPurchaseSelected?.dateModificationRequestPurchase
          ? requestPurchaseSelected?.dateModificationRequestPurchase
          : '';

      setFormState({
        usuario: requestPurchaseSelected
          ? {
              userNick: requestPurchaseSelected?.nickUser,
              userId: requestPurchaseSelected?.userId,
            }
          : user,
        branchId: requestPurchaseSelected.branchId,
        fechaSolicitud: requestPurchaseSelected
          ? parseISO(dateRequest.toString())
          : new Date(),
        fechaRequerida: requestPurchaseSelected
          ? parseISO(dateSolicitud.toString())
          : new Date(),
        fechaAprobacion:
          requestPurchaseSelected && dateAprobacion !== ''
            ? parseISO(dateAprobacion.toString())
            : null,
        fechaModificacion: requestPurchaseSelected
          ? parseISO(dateModificacion.toString())
          : new Date(),
        tipoSolicitud: requestPurchaseSelected
          ? requestPurchaseSelected?.typeRequestId
          : 1,
        tipoAbastecimiento: requestPurchaseSelected
          ? requestPurchaseSelected?.typeAdquisitionId
          : 1,
        razonSolicitud: requestPurchaseSelected
          ? requestPurchaseSelected?.reasonRequestId
          : 1,
        observacion: requestPurchaseSelected
          ? requestPurchaseSelected?.obsRequestPurchase
          : '',
        usuarioEnvia: requestPurchaseSelected
          ? requestPurchaseSelected?.codUsrSend
          : null,
        usuarioAprueba: requestPurchaseSelected
          ? requestPurchaseSelected?.codUsrAprob
          : null,
        usuarioAnula: requestPurchaseSelected
          ? requestPurchaseSelected?.codUsrAnula
          : null,
        motivo: requestPurchaseSelected.reasonRequestPurchase,
      });
    }
  };

  return {
    // State
    requestId,
    validateAnulado,
    isEditable,
    isApprovable,
    createMode,
    editMode,
    title,
    stateForRequest,
    openDialogAlert,
    openAnulation,
    openHistory,
    requestPurchaseSelected,
    requestPurchaseDetailsSelected,
    tipoAdquisicionList,
    razonesSolicitudList,
    productosToSelect,
    productosByBodegaList,
    isValidDataGrid,
    addButtonRef,
    firstFieldFocus,
    prevFormState,
    user,
    sucursales,
    sucursalUser,
    formState,
    isFormValid,
    adquisicionPeriodo,
    navigateBetweenDocuments,
    enabledBranchs,
    fetchBySucursalIdAndCode,
    fetchSave,
    fetchUpdate,

    // Actions
    setValidateAnulado,
    setIsEditable,
    setIsApprovable,
    setCreateMode,
    setEditMode,
    setTitle,
    setStateForRequest,
    setOpenDialogAlert,
    setOpenAnulation,
    setOpenHistory,
    setRequestPurchaseSelected,
    setRequestPurchaseDetailsSelected,
    setTipoAdquisicionList,
    setRazonesSolicitudList,
    setProductosToSelect,
    setProductosByBodegaList,
    setIsValidDataGrid,
    handleCancel,
    onEditButtonClick,
    onInputChange,
    onDateChange,
    OnSelectChange,
    onResetForm,
    onAutocompleteChange,
    closeDocument,
    openDocument,
    navigate,
    enqueueSnackbar,
  };
};
