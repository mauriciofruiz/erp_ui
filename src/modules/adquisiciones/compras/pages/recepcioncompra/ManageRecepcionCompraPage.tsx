import { DocumentTypeEnum, PathEnum } from '@/enums';
import { ReceiptPurchaseEnum } from '@/enums/ReceiptPurchaseEnum';
import { downloadPdf } from '@/functions';
import {
  StyledDatePicker,
  useAccessDocument,
  useAllowAdquisicion,
  useAllowGlobal,
  useForm,
  useRecepcionProveedorAsync,
  useStyles,
} from '@/hooks';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { CardLayout } from '@/modules';
import { RootState } from '@/store';
import {
  DetailRecepcionCompraGetType,
  DetailRecepcionCompraSendType,
  RecepcionCompraGetType,
  RecepcionCompraPackeageSendType,
  RecepcionCompraSendType,
  SucursalType,
} from '@/types';
import {
  DomainVerification,
  EditNote,
  ExitToApp,
  Info,
  PictureAsPdf,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Table,
  TableCell,
  TableFooter,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  GridColDef,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { GridSlotsComponentsProps } from '@mui/x-data-grid/internals';
import { parseISO } from 'date-fns';
import dayjs from 'dayjs';
import isEqual from 'lodash.isequal';
import { useSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

export type ManageRecepcionCompraPageProps = {};

const ManageRecepcionCompraPage: React.FC<
  ManageRecepcionCompraPageProps
> = ({}) => {
  const location = useLocation();

  const receptionId =
    location && location.state && location.state.receptionId
      ? location.state.receptionId
      : localStorage.getItem('state')
      ? JSON.parse(localStorage.getItem('state') || '').receptionId || undefined
      : undefined;

  const [createMode, setCreateMode] = useState(true);

  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');

  const { enableEditingRC } = useAllowAdquisicion();

  const { navigateBetweenDocuments } = useAllowGlobal();

  const [isEditable, setIsEditable] = useState(false);

  const [receiptSelected, setReceiptSelected] =
    useState<RecepcionCompraGetType>();

  const [detailsReceiptSelected, setDetailsReceiptSelected] = useState<
    DetailRecepcionCompraGetType[]
  >([]);

  const { closeDocument, openDocument } = useAccessDocument();
  const handleCancel = () => {
    if (receptionId) {
      closeDocument({
        id: receptionId,
        documentType: DocumentTypeEnum.RECEPCION_COMPRA,
      });
    }
    navigate(PathEnum.RECEPCION_COMPRA);
  };

  const { user } = useSelector((state: RootState) => state.auth);

  const { sucursales } = useSelector((state: RootState) => state.common);

  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const styles = useStyles();

  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [sucursalUser, setSucursalUser] = useState<SucursalType>(
    sucursales.filter((s) => s.branchId === user?.branchId)[0]
  );

  const [isValidDataGrid, setIsValidDataGrid] = useState(false);

  const {
    onInputChange,
    onDateChange,
    formState,
    onResetForm,
    isFormValid,
    setFormState,
  } = useForm({
    creationDate: new Date(),
    receptionDate: new Date(),
    user: user,
    branch: sucursalUser,
    origin: '',
    transport: '',
    documents: '',
    receivedBy: user?.userName,
    isPartial: false,
    deliveredBy: '',
    observation: '',
    motivo: null,
    providerId: null,
    personName: '',
  });

  const [validateAnulado, setValidateAnulado] = useState(false);

  const [stateToSave, setStateToSave] = useState<number>(
    ReceiptPurchaseEnum.RECEPCIONADA
  );

  const [showButtonChanges, setShowButtonChanges] = useState<boolean>(false);

  const prevFormState = useRef<any | undefined>(undefined);

  const prevRows = useRef<any | undefined>(undefined);

  const [dialogMessage, setDialogMessage] = useState('');

  const [isAnulation, setIsAnulation] = useState(false);

  const {
    saveRecepcionBackEnd,
    updateRecepcionBackEnd,
    fetchDownloadPdf,
    fetchById,
    fetchDetailsById,
  } = useRecepcionProveedorAsync();

  const { adquisicionPeriodo } = useAllowAdquisicion();

  // ? * * * * * * * * * * * * * * * *  USE EFFECT * * * * * * * * * * * * * * * * * *

  useEffect(() => {
    const getReceipts = async (receptionId: number) => {
      fetchById(receptionId).then((response) => {
        if (response) {
          setReceiptSelected(response);
        }
      });
    };

    const getDetails = async (receptionId: number) => {
      fetchDetailsById(receptionId).then((response) => {
        if (response) {
          setDetailsReceiptSelected(response);
        }
      });
    };
    if (receptionId) {
      setCreateMode(false);
      Promise.all([
        getReceipts(Number(receptionId)),
        getDetails(Number(receptionId)),
      ]);
    }
  }, [receptionId]);

  useEffect(() => {
    const anulacionTemp =
      receiptSelected &&
      receiptSelected.receptionStateId !== ReceiptPurchaseEnum.FACTURADA;

    setValidateAnulado(anulacionTemp || true);

    const enableEditing = enableEditingRC(
      receiptSelected
        ? receiptSelected?.receptionStateId
        : ReceiptPurchaseEnum.RECEPCIONADA,
      createMode,
      receiptSelected?.receptionDate ?? new Date()
    );

    setIsEditable(enableEditing);

    const dateCreacion = receiptSelected?.creationDate
      ? receiptSelected?.creationDate
      : '';

    const dateRecepcion = receiptSelected?.receptionDate
      ? parseISO(receiptSelected?.receptionDate.toString())
      : new Date();

    const sucursalSeteada = receiptSelected
      ? sucursales.filter((s) => s.branchId === receiptSelected?.branchId)[0]
      : sucursales.filter((s) => s.branchId === user?.branchId)[0];

    setSucursalUser(sucursalSeteada);
    setFormState({
      creationDate: receiptSelected
        ? parseISO(dateCreacion.toString())
        : new Date(),
      receptionDate: dateRecepcion ? dateRecepcion : new Date(),
      user: receiptSelected
        ? {
            userNick: receiptSelected?.userName,
            userId: receiptSelected?.userId,
          }
        : user,
      branch: sucursalSeteada,
      origin: receiptSelected ? receiptSelected?.origin : '',
      transport: receiptSelected ? receiptSelected?.transport : '',
      documents: receiptSelected ? receiptSelected?.documents : '',
      receivedBy:
        receiptSelected && receiptSelected?.receivedBy !== null
          ? receiptSelected?.receivedBy
          : user?.userName,
      isPartial: false,
      deliveredBy:
        receiptSelected && receiptSelected.deliveredBy !== null
          ? receiptSelected?.deliveredBy
          : '',
      observation:
        receiptSelected && receiptSelected.observation !== null
          ? receiptSelected?.observation
          : '',
      motivo: receiptSelected ? receiptSelected?.motive : null,
      providerId: receiptSelected?.providerId,
      personName: receiptSelected?.personName,
    });
    prevRows.current = rows;
  }, [receiptSelected]);

  useEffect(() => {
    setTitle(
      createMode
        ? 'Nueva Recepción De Compra'
        : 'Recepción De Compra (Modo Lectura) - N° ' + receptionId
    );
  }, [createMode, receptionId]);

  useEffect(() => {
    setRows(
      receiptSelected &&
        detailsReceiptSelected &&
        detailsReceiptSelected.length > 0
        ? detailsReceiptSelected.map((item) => ({
            id: randomId(),
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            branchId: item.branchId,
            branchName: item.branchName,
            requestedQuantity: item.requestedQuantity,
            receivedQuantity: item.receivedQuantity,
            toReceiveQuantity: item.requestedQuantity - item.receivedQuantity,
            pendingQuantity: item.pendingQuantity,
            detailPurchaseOrderId: item.detailPurchaseOrderId,
          }))
        : []
    );
    prevFormState.current = formState;
  }, [receiptSelected, detailsReceiptSelected]);

  useEffect(() => {
    rows.length > 0 ? setIsValidDataGrid(true) : setIsValidDataGrid(false);
  }, [rows]);

  // * DEFINICION DE COLUMNAS DE LA TABLA
  const columns: GridColDef[] = [
    {
      field: 'productCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      minWidth: 80,
      cellClassName: 'centered-grid',
    },
    {
      field: 'productName',
      headerName: 'Nombre Producto',
      type: 'string',
      flex: 2,
      minWidth: 250,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
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
    },
    {
      field: 'requestedQuantity',
      headerName: 'C. Solicitada',
      flex: 1,
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      type: 'number',
    },
    {
      field: 'receivedQuantity',
      headerName: 'C. Recepcionada',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      minWidth: 150,
      sortable: false,
      type: 'number',
    },
  ];

  useEffect(() => {
    if (
      (!isEqual(prevFormState.current, formState) ||
        !isEqual(prevRows.current, rows)) &&
      formState.documents.length === 15
    ) {
      setShowButtonChanges(true);
    } else {
      setShowButtonChanges(false);
    }
  }, [formState, rows]);

  const validateForm = () => {
    let isValid = true;

    if (
      adquisicionPeriodo?.closingPeriodDate &&
      formState.receptionDate < adquisicionPeriodo.closingPeriodDate
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
        receptionPurchaseId: prevFormState.current
          ? prevFormState.current.receptionPurchaseId
          : ReceiptPurchaseEnum.FACTURADA,
      });
      return;
    }

    const request: RecepcionCompraSendType = {
      adjustmentCode: 0,
      branchId: formState.branch.branchId,
      canceledEntryCode: '',
      creationDate: formState.creationDate,
      deliveredBy: formState.deliveredBy,
      documents: formState.documents,
      isInvoiced: false,
      motive: formState.motivo,
      observation: formState.observation,
      origin: formState.origin,
      receivedBy: formState.receivedBy,
      receptionDate: formState.receptionDate,
      receptionPurchaseId: receiptSelected?.receptionPurchaseId || null,
      receptionStateId: stateToSave,
      transport: formState.transport,
      userId: formState.user.userId,
      warehouseId: receiptSelected?.warehouseId || null,
    };

    const detailsBuilder: DetailRecepcionCompraSendType[] = setDetails(
      rows.filter((row) => row.toReceiveQuantity > 0),
      detailsReceiptSelected || [],
      receiptSelected
    );

    const detailsToSave: DetailRecepcionCompraSendType[] = validateDetails(
      detailsBuilder,
      detailsReceiptSelected
    );

    let packagesToSave: RecepcionCompraPackeageSendType = {
      receptionPurchase: request,
      receptionPurchaseDetails: detailsToSave,
    };

    receiptSelected?.receptionPurchaseId !== null
      ? await saveRecepcionBackEnd(packagesToSave)
      : await updateRecepcionBackEnd(
          packagesToSave,
          receiptSelected.receptionPurchaseId
        );

    onResetForm();
    setRows([]);
    handleCancel();
  };

  const onDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle(
        'Recepción De Compra (Modo Edición) - N° ' +
          receiptSelected?.receptionPurchaseId
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
        'Recepción De Compra (Modo Lectura) - N° ' +
          receiptSelected?.receptionPurchaseId
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

  // * * * * * * * * * * * * *  NAVIGATION * * * * * * * * * * * * * * * * * * * * *
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
                id: receptionId,
                documentType: DocumentTypeEnum.RECEPCION_COMPRA,
              });
              openDocument({
                id: Number(receptionId) - 1,
                navigation: () =>
                  navigate(PathEnum.RECEPCION_COMPRA + PathEnum.VIEW, {
                    state: {
                      receptionId: Number(receptionId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.RECEPCION_COMPRA,
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
                id: receptionId,
                documentType: DocumentTypeEnum.RECEPCION_COMPRA,
              });
              openDocument({
                id: Number(receptionId) + 1,
                navigation: () =>
                  navigate(PathEnum.RECEPCION_COMPRA + PathEnum.VIEW, {
                    state: {
                      receptionId: Number(receptionId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.RECEPCION_COMPRA,
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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <TextField
                label="Usuario"
                value={formState.user.userNick}
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
                label="Fecha Registro"
                disableOpenPicker
                readOnly
                format="dd/MM/yyyy"
                value={formState.creationDate}
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
                label="Fecha Recepción"
                views={['year', 'month', 'day']}
                minDate={formState.creationDate}
                maxDate={dayjs(new Date()).add(1, 'month').toDate()}
                format="dd/MM/yyyy"
                value={
                  formState.receptionDate && formState.receptionDate !== null
                    ? formState.receptionDate
                    : ''
                }
                onChange={(value) =>
                  onDateChange(value as Date, 'receptionDate')
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
                      shrink: formState.receptionDate ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Proveedor"
                value={formState.personName ? formState.personName : ''}
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
              <TextField
                label="Sucursal"
                value={formState.branch ? formState.branch.name : ''}
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
              <TextField
                name="origin"
                label="Procedencia"
                value={
                  formState.origin !== null
                    ? formState.origin.toUpperCase()
                    : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink:
                    formState.origin !== null && formState.origin !== ''
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="documents"
                label="Factura"
                value={formState.documents !== null ? formState.documents : ''}
                onChange={onInputChange}
                type="number"
                onInput={(e: any) => {
                  e.target.value = e.target.value.slice(0, 15);
                }}
                inputProps={{
                  min: '0',
                }}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink:
                    formState.documents !== null && formState.documents !== ''
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="transport"
                label="Documentos (Guía)"
                value={
                  formState.transport !== null
                    ? formState.transport.toUpperCase()
                    : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink:
                    formState.transport !== null && formState.transport !== ''
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Recepcionado Por"
                value={formState.receivedBy}
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
              <TextField
                name="deliveredBy"
                label="Entregado Por"
                value={
                  formState.deliveredBy !== null
                    ? formState.deliveredBy.toUpperCase()
                    : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink:
                    formState.deliveredBy !== null &&
                    formState.deliveredBy !== ''
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                name="observation"
                label="Observación"
                value={
                  formState.observation !== null
                    ? formState.observation.toUpperCase()
                    : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink:
                    formState.observation !== null &&
                    formState.observation !== ''
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <StyledDataGrid
                rows={rows}
                columns={columns}
                getRowClassName={(params) =>
                  params !== null ? `super-app-theme--null` : ''
                }
                rowHeight={30}
                columnHeaderHeight={45}
                sx={{
                  height: rows.length > 0 ? '100%' : 300,
                }}
                slots={{
                  footer: CustomFooterStatusComponent,
                  noRowsOverlay: CustomNoRowsOverlay,
                }}
                slotProps={{
                  footer: {
                    rows,
                  },
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
                  style={{ width: '130px' }}
                >
                  {'Salir'}
                </Button>

                <Button
                  startIcon={<PictureAsPdf />}
                  sx={{ margin: 2 }}
                  onClick={() => {
                    if (receiptSelected) {
                      fetchDownloadPdf(
                        receiptSelected.receptionPurchaseId
                      ).then((response) => {
                        downloadPdf(
                          response,
                          `RC #${receiptSelected.receptionPurchaseId} - ${receiptSelected.personName}.pdf`
                        );
                      });
                    }
                  }}
                  style={{ width: '130px' }}
                >
                  {'Descargar PDF'}
                </Button>
                {isEditable && validateAnulado && (
                  <Button
                    startIcon={<EditNote />}
                    sx={{ margin: 2 }}
                    onClick={onEditButtonClick}
                    style={{ width: '130px' }}
                  >
                    {!editMode ? 'Editar' : 'Leer'}
                  </Button>
                )}
              </>
            )}
            {isEditable && validateAnulado && (
              <>
                {showButtonChanges && (
                  <Button
                    type="button"
                    startIcon={<DomainVerification />}
                    onClick={() => {
                      setStateToSave(ReceiptPurchaseEnum.RECEPCIONADA);
                      setDialogMessage(
                        'Una vez confirmada la recepción no se podrá modificar. ¿Desea confirmar la recepción de compra?'
                      );
                      setIsAnulation(false);
                      setOpenDialogAlert(true);
                    }}
                    disabled={!isFormValid || !isValidDataGrid}
                    sx={{ margin: 2 }}
                    style={{ width: '130px' }}
                  >
                    {'Recepcionar'}
                  </Button>
                )}
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
              {dialogMessage}
            </Alert>
            {isAnulation && (
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
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogAlert(false)} color="primary">
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={
                isAnulation
                  ? formState.motivo === null || formState.motivo === ''
                    ? true
                    : false
                  : false
              }
            >
              Confirmar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

function setDetails(
  currentRows: GridRowsProp,
  existingDetails: DetailRecepcionCompraGetType[],
  receiptPurchase: RecepcionCompraGetType | undefined
): DetailRecepcionCompraSendType[] {
  if (existingDetails && existingDetails.length > 0) {
    return currentRows.map((current, index) => {
      return {
        detailReceptionProductId: existingDetails[index]
          ? existingDetails[index].detailReceptionProductId
          : null,
        receptionPurchaseId: receiptPurchase
          ? receiptPurchase.receptionPurchaseId
          : null,
        productId: current.productId,
        branchId: current.branchId,
        requestedQuantity: existingDetails[index]
          ? existingDetails[index].requestedQuantity
          : 0,
        receivedQuantity: existingDetails[index]
          ? existingDetails[index].receivedQuantity
          : 0,
        pendingQuantity: existingDetails[index]
          ? existingDetails[index].pendingQuantity
          : 0,
        returnedQuantity: existingDetails[index]
          ? existingDetails[index].returnedQuantity
          : 0,
        price: 0,
        detailOrderId: current.detailPurchaseOrderId,
      };
    });
  } else {
    return currentRows.map((current) => {
      return {
        detailReceptionProductId: null,
        receptionPurchaseId: receiptPurchase
          ? receiptPurchase.receptionPurchaseId
          : null,
        productId: current.productId,
        branchId: current.branchId,
        requestedQuantity: current.requestedQuantity,
        receivedQuantity: current.toReceiveQuantity,
        pendingQuantity: current.pendingQuantity,
        detailOrderId: current.detailPurchaseOrderId,
        price: 0,
        returnedQuantity: 0,
      };
    });
  }
}

function validateDetails(
  detailsRows: DetailRecepcionCompraSendType[],
  detailsFromDb: DetailRecepcionCompraGetType[] | undefined
): DetailRecepcionCompraSendType[] {
  if (detailsFromDb) {
    const rows = detailsFromDb
      .filter((found) => {
        const exists = detailsRows.some(
          (detail) =>
            detail.detailReceptionProductId === found.detailReceptionProductId
        );
        return !exists;
      })
      .map((found) => ({
        detailReceptionProductId: found.detailReceptionProductId,
        receptionPurchaseId: found.receptionPurchaseId,
        productId: found.productId,
        branchId: found.branchId,
        requestedQuantity: found.requestedQuantity,
        receivedQuantity: found.receivedQuantity,
        pendingQuantity: found.pendingQuantity,
        detailOrderId: found.detailPurchaseOrderId,
        price: found.price,
        returnedQuantity: found.returnedQuantity,
      }));
    return [...detailsRows, ...rows];
  } else {
    return detailsRows;
  }
}

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    rows: GridRowsProp;
  }
}
function CustomFooterStatusComponent(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const calculateTotal = (property: string) =>
    (props.rows || []).reduce(
      (accumulator, row) => accumulator + parseFloat(row[property]),
      0
    );

  const requestedQuantity = calculateTotal('requestedQuantity');
  const receivedQuantity = calculateTotal('receivedQuantity');
  const toReceiveQuantity = calculateTotal('toReceiveQuantity');

  return props.rows && props.rows.length > 0 ? (
    <Table>
      <TableFooter>
        <TableRow>
          <TableCell
            style={{
              fontWeight: 'bold',
              fontSize: '12px',
              textAlign: 'center',
            }}
            width={'200px'}
          >
            TOTALES{' '}
          </TableCell>
          <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
            Total C. Solicitada: {requestedQuantity}
          </TableCell>
          <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
            Total C. Recepcionada: {receivedQuantity}
          </TableCell>
          <TableCell style={{ textAlign: 'left', fontSize: '12px' }}>
            Total A Recepcionar: {toReceiveQuantity}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ) : null;
}

export default ManageRecepcionCompraPage;
