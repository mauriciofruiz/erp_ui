'use client';
import {
  getAperturaExist,
  getEstadoImportación,
  saveAperturaImportacion,
  updateAperturaImportacion,
} from '@/backend/adquisiciones/aperturaImportacionServices';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { AperturaImpEnum } from '@/enums/AperturaImportacionEnum';
import { ProveedorEnum } from '@/enums/ProveedorEnum';
import {
  StyledDatePicker,
  useAccessDocument,
  useAccountAsync,
  useAllowAdquisicion,
  useAllowGlobal,
  useAperturaImportacionAsync,
  useForm,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState } from '@/store';
import { AccountType, PersonProviderType } from '@/types';
import {
  AperturaGetType,
  AperturaPostType,
  EstadoAperturaType,
} from '@/types/importaciones/aperturaImportacionType';
import {
  Check,
  EditNote,
  ExitToApp,
  Save,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material';
import { parseISO } from 'date-fns';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

export type ManageAperturaImportacionPageProps = {
  // types...
};

export const ManageAperturaImportacionPage: React.FC<
  ManageAperturaImportacionPageProps
> = ({}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const requestId =
    location && location.state ? location.state.requestId : undefined;
  const { openDocument, closeDocument } = useAccessDocument();
  const [title, setTitle] = useState<string>('');
  const [createMode, setCreateMode] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuentaContPasi, setCuentaContPasiList] = useState<AccountType>();
  const [estadoList, setEstadoList] = useState<EstadoAperturaType[]>([]);
  const [state, setState] = useState<EstadoAperturaType>();
  const [aperturaSelected, setAperturaSelected] = useState<AperturaGetType>();
  const [isEditable, setIsEditable] = useState(false);
  const [isApprovable, setIsApprovable] = useState(false);
  const { enableApproveAI, enableEditingAI } = useAllowAdquisicion();
  const { navigateBetweenDocuments } = useAllowGlobal();
  const [stateForRequest, setStateForRequest] = useState<number>(
    AperturaImpEnum.EDICION
  );
  const [formValid, setFormValid] = useState(false);
  const [providerSelected, setProviderSelected] =
    useState<PersonProviderType | null>(null);

  const { fetchAccountByNumber } = useAccountAsync();

  const { fetchProveedorPersonaByProveedor, fetchByParam } =
    useProveedorAsync();

  const { fetchById } = useAperturaImportacionAsync();
  const {
    setFormState,
    formState,
    onDateChange,
    onAutocompleteChange,
    onInputChange,
    onBooleanChange,
  } = useForm({
    userid: user?.userId,
    providerId: '',
    dateCreation: new Date(),
    name: '',
    ruc: '',
    address: '',
    email: '',
    contact: '',
    phone: '',
    importCode: '',
    detailImportacion: '',
    reference: '',
    detailReference: '',
    state: '',
    ctaContable: '',
    observation: '',
    multiInvoice: false,
  });

  const handleAutocompleteProveedor = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(inputValue);
    }
  };

  const handleCancel = async () => {
    if (requestId) {
      closeDocument({
        id: requestId,
        documentType: DocumentTypeEnum.APERTURA_IMPORTACION,
      });
    }

    navigate(PathEnum.APERTURA_IMPORTACION);
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle('Apertura Importación (Modo Edición) - N° ' + requestId);
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
      setTitle('Apertura Importación (Modo Lectura) - N° ' + requestId);
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

  const validateCodeApertura = async () => {
    const response = await getAperturaExist(formState.importCode.toUpperCase());
    if (response) {
      if (response.status === 200) {
        if (response.message) {
          enqueueSnackbar('El código de aperuta ya existe', {
            variant: 'error',
          });
          setFormValid(false);
          setIsApprovable(false);
        } else {
          setFormValid(true);
          setIsApprovable(true);
        }
      }
    }
  };

  useEffect(() => {
    setTitle(
      createMode
        ? 'Nueva Apertura de Importación'
        : 'Apertura de Importación (Modo Lectura) - N° ' + requestId
    );
  }, [createMode, requestId]);

  useEffect(() => {
    const fetchData = async () => {
      fetchByParam(searchTerm.toUpperCase()).then((response) => {
        if (response) {
          setProveedoredorPersonaList(response);
        }
      });
    };

    if (searchTerm.length >= 3) {
      fetchData();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (formState.providerId === null) {
      setProviderSelected(null);
      return;
    }
    if (
      providerSelected &&
      providerSelected !== null &&
      proveedorPersonaList.length === 0
    )
      return;
    const provider = proveedorPersonaList.find(
      (provider) => provider.providerId === formState.providerId
    );
    if (provider) {
      setProviderSelected(provider);
    }
  }, [formState.providerId, proveedorPersonaList]);

  useEffect(() => {
    const getCuentaContablePasivo = async () => {
      fetchAccountByNumber(ProveedorEnum.PROVEEDORES_EXTERIOR).then(
        (response) => {
          if (response) setCuentaContPasiList(response[0]);
        }
      );
    };
    const getEstadoApetura = async () => {
      const response = await getEstadoImportación();
      if (response) {
        setEstadoList(response);
      }
    };
    getCuentaContablePasivo();
    getEstadoApetura();
  }, []);

  useEffect(() => {
    if (estadoList) {
      const estado = estadoList.find((item) => item.importStateId === 1);
      if (estado) {
        setState(estado);
        setFormState({
          ...formState,
          state: estado.importStateId,
        });
      }
    }
  }, [estadoList]);

  useEffect(() => {
    if (cuentaContPasi) {
      setFormState({
        ...formState,
        ctaContable: cuentaContPasi.accountId,
      });
    }
  }, [cuentaContPasi]);

  useEffect(() => {
    const fetchDataProviderById = async () => {
      fetchProveedorPersonaByProveedor(formState.provider).then((response) => {
        if (response) {
          const proveedorData: PersonProviderType[] = [response];
          setProveedoredorPersonaList(proveedorData);
        } else {
          setProveedoredorPersonaList([]);
        }
      });
    };
    if (formState.provider) {
      fetchDataProviderById();
    }
  }, [formState.provider]);

  useEffect(() => {
    const getRequestApertura = async () => {
      fetchById(requestId).then((response) => {
        if (response) {
          setAperturaSelected(response as AperturaGetType);
        }
      });
    };
    if (requestId) {
      setCreateMode(false);
      getRequestApertura();
    }
  }, [requestId]);

  useEffect(() => {
    if (aperturaSelected) {
      let email;
      let phone;

      if (aperturaSelected.emailList.length > 0) {
        email = aperturaSelected.emailList[0];
      }

      if (aperturaSelected.phoneList.length > 0) {
        phone = aperturaSelected.phoneList[0];
      }

      const creationDate = aperturaSelected?.registrationDate
        ? aperturaSelected?.registrationDate
        : '';

      // if (aperturaSelected.orderListId !== null) {
      // 	setIsEditable(false);
      // 	setFormValid(false);
      // 	setIsApprovable(false);
      // } else {
      const editing = enableEditingAI(
        aperturaSelected
          ? aperturaSelected.importStateId
          : AperturaImpEnum.EDICION,
        aperturaSelected?.registrationDate
      );
      setIsEditable(editing);

      const approve = enableApproveAI(
        aperturaSelected
          ? aperturaSelected.importStateId
          : AperturaImpEnum.EDICION,
        aperturaSelected?.registrationDate
      );
      setIsApprovable(approve);
      //}

      setFormState({
        userid: aperturaSelected ? aperturaSelected.userId : '',
        provider: aperturaSelected ? aperturaSelected.providerId : '',
        providerId: aperturaSelected ? aperturaSelected.providerId : '',
        dateCreation: aperturaSelected
          ? parseISO(creationDate.toString())
          : new Date(),
        name: aperturaSelected ? aperturaSelected.providerName : '',
        ruc: aperturaSelected ? aperturaSelected.identification : '',
        address: aperturaSelected ? aperturaSelected.providerAddress : '',
        email: email ? email : '',
        contact: aperturaSelected ? aperturaSelected.providerName : '',
        phone: phone ? phone : '',
        importCode: aperturaSelected ? aperturaSelected.importCode : '',
        detailImportacion: aperturaSelected
          ? aperturaSelected.importDetail
          : '',
        reference: aperturaSelected ? aperturaSelected.reference : '',
        detailReference: aperturaSelected
          ? aperturaSelected.referenceDetail
          : '',
        state: aperturaSelected ? aperturaSelected.importStateId : '',
        ctaContable: aperturaSelected ? aperturaSelected.accountId : '',
        observation: aperturaSelected ? aperturaSelected.observation : '',
        multiInvoice: aperturaSelected ? aperturaSelected.multiInvoice : '',
      });
    }
  }, [aperturaSelected]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let valido = true;

    try {
      const aperturaImportacion: AperturaPostType = {
        importStateId: stateForRequest,
        providerId: formState.providerId,
        userId: formState.userid,
        accountId: formState.ctaContable,
        registrationDate: new Date().toISOString().slice(0, 35),
        importCode: formState.importCode
          ? formState.importCode.trim().toUpperCase()
          : '',
        reference: formState.reference ? formState.reference.toUpperCase() : '',
        detail: formState.reference
          ? formState.detailImportacion.toUpperCase()
          : '',
        referenceDetail: formState.reference
          ? formState.detailReference.toUpperCase()
          : '',
        observation: formState.observation.toUpperCase(),
        multiInvoice: formState.multiInvoice,
      };

      if (formState.provider === '') {
        valido = false;
        enqueueSnackbar('Seleccionar Proveedor', {
          variant: 'error',
        });
      }

      if (formState.importCode === '') {
        valido = false;
        enqueueSnackbar('Ingresar código de importación', {
          variant: 'error',
        });
      }

      if (valido) {
        const response =
          requestId !== undefined && requestId !== null
            ? await updateAperturaImportacion(requestId, aperturaImportacion)
            : await saveAperturaImportacion(aperturaImportacion);

        if (response) {
          if (response.status === 200) {
            enqueueSnackbar('Guardado Correctamente', {
              variant: 'success',
            });
            handleCancel();
          } else {
            enqueueSnackbar(`Error al guardar: ${response.message.message}`, {
              variant: 'error',
            });
          }
        }
      }
    } catch (error) {
      enqueueSnackbar(`Error al guardar: ${error}`, {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    const validarFormulario = () => {
      if (aperturaSelected === undefined) {
        if (formState.provider != '' && formState.importCode != '') {
          setFormValid(true);
          setIsApprovable(true);
        }
      } else {
        if (formState.provider != '' && formState.importCode != '') {
          setFormValid(true);
          setIsApprovable(true);
        }
      }
    };
    if (formState) {
      validarFormulario();
    }
  }, [formState]);

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
                id: requestId,
                documentType: DocumentTypeEnum.APERTURA_IMPORTACION,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.APERTURA_IMPORTACION + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.APERTURA_IMPORTACION,
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
                documentType: DocumentTypeEnum.APERTURA_IMPORTACION,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.APERTURA_IMPORTACION + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.APERTURA_IMPORTACION,
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
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Autocomplete
                readOnly={!createMode}
                className={styles.genericFieldStyle}
                options={proveedorPersonaList}
                getOptionLabel={(option) => option.providerName}
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  onAutocompleteChange(event, 'providerId', value?.providerId);
                  if (value != null) {
                    setFormState((prevState: any) => ({
                      ...prevState,
                      name: value.personName,
                      ruc: value.personIdentification,
                      address: value.personAddress,
                      email: value.personEmail,
                      contact: value.personName,
                      phone: value.personPhone,
                    }));
                  }
                }}
                onInputChange={handleAutocompleteProveedor}
                value={providerSelected}
                isOptionEqualToValue={(
                  option: PersonProviderType,
                  value: PersonProviderType
                ) =>
                  option && value
                    ? option.providerId === value.providerId
                    : false
                }
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Proveedor"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      className: styles.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      className: styles.textGreenStyle,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Creación"
                minDate={formState.dateCreation}
                onChange={(value) =>
                  onDateChange(value as Date, 'dateCreation')
                }
                readOnly
                format="dd/MM/yyyy"
                value={formState.dateCreation}
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
            <Grid item xs={6}>
              <TextField
                name="name"
                label="Nombre"
                value={formState.name !== null ? formState.name : ''}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.name !== '' && formState.name != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="ruc"
                label="Ruc"
                value={formState.ruc !== null ? formState.ruc : ''}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.ruc !== '' && formState.ruc != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="address"
                label="Dirección"
                value={formState.address !== null ? formState.address : ''}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.address !== '' && formState.address != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="email"
                label="Correo"
                value={formState.email !== null ? formState.email : ''}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.email !== '' && formState.email != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="contact"
                label="Contacto"
                value={formState.contact !== null ? formState.contact : ''}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.contact !== '' && formState.contact != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="phone"
                label="Teléfono"
                value={formState.phone !== null ? formState.phone : ''}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.phone !== '' && formState.phone != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
          </Grid>
          <Divider sx={{ mt: 4, height: 4 }} />
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                name="importCode"
                label="Cod. Importación"
                value={
                  formState.importCode !== null ? formState.importCode : ''
                }
                onChange={onInputChange}
                onBlur={validateCodeApertura}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.importCode !== '' && formState.importCode != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="detailImportacion"
                label="Detalle Importación"
                value={
                  formState.detailImportacion !== null
                    ? formState.detailImportacion
                    : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.detailImportacion !== '' &&
                    formState.detailImportacion != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="reference"
                label="Referencia"
                value={formState.reference !== null ? formState.reference : ''}
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.reference !== '' && formState.reference != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="detailReference"
                label="Detalle Referencia"
                value={
                  formState.detailReference !== null
                    ? formState.detailReference
                    : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.detailReference !== '' &&
                    formState.detailReference != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="state"
                label="Estado"
                value={state && state != null ? state.importStateName : ''}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink: state && state != null ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="cuentaContPasi"
                label="Cuenta Contable"
                value={
                  cuentaContPasi && cuentaContPasi != null
                    ? `${cuentaContPasi['accountNumber']} - ${cuentaContPasi['accountDescription']}`
                    : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink: cuentaContPasi != null ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="observation"
                label="Observación"
                value={
                  formState.observation !== null ? formState.observation : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                InputLabelProps={{
                  shrink:
                    formState.observation !== '' &&
                    formState.observation != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    disabled={!createMode && !editMode}
                    checked={formState.multiInvoice}
                    onChange={(event) => {
                      onBooleanChange(event, 'multiInvoice');
                    }}
                  />
                }
                label={
                  formState.multiInvoice ? 'Multifactura SI' : 'Multifactura NO'
                }
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
                  style={{ width: '120px' }}
                >
                  {'Salir'}
                </Button>
                {isEditable && (
                  <Button
                    startIcon={<EditNote />}
                    sx={{ margin: 2 }}
                    onClick={onEditButtonClick}
                    style={{ width: '120px' }}
                  >
                    {!editMode ? 'Editar' : 'Leer'}
                  </Button>
                )}
              </>
            )}
            {formValid && (
              <>
                <Button
                  startIcon={<Save />}
                  onClick={() =>
                    setStateForRequest(
                      aperturaSelected
                        ? aperturaSelected.importStateId
                        : AperturaImpEnum.LIBERADO
                    )
                  }
                  sx={{ margin: 2 }}
                  type="submit"
                  style={{ width: '120px' }}
                >
                  {'Guardar'}
                </Button>
              </>
            )}
            {isApprovable && (
              <>
                <Button
                  type="submit"
                  startIcon={<Check />}
                  onClick={() => setStateForRequest(AperturaImpEnum.LIBERADO)}
                  sx={{ margin: 2 }}
                  style={{ width: '120px' }}
                >
                  {'Confirmar'}
                </Button>
              </>
            )}
          </Grid>
        </form>
      </CardLayout>
    </>
  );
};
