'use client';
import {
  ComprobanteEstadoEnum,
  ComprobanteTypeEnum,
  DocumentTypeEnum,
  EstadoDocumentoEnum,
  FormaPagoEnum,
  NotaCreditoEnum,
  PathEnum,
} from '@/enums';
import {
  FormState,
  useAccessDocument,
  useAllowAdquisicion,
  useAllowGlobal,
  useDocumentAsync,
  useForm,
  useNotaCreditoProveedorAsyc,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import {
  DetalleNCProveedorResponse,
  FacturaProveedorResponseInterface,
  ImpuestoDocumentoInterface,
  NotaCreditoProveedorResponse,
  PersonProviderType,
} from '@/types';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { Box, Button, SelectChangeEvent, Tooltip } from '@mui/material';
import {
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import parseISO from 'date-fns/parseISO';
import { isEqual } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotaCreditoButtons } from './components/NotaCreditoButtons';
import { NotaCreditoDialog } from './components/NotaCreditoDialog';
import { NotaCreditoForm } from './components/NotaCreditoForm';
import { getCuentaById } from '@/backend';
import axios from 'axios';
import { setCurrencyNumber } from '@/functions';

export type ManageNotaCreditoPageProps = {
  // types...
};
export const getVoucherName = (valor: string) => {
  return Object.keys(ComprobanteTypeEnum)
    .filter((key): key is keyof typeof ComprobanteTypeEnum =>
      isNaN(Number(key))
    )
    .find((key) => ComprobanteTypeEnum[key] === valor);
};

export const getNombreFormaPago = (valor: string) => {
  return Object.keys(FormaPagoEnum)
    .filter((key): key is keyof typeof FormaPagoEnum => isNaN(Number(key)))
    .find((key) => FormaPagoEnum[key] === valor);
};

const initialFormState: FormState = {
  creditNoteId: null,
  creditNoteNumber: '',
  entryId: null,
  branchId: null,
  branchName: '',
  issueDate: new Date(),
  authorizationNumber: '',
  paymentMethodId: FormaPagoEnum.EFECTIVO,
  paymentMethodName: getNombreFormaPago(FormaPagoEnum.EFECTIVO) ?? '',
  invoiceId: null,
  invoiceNumber: '',
  invoiceIssueDate: null,
  invoiceValue: 0,
  invoiceBalance: 0,
  providerId: null,
  providerName: '',
  providerIdentification: '',
  observation: '',
  stateId: ComprobanteEstadoEnum.GENERADO,
  stateName: '',
  voucherTypeCode: ComprobanteTypeEnum.NOTA_DE_CREDITO,
  voucherTypeName: getVoucherName(ComprobanteTypeEnum.NOTA_DE_CREDITO) ?? '',
  subtotal: 0,
  subtotalNoTax: 0,
  vat: 0,
  total: 0,
  ncTypeId: NotaCreditoEnum.DEVOLUCION,
  paymentTypeId: null,
  cancellationDate: null,
  cancellationReason: '',
  creditNoteDetails: [],
  endDate: null,
  previousNcValue: 0,
};

export const ManageNotaCreditoPage: React.FC<
  ManageNotaCreditoPageProps
> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevFormState = useRef<any | undefined>(undefined);
  const prevRows = useRef<any | undefined>(undefined);
  const { navigateBetweenDocuments } = useAllowGlobal();
  const [title, setTitle] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  const [isEditable, setIsEditable] = useState(true);
  const [isAnulation, setIsAnulation] = useState(false);
  const [enabledAnulation, setEnabledAnulation] = useState(false);
  const { closeDocument, openDocument } = useAccessDocument();
  const { sucursales, impuestos } = useSelector(
    (state: RootState) => state.common
  );
  const [rowsNotaCredito, setRowsNotaCredito] = React.useState<GridRowsProp>(
    []
  );
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const { fetchSaveNC, fetchUpdateNC, fetchNCById } =
    useNotaCreditoProveedorAsyc();
  const [taxes, setTaxes] = useState<ImpuestoDocumentoInterface[]>([]);
  const { enableEditingNotaCredito, enableAnulationNotaCredito } =
    useAllowAdquisicion();
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);
  const [invoiceData, setInvoiceData] = useState<
    FacturaProveedorResponseInterface[]
  >([]);
  const requestId = useMemo(() => {
    const state =
      location.state || JSON.parse(localStorage.getItem('state') || '{}');
    const documentId = state.requestId;
    if (!documentId) return null;
    const [id, type] = documentId.split('-');
    const isValidType = Number(type) === DocumentTypeEnum.NOTA_CREDITO_COMPRA;

    return isValidType ? id : null;
  }, [location.state]);
  const getNombreEstado = (valor: number) => {
    return Object.keys(ComprobanteEstadoEnum)
      .filter((key): key is keyof typeof ComprobanteEstadoEnum =>
        isNaN(Number(key))
      )
      .find((key) => ComprobanteEstadoEnum[key] === valor);
  };

  const { validateExistDocumentAsync } = useDocumentAsync();

  const [existDocument, setExistDocument] = useState(false);

  const setHeader = (formState: FormState): NotaCreditoProveedorResponse => {
    return {
      ...(formState as NotaCreditoProveedorResponse),
    };
  };

  const setDetails = (
    rows: readonly GridValidRowModel[]
  ): DetalleNCProveedorResponse[] => {
    return rows.map((row) => {
      const {
        id,
        accountName,
        discount,
        isNew,
        isTaxCredit,
        priceWithoutTax,
        providerId,
        retentionIVAId,
        retentionSourceId,
        totalCost,
        unitMeasureId,
        valueNC,
        ...restRow
      } = row;
      return {
        ...(restRow as DetalleNCProveedorResponse),
        totalPrice: totalCost,
      };
    });
  };

  const {
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    setFormState,
    formState,
    onInputJustNumber,
  } = useForm(initialFormState);

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
                documentType: DocumentTypeEnum.NOTA_CREDITO_COMPRA,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.NOTA_CREDITO + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.NOTA_CREDITO_COMPRA,
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
                documentType: DocumentTypeEnum.NOTA_CREDITO_COMPRA,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.NOTA_CREDITO + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.NOTA_CREDITO_COMPRA,
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
        documentType: DocumentTypeEnum.NOTA_CREDITO_COMPRA,
      });
    }
    navigate(PathEnum.NOTA_CREDITO);
  };

  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const handleOnSelect = (event: SelectChangeEvent<any>) => {
    setFormState({
      ...initialFormState,
      [event.target.name]: event.target.value,
    });
    setRowsNotaCredito([]);
    setProveedoredorPersonaList([]);
    setInvoiceData([]);
  };

  useEffect(() => {
    if (!requestId) {
      setCreateMode(true);
      setTitle('Nueva Nota de Crédito');
      setIsEditable(true);
    } else {
      setCreateMode(false);
      setEditMode(false);
      setTitle('Nota de Crédito (Modo Lectura) - N° ' + requestId);
      const setFormAndRows = async () => {
        const response = await fetchNCById(requestId);
        if (response) {
          const dto = response as NotaCreditoProveedorResponse;
          const newFormState = {
            ...dto,
            invoiceIssueDate:
              typeof dto.invoiceIssueDate === 'string'
                ? parseISO(dto.invoiceIssueDate)
                : dto.invoiceIssueDate ?? new Date(),
            issueDate:
              typeof dto.issueDate === 'string'
                ? parseISO(dto.issueDate)
                : dto.issueDate,
            provider: dto.providerId,
            typeNC: dto.ncTypeId,
            creditNoteDetails: [],
          };
          setFormState(newFormState);
          prevFormState.current = newFormState;

          const enableEditing =
            dto.stateId !== ComprobanteEstadoEnum.ANULADO
              ? enableEditingNotaCredito(
                  dto.stateId,
                  false,
                  dto.issueDate ?? new Date()
                )
              : false;
          setIsEditable(enableEditing);

          const enableAnulacion =
            dto.stateId !== ComprobanteEstadoEnum.ANULADO
              ? enableAnulationNotaCredito(
                  dto.stateId,
                  false,
                  dto.issueDate ?? new Date()
                )
              : false;
          setEnabledAnulation(enableAnulacion);
          const temporalRows = await Promise.all(
            dto.creditNoteDetails?.map(async (row) => {
              const accountName =
                dto.ncTypeId === NotaCreditoEnum.DESCUENTO
                  ? await getCuentaContableById(row.accountId)
                  : null;
              return {
                id: randomId(),
                ...row,
                accountName,
                valueNC: row.totalPrice,
                totalCost: row.totalPrice,
              };
            }) ?? []
          );

          setRowsNotaCredito(temporalRows);
          prevRows.current = temporalRows;
        }
      };
      setFormAndRows();
    }
  }, [requestId]);

  const getCuentaContableById = async (accountId: number | null) => {
    try {
      if (accountId && accountId !== null) {
        const response: ServerResponseType | undefined = await getCuentaById(
          accountId
        );
        if (response) {
          if (response.status === 200) {
            const accountName = `${response.message?.accountNumber} - ${response.message?.accountName}`;
            return accountName;
          }
        } else {
          return '';
        }
      } else {
        return '';
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          enqueueSnackbar('No se ha encontrado la cuenta solicitada buscada', {
            variant: 'info',
          });
          return '';
        } else {
          enqueueSnackbar('Error Del Servidor: ' + error.message, {
            variant: 'error',
          });
        }
      }
      return '';
    }
  };

  const thereIsChanges = useMemo(() => {
    return (
      !isEqual(prevFormState.current, formState) ||
      !isEqual(prevRows.current, rowsNotaCredito)
    );
  }, [formState, rowsNotaCredito]);

  const validateForm = (validRows: GridValidRowModel[]) => {
    if (formState.ncTypeId === null) {
      enqueueSnackbar('El campo Tipo Nota de Cretido es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.providerId === null) {
      enqueueSnackbar('El campo Proveedor es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.invoiceId === null) {
      enqueueSnackbar('El campo Factura es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.authorizationNumber === '') {
      enqueueSnackbar('El campo Número Autorización es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.creditNoteNumber === '') {
      enqueueSnackbar('El campo Número NC es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.observation === '') {
      enqueueSnackbar('El campo Observación es requerido', {
        variant: 'error',
      });
      return false;
    }
    if (
      validRows.length === 0 &&
      formState.stateId !== EstadoDocumentoEnum.ANULADO
    ) {
      enqueueSnackbar('No puede guardar con filas vacías', {
        variant: 'error',
      });
      return false;
    }
    if (validRows.length > 0) {
      if (formState.ncTypeId === NotaCreditoEnum.DESCUENTO) {
        if (validRows.some((row) => row.valueNC <= 0)) {
          enqueueSnackbar('No puede guardar Valores NC con 0', {
            variant: 'error',
          });
          return false;
        }
      } else {
        if (validRows.some((row) => row.returnedQuantity <= 0)) {
          enqueueSnackbar('No puede guardar Cantidad devolucion con 0', {
            variant: 'error',
          });
          return false;
        }
      }
    }
    const issueDateOnly = new Date(formState.issueDate);
    issueDateOnly.setHours(0, 0, 0, 0);

    const invoiceIssueDateOnly = new Date(formState.invoiceIssueDate);
    invoiceIssueDateOnly.setHours(0, 0, 0, 0);

    if (issueDateOnly < invoiceIssueDateOnly) {
      enqueueSnackbar(
        'La fecha de emisión no puede ser anterior a la fecha de emisión de la factura',
        {
          variant: 'error',
        }
      );
      return false;
    }
    if (formState.issueDate > new Date()) {
      enqueueSnackbar(
        'La fecha de emisión no puede ser superior a la fecha actual',
        {
          variant: 'error',
        }
      );
      return false;
    }
    if (
      (createMode || editMode) &&
      formState.stateId !== EstadoDocumentoEnum.ANULADO
    ) {
      const maxValueNc = formState.previousNcValue + formState.total;

      if (maxValueNc > formState.invoiceValue) {
        enqueueSnackbar(
          `El monto de la nota de crédito no puede ser mayor al saldo de la factura. Saldo de la factura: ${setCurrencyNumber(
            formState.invoiceValue
          )}`,
          {
            variant: 'error',
          }
        );
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validRows = rowsNotaCredito.filter(
      (row) => row.returnedQuantity > 0 && row.totalCost > 0
    );

    if (!validateForm(validRows)) {
      setFormState({
        ...formState,
        stateId: prevFormState.current
          ? prevFormState.current.stateId
          : ComprobanteEstadoEnum.GENERADO,
        stateName: getNombreEstado(ComprobanteEstadoEnum.GENERADO),
      });
      return;
    }

    const header = setHeader(formState);
    const details = setDetails(validRows);

    header.creditNoteDetails = details;

    const response = requestId
      ? await fetchUpdateNC(
          {
            header,
            taxes,
          },
          requestId
        )
      : await fetchSaveNC({
          header,
          taxes,
        });
    if (
      !response ||
      (response && (response as ServerResponseType).status === 400) ||
      (response && (response as ServerResponseType).status === 500)
    ) {
      setFormState({
        ...formState,
        stateId: prevFormState.current
          ? prevFormState.current.stateId
          : ComprobanteEstadoEnum.GENERADO,
        stateName: getNombreEstado(ComprobanteEstadoEnum.GENERADO),
      });
      return;
    }
    handleCancel();
  };

  useEffect(() => {
    const fetchValidatedDocument = async () => {
      if (
        formState.creditNoteNumber &&
        (prevFormState.current === undefined ||
          prevFormState.current.creditNoteNumber !== formState.creditNoteNumber)
      ) {
        const validatedDocument = await validateExistDocumentAsync(
          formState.providerId,
          ComprobanteTypeEnum.NOTA_DE_CREDITO,
          formState.creditNoteNumber
        );
        setExistDocument(validatedDocument as boolean);

        if (validatedDocument) {
          enqueueSnackbar(
            'El número de documento ya está registrado para este proveedor',
            {
              variant: 'error',
            }
          );
        }
      }
    };

    if (createMode || editMode) fetchValidatedDocument();
  }, [formState.creditNoteNumber, createMode, editMode]);

  return (
    <>
      <NotaCreditoDialog
        fieldName="cancellationReason"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.cancellationReason ?? ''}
        onInputChange={onInputChange}
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
          <NotaCreditoForm
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onDateChange={onDateChange}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            onInputJustNumber={onInputJustNumber}
            handleOnSelect={handleOnSelect}
            rowsNotaCredito={rowsNotaCredito}
            setRowsNotaCredito={setRowsNotaCredito}
            rowModesModel={rowModesModel}
            sucursales={sucursales}
            impuestos={impuestos}
            taxes={taxes}
            setTaxes={setTaxes}
            getNombreFormaPago={getNombreFormaPago}
            proveedorPersonaList={proveedorPersonaList}
            setProveedoredorPersonaList={setProveedoredorPersonaList}
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
          />
          <NotaCreditoButtons
            createMode={createMode}
            editMode={editMode}
            handleCancel={handleCancel}
            isEditable={isEditable}
            thereIsChanges={thereIsChanges}
            setDialogMessage={setDialogMessage}
            setOpenDialogAlert={setOpenDialogAlert}
            formState={formState}
            setFormState={setFormState}
            rows={rowsNotaCredito}
            setEditMode={setEditMode}
            setTitle={setTitle}
            getNombreEstado={getNombreEstado}
            rowModesModel={rowModesModel}
            setRowModesModel={setRowModesModel}
            setIsAnulation={setIsAnulation}
            enabledAnulation={enabledAnulation}
            existDocumentNumber={existDocument}
          />
        </form>
      </CardLayout>
    </>
  );
};
