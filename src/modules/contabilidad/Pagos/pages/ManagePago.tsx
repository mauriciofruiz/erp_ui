import {
  DocumentTypeEnum,
  EstadoPagoEnum,
  FormaPagoCobroEnum,
  ParametersEnum,
  PathEnum,
} from '@/enums';
import {
  FormState,
  useAccessDocument,
  useAllowContabilidad,
  useForm,
  usePaymentAsync,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { PaymentInterface } from '@/types';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentForm } from './components/PaymentForm';
import { useSnackbar } from 'notistack';
import { parseISO } from 'date-fns';
import { isEqual } from 'lodash';
import {
  setDetails,
  setHeader,
  setSummaryRow,
} from './components/SubmitFunctions';
import { SubmitButtons } from './components/SubmitButtons';
import { DetallePago } from './components/DetallePago';
import React from 'react';
import { PaymentData } from './components/PaymentData';
import { randomId } from '@mui/x-data-grid-generator';

type ManagePagoProps = {
  // types...
};

const initialFormState: FormState = {
  paymentId: null,
  entryId: null,
  paymentMethodId: FormaPagoCobroEnum.TRANSFERENCIA,
  paymentMethodName: '',
  bankId: null,
  bankName: '',
  paymentStatusId: null,
  paymentStatusName: '',
  providerId: null,
  providerName: '',
  documentNumber: '',
  paymentAmount: 0,
  crossedAmount: 0,
  paymentObservation: '',
  accountingDate: new Date().toISOString(),
  isChequePayment: false,
  isPettyCashPayment: false,
  isManualPayment: false,
  isAdvancePayment: false,
  recoverCheque: false,
  branchId: null,
  branchName: '',
  conciliationDate: '',
  documentDate: '',
  beneficiaryName: '',
  registrationDate: null,
  detail: [],
};

