import {
  pacthListaPedido,
  saveListaPedido,
  updateListaPedido,
} from '@/backend';
import { defaultSucursalType } from '@/constants';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import { ListaPedidoEnum } from '@/enums/ListaPedidoEnum';
import {
  StyledDatePicker,
  useAccessDocument,
  useAllowAdquisicion,
  useAllowGlobal,
  useAperturaImportacionAsync,
  useForm,
  useListaPedidoAsync,
  useProveedorAsync,
  useStyles,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState } from '@/store';
import { PersonProviderType } from '@/types';
import { CodigosAperturaType } from '@/types/importaciones/aperturaImportacionType';
import {
  DetailPurchaseOrderListGet,
  ListaPedidoGet,
  ListaPedidoPostType,
  PurchaseOrder,
} from '@/types/importaciones/listaPedido.type';
import {
  Check,
  DeleteForever,
  EditNote,
  Error,
  ExitToApp,
  PictureAsPdf,
  Save,
  Send,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { parseISO } from 'date-fns';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import CollapsibleTable from './components/ListaPedidoContenedores';
import { AccionesDialogos } from './components/ListaPedidoDialogos';
import { downloadPdf } from '@/functions';

export type ManageListaPedidoPageProps = {};

export const ManageListaPedidoPage: React.FC<
  ManageListaPedidoPageProps
> = ({}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateBetweenDocuments } = useAllowGlobal();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sucursales } = useSelector((state: RootState) => state.common);
  const requestId =
    location && location.state ? location.state.requestId : undefined;
  const [title, setTitle] = useState<string>('');
  const [createMode, setCreateMode] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isApprovable, setIsApprovable] = useState(false);
  const [rows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const { openDocument, closeDocument } = useAccessDocument();
  const [searchTerm, setSearchTerm] = useState('');
  const [proveedorPersonaList, setProveedoredorPersonaList] = useState<
    PersonProviderType[]
  >([]);
  const [isEditable, setIsEditable] = useState(false);
  const [validateAnulado, setValidateAnulado] = useState(false);
  const [purchaseOrderPrueba, setPurchaseOrderPrueba] = useState<PurchaseOrder>(
    { detailPurchaseOrderList: [] }
  );
  const [requestListaSelected, setRequestListaSelected] =
    useState<ListaPedidoGet>();
  const { enableApproveLP, enableEditingLP } = useAllowAdquisicion();
  const [detailList, setDetailsList] = useState<DetailPurchaseOrderListGet[]>(
    []
  );
  const [formularioValido, setFormularioValido] = useState<boolean>(false);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const [openAnulation, setOpenAnulation] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [disabledAll, setDisabledAll] = useState(false);
  const [negado, setNegado] = useState(false);
  const [stateForRequest, setStateForRequest] = useState<number>(
    ListaPedidoEnum.GENERADO
  );
  const [codesApertura, setCodesApertura] = useState<CodigosAperturaType[]>([]);
  const [rowsTemp, setRowsTemp] = useState<PurchaseOrder>({
    detailPurchaseOrderList: [],
  });
  const [rowsFinalTemp, setRowsFinalTemp] = useState<PurchaseOrder>({
    detailPurchaseOrderList: [],
  });

  const { fetchDownloadPdf, fetchById, fetchDetailsById } =
    useListaPedidoAsync();

  const { fetchCodigosApertura } = useAperturaImportacionAsync();

  const { fetchProveedorPersonaByProveedor, fetchByParam } =
    useProveedorAsync();

  const [providerSelected, setProviderSelected] =
    useState<PersonProviderType | null>(null);
  const sucursalUser = requestListaSelected
    ? sucursales.filter(
        (s) => s.branchId === requestListaSelected?.orderList?.branchId
      )[0]
    : sucursales.filter((s) => s.branchId === user?.branchId)[0] || {
        ...defaultSucursalType,
      };

  const {
    formState,
    onAutocompleteChange,
    onDateChange,
    onInputChange,
    onInputJustNumber,
    setFormState,
  } = useForm({
    usuario: user,
    fechaCreacion: new Date(),
    providerId: null,
    fechaCarga: new Date(),
    sucursal: sucursalUser !== undefined ? sucursalUser.name : '',
    planta: null,
    partida: null,
    fechaEntrega: new Date(),
    observacion: '',
    numeroContenedores: null,
    motive: '',
    importOpeningCode: '',
  });
  const [mostrarAutocomplete, setMostrarAutocomplete] = useState(true);

  const handleClick = () => {
    setMostrarAutocomplete(false);
  };

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
        documentType: DocumentTypeEnum.LISTA_PEDIDO,
      });
    }

    navigate(PathEnum.LISTA_PEDIDO);
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle('Lista pedido (Modo Edición) - N° ' + requestId);
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
      rows.forEach((row) => {
        setRowModesModel({
          ...rowModesModel,
          [row.id]: { mode: GridRowModes.View },
        });
      });
      setTitle('Lista pedido (Modo Lectura) - N° ' + requestId);
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
    setTitle(
      createMode
        ? 'Nueva Lista de Pedido'
        : 'Lista de Pedido (Modo Lectura) - N° ' + requestId
    );
  }, [createMode, requestId]);

  useEffect(() => {
    const fetchCodigos = async () => {
      fetchCodigosApertura(formState.providerId).then((response) => {
        if (response) {
          setCodesApertura(response);
        }
      });
    };
    if (disabledAll) {
      if (formState.providerId && formState.providerId !== null) {
        fetchCodigos();
      }
    }
  }, [disabledAll, formState.providerId]);

  useEffect(() => {
    if (requestId) {
      setCreateMode(false);
      const getRequestListPedido = async () => {
        fetchById(requestId).then((response) => {
          if (response) {
            setRequestListaSelected(response);
          }
        });
      };

      const getRequestPurchaseDetails = async () => {
        fetchDetailsById(requestId).then((response) => {
          if (response) {
            setDetailsList(response);
          }
        });
      };

      try {
        Promise.all([getRequestListPedido(), getRequestPurchaseDetails()]);
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    }
  }, [requestId]);

  // ? FUNCIONAMIENTO PARA EDITAR --------------------------------------

  useEffect(() => {
    if (requestListaSelected) {
      const anulado =
        requestListaSelected &&
        requestListaSelected.orderList.cancellationReason !== null
          ? true
          : false;
      setValidateAnulado(anulado);

      if (
        requestListaSelected?.orderList?.stateId === ListaPedidoEnum.APROBADO
      ) {
        setDisabledAll(true);
        setIsEditable(false);
        setIsApprovable(false);
        setFormularioValido(false);
      } else if (
        requestListaSelected?.orderList?.stateId === ListaPedidoEnum.NEGADO
      ) {
        setNegado(true);
        setIsEditable(false);
        setIsApprovable(false);
        setFormularioValido(false);
      } else {
        const enableEditing = enableEditingLP(
          requestListaSelected
            ? requestListaSelected?.orderList.stateId
            : ListaPedidoEnum.EDICION,
          requestListaSelected?.orderList?.registrationDate ?? new Date()
        );
        setIsEditable(enableEditing);

        const enableApprove = enableApproveLP(
          requestListaSelected ? requestListaSelected?.orderList.stateId : 0,
          requestListaSelected?.orderList?.registrationDate ?? new Date()
        );
        setIsApprovable(enableApprove);
      }

      const numeroContenedores = requestListaSelected?.orderListDetail
        ? requestListaSelected?.orderListDetail.reduce((max, item) => {
            return item.containerNumber > max ? item.containerNumber : max;
          }, requestListaSelected?.orderListDetail[0]?.containerNumber)
        : '';

      const creationDate = requestListaSelected?.orderList.registrationDate
        ? requestListaSelected?.orderList.registrationDate
        : '';

      const deliveryDate = requestListaSelected?.orderList.deliveryDate
        ? requestListaSelected?.orderList.deliveryDate
        : '';

      const loadingDate = requestListaSelected?.orderList.loadingDate
        ? requestListaSelected?.orderList.loadingDate
        : '';

      setFormState({
        usuario: requestListaSelected
          ? {
              userNick: requestListaSelected?.orderList.userNick,
              userId: requestListaSelected?.orderList.userId,
            }
          : user,
        sucursal: requestListaSelected.orderList.branchName,
        fechaCreacion: requestListaSelected
          ? parseISO(creationDate.toString())
          : new Date(),
        proveedorId: requestListaSelected
          ? requestListaSelected.orderList.providerId
          : '',
        providerId: requestListaSelected
          ? requestListaSelected.orderList.providerId
          : '',
        fechaCarga: requestListaSelected
          ? parseISO(deliveryDate.toString())
          : new Date(),
        planta: requestListaSelected
          ? requestListaSelected.orderList.plant
          : '',
        //partida: requestListaSelected ? requestListaSelected.orderList.importOpeningId : '',
        importOpeningCode: requestListaSelected
          ? requestListaSelected.orderList.importOpeningCode
          : '',
        fechaEntrega: requestListaSelected
          ? parseISO(loadingDate.toString())
          : new Date(),
        observacion: requestListaSelected
          ? requestListaSelected.orderList.observation
          : '',
        numeroContenedores: numeroContenedores,
      });
    }
  }, [requestListaSelected]);

  useEffect(() => {
    const fetchDataProviderById = async () => {
      fetchProveedorPersonaByProveedor(formState.providerId).then(
        (response) => {
          if (response) {
            const proveedorData: PersonProviderType[] = [response];
            setProveedoredorPersonaList(proveedorData);
          }
        }
      );
    };
    if (formState.proveedorId) {
      fetchDataProviderById();
    }
  }, [formState.proveedorId]);

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
    const validateSaveForm = () => {
      if (
        formState.proveedor !== null &&
        formState.numeroContenedores !== null
      ) {
        setFormularioValido(true);
        if (requestId === undefined) {
          setIsEditable(true);
        }
      }
    };
    if (formState && purchaseOrderPrueba?.detailPurchaseOrderList?.length > 0) {
      validateSaveForm();
    } else {
      setFormularioValido(false);
    }
  }, [formState, purchaseOrderPrueba]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let valido = true;
    const states = [ListaPedidoEnum.ANULADO, ListaPedidoEnum.NEGADO];
    try {
      if (states.includes(stateForRequest)) {
        if (requestId) {
          const patchLista = {
            stateId: stateForRequest,
            cancellationReason: formState.motive,
          };

          const response = await pacthListaPedido(requestId, patchLista);
          if (response) {
            if (response.status === 200) {
              enqueueSnackbar(
                stateForRequest === ListaPedidoEnum.NEGADO
                  ? 'Negado Correctamente'
                  : 'Anulado Correctamente',
                {
                  variant: 'success',
                }
              );
              handleCancel();
            } else {
              enqueueSnackbar(`Error con el servidor: ${response.message}`, {
                variant: 'error',
              });
            }
          }
        }
      } else {
        const encabezadoLista: ListaPedidoPostType = {
          stateId: stateForRequest,
          userId: formState.usuario.userId,
          providerId: formState.providerId,
          branchId: sucursalUser.branchId,
          creationDate: new Date().toISOString().slice(0, 35),
          loadingDate: formState.fechaCarga.toISOString().slice(0, 35),
          estimatedArrivalDate: formState.fechaEntrega
            .toISOString()
            .slice(0, 35),
          observation: formState.observacion,
          linkedToOC: true,
          modifiedByUser: formState.usuario.userId,
          testUser1: '',
          testUser2: '',
          modificationDate: new Date().toISOString().slice(0, 35),
          approvalDate: '',
          importOpeningId: formState.partida,
          packingList: 2,
          plant: formState.planta,
          orderListDetail: purchaseOrderPrueba.detailPurchaseOrderList,
        };

        if (purchaseOrderPrueba.detailPurchaseOrderList.length === 0) {
          valido = false;
          enqueueSnackbar(
            'El detalle de la lista pedido debe contener al menos un producto',
            {
              variant: 'error',
            }
          );
        } else {
          if (purchaseOrderPrueba.detailPurchaseOrderList.length > 0) {
            for (const detail of purchaseOrderPrueba.detailPurchaseOrderList) {
              if (detail.quantity === 0) {
                valido = false;
                enqueueSnackbar('Existen Elementos sin guardar', {
                  variant: 'error',
                });
                break;
              }
            }
          }
        }

        if (rowsTemp.detailPurchaseOrderList.length > 0) {
          valido = false;
          enqueueSnackbar('Existen Elementos sin guardar', {
            variant: 'error',
          });
        }
        if (rowsFinalTemp.detailPurchaseOrderList.length > 0) {
          valido = false;
          enqueueSnackbar('Existen Elementos sin guardar', {
            variant: 'error',
          });
        }

        if (formState.providerId === null) {
          valido = false;
          enqueueSnackbar('Tiene que seleccionar un proveedor', {
            variant: 'error',
          });
        }
        if (
          formState.numeroContenedores === null ||
          formState.numeroContenedores === 0
        ) {
          valido = false;
          enqueueSnackbar('El número de contenedores no puede ser 0', {
            variant: 'error',
          });
        }
        if (disabledAll) {
          if (formState.partida === null || formState.partida === undefined) {
            valido = false;
            enqueueSnackbar('Tiene que seleccionar una partida', {
              variant: 'error',
            });
          }
        }
        if (valido) {
          const response =
            requestId !== undefined && requestId !== null
              ? await updateListaPedido(requestId, encabezadoLista)
              : await saveListaPedido(encabezadoLista);
          if (response) {
            if (response.status === 200) {
              if (stateForRequest === ListaPedidoEnum.TRAMITE) {
                enqueueSnackbar('Enviado Correctamente', {
                  variant: 'success',
                });
              } else if (stateForRequest === ListaPedidoEnum.APROBADO) {
                enqueueSnackbar('Aprobado Correctamente', {
                  variant: 'success',
                });
              } else {
                enqueueSnackbar('Guardado Correctamente', {
                  variant: 'success',
                });
              }
              handleCancel();
            } else {
              enqueueSnackbar(
                `Error al guardar la lista de pedido: ${response.message.message}`,
                {
                  variant: 'error',
                }
              );
            }
          }
        }
      }
    } catch (error) {
      enqueueSnackbar(`Error al guardar la lista de pedido: ${error}`, {
        variant: 'error',
      });
    }
  };
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
                documentType: DocumentTypeEnum.LISTA_PEDIDO,
              });
              openDocument({
                id: Number(requestId) - 1,
                navigation: () =>
                  navigate(PathEnum.LISTA_PEDIDO + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) - 1,
                    },
                  }),
                documentType: DocumentTypeEnum.LISTA_PEDIDO,
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
                documentType: DocumentTypeEnum.LISTA_PEDIDO,
              });
              openDocument({
                id: Number(requestId) + 1,
                navigation: () =>
                  navigate(PathEnum.LISTA_PEDIDO + PathEnum.VIEW, {
                    state: {
                      requestId: Number(requestId) + 1,
                    },
                  }),
                documentType: DocumentTypeEnum.LISTA_PEDIDO,
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
            <Grid item xs={4}>
              <TextField
                name="usuario"
                label="Usuario"
                value={
                  formState.usuario.userNick !== null
                    ? formState.usuario.userNick
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="sucursal"
                label="Sucursal"
                value={
                  formState.sucursal && formState.sucursal
                    ? formState.sucursal
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                readOnly={!createMode && !editMode}
                className={styles.genericFieldStyle}
                options={proveedorPersonaList}
                getOptionLabel={(option) => option.providerName}
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  onAutocompleteChange(event, 'providerId', value?.providerId);
                }}
                value={providerSelected}
                onInputChange={handleAutocompleteProveedor}
                isOptionEqualToValue={(
                  option: PersonProviderType,
                  value: PersonProviderType
                ) => option.providerId === value.providerId}
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
            <Grid item xs={4}>
              <TextField
                name="planta"
                label="Planta"
                value={formState.planta !== null ? formState.planta : ''}
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink:
                    formState.planta !== '' && formState.planta != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              {mostrarAutocomplete ? (
                <TextField
                  name="importOpeningCode"
                  label="Partida"
                  value={
                    formState.importOpeningCode !== null
                      ? formState.importOpeningCode
                      : ''
                  }
                  onChange={onInputChange}
                  onClick={handleClick}
                  InputProps={{
                    readOnly: !disabledAll,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.importOpeningCode !== '' &&
                      formState.importOpeningCode != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              ) : (
                <Autocomplete
                  readOnly={!disabledAll}
                  className={styles.genericFieldStyle}
                  options={codesApertura}
                  getOptionLabel={(option) => option.importCode}
                  style={{ width: '100%' }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      'partida',
                      value?.importOpeningId
                    );
                  }}
                  value={
                    (formState.partida !== null
                      ? codesApertura.find(
                          (code) => code.importOpeningId === formState.partida
                        )
                      : '') || null
                  }
                  isOptionEqualToValue={(
                    option: CodigosAperturaType,
                    value: CodigosAperturaType
                  ) => option.importOpeningId === value.importOpeningId}
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Partida"
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
              )}
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="numeroContenedores"
                disabled={isApprovable}
                label="Nro Contenedores"
                value={
                  formState.numeroContenedores !== null
                    ? formState.numeroContenedores
                    : ''
                }
                onChange={onInputJustNumber}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink:
                    formState.numeroContenedores !== '' &&
                    formState.numeroContenedores != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Creación"
                minDate={formState.fechaCreacion}
                onChange={(value) =>
                  onDateChange(value as Date, 'fechaCreacion')
                }
                readOnly={!createMode && !editMode}
                format="dd/MM/yyyy"
                value={
                  formState.fechaCreacion !== null
                    ? formState.fechaCreacion
                    : ''
                }
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
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha de Carga"
                views={['year', 'month', 'day']}
                minDate={dayjs(new Date()).subtract(2, 'month').toDate()}
                format="dd/MM/yyyy"
                value={
                  formState.fechaCarga !== null ? formState.fechaCarga : ''
                }
                onChange={(value) => onDateChange(value as Date, 'fechaCarga')}
                readOnly={!createMode && !editMode}
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
                      shrink: formState.fechaCarga ? true : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Entrega"
                minDate={formState.fechaEntrega}
                onChange={(value) =>
                  onDateChange(value as Date, 'fechaEntrega')
                }
                readOnly={!createMode && !editMode}
                format="dd/MM/yyyy"
                value={
                  formState.fechaEntrega !== null ? formState.fechaEntrega : ''
                }
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
            <Grid item xs={12}>
              <TextField
                name="observacion"
                label="Observación"
                value={
                  formState.observacion !== null
                    ? formState.observacion.toUpperCase()
                    : ''
                }
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink:
                    formState.observacion !== '' &&
                    formState.observacion != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
          </Grid>
          <Divider sx={{ mt: 4, height: 4 }} />
          <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <CollapsibleTable
                formState={formState}
                createMode={createMode}
                setCreateMode={setCreateMode}
                isEditable={isEditable}
                setIsEditable={setIsEditable}
                editMode={editMode}
                validateAnulado={validateAnulado}
                isApprovable={isApprovable}
                purchaseOrderPrueba={purchaseOrderPrueba}
                setPurchaseOrderPrueba={setPurchaseOrderPrueba}
                detailList={detailList}
                setFormState={setFormState}
                rowsTemp={rowsTemp}
                setRowsTemp={setRowsTemp}
                rowsFinalTemp={rowsFinalTemp}
                setRowsFinalTemp={setRowsFinalTemp}
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
            {!disabledAll ? (
              <>
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
                    <Button
                      startIcon={<PictureAsPdf />}
                      sx={{ margin: 2 }}
                      onClick={() => {
                        if (requestId) {
                          fetchDownloadPdf(requestId).then((response) => {
                            downloadPdf(
                              response,
                              `lista_pedido_${requestId}.pdf`
                            );
                          });
                        }
                      }}
                      style={{ width: '130px' }}
                    >
                      {'Descargar PDF'}
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

                <>
                  {formularioValido && isEditable && (
                    <Button
                      startIcon={<Save />}
                      onClick={() =>
                        setStateForRequest(
                          requestListaSelected
                            ? requestListaSelected.orderList.stateId
                            : ListaPedidoEnum.GENERADO
                        )
                      }
                      sx={{ margin: 2 }}
                      type="submit"
                      style={{ width: '120px' }}
                    >
                      {'Guardar'}
                    </Button>
                  )}
                  {formularioValido && !isApprovable && !negado && (
                    <Button
                      type="button"
                      startIcon={<Send />}
                      onClick={() => setOpenDialogAlert(true)}
                      sx={{ margin: 2 }}
                      style={{ width: '120px' }}
                    >
                      {'Enviar'}
                    </Button>
                  )}

                  {!isApprovable && !createMode && !negado && (
                    <Button
                      startIcon={<DeleteForever />}
                      onClick={() => setOpenAnulation(true)}
                      sx={{ margin: 2 }}
                      type="button"
                      style={{ width: '120px' }}
                    >
                      {'Anular'}
                    </Button>
                  )}
                </>
                {isApprovable && (
                  <>
                    <Button
                      type="submit"
                      startIcon={<Error />}
                      onClick={() => setStateForRequest(ListaPedidoEnum.NEGADO)}
                      sx={{ margin: 2 }}
                      style={{ width: '120px' }}
                    >
                      {'Negar'}
                    </Button>
                    <Button
                      type="submit"
                      startIcon={<Check />}
                      onClick={() =>
                        setStateForRequest(ListaPedidoEnum.APROBADO)
                      }
                      sx={{ margin: 2 }}
                      style={{ width: '120px' }}
                    >
                      {'Aprobar'}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  startIcon={<ExitToApp />}
                  sx={{ margin: 2 }}
                  onClick={handleCancel}
                  style={{ width: '120px' }}
                >
                  {'Salir'}
                </Button>
                <Button
                  startIcon={<Save />}
                  onClick={() =>
                    setStateForRequest(
                      requestListaSelected
                        ? requestListaSelected.orderList.stateId
                        : ListaPedidoEnum.GENERADO
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
          </Grid>
        </form>
      </CardLayout>
      <AccionesDialogos
        openDialogAlert={openDialogAlert}
        setOpenDialogAlert={setOpenDialogAlert}
        openAnulation={openAnulation}
        setOpenAnulation={setOpenAnulation}
        formState={formState}
        onInputChange={onInputChange}
        openHistory={openHistory}
        setOpenHistory={setOpenHistory}
        setStateForRequest={setStateForRequest}
        onSubmit={onSubmit}
      />
    </>
  );
};
