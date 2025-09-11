import {
  ComprobanteTypeEnum,
  DocumentTypeEnum,
  EstadoDocumentoEnum,
  ParametersEnum,
  PathEnum,
  TipoNotaCreditoEnum,
  TitlesEnum,
} from '@/enums';
import {
  FormState,
  useForm,
  useCommonManage,
  useNotaDebitoCAsync,
  useAllowVentas,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules';
import {
  NotaDebitoClienteGet,
  DetalleNDVentaPost,
  NotaDebitoClientePostType,
  NotaDebitoClientePost,
} from '@/types';
import { Grid } from '@mui/material';
import { randomId } from '@mui/x-data-grid-generator';
import { useEffect, useMemo } from 'react';
import { NotaDebitoForm } from './components/NotaDebitoForm';
import { NotaDebitoDetails } from './components/NotaDebitoDetails';
import { SubmitButtons } from './components/SubmitButtons';
import { setCurrencyNumber } from '@/functions';

export type NotaDebitoManageProps = {
  // types...
};

const initialFormState: FormState = {
  debitNoteId: null,
  ncTypeId: null,
  debitNoteNumber: '',
  authorizationNumber: '',
  invoiceNumber: '',
  invoiceValue: 0,
  invoiceBalance: 0,
  invoiceIssueDate: new Date().toISOString(),
  issueDate: new Date().toISOString(),
  stateId: EstadoDocumentoEnum.GENERADO,
  clientId: null,
  ndTypeId: TipoNotaCreditoEnum.CONTABLE,
  paymentMethodId: null,
  invoiceId: null,
  hasCredit: false,
  observation: ParametersEnum.MENSAJE_ND_GENERICO,
  paymentMethodDiscount: 0,
  paymentMethodDiscountPercentage: 0,
  previousNdValue: 0,
  vat: 0,
};

export const NotaDebitoManage: React.FC<NotaDebitoManageProps> = ({}) => {
  const {
    onInputChange,
    setFormState,
    formState,
    onAutocompleteChange,
    onGenericChange,
  } = useForm(initialFormState);

  const {
    location,
    // styles,
    title,
    setTitle,
    editMode,
    setEditMode,
    createMode,
    setCreateMode,
    setIsEditable,
    isAnulation,
    setOpenDialogAlert,
    openDialogAlert,
    dialogMessage,
    handleCommonCancel,
    stopEnterEvent,
    rows,
    setRows,
    setIsAnulation,
    enabledAnulation,
    setEnabledAnulation,
    setDialogMessage,
    isEditable,
    thereIsChanges,
    prevFormState,
    prevRows,
    enqueueSnackbar,
    user,
  } = useCommonManage(formState);

  const { fetchSave, fetchUpdate, fetchById } = useNotaDebitoCAsync();

  const { enableEditingNotaCredito, enableAnulationNotaCredito } =
    useAllowVentas();

  // const ncClienteIdOpened = location?.state?.ndClienteIdOpened;

  // const documentId = useMemo(() => {
  //   if (!ncClienteIdOpened) return null;

  //   const [id, type] = ncClienteIdOpened.split('-');
  //   const isValidType = type === ComprobanteTypeEnum.NOTA_DE_DEBITO;

  //   return isValidType ? id : null;
  // }, [ncClienteIdOpened]);

  const documentId = useMemo(() => {
    const state =
      location.state || JSON.parse(localStorage.getItem('state') || '{}');
    const documentId = state.ndClienteIdOpened;
    if (!documentId) return null;
    const [id, type] = documentId.split('-');
    const isValidType = type === ComprobanteTypeEnum.NOTA_DE_DEBITO;

    return isValidType ? id : null;
  }, [location.state]);

  // ?  *************************** useEffect INITIALIZATION ***************************
  useEffect(() => {
    if (!documentId) {
      setCreateMode(true);
      setTitle(TitlesEnum.NUEVA_NOTA_DEBITO);
      setIsEditable(true);
      setFormState({
        ...initialFormState,
        branchId: user?.branchId,
      });
    } else {
      setCreateMode(false);
      setEditMode(false);
      const setFormAndRows = async () => {
        const response = await fetchById(documentId);
        if (response) {
          const dto = response as NotaDebitoClienteGet;
          const newFormState = dto;
          setFormState(newFormState);
          prevFormState.current = newFormState;
          const enableEditing = enableEditingNotaCredito(
            newFormState.issueDate ?? new Date(),
            newFormState.stateId,
            newFormState.creationUserId
          );
          setTitle(
            TitlesEnum.NOTA_DEBITO_LECTURA + newFormState.debitNoteNumber
          );
          setIsEditable(enableEditing);
          const enableAnulacion = enableAnulationNotaCredito(
            newFormState.stateId,
            false,
            newFormState.issueDate ?? new Date()
          );
          setEnabledAnulation(enableAnulacion);
          const temporalRows = dto.debitNoteDetails.map((row) => {
            return {
              ...row,
              id: randomId(),
              accountId: row.accountId,
              totalAfterDiscount: row.totalPrice,
            };
          });
          setRows(temporalRows);
          prevRows.current = temporalRows;
        }
      };
      setFormAndRows();
    }
  }, [documentId]);

  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const validateForm = (): boolean => {
    if (user?.cashId === null) {
      enqueueSnackbar('No se ha asignado una caja a este usuario', {
        variant: 'error',
      });
      return false;
    }
    if (!formState.clientId) {
      enqueueSnackbar('Debe seleccionar un cliente', { variant: 'error' });
      return false;
    }
    if (!formState.invoiceId) {
      enqueueSnackbar('Debe seleccionar una factura', { variant: 'error' });
      return false;
    }
    if (createMode || editMode) {
      const maxValueNd = formState.previousNdValue + formState.total;

      if (maxValueNd > formState.invoiceValue) {
        enqueueSnackbar(
          `El monto de la nota de débito no puede ser mayor al saldo de la factura. Saldo de la factura: ${setCurrencyNumber(
            formState.invoiceValue
          )}`,
          {
            variant: 'error',
          }
        );
        return false;
      }
    }
    if (rows.length === 0) {
      enqueueSnackbar('Debe agregar al menos una cuenta', {
        variant: 'error',
      });
      return false;
    } else {
      const allRowsHasAccountId = rows.every((row) => row.accountId);
      if (!allRowsHasAccountId) {
        enqueueSnackbar('Debe seleccionar una cuenta contable', {
          variant: 'error',
        });
        return false;
      }

      const allRowsHasValorNd = rows.every((row) => row.totalPrice > 0);
      if (!allRowsHasValorNd) {
        enqueueSnackbar('Debe agregar un valor en los detalles', {
          variant: 'error',
        });
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      setFormState({
        ...formState,
        stateId: prevFormState.current
          ? prevFormState.current.stateId
          : EstadoDocumentoEnum.GENERADO,
      });
      return;
    }

    const details: DetalleNDVentaPost[] = rows
      .filter(
        (row) => row.totalPrice > 0 && row.id !== ParametersEnum.ID_ROW_TOTAL
      )
      .map((row) => {
        return {
          debitNoteId: row.debitNoteId,
          accountId: row.accountId,
          availableQuantity: row.availableQuantity,
          branchId: row.branchId,
          cashId: row.cashId,
          clientId: row.clientId,
          detailId: row.detailId,
          detailTypeId: row.detailTypeId,
          paymentMethodDiscountPercentage: row.paymentMethodDiscountPercentage,
          paymentMethodDiscount: row.discountValue,
          employeeId: row.employeeId,
          groupId: row.groupId,
          hasIva: row.hasIva,
          importOpeningId: row.importOpeningId,
          invoiceAccountId: row.invoiceAccountId,
          invoiceDetailId: row.invoiceDetailId,
          invoiceTotalPrice: row.invoiceTotalPrice,
          productId: row.productId,
          projectId: row.projectId,
          providerId: row.providerId,
          quantity: row.quantity,
          returnedQuantity: row.returnedQuantity,
          taxRateId: row.taxRateId,
          taxValue: row.taxValue,
          totalPrice: row.totalPrice,
          unitMeasureId: row.unitMeasureId,
          unitPrice: row.unitPrice,
          taxeableBase: row.totalAfterDiscount,
          discountValue: row.discountValue,
        };
      });

    const header: NotaDebitoClientePost = {
      debitNoteId: formState.debitNoteId,
      debitNoteNumber: formState.debitNoteNumber,
      entryId: formState.entryId,
      branchId: formState.branchId,
      issueDate: formState.issueDate,
      authorizationNumber: formState.authorizationNumber,
      paymentMethodId: formState.paymentMethodId,
      invoiceId: formState.invoiceId,
      clientId: formState.clientId,
      cancellationReason: formState.cancellationReason,
      observation: formState.observation,
      stateId: formState.stateId,
      ndTypeId: formState.ndTypeId,
      subtotal: formState.subtotal,
      subtotalNoTax: formState.subtotalNoTax,
      vat: formState.vat,
      total: formState.total,
      paymentTypeId: formState.paymentMethodId,
      voucherTypeCode: ComprobanteTypeEnum.NOTA_DE_DEBITO,
      debitNoteDetails: details,
      totalDiscount: formState.paymentMethodDiscount,
      hasCredit: formState.hasCredit,
    };

    const data: NotaDebitoClientePostType = {
      header,
      taxes: [],
    };

    if (createMode) {
      fetchSave(data).then(() => {
        handleCancel();
      });
    } else {
      fetchUpdate(data, documentId).then(() => {
        handleCancel();
      });
    }
  };

  const handleCancel = async () => {
    handleCommonCancel(
      PathEnum.NOTA_DEBITO_CLIENTE,
      documentId,
      DocumentTypeEnum.NOTA_DEBITO_VENTA
    );
  };

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
        stateIdFieldName="stateId"
        setFormState={setFormState}
        prevStateId={
          prevFormState.current?.stateId ?? EstadoDocumentoEnum.GENERADO
        }
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
      >
        <form onSubmit={onSubmit} onKeyDown={stopEnterEvent}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <NotaDebitoForm
              formState={formState}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              onGenericChange={onGenericChange}
              setFormState={setFormState}
              setRows={setRows}
              onInputChange={onInputChange}
            />
            <NotaDebitoDetails
              formState={formState}
              setFormState={setFormState}
              createMode={createMode}
              editMode={editMode}
              rows={rows}
              setRows={setRows}
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
