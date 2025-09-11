'use client';
import {
  ComprobanteTypeEnum,
  CuentaContableEnum,
  DocumentTypeEnum,
  EstadoDocumentoEnum,
  FormaPagoEnum,
  ParametersEnum,
  PathEnum,
  TipoNotaCreditoEnum,
  TitlesEnum,
} from '@/enums';
import {
  FormState,
  useAccountAsync,
  useAllowVentas,
  useCommonManage,
  useForm,
  useNotaCreditoCAsync,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import { Grid } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { NotaCreditoForm } from './components/NotaCreditoForm';
import { NotaCreditoDetails } from './components/NotaCreditoDetails';
import {
  AccountType,
  ImpuestoDocumentoInterface,
  NCVentaDetallePost,
  NotaCreditoGetType,
  NotaCreditoPostType,
  NotaCreditoVentaPost,
} from '@/types';
import { SubmitButtons } from './components/SubmitButtons';
import { randomId } from '@mui/x-data-grid-generator';
import { setCurrencyNumber } from '@/functions';

export type NotaCreditoManageProps = {
  // types...
};

const initialFormState: FormState = {
  creditNoteId: null,
  ncTypeId: TipoNotaCreditoEnum.DEVOLUCION,
  creditNoteNumber: '',
  authorizationNumber: '',
  invoiceNumber: '',
  invoiceValue: 0,
  invoiceBalance: 0,
  invoiceIssueDate: new Date().toISOString(),
  issueDate: new Date().toISOString(),
  stateId: EstadoDocumentoEnum.GENERADO,
  clientId: null,
  paymentMethodId: FormaPagoEnum.EFECTIVO,
  invoiceId: null,
  hasCredit: false,
  observation: ParametersEnum.MENSAJE_NC_GENERICO,
  paymentMethodDiscount: 0,
  paymentMethodDiscountPercentage: 0,
  previousNcValue: 0,
};

export const NotaCreditoManage: React.FC<NotaCreditoManageProps> = ({}) => {
  const {
    onInputChange,
    setFormState,
    formState,
    onAutocompleteChange,
    onGenericChange,
  } = useForm(initialFormState);

  const {
    location,
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

  const { fetchSave, fetchUpdate, fetchById } = useNotaCreditoCAsync();

  const { enableEditingNotaCredito, enableAnulationNotaCredito } =
    useAllowVentas();

  // const ncClienteIdOpened = location?.state?.ncClienteIdOpened;

  // const documentId = useMemo(() => {
  //   if (!ncClienteIdOpened) return null;

  //   const [id, type] = ncClienteIdOpened.split('-');
  //   const isValidType = type === ComprobanteTypeEnum.NOTA_DE_CREDITO;

  //   return isValidType ? id : null;
  // }, [ncClienteIdOpened]);

  const documentId = useMemo(() => {
    const state =
      location.state || JSON.parse(localStorage.getItem('state') || '{}');
    const documentId = state.ncClienteIdOpened;
    if (!documentId) return null;
    const [id, type] = documentId.split('-');
    const isValidType = type === ComprobanteTypeEnum.NOTA_DE_CREDITO;

    return isValidType ? id : null;
  }, [location.state]);

  const { fetchAccountByNumber } = useAccountAsync();

  const [cuentaList, setCuentaList] = useState<AccountType[]>([]);

  const [taxes, setTaxes] = useState<ImpuestoDocumentoInterface[]>([]);

  // ?  *************************** useEffect INITIALIZATION ***************************
  useEffect(() => {
    if (!documentId) {
      setCreateMode(true);
      setTitle(TitlesEnum.NUEVA_NOTA_CREDITO);
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
          const dto = response as NotaCreditoGetType;
          const newFormState = dto.header;
          setFormState(newFormState);
          prevFormState.current = newFormState;
          const enableEditing = enableEditingNotaCredito(
            newFormState.issueDate ?? new Date(),
            newFormState.stateId,
            newFormState.creationUserId
          );
          setTitle(
            TitlesEnum.NOTA_CREDITO_LECTURA + newFormState.creditNoteNumber
          );
          setIsEditable(enableEditing);
          const enableAnulacion = enableAnulationNotaCredito(
            newFormState.stateId,
            false,
            newFormState.issueDate ?? new Date()
          );
          setEnabledAnulation(enableAnulacion);
          const temporalRows = dto.details.map((row) => {
            if (newFormState.ncTypeId === TipoNotaCreditoEnum.DEVOLUCION) {
              return {
                ...row,
                id: randomId(),
                invoiceQuantity: row.availableQuantity,
                totalAfterDiscount: row.taxeableBase,
              };
            } else {
              return {
                ...row,
                id: randomId(),
                accountId: row.accountId,
                totalAfterDiscount: row.totalPrice,
              };
            }
          });
          setRows(temporalRows);
          prevRows.current = temporalRows;
          setTaxes(dto.taxes);
        }
      };
      setFormAndRows();
    }
  }, [documentId]);

  useEffect(() => {
    const fetchData = async (param: string) => {
      fetchAccountByNumber(param).then((response) => {
        if (response) {
          setCuentaList(response as AccountType[]);
        }
      });
    };
    setCuentaList([]);
    if (formState.ncTypeId === TipoNotaCreditoEnum.DEVOLUCION) return;
    if (formState.ncTypeId === TipoNotaCreditoEnum.DESCUENTO) {
      fetchData(CuentaContableEnum.DESCUENTO_EN_VENTAS);
      return;
    }
  }, [formState.ncTypeId]);

  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const validateForm = (): boolean => {
    if (formState.cashId === null && user?.cashId === null) {
      enqueueSnackbar('No existe una caja para asignar a este documento', {
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
    if (rows.length === 0) {
      enqueueSnackbar('Debe agregar al menos un producto', {
        variant: 'error',
      });
      return false;
    } else {
      if (formState.ncTypeId === TipoNotaCreditoEnum.DEVOLUCION) {
        const devolucion = rows.find((row) => row.returnedQuantity > 0);
        if (!devolucion) {
          enqueueSnackbar('Debe agregar al menos un producto a devolver', {
            variant: 'error',
          });
          return false;
        }
      } else if (formState.ncTypeId === TipoNotaCreditoEnum.DESCUENTO) {
        const allRowsHasValorNc = rows.every((row) => row.totalPrice > 0);
        if (!allRowsHasValorNc) {
          enqueueSnackbar('Debe agregar un valor en los detalles', {
            variant: 'error',
          });
          return false;
        }
      } else {
        const allRowsHasAccountId = rows.every((row) => row.accountId);
        if (!allRowsHasAccountId) {
          enqueueSnackbar('Debe seleccionar una cuenta contable', {
            variant: 'error',
          });
          return false;
        }

        const allRowsHasValorNc = rows.every((row) => row.totalPrice > 0);
        if (!allRowsHasValorNc) {
          enqueueSnackbar('Debe agregar un valor en los detalles', {
            variant: 'error',
          });
          return false;
        }
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

    const details: NCVentaDetallePost[] = rows
      .filter(
        (row) =>
          row.returnedQuantity > 0 &&
          row.totalPrice > 0 &&
          row.id !== ParametersEnum.ID_ROW_TOTAL
      )
      .map((row) => {
        return {
          accountId: row.accountId,
          accountName: row.accountName,
          accountNumber: row.accountNumber,
          availableQuantity: row.availableQuantity,
          branchId: row.branchId,
          cashId: row.cashId,
          clientId: row.clientId,
          creditNoteId: row.creditNoteId,
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
        };
      });

    const header: NotaCreditoVentaPost = {
      authorizationNumber: formState.authorizationNumber,
      branchId: formState.branchId,
      cancellationReason: formState.cancellationReason,
      clientId: formState.clientId,
      creditNoteId: formState.creditNoteId,
      creditNoteNumber: formState.creditNoteNumber,
      entryId: formState.entryId,
      invoiceId: formState.invoiceId,
      issueDate: formState.issueDate,
      ncTypeId: formState.ncTypeId,
      observation: formState.observation,
      paymentMethodId: formState.paymentMethodId,
      stateId: formState.stateId,
      subtotal: formState.subtotal,
      subtotalNoTax: formState.subtotalNoTax,
      total: formState.total,
      taxValue: formState.taxValue,
      voucherTypeCode: ComprobanteTypeEnum.NOTA_DE_CREDITO,
      paymentMethodDiscountPercentage:
        formState.paymentMethodDiscountPercentage,
      paymentMethodDiscount: formState.paymentMethodDiscount,
      cashId: formState.cashId, // se setea en el backend
    };

    const data: NotaCreditoPostType = {
      details,
      header,
      taxes,
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
      PathEnum.NOTA_CREDITO_CLIENTE,
      documentId,
      DocumentTypeEnum.NOTA_CREDITO_VENTA
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
            <NotaCreditoForm
              formState={formState}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              onGenericChange={onGenericChange}
              setFormState={setFormState}
              setRows={setRows}
              cuentaList={cuentaList}
              onInputChange={onInputChange}
            />
            <NotaCreditoDetails
              formState={formState}
              setFormState={setFormState}
              createMode={createMode}
              editMode={editMode}
              rows={rows}
              setRows={setRows}
              cuentaList={cuentaList}
              taxes={taxes}
              setTaxes={setTaxes}
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