export const ManagePago: React.FC<ManagePagoProps> = ({}) => {
  const [isEditable, setIsEditable] = useState(false);
  const { closeDocument } = useAccessDocument();
  const { fetchGetById, fetchSave, fetchUpdate } = usePaymentAsync();
  const location = useLocation();
  const paymentId = useMemo(() => {
    const state =
      location.state || JSON.parse(localStorage.getItem('state') || '{}');
    const documentId = state.paymentId;
    if (!documentId) return null;
    const [id, type] = documentId.split('-');
    const isValidType = Number(type) === DocumentTypeEnum.PAGO;

    return isValidType ? id : null;
  }, [location.state]);
  const { user } = useSelector((state: RootState) => state.auth);
  const [createMode, setCreateMode] = useState(true);
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>('');
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isAnulation, setIsAnulation] = useState(false);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const prevFormState = useRef<FormState | undefined>(undefined);
  const prevRows = useRef<FormState | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const { sucursales, projects } = useSelector(
    (state: RootState) => state.common
  );
  const { enablePaymentEditing, enablePaymentAnulation } =
    useAllowContabilidad();
  const [letAnulate, setLetAnulate] = useState(false);
  const [error, setError] = useState({
    beneficiaryName: '',
    documentNumber: '',
  });

  const {
    formState,
    setFormState,
    onInputChange,
    onAutocompleteChange,
    onBooleanChangeClick,
    onGenericChange,
    onNumberChange,
  } = useForm(initialFormState);

  const handleCancel = () => {
    if (paymentId) {
      closeDocument({
        id: paymentId,
        documentType: DocumentTypeEnum.PAGO,
      });
    }
    navigate(PathEnum.PAGO);
  };

  useEffect(() => {
    if (!paymentId) {
      setCreateMode(true);
      setTitle('Nuevo Pago');
      setIsEditable(true);
      const newFormState = {
        ...formState,
        creationUserId: user?.userId,
        userName: user?.userName,
        branchId: user?.branchId,
      } as FormState;
      setFormState(newFormState);
    } else {
      setCreateMode(false);
      setEditMode(false);
      setTitle('Pago (Modo Lectura) - N° ' + paymentId);
      const setFormAndRows = async () => {
        const response = await fetchGetById(paymentId);
        if (response) {
          const dto = response as PaymentInterface;
          const newFormState = {
            ...dto,
            isValidDocument: true,
            documentDate:
              typeof dto.documentDate === 'string'
                ? parseISO(dto.documentDate)
                : dto.documentDate,
          };
          setFormState(newFormState);
          prevFormState.current = newFormState;
          if (dto.detail) {
            const detailsWithId = dto.detail.map((detail) => ({
              ...detail,
              id: randomId(),
            }));
            setRows(detailsWithId);
            prevRows.current = detailsWithId;
          }
          const enableEditing =
            dto.paymentStatusId !== EstadoPagoEnum.ANULADO
              ? enablePaymentEditing(
                  dto?.paymentStatusId || EstadoPagoEnum.GENERADO,
                  dto.registrationDate !== null
                    ? parseISO(dto.registrationDate)
                    : new Date()
                )
              : false;
          setIsEditable(enableEditing);

          const enableAnulation = enablePaymentAnulation(
            dto?.paymentStatusId || EstadoPagoEnum.GENERADO,
            createMode,
            dto.registrationDate !== null
              ? parseISO(dto.registrationDate)
              : new Date()
          );
          setLetAnulate(enableAnulation);
        }
      };
      setFormAndRows();
    }
  }, [paymentId]);

  useEffect(() => {
    if (rows.length === 0) return;
    //Cálculo de total de la columna de monto
    const temporalRows = rows.filter(
      (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
    );
    const summary = setSummaryRow(temporalRows);
    setRows(summary);
    prevRows.current = summary;
    //Actualización del campo monto de la cabecera
    const lastRow = summary.filter(
      (row) => row.id === ParametersEnum.ID_ROW_TOTAL
    );
    setFormState({
      ...formState,
      paymentAmount: lastRow[0].detailPaymentAmount,
    });
  }, [rows.length, JSON.stringify(rows.map((row) => row.detailPaymentAmount))]);

  const thereIsChanges = useMemo(() => {
    return (
      !isEqual(prevFormState.current, formState) ||
      !isEqual(prevRows.current, rows)
    );
  }, [formState, rows]);

  const validateForm = () => {
    if (formState.bankId === null) {
      enqueueSnackbar('Debe seleccionar un banco', {
        variant: 'error',
      });
      return false;
    }
    if (rows.length === 0) {
      enqueueSnackbar('Debe agregar al menos una cuenta', {
        variant: 'error',
      });
      return false;
    }
    if (error.documentNumber !== '') {
      enqueueSnackbar('Debe ingresar un número de cheque válido', {
        variant: 'error',
      });
      return false;
    }
    if (formState.branchId === null) {
      enqueueSnackbar('Debe seleccionar una sucursal', {
        variant: 'error',
      });
      return false;
    }
    if (formState.paymentObservation == '') {
      enqueueSnackbar('Debe ingresar una observación válida', {
        variant: 'error',
      });
      return false;
    }
    if (!formState.isValidDocument) {
      enqueueSnackbar('El número de documento no es válido', {
        variant: 'error',
      });
      return false;
    }
    const thereIsARowEditing = rows.some((row) => {
      return rowModesModel[row.id]?.mode === GridRowModes.Edit;
    });
    if (thereIsARowEditing) {
      enqueueSnackbar('Debe guardar los cambios en el detalle del pago', {
        variant: 'error',
      });
      return false;
    }

    return true;
  };
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
        paymentStatusId: prevFormState.current
          ? prevFormState.current.paymentStatusId
          : EstadoPagoEnum.GENERADO,
      });
      return;
    }
    const payment = setHeader(formState);
    const detailPayment = setDetails(
      rows,
      sucursales,
      payment.branchId,
      projects
    );
    const response = paymentId
      ? await fetchUpdate(
          {
            payment,
            detailPayment,
          },
          paymentId
        )
      : await fetchSave({
          payment,
          detailPayment,
        });

    if (
      !response ||
      (response && (response as ServerResponseType).status === 400) ||
      (response && (response as ServerResponseType).status === 500)
    ) {
      setFormState({
        ...formState,
        paymentStatusId: prevFormState.current
          ? prevFormState.current.paymentStatusId
          : EstadoPagoEnum.GENERADO,
      });
      return;
    }
    handleCancel();
  };

  return (
    <>
      <CustomDialog
        fieldName="paymentObservation"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.paymentObservation ?? ''}
        onInputChange={onInputChange}
        stateIdFieldName="paymentStatusId"
        setFormState={setFormState}
        prevStateId={
          prevFormState.current?.paymentStatusId ?? EstadoPagoEnum.GENERADO
        }
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
      >
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <PaymentForm
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            onBooleanChangeClick={onBooleanChangeClick}
            onNumberChange={onNumberChange}
            setRows={setRows}
          />
          <DetallePago
            rows={rows}
            setRows={setRows}
            createMode={createMode}
            editMode={editMode}
            formState={formState}
            rowModesModel={rowModesModel}
            setRowModesModel={setRowModesModel}
          />
          <PaymentData
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onAutocompleteChange={onAutocompleteChange}
            onGenericChange={onGenericChange}
            onInputChange={onInputChange}
            onBooleanChangeClick={onBooleanChangeClick}
            error={error}
            setError={setError}
          />
          <SubmitButtons
            createMode={createMode}
            editMode={editMode}
            handleCancel={handleCancel}
            isEditable={isEditable}
            thereIsChanges={thereIsChanges}
            setDialogMessage={setDialogMessage}
            setIsAnulation={setIsAnulation}
            setOpenDialogAlert={setOpenDialogAlert}
            enablePaymentAnulation={letAnulate}
            formState={formState}
            setFormState={setFormState}
            rows={rows}
            setEditMode={setEditMode}
            setTitle={setTitle}
          />
        </form>
      </CardLayout>
    </>
  );
};
