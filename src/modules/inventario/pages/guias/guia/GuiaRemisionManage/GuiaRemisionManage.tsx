'use client';
import {
  ComprobanteTypeEnum,
  DocumentTypeEnum,
  EstadoDocumentoEnum,
  EstadoEntregaEnum,
  ParametersEnum,
  PathEnum,
  TitlesEnum,
} from '@/enums';
import {
  FormState,
  useAllowAlmacenamiento,
  useCommonManage,
  useForm,
  useGuiaRemisionAsync,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import { RootState } from '@/store';
import { Grid } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { GuiaRemisionForm } from './components/GuiaRemisionForm';
import {
  DetailGuiaRemisionPostType,
  GuiaRemisionGetType,
  GuiaRemisionPostType,
  RelatedDocumentsGuiaType,
} from '@/types';
import { randomId } from '@mui/x-data-grid-generator';
import { GuiaRemisionDetails } from './components/GuiaRemisionDetails';
import { TransportInfo } from './components/TransportInfo';
import { SubmitButtons } from './components/SubmitButtons';
import { enqueueSnackbar } from 'notistack';
import { GridValidRowModel } from '@mui/x-data-grid';

export type GuiaRemisionManageProps = {
  // types...
};

const initialFormState: FormState = {
  isTransfer: true,
  branchId: null,
  issueDate: new Date().toISOString(),
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  deliveryStateId: EstadoEntregaEnum.DEPACHO_TOTAL,
  documentStatusId: EstadoDocumentoEnum.GENERADO,
  clientId: null,
  transport: null,
  address: '',
  relatedDocumentId: null,
  relatedDocumentId2: null,
};

export const GuiaRemisionManage: React.FC<GuiaRemisionManageProps> = ({}) => {
  const {
    onInputChange,
    setFormState,
    formState,
    onAutocompleteChange,
    onGenericChange,
  } = useForm(initialFormState);

  const {
    location,
    styles,
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
  } = useCommonManage(formState);

  const { enableEditingGuia, enableAnulationGuia } = useAllowAlmacenamiento();

  const guiaIdOpened = location?.state?.guiaIdOpened;

  const documentId = useMemo(() => {
    if (!guiaIdOpened) return null;

    const [id, type] = guiaIdOpened.split('-');
    const isValidType = type === ComprobanteTypeEnum.GUIAS_DE_REMISION;

    return isValidType ? id : null;
  }, [guiaIdOpened]);

  const { user } = useSelector((state: RootState) => state.auth);

  const { fetchDetailRelatedDocuments, fetchSave, fetchUpdate, fetchById } =
    useGuiaRemisionAsync();

  const [selectedDocument, setSelectedDocument] =
    useState<RelatedDocumentsGuiaType | null>(null);

  // ?  *************************** useEffect INITIALIZATION ***************************
  useEffect(() => {
    if (!documentId) {
      setCreateMode(true);
      setTitle(TitlesEnum.NUEVA_GUIA_REMISION);
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
        const response = await fetchById(documentId);
        if (response) {
          const dto = response as GuiaRemisionGetType;
          const newFormState = { ...dto };
          setFormState(newFormState);
          prevFormState.current = newFormState;
          const enableEditing = enableEditingGuia(
            dto.issueDate ?? new Date(),
            dto.documentStatusId,
            dto.creationUserId
          );
          const titulo =
            newFormState.documentNumber !== null
              ? newFormState.documentNumber
              : '';
          setTitle(TitlesEnum.GUIA_REMISION_LECTURA + titulo);
          setIsEditable(enableEditing);
          const enableAnulacion = enableAnulationGuia(
            dto.documentStatusId,
            false,
            dto.issueDate ?? new Date()
          );
          setEnabledAnulation(enableAnulacion);
          const temporalRows = dto.details.map((row) => ({
            ...row,
            id: randomId(),
          }));
          setRows(temporalRows);
          prevRows.current = temporalRows;
        }
      };
      setFormAndRows();
    }
  }, [documentId]);

  useEffect(() => {
    if (selectedDocument === null) return;

    setFormState((prev: FormState) => ({
      ...prev,
      clientId: selectedDocument.clientId,
      transport: null,
      address: '',
      relatedDocumentId: formState.isTransfer
        ? null
        : selectedDocument.documentId,
      relatedDocumentId2: formState.isTransfer
        ? selectedDocument.documentId
        : null,
    }));

    fetchDetailRelatedDocuments(
      selectedDocument.documentId,
      formState.isTransfer
    ).then((data) => {
      if (!data) return;
      const temporalRows = (data as DetailGuiaRemisionPostType[]).map(
        (row) => ({
          ...row,
          id: randomId(),
          documentId: null,
          documentDetailId: null,
          externalDocumentDetailId: row.documentDetailId,
        })
      );
      setRows(temporalRows);
    });
  }, [selectedDocument]);

  const validateForm = (validRows: readonly GridValidRowModel[]) => {
    if (formState.documentStatusId === EstadoDocumentoEnum.ANULADO) return true;

    const thereAreRows = validRows.length > 0;

    if (!thereAreRows) {
      enqueueSnackbar(ParametersEnum.ERROR_SIN_DETALLE, {
        variant: 'error',
      });
      return false;
    }
    if (
      !formState.transport ||
      formState.transport.contactId === '' ||
      formState.transport.contactName === '' ||
      formState.transport.licensePlate === ''
    ) {
      enqueueSnackbar(ParametersEnum.ERROR_TRANSPORTISTA_INCOMPLETO, {
        variant: 'error',
      });
      return false;
    }
    if (formState.address === '') {
      enqueueSnackbar(ParametersEnum.ERROR_DIRECCION_VACIA, {
        variant: 'error',
      });
      return false;
    }
    if (formState.endDate === '' || formState.endDate === null) {
      enqueueSnackbar(ParametersEnum.ERROR_FECHA_VACIA, {
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

    const validRows = rows.filter(
      (row) =>
        row.id !== ParametersEnum.ID_ROW_TOTAL && row.quantityToDispatch > 0
    );

    if (!validateForm(validRows)) {
      setFormState({
        ...formState,
        documentStatusId: prevFormState.current
          ? prevFormState.current.documentStatusId
          : EstadoDocumentoEnum.GENERADO,
      });
      return;
    }

    const details: DetailGuiaRemisionPostType[] = validRows.map((row) => ({
      documentId: row.documentId,
      documentDetailId: row.documentDetailId,
      productId: row.productId,
      productCode: row.productCode,
      productName: row.productName,
      unitMeasureId: row.unitMeasureId,
      unitMeasureName: row.unitMeasureName,
      quantity: row.quantity,
      quantityToDispatch: row.quantityToDispatch,
      quantityPending: row.quantityPending,
      quantityDispatched: row.quantityDispatched,
      externalDocumentDetailId: row.externalDocumentDetailId,
    }));

    const body: GuiaRemisionPostType = {
      documentId: formState.documentId,
      branchId: formState.branchId,
      issueDate: formState.issueDate,
      documentNumber: formState.documentNumber,
      accessKey: formState.accessKey,
      documentStatusId: formState.documentStatusId,
      clientId: formState.clientId,
      transport: formState.transport,
      startDate: formState.startDate,
      endDate: formState.endDate,
      address: formState.address,
      relatedDocumentId: formState.relatedDocumentId,
      relatedDocumentId2: formState.relatedDocumentId2,
      cancellationDate: formState.cancellationDate,
      cancellationReason: formState.cancellationReason,
      deliveryStateId: formState.deliveryStateId,
      details,
    };

    if (createMode) {
      fetchSave(body).then(() => {
        handleCancel();
      });
    } else {
      fetchUpdate(body, documentId).then(() => {
        handleCancel();
      });
    }
  };

  const handleCancel = async () => {
    handleCommonCancel(
      PathEnum.GUIA_REMISION,
      documentId,
      DocumentTypeEnum.GUIA
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
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
      >
        <form onSubmit={onSubmit} onKeyDown={stopEnterEvent}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <GuiaRemisionForm
              formState={formState}
              styles={styles}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              onGenericChange={onGenericChange}
              setSelectedDocument={setSelectedDocument}
            />
            <GuiaRemisionDetails
              formState={formState}
              setFormState={setFormState}
              createMode={createMode}
              editMode={editMode}
              rows={rows}
              setRows={setRows}
            />
            <TransportInfo
              formState={formState}
              onInputChange={onInputChange}
              onAutocompleteChange={onAutocompleteChange}
              setFormState={setFormState}
              onGenericChange={onGenericChange}
              createMode={createMode}
              editMode={editMode}
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
