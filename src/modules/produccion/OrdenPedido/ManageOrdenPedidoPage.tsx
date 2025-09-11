import { defaultSucursalType } from '@/constants';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { EstadoProduccionEnum } from '@/enums/EstadoProduccionEnum';
import {
  useAccessDocument,
  useAllowAdquisicion,
  useAllowGlobal,
  useAllowProduccion,
  useForm,
  useOrdenPedidoAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { SucursalType } from '@/types';
import {
  DetailRequestListGet,
  OrdenPedidoGet,
  OrdenPedidoPost,
} from '@/types/inventario/ordenPedido.type';
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
import { Box, Button, Grid, Tooltip } from '@mui/material';
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
import { OrdenPedidoDialog } from './components/OrdenPedidoDialog';
import { OrdenPedidoForm } from './components/OrdenPedidoForm';
import { downloadPdf } from '@/functions';

export type ManageOrdenPedidoPageProps = {
  // types...
};

export const ManageOrdenPedidoPage: React.FC<
  ManageOrdenPedidoPageProps
> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateBetweenDocuments } = useAllowGlobal();
  const [title, setTitle] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  const [isEditable, setIsEditable] = useState(true);
  const [isApprovable, setIsApprovable] = useState(false);
  const [disabledAll, setDisabledAll] = useState(false);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const { closeDocument, openDocument } = useAccessDocument();
  const [sucursal, setSucursal] = useState<SucursalType[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const { sucursales } = useSelector((state: RootState) => state.common);
  const { enableEditingOP, enableApproveOP } = useAllowProduccion();
  const [openHistory, setOpenHistory] = useState(false);
  const [openAnulation, setOpenAnulation] = useState(false);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const requestId =
    location && location.state ? location.state.requestId : undefined;
  const [requestOrderSelected, setRequestOrderSelected] =
    useState<OrdenPedidoGet>();
  const [stateForRequest, setStateForRequest] = useState<number>(
    EstadoProduccionEnum.GENERADO
  );
  const [requestOrderDetailsSelected, setRequestOrderDetailsSelected] =
    useState<DetailRequestListGet[]>([]);
  const {
    fetchSaveOPedido,
    fetchUpdateOpedido,
    fetchOrdenPedidoPdf,
    fetchById,
  } = useOrdenPedidoAsync();
  const prevFormState = useRef<any | undefined>(undefined);
  const { adquisicionPeriodo } = useAllowAdquisicion();

  const sucursalUser = requestOrderSelected
    ? sucursales.filter(
        (s) => s.branchId === requestOrderSelected?.branchRequestId
      )[0]
    : sucursales.filter((s) => s.branchId === user?.branchId)[0] || {
        ...defaultSucursalType,
      };

  const {
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    setFormState,
    formState,
  } = useForm({
    user: user?.userName,
    userId: user?.userId,
    branchRequest: sucursalUser.name,
    branchProduce: null,
    branchProduceId: null,
    requestDate: new Date(),
    deliverDate: new Date(),
    observation: '',
    reasonCancel: '',
    totalQuantity: 0,
    producedQuantity: 0,
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
                documentType: DocumentTypeEnum.ORDEN_DE_PEDIDO,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.ORDEN_PEDIDO + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.ORDEN_DE_PEDIDO,
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
                documentType: DocumentTypeEnum.ORDEN_DE_PEDIDO,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.ORDEN_PEDIDO + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.ORDEN_DE_PEDIDO,
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
        documentType: DocumentTypeEnum.ORDEN_DE_PEDIDO,
      });
    }
    navigate(PathEnum.ORDEN_PEDIDO);
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle('Orden de pedido (Modo Edición) - N° ' + requestId);
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
      setTitle('Orden de pedido (Modo Lectura) - N° ' + requestId);
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
        ? 'Nueva Orden de Pedido'
        : 'Orden de Pedido (Modo Lectura) - N° ' + requestId
    );
  }, [createMode, requestId]);

  useEffect(() => {
    if (requestId) {
      setCreateMode(false);
      const getRequestPurchase = async () => {
        fetchById(Number(requestId)).then((response) => {
          if (response) {
            const temp: OrdenPedidoGet = response;
            setRequestOrderSelected(temp);
            setRequestOrderDetailsSelected(temp.detailRequestList);
          }
        });
      };
      getRequestPurchase();
    }
  }, [requestId]);

  useEffect(() => {
    if (requestOrderSelected) {
      const states = [EstadoProduccionEnum.CONFIRMADO];

      if (states.includes(requestOrderSelected.productionStatusId)) {
        setDisabledAll(true);
        //setIsRecepted(true);
      } else {
        const enableEditing = enableEditingOP(
          requestOrderSelected ? requestOrderSelected?.productionStatusId : 0,
          requestOrderSelected?.registrationDate
        );

        const enableApprove = enableApproveOP(
          requestOrderSelected ? requestOrderSelected?.productionStatusId : 0,
          requestOrderSelected?.registrationDate
        );

        setIsEditable(enableEditing);
        setIsApprovable(enableApprove);
      }

      const requestDate =
        typeof requestOrderSelected?.startDate === 'string'
          ? parseISO(requestOrderSelected?.startDate)
          : requestOrderSelected?.startDate ?? new Date();

      const deliverDate =
        typeof requestOrderSelected?.endDate === 'string'
          ? parseISO(requestOrderSelected?.endDate)
          : requestOrderSelected?.endDate ?? new Date();

      setFormState({
        userId: requestOrderSelected ? requestOrderSelected?.userId : '',
        user: requestOrderSelected ? requestOrderSelected?.userName : '',
        branchRequest: sucursalUser.name,
        branchProduce: requestOrderSelected
          ? requestOrderSelected.branchProducesId
          : '',
        branchProduceId: requestOrderSelected
          ? requestOrderSelected.branchProducesId
          : '',
        requestDate:
          requestOrderSelected && requestOrderSelected.startDate != null
            ? requestDate
            : new Date(),
        deliverDate:
          requestOrderSelected && requestOrderSelected.endDate != null
            ? deliverDate
            : new Date(),
        observation: requestOrderSelected
          ? requestOrderSelected?.observation
          : '',
        reasonCancel: requestOrderSelected
          ? requestOrderSelected.reasonCancel
          : '',
        totalQuantity: requestOrderSelected
          ? requestOrderSelected.totalQuantity
          : 0,
        productionStatusId: requestOrderSelected.productionStatusId,
      });
    }
  }, [requestOrderSelected]);

  useEffect(() => {
    setRows(
      requestOrderDetailsSelected && requestOrderDetailsSelected.length > 0
        ? requestOrderDetailsSelected.map((item) => ({
            id: randomId(),
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            quantity: item.quantity,
            quantityProduced: item.quantityProduced,
            observation: item.observation,
            requestDetailId: item.requestDetailId,
            recipeId: item.recipeId,
            requestId: item.requestId,
          }))
        : []
    );
  }, [requestOrderDetailsSelected]);

  useEffect(() => {
    const totalCantidad = (rows || []).reduce(
      (accumulator, row) => accumulator + parseFloat(row.quantity),
      0
    );
    if (rows.length > 0) {
      if (isApprovable) {
        setFormState({
          ...formState,
          producedQuantity: totalCantidad,
        });
      } else {
        setFormState({
          ...formState,
          totalQuantity: totalCantidad,
        });
      }
    }
  }, [rows]);

  const validateForm = () => {
    let isValid = true;
    if (formState.user === undefined || formState.user === null) {
      isValid = false;
      enqueueSnackbar('Seleccione un usuario', {
        variant: 'error',
      });
    }

    if (
      formState.branchRequest === undefined ||
      formState.branchRequest === null
    ) {
      isValid = false;
      enqueueSnackbar('Sucursal solicita invalida', {
        variant: 'error',
      });
    }

    if (
      formState.branchProduce === undefined ||
      formState.branchProduce === null
    ) {
      isValid = false;
      enqueueSnackbar('Sucursal produce invalida', {
        variant: 'error',
      });
    }

    if (
      adquisicionPeriodo?.closingPeriodDate &&
      formState.requestDate < adquisicionPeriodo.closingPeriodDate
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
    if (!validateForm()) {
      setFormState({
        ...formState,
        productionStatusId: prevFormState.current
          ? prevFormState.current.productionStatusId
          : EstadoProduccionEnum.GENERADO,
      });
      return;
    }

    try {
      const ordenPedido: OrdenPedidoPost = {
        userId: formState.userId,
        productionStatusId: stateForRequest,
        totalQuantity: formState.totalQuantity,
        startDate: formState.requestDate.toISOString().slice(0, 35),
        endDate: formState.deliverDate.toISOString().slice(0, 35),
        producedQuantity:
          formState.producedQuantity > 0 ? formState.producedQuantity : 0,
        requestNumber: 0,
        observation: formState.observation,
        reasonCancel: formState.reasonCancel,
        productionEndDate:
          stateForRequest === EstadoProduccionEnum.CONFIRMADO
            ? new Date()
            : null,
        branchRequestId:
          sucursalUser !== undefined && sucursalUser.branchId !== undefined
            ? sucursalUser.branchId
            : null,
        branchProducesId: formState.branchProduce,
        requestDetailList: [],
      };

      const materiaPrima = rows.map((item) => ({
        requestDetailId: item.requestDetailId,
        productId: item.productId,
        recipeId: item.recipeId,
        requestId: item.requestId,
        quantity: item.quantity,
        quantityProduced: item.quantityProduced,
        status: true,
        observation: item.observation,
      }));

      ordenPedido.requestDetailList = materiaPrima;

      const response =
        requestId !== undefined && requestId !== null
          ? await fetchUpdateOpedido(requestId, ordenPedido)
          : await fetchSaveOPedido(ordenPedido);
      if (
        !response ||
        (response && (response as ServerResponseType).status === 400) ||
        (response && (response as ServerResponseType).status === 500)
      ) {
        setFormState({
          ...formState,
          productionStatusId: prevFormState.current
            ? prevFormState.current.productionStatusId
            : EstadoProduccionEnum.GENERADO,
        });
        enqueueSnackbar(
          `No se pudo guardar la orden de pedido ${
            response ? response.message.message : ''
          }`,
          { variant: 'error' }
        );
        return;
      }
      enqueueSnackbar(`Se guardó correctamente la orden de pedido.`, {
        variant: 'success',
      });
      handleCancel();
    } catch (error) {
      enqueueSnackbar(`Error al guardar la orden de pedido: ${error}`, {
        variant: 'error',
      });
    }
  };

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
          <OrdenPedidoForm
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onDateChange={onDateChange}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            sucursal={sucursal}
            setSucursal={setSucursal}
            rows={rows}
            setRows={setRows}
            isApprovable={isApprovable}
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
                    {requestId && (
                      <Button
                        startIcon={<PictureAsPdf />}
                        sx={{ margin: 2 }}
                        onClick={() => {
                          fetchOrdenPedidoPdf(requestId).then((response) => {
                            downloadPdf(
                              response,
                              `orden_pedido_${requestId}.pdf`
                            );
                          });
                        }}
                        style={{ width: '130px' }}
                      >
                        {'Descargar PDF'}
                      </Button>
                    )}
                    {isEditable && (
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
                  <Button
                    startIcon={<Save />}
                    onClick={() =>
                      setStateForRequest(
                        requestOrderSelected
                          ? requestOrderSelected.productionStatusId
                          : EstadoProduccionEnum.GENERADO
                      )
                    }
                    sx={{ margin: 2 }}
                    type="submit"
                    style={{ width: '120px' }}
                  >
                    {'Guardar'}
                  </Button>
                )}
                {isEditable && !isApprovable && (
                  <Button
                    type="button"
                    startIcon={<Send />}
                    onClick={() => setOpenDialogAlert(true)}
                    sx={{ margin: 2 }}
                    style={{ width: '120px' }}
                  >
                    {'Enviar'}
                  </Button>
                )}
                {isApprovable && (
                  <>
                    <Button
                      startIcon={<DeleteForever />}
                      onClick={() => setOpenAnulation(true)}
                      sx={{ margin: 2 }}
                      type="button"
                      style={{ width: '120px' }}
                    >
                      {'Anular'}
                    </Button>
                    <Button
                      startIcon={<Check />}
                      onClick={() =>
                        setStateForRequest(EstadoProduccionEnum.CONFIRMADO)
                      }
                      sx={{ margin: 2 }}
                      type="submit"
                      style={{ width: '120px' }}
                    >
                      {'Aprobar'}
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
                  startIcon={<DeleteForever />}
                  onClick={() => setOpenAnulation(true)}
                  sx={{ margin: 2 }}
                  type="button"
                  style={{ width: '120px' }}
                >
                  {'Anular'}
                </Button>
              </>
            )}
          </Grid>
        </form>
      </CardLayout>
      <OrdenPedidoDialog
        openDialogAlert={openDialogAlert}
        setOpenDialogAlert={setOpenDialogAlert}
        openAnulation={openAnulation}
        setOpenAnulation={setOpenAnulation}
        formState={formState}
        onInputChange={onInputChange}
        openHistory={openHistory}
        setOpenHistory={setOpenHistory}
        setStateForRequest={setStateForRequest}
        onSubmit={onSubmit}
      />
    </>
  );
};
