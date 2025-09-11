'use client';
import {
  DocumentTypeEnum,
  EstadoCierreCajaEnum,
  EstadoEgresoEnum,
  FormaPagoEnum,
  ParametersEnum,
  PathEnum,
  TipoEgresoEnum,
  TitlesEnum,
} from '@/enums';
import {
  FormState,
  useAccessDocument,
  useAllowVentas,
  useCierreCajaAsync,
  useCommonManage,
  useForm,
} from '@/hooks';
import { CardLayout, CustomDialog, LabeledInputNumber } from '@/modules/layout';
import { RootState } from '@/store';
import {
  CierreDetailInterface,
  CierreGetType,
  CierrePostType,
  DenominacionEfectivoInterface,
  DetalleCobroCierreCajaInterface,
  EgresoInterface,
  SucursalType,
} from '@/types';
import { Box, Divider, Grid, Typography } from '@mui/material';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CierreCajaForm } from './components/CierreCajaForm';
import { randomId } from '@mui/x-data-grid-generator';
import { CierreCajaDetalle } from './components/CierreCajaDetalle';
import { setDecimalPlaces } from '@/functions';
import { SubmitButtons } from './components/SubmitButtons';
import { isEqual } from 'lodash';

export type CierreCajaManageProps = {
  // types...
};

const initialFormState: FormState = {
  closingCashId: null,
  cashId: null,
  initialAmount: 0,
  finalAmount: 0,
  finalAmountSystem: 0,
  openingDate: new Date().toISOString(),
  closingDate: new Date().toISOString(),
  isManual: true,
  closingStatusId: EstadoCierreCajaEnum.GENERADO,
  transactionsValue: 0,
  cashValue: 0,
  availableValue: 0,
  details: [],
  egresos: [],
};

