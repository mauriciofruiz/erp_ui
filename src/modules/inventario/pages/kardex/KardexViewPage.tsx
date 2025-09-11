import {
  getDetalleKardexView,
  getKardexView,
  getProductosByParams,
} from '@/backend/inventario';
import { defaultSucursalType } from '@/constants';
import { MovementTypeKardexEnum } from '@/enums/MovementTypeKardexEnum';
import {
  getStartDateSystem,
  setCurrencyNumber,
  setDecimalPlacesString,
} from '@/functions';
import {
  StyledDatePicker,
  useBodegaAsync,
  useForm,
  useKardexAsync,
  useStyles,
} from '@/hooks';
import { CardLayout } from '@/modules';
import { RootState, ServerResponseType } from '@/store';
import {
  BodegaGetInterface,
  DetailKardexSearcherInterface,
  DetailKardexViewInterface,
  KardexMain,
  KardexViewInterface,
  PaginatedResponseType,
  ProductoType,
} from '@/types';
import { Autorenew, ExpandMore, Search } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Divider,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import axios from 'axios';
import { startOfMonth } from 'date-fns';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import KardexPagination from './KardexPagination';
import format from 'date-fns/format';

export type KardexViewPageProps = {};

const initialFormState = {
  branch: null,
  warehouses: [],
  movements: [],
  byCurrentMonth: false,
  startDate: null,
  endDate: new Date(),
  page: 0,
  pageSize: 10,
  product: null,
};
const KardexViewPage: React.FC<KardexViewPageProps> = ({}) => {
  const location = useLocation();

  const productId =
    location && location.state && location.state.productId
      ? location.state.productId
      : localStorage.getItem('state')
      ? JSON.parse(localStorage.getItem('state') || '').productId || undefined
      : undefined;

  const { enqueueSnackbar } = useSnackbar();

  const styles = useStyles();

  const [kardexResult, setKardexResult] = useState<DetailKardexViewInterface[]>(
    []
  );

  const [productsList, setProductsList] = useState<ProductoType[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  const { sucursales } = useSelector((state: RootState) => state.common);

  const sucursalesWithAllBranches = [defaultSucursalType, ...sucursales];

  const movementTypeKardexList = Object.keys(MovementTypeKardexEnum)
    .filter((key): key is keyof typeof MovementTypeKardexEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, value: MovementTypeKardexEnum[key] };
    });

  const [warehousesList, setWarehousesList] = useState<BodegaGetInterface[]>(
    []
  );

  const [kardexView, setKardexView] = useState<KardexViewInterface>();

  const { fetchBySucursal } = useBodegaAsync();

  const {
    formState,
    onAutocompleteChange,
    setFormState,
    onDateChange,
    onResetForm,
  } = useForm(initialFormState);
  const queryClient = new QueryClient();
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const { fetchPaginationKardex } = useKardexAsync();
  const [enabledLoading, setEnabledLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });
  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Fecha',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 100,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter: (params) => {
        const rawDate = params.value;
        const formattedDate = rawDate
          ? format(new Date(rawDate), 'dd/MM/yyyy')
          : '';
        return formattedDate;
      },
    },
    {
      field: 'productCode',
      headerName: 'Código',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 90,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'productName',
      headerName: 'Nombre Producto',
      type: 'string',
      minWidth: 300,
      flex: 3,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'movement',
      headerName: 'Movimiento',
      type: 'string',
      minWidth: 200,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'branch',
      headerName: 'Sucursal',
      type: 'string',
      minWidth: 100,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'warehouse',
      headerName: 'Bodega',
      type: 'string',
      minWidth: 90,
      flex: 0.9,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'quantityEntry',
      headerName: 'Cantidad Entrada',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter: (params) => {
        return setDecimalPlacesString(params.value as number, 2);
      },
    },
    {
      field: 'costUnitEntry',
      headerName: 'Costo Unitario Entrada',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter(params) {
        return setDecimalPlacesString(params.value as number, 6);
      },
    },
    {
      field: 'costTotalEntry',
      headerName: 'Costo Total Entrada',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter(params) {
        return setCurrencyNumber(params.value as number);
      },
    },
    {
      field: 'quantityExit',
      headerName: 'Cantidad Salida',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter: (params) => {
        return setDecimalPlacesString(params.value as number, 2);
      },
    },
    {
      field: 'costUnitExit',
      headerName: 'Costo Unitario Salida',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter(params) {
        return setDecimalPlacesString(params.value as number, 6);
      },
    },
    {
      field: 'costTotalExit',
      headerName: 'Costo Total Salida',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter(params) {
        return setCurrencyNumber(params.value as number);
      },
    },
    {
      field: 'quantityInventory',
      headerName: 'Cantidad Existente',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter: (params) => {
        return setDecimalPlacesString(params.value as number, 2);
      },
    },
    {
      field: 'costUnitInventory',
      headerName: 'Costo Unitario Existente',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter(params) {
        return setDecimalPlacesString(params.value as number, 6);
      },
    },
    {
      field: 'costTotalInventory',
      headerName: 'Costo Total Existente',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
      valueFormatter(params) {
        return setCurrencyNumber(params.value as number);
      },
    },
    {
      field: 'document',
      headerName: 'Documento',
      type: 'string',
      minWidth: 150,
      flex: 1.5,
      sortable: false,
      disableColumnMenu: true,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'description',
      headerName: 'Descripción',
      type: 'string',
      minWidth: 600,
      flex: 7,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      disableColumnMenu: true,
    },
  ];

  const handleInputChangeAutocomplete = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(newInputValue);
    }
  };

  // * * * * * * * * * * * * * * * * * USE EFFECT * * * * * * * * * * * * * * *
  const fetchData = async (search: string) => {
    try {
      const response: ServerResponseType | undefined =
        await getProductosByParams(search);
      if (response) {
        if (response.status === 200) {
          const productos = response.message as ProductoType[];
          setProductsList(productos);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setProductsList([]);
          enqueueSnackbar('No se ha encontrado el producto buscado', {
            variant: 'info',
          });
        } else {
          enqueueSnackbar('Error Del Servidor: ' + error.message, {
            variant: 'error',
          });
        }
      }
    }
  };
  useEffect(() => {
    if (searchTerm.length >= 3) {
      fetchData(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (formState.product === null) {
      onResetForm();
      setSearchTerm('');
      setWarehousesList([]);
      setKardexView({
        productCode: '',
        productName: '',
        productGroup: '',
        quantityAvailable: 0,
        averageCost: 0,
      });
    } else {
      fetchGetKardexView(formState.product.productId);
    }
  }, [formState.product]);

  const fetchGetKardexView = async (productIdSearch: number) => {
    const response: ServerResponseType | undefined = await getKardexView(
      productIdSearch
    );

    if (response) {
      if (response.status === 200) {
        setKardexView(response.message);
      } else {
        enqueueSnackbar(`No se pudo cargar el kardex: ${response.message}`, {
          variant: 'error',
        });
      }
    }
  };

  useEffect(() => {
    if (formState.branch !== null) {
      const getWarehouses = async () => {
        fetchBySucursal(formState.branch.branchId).then((response) => {
          if (response) {
            setWarehousesList(response);
          }
        });
      };
      getWarehouses();
    } else {
      setFormState({
        ...formState,
        warehouses: [],
      });
      setWarehousesList([]);
    }
  }, [formState.branch]);
  const fetchGetDetailKardexView = async (
    form: DetailKardexSearcherInterface
  ) => {
    try {
      const response: ServerResponseType | undefined =
        await getDetalleKardexView(form);
      if (response) {
        if (response.status === 200) {
          setKardexResult(response.message);
          enqueueSnackbar(`Resultado Cargado Correctamente`, {
            variant: 'success',
          });
        } else {
          enqueueSnackbar(
            `No se pudo cargar el resultado: ${response.message}`,
            {
              variant: 'error',
            }
          );
        }
      }
    } catch (error) {
      enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
    }
  };

  /**
   * ? * * * * * * * * * * MANEJO DESDE VISTA EXTERNA * * * * * * * * * * *
   */
  useEffect(() => {
    if (productId) {
      setFormState(initialFormState);
      fetchGetKardexView(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (
      formState.product === null &&
      kardexView &&
      kardexView.productName !== ''
    ) {
      fetchData(kardexView.productName);
      setFormState((prevFormState: any) => ({
        ...prevFormState,
        startDate: startOfMonth(new Date()),
      }));
      const formToSend: DetailKardexSearcherInterface = {
        productId: productId,
        branchId: null,
        warehouseId: null,
        movementTypeId: null,
        startDate: startOfMonth(new Date()),
        endDate: new Date(),
      };
      fetchGetDetailKardexView(formToSend);
    }
  }, [kardexView]);

  useEffect(() => {
    if (formState.product === null && productsList.length > 0) {
      setFormState((prevFormState: any) => ({
        ...prevFormState,
        product: productsList[0],
      }));
    }
  }, [kardexResult]);

  useEffect(() => {
    if (pagination) {
      const kardex = pagination.list as KardexMain[];
      setRows(
        kardex.map((kardex: KardexMain) => {
          return {
            ...kardex,
            id: randomId(),
          };
        })
      );
    }
  }, [pagination]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnabledLoading(true);
    const warehouseIdList =
      formState.warehouses.length > 0
        ? formState.warehouses.map(
            (item: BodegaGetInterface) => item.warehouseId
          )
        : null;
    const warehouseIdstring =
      warehouseIdList !== null ? warehouseIdList.map(String).join(',') : null;
    const movementsIdList =
      formState.movements.length > 0
        ? formState.movements.map(
            (movement: { label: string; value: number }) => movement.value
          )
        : null;
    const movementsIdstring =
      movementsIdList !== null ? movementsIdList.map(String).join(',') : null;
    const getResult = async () => {
      const paginacion = await fetchPaginationKardex(
        formState.branch?.branchId ?? null,
        warehouseIdstring,
        movementsIdstring,
        formState.byCurrentMonth,
        formState.startDate !== null
          ? format(formState.startDate, 'dd/MM/yyyy')
          : null,
        formState.endDate !== null
          ? format(formState.endDate, 'dd/MM/yyyy')
          : null,
        formState.page,
        formState.pageSize,
        formState.product?.productId ?? null
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
  };

  useEffect(() => {
    const getMainPage = async () => {
      const warehouseIdList =
        formState.warehouses.length > 0
          ? formState.warehouses.map(
              (item: BodegaGetInterface) => item.warehouseId
            )
          : null;
      const warehouseIdstring =
        warehouseIdList !== null ? warehouseIdList.map(String).join(',') : null;
      const movementsIdList =
        formState.movements.length > 0
          ? formState.movements.map(
              (movement: { label: string; value: number }) => movement.value
            )
          : null;
      const movementsIdstring =
        movementsIdList !== null ? movementsIdList.map(String).join(',') : null;
      const paginacion = await fetchPaginationKardex(
        formState.branch?.branchId ?? null,
        warehouseIdstring,
        movementsIdstring,
        formState.byCurrentMonth,
        formState.startDate !== null
          ? format(formState.startDate, 'dd/MM/yyyy')
          : null,
        formState.endDate !== null
          ? format(formState.endDate, 'dd/MM/yyyy')
          : null,
        formState.page,
        formState.pageSize,
        formState.product?.productId ?? null
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getMainPage();
  }, [formState.product]);

  return (
    <>
      <CardLayout
        title={'KARDEX '}
        createMode={false}
        cancelFunction={() => {}}
      >
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: 'white' }} />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Typography sx={{ fontWeight: 'bold' }}>
                  INFORMACIÓN GENERAL
                </Typography>
              </div>
            </AccordionSummary>
            <Divider sx={{ mb: 1 }} />
            <AccordionDetails>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={productsList}
                    getOptionLabel={(option) => option.shortName}
                    style={{ width: '100%' }}
                    onChange={(event, value) =>
                      onAutocompleteChange(event, 'product', value)
                    }
                    onInputChange={(event, newInputValue) =>
                      handleInputChangeAutocomplete(event, newInputValue)
                    }
                    value={formState.product}
                    isOptionEqualToValue={(option, value) =>
                      option?.shortName === value?.shortName
                    }
                    filterOptions={(options) => options}
                    autoHighlight
                    autoSelect
                    fullWidth
                    handleHomeEndKeys
                    noOptionsText="Sin resultados"
                    renderOption={(props, option: ProductoType) => (
                      <li {...props} key={option.productId}>
                        {`${option.productCode} - ${option.shortName}`}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Producto"
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
                    label="Código"
                    value={kardexView?.productCode}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: kardexView?.productCode === '' ? false : true,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Grupo"
                    value={kardexView?.productGroup}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: kardexView?.productGroup === '' ? false : true,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="Esta información es global">
                    <TextField
                      label="Cantidad Disponible"
                      value={kardexView?.quantityAvailable}
                      type="number"
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="Esta información es global">
                    <TextField
                      label="Costo Promedio"
                      value={kardexView?.averageCost}
                      type="number"
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Tooltip>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          {formState.product !== null && (
            <>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Typography sx={{ fontWeight: 'bold' }}>
                      BUSCADOR
                    </Typography>
                  </div>
                </AccordionSummary>
                <Divider sx={{ mb: 1 }} />
                <AccordionDetails>
                  <form
                    onSubmit={onSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={4}>
                        <TextField
                          label="Nombre Producto"
                          value={kardexView?.productName}
                          InputProps={{
                            readOnly: true,
                          }}
                          InputLabelProps={{
                            shrink:
                              kardexView?.productName === '' ? false : true,
                          }}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Autocomplete
                          id="autocomplete-sucursales"
                          className={styles.genericFieldStyle}
                          disablePortal
                          options={sucursalesWithAllBranches}
                          getOptionLabel={(option) => option.name}
                          style={{ width: '100%' }}
                          onChange={(event, value) =>
                            onAutocompleteChange(event, 'branch', value)
                          }
                          value={formState.branch}
                          filterOptions={(options, { inputValue }) => {
                            return options.filter((option) =>
                              option.name
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                            );
                          }}
                          isOptionEqualToValue={(option, value) =>
                            option?.name === value?.name
                          }
                          noOptionsText="Sin resultados"
                          disabled={formState.product === null}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Sucursal"
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
                        <Autocomplete
                          multiple
                          options={warehousesList}
                          getOptionLabel={(option) => option.warehouseName}
                          disabled={
                            formState.product === null ||
                            formState.branch === null
                          }
                          filterSelectedOptions
                          value={formState.warehouses}
                          onChange={(event, values) =>
                            onAutocompleteChange(event, 'warehouses', values)
                          }
                          isOptionEqualToValue={(option, value) =>
                            option?.warehouseName === value?.warehouseName
                          }
                          renderInput={(params) => (
                            <TextField {...params} label="Bodegas" />
                          )}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Autocomplete
                          multiple
                          options={movementTypeKardexList}
                          getOptionLabel={(option) => option.label}
                          disabled={formState.product === null}
                          filterSelectedOptions
                          value={formState.movements}
                          onChange={(event, values) =>
                            onAutocompleteChange(event, 'movements', values)
                          }
                          isOptionEqualToValue={(option, value) =>
                            option?.label === value?.label
                          }
                          renderInput={(params) => (
                            <TextField {...params} label="Tipo Movimiento" />
                          )}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <StyledDatePicker
                          label="Fecha Inicio"
                          views={['year', 'month', 'day']}
                          minDate={getStartDateSystem()}
                          maxDate={new Date()}
                          format="dd/MM/yyyy"
                          value={
                            formState.startDate !== null
                              ? formState.startDate
                              : null
                          }
                          onChange={(value) =>
                            onDateChange(value as Date, 'startDate')
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
                                shrink: formState.startDate ? true : false,
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <StyledDatePicker
                          label="Fecha Fin"
                          views={['year', 'month', 'day']}
                          minDate={formState.startDate}
                          maxDate={new Date()}
                          format="dd/MM/yyyy"
                          value={formState.endDate}
                          onChange={(value) =>
                            onDateChange(value as Date, 'endDate')
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
                                shrink: formState.endDate ? true : false,
                              },
                            },
                          }}
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
                      {' '}
                      {kardexResult.length > 0 && (
                        <Button
                          type="button"
                          startIcon={<Autorenew />}
                          style={{ width: '120px' }}
                          sx={{ mr: 2 }}
                          onClick={() => {
                            setKardexView({
                              productCode: '',
                              productName: '',
                              productGroup: '',
                              quantityAvailable: 0,
                              averageCost: 0,
                            });
                            setKardexResult([]);
                            onResetForm();
                          }}
                        >
                          {'Limpiar'}
                        </Button>
                      )}
                      <Button
                        type="submit"
                        startIcon={<Search />}
                        disabled={formState.product === null}
                        style={{ width: '120px' }}
                      >
                        {'Buscar'}
                      </Button>
                    </Grid>
                  </form>
                </AccordionDetails>
              </Accordion>
              <Divider sx={{ mt: 3 }} />
              <QueryClientProvider client={queryClient}>
                <KardexPagination
                  columns={columns}
                  rows={rows}
                  setRows={setRows}
                  pagination={pagination}
                  setPagination={setPagination}
                  formState={formState}
                  setFormState={setFormState}
                  enabledLoading={enabledLoading}
                />
              </QueryClientProvider>
            </>
          )}
        </Grid>
      </CardLayout>
    </>
  );
};

export default KardexViewPage;
