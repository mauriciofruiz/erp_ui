import { defaultSucursalType } from '@/constants';
import {
  CondicionPagoEnum,
  DocumentTypeEnum,
  EstadoOrdenEnum,
  ParametersEnum,
  PathEnum,
  TitlesEnum,
} from '@/enums';
import {
  FormState,
  StyledDatePicker,
  useAccessDocument,
  useAllowAdquisicion,
  useAllowGlobal,
  useCommonManage,
  useForm,
  useOrdenCompraAsync,
  useProductoAsync,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules';
import { RootState, ServerResponseType } from '@/store';
import {
  DetailOrdenCompraGetType,
  DetailOrdenCompraSendType,
  ImpuestoDocumentoInterface,
  OrdenCompraGetType,
  OrdenCompraSendType,
  PersonProviderType,
  ProductoByBodegaType,
  ProductoType,
  SucursalType,
  TaxRateInterface,
} from '@/types';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  GridRenderCellParams,
  GridRowEditStopReasons,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { getProductosByParamsAndSupplier } from '@/backend/inventario';
import {
  getDecimalPlaces,
  getPercentageValue,
  setCurrencyNumber,
  setDecimalPlacesString,
} from '@/functions';

import {
  Cancel,
  Delete,
  Edit,
  Person,
  Save,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import { GridRowId } from '@mui/x-data-grid';
import axios from 'axios';
import { parseISO } from 'date-fns';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { CustomFooterOrden } from './CustomFooterOrden';
import { HandleSolicitudesCompra } from './HandleSolicitudesCompra';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import {
  AutocompleteEditInputCell,
  AutocompleteEditSucursalCell,
  ChangeHasIva,
  EditToolbar,
  ImpuestoCell,
  InputChangeDiscount,
  InputChangeDiscountPercentage,
  InputChangeQuantity,
  InputChangeTotalPrice,
  InputChangeUnitPrice,
  setDetailsPurchaseOrder,
  validateDetails,
} from './components/CustomCells';
import { SubmitButtons } from './components/SubmitButtons';

export type ManageOrdenCompraPageProps = {};

const initialFormState: FormState = {
  fechaRegisto: new Date(),
  fechaEntrega: new Date(),
  branchId: null,
  observacion: '',
  motivo: null,
  paymentConditionId: CondicionPagoEnum.CONTADO,
  stateOrderId: EstadoOrdenEnum.EN_EDICION,
};

export const ManageOrdenCompraPage: React.FC<
  ManageOrdenCompraPageProps
> = ({}) => {
  const location = useLocation();

  const orderId = useMemo(() => {
    const state =
      location.state || JSON.parse(localStorage.getItem('state') || '{}');
    const documentId = state.orderId;
    if (!documentId) return null;
    const [id, type] = documentId.split('-');
    const isValidType = Number(type) === DocumentTypeEnum.ORDEN_COMPRA;

    return isValidType ? id : null;
  }, [location.state]);

  const [createMode, setCreateMode] = useState(true);

  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');

  const { navigateBetweenDocuments, enabledBranchs } = useAllowGlobal();

  const [purchaseOrderSelected, setPurchaseOrderSelected] =
    useState<OrdenCompraGetType>();

  const [detailPurchaseOrderSelected, setDetailPurchaseOrderSelected] =
    useState<DetailOrdenCompraGetType[]>([]);

  const [taxes, setTaxes] = useState<ImpuestoDocumentoInterface[]>([]);

  const { user } = useSelector((state: RootState) => state.auth);

  const { sucursales, impuestos } = useSelector(
    (state: RootState) => state.common
  );

  const sucursalesWithAllBranches: SucursalType[] = useMemo(() => {
    return [defaultSucursalType, ...sucursales];
  }, [sucursales]);

  const { enqueueSnackbar } = useSnackbar();

  const { fetchBySucursalIdAndCode } = useProductoAsync();

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const styles = useStyles();

  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  const [isAnulation, setIsAnulation] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const sucursalUser = purchaseOrderSelected
    ? sucursales.filter(
        (s) => s.branchId === purchaseOrderSelected?.branchId
      )[0]
    : defaultSucursalType;

  const [proveedoresList, setProveedoresList] = useState<PersonProviderType[]>(
    []
  );

  const [proveedorSelected, setProveedorSelected] =
    useState<PersonProviderType>();

  const addButtonRef = useRef<HTMLButtonElement>(null);

  const firstFieldFocus = useRef<HTMLInputElement>(null);

  const [productosByBodegaList, setProductosByBodegaList] = useState<
    ProductoByBodegaType[]
  >([]);

  const [subtotalIva, setSubtotalIva] = useState(0);

  const [subtotalZero, setSubtotalZero] = useState(0);

  const [discountTotal, setDiscountTotal] = useState(0);

  const [ivaTotal, setIvaTotal] = useState(0);

  const [totalFinal, setTotalFinal] = useState(0);

  const [dialogMessage, setDialogMessage] = useState('');

  const [closeOrder, setCloseOrder] = useState(false);

  const { fetchSaveOC, fetchUpdate } = useOrdenCompraAsync();

  const { fetchProveedorPersonaByProveedor, fetchBySolicitudCompra } =
    useProveedorAsync();

  const { fetchOrdenCompraById, fetchDetailOrdenCompraByIdOrden } =
    useOrdenCompraAsync();

  const {
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    formState,
    onResetForm,
    setFormState,
  } = useForm(initialFormState);

  const { thereIsChanges, prevFormState, prevRows, rows, setRows } =
    useCommonManage(formState);

  const condicionesPagoOptions = Object.keys(CondicionPagoEnum)
    .filter((key): key is keyof typeof CondicionPagoEnum => isNaN(Number(key)))
    .map((key) => ({ label: key, value: CondicionPagoEnum[key] }));

  const [validateAnulado, setValidateAnulado] = useState(false);

  const { enableEditingOC, enableCloseOC } = useAllowAdquisicion();

  const [isEditable, setIsEditable] = useState(false);

  const { adquisicionPeriodo } = useAllowAdquisicion();

  // * * * * * * * * * * * USE EFFECT STUFF * * * * * * *

  useEffect(() => {
    const getPurchaseOrder = async () => {
      fetchOrdenCompraById(orderId).then((response) => {
        if (response) {
          const responseOrden = response as OrdenCompraGetType;
          setPurchaseOrderSelected(responseOrden);
          setTaxes(responseOrden.taxes);
        }
      });
    };

    const getPurchaseOrderDetails = async () => {
      fetchDetailOrdenCompraByIdOrden(orderId).then((response) => {
        if (response) {
          setDetailPurchaseOrderSelected(
            response as DetailOrdenCompraGetType[]
          );
        }
      });
    };

    if (orderId) {
      setCreateMode(false);
      getPurchaseOrder();
      getPurchaseOrderDetails();
    } else {
      setCreateMode(true);
      setTitle(TitlesEnum.NUEVA_ORDEN_COMPRA);
      setIsEditable(true);
      setFormState({
        ...initialFormState,
        branchId: null,
        creationUserId: user?.userId,
        modificationUserId: user?.userId,
      });
    }
  }, [orderId]);

  useEffect(() => {
    if (purchaseOrderSelected) {
      setTitle(
        TitlesEnum.ORDEN_COMPRA_LECTURA + purchaseOrderSelected.purchaseOrderId
      );

      const anulacionTemp =
        (purchaseOrderSelected.stateOrderId !== EstadoOrdenEnum.FACTURADA &&
          purchaseOrderSelected.stateOrderId !== EstadoOrdenEnum.RECEPCIONADA &&
          purchaseOrderSelected.stateOrderId !==
            EstadoOrdenEnum.RECEPCION_PARCIAL) ??
        false;

      setValidateAnulado(anulacionTemp);

      const enableEditing = enableEditingOC(
        purchaseOrderSelected
          ? purchaseOrderSelected?.stateOrderId
          : EstadoOrdenEnum.EN_EDICION,
        createMode,
        purchaseOrderSelected?.creationDate ?? new Date()
      );

      setIsEditable(enableEditing);

      const dateCreacion = purchaseOrderSelected?.creationDate
        ? purchaseOrderSelected?.creationDate
        : '';

      const dateEntrega = purchaseOrderSelected?.deliveryDate
        ? purchaseOrderSelected?.deliveryDate
        : '';

      const newFormState = {
        ...formState,
        purchaseOrderId: purchaseOrderSelected.purchaseOrderId,
        providerId: purchaseOrderSelected.providerId,
        stateOrderId: purchaseOrderSelected.stateOrderId,
        branchId: purchaseOrderSelected.branchId,
        fechaRegisto: purchaseOrderSelected
          ? parseISO(dateCreacion.toString())
          : new Date(),
        fechaEntrega: purchaseOrderSelected
          ? parseISO(dateEntrega.toString())
          : new Date(),
        sucursal: sucursalUser,
        observacion: purchaseOrderSelected
          ? purchaseOrderSelected?.observation
          : '',
        motivo: purchaseOrderSelected.motive,
        paymentConditionId: purchaseOrderSelected.paymentConditionId,
      };
      setFormState(newFormState);
      prevFormState.current = newFormState;
    }
  }, [purchaseOrderSelected]);

  useEffect(() => {
    const fetchProveedorSelected = async (providerId: number) => {
      const response = await fetchProveedorPersonaByProveedor(providerId);
      if (response) {
        setProveedorSelected(response as PersonProviderType);
      }
    };

    const fetchGetProveedores = async () => {
      const response = await fetchBySolicitudCompra();
      if (response) {
        setProveedoresList(response);
      }
    };

    if (!createMode && purchaseOrderSelected && !proveedorSelected) {
      fetchProveedorSelected(purchaseOrderSelected.providerId);
    } else if (createMode && proveedorSelected) {
      setFormState((prevState: FormState) => ({
        ...prevState,
        paymentConditionId:
          proveedorSelected?.paymentConditionId || CondicionPagoEnum.CONTADO,
      }));
    } else {
      fetchGetProveedores();
    }
  }, [createMode, purchaseOrderSelected, proveedorSelected]);

  useEffect(() => {
    const rowsTemp =
      purchaseOrderSelected &&
      detailPurchaseOrderSelected &&
      detailPurchaseOrderSelected.length > 0
        ? detailPurchaseOrderSelected.map((item) => ({
            id: randomId(),
            documentCode: item.documentCode,
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            branchId: item.branchId,
            branchName: item.branchName,
            availableQuantity: item.availableQuantity,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            discountPercentage: item.discountPercentage,
            discountValue: item.discountValue,
            hasIva: item.hasIva,
            ivaValue: item.ivaValue,
            totalFinal: item.totalPrice - item.discountValue + item.ivaValue,
            taxRateId: item.taxRateId,
          }))
        : [];
    setRows(rowsTemp);
    prevRows.current = rowsTemp;
  }, [detailPurchaseOrderSelected]);

  // ? * * * * * * * * * * *  HANDLE CLOSE ORDER * * * * * * *
  useEffect(() => {
    const isOrderReadyToClose = enableCloseOC(
      purchaseOrderSelected
        ? purchaseOrderSelected?.stateOrderId
        : EstadoOrdenEnum.EN_EDICION,
      purchaseOrderSelected?.creationDate ?? new Date()
    );

    setCloseOrder(isOrderReadyToClose);
  }, [purchaseOrderSelected, rows]);

  // ?  **********************************   USE EFFECT ROWS *********************

  // * * Controla el cambio de la cabecera o detalles de la orden de compra
  useEffect(() => {
    // const thereIsNoIva = rows.some((row) => !row.hasIva);
    // if (thereIsNoIva) {
    //   const newRows = rows.map((row) => {
    //     return {
    //       ...row,
    //       taxRateId: row.hasIva ? row.taxRateId : TarifaIvaEnum.CERO,
    //     };
    //   });
    //   setRows(newRows);
    // }
    // * Llenar lista de productos
    let productosListTemporal: ProductoByBodegaType[] = [];
    const fetchProductoByBodega = async (
      productCode: string,
      branchId: number
    ) => {
      return fetchBySucursalIdAndCode(branchId, productCode)
        .then((response) => {
          if (response) {
            return response;
          } else {
            console.error('No se pudieron cargar los productos de bodega');
            return undefined;
          }
        })
        .catch((error) => {
          console.error(error);
          return undefined;
        });
    };

    if (rows && rows.length > 0) {
      rows.map((row) => {
        if (row.productCode) {
          fetchProductoByBodega(row.productCode, row.branchId);
        }
      });
    }
    setProductosByBodegaList(productosListTemporal);
  }, [JSON.stringify(rows.map((row) => row.productId))]);

  const { closeDocument, openDocument } = useAccessDocument();
  const handleCancel = () => {
    if (orderId) {
      closeDocument({
        id: orderId,
        documentType: DocumentTypeEnum.ORDEN_COMPRA,
      });
    }
    navigate(PathEnum.ORDEN_COMPRA);
  };

  const validateForm = () => {
    const thereAreRows = rows.length > 0;

    if (!thereAreRows) {
      enqueueSnackbar(ParametersEnum.ERROR_SIN_DETALLE, {
        variant: 'error',
      });
      return false;
    } else {
      const thereIsARowEditing = rows.some((row) => {
        return rowModesModel[row.id]?.mode === GridRowModes.Edit;
      });
      if (thereIsARowEditing) {
        enqueueSnackbar('Debe guardar los cambios en el detalle de factura', {
          variant: 'error',
        });
        return false;
      }

      const thereARowWithNoProductId = rows.some((row) => !row.productId);
      if (thereARowWithNoProductId) {
        enqueueSnackbar('Debe seleccionar un producto para cada fila', {
          variant: 'error',
        });
        return false;
      }

      const thereARowWithNoBranchId = rows.some((row) => !row.branchId);
      if (thereARowWithNoBranchId) {
        enqueueSnackbar('Debe seleccionar una sucursal para cada fila', {
          variant: 'error',
        });
        return false;
      }

      const thereARowWithUnitPriceZero = rows.some((row) => row.unitPrice <= 0);
      if (thereARowWithUnitPriceZero) {
        enqueueSnackbar('El precio unitario no puede ser menor o igual a 0', {
          variant: 'error',
        });
        return false;
      }
    }

    if (
      adquisicionPeriodo?.closingPeriodDate &&
      formState.fechaEntrega < adquisicionPeriodo.closingPeriodDate
    ) {
      enqueueSnackbar(
        'La fecha de creacion no puede ser anterior al periodo de cierre',
        {
          variant: 'error',
        }
      );
      return false;
    }

    if (formState.observacion === '') {
      enqueueSnackbar('Debe agregar una observación', {
        variant: 'error',
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      setFormState({
        ...formState,
        stateOrderId: prevFormState.current
          ? prevFormState.current.stateOrderId
          : EstadoOrdenEnum.EN_EDICION,
      });
      return;
    }

    const request: OrdenCompraSendType = {
      purchaseOrderId: purchaseOrderSelected
        ? purchaseOrderSelected.purchaseOrderId
        : null,
      stateOrderId: formState.stateOrderId,
      providerId: proveedorSelected?.providerId || 0,
      branchId: user?.branchId || 0,
      warehouseId: purchaseOrderSelected
        ? purchaseOrderSelected.warehouseId
        : null,
      observation: formState.observacion,
      deliveryDate: formState.fechaEntrega,
      subtotal: subtotalIva,
      iva: ivaTotal,
      totalValue: totalFinal,
      isGeneral: false,
      motive:
        formState.motivo && formState.motivo !== null
          ? formState.motivo.toUpperCase()
          : null,
      zeroSubtotal: subtotalZero,
      discount: discountTotal,
      paymentConditionId: formState.paymentConditionId,
    };
    const detailsBuilder: DetailOrdenCompraSendType[] = setDetailsPurchaseOrder(
      rows,
      detailPurchaseOrderSelected ? detailPurchaseOrderSelected : [],
      purchaseOrderSelected
    );

    const detailsToSave: DetailOrdenCompraSendType[] = validateDetails(
      detailsBuilder,
      detailPurchaseOrderSelected
    );

    const fetchSendData = async () => {
      try {
        const response: ServerResponseType | undefined = purchaseOrderSelected
          ? await fetchUpdate(
              {
                purchaseOrder: request,
                purchaseOrderDetail: detailsToSave,
                taxes: taxes,
              },
              purchaseOrderSelected.purchaseOrderId
            )
          : await fetchSaveOC({
              purchaseOrder: request,
              purchaseOrderDetail: detailsToSave,
              taxes: taxes,
            });
        if (
          !response ||
          (response && (response as ServerResponseType).status === 400) ||
          (response && (response as ServerResponseType).status === 500)
        ) {
          setFormState({
            ...formState,
            stateOrderId: prevFormState.current
              ? prevFormState.current.stateOrderId
              : EstadoOrdenEnum.EN_EDICION,
          });
          return;
        }
        enqueueSnackbar(`Se guardó correctamente la orden de compra.`, {
          variant: 'success',
        });
        onResetForm();
        setRows([]);
        handleCancel();
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };
    try {
      await fetchSendData();
    } catch (error) {
      enqueueSnackbar('Existe un error de guardado', { variant: 'error' });
    }
  };

  const [productosToSelect, setProductosToSelect] = useState<string[]>([]);

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!inputValue.includes(' ') && inputValue.length >= 3) {
      const fetchData = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductosByParamsAndSupplier(
              inputValue,
              proveedorSelected?.providerId || 0
            );
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

  // * DEFINICION DE COLUMNAS DE LA TABLA

  /**
   * Componente que muestra el valor del impuesto correspondiente.
   *
   * @param value - Valor del impuesto.
   * @returns El componente que muestra el valor del impuesto.
   */
  const ImpuestoValue = ({ value }: { value: number }) => {
    const impuesto = impuestos.map((impuesto: TaxRateInterface) => {
      if (impuesto.taxRateId === value) {
        return impuesto.taxDescription;
      }
      return null;
    });

    return <div>{impuesto}</div>;
  };

  const columns: GridColDef[] = [
    {
      field: 'documentCode',
      headerName: 'N° Solicitud',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      minWidth: 100,
      cellClassName: 'centered-grid',
    },
    {
      field: 'productCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      minWidth: 100,
      editable: createMode || editMode,
      cellClassName: 'centered-grid',
      renderEditCell: (params) => (
        <AutocompleteEditInputCell
          params={params}
          options={productosToSelect}
          firstFieldFocus={firstFieldFocus}
          setInputValue={setInputValue}
          productosByBodegaList={productosByBodegaList}
          setProductosByBodegaList={setProductosByBodegaList}
          rows={rows}
          setRows={setRows}
        />
      ),
    },
    {
      field: 'productName',
      headerName: 'Nombre Producto',
      type: 'string',
      flex: 2,
      minWidth: 250,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: 'branchName',
      headerName: 'Sucursal',
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable:
        createMode ||
        editMode ||
        (purchaseOrderSelected && purchaseOrderSelected.purchaseOrderId === null
          ? true
          : false),
      renderEditCell: (params) => (
        <AutocompleteEditSucursalCell
          params={params}
          options={sucursales}
          productosByBodegaList={productosByBodegaList}
          setProductosByBodegaList={setProductosByBodegaList}
          rows={rows}
          setRows={setRows}
        />
      ),
    },
    {
      field: 'availableQuantity',
      headerName: 'C. Disponible',
      flex: 1,
      minWidth: 100,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      type: 'number',
      renderCell: (params) =>
        setDecimalPlacesString(
          params.value,
          getDecimalPlaces(params.row.measurementUnitId)
        ),
    },
    {
      field: 'quantity',
      headerName: 'C. Solicitada',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      minWidth: 100,
      sortable: false,
      editable: createMode || editMode,
      renderCell: (params) =>
        setDecimalPlacesString(
          params.value,
          getDecimalPlaces(params.row.measurementUnitId)
        ),
      renderEditCell: (params) => (
        <InputChangeQuantity
          params={params}
          rows={rows}
          setRows={setRows}
          productosByBodegaList={productosByBodegaList}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          impuestosList={impuestos}
        />
      ),
    },
    {
      field: 'unitPrice',
      headerName: 'P. Unitario',
      align: 'right',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      minWidth: 100,
      sortable: false,
      editable: createMode || editMode,
      valueFormatter: (params) =>
        setDecimalPlacesString(params.value as number, 6),
      renderEditCell: (params) => (
        <InputChangeUnitPrice
          params={params}
          rows={rows}
          setRows={setRows}
          productosByBodegaList={productosByBodegaList}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          impuestosList={impuestos}
        />
      ),
    },
    {
      field: 'totalPrice',
      headerName: 'P. Total',
      align: 'right',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      minWidth: 100,
      sortable: false,
      editable: createMode || editMode,
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
      renderEditCell: (params) => (
        <InputChangeTotalPrice
          params={params}
          rows={rows}
          setRows={setRows}
          productosByBodegaList={productosByBodegaList}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          impuestosList={impuestos}
        />
      ),
    },
    {
      field: 'discountPercentage',
      headerName: '% Descuento',
      align: 'right',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      minWidth: 90,
      sortable: false,
      editable: createMode || editMode,
      valueFormatter: (params) => {
        setDecimalPlacesString(params.value as number, 6);
      },
      renderEditCell: (params) => (
        <InputChangeDiscountPercentage
          params={params}
          rows={rows}
          setRows={setRows}
          productosByBodegaList={productosByBodegaList}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          impuestosList={impuestos}
        />
      ),
    },
    {
      field: 'discountValue',
      headerName: 'Descuento',
      align: 'right',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      minWidth: 100,
      sortable: false,
      editable: createMode || editMode,
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
      renderEditCell: (params) => (
        <InputChangeDiscount
          params={params}
          rows={rows}
          setRows={setRows}
          productosByBodegaList={productosByBodegaList}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          impuestosList={impuestos}
        />
      ),
    },
    {
      field: 'hasIva',
      headerName: 'Tiene IVA',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      editable: createMode || editMode,
      type: 'boolean',
      renderEditCell: (params) => (
        <ChangeHasIva
          params={params}
          rows={rows}
          setRows={setRows}
          productosByBodegaList={productosByBodegaList}
          setRowModesModel={setRowModesModel}
          rowModesModel={rowModesModel}
          impuestosList={impuestos}
        />
      ),
    },
    {
      field: 'taxRateId',
      headerName: '% IVA',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 50,
      flex: 0.8,
      sortable: false,
      editable: createMode || editMode,
      renderCell: (params: GridRenderCellParams) => (
        <ImpuestoValue value={params.value as number} />
      ),
      renderEditCell: (params) => (
        <ImpuestoCell params={params} setRows={setRows} impuestos={impuestos} />
      ),
    },
    {
      field: 'ivaValue',
      headerName: 'IVA',
      align: 'right',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      minWidth: 100,
      sortable: false,
      type: 'number',
      renderCell: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'totalFinal',
      headerName: 'Total',
      align: 'right',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      minWidth: 100,
      sortable: false,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
  ];

  if (createMode || editMode) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      minWidth: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <Tooltip title="Guardar">
              <GridActionsCellItem
                icon={<Save />}
                label="Guardar"
                sx={{
                  color: 'primary.main',
                }}
                onClick={handleSaveClick(id)}
              />
            </Tooltip>,
            <Tooltip title="No Guardar">
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancelar"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            </Tooltip>,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Editar"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<Delete />}
            label="Borrar"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    });
  }
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rows.find((row) => row.id === id);
    if (!currentRow) return;

    const existingRow = rows.find(
      (row) =>
        row.productCode === currentRow.productCode &&
        row.branchId === currentRow.branchId &&
        row.id !== id
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
      const updateTotalPrice = updatedQuantity * currentRow.unitPrice;

      const updateDiscountPercent =
        (currentRow.discountPercentage + existingRow.discountPercentage) / 2;
      const updatedDiscountValue =
        (updateTotalPrice * updateDiscountPercent) / 100;

      const ivaPercetage = impuestos.find(
        (tax) => tax.taxRateId === existingRow.taxRateId
      ) ?? { taxRatePercentage: 0 };

      const ivaValue = getPercentageValue(
        updateTotalPrice - updatedDiscountValue,
        ivaPercetage.taxRatePercentage
      );

      const totalFinal = updateTotalPrice - updatedDiscountValue + ivaValue;

      const updatedRows = rows
        .map((row) =>
          row.productCode === currentRow.productCode
            ? {
                ...row,
                quantity: updatedQuantity,
                totalPrice: updateTotalPrice,
                discountValue: updatedDiscountValue,
                discountPercetage: updateDiscountPercent,
                ivaValue,
                totalFinal,
              }
            : row
        )
        .filter((row) => row.id !== currentRow.id);

      setRows(updatedRows);
    } else {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    // Find the row to be deleted in rows
    const rowToDelete = rows.find((row) => row.id === id);

    if (rowToDelete) {
      // Get the product code of the row to be deleted
      const productCodeToDelete = rowToDelete.productCode;

      // Filter out the item with the matching productCode from productosByBodegaList
      const updatedProductosList = productosByBodegaList.filter(
        (item) => item.productCode !== productCodeToDelete
      );

      // Update the productosByBodegaList with the filtered list
      setProductosByBodegaList(updatedProductosList);

      // Finally, remove the row from rows state
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

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
        row.productCode === currentRow.productCode &&
        row.branchId === currentRow.branchId &&
        row.id !== params.id
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
      const updateTotalPrice = updatedQuantity * currentRow.unitPrice;

      const updateDiscountPercent =
        (currentRow.discountPercentage + existingRow.discountPercentage) / 2;
      const updatedDiscountValue =
        (updateTotalPrice * updateDiscountPercent) / 100;

      const ivaPercetage = impuestos.find(
        (tax) => tax.taxRateId === existingRow.taxRateId
      ) ?? { taxRatePercentage: 0 };

      const ivaValue = getPercentageValue(
        updateTotalPrice - updatedDiscountValue,
        ivaPercetage.taxRatePercentage
      );

      const totalFinal = updateTotalPrice - updatedDiscountValue + ivaValue;

      const updatedRows = rows
        .map((row) =>
          row.productCode === currentRow.productCode
            ? {
                ...row,
                quantity: updatedQuantity,
                totalPrice: updateTotalPrice,
                discountValue: updatedDiscountValue,
                discountPercetage: updateDiscountPercent,
                ivaValue,
                totalFinal,
              }
            : row
        )
        .filter((row) => row.id !== currentRow.id);

      setRows(updatedRows);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  // * * * * * * * * * * * * NAVIGATION * * * * * * * * * * * * * ** *

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
                id: orderId,
                documentType: DocumentTypeEnum.ORDEN_COMPRA,
              });
              openDocument({
                id: Number(orderId) - 1,
                navigation: () =>
                  navigate(PathEnum.ORDEN_COMPRA + PathEnum.VIEW, {
                    state: {
                      orderId: Number(orderId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.ORDEN_COMPRA,
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
                id: orderId,
                documentType: DocumentTypeEnum.ORDEN_COMPRA,
              });
              openDocument({
                id: Number(orderId) + 1,
                navigation: () =>
                  navigate(PathEnum.ORDEN_COMPRA + PathEnum.VIEW, {
                    state: {
                      orderId: Number(orderId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.ORDEN_COMPRA,
              });
            }}
          />
        </Tooltip>
      </div>
    </Box>
  );
  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };
  return (
    <>
      <CustomDialog
        fieldName="motivo"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.motivo ?? ''}
        onInputChange={onInputChange}
        stateIdFieldName="stateOrderId"
        setFormState={setFormState}
        prevStateId={
          prevFormState.current?.stateOrderId ?? EstadoOrdenEnum.EN_EDICION
        }
      />
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
          <Grid container spacing={2} alignItems="center">
            {createMode && (
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  color={'primary'}
                  sx={{ ml: 1, fontSize: '13px' }}
                >
                  Proveedores
                </Typography>
                <Paper
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    listStyle: 'none',
                    p: 0.5,
                    m: 0,
                    mb: 1,
                  }}
                  component="ul"
                >
                  {proveedoresList.map((data) => {
                    return (
                      <Chip
                        key={data.personId}
                        icon={<Person />}
                        label={data.personName}
                        sx={{ mr: 1, mb: 1 }}
                        onClick={() => {
                          setProveedorSelected(data);
                        }}
                      />
                    );
                  })}
                </Paper>
              </Grid>
            )}

            {proveedorSelected ? (
              <>
                <Grid item xs={4}>
                  <TextField
                    label="Razón Social"
                    value={proveedorSelected?.personName}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: proveedorSelected?.personName ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Identificación"
                    value={proveedorSelected?.personIdentification}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: proveedorSelected?.personIdentification
                        ? true
                        : false,
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
                      }
                    }}
                    value={
                      formState.paymentConditionId === null
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
                  <StyledDatePicker
                    label="Fecha Registro"
                    disableOpenPicker
                    readOnly
                    format="dd/MM/yyyy"
                    value={formState.fechaRegisto}
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
                    label="Fecha Entrega"
                    views={['year', 'month', 'day']}
                    minDate={formState.fechaRegisto}
                    maxDate={dayjs(new Date()).add(1, 'month').toDate()}
                    format="dd/MM/yyyy"
                    value={formState.fechaEntrega}
                    onChange={(value) =>
                      onDateChange(value as Date, 'fechaEntrega')
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
                          shrink: formState.fechaEntrega ? true : false,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={sucursalesWithAllBranches}
                    getOptionLabel={(option) => option.name}
                    style={{ width: '100%' }}
                    onChange={(event, value) =>
                      onAutocompleteChange(event, 'branchId', value?.branchId)
                    }
                    filterOptions={(options, { inputValue }) => {
                      return options.filter((option) =>
                        option.name
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      );
                    }}
                    value={
                      sucursalesWithAllBranches.find(
                        (sucursal) => sucursal.branchId === formState.branchId
                      ) || null
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
                      shrink:
                        formState.observacion !== null &&
                        formState.observacion !== ''
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  {createMode && (
                    <HandleSolicitudesCompra
                      proveedorSelected={proveedorSelected}
                      rows={rows}
                      setRows={setRows}
                      formState={formState}
                      createMode={createMode}
                    />
                  )}
                  <Divider sx={{ margin: 3, height: 4 }} />
                  <Grid item xs={12}>
                    <StyledDataGrid
                      rows={rows}
                      columns={columns}
                      editMode={createMode || editMode ? 'row' : undefined}
                      rowModesModel={rowModesModel}
                      onRowModesModelChange={handleRowModesModelChange}
                      onRowEditStop={handleRowEditStop}
                      getRowClassName={(params) =>
                        params !== null ? `super-app-theme--null` : ''
                      }
                      processRowUpdate={processRowUpdate}
                      rowHeight={30}
                      columnHeaderHeight={45}
                      sx={{ height: rows.length > 0 ? '100%' : 300 }}
                      slots={{
                        toolbar: EditToolbar,
                        noRowsOverlay: CustomNoRowsOverlay,
                        footer: CustomFooterOrden,
                      }}
                      slotProps={{
                        toolbar: {
                          setRows,
                          setRowModesModel,
                          createMode,
                          editMode,
                          addButtonRef,
                          purchaseOrderSelected,
                        },
                        footer: {
                          rows,
                          setSubtotalIva,
                          setSubtotalZero,
                          setDiscountTotal,
                          setIvaTotal,
                          setTotalFinal,
                          impuestos,
                          taxes,
                          setTaxes,
                          createMode,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </>
            ) : null}
          </Grid>
          <SubmitButtons
            createMode={createMode}
            handleCancel={handleCancel}
            isEditable={isEditable}
            editMode={editMode}
            thereIsChanges={thereIsChanges}
            setDialogMessage={setDialogMessage}
            setIsAnulation={setIsAnulation}
            setOpenDialogAlert={setOpenDialogAlert}
            formState={formState}
            setFormState={setFormState}
            rows={rows}
            setEditMode={setEditMode}
            setTitle={setTitle}
            closeOrder={closeOrder}
            enableAnulation={validateAnulado}
          />
        </form>
      </CardLayout>
    </>
  );
};
