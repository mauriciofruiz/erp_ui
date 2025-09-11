'use client';
import {
  CuentaContableEnum,
  DocumentTypeEnum,
  PathEnum,
  TipoNotaCreditoEnum,
  TitlesEnum,
} from '@/enums';
import {
  FormState,
  useAccountAsync,
  useCobroAsync,
  useCommonManage,
  useForm,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { Grid } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { CobrosClientesForm } from './components/CobrosClientesForm';
import { AccountType, CobroGetType } from '@/types';
import { SubmitButtons } from './components/SubmitButtons';
import { CobroClientesDetails } from './components/CobrosClientesDetails';

export type CobrosClientesManageProps = {
  // types...
};

const initialFormState: FormState = {
  idCobro: null,
  clientId: null,
  clientIdentification: null,
  clientName: null,
  cashId: null,
  cashName: null,
  status: false,
  creationUserId: null,
  creationUserName: null,
  amount: null,
  entryId: null,
  paymentDetails: [],
  crosesDetails: [],
};

export const CobrosClientesManage: React.FC<
  CobrosClientesManageProps
> = ({}) => {
  const { fetchCobroById } = useCobroAsync();

  const { setFormState, formState, onAutocompleteChange, onGenericChange } =
    useForm(initialFormState);

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
    setOpenDialogAlert,
    handleCommonCancel,
    stopEnterEvent,
    rows,
    setRows,
    setIsAnulation,
    enabledAnulation,
    setDialogMessage,
    isEditable,
    thereIsChanges,
    prevFormState,
    user,
  } = useCommonManage(formState);

  // const cobroClienteIdOpened = location?.state?.cobroClienteIdOpened;

  // const documentId = useMemo(() => {
  //   if (!cobroClienteIdOpened) return null;
  //   const id = cobroClienteIdOpened;

  //   return id || null;
  // }, [cobroClienteIdOpened]);

  const documentId = useMemo(() => {
    const state =
      location.state || JSON.parse(localStorage.getItem('state') || '{}');
    const documentId = state.cobroClienteIdOpened;
    if (!documentId) return null;
    const [id, type] = documentId.split('-');
    const isValidType = Number(type) === DocumentTypeEnum.COBRO;

    return isValidType ? id : null;
  }, [location.state]);

  const { fetchAccountByNumber } = useAccountAsync();

  const [cuentaList, setCuentaList] = useState<AccountType[]>([]);

  // ?  *************************** useEffect INITIALIZATION ***************************
  useEffect(() => {
    if (!documentId) {
      setCreateMode(false);
      setTitle(TitlesEnum.COBROS_CLIENTES_LECTURA);
      setIsEditable(false);
      setFormState({
        ...initialFormState,
        branchId: user?.branchId,
      });
    } else {
      setCreateMode(false);
      setEditMode(false);
      const setFormAndRows = async () => {
        const response = await fetchCobroById(documentId);
        if (response) {
          const dto = response as CobroGetType;
          const newFormState = { ...dto };
          setFormState(newFormState);
          prevFormState.current = newFormState;

          setTitle(TitlesEnum.COBROS_CLIENTES_LECTURA + newFormState.idCobro);
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

  const onSubmit = async () => {};

  const handleCancel = async () => {
    handleCommonCancel(PathEnum.COBRO, documentId, DocumentTypeEnum.COBRO);
  };

  return (
    <>
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
      >
        <form onSubmit={onSubmit} onKeyDown={stopEnterEvent}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <CobrosClientesForm
              formState={formState}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              onGenericChange={onGenericChange}
              setFormState={setFormState}
              setRows={setRows}
              cuentaList={cuentaList}
            />
            <CobroClientesDetails formState={formState} styles={styles} />
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
