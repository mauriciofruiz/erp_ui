'use client';
import { getProductByStoreCode } from '@/backend';
import { defaultSucursalType } from '@/constants';
import { DocumentTypeEnum, EstadoLogisticaEnum, PathEnum } from '@/enums';
import { EstadoEntregaEnum } from '@/enums/EstadoEntregaEnum';
import {
  useAccessDocument,
  useAllowAdquisicion,
  useAllowAlmacenamiento,
  useAllowGlobal,
  useForm,
  useListaEmpaqueAsync,
  useProductoAsync,
  useTransferenciaAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import {
  BodegaGetInterface,
  DetalleListaEmpaqueTransferencia,
  ListaEmpaqueTransferencia,
  ProductoByBodegaType,
  TransferDetailList,
  TransferDetailListGet,
  TransferenciaGet,
  TransferenciaPost,
} from '@/types';
import {
  Check,
  DeleteForever,
  EditNote,
  ExitToApp,
  PictureAsPdf,
  Save,
  Send,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import { Box, Button, Divider, Grid, Tooltip } from '@mui/material';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { parseISO } from 'date-fns';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { TransferenciaDetalle } from './components/TransferenciaDetalle';
import { TransferenciaDialogo } from './components/TransferenciaDialogo';
import { TransferenciaForm } from './components/TransferenciaForm';
import { TransferenciaListasEmpaque } from './components/TransferenciaListasEmpaque';
import { setRequestDetailsSelectedFunction } from './components/TransferenciaValidate';
import { downloadPdf } from '@/functions';

type ManageTransferenciaPageProps = {};

export const ManageTransferenciaPage: React.FC<
  ManageTransferenciaPageProps
> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateBetweenDocuments } = useAllowGlobal();
  const [title, setTitle] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  const [isEditable, setIsEditable] = useState(true);
  const [openReception, setOpenReception] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const [isApprovable, setIsApprovable] = useState(false);
  const [isRecepted, setIsRecepted] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const { closeDocument, openDocument } = useAccessDocument();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sucursales } = useSelector((state: RootState) => state.common);
  const { enableApproveTR, enableEditingTR, enableConfirmTR } =
    useAllowAlmacenamiento();
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const requestId =
    location && location.state ? location.state.requestId : undefined;

  const isForeign =
    location && location.state ? location.state.isForeign : false;

  const [wareHouseList, setWareHouseList] = useState<BodegaGetInterface[]>([]);
  const [wareHouseDestiny, setWareHouseDestiny] = useState<
    BodegaGetInterface[]
  >([]);
  const [stateForRequest, setStateForRequest] = useState<number>(
    EstadoLogisticaEnum.GENERADA
  );
  const [productosByBodegaList, setProductosByBodegaList] = useState<
    ProductoByBodegaType[]
  >([]);
  const [requestTransferSelected, setRequestTransferSelected] =
    useState<TransferenciaGet>();
  const [disabledAll, setDisabledAll] = useState(false);
  const [openAnulation, setOpenAnulation] = useState(false);
  const [isValidDataGrid, setIsValidDataGrid] = useState(true);
  const [requesTransferDetailSelected, setRequestTransferDetailSelected] =
    useState<TransferDetailListGet[]>([]);
  const sucursalUser = sucursales.filter(
    (s) => s.branchId === user?.branchId
  )[0] || { ...defaultSucursalType };

  const { fetchListEmpaqueTransferencia } = useListaEmpaqueAsync();
  const {
    fetchTransferenciaPdf,
    fetchSaveTransfer,
    fetchUpdateTransfer,
    fetchById,
  } = useTransferenciaAsync();

  const [listasEmpaque, setListasEmpaque] = useState<
    ListaEmpaqueTransferencia[]
  >([]);

  const [selectedContenedor, setSelectedContenedor] =
    useState<DetalleListaEmpaqueTransferencia>();

  const { fetchProductByListaEmpaqueContenedor, fetchBySucursalIdAndCode } =
    useProductoAsync();
  const { adquisicionPeriodo } = useAllowAdquisicion();
  const prevFormState = useRef<any | undefined>(undefined);
  const {
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    formState,
    setFormState,
  } = useForm({
    usuario: user,
    branch: sucursalUser,
    departureWarehouse: null,
    destinationWarehouse: null,
    registerDate: new Date(),
    receptionDate: new Date(),
    observation: '',
    userCancel: '',
    userConfirm: '',
    userRecept: '',
    cancellObservation: '',
    nameTransporter: '',
    ciTransporter: '',
    plateTransporter: '',
    addressTransporter: '',
    arrivalTransporter: '',
    arrivalDate: new Date(),
    totalQuantity: 0,
    hasGuide: false,
  });

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 2 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'fixed',
          left: '5%',
          transform: 'translateY(-50%)',
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
                documentType: DocumentTypeEnum.TRANSFERENCIA,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.TRANSFERENCIA + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.TRANSFERENCIA,
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
                documentType: DocumentTypeEnum.TRANSFERENCIA,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.TRANSFERENCIA + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.TRANSFERENCIA,
              });
            }}
          />
        </Tooltip>
      </div>
    </Box>
  );
  const handleCancel = async () => {
    if (requestId) {
      closeDocument({
        id: requestId,
        documentType: DocumentTypeEnum.TRANSFERENCIA,
      });
    }
    navigate(PathEnum.TRANSFERENCIA);
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle(
        'Transferencia (Modo Edición) - N° ' +
          requestTransferSelected?.transferId
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
        'Transferencia (Modo Lectura) - N° ' +
          requestTransferSelected?.transferId
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
    setTitle(
      createMode
        ? 'Nueva Transferencia'
        : 'Transferencia (Modo Lectura) - N° ' + requestId
    );
  }, [createMode, requestId]);

  useEffect(() => {
    const totalCantidad = (rows || []).reduce(
      (accumulator, row) => accumulator + parseFloat(row.quantityApproved),
      0
    );

    if (rows.length > 0) {
      totalCantidad;
      setFormState({
        ...formState,
        totalQuantity: totalCantidad,
      });
    }
  }, [rows]);

  useEffect(() => {
    if (requestId) {
      setCreateMode(false);
      const getRequesTransfer = async () => {
        fetchById(Number(requestId)).then((response) => {
          if (response) {
            const transferTemp: TransferenciaGet = response;
            setRequestTransferSelected(transferTemp);
            setRequestTransferDetailSelected(transferTemp.transferDetailList);
          }
        });
      };
      getRequesTransfer();
    } else {
      setConfirm(enableConfirmTR(EstadoLogisticaEnum.GENERADA, new Date()));
    }
  }, [requestId]);

  useEffect(() => {
    const fetchData = async () => {
      if (requestTransferSelected) {
        const states = [EstadoLogisticaEnum.RECEPCIONADA];

        if (states.includes(requestTransferSelected.logisticStateId)) {
          setDisabledAll(true);
          setIsRecepted(true);
        } else {
          const enableEditing = enableEditingTR(
            requestTransferSelected
              ? requestTransferSelected?.logisticStateId
              : EstadoLogisticaEnum.GENERADA,
            requestTransferSelected?.registrationDate
          );

          const enableConfirm = enableConfirmTR(
            requestTransferSelected
              ? requestTransferSelected?.logisticStateId
              : EstadoLogisticaEnum.GENERADA,
            requestTransferSelected?.registrationDate
          );

          const enableApprove = await enableApproveTR(
            requestTransferSelected?.logisticStateId,
            requestTransferSelected?.registrationDate,
            requestTransferSelected.warehouseDestinationId
          );

          setIsEditable(enableEditing);
          setIsApprovable(enableApprove);
          setConfirm(enableConfirm);
        }

        const dateRequest =
          typeof requestTransferSelected?.registrationDate === 'string'
            ? parseISO(requestTransferSelected?.registrationDate)
            : requestTransferSelected?.registrationDate ?? new Date();

        const dateRecepcion =
          typeof requestTransferSelected?.receptionDate === 'string'
            ? parseISO(requestTransferSelected?.receptionDate)
            : requestTransferSelected?.receptionDate ?? new Date();

        const wareHouseOption: BodegaGetInterface = {
          warehouseId: requestTransferSelected?.warehouseOriginId,
          warehouseName: requestTransferSelected?.warehouseOriginName,
          branchId: 0,
          warehouseCode: '',
          warehouseSequence: 0,
          warehouseTypeId: 0,
        };

        setWareHouseList([wareHouseOption]);

        setFormState({
          purchaseRequestId: requestTransferSelected.purchaseRequestId,
          usuario: requestTransferSelected
            ? {
                userNick: requestTransferSelected?.userNick,
                userId: requestTransferSelected?.userId,
              }
            : user,
          branch: sucursalUser,
          departureWarehouse: requestTransferSelected
            ? requestTransferSelected.warehouseOriginId
            : null,
          destinationWarehouse: requestTransferSelected
            ? requestTransferSelected.warehouseDestinationId
            : null,
          registerDate:
            requestTransferSelected &&
            requestTransferSelected.registrationDate != null
              ? dateRequest
              : new Date(),
          receptionDate:
            requestTransferSelected &&
            requestTransferSelected.receptionDate != null
              ? dateRecepcion
              : new Date(),
          observation: requestTransferSelected
            ? requestTransferSelected.observation
            : null,
          userCancel: requestTransferSelected
            ? requestTransferSelected.canceledUserId
            : '',
          userConfirm: requestTransferSelected
            ? requestTransferSelected.confirmUserId
            : '',
          userRecept: requestTransferSelected
            ? requestTransferSelected.receiverUserId
            : '',
          cancellObservation: requestTransferSelected
            ? requestTransferSelected.cancellationObservation
            : '',
          packingListId: requestTransferSelected.packingListId,
          containerNumber: requestTransferSelected.containerNumber,
          hasGuide: requestTransferSelected.hasGuide,
          addressTransporter: requestTransferSelected.addressTransporter,
          arrivalDate: requestTransferSelected.arrivalDate,
        });
      }
    };

    fetchData();
  }, [requestTransferSelected]);

  useEffect(() => {
    setRows(
      requesTransferDetailSelected && requesTransferDetailSelected.length > 0
        ? requesTransferDetailSelected.map((item) => ({
            id: randomId(),
            transferId: item.transferId,
            productCode: item.productCode,
            productName: item.productName,
            quantity: item.quantity,
            availableQuantity: item.availableQuantity,
            weight: item?.weight?.toFixed(2),
            abasRequestCode: '',
            toBill: item.toBill,
            canceled: item.canceled,
            quantityToDispatch: item.pendingQuantity,
            detailTransferId: item.detailTransferId,
            quantityApproved: item.quantity,
            isService: item.isService,
          }))
        : []
    );
  }, [requesTransferDetailSelected]);

  useEffect(() => {
    if (rows.length > 0) {
      let flag = true;
      let productosListTemporal: ProductoByBodegaType[] = [];
      const fetchProductoByBodega = async (productCode: string, row: any) => {
        try {
          const response: ServerResponseType | undefined =
            await getProductByStoreCode(
              formState.departureWarehouse,
              productCode
            );
          if (response) {
            if (response.status === 200) {
              const producto: ProductoByBodegaType = {
                ...response.message,
                quantity: row.quantity,
              };
              productosListTemporal.push(producto);
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
      rows.map((row) => {
        fetchProductoByBodega(row.productCode, row);
      });
      setProductosByBodegaList(productosListTemporal);
      rows.forEach((row) => {
        if (!row.isService) {
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

  const validateForm = () => {
    let isValid = true;
    if (formState.departureWarehouse === null) {
      isValid = false;
      enqueueSnackbar(`Selecione una bodega de salida`, { variant: 'error' });
    }

    if (formState.destinationWarehouse === null) {
      isValid = false;
      enqueueSnackbar(`Seleecione una bodega de destino`, {
        variant: 'error',
      });
    }
    if (
      adquisicionPeriodo?.closingPeriodDate &&
      formState.registerDate < adquisicionPeriodo.closingPeriodDate
    ) {
      enqueueSnackbar(
        'La fecha de creacion no puede ser anterior al periodo de cierre',
        {
          variant: 'error',
        }
      );
      isValid = false;
    }
    return isValid;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    let valido = true;
    if (!validateForm()) {
      setFormState({
        ...formState,
        logisticStateId: prevFormState.current
          ? prevFormState.current.logisticStateId
          : EstadoLogisticaEnum.GENERADA,
      });
      return;
    }

    const requestTransferState = stateForRequest;
    const userId = user?.userId;

    const request: TransferenciaPost = {
      logisticStateId:
        formState.logisticStateId && formState.logisticStateId != null
          ? formState.logisticStateId
          : requestTransferState,
      userId: formState.usuario.userId,
      transferDetail: '',
      warehouseOrigin: formState.departureWarehouse,
      warehouseDestination: formState.destinationWarehouse,
      totalQuantity: formState.totalQuantity,
      transportCode: 0,
      receptionDate:
        requestTransferState === EstadoLogisticaEnum.RECEPCIONADA
          ? formState.receptionDate.toISOString().slice(0, 10)
          : '',
      transferred: true,
      purchaseRequestId: formState.purchaseRequestId ?? null,
      observation: formState.observation,
      referenceNumber: null,
      finalReceptionDate:
        requestTransferState === EstadoLogisticaEnum.RECEPCIONADA
          ? formState.receptionDate.toISOString().slice(0, 10)
          : '',
      receiverUserId:
        formState.userRecept !== null
          ? formState.userRecept
          : requestTransferState === EstadoLogisticaEnum.RECEPCIONADA
          ? userId
          : null,
      canceledUserId:
        formState.userCancel !== null
          ? formState.userCancel
          : requestTransferState === EstadoLogisticaEnum.ANULADA
          ? userId
          : null,
      confirmUserId:
        formState.userConfirm !== null
          ? formState.userConfirm
          : requestTransferState === EstadoLogisticaEnum.CONFIRMADA
          ? userId
          : null,
      cancellationDate: '',
      cancellationObservation: formState.cancellObservation,
      deliveryStateId: EstadoEntregaEnum.SIN_DESPACHAR,
      packingListId: formState.packingListId ? formState.packingListId : null,
      containerNumber: formState.containerNumber
        ? formState.containerNumber
        : null,
      transferDetailList: [],
      transportista: formState.transportista,
      hasGuide: formState.hasGuide
        ? formState.hasGuide
        : formState.transportista != null && formState.transportista
        ? true
        : false,
      addressTransporter: formState.addressTransporter,
      arrivalDate: formState.arrivalDate,
    };

    const detailsBuilder: TransferDetailList[] =
      await setRequestDetailsSelectedFunction(
        sucursalUser?.branchId,
        requesTransferDetailSelected,
        rows,
        fetchBySucursalIdAndCode
      );

    request.transferDetailList = detailsBuilder;

    if (detailsBuilder.length === 0) {
      valido = false;
      enqueueSnackbar(`Debe ingresar al menos un producto`, {
        variant: 'error',
      });
    }
    if (!valido) return;

    if (createMode) {
      await fetchSaveTransfer(request);
    } else {
      requestTransferSelected?.transferId
        ? await fetchUpdateTransfer(
            requestTransferSelected?.transferId,
            request
          )
        : null;
    }

    handleCancel();
  };

  useEffect(() => {
    if (isForeign) {
      fetchListEmpaqueTransferencia().then((response) => {
        if (response) {
          setListasEmpaque(response as ListaEmpaqueTransferencia[]);
        }
      });
    }
  }, [isForeign]);

  useEffect(() => {
    if (isForeign && selectedContenedor && formState.departureWarehouse) {
      fetchProductByListaEmpaqueContenedor(
        selectedContenedor.packingListId,
        selectedContenedor.containerNumber,
        formState.departureWarehouse
      ).then((response) => {
        if (response) {
          const newRows = (response as ProductoByBodegaType[]).map((item) => ({
            id: randomId(),
            ...item,
          }));
          setRows(newRows);
        }
      });
    }
  }, [formState.departureWarehouse, selectedContenedor]);

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
          <TransferenciaForm
            formState={formState}
            createMode={createMode}
            editMode={editMode}
            onDateChange={onDateChange}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            wareHouseList={wareHouseList}
            setWareHouseList={setWareHouseList}
            wareHouseDestiny={wareHouseDestiny}
            setWareHouseDestiny={setWareHouseDestiny}
            isRecepted={isRecepted}
            isApprovable={isApprovable}
            isForeign={isForeign}
          />
          {isForeign && (
            <TransferenciaListasEmpaque
              listasEmpaque={listasEmpaque}
              setFormState={setFormState}
              setWareHouseDestiny={setWareHouseDestiny}
              setSelectedContenedor={setSelectedContenedor}
            />
          )}
          <Divider sx={{ mt: 4, height: 4 }} />
          <TransferenciaDetalle
            formState={formState}
            createMode={createMode}
            editMode={editMode}
            isApprovable={isApprovable}
            rows={rows}
            setRows={setRows}
            productosByBodegaList={productosByBodegaList}
            setProductosByBodegaList={setProductosByBodegaList}
            rowModesModel={rowModesModel}
            setRowModesModel={setRowModesModel}
            sucursalUser={sucursalUser}
            isForeign={isForeign}
          />
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            {!disabledAll ? (
              <>
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
                    <Button
                      startIcon={<PictureAsPdf />}
                      sx={{ margin: 2 }}
                      onClick={() => {
                        fetchTransferenciaPdf(formState.transferId).then(
                          (response) => {
                            downloadPdf(
                              response,
                              `transferencia_${formState.transferId}.pdf`
                            );
                          }
                        );
                      }}
                      style={{ width: '130px' }}
                    >
                      {'Descargar PDF'}
                    </Button>
                    {isEditable && confirm && (
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
                {isEditable && (
                  <>
                    <Button
                      startIcon={<Save />}
                      disabled={!isValidDataGrid}
                      onClick={() =>
                        setStateForRequest(
                          requestTransferSelected
                            ? requestTransferSelected.logisticStateId
                            : EstadoLogisticaEnum.GENERADA
                        )
                      }
                      sx={{ margin: 2 }}
                      type="submit"
                      style={{ width: '120px' }}
                    >
                      {'Guardar'}
                    </Button>
                    {!createMode && confirm && (
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
                    {confirm && (
                      <Button
                        type="button"
                        disabled={!isValidDataGrid}
                        startIcon={<Send />}
                        onClick={() => {
                          setStateForRequest(EstadoLogisticaEnum.CONFIRMADA);
                          setOpenDialogAlert(true);
                        }}
                        sx={{ margin: 2 }}
                        style={{ width: '120px' }}
                      >
                        {'Confirmar'}
                      </Button>
                    )}
                  </>
                )}
                {isApprovable && (
                  <>
                    <Button
                      type="button"
                      startIcon={<Check />}
                      onClick={() => setOpenReception(true)}
                      sx={{ margin: 2 }}
                      style={{ width: '120px' }}
                    >
                      {'Recepcionar'}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  startIcon={<ExitToApp />}
                  sx={{ margin: 2 }}
                  onClick={handleCancel}
                  style={{ width: '120px' }}
                >
                  {'Salir'}
                </Button>
                <Button
                  startIcon={<PictureAsPdf />}
                  sx={{ margin: 2 }}
                  onClick={() => {
                    if (requestTransferSelected)
                      fetchTransferenciaPdf(
                        requestTransferSelected?.transferId
                      ).then((response) => {
                        downloadPdf(
                          response,
                          `transferencia_${requestTransferSelected?.transferId}.pdf`
                        );
                      });
                  }}
                  style={{ width: '130px' }}
                >
                  {'Descargar PDF'}
                </Button>
              </>
            )}
          </Grid>
          <TransferenciaDialogo
            openDialogAlert={openDialogAlert}
            setOpenDialogAlert={setOpenDialogAlert}
            openReception={openReception}
            setOpenReception={setOpenReception}
            formState={formState}
            onInputChange={onInputChange}
            openHistory={openHistory}
            setOpenHistory={setOpenHistory}
            setStateForRequest={setStateForRequest}
            openAnulation={openAnulation}
            setOpenAnulation={setOpenAnulation}
            onAutocompleteChange={onAutocompleteChange}
            setFormState={setFormState}
            onSubmit={onSubmit}
          />
        </form>
      </CardLayout>
    </>
  );
};
