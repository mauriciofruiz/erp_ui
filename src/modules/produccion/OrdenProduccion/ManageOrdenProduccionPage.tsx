import { defaultSucursalType } from '@/constants';
import { DocumentTypeEnum, EstadoOrdenProduccionEnum, PathEnum } from '@/enums';
import {
  useAccessDocument,
  useAllowGlobal,
  useAllowProduccion,
  useForm,
  useOrdenProduccionAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import {
  BodegaGetInterface,
  IndirectCost,
  LabourDaum,
  OrderPost,
  OrderProd,
  OrderProdByIdType,
  OrderProducctionPost,
  RawMaterial,
  SucursalType,
  UnidadesProducidasType,
  UnitsProducedPost,
} from '@/types';
import {
  Close,
  DeleteForever,
  EditNote,
  ExitToApp,
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
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { OrdenProduccionDialogo } from './components/OrdenProduccionDialogo';
import { OrdenProduccionForm } from './components/OrdenProduccionForm';
import { OrdenProduccionPedido } from './components/OrdenProduccionPedido';

export type ManageOrdenProduccionPageProps = {
  // types...
};

export const ManageOrdenProduccionPage: React.FC<
  ManageOrdenProduccionPageProps
> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateBetweenDocuments } = useAllowGlobal();
  const [title, setTitle] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  const [isEditable, setIsEditable] = useState(true);
  const [isClose, setIsClose] = useState(false);
  const [isApprovable] = useState(false);
  const { enableEditOProduccion, enableCerrarOProduccion } =
    useAllowProduccion();
  const { closeDocument, openDocument } = useAccessDocument();
  const [sucursal, setSucusral] = useState<SucursalType[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const [rowsOrdenPedido, setRowsOrdenPedido] = React.useState<GridRowsProp>(
    []
  );
  const [rowsUnidadesProd, setRowsUnidadesProd] = React.useState<GridRowsProp>(
    []
  );

  const [rowsObra, setRowsObra] = React.useState<GridRowsProp>([]);
  const [rowsCostos, setRowsCostos] = React.useState<GridRowsProp>([]);
  const [rowsMateriaPrima, setRowsMateriaPrima] = React.useState<GridRowsProp>(
    []
  );
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [wareHouseProduce, setWareHouseProduce] = useState<
    BodegaGetInterface[]
  >([]);
  const requestId =
    location && location.state ? location.state.requestId : undefined;
  const { sucursales } = useSelector((state: RootState) => state.common);
  const [executeQuantity, setExecuteQuantity] = useState(false);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const [dialogCloseAlert, setDialogCloseAlert] = useState(false);
  const [openAnulation, setOpenAnulation] = useState(false);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalMP, setTotalMP] = useState(0);
  const [totalMO, setTotalMO] = useState(0);
  const [totalCI, setTotalCI] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);
  const [requestOrderProd, setRequestOrderProd] = useState<OrderProd>();
  const [requestUnitsProd, setRequestUnitsProd] = useState<
    UnidadesProducidasType[]
  >([]);
  const [requestMaterials, setRequestMaterials] = useState<RawMaterial[]>([]);
  const [requestObra, setRequestObra] = useState<LabourDaum[]>([]);
  const [requestCostos, setRequestCostos] = useState<IndirectCost[]>([]);
  const [scheduleQuantity, setScheduleQuantity] = useState<number>();
  const [stateForRequest, setStateForRequest] = useState<number>(
    EstadoOrdenProduccionEnum.GENERADA
  );

  const sucursalUser = sucursales.filter(
    (s) => s.branchId === user?.branchId
  )[0] || {
    ...defaultSucursalType,
  };

  const { fetchOrdenProdById, fetchSave, fetchUpdate } =
    useOrdenProduccionAsync();
  const {
    onInputChange,
    onAutocompleteChange,
    setFormState,
    formState,
    onInputJustNumber,
  } = useForm({
    user: null,
    userId: null,
    elaborationDate: new Date(),
    endDate: null,
    branchRequest: sucursalUser.name,
    branchDestiny: sucursalUser.name,
    branchProduce: '',
    branchProduceId: null,
    storeProduce: null,
    requestNumber: '',
    observation: '',
    reasonCancel: '',
    totalQuantity: 0,
    producedQuantity: 0,
    requestId: null,
    orderId: null,
    scheduleQuantity: null,
    startDateOP: null,
    endDateOP: null,
    rawMaterialEntryId: null,
    workforceEntryId: null,
    cifEntryId: null,
    closingMPEntryId: null,
    hasTransfer: false,
    orderStatusId: EstadoOrdenProduccionEnum.GENERADA,
    closingMOEntryId: null,
    closingCIFEntryId: null,
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
                documentType: DocumentTypeEnum.ORDEN_PRODUCCION,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.ORDEN_PRODUCCION + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.ORDEN_PRODUCCION,
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
                documentType: DocumentTypeEnum.ORDEN_PRODUCCION,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.ORDEN_PRODUCCION + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.ORDEN_PRODUCCION,
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
        documentType: DocumentTypeEnum.ORDEN_PRODUCCION,
      });
    }
    navigate(PathEnum.ORDEN_PRODUCCION);
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle('Orden Producción (Modo Edición) - N° ' + requestId);
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
      rowsOrdenPedido.forEach((row) => {
        setRowModesModel({
          ...rowModesModel,
          [row.id]: { mode: GridRowModes.View },
        });
      });
      setTitle('Orden Producción (Modo Lectura) - N° ' + requestId);
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
        ? 'Nueva Orden de Producción'
        : 'Orden de Producción (Modo Lectura) - N° ' + requestId
    );
  }, [createMode, requestId]);

  useEffect(() => {
    if (rowsMateriaPrima && rowsMateriaPrima.length > 0) {
      const totalMateriaPrima: number = rowsMateriaPrima.reduce(
        (accumulator, currentRow) => {
          return accumulator + currentRow.totalCost;
        },
        0
      );
      setTotalMP(totalMateriaPrima);
    }
  }, [rowsMateriaPrima]);

  useEffect(() => {
    if (rowsObra && rowsObra.length > 0) {
      const total = rowsObra.reduce((accumulator, currentRow) => {
        return accumulator + currentRow.totalCost;
      }, 0);
      const cost = parseFloat(total.toFixed(2));
      setTotalMO(cost);
    }
  }, [rowsObra]);

  useEffect(() => {
    if (rowsCostos && rowsCostos.length > 0) {
      const total = rowsCostos.reduce((accumulator, currentRow) => {
        return accumulator + currentRow.totalCost;
      }, 0);
      const cost = parseFloat(total.toFixed(2));
      setTotalCI(cost);
    }
  }, [rowsCostos]);

  useEffect(() => {
    const totalFinal = totalMP + totalMO + totalCI;
    const cost = parseFloat(totalFinal.toFixed(2));
    setTotalFinal(cost);
  }, [totalMP, totalMO, totalCI]);

  useEffect(() => {
    if (requestId) {
      setCreateMode(false);
      fetchOrdenProdById(Number(requestId)).then((response) => {
        if (response) {
          const totalUnidadesTemp = response.unitsProduced.reduce(
            (accumulator, currentRow) => {
              return accumulator + currentRow.quantityProduced;
            },
            0
          );
          setTotalUnidades(totalUnidadesTemp);
          const orderProd = response as OrderProdByIdType;
          setRequestOrderProd(orderProd.order);
          setRequestUnitsProd(orderProd.unitsProduced);
          setRequestMaterials(orderProd.rawMaterials);
          setRequestObra(orderProd.labourData);
          setRequestCostos(orderProd.indirectCosts);
        }
      });
    }
  }, [requestId]);

  useEffect(() => {
    if (createMode) return;
    if (requestOrderProd) {
      const enableEditing = enableEditOProduccion(
        requestOrderProd ? requestOrderProd?.orderStatusId : 0,
        requestOrderProd?.registrationDate
      );
      setIsEditable(enableEditing);
      const enableClose = enableCerrarOProduccion(
        requestOrderProd ? requestOrderProd?.orderStatusId : 0,
        requestOrderProd?.registrationDate,
        requestOrderProd?.branchProducesId
      );
      setIsClose(enableClose);
      const startDate = requestOrderProd?.registrationDate
        ? requestOrderProd?.registrationDate
        : '';
      const endDate = requestOrderProd?.endDate
        ? requestOrderProd?.endDate
        : '';
      setFormState({
        requestId: requestOrderProd ? requestOrderProd.requestId : null,
        elaborationDate:
          requestOrderProd && requestOrderProd.registrationDate !== null
            ? parseISO(startDate.toString())
            : new Date(),
        endDate:
          requestOrderProd && requestOrderProd.endDate !== null
            ? parseISO(endDate.toString())
            : new Date(),
        branchRequest: requestOrderProd
          ? requestOrderProd.branchRequestName
          : '',
        branchDestiny: requestOrderProd
          ? requestOrderProd.branchRequestName
          : '',
        branchProduce: requestOrderProd
          ? requestOrderProd.branchProducesName
          : '',
        requestNumber: requestOrderProd ? requestOrderProd.requestNumber : '',
        observation: requestOrderProd ? requestOrderProd.observation : '',
        orderId: requestOrderProd ? requestOrderProd.orderId : null,
        rawMaterialEntryId: requestOrderProd.rawMaterialEntryId,
        workforceEntryId: requestOrderProd.workforceEntryId,
        cifEntryId: requestOrderProd.cifEntryId,
        closingMPEntryId: requestOrderProd.closingMPEntryId,
        hasTransfer: requestOrderProd.hasTransfer,
        orderStatusId: requestOrderProd.orderStatusId,
        closingMOEntryId: requestOrderProd.closingMOEntryId,
        closingCIFEntryId: requestOrderProd.closingCIFEntryId,
      });
    }
  }, [requestOrderProd, createMode]);

  useEffect(() => {
    setRowsUnidadesProd(
      requestUnitsProd && requestUnitsProd.length > 0
        ? requestUnitsProd.map((item) => ({
            id: randomId(),
            ...(item as UnidadesProducidasType),
          }))
        : []
    );
  }, [requestUnitsProd]);

  useEffect(() => {
    setRowsMateriaPrima(
      requestMaterials && requestMaterials.length > 0
        ? requestMaterials.map((item) => ({
            id: randomId(),
            ...(item as RawMaterial),
          }))
        : []
    );
  }, [requestMaterials]);

  useEffect(() => {
    setRowsObra(
      requestObra && requestObra.length > 0
        ? requestObra.map((item) => ({
            id: randomId(),
            ...(item as LabourDaum),
          }))
        : []
    );
  }, [requestObra]);

  useEffect(() => {
    setRowsCostos(
      requestCostos && requestCostos.length > 0
        ? requestCostos.map((item) => ({
            id: randomId(),
            ...(item as IndirectCost),
          }))
        : []
    );
  }, [requestCostos]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let valido = true;
    const orderProd: OrderPost = {
      orderId: formState.orderId,
      orderStatusId: stateForRequest,
      requestId: formState.requestId,
      scheduledQuantity: scheduleQuantity ? scheduleQuantity : 0,
      producedQuantity: totalUnidades,
      totalCost: totalFinal,
      startDate: formState.elaborationDate,
      endDate: formState.endDate,
      orderNumber: formState.requestNumber,
      observation: formState.observation,
      rawMaterialEntryId: formState.rawMaterialEntryId,
      workforceEntryId: formState.workforceEntryId,
      cifEntryId: formState.cifEntryId,
      closingMPEntryId: formState.closingMPEntryId,
      hasTransfer: formState.hasTransfer,
      closingMOEntryId: formState.closingMOEntryId,
      closingCIFEntryId: formState.closingCIFEntryId,
    };

    const unidadesProd: UnitsProducedPost[] = rowsUnidadesProd.map((item) => ({
      ...(item as UnitsProducedPost),
      quantityProduced: item.quantityProduced + item.quantity,
    }));

    const materiaPrima: RawMaterial[] = rowsMateriaPrima.map(
      (item) => item as RawMaterial
    );

    const orderProduccion: OrderProducctionPost = {
      order: orderProd,
      unitsProduced: unidadesProd,
      rawMaterials: materiaPrima,
    };

    if (valido) {
      const response = requestId
        ? await fetchUpdate(orderProduccion, requestId)
        : await fetchSave(orderProduccion);

      if (
        !response ||
        (response && (response as ServerResponseType).status === 400) ||
        (response && (response as ServerResponseType).status === 500)
      ) {
        return;
      }
      handleCancel();
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
          <OrdenProduccionForm
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            sucursal={sucursal}
            setSucusral={setSucusral}
            isApprovable={isApprovable}
            wareHouseProduce={wareHouseProduce}
            setWareHouseProduce={setWareHouseProduce}
            onInputJustNumber={onInputJustNumber}
            requestId={requestId}
          />
          <Divider sx={{ mt: 4, height: 4 }} />
          <OrdenProduccionPedido
            formState={formState}
            setFormState={setFormState}
            rowsOrdenPedido={rowsOrdenPedido}
            setRowsOrdenPedido={setRowsOrdenPedido}
            rowsUnidadesProd={rowsUnidadesProd}
            setRowsUnidadesProd={setRowsUnidadesProd}
            rowsObra={rowsObra}
            setRowsObra={setRowsObra}
            rowsCostos={rowsCostos}
            setRowsCostos={setRowsCostos}
            rowsMateriaPrima={rowsMateriaPrima}
            setRowsMateriaPrima={setRowsMateriaPrima}
            setExecuteQuantity={setExecuteQuantity}
            totalUnidades={totalUnidades}
            totalMP={totalMP}
            totalMO={totalMO}
            totalCI={totalCI}
            totalFinal={totalFinal}
            setScheduleQuantity={setScheduleQuantity}
            createMode={createMode}
            editMode={editMode}
            rowModesModel={rowModesModel}
            setRowModesModel={setRowModesModel}
            requestOrderProd={requestOrderProd}
            executedQuantity={executeQuantity}
            setTotalUnidades={setTotalUnidades}
          />
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

                {isClose && (
                  <Button
                    type="button"
                    startIcon={<Close />}
                    onClick={() => setDialogCloseAlert(true)}
                    sx={{ margin: 2 }}
                    style={{ width: '120px' }}
                  >
                    {'Cerrar'}
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

            {isEditable && !isClose && (
              <Button
                type="button"
                startIcon={<Send />}
                onClick={() => setOpenDialogAlert(true)}
                sx={{ margin: 2 }}
                style={{ width: '120px' }}
              >
                {'Confirmar'}
              </Button>
            )}
            {!createMode &&
              formState.orderStatusId !== EstadoOrdenProduccionEnum.CERRADO && (
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
          </Grid>
          <OrdenProduccionDialogo
            openDialogAlert={openDialogAlert}
            setOpenDialogAlert={setOpenDialogAlert}
            formState={formState}
            onInputChange={onInputChange}
            setStateForRequest={setStateForRequest}
            openAnulation={openAnulation}
            setOpenAnulation={setOpenAnulation}
            dialogCloseAlert={dialogCloseAlert}
            setDialogCloseAlert={setDialogCloseAlert}
            setFormState={setFormState}
          />
        </form>
      </CardLayout>
    </>
  );
};
