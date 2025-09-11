import {
  ComprobanteTypeEnum,
  CondicionPagoEnum,
  DocumentTypeEnum,
  EstadoDocumentoEnum,
  FormaPagoEnum,
  ParametersEnum,
  PathEnum,
  TitlesEnum,
} from '@/enums';
import {
  FormState,
  useAllowVentas,
  useCommonManage,
  useFacturaVentaAsync,
  useForm,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import {
  AdvanceClientType,
  ClientPersonCreditPostType,
  CobroFacturaInterface,
  CrossedAdvanceClientType,
  DetalleCobroFacturaInterface,
  DetalleFacturaVentaInterface,
  FacturaVentaDto,
  FacturaVentaHeader,
  ImpuestoDocumentoInterface,
  RetencionGeneralInterface,
  RetencionGroupType,
  RetencionType,
} from '@/types';
import {
  GridCellModes,
  GridCellModesModel,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FacturaVentaForm, FacturaVentaRows } from './components';
import { getAllRetencionesFuente, getAllRetencionesIVA } from '@/backend';
import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { randomId } from '@mui/x-data-grid-generator';
import { SubmitButtons } from './components/SubmitButtons';
import { CobroRows } from './components/cobro/CobroRows';
import { parseISO } from 'date-fns';
import { validateForm } from './CustomFunctions';

export type ManageFacturaVentasProps = {
  // types...
};

const initialStateDetalle: DetalleFacturaVentaInterface = {
  id: ParametersEnum.ID_ROW_NO_ID.toString(),
  availableQuantity: 0,
  branchId: null,
  categoryDiscountPercentage: 0,
  categoryDiscountValue: 0,
  clientId: null,
  clientPrice: 0,
  description: '',
  discountPercentage: 0,
  discountValue: 0,
  extraDiscountPercentage: 0,
  extraDiscountValue: 0,
  groupId: null,
  hasIva: false,
  invoiceDetailId: null,
  invoiceId: null,
  paymentMethodDiscountPercentage: 0,
  paymentMethodDiscountValue: 0,
  productCode: '',
  productId: null,
  productName: '',
  promotionDiscountPercentage: 0,
  promotionDiscountValue: 0,
  quantity: 0,
  retentionIVAId: null,
  retentionSourceId: null,
  returnedValue: 0,
  specialDiscountPercentage: 0,
  specialDiscountValue: 0,
  taxRateId: Number(ParametersEnum.TAX_RATE_ID_ZERO),
  taxValue: 0,
  totalPrice: 0,
  unitMeasureId: null,
  unitPrice: 0,
  returnedQuantity: 0,
  taxableBase: 0,
};

const initialFormState: FormState = {
  invoiceId: null,
  invoiceNumber: '',
  entryId: null,
  paymentMethodId: FormaPagoEnum.EFECTIVO,
  cashId: null,
  clientId: null,
  clientName: '',
  clientIdentification: '',
  clientCellphone: '',
  clientEmail: '',
  clientAddress: '',
  clientCategoryId: null,
  paymentConditionId: CondicionPagoEnum.CONTADO,
  invoiceStatusId: EstadoDocumentoEnum.GENERADO,
  branchId: null,
  voucherTypeCode: ComprobanteTypeEnum.FACTURA,
  taxSupportId: '01',
  accessKey: '',
  authorizationNumber: '',
  issueDate: new Date(),
  dueDate: new Date(),
  description: '',
  subtotal: 0,
  subtotalAfterDiscount: 0,
  iva: 0,
  subtotalNoObjetoIva: 0,
  ivaZero: 0,
  categoryDiscount: 0,
  specialDiscount: 0,
  promotionDiscount: 0,
  paymentMethodDiscount: 0,
  paymentMethodDiscountPercentage: 0,
  totalDiscount: 0,
  total: 0,
  retentionValue: 0,
  totalToCharge: 0,
  relatedDocumentId: null,
  relatedDocumentId2: null,
  dueDays: 0,
  balance: 0,
  retentionId: null,
  cancellationDate: null,
  cancellationReason: '',
  discountPercentage: 0,
  chargedValue: 0,
  creationUserId: null,
  modificationUserId: null,
  registrationDate: new Date(),
  modificationDate: new Date(),
  hasCredit: false,
  creditValue: 0,
};

export const ManageFacturaVentas: React.FC<ManageFacturaVentasProps> = ({}) => {
  const {
    location,
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
    enabledAnulation,
    setEnabledAnulation,
    setOpenDialogAlert,
    openDialogAlert,
    dialogMessage,
    setDialogMessage,
    handleCommonCancel,
  } = useCommonManage();

  const facturaIdOpened = location?.state?.facturaIdOpened;

  const facturaId = useMemo(() => {
    if (!facturaIdOpened) return null;

    const [id, type] = facturaIdOpened.split('-');
    const isValidType = type === ComprobanteTypeEnum.FACTURA;

    return isValidType ? id : null;
  }, [facturaIdOpened]);

  const [diferencia, setDiferencia] = useState(0); // diferencia entre total y total a cobrar, si no se ha asignado a un anticipo o transporte

  const {
    onInputChange,
    onAutocompleteChange,
    setFormState,
    formState,
    onInputNumberChange,
  } = useForm(initialFormState);

  const [rows, setRows] = useState<GridRowsProp>([]);

  // const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

  const [rowsDetalleCobro, setRowsDetalleCobro] = useState<GridRowsProp>([]);

  const [rowModesModelCobro, setRowModesModelCobro] =
    useState<GridRowModesModel>({});

  const { user } = useSelector((state: RootState) => state.auth);

  const addButtonRef = useRef<HTMLButtonElement>(null);

  const {
    fetchCalculateFacturaVenta,
    fetchSaveFacturaVenta,
    fetchUpdateFacturaVenta,
    fetchFacturaVentaById,
  } = useFacturaVentaAsync();

  const [thereIsDiscount, setThereIsDiscount] = useState(false);

  // ********************** COBROS **********************
  const [cobrosInitialized, setCobrosInitialized] = useState<
    CobroFacturaInterface[]
  >(formState.payments || []);

  const [selectedCliente, setSelectedCliente] =
    useState<ClientPersonCreditPostType | null>(null);

  const [addRowState, setAddRowState] = useState(false);

  const { enableEditingFactura, enableAnulationFactura } = useAllowVentas();

  const [availableAdvances, setAvailableAdvances] = useState<
    AdvanceClientType[]
  >([]);

  const [selectedAdvances, setSelectedAdvances] = useState<
    CrossedAdvanceClientType[]
  >([]);

  const handleCancel = async () => {
    return handleCommonCancel(
      PathEnum.FACTURA_VENTA,
      facturaId,
      DocumentTypeEnum.FACTURA_VENTA
    );
  };

  // ? useEffect para cargar los datos de la factura
  useEffect(() => {
    if (!facturaId) {
      setCreateMode(true);
      setTitle(TitlesEnum.NUEVA_FACTURA_VENTA);
      setIsEditable(true);
      setFormState({
        ...initialFormState,
        branchId: user?.branchId,
        creationUserId: user?.userId,
        modificationUserId: user?.userId,
      });
    } else {
      setCreateMode(false);
      setEditMode(false);
      const setFormAndRows = async () => {
        const response = await fetchFacturaVentaById(facturaId);
        if (response) {
          const dto = response as FacturaVentaDto;
          const headerFormState = dto.header;
          const retenciones = dto.retenciones ?? [];
          const taxes = dto?.taxes;
          setCobrosInitialized(dto.payments ?? []);

          setThereIsDiscount(
            headerFormState.paymentMethodDiscountPercentage > 0
          );

          setTitle(
            TitlesEnum.FACTURA_PDV_LECTURA + headerFormState.invoiceNumber
          );
          const newFormState = {
            ...headerFormState,
            dueDate:
              typeof headerFormState.dueDate === 'string'
                ? parseISO(headerFormState.dueDate)
                : headerFormState.dueDate ?? new Date(),
            issueDate:
              typeof headerFormState.issueDate === 'string'
                ? parseISO(headerFormState.issueDate)
                : headerFormState.issueDate ?? new Date(),
            registrationDate:
              typeof headerFormState.registrationDate === 'string'
                ? parseISO(headerFormState.registrationDate)
                : headerFormState.registrationDate ?? new Date(),
            retenciones,
            taxes,
          };
          setFormState(newFormState);
          prevFormState.current = newFormState;

          const enableEditing = enableEditingFactura(
            headerFormState.issueDate ?? new Date(),
            headerFormState.invoiceStatusId
          );

          setIsEditable(enableEditing);

          const enableAnulacion = enableAnulationFactura(
            headerFormState.invoiceStatusId,
            false,
            headerFormState.issueDate ?? new Date()
          );

          setEnabledAnulation(enableAnulacion);

          const temporalRows = await Promise.all(
            dto.details?.map(async (row) => {
              const retentions = getRetencionesNamesByDetalles(
                row.retentionSourceId === null
                  ? undefined
                  : row.retentionSourceId,
                row.retentionIVAId === null ? undefined : row.retentionIVAId
              );
              return {
                ...row,
                id: randomId(),
                retentions,
              };
            }) ?? []
          );
          setRows(temporalRows);
          prevRows.current = temporalRows;
        }
      };
      setFormAndRows();
    }
  }, [facturaId]);

  const thereIsChanges = useMemo(() => {
    return (
      !isEqual(prevFormState.current, formState) ||
      !isEqual(prevRows.current, rows)
    );
  }, [formState, rows]);

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

  // ********************* USE EFFECT INICIAL*********************
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

    fetchRetencionesFuente();
    fetchRetencionesIVA();
  }, []);

  const addNewRow = () => {
    const id = randomId();
    // const retentions: RetencionGroupType[] = formState.retenciones ?? [];
    // const retentionIVAId = retentions.find(
    //   (retencion) =>
    //     retencion.retentionType === ParametersEnum.RETENCION_IVA_PARAMETER
    // )?.retentionId;
    // const retentionSourceId = retentions.find(
    //   (retencion) =>
    //     retencion.retentionType === ParametersEnum.RETENCION_FUENTE_PARAMETER
    // )?.retentionId;
    setRows((oldRows) => [
      ...oldRows,
      {
        ...initialStateDetalle,
        id,
        branchId: formState.branchId,
      },
    ]);
    // setRowModesModel((oldModel) => ({
    //   ...oldModel,
    //   [id]: { mode: GridRowModes.Edit, fieldToFocus: 'productName' },
    // }));

    setCellModesModel((oldModel) => ({
      ...oldModel,
      [id]: {
        ...cellModesModel[id],
        ['productName']: { mode: GridCellModes.Edit },
      },
    }));
  };

  const commonKeyEvents = (event: React.KeyboardEvent<HTMLFormElement>) => {
    // Verificar primero si todas las teclas están presionadas: ctrl + shift + enter
    if (event.ctrlKey && event.shiftKey) {
      const temporalCellModesModel = rows.reduce(
        (acc, row) => {
          if (row.productId !== null) {
            acc[row.id] = {
              ...cellModesModel[row.id],
              productName: { mode: GridCellModes.View },
              quantity: { mode: GridCellModes.View },
            };
          }
          return acc;
        },
        { ...cellModesModel }
      );
      setCellModesModel(temporalCellModesModel);
      return; // Retornar para evitar que se ejecute la lógica de ctrl + enter
    }

    // Luego manejar ctrl + enter sin shift
    if (event.ctrlKey) {
      if (
        (createMode && formState.clientId && formState.clientId !== null) ||
        (editMode &&
          formState.invoiceStatusId !== EstadoDocumentoEnum.CONFIRMADO)
      ) {
        setAddRowState(true);
      } else {
        enqueueSnackbar('No puede agregar un nuevo producto', {
          variant: 'error',
        });
        if (addButtonRef.current) {
          addButtonRef.current.focus();
        }
        return;
      }
    }
  };

  const onFormKeyEvents = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commonKeyEvents(event);
    }
  };

  useEffect(() => {
    if (addRowState) {
      const thereIsAPreviousRowWithoutProduct = rows.some(
        (row) => row.productId === null
      );
      const thereIsACellEditing = rows.some((row) => {
        const cellModes = cellModesModel[row.id] || {};
        return (
          cellModes.productName?.mode === GridCellModes.Edit ||
          cellModes.quantity?.mode === GridCellModes.Edit
        );
      });
      if (thereIsAPreviousRowWithoutProduct || thereIsACellEditing) {
        enqueueSnackbar(
          'Complete la fila existente antes de agregar una nueva',
          {
            variant: 'warning',
          }
        );
        return;
      }
      addNewRow();
      if (addButtonRef.current) {
        addButtonRef.current.focus();
      }
      setAddRowState(false);
    }
  }, [addRowState]);

  // ********************* FUNCION CENTRAL QUE CALCULA TODO *********************

  const fetchRecalculate = useCallback(async () => {
    const allHasProduct = rows.every((row) => row.productId !== null);
    if (rows.length > 0 && allHasProduct && (createMode || editMode)) {
      const header: FacturaVentaHeader = {
        ...(formState as FacturaVentaHeader),
      };
      const details: DetalleFacturaVentaInterface[] = rows.map((row) => ({
        ...(row as DetalleFacturaVentaInterface),
      }));

      const crosses: CrossedAdvanceClientType[] = selectedAdvances.filter(
        (advance) => advance.advanceAmount > 0
      );

      const paymentDetails: DetalleCobroFacturaInterface[] = rowsDetalleCobro
        .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
        .map((row) => {
          if (row.paymentMethodId === FormaPagoEnum.NOTA_CREDITO) {
            return {
              ...(row as DetalleCobroFacturaInterface),
              crosses,
            };
          }
          return {
            ...(row as DetalleCobroFacturaInterface),
          };
        });

      const payments: CobroFacturaInterface[] = [
        {
          ...cobrosInitialized[0],
          paymentDetails,
        },
      ];

      const response = await fetchCalculateFacturaVenta({
        header,
        details,
        retenciones: [],
        taxes: [],
        payments,
      });

      //todo: delete 10875 11254 10878 10884

      const newHeader = response?.header;

      // const retenciones: RetencionGroupType[] =
      //   response?.retenciones.map((retencion) => ({
      //     ...(retencion as RetencionGroupType),
      //   })) ?? [];

      const taxes = response?.taxes;

      const newDetalleCobro = response?.payments[0]?.paymentDetails ?? [];

      setRowsDetalleCobro(
        newDetalleCobro.map((row) => ({
          id: randomId(),
          ...row,
        }))
      );

      const newFormState = {
        ...formState,
        ...newHeader,
        // retenciones,
        taxes,
      };

      setFormState(newFormState);

      const newDetails = response?.details ?? [];

      const newRows = newDetails.map((row) => {
        // const retentions = getRetencionesNamesByDetalles(
        //   row.retentionSourceId === null ? undefined : row.retentionSourceId,
        //   row.retentionIVAId === null ? undefined : row.retentionIVAId
        // );
        const id =
          row.id === ParametersEnum.ID_ROW_NO_ID.toString()
            ? randomId()
            : row.id;
        return {
          // retentions,
          ...row,
          id,
        };
      });
      setRows(newRows);
    }
  }, [formState, rows, cobrosInitialized, rowsDetalleCobro, selectedAdvances]);

  // ********************************** RETENCIONES *********************************************
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

  // ********************************** submit *********************************************
  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rowsWithtoutTotalRow = rowsDetalleCobro.filter(
      (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
    );
    if (
      !validateForm({
        user,
        rows,
        formState,
        enqueueSnackbar,
        diferencia,
        cobrosInitialized,
        rowsDetalleCobro: rowsWithtoutTotalRow,
        rowModesModelCobro,
        cellModesModel,
      })
    ) {
      setFormState({
        ...formState,
        invoiceStatusId: prevFormState.current
          ? prevFormState.current.invoiceStatusId
          : EstadoDocumentoEnum.GENERADO,
      });
      return;
    }
    const crosses: CrossedAdvanceClientType[] = selectedAdvances.filter(
      (advance) => advance.advanceAmount > 0
    );

    const header: FacturaVentaHeader = {
      ...(formState as FacturaVentaHeader),
    };

    const details: DetalleFacturaVentaInterface[] = rows.map((row) => ({
      ...(row as DetalleFacturaVentaInterface),
    }));

    const retenciones: RetencionGroupType[] = formState.retenciones ?? [];

    const taxes: ImpuestoDocumentoInterface[] = formState.taxes ?? [];

    const paymentDetails: DetalleCobroFacturaInterface[] = rowsDetalleCobro
      .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
      .map((row) => {
        if (row.paymentMethodId === FormaPagoEnum.NOTA_CREDITO) {
          return {
            ...(row as DetalleCobroFacturaInterface),
            crosses,
          };
        }
        return {
          ...(row as DetalleCobroFacturaInterface),
        };
      });

    const payments: CobroFacturaInterface[] = [
      {
        ...cobrosInitialized[0],
        paymentDetails,
      },
    ];

    const body: FacturaVentaDto = {
      header,
      details,
      retenciones,
      taxes,
      payments,
    };

    if (createMode) {
      await fetchSaveFacturaVenta(body);
    } else {
      await fetchUpdateFacturaVenta(body, facturaId);
    }
    handleCancel();
  };

  // ********************* RETURN *********************

  return (
    <>
      <CustomDialog
        fieldName="cancellationReason"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.cancellationReason ?? ''}
        onInputChange={onInputChange}
        stateIdFieldName="invoiceStatusId"
        setFormState={setFormState}
        prevStateId={
          prevFormState.current?.invoiceStatusId ?? EstadoDocumentoEnum.GENERADO
        }
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
        // headerActions={
        //   !createMode && navigateBetweenDocuments() ? headerComponents : null
        // }
      >
        <form onSubmit={onSubmit} onKeyDown={onFormKeyEvents}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <FacturaVentaForm
              formState={formState}
              setFormState={setFormState}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              onInputChange={onInputChange}
              styles={styles}
              rows={rows}
              setRows={setRows}
              setSelectedCliente={setSelectedCliente}
              setAvailableAdvances={setAvailableAdvances}
            />
            <FacturaVentaRows
              formState={formState}
              rows={rows}
              setRows={setRows}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              onInputChange={onInputChange}
              onInputNumberChange={onInputNumberChange}
              cellModesModel={cellModesModel}
              setCellModesModel={setCellModesModel}
              addNewRow={addNewRow}
              retencionList={retencionList}
              addButtonRef={addButtonRef}
              styles={styles}
              commonKeyEvents={commonKeyEvents}
              fetchRecalculate={fetchRecalculate}
              selectedCliente={selectedCliente}
              thereIsDiscount={thereIsDiscount}
              setThereIsDiscount={setThereIsDiscount}
            />
            <CobroRows
              cobros={cobrosInitialized}
              setCobros={setCobrosInitialized}
              createMode={createMode}
              editMode={editMode}
              styles={styles}
              rows={rowsDetalleCobro}
              setRows={setRowsDetalleCobro}
              formState={formState}
              selectedCliente={selectedCliente}
              rowsProductos={rows}
              setRowsProductos={setRows}
              fetchRecalculate={fetchRecalculate}
              diferencia={diferencia}
              setDiferencia={setDiferencia}
              rowModesModel={rowModesModelCobro}
              setRowModesModel={setRowModesModelCobro}
              selectedAdvances={selectedAdvances}
              setSelectedAdvances={setSelectedAdvances}
              availableAdvances={availableAdvances}
              setAvailableAdvances={setAvailableAdvances}
            />
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
              enableAnulation={enabledAnulation}
            />
          </Grid>
        </form>
      </CardLayout>
    </>
  );
};
