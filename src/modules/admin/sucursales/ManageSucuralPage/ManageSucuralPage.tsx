'use client';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  FormState,
  useAccessDocument,
  useAllowGlobal,
  useBodegaAsync,
  useForm,
  useSucursalAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { BodegaGetInterface, SucursalPostType, SucursalType } from '@/types';
import { SkipNext, SkipPrevious } from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import { isEqual } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ManageSucursalForm } from './components/ManageSucursalForm';
import { GridRowsProp, GridValidRowModel } from '@mui/x-data-grid';
import { GridRowModesModel } from '@mui/x-data-grid';
import { SucursalButtons } from './components/SucursalButtons';
import { ServerResponseType } from '@/store';
import { randomId } from '@mui/x-data-grid-generator';

export type ManageSucuralPageProps = {
  // types...
};

const initialFormState: SucursalPostType = {
  address: '',
  branchCategoryId: '',
  branchId: null,
  cellphone: '',
  cityId: null,
  email: '',
  email2: '',
  isOutlet: false,
  mnemonic: 'a',
  name: '',
  phone: '',
  phone2: '',
  regionId: null,
  responsible: '',
  state: true,
  thermalPrinting: false,
  branchCode: '',
  wareHouseDetail: [],
};

export const ManageSucuralPage: React.FC<ManageSucuralPageProps> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevFormState = useRef<any | undefined>(undefined);
  const prevRows = useRef<any | undefined>(undefined);
  const { navigateBetweenDocuments } = useAllowGlobal();
  const [title, setTitle] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  const { closeDocument, openDocument } = useAccessDocument();
  const [isEditable, setIsEditable] = useState(true);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const { fetchSaveBranch, fetchUpdatebranch, fetchBranchById } =
    useSucursalAsync();

  const { fetchBySucursal } = useBodegaAsync();

  const requestId =
    location && location.state ? location.state.requestId : undefined;

  const setHeader = (formState: FormState): SucursalPostType => {
    const { nameTemp, cityTemp, ...restForm } = formState;
    return {
      ...(restForm as SucursalPostType),
    };
  };

  const setDetails = (
    rows: readonly GridValidRowModel[]
  ): BodegaGetInterface[] => {
    return rows.map((row) => {
      const {
        id,
        creationUserId,
        modificationDate,
        modificationUserId,
        registrationDate,
        ...restRow
      } = row;
      return {
        ...(restRow as BodegaGetInterface),
        warehouseSequence: row.warehouseSequence ? row.warehouseSequence : 0,
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
    onBooleanChangeClick,
    onValidarCorreo,
  } = useForm({ ...initialFormState });

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
                documentType: DocumentTypeEnum.USUARIO,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.SUCURSAL + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.USUARIO,
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
                documentType: DocumentTypeEnum.SUCURSAL,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.SUCURSAL + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.SUCURSAL,
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
        documentType: DocumentTypeEnum.SUCURSAL,
      });
    }
    navigate(PathEnum.SUCURSAL);
  };

  useEffect(() => {
    if (!requestId) {
      setCreateMode(true);
      setTitle('Nueva Sucursal');
      setIsEditable(true);
    } else {
      setCreateMode(false);
      setEditMode(false);
      setTitle('Sucursal (Modo Lectura) - N° ' + requestId);
      const setForm = async () => {
        const response = await fetchBranchById(requestId);
        if (response) {
          const dto = response as SucursalType;
          const newFormState = {
            ...dto,
            nameTemp: dto.name,
            cityTemp: dto.cityId,
          };
          setFormState(newFormState);
          prevFormState.current = newFormState;
        }
        fetchBySucursal(formState.branch.branchId).then((response) => {
          if (response) {
            const temporalRows = response;
            if (temporalRows && temporalRows.length > 0) {
              setRows(temporalRows);
              const rows = temporalRows.map((row) => {
                return {
                  id: randomId(),
                  ...row,
                };
              });
              setRows(rows);
              prevRows.current = rows;
            }
          }
        });
      };
      setForm();
    }
  }, [requestId]);

  const thereIsChanges = useMemo(() => {
    return (
      !isEqual(prevFormState.current, formState) ||
      !isEqual(prevRows.current, rows)
    );
  }, [formState, rows]);

  const validateForm = () => {
    let isValid = true;

    if (formState.name === '') {
      enqueueSnackbar('El campo Nombre es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.regionId === null) {
      enqueueSnackbar('El campo Región es Requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.cityId === null) {
      enqueueSnackbar('El campo Ciudad es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.email === '') {
      enqueueSnackbar('El campo Email es requerido', {
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

    const branch = setHeader(formState);
    const wareHouses = setDetails(rows);

    branch.wareHouseDetail = wareHouses;

    const response = requestId
      ? await fetchUpdatebranch(requestId, branch)
      : await fetchSaveBranch(branch);
    if (
      !response ||
      (response && (response as ServerResponseType).status === 400) ||
      (response && (response as ServerResponseType).status === 404) ||
      (response && (response as ServerResponseType).status === 500)
    ) {
      enqueueSnackbar(`Error al guardar la sucursal`, {
        variant: 'error',
      });
      return;
    }
    enqueueSnackbar(`La sucursal se guardo correctamente`, {
      variant: 'success',
    });
    handleCancel();
  };

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
          <ManageSucursalForm
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onDateChange={onDateChange}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            onInputJustNumber={onInputJustNumber}
            onBooleanChangeClick={onBooleanChangeClick}
            onValidarCorreo={onValidarCorreo}
            rows={rows}
            setRows={setRows}
            rowModesModel={rowModesModel}
            setRowModesModel={setRowModesModel}
          />
          <SucursalButtons
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
