'use client';
import { defaultSucursalType } from '@/constants';
import { DocumentTypeEnum, PathEnum, SucursalEnum } from '@/enums';
import { EstadoLogisticaEnum } from '@/enums/EstadoLogisticaEnum';
import {
  FormState,
  useAccessDocument,
  useBodegaAsync,
  useForm,
  useTransferenciaAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState } from '@/store';
import {
  BodegaGetInterface,
  ListTransEmpaque,
  PaginatedResponseType,
} from '@/types';
import {
  AddCircle,
  DirectionsBoat,
  Download,
  OpenInNew,
  Search,
  Share,
} from '@mui/icons-material';
import { Box, Button, Grid, SelectChangeEvent, Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import format from 'date-fns/format';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BusquedaTransfer } from './components/TransferenciaBusqueda';
import TransferenciaPaginacion from './components/TransferenciaPaginacion';
import { downloadPdf, onShare } from '@/functions';

export type TransferenciaPageProps = {
  // types...
};

export const TransferenciaPage: React.FC<TransferenciaPageProps> = ({}) => {
  const navigate = useNavigate();
  const queryClient = new QueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { openDocument } = useAccessDocument();
  const [open, setOpen] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { sucursales } = useSelector((state: RootState) => state.common);
  const sucursalUser = sucursales.filter(
    (s) => s.branchId === user?.branchId
  )[0] || {
    ...defaultSucursalType,
  };
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  useState<PaginatedResponseType>();
  const [wareHouseList, setWareHouseList] = useState<BodegaGetInterface[]>([]);
  const [wareHouseDestiny, setWareHouseDestiny] = useState<
    BodegaGetInterface[]
  >([]);
  const estadoLogisticaList = Object.keys(EstadoLogisticaEnum)
    .filter((key): key is keyof typeof EstadoLogisticaEnum =>
      isNaN(Number(key))
    )
    .map((key) => ({ label: key, value: EstadoLogisticaEnum[key] }));

  const { fetchBySucursal, fetchAll } = useBodegaAsync();
  const { fetchMainTransferencias, fetchTransferenciaPdf } =
    useTransferenciaAsync();
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const {
    formState,
    onResetForm,
    setFormState,
    onDateChange,
    onAutocompleteChange,
    onInputJustNumber,
  } = useForm({
    startDate: null,
    endDate: null,
    numTransfer: null,
    state: null,
    origin: null,
    destiny: null,
    branch: sucursalUser,
    byCurrentMonth: false,
    page: 0,
    pageSize: 10,
    sortDirection: 'DESC',
    sortColumn: 'registrationDate',
  });

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchTransferenciaPdf(row.transferId).then((response) => {
        downloadPdf(response, `transferencia_${row.transferId}.pdf`);
      });
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchTransferenciaPdf(row.transferId).then((response) => {
        if (response instanceof Blob && response.size > 0) {
          const files: File[] = [
            new File([response], `transferencia_${row.transferId}.pdf`, {
              type: 'application/pdf',
            }),
          ];
          onShare(files);
        } else {
          enqueueSnackbar('No se pudo compartir el documento', {
            variant: 'error',
          });
        }
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'transferId',
      headerName: 'Nro Transferencia',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 100,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'observation',
      headerName: 'Detalle',
      type: 'string',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      sortable: false,
      align: 'center',
    },
    {
      field: 'warehouseOrigin',
      headerName: 'Bod. Origen',
      minWidth: 300,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      valueFormatter: (params) => {
        const origin = params.value;
        const originName = origin
          ? wareHouseDestiny.find((item) => item.warehouseId === origin)
              ?.warehouseName
          : '';
        return originName;
      },
    },
    {
      field: 'warehouseDestination',
      headerName: 'Bod. Destino',
      minWidth: 300,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      valueFormatter: (params) => {
        const destiny = params.value;
        const destinyName = destiny
          ? wareHouseDestiny.find((item) => item.warehouseId === destiny)
              ?.warehouseName
          : '';
        return destinyName;
      },
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha Registro',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      flex: 1,
      sortable: true,
      valueFormatter: (params) => {
        const rawDate = params.value;
        const formattedDate = rawDate
          ? format(new Date(rawDate), 'dd/MM/yyyy')
          : '';
        return formattedDate;
      },
    },
    {
      field: 'receptionDate',
      headerName: 'Fecha Recepción',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      flex: 1,
      sortable: true,
      valueFormatter: (params) => {
        const rawDate = params.value;
        const formattedDate = rawDate
          ? format(new Date(rawDate), 'dd/MM/yyyy')
          : '';
        return formattedDate;
      },
    },
    {
      field: 'logisticStateId',
      headerName: 'Estado',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 120,
      flex: 1,
      sortable: false,
      valueFormatter: (params) => {
        const stateId = params.value;
        const stateName = stateId
          ? estadoLogisticaList.find((item) => item.value === stateId)?.label
          : '';
        return stateName;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 200,
      flex: 1,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <Tooltip title="Abrir Transferencia">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Transferencia"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Descargar Documento">
            <GridActionsCellItem
              icon={<Download />}
              label="Descargar Documento"
              className="textPrimary"
              onClick={handleDownloadClick(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Compartir Documento">
            <GridActionsCellItem
              icon={<Share />}
              label="Compartir Documento"
              className="textPrimary"
              onClick={handleShareClick(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          navigate(PathEnum.TRANSFERENCIA + PathEnum.NEW);
        }}
      >
        Nueva Transferencia
      </Button>
      {user?.branchId === SucursalEnum.MATRIZ && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 1, width: '200px' }}
          startIcon={<DirectionsBoat />}
          onClick={() => {
            navigate(PathEnum.TRANSFERENCIA + PathEnum.NEW, {
              state: {
                isForeign: true,
              },
            });
          }}
        >
          Transferir Importacion
        </Button>
      )}

      <Button
        variant="contained"
        color="secondary"
        sx={{ width: '200px' }}
        startIcon={<Search />}
        onClick={() => setOpen(true)}
      >
        Buscar
      </Button>
    </Box>
  );

  const handleOnSelect = (event: SelectChangeEvent<any>) => {
    setFormState((prevState: FormState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditClick = (id: GridRowId) => () => {
    const transferencia = rows.find((item) => item.id === id);
    openDocument({
      id: transferencia?.transferId,
      navigation: () =>
        navigate(PathEnum.TRANSFERENCIA + PathEnum.VIEW, {
          state: {
            requestId: transferencia?.transferId,
          },
        }),
      documentType: DocumentTypeEnum.TRANSFERENCIA,
    });
  };

  useEffect(() => {
    if (formState.branch !== null) {
      const getWarehouses = async () => {
        fetchBySucursal(formState.branch.branchId).then((response) => {
          if (response) {
            setWareHouseList(response as BodegaGetInterface[]);
          }
        });
      };
      getWarehouses();
    } else {
      setWareHouseList([]);
    }
  }, [formState.branch]);

  useEffect(() => {
    if (formState.branch !== null) {
      const getWarehouses = async () => {
        fetchAll().then((response) => {
          if (response) {
            setWareHouseDestiny(response as BodegaGetInterface[]);
          }
        });
      };
      getWarehouses();
    } else {
      setWareHouseDestiny([]);
    }
  }, []);

  useEffect(() => {
    if (pagination) {
      const transfer = pagination.list as ListTransEmpaque[];
      setRows(
        transfer.map((trans: ListTransEmpaque) => {
          return {
            id: randomId(),
            transferId: trans.transfer.transferId,
            observation: trans.transfer.observation,
            warehouseOrigin: trans.transfer.warehouseOrigin,
            warehouseDestination: trans.transfer.warehouseDestination,
            registrationDate: trans.transfer.registrationDate,
            receptionDate: trans.transfer.receptionDate,
            logisticStateId: trans.transfer.logisticStateId,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fetchMainTransferencias(
        formState.startDate,
        formState.endDate,
        formState.numTransfer,
        formState.state,
        formState.origin,
        formState.destiny,
        formState.byCurrentMonth,
        formState.page,
        formState.pageSize,
        formState.sortDirection,
        formState.sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getMainPage();
  }, []);

  return (
    <>
      <BusquedaTransfer
        open={open}
        setOpen={setOpen}
        formState={formState}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        handleOnSelect={handleOnSelect}
        onInputJustNumber={onInputJustNumber}
        wareHouseList={wareHouseList}
        wareHouseDestiny={wareHouseDestiny}
        onResetForm={onResetForm}
        setPagination={setPagination}
      />
      <CardLayout
        title="TRANSFERENCIA DE MATERIAL"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <TransferenciaPaginacion
                columns={columns}
                rows={rows}
                setRows={setRows}
                pagination={pagination}
                formState={formState}
                setFormState={setFormState}
                setPagination={setPagination}
              />
            </QueryClientProvider>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};
