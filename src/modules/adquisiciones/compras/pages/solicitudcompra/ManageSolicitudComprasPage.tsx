import {
  getDetailSolicitudCompraById,
  getRazonesSolicitud,
  getSolicitudCompraById,
  getTipoAdquisicion,
} from '@/backend/adquisiciones';
import {
  getProductoByBodega,
  getProductosByParams,
} from '@/backend/inventario';
import { defaultTypeAdquisicion } from '@/constants';
import {
  DocumentTypeEnum,
  PathEnum,
  RequestPurchaseEnum,
  TipoAdquisicionEnum,
} from '@/enums';
import { formatDateBackEnd, setDecimalPlacesString } from '@/functions';
import {
  StyledDatePicker,
  useAccessDocument,
  useAllowAdquisicion,
  useAllowGlobal,
  useForm,
  useProductoAsync,
  useSolicitudCompraAsync,
  useStyles,
} from '@/hooks';
import { CardLayout } from '@/modules';
import { RootState, ServerResponseType } from '@/store';
import {
  RazonSolicitudCompraType,
  SolicitudCompraDetailSendType,
  SolicitudCompraDetailType,
  SolicitudCompraSendType,
  SolicitudCompraType,
  SucursalType,
  TipoAdquisicionType,
} from '@/types';
import {
  ProductoByBodegaType,
  ProductoType,
} from '@/types/inventario/producto.type';
import {
  Check,
  DeleteForever,
  EditNote,
  Error,
  ExitToApp,
  History,
  Info,
  Save,
  Send,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TableCell,
  TableFooter,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  GridEventListener,
  GridRenderEditCellParams,
  GridRowEditStopReasons,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridSlotsComponentsProps,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import axios from 'axios';
import { parseISO } from 'date-fns';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { EditToolbar } from './components/EditToolbar';
import { ColumnsDefinition } from './components/ColumnsDefinition';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

async function setRequestPurchaseDetailsSelectedFunction(
  existingDetails: SolicitudCompraDetailType[] | undefined,
  currentRows: GridRowsProp,
  sucursalUser: SucursalType,
  requestPurchase: SolicitudCompraSendType
): Promise<SolicitudCompraDetailSendType[]> {
  const fetchProductoByBodega = async (
    productCode: string
  ): Promise<ProductoType[] | undefined> => {
    try {
      const response: ServerResponseType | undefined =
        await getProductosByParams(productCode);
      if (response) {
        if (response.status === 200) {
          return response.message;
        } else {
          console.error('No se pudieron cargar los productos de bodega');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (existingDetails && existingDetails.length > 0) {
    const promises = currentRows.map(async (current, index) => {
      const producto = await fetchProductoByBodega(current.productCode);
      const productId = producto ? producto[0].productId : null;

      return {
        branchId: sucursalUser.branchId,
        detailProductRequestPurchaseId: existingDetails[index]
          ? existingDetails[index].detailProductRequestPurchaseId
          : null,
        gestionadoDetailProduct: current.state,
        obsDetailRequestProduct: current.productObservation,
        productId: productId,
        quantityApprovedDetailProduct: current.quantityApproved,
        quantityRequestDetailProduct: current.quantity,
        quantityTransferedDetail: 0,
        quantityManagedDetailProduct: 0,
        requestProductPurchaseId: requestPurchase.requestPurchaseId,
        stateDetailRequestProduct: true,
        transfer: false,
      };
    });

    return Promise.all(promises);
  } else {
    const promises = currentRows.map(async (current) => {
      const producto = await fetchProductoByBodega(current.productCode);
      const productId = producto ? producto[0].productId : null;

      return {
        branchId: sucursalUser.branchId,
        detailProductRequestPurchaseId: null,
        gestionadoDetailProduct: current.state,
        obsDetailRequestProduct: current.productObservation,
        productId: productId,
        quantityApprovedDetailProduct: current.quantityApproved,
        quantityRequestDetailProduct: current.quantity,
        quantityTransferedDetail: 0,
        quantityManagedDetailProduct: 0,
        requestProductPurchaseId: requestPurchase.requestPurchaseId,
        stateDetailRequestProduct: true,
        transfer: false,
      };
    });

    return Promise.all(promises);
  }
}

function validateDetails(
  detailsRows: SolicitudCompraDetailSendType[],
  detailsFromDb: SolicitudCompraDetailType[] | undefined
) {
  if (detailsFromDb) {
    const rows = detailsFromDb
      .filter((found) => {
        const exists = detailsRows.some(
          (detail) =>
            detail.detailProductRequestPurchaseId ===
            found.detailProductRequestPurchaseId
        );
        return !exists;
      })
      .map((found) => ({
        branchId: found.branchId,
        detailProductRequestPurchaseId: found.detailProductRequestPurchaseId,
        gestionadoDetailProduct: found.gestionadoDetailProduct,
        obsDetailRequestProduct: found.obsDetailRequestProduct,
        productId: found.productId,
        quantityApprovedDetailProduct: found.quantityApprovedDetailProduct,
        quantityRequestDetailProduct: found.quantityRequestDetailProduct,
        quantityTransferedDetail: found.quantityTransferedDetail,
        requestProductPurchaseId: found.requestProductPurchaseId,
        quantityManagedDetailProduct: found.quantityManagedDetailProduct,
        stateDetailRequestProduct: false,
        transfer: false,
      }));
    return [...detailsRows, ...rows];
  } else {
    return detailsRows;
  }
}

export type ManageSolicitudComprasPageProps = {};

export const ManageSolicitudComprasPage: React.FC<
  ManageSolicitudComprasPageProps
> = ({}) => {
  const location = useLocation();

  const requestId =
    location && location.state ? location.state.requestId : undefined;

  const [validateAnulado, setValidateAnulado] = useState(false);

  const [isEditable, setIsEditable] = useState(false); // se usar para establecer si activa el editar en los distintos campos

  const [isApprovable, setIsApprovable] = useState(false);

  const { enableApproveSC, enableEditingSC } = useAllowAdquisicion();

  const { navigateBetweenDocuments } = useAllowGlobal();

  const [requestPurchaseSelected, setRequestPurchaseSelected] =
    useState<SolicitudCompraType>();

  const [requestPurchaseDetailsSelected, setRequestPurchaseDetailsSelected] =
    useState<SolicitudCompraDetailType[]>([]);

  const { fetchBySucursalIdAndCode } = useProductoAsync();

  const [createMode, setCreateMode] = useState(true);

  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');

  const addButtonRef = useRef<HTMLButtonElement>(null);

  const firstFieldFocus = useRef<HTMLInputElement>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  const { sucursales } = useSelector((state: RootState) => state.common);

  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const styles = useStyles();

  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  const sucursalUser: SucursalType = useMemo(() => {
    if (!sucursales || !user || !user.branchId) return sucursales[0];
    const foundSucursal = sucursales.find(
      (sucursal) => sucursal.branchId === user.branchId
    );
    return foundSucursal ? foundSucursal : sucursales[0];
  }, [sucursales, user?.branchId]);

  const [stateForRequest, setStateForRequest] = useState<number>(
    RequestPurchaseEnum.EDICION
  );

  const { closeDocument, openDocument } = useAccessDocument();

  const handleCancel = async () => {
    if (requestId) {
      closeDocument({
        id: requestId,
        documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
      });
    }

    navigate(PathEnum.SOLICITUD_COMPRA);
  };

  const [tipoAdquisicionList, setTipoAdquisicionList] = useState<
    TipoAdquisicionType[]
  >(defaultTypeAdquisicion);

  const [razonesSolicitudList, setRazonesSolicitudList] = useState<
    RazonSolicitudCompraType[]
  >([]);

  const [productosToSelect, setProductosToSelect] = useState<string[]>([]);

  const [productosByBodegaList, setProductosByBodegaList] = useState<
    ProductoByBodegaType[]
  >([]);

  const [isValidDataGrid, setIsValidDataGrid] = useState(true);

  const [openHistory, setOpenHistory] = useState(false);

  const { fetchSave, fetchUpdate } = useSolicitudCompraAsync();

  const prevFormState = useRef<any | undefined>(undefined);

  const { adquisicionPeriodo } = useAllowAdquisicion();

  useEffect(() => {
    if (requestId) {
      setCreateMode(false);

      const getRequestPurchase = async () => {
        return new Promise<void>(async (resolve, reject) => {
          try {
            const response: ServerResponseType | undefined =
              await getSolicitudCompraById(Number(requestId));

            if (response) {
              if (response.status === 200 && response.message) {
                setRequestPurchaseSelected(response.message);
                resolve();
              } else {
                handleCancel();
                enqueueSnackbar(
                  `No se pudo abrir la solicitud de compra seleccionada`,
                  {
                    variant: 'error',
                  }
                );
                reject();
              }
            }
          } catch (error) {
            enqueueSnackbar('Existió un error de conexión', {
              variant: 'error',
            });
            reject(error);
          }
        });
      };

      const getRequestPurchaseDetails = async () => {
        return new Promise<void>(async (resolve, reject) => {
          try {
            const response: ServerResponseType | undefined =
              await getDetailSolicitudCompraById(Number(requestId));
            if (response) {
              if (response.status === 200) {
                setRequestPurchaseDetailsSelected(response.message);

                resolve();
              } else {
                enqueueSnackbar(
                  `No se pudieron abrir los detalles de solicitud de compra seleccionada`,
                  {
                    variant: 'error',
                  }
                );
                reject();
              }
            }
          } catch (error) {
            enqueueSnackbar('Existió un error de conexión', {
              variant: 'error',
            });
            reject(error);
          }
        });
      };

      try {
        Promise.all([getRequestPurchase(), getRequestPurchaseDetails()]);
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    }
  }, [requestId]);

  useEffect(() => {
    const fetchTipoAdquisicion = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getTipoAdquisicion();
        if (response) {
          if (response.status === 200) {
            setTipoAdquisicionList(response.message);
          } else {
            enqueueSnackbar(
              `No se pudieron cargar los estados: ${response.message}`,
              {
                variant: 'error',
              }
            );
          }
        }
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };

    const fetchRazonSolicitud = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getRazonesSolicitud();
        if (response) {
          if (response.status === 200) {
            setRazonesSolicitudList(response.message);
          } else {
            enqueueSnackbar(
              `No se pudieron cargar los registros de razones: ${response.message}`,
              {
                variant: 'error',
              }
            );
          }
        }
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };

    const fetchData = async () => {
      try {
        await Promise.all([fetchTipoAdquisicion(), fetchRazonSolicitud()]);
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };

    fetchData();
    setStateForRequest(RequestPurchaseEnum.EDICION);
  }, []);

  useEffect(() => {
    setRows(
      requestPurchaseDetailsSelected &&
        requestPurchaseDetailsSelected.length > 0
        ? requestPurchaseDetailsSelected.map((item) => ({
            id: randomId(),
            productName: item.productName,
            productCode: item.productCode,
            availableQuantity: item.quantityAvailableBranch,
            quantity: item.quantityRequestDetailProduct,
            quantityApproved: item.quantityApprovedDetailProduct,
            weight: (item.weight * item.quantityApprovedDetailProduct).toFixed(
              2
            ),
            productObservation: item.obsDetailRequestProduct,
            state: item.gestionadoDetailProduct,
          }))
        : []
    );
  }, [requestPurchaseDetailsSelected]);

  // ? FUNCIONAMIENTO PARA EDITAR --------------------------------------

  useEffect(() => {
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
  }, [requestPurchaseSelected]);

  useEffect(() => {
    setTitle(
      createMode
        ? 'Nueva Solicitud De Compra'
        : 'Solicitud De Compra (Modo Lectura) - N° ' + requestId
    );
  }, [createMode, requestId]);

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (rows && rows.length > 0) {
      let productosListTemporal: ProductoByBodegaType[] = [];
      const fetchProductoByBodega = async (
        productCode: string,
        row: GridValidRowModel
      ) => {
        fetchBySucursalIdAndCode(
          sucursalUser?.branchId ?? null,
          productCode
        ).then((response) => {
          if (response) {
            const producto: ProductoByBodegaType = {
              ...response,
              quantity: row.quantity,
            };
            /** Validar si el producto ya fue gestionado para mostrar máximos y minimos */
            requestPurchaseSelected &&
            (requestPurchaseSelected.stateRequestPurchaseId ===
              RequestPurchaseEnum.EDICION ||
              requestPurchaseSelected.stateRequestPurchaseId ===
                RequestPurchaseEnum.ENVIADO)
              ? renderAlertMinMax(producto)
              : null;
            /** Validar si el producto ya fue gestionado para mostrar máximos y minimos */
            productosListTemporal.push(producto);
          }
        });
      };
      rows.map((row) => {
        fetchProductoByBodega(row.productCode, row);
      });
      setProductosByBodegaList(productosListTemporal);
      let flag = true;
      rows.forEach((row) => {
        if (row.productCode === '' && row.productName === '') {
          setRowModesModel({
            ...rowModesModel,
            [row.id]: { mode: GridRowModes.Edit },
          });
          flag = false;
        }
        if (
          row.productCode !== '' &&
          row.productName !== '' &&
          row.quantity === 0
        ) {
          enqueueSnackbar('No puede guardar productos con cantidad 0', {
            variant: 'error',
            preventDuplicate: true,
          });
          flag = false;
        }
      });
      setIsValidDataGrid(flag);
      if (!flag) {
        enqueueSnackbar('Existen campos vacios en la lista de productos', {
          variant: 'warning',
          preventDuplicate: true,
        });
      }
    } else {
      setIsValidDataGrid(false);
    }
  }, [rows]);

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

  const { enabledBranchs } = useAllowGlobal();

  const [openAnulation, setOpenAnulation] = useState(false);

  // * * * * * * * * * RENDER ALERT QUANTITIES MIN AND MAX * * * * **
  const renderAlertMinMax = (product: ProductoByBodegaType) => {
    const showMinimum =
      product.availableQuantity + product.quantity < product.minimumQuantity;
    const showMaximum =
      product.availableQuantity + product.quantity > product.maximumQuantity;
    if (showMinimum)
      enqueueSnackbar(
        `La cantidad del producto ${product.productCode} está por debajo del MÍNIMO recomendado que es: ${product.minimumQuantity}`,
        {
          variant: 'warning',
        }
      );
    if (showMaximum)
      enqueueSnackbar(
        `La cantidad del producto ${product.productCode} está por arriba del MÁXIMO recomendado que es: ${product.maximumQuantity}`,
        {
          variant: 'warning',
        }
      );
  };

  // *--------------------- METODOS PARA MANEJAR EL DATAGRID --------------------
  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string | null,
    params: GridRenderEditCellParams
  ) => {
    if (event && newValue !== null) {
      const fetchProductoByBodega = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductoByBodega(
              sucursalUser.branchId,
              parseInt(newValue.split(' - ')[0]),
              formState.tipoAbastecimiento
            );
          if (response) {
            if (response.status === 200) {
              const producto: ProductoByBodegaType = response.message;

              setProductosByBodegaList([...productosByBodegaList, producto]);

              const rowIndex = rows.findIndex((row) => row.id === params.id);

              const newRows = [...rows];
              newRows[rowIndex] = {
                ...newRows[rowIndex],
                productCode: producto.productCode,
                productName: producto.productName,
                availableQuantity: producto.availableQuantity,
                weight: producto.weight,
                quantity: 1,
                quantityApproved: 1,
                cdaQuantity: producto.cdaQuantity,
              };

              setRows(newRows);
            } else {
              enqueueSnackbar(
                `No se pudo cargar el producto: ${response.status}`,
                {
                  variant: 'error',
                }
              );
            }
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
      };
      fetchProductoByBodega();
    } else {
      const rowIndex = rows.findIndex((row) => row.id === params.id);

      const newRows = [...rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        productCode: '',
        productName: '',
        availableQuantity: 0,
        quantity: 0,
        weight: 0,
        quantityApproved: 0,
        cdaQuantity: 0,
      };
      setRows(newRows);
    }
  };

  const [inputValue, setInputValue] = useState('');

  const columns = ColumnsDefinition({
    createMode,
    editMode,
    formState,
    rows,
    setRows,
    rowModesModel,
    setRowModesModel,
    productosByBodegaList,
    setProductosByBodegaList,
    isApprovable,
    firstFieldFocus,
    addButtonRef,
    productosToSelect,
    onAutocompleteChange: handleAutocompleteChange,
    setInputValue,
    renderAlertMinMax,
  });

  useEffect(() => {
    if (!inputValue.includes(' ') && inputValue.length >= 3) {
      const fetchData = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductosByParams(inputValue);
          if (response) {
            if (response.status === 200) {
              setProductosToSelect(
                response.message.map((p: ProductoType) =>
                  p.productId
                    ?.toString()
                    .concat(' - ', p.productCode.concat(' - ', p.shortName))
                )
              );
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
              setProductosToSelect([]);
              enqueueSnackbar('No se ha encontrado el producto buscado', {
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
      fetchData();
    } else {
      setProductosToSelect([]);
    }
  }, [inputValue]);

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

    const existingRow = rows.find(
      (row) =>
        row.productCode === currentRow.productCode && row.id !== params.id
    );

    if (existingRow) {
      enqueueSnackbar(
        `Se ha encontrado un producto con el mismo código: ${currentRow.productCode}`,
        {
          variant: 'info',
        }
      );
      const updatedQuantity =
        parseFloat(existingRow.quantity) + parseFloat(currentRow.quantity);
      const updatedWeight = existingRow.weight + currentRow.weight;

      const updatedRows = rows
        .map((row) =>
          row.productCode === currentRow.productCode
            ? { ...row, quantity: updatedQuantity, weight: updatedWeight }
            : row
        )
        .filter((row) => row.id !== currentRow.id);

      setRows(updatedRows);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (
      adquisicionPeriodo?.closingPeriodDate &&
      formState.fechaSolicitud < adquisicionPeriodo.closingPeriodDate
    ) {
      enqueueSnackbar(
        'La fecha de creacion no puede ser anterior al periodo de cierre',
        {
          variant: 'error',
        }
      );
      isValid = false;
    }

    if (rows.length === 0) {
      enqueueSnackbar('Debe agregar al menos un producto', {
        variant: 'error',
      });
      isValid = false;
    }

    if (formState.tipoAbastecimiento !== TipoAdquisicionEnum.COMPRA_LOCAL) {
      rows.forEach((row) => {
        if (row.quantity === 0) {
          enqueueSnackbar(
            `La cantidad del producto ${row.productCode} no puede ser 0`,
            {
              variant: 'error',
            }
          );
          isValid = false;
        }

        if (row.quantity > row.cdaQuantity) {
          enqueueSnackbar(
            `La cantidad del producto ${row.productCode} no puede ser mayor a la cantidad del CDA`,
            {
              variant: 'error',
            }
          );
          isValid = false;
        }
      });
    }

    return isValid;
  };

  // * --------------------------------------  SAVE FORM ----------------------------------------
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      setFormState({
        ...formState,
        stateRequestPurchaseId: prevFormState.current
          ? prevFormState.current.stateRequestPurchaseId
          : RequestPurchaseEnum.EDICION,
      });
      return;
    }

    const requestPurchaseState = stateForRequest;
    const userNick = user?.userNick;

    const request: SolicitudCompraSendType = {
      branchId: formState.branchId,
      codUsrAprob:
        formState.usuarioAprueba !== null
          ? formState.usuarioAprueba
          : requestPurchaseState === RequestPurchaseEnum.APROBADO
          ? userNick
          : null,
      codUsrSend:
        formState.usuarioEnvia !== null ? formState.usuarioEnvia : userNick,
      dateApprovedSc:
        requestPurchaseState === RequestPurchaseEnum.APROBADO
          ? new Date()
          : null,
      dateCreationRequestPurchase: formState.fechaSolicitud,
      dateModificationRequestPurchase:
        requestPurchaseSelected?.requestPurchaseId ? new Date() : null,
      dateRequiredRequestPurchase: formatDateBackEnd(formState.fechaRequerida),
      daysRequestSc: null,
      obsRequestPurchase: formState.observacion,
      reasonRequestId: formState.razonSolicitud,
      reasonRequestPurchase: formState.motivo,
      requestPurchaseId: requestPurchaseSelected?.requestPurchaseId || null,
      stateRequestPurchaseId: requestPurchaseState,
      transfer: false,
      typeAdquisitionId: formState.tipoAbastecimiento,
      typeRequestId: formState.tipoSolicitud,
      userId: formState.usuario.userId,
      codUsrAnula:
        formState.usuarioAnula !== null
          ? formState.usuarioAnula
          : requestPurchaseState === RequestPurchaseEnum.ANULADO
          ? userNick
          : null,
    };

    const detailsBuilder: SolicitudCompraDetailSendType[] =
      await setRequestPurchaseDetailsSelectedFunction(
        requestPurchaseDetailsSelected,
        rows,
        sucursalUser,
        request
      );

    const details: SolicitudCompraDetailSendType[] = validateDetails(
      detailsBuilder,
      requestPurchaseDetailsSelected
    );

    try {
      const response: ServerResponseType | undefined = requestPurchaseSelected
        ? await fetchUpdate(
            { requestPurchase: request, requestPurchaseDetail: details },
            requestPurchaseSelected.requestPurchaseId
          )
        : await fetchSave({
            requestPurchase: request,
            requestPurchaseDetail: details,
          });

      if (
        !response ||
        (response && (response as ServerResponseType).status === 400) ||
        (response && (response as ServerResponseType).status === 500)
      ) {
        setFormState({
          ...formState,
          stateRequestPurchaseId: prevFormState.current
            ? prevFormState.current.stateRequestPurchaseId
            : RequestPurchaseEnum.EDICION,
        });
        return;
      }
      enqueueSnackbar(`Se guardó correctamente la solicitud de compra.`, {
        variant: 'success',
      });
      onResetForm();
      setRows([]);
      handleCancel();
    } catch (error) {
      enqueueSnackbar('Existió un error de conexión', {
        variant: 'error',
      });
    }
  };

  const onDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenAnulation(false);
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle(
        'Solicitud De Compra (Modo Edición) - N° ' +
          requestPurchaseSelected?.requestPurchaseId
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
        'Solicitud De Compra (Modo Lectura) - N° ' +
          requestPurchaseSelected?.requestPurchaseId
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

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 2 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'fixed',
          left: '5%', // Adjust the left value as needed to position the button horizontally
          transform: 'translateY(-50%)', // Center the button vertically
          zIndex: 1,
        }}
      >
        <Tooltip title="Anterior">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SkipPrevious />}
            onClick={() => {
              closeDocument({
                id: requestId,
                documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.SOLICITUD_COMPRA + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
              });
            }}
          />
        </Tooltip>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'fixed',
          right: '5%',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}
      >
        <Tooltip title="Siguiente">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SkipNext />}
            onClick={() => {
              closeDocument({
                id: requestId,
                documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.SOLICITUD_COMPRA + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.SOLICITUD_COMPRA,
              });
            }}
          />
        </Tooltip>
      </div>
    </Box>
  );

  return (
    <>
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
        headerActions={
          !createMode && navigateBetweenDocuments() ? headerComponents : null
        }
      >
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField
                name="usuario"
                label="Usuario"
                value={formState.usuario.userNick}
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Solicitud"
                disableOpenPicker
                readOnly
                format="dd/MM/yyyy"
                value={formState.fechaSolicitud}
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
              <Autocomplete
                className={styles.genericFieldStyle}
                options={sucursales}
                getOptionLabel={(option) => option.name}
                style={{ width: '100%' }}
                onChange={(event, value) =>
                  onAutocompleteChange(event, 'branchId', value?.branchId)
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter((option) =>
                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
                value={
                  (formState.branchId !== null
                    ? sucursales.find(
                        (sucursal) => sucursal.branchId === formState.branchId
                      )
                    : null) || null
                }
                isOptionEqualToValue={(option, value) =>
                  option.branchId === value.branchId
                }
                noOptionsText="Sin resultados"
                readOnly={!(createMode || editMode) || !enabledBranchs()}
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
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="abastecimiento-label">
                  Lugar Abastecimiento
                </InputLabel>
                <Select
                  name="tipoAbastecimiento"
                  labelId="abastecimiento-label"
                  id="abastecimiento-select"
                  label="Lugar Abastecimiento"
                  value={formState.tipoAbastecimiento}
                  onChange={OnSelectChange}
                  fullWidth
                  readOnly={!createMode && !editMode}
                >
                  <MenuItem value="">Seleccione Un Estado</MenuItem>
                  {tipoAdquisicionList.map((component) => (
                    <MenuItem
                      key={component.requestTypeId}
                      value={parseInt(
                        component.requestTypeId?.toString() || ''
                      )}
                    >
                      {component.requestTypeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Requerida"
                views={['year', 'month', 'day']}
                minDate={formState.fechaSolicitud}
                maxDate={dayjs(new Date()).add(1, 'month').toDate()}
                format="dd/MM/yyyy"
                value={formState.fechaRequerida}
                onChange={(value) =>
                  onDateChange(value as Date, 'fechaRequerida')
                }
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
                      shrink: formState.fechaRequerida ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              {!createMode ? (
                <TextField
                  name="stateName"
                  label="Estado"
                  value={requestPurchaseSelected?.stateRequestPurchaseName}
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
              ) : null}
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="observacion"
                label="Observación"
                value={formState.observacion.toUpperCase()}
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink: formState.observacion !== null ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid
              container
              direction="row"
              alignItems="center"
              marginLeft={2.5}
              marginTop={2}
            >
              <Grid item marginRight={2}>
                <FormControl>
                  <FormLabel>Razón Solicitud: </FormLabel>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl>
                  <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="razonSolicitud"
                    value={formState.razonSolicitud}
                    onChange={onInputChange}
                    row
                  >
                    {razonesSolicitudList.map((razon) => (
                      <FormControlLabel
                        key={razon.idRazonSolicitud}
                        value={razon.idRazonSolicitud}
                        control={<Radio />}
                        label={razon.nombreRazonSolicitud}
                        disabled={!createMode && !editMode}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <Tooltip title="Historial De Cambios">
                  <IconButton onClick={() => setOpenHistory(true)}>
                    <History />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ mt: 4, height: 4 }} />
          <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <StyledDataGrid
                rows={rows}
                columns={columns}
                editMode={createMode || editMode ? 'row' : undefined}
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                getRowClassName={(params) =>
                  `super-app-theme--${params.row.state}`
                }
                processRowUpdate={processRowUpdate}
                rowHeight={30}
                columnHeaderHeight={45}
                slots={{
                  toolbar: EditToolbar,
                  noRowsOverlay: CustomNoRowsOverlay,
                  footer: CustomFooterStatusComponent,
                }}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    firstFieldFocus,
                    createMode,
                    editMode,
                    sucursalUser,
                    addButtonRef,
                    rows,
                    setProductosByBodegaList,
                    renderAlertMinMax,
                  },
                  footer: { rows },
                }}
                sx={{
                  height: rows.length > 0 ? '100%' : '300px',
                }}
              />
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            {!createMode && (
              <>
                <Button
                  startIcon={<ExitToApp />}
                  sx={{ margin: 2 }}
                  onClick={handleCancel}
                  style={{ width: '120px' }}
                >
                  {'Salir'}
                </Button>
                {isEditable && validateAnulado && (
                  <Button
                    startIcon={<EditNote />}
                    sx={{ margin: 2 }}
                    onClick={onEditButtonClick}
                    style={{ width: '120px' }}
                  >
                    {!editMode ? 'Editar' : 'Leer'}
                  </Button>
                )}
              </>
            )}
            {isEditable && validateAnulado && (
              <>
                <Button
                  startIcon={<Save />}
                  disabled={!isFormValid || !isValidDataGrid}
                  onClick={() =>
                    setStateForRequest(
                      requestPurchaseSelected
                        ? requestPurchaseSelected.stateRequestPurchaseId
                        : RequestPurchaseEnum.EDICION
                    )
                  }
                  sx={{ margin: 2 }}
                  type="submit"
                  style={{ width: '120px' }}
                >
                  {'Guardar'}
                </Button>

                <Button
                  type="button"
                  startIcon={<Send />}
                  onClick={() => setOpenDialogAlert(true)}
                  disabled={!isFormValid || !isValidDataGrid}
                  sx={{ margin: 2 }}
                  style={{ width: '120px' }}
                >
                  {'Enviar'}
                </Button>
                {!createMode && validateAnulado && (
                  <Button
                    startIcon={<DeleteForever />}
                    onClick={() => setOpenAnulation(true)}
                    sx={{ margin: 2 }}
                    type="button"
                    style={{ width: '120px' }}
                  >
                    {'Anular'}
                  </Button>
                )}
              </>
            )}
            {isApprovable && validateAnulado && (
              <>
                <Button
                  type="submit"
                  startIcon={<Error />}
                  onClick={() => setStateForRequest(RequestPurchaseEnum.NEGADO)}
                  disabled={!isFormValid || !isValidDataGrid}
                  sx={{ margin: 2 }}
                  style={{ width: '120px' }}
                >
                  {'Negar'}
                </Button>

                <Button
                  type="submit"
                  startIcon={<Check />}
                  onClick={() =>
                    setStateForRequest(RequestPurchaseEnum.APROBADO)
                  }
                  disabled={!isFormValid || !isValidDataGrid}
                  sx={{ margin: 2 }}
                  style={{ width: '120px' }}
                >
                  {'Aprobar'}
                </Button>
              </>
            )}
          </Grid>
        </form>
      </CardLayout>
      <Dialog open={openDialogAlert} onClose={() => setOpenDialogAlert(false)}>
        <form onSubmit={onDialogConfirm}>
          <DialogContent>
            <Alert severity="warning" icon={<Info />}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
              Los datos no se podrán modificar después de enviar la solicitud de
              compra. ¿Estás seguro de que deseas proceder?
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogAlert(false)} color="primary">
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              onClick={() => setStateForRequest(RequestPurchaseEnum.ENVIADO)}
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openAnulation} onClose={() => setOpenAnulation(false)}>
        <form onSubmit={onDialogConfirm}>
          <DialogContent>
            <Alert severity="info" icon={<Info />}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
              Los datos no se podrán restablecer después de anular la solicitud
              de compra. ¿Estás seguro de que deseas proceder?
            </Alert>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  name="motivo"
                  label="Motivo Anulación"
                  value={
                    formState.motivo !== null
                      ? formState.motivo.toUpperCase()
                      : formState.motivo
                  }
                  onChange={onInputChange}
                  InputLabelProps={{
                    shrink:
                      formState.motivo !== null && formState.motivo !== ''
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAnulation(false)} color="primary">
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              onClick={() => setStateForRequest(RequestPurchaseEnum.ANULADO)}
              disabled={formState.motivo === null || formState.motivo === ''}
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openHistory} onClose={() => setOpenHistory(false)}>
        <DialogTitle
          style={{
            cursor: 'move',
            textAlign: 'center',
          }}
          id="draggable-dialog-title"
          sx={{ mt: 2 }}
        >
          Historial
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField
                name="usuarioEnvia"
                label="Usuario Creación"
                value={
                  formState.usuarioEnvia === null ? '' : formState.usuarioEnvia
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: formState.usuarioEnvia !== null ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="usuarioAprueba"
                label="Usuario Aprueba"
                value={
                  formState.usuarioAprueba === null
                    ? ''
                    : formState.usuarioAprueba
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: formState.usuarioAprueba !== null ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="usuarioAnula"
                label="Usuario Anula"
                value={
                  formState.usuarioAnula === null ? '' : formState.usuarioAnula
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: formState.usuarioAnula !== null ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Solicitud"
                disableOpenPicker
                readOnly
                format="dd/MM/yyyy"
                value={formState.fechaSolicitud}
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
                label="Fecha Aprobación"
                disableOpenPicker
                readOnly
                format="dd/MM/yyyy"
                value={formState.fechaAprobacion}
                slotProps={{
                  textField: {
                    required: false,
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
                label="Fecha Modificación"
                disableOpenPicker
                readOnly
                format="dd/MM/yyyy"
                value={formState.fechaModificacion}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistory(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    rows: GridRowsProp;
  }
}
function CustomFooterStatusComponent(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const rows = useMemo(() => props.rows || [], [props.rows]);
  const totalCantidad = rows.reduce(
    (accumulator, row) => accumulator + parseFloat(row.quantity),
    0
  );
  const totalPeso = rows.reduce(
    (accumulator, row) => accumulator + parseFloat(row.weight),
    0
  );
  const totalCantidadAprobada = rows
    .filter((row) => row.state !== false)
    .reduce(
      (accumulator, row) => accumulator + parseFloat(row.quantityApproved),
      0
    );

  return rows.length > 0 ? (
    <table>
      <TableFooter>
        <TableRow>
          <TableCell
            style={{
              fontWeight: 'bold',
              fontSize: '12px',
              textAlign: 'center',
            }}
            width={'400px'}
          >
            RESUMEN{' '}
          </TableCell>
          <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
            Total Cantidad Solicitada:{' '}
            {setDecimalPlacesString(totalCantidad, 0)}
          </TableCell>
          <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
            Total Peso Aprobado: {setDecimalPlacesString(totalPeso, 4)}
          </TableCell>
          <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
            Total Cantidad Aprobada:{' '}
            {setDecimalPlacesString(totalCantidadAprobada, 0)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </table>
  ) : null;
}