export const CierreCajaManage: React.FC<CierreCajaManageProps> = ({}) => {
  const {
    location,
    navigate,
    styles,
    enqueueSnackbar,
    prevFormState,
    prevRows,
    title,
    setTitle,
    editMode,
    setEditMode,
    createMode,
    setCreateMode,
    isEditable,
    setIsEditable,
    isAnulation,
    setIsAnulation,
    stopEnterEvent,
  } = useCommonManage();
  const closingCashId =
    location && location.state ? location.state.closingCashId : undefined;
  const { fetchDetalleCobroCierreCaja, fetchAllDenominaciones } =
    useCierreCajaAsync();

  const { enableEditingCloseCash } = useAllowVentas();

  const { user } = useSelector((state: RootState) => state.auth);

  const { sucursales } = useSelector((state: RootState) => state.common);

  const [detallesCobro, setDetallesCobro] = useState<CierreDetailInterface[]>(
    []
  );

  const [rowsForTable, setRowsForTable] = useState<CierreDetailInterface[]>([]);

  const { onInputChange, setFormState, formState, onGenericChange } =
    useForm(initialFormState);

  const [rows, setRows] = useState<GridRowsProp>([]);

  const [rowsEgresos, setRowsEgresos] = useState<GridRowsProp>([]);

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [rowModesModelEgresos, setRowModesModelEgresos] =
    useState<GridRowModesModel>({});

  const [denominacionEfectivoList, setDenominacionEfectivoList] = useState<
    DenominacionEfectivoInterface[]
  >([]);

  const { closeDocument } = useAccessDocument();

  const { fetchSaveCierre, fetchUpdateCierre, fetchCierreById } =
    useCierreCajaAsync();

  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  const [dialogMessage, setDialogMessage] = useState('');

  const sucursalMemo: SucursalType | undefined = useMemo(() => {
    if (!sucursales || !user) return undefined;
    return sucursales.find((sucursal) => sucursal.branchId === user.branchId);
  }, [sucursales, user]);

  const usuarioMemo = useMemo(() => {
    if (!user) return undefined;
    return user;
  }, [user]);

  useEffect(() => {
    const fetchDenominacionEfectivo = async () => {
      const response = await fetchAllDenominaciones();
      if (response) setDenominacionEfectivoList(response);
    };
    fetchDenominacionEfectivo();

    if (!user || !user.cashId) return;
    const fetchData = async () => {
      const response = await fetchDetalleCobroCierreCaja(user.cashId);
      if (response) {
        const hasDetails = Array.isArray(response) && response.length > 0;
        const otrasFormas: DetalleCobroCierreCajaInterface[] = hasDetails
          ? response
          : [];
        const minDateFromDetails = otrasFormas.reduce(
          (acc, row) => (row.issueDate < acc ? row.issueDate : acc),
          new Date().toISOString()
        );

        setFormState((prevState: FormState) => ({
          ...prevState,
          cashId: user.cashId,
          openingDate: minDateFromDetails,
        }));

        setDetallesCobro(
          otrasFormas.map((detalle) => ({
            ...detalle,
            closingCashDetailId: null,
            closingCashId: null,
            cashDenominationId: null,
            quantity: 1,
            amount: detalle.totalCharged,
            status: true,
            isPhysicallyChecked: [
              FormaPagoEnum.NOTA_CREDITO,
              FormaPagoEnum.CREDITO,
            ].includes(detalle.paymentMethodId as FormaPagoEnum),
          }))
        );
      }
    };
    fetchData();
  }, [user]);

  // ? useEffect para cargar los datos de la factura
  useEffect(() => {
    if (!closingCashId) {
      setCreateMode(true);
      setTitle(TitlesEnum.NUEVO_CIERRE_CAJA);
      setIsEditable(true);
      setFormState({
        ...initialFormState,
      });
    } else {
      setCreateMode(false);
      setEditMode(false);
      const setFormAndRows = async () => {
        const response = await fetchCierreById(closingCashId);
        if (response) {
          const dto = response as CierreGetType;

          setDetallesCobro(
            dto.details?.map((row) => ({
              ...row,
            })) ?? []
          );
          setTitle(TitlesEnum.CIERRE_CAJA_LECTURA + dto.closingCashId);
          setFormState({ ...dto });
          prevFormState.current = dto;
          const enableEditing = enableEditingCloseCash(
            dto.closingStatusId,
            dto.closingDate ?? new Date(),
            dto.creationUserId
          );
          setIsEditable(enableEditing);
          // const enableAnulacion = enableAnulationFactura(
          //   headerFormState.invoiceStatusId,
          //   false,
          //   headerFormState.issueDate ?? new Date()
          // );
          // setEnabledAnulation(enableAnulacion);
          const temporalRows = dto.egresos?.map((row) => ({
            ...row,
            id: randomId(),
          })) as GridRowsProp;

          setRowsEgresos(temporalRows);
          prevRows.current = temporalRows;
        }
      };
      setFormAndRows();
    }
  }, [closingCashId]);

  const thereIsChanges = useMemo(() => {
    return (
      !isEqual(prevFormState.current, formState) ||
      !isEqual(prevRows.current, rows)
    );
  }, [formState, rows]);

  const totalEgresos = useMemo(() => {
    let total = 0;
    rowsEgresos
      .filter((row) => row.outflowStatusId !== EstadoEgresoEnum.ANULADO)
      .forEach((row) => {
        total += row.amount;
      });

    return total;
  }, [
    JSON.stringify(rowsEgresos.map((row) => row.outflowStatusId)),
    JSON.stringify(rowsEgresos.map((row) => row.amount)),
  ]);

  useEffect(() => {
    const denominacionHasData =
      denominacionEfectivoList &&
      Array.isArray(denominacionEfectivoList) &&
      denominacionEfectivoList.length > 0;

    const detallesCobroHasData =
      detallesCobro && Array.isArray(detallesCobro) && detallesCobro.length > 0;

    if (!denominacionHasData || !detallesCobroHasData) return;

    if (createMode) {
      const temporalRows = denominacionEfectivoList.map((detalle) => {
        return {
          ...detalle,
          id: randomId(),
          quantity: 0,
          total: 0,
          status: true,
        };
      }) as GridRowsProp;

      const hasDetails =
        Array.isArray(detallesCobro) && detallesCobro.length > 0;

      const effectivoDetalleValue = hasDetails
        ? detallesCobro
            .filter(
              (detalle) => detalle.paymentMethodId === FormaPagoEnum.EFECTIVO
            )
            .reduce((acc, row) => acc + row.amount, 0)
        : 0;

      const total =
        effectivoDetalleValue + formState.initialAmount - totalEgresos;

      const efectivoRowStatic = {
        id: ParametersEnum.ID_ROW_SUBTOTAL,
        denomination: 'TOTAL ESPERADO',
        quantity: 0,
        total,
      };

      const alreadyHasTotalRow = temporalRows.some(
        (row) => row.id === ParametersEnum.ID_ROW_TOTAL
      );

      const totalRow = temporalRows.find(
        (row) => row.id === ParametersEnum.ID_ROW_TOTAL
      ) as GridValidRowModel;

      const efectivoRow: GridValidRowModel = alreadyHasTotalRow
        ? totalRow
        : {
            id: ParametersEnum.ID_ROW_TOTAL,
            denomination: 'TOTAL CALCULADO',
            quantity: 0,
            total: 0,
          };

      const finalRows = [...temporalRows, efectivoRow, efectivoRowStatic];

      setRows(finalRows);

      const detallesWithoutEfectivo = hasDetails
        ? detallesCobro
            .filter(
              (detalle: CierreDetailInterface) =>
                detalle.paymentMethodId !== FormaPagoEnum.EFECTIVO
            )
            .reduce(
              (
                acc: {
                  [key: string]: { quantity: number; amount: number };
                },
                detalle: CierreDetailInterface
              ) => {
                const { paymentMethodId, amount } = detalle;
                if (!acc[paymentMethodId]) {
                  acc[paymentMethodId] = { quantity: 0, amount: 0 };
                }
                acc[paymentMethodId].quantity += 1;
                acc[paymentMethodId].amount += setDecimalPlaces(amount, 2);
                return acc;
              },
              {}
            )
        : {};

      const groupedDetalles: CierreDetailInterface[] = Object.entries(
        detallesWithoutEfectivo
      ).map(([paymentMethodId, { quantity, amount }]) => ({
        chargeDetailId: null,
        closingCashDetailId: null,
        closingCashId: null,
        paymentMethodId,
        cashDenominationId: null,
        quantity,
        amount,
        status: true,
        isPhysicallyChecked: false,
      }));

      setRowsForTable(groupedDetalles);

      setFormState((prevState: FormState) => ({
        ...prevState,
        cashValue: setDecimalPlaces(effectivoDetalleValue, 2),
      }));
    } else {
      const hasDetails =
        Array.isArray(detallesCobro) && detallesCobro.length > 0;

      const effectivoRows =
        (hasDetails &&
          detallesCobro.filter(
            (detalle) => detalle.paymentMethodId === FormaPagoEnum.EFECTIVO
          )) ||
        [];

      const anotherPaymentMethods =
        (hasDetails &&
          detallesCobro.filter(
            (detalle) => detalle.paymentMethodId !== FormaPagoEnum.EFECTIVO
          )) ||
        [];

      const temporalRows = denominacionEfectivoList.map((detalle) => {
        const matchingEffectivoRow = effectivoRows.find(
          (effectivo) =>
            effectivo.cashDenominationId === detalle.cashDenominationId
        );

        return {
          ...detalle,
          id: randomId(),
          quantity: matchingEffectivoRow ? matchingEffectivoRow.quantity : 0,
          total: matchingEffectivoRow ? matchingEffectivoRow.amount : 0,
          closingCashDetailId: matchingEffectivoRow?.closingCashDetailId,
          closingCashId: matchingEffectivoRow?.closingCashId,
          status: true,
        };
      });
      const totalDisponible =
        formState.cashValue - totalEgresos + formState.initialAmount;

      const efectivoRowStatic = {
        id: ParametersEnum.ID_ROW_SUBTOTAL,
        denomination: 'TOTAL ESPERADO',
        quantity: 0,
        total: totalDisponible,
      };

      const totalRowValue = temporalRows
        .filter(
          (row) =>
            row.id !== ParametersEnum.ID_ROW_TOTAL &&
            row.id !== ParametersEnum.ID_ROW_SUBTOTAL
        )
        .reduce((acc, row) => acc + row.total, 0);

      const efectivoRow: GridValidRowModel = {
        id: ParametersEnum.ID_ROW_TOTAL,
        denomination: 'TOTAL CALCULADO',
        quantity: 0,
        total: totalRowValue,
      };

      const finalRows = [...temporalRows, efectivoRow, efectivoRowStatic];

      setRows(finalRows);

      const detallesWithoutEfectivo = hasDetails
        ? anotherPaymentMethods
            .filter(
              (detalle: CierreDetailInterface) =>
                detalle.paymentMethodId !== FormaPagoEnum.EFECTIVO
            )
            .reduce(
              (
                acc: {
                  [key: string]: { quantity: number; amount: number };
                },
                detalle: CierreDetailInterface
              ) => {
                const { paymentMethodId, amount } = detalle;
                if (!acc[paymentMethodId]) {
                  acc[paymentMethodId] = { quantity: 0, amount: 0 };
                }
                acc[paymentMethodId].quantity += 1;
                acc[paymentMethodId].amount += setDecimalPlaces(amount, 2);
                return acc;
              },
              {}
            )
        : {};

      const groupedDetalles: CierreDetailInterface[] = Object.entries(
        detallesWithoutEfectivo
      ).map(([paymentMethodId, { quantity, amount }]) => ({
        chargeDetailId: null,
        closingCashDetailId: null,
        closingCashId: null,
        paymentMethodId,
        cashDenominationId: null,
        quantity,
        amount,
        status: true,
        isPhysicallyChecked: false,
      }));

      setRowsForTable(groupedDetalles);
    }
  }, [
    createMode,
    denominacionEfectivoList,
    JSON.stringify(detallesCobro.map((detalle) => detalle.amount)),
    totalEgresos,
    formState.cashValue,
    formState.initialAmount,
  ]);

  const handleCancel = async () => {
    if (closingCashId) {
      closeDocument({
        id: closingCashId,
        documentType: DocumentTypeEnum.CAJA,
      });
    }
    navigate(PathEnum.CIERRE_CAJA);
  };

  const handleStatusByEgresos = (
    egresos: EgresoInterface[],
    currentStatusId: number
  ) => {
    if (egresos.length > 0) {
      const thereIsEgresoPendiente = egresos.some(
        (egreso) => egreso.outflowStatusId === EstadoEgresoEnum.GENERADO
      );
      if (thereIsEgresoPendiente) return EstadoCierreCajaEnum.GENERADO;
      return currentStatusId;
    }
    return currentStatusId;
  };

  const validateForm = (): boolean => {
    if (formState.initialAmount <= 0) {
      enqueueSnackbar(
        'No puede realizar un cierre de caja con un saldo inicial menor o igual a 0',
        {
          variant: 'error',
        }
      );
      return false;
    }
    if (formState.finalAmount <= 0) {
      enqueueSnackbar(
        'No puede realizar un cierre de caja con un total menor o igual a 0',
        {
          variant: 'error',
        }
      );
      return false;
    }
    if (formState.finalAmountSystem <= 0) {
      enqueueSnackbar(
        'No puede realizar un cierre de caja con un total de sistema menor o igual a 0',
        {
          variant: 'error',
        }
      );
      return false;
    }
    if (user?.cashId === null) {
      enqueueSnackbar('No se ha asignado una caja a este usuario', {
        variant: 'error',
      });
      return false;
    }
    if (
      setDecimalPlaces(formState.finalAmountSystem, 2) !==
      setDecimalPlaces(formState.finalAmount, 2)
    ) {
      enqueueSnackbar(
        'El total de cierre de caja no coincide con el total de arqueo',
        {
          variant: 'error',
        }
      );
      return false;
    }
    const thereIsUnckeckedRow = detallesCobro
      .filter((detalle) => detalle.paymentMethodId !== FormaPagoEnum.EFECTIVO)
      .some((row) => !row.isPhysicallyChecked);
    if (thereIsUnckeckedRow) {
      enqueueSnackbar(
        'Debe revisar todos los detalles de cobro de todas las formas de pago',
        {
          variant: 'error',
        }
      );
      return false;
    }
    const thereAreRows = rows.length > 0;
    const thereAreRowsEgresos = rowsEgresos.length > 0;
    if (thereAreRows) {
      const thereIsARowEditing = rows.some((row) => {
        return rowModesModel[row.id]?.mode === GridRowModes.Edit;
      });
      if (thereIsARowEditing) {
        enqueueSnackbar('Debe guardar los cambios de efectivo', {
          variant: 'error',
        });
        return false;
      }
    }
    if (thereAreRowsEgresos) {
      const thereIsARowEditing = rowsEgresos.some((row) => {
        return rowModesModelEgresos[row.id]?.mode === GridRowModes.Edit;
      });

      if (thereIsARowEditing) {
        enqueueSnackbar('Debe guardar los cambios de egresos', {
          variant: 'error',
        });
        return false;
      }

      const thereIsEgresoWithAmountZero = rowsEgresos.some(
        (egreso) => egreso.amount <= 0
      );
      if (thereIsEgresoWithAmountZero) {
        enqueueSnackbar(
          'No puede realizar un egreso con monto menor o igual a 0',
          {
            variant: 'error',
          }
        );
        return false;
      }

      const thereIsAEstibajeEgreso = rowsEgresos.some(
        (row) =>
          row.outflowTypeId === TipoEgresoEnum.ANTICIPO_ESTIBAJE_CONTENEDOR
      );
      if (thereIsAEstibajeEgreso) {
        const thereIsRowWithoutPackageOrContainer = rowsEgresos
          .filter(
            (row) =>
              row.outflowTypeId === TipoEgresoEnum.ANTICIPO_ESTIBAJE_CONTENEDOR
          )
          .some(
            (row) => row.packingListId === null || row.containerId === null
          );

        if (thereIsRowWithoutPackageOrContainer) {
          enqueueSnackbar(
            'Debe asignar un contenedor y una importación a los egresos de estibaje',
            {
              variant: 'error',
            }
          );
          return false;
        }
      }
      const thereIsEgresoPendiente = rowsEgresos.some(
        (egreso) => egreso.outflowStatusId === EstadoEgresoEnum.GENERADO
      );
      if (thereIsEgresoPendiente) {
        enqueueSnackbar(
          'Existen egresos pendientes de confirmar, se enviarán para ser confirmados, su cierre de caja aún no ha sido confirmado',
          {
            variant: 'info',
          }
        );
      }
    }
    return true;
  };

  // ********************************** submit *********************************************
  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      setFormState({
        ...formState,
        closingStatusId: prevFormState.current
          ? prevFormState.current.closingStatusId
          : EstadoCierreCajaEnum.GENERADO,
      });
      return;
    }

    const detailsEfectivo: CierreDetailInterface[] = rows
      .filter(
        (row) =>
          row.closingCashDetailId ||
          (row.id !== ParametersEnum.ID_ROW_TOTAL &&
            row.id !== ParametersEnum.ID_ROW_SUBTOTAL &&
            row.status &&
            row.total > 0)
      )
      .map((row) => ({
        chargeDetailId: null,
        closingCashDetailId: row.closingCashDetailId ?? null,
        closingCashId: row.closingCashId ?? null,
        paymentMethodId: FormaPagoEnum.EFECTIVO,
        cashDenominationId: row.cashDenominationId,
        quantity: row.quantity,
        amount: row.total,
        status: row.status,
        isPhysicallyChecked: true,
      }));

    const detallesOtrasFormas: CierreDetailInterface[] = detallesCobro
      .filter((detalle) => detalle.paymentMethodId !== FormaPagoEnum.EFECTIVO)
      .map((row) => ({
        ...(row as CierreDetailInterface),
      }));

    const details: CierreDetailInterface[] = [
      ...detailsEfectivo,
      ...detallesOtrasFormas,
    ];

    const egresos: EgresoInterface[] = rowsEgresos.map((row) => ({
      cashOutflowId: row.cashOutflowId ?? null,
      closingCashId: row.closingCashId ?? null,
      outflowTypeId: row.outflowTypeId,
      entryId: row.entryId,
      outflowStatusId: row.outflowStatusId,
      accountId: row.accountId,
      issueDate: row.issueDate,
      description: row.description,
      amount: row.amount,
      confirmationUserId: row.confirmationUserId ?? null,
      cashId: row.cashId,
      packingListId: row.packingListId,
      containerNumber: row.containerNumber,
    }));

    const body: CierrePostType = {
      closingCashId: formState.closingCashId ?? null,
      cashId: formState.cashId ?? null,
      initialAmount: formState.initialAmount,
      finalAmount: formState.finalAmount,
      openingDate:
        new Date(formState.openingDate).toISOString() ??
        new Date().toISOString(),
      closingDate: new Date(formState.closingDate).toISOString(),
      isManual: formState.isManual,
      closingStatusId: handleStatusByEgresos(
        egresos,
        formState.closingStatusId
      ),
      details,
      egresos,
    };

    if (createMode) {
      await fetchSaveCierre(body);
    } else {
      await fetchUpdateCierre(body, formState.closingCashId);
    }
    handleCancel();
  };

  // ********************* RETURN *********************

  return (
    <>
      <CustomDialog
        fieldName="any"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={null}
        onInputChange={onInputChange}
        stateIdFieldName="closingStatusId"
        setFormState={setFormState}
        prevStateId={
          prevFormState.current?.closingStatusId ??
          EstadoCierreCajaEnum.GENERADO
        }
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
      >
        <form onSubmit={onSubmit} onKeyDown={stopEnterEvent}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <CierreCajaForm
              formState={formState}
              styles={styles}
              user={usuarioMemo}
              sucursal={sucursalMemo}
              createMode={createMode}
              onGenericChange={onGenericChange}
            />
          </Grid>
          <Divider sx={{ mt: 5, mb: 3, height: 5, position: 'relative' }}>
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#4f5052',
                padding: '0 8px',
              }}
            >
              Control de Cierre de Caja
            </Typography>
          </Divider>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <CierreCajaDetalle
              createMode={createMode}
              editMode={editMode}
              rows={rows}
              setRows={setRows}
              rowModesModel={rowModesModel}
              setRowModesModel={setRowModesModel}
              styles={styles}
              detallesCobro={detallesCobro}
              rowsForTable={rowsForTable}
              setFormState={setFormState}
              formState={formState}
              rowsEgresos={rowsEgresos}
              setRowsEgresos={setRowsEgresos}
              rowModesModelEgresos={rowModesModelEgresos}
              setRowModesModelEgresos={setRowModesModelEgresos}
              totalEgresos={totalEgresos}
              setDetallesCobro={setDetallesCobro}
              sucursal={sucursalMemo}
            />
          </Grid>
          <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <LabeledInputNumber
                      label="Total Cierre Sistema"
                      inputNumberProps={{
                        value: formState.finalAmountSystem,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        prefix: '$',
                        readOnly: true,
                        style: { paddingRight: '10px', paddingLeft: '10px' },
                        status:
                          setDecimalPlaces(formState.finalAmountSystem, 2) ===
                          setDecimalPlaces(formState.finalAmount, 2)
                            ? ''
                            : 'error',
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <LabeledInputNumber
                      label="Total Cierre Arqueo"
                      inputNumberProps={{
                        value: formState.finalAmount,
                        min: 0,
                        defaultValue: 0,
                        controls: false,
                        precision: 2,
                        prefix: '$',
                        readOnly: true,
                        style: { paddingRight: '10px', paddingLeft: '10px' },
                        status:
                          setDecimalPlaces(formState.finalAmountSystem, 2) ===
                          setDecimalPlaces(formState.finalAmount, 2)
                            ? ''
                            : 'error',
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Grid container spacing={2} alignItems="center">
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
            />
          </Grid>
        </form>
      </CardLayout>
    </>
  );
};
