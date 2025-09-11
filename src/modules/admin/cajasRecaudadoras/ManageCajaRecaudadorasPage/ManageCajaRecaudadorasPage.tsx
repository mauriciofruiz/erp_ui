'use client';
import { CajaRecaudadoraEnum, DocumentTypeEnum, PathEnum } from '@/enums';
import {
  FormState,
  useAccessDocument,
  useAccountAsync,
  useAllowGlobal,
  useCajaAsync,
  useForm,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { AccountType, CajaGetType, CajaPostType } from '@/types';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import { isEqual } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { CajaRecaudadoraButtons } from './components/CajaRecaudadoraButtons';
import { CajaRecaudadoraForm } from './components/CajaRecaudadoraForm';

export type ManageCajaRecaudadorasPageProps = {
  // types...
};

const initialFormState: CajaPostType = {
  cashBoxId: null,
  accountId: null,
  branchId: null,
  cashBoxName: '',
  cashBoxNumber: 0,
  cashBoxInvoiceSeq: 0,
  cashBoxGuideSeq: 0,
  cashBoxNcSeq: 0,
  cashBoxNdSeq: 0,
  cashBoxRetSeq: 0,
  cashBoxState: true,
  cashBoxLiquidationSeq: 0,
};

export const ManageCajaRecaudadorasPage: React.FC<
  ManageCajaRecaudadorasPageProps
> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevFormState = useRef<any | undefined>(undefined);
  const { navigateBetweenDocuments } = useAllowGlobal();
  const [title, setTitle] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  const { closeDocument, openDocument } = useAccessDocument();
  const [isEditable, setIsEditable] = useState(true);
  const { fetchSaveCaja, fetchUpdateCaja, fetchCajaById } = useCajaAsync();
  const requestId =
    location && location.state ? location.state.requestId : undefined;
  const { sucursales } = useSelector((state: RootState) => state.common);
  const [cuentaContPasi, setCuentaContPasiList] = useState<AccountType | null>(
    null
  );

  const setHeader = (formState: FormState): CajaPostType => {
    return {
      ...(formState as CajaPostType),
    };
  };

  const {
    onInputChange,
    onAutocompleteChange,
    setFormState,
    formState,
    onInputJustNumber,
    onBooleanChangeClick,
  } = useForm({ ...initialFormState });

  const { fetchAccountByNumber } = useAccountAsync();

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
                documentType: DocumentTypeEnum.CAJA,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.CAJA + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.CAJA,
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
                documentType: DocumentTypeEnum.CAJA,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.CAJA + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.CAJA,
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
        documentType: DocumentTypeEnum.CAJA,
      });
    }
    navigate(PathEnum.CAJA);
  };

  useEffect(() => {
    if (!requestId) {
      setCreateMode(true);
      setTitle('Nueva Caja');
      setIsEditable(true);
    } else {
      setCreateMode(false);
      setEditMode(false);
      setTitle('Caja (Modo Lectura) - N° ' + requestId);
      const setForm = async () => {
        const response = await fetchCajaById(requestId);
        if (response) {
          const dto = response as CajaGetType;
          const newFormState = {
            ...dto,
          };
          setFormState(newFormState);
          prevFormState.current = newFormState;
        }
      };
      setForm();
    }
  }, [requestId]);

  const thereIsChanges = useMemo(() => {
    return !isEqual(prevFormState.current, formState);
  }, [formState]);

  const validateForm = () => {
    let isValid = true;

    if (formState.branchId === null) {
      enqueueSnackbar('El campo Sucursal es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.cashBoxName === '') {
      enqueueSnackbar('El campo Nombre es Requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.accountId === null) {
      enqueueSnackbar('El campo Cuenta es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    return isValid;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    const caja = setHeader(formState);

    const response = requestId
      ? await fetchUpdateCaja(requestId, caja)
      : await fetchSaveCaja(caja);
    if (
      !response ||
      (response && (response as ServerResponseType).status === 400) ||
      (response && (response as ServerResponseType).status === 404) ||
      (response && (response as ServerResponseType).status === 500)
    ) {
      enqueueSnackbar(`Error al guardar la caja`, {
        variant: 'error',
      });
      return;
    }
    enqueueSnackbar(`La caja se guardo correctamente`, {
      variant: 'success',
    });
    handleCancel();
  };

  useEffect(() => {
    const getCuentaContable = async () => {
      fetchAccountByNumber(CajaRecaudadoraEnum.CUENTA_RECAUDACION_VENTAS).then(
        (response) => {
          if (response) setCuentaContPasiList(response[0]);
        }
      );
    };
    getCuentaContable();
  }, []);

  useEffect(() => {
    if (cuentaContPasi) {
      setFormState({
        ...formState,
        accountId: cuentaContPasi['accountId'],
      });
    }
  }, [cuentaContPasi]);

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
          <CajaRecaudadoraForm
            formState={formState}
            createMode={createMode}
            editMode={editMode}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            onBooleanChangeClick={onBooleanChangeClick}
            onInputJustNumber={onInputJustNumber}
            sucursales={sucursales}
            cuentaContPasi={cuentaContPasi}
          />
          <CajaRecaudadoraButtons
            createMode={createMode}
            handleCancel={handleCancel}
            isEditable={isEditable}
            editMode={editMode}
            thereIsChanges={thereIsChanges}
            formState={formState}
            setFormState={setFormState}
            setEditMode={setEditMode}
            setTitle={setTitle}
          />
        </form>
      </CardLayout>
    </>
  );
};
