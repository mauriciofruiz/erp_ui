'use client';
import {
  ComprobanteTypeEnum,
  DocumentTypeEnum,
  EstadoDocumentoEnum,
  ParametersEnum,
  PathEnum,
  TitlesEnum,
} from '@/enums';
import {
  FormState,
  useAllowVentas,
  useCommonManage,
  useForm,
  useRetencionAsync,
  useRetencionClienteAsync,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import { Divider, Grid, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { RetencionForm } from './components/RetencionForm';
import {
  RetencionDetailPostPutType,
  RetencionGeneralInterface,
  RetencionGetType,
  RetencionPostPutType,
} from '@/types';
import { RetencionDetails } from './components/RetencionDetails';
import { RetencionFormInfo } from './components/RetencionFormInfo';
import { SubmitButtons } from './components/SubmitButtons';
import { randomId } from '@mui/x-data-grid-generator';

type RetencionManageProps = {
  // types...
};

const initialFormState: FormState = {
  isPettyCash: false,
  stateId: EstadoDocumentoEnum.GENERADO,
  clientId: null,
  retentionNumber: '',
  retentionDate: new Date().toISOString(),
  autorizationNumber: '',
  invoiceId: null,
  value: 0,
  voucherTypeCode: ComprobanteTypeEnum.COMPROBANTE_DE_RETENCION,
  entryId: null,
  branchId: null,
  isValidNumber: true,
};

export const RetencionManage: React.FC<RetencionManageProps> = ({}) => {
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

  const { fetchSave, fetchUpdate, fetchById } = useRetencionClienteAsync();

  const { enableEditingRetention, enableAnulationRetention } = useAllowVentas();

  const { fetchAllIva, fetchAllSource } = useRetencionAsync();

  const [ivaListRetention, setIvaListRetention] = useState<
    RetencionGeneralInterface[]
  >([]);

  const [sourceListRetention, setSourceListRetention] = useState<
    RetencionGeneralInterface[]
  >([]);

  const [minDate, setMinDate] = useState(new Date().toISOString());

  const [maxDate, setMaxDate] = useState(new Date().toISOString());

  const documentId = useMemo(() => {
    const state =
      location.state || JSON.parse(localStorage.getItem('state') || '{}');
    const documentId = state.retencionIdOpened;
    if (!documentId) return null;
    const [id, type] = documentId.split('-');
    const isValidType = type === ComprobanteTypeEnum.COMPROBANTE_DE_RETENCION;

    return isValidType ? id : null;
  }, [location.state]);

  useEffect(() => {
    fetchAllIva().then((response) => {
      response ? setIvaListRetention(response) : setIvaListRetention([]);
    });
    fetchAllSource().then((response) => {
      response ? setSourceListRetention(response) : setSourceListRetention([]);
    });
  }, []);

  // ?  *************************** useEffect INITIALIZATION ***************************
  useEffect(() => {
    if (!documentId) {
      setCreateMode(true);
      setTitle(TitlesEnum.NUEVA_RETENCION_CLIENTE);
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
          const dto = response as RetencionGetType;
          const newFormState = dto;
          setFormState(newFormState);
          prevFormState.current = newFormState;
          const enableEditing = enableEditingRetention(
            newFormState.retentionDate ?? new Date()
          );
          setTitle(
            TitlesEnum.RETENCION_CLIENTE_LECTURA + newFormState.retentionNumber
          );
          setIsEditable(enableEditing);
          const enableAnulacion = enableAnulationRetention(
            newFormState.stateId,
            false,
            newFormState.retentionDate ?? new Date()
          );
          setEnabledAnulation(enableAnulacion);
          const temporalRows = dto.details.map((row) => {
            return {
              ...row,
              id: randomId(),
              retentionTypeId: row.taxId !== null ? row.taxId : row.sourceId,
            };
          });
          setRows(temporalRows);
          prevRows.current = temporalRows;
        }
      };
      setFormAndRows();
    }
  }, [documentId]);

  const validateForm = (body: RetencionPostPutType): boolean => {
    if (body.stateId === EstadoDocumentoEnum.ANULADO) return true;
    if (!formState.isValidNumber) {
      enqueueSnackbar('El número de retención ya existe', { variant: 'error' });
      return false;
    }
    if (!body.clientId) {
      enqueueSnackbar('Debe seleccionar un cliente', { variant: 'error' });
      return false;
    }
    if (!body.invoiceId) {
      enqueueSnackbar('Debe seleccionar una factura', { variant: 'error' });
      return false;
    }
    if (!body.retentionDate) {
      enqueueSnackbar('Debe seleccionar una fecha', { variant: 'error' });
      return false;
    }
    if (!body.autorizationNumber || body.autorizationNumber === '') {
      enqueueSnackbar('Debe ingresar un número de autorización', {
        variant: 'error',
      });
      return false;
    }
    if (!body.retentionNumber || body.retentionNumber === '') {
      enqueueSnackbar('Debe ingresar un número de retención', {
        variant: 'error',
      });
      return false;
    }
    if (!body.value) {
      enqueueSnackbar('Debe ingresar un valor', { variant: 'error' });
      return false;
    }
    if (!body.details.length) {
      enqueueSnackbar('Debe ingresar al menos un detalle', {
        variant: 'error',
      });
      return false;
    }

    const retentionDate = new Date(body.retentionDate).setHours(0, 0, 0, 0);
    const minRetentionDate = new Date(minDate).setHours(0, 0, 0, 0);

    if (retentionDate < minRetentionDate) {
      enqueueSnackbar(
        'La fecha de retención no puede ser menor a la fecha de la factura',
        {
          variant: 'error',
        }
      );
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

    const details: RetencionDetailPostPutType[] = rows
      .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
      .map((row) => {
        return {
          detailId: row.detailId,
          retentionId: row.retentionId,
          sourceId: row.sourceId,
          taxId: row.taxId,
          base: row.base,
          value: row.value,
        };
      });

    const body: RetencionPostPutType = {
      retentionId: formState.retentionId,
      retentionNumber: formState.retentionNumber,
      retentionDate: formState.retentionDate,
      autorizationNumber: formState.autorizationNumber,
      invoiceId: formState.invoiceId,
      stateId: formState.stateId,
      clientId: formState.clientId,
      value: formState.value,
      voucherTypeCode: formState.voucherTypeCode,
      entryId: formState.entryId,
      branchId: formState.branchId,
      isPettyCash: formState.isPettyCash,
      cancellationReason: formState.cancellationReason ?? null,
      details,
    };

    if (!validateForm(body)) {
      setFormState({
        ...formState,
        stateId: prevFormState.current
          ? prevFormState.current.stateId
          : EstadoDocumentoEnum.GENERADO,
      });
      return;
    }

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
      PathEnum.RETENCION_CLIENTE,
      documentId,
      DocumentTypeEnum.RETENCION_VENTA
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
            <RetencionForm
              formState={formState}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              onGenericChange={onGenericChange}
              setFormState={setFormState}
              setRows={setRows}
              ivaListRetention={ivaListRetention}
              sourceListRetention={sourceListRetention}
              setMinDate={setMinDate}
              setMaxDate={setMaxDate}
            />
          </Grid>

          {formState.invoiceId && (
            <>
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
                  Datos Informativos
                </Typography>
              </Divider>
              <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                <RetencionFormInfo
                  formState={formState}
                  createMode={createMode}
                  editMode={editMode}
                  onGenericChange={onGenericChange}
                  minDate={minDate}
                  maxDate={maxDate}
                />
                <RetencionDetails
                  formState={formState}
                  setFormState={setFormState}
                  createMode={createMode}
                  editMode={editMode}
                  rows={rows}
                  setRows={setRows}
                  ivaListRetention={ivaListRetention}
                  sourceListRetention={sourceListRetention}
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
            </>
          )}
        </form>
      </CardLayout>
    </>
  );
};
