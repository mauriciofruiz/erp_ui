'use client';
import { defaultSucursalType } from '@/constants';
import { DocumentTypeEnum, OrderEnum, PathEnum } from '@/enums';
import { EstadoProduccionEnum } from '@/enums/EstadoProduccionEnum';
import {
  FormState,
  useAccessDocument,
  useForm,
  useOrdenPedidoAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { PaginatedResponseType } from '@/types';
import { OrdenPedidoList } from '@/types/inventario/ordenPedido.type';
import {
  AddCircle,
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
import format from 'date-fns/format';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { OrdenPedidoBusqueda } from './components/OrdenPedidoBusqueda';
import { OrdenPedidoPaginacion } from './components/OrdenPedidoPaginacion';
import { getOrdenesPedidoByParams } from '@/backend/inventario/ordenPedidoServices';
import { enqueueSnackbar } from 'notistack';
import { downloadPdf, onShare } from '@/functions';

export type OrdenPedidoProps = {
  // types...
};

export const OrdenPedidoPage: React.FC<OrdenPedidoProps> = ({}) => {
  const navigate = useNavigate();
  const queryClient = new QueryClient();
  const { openDocument } = useAccessDocument();
  const [open, setOpen] = useState<boolean>(false);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [listOrdenPedido, setOrdenPedido] = useState<OrdenPedidoList[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const { sucursales } = useSelector((state: RootState) => state.common);
  const [paginatedResponse, setPaginatedResponse] =
    useState<PaginatedResponseType>();

  const { fetchOrdenPedidoPdf } = useOrdenPedidoAsync();

  const sucursalUser = sucursales.filter(
    (s) => s.branchId === user?.branchId
  )[0] || {
    ...defaultSucursalType,
  };

  const {
    onInputJustNumber,
    onInputChange,
    formState,
    onResetForm,
    setFormState,
    onDateChange,
    onAutocompleteChange,
  } = useForm({
    startDate: null,
    endDate: null,
    code: null,
    state: null,
    user: null,
    sucursal: sucursalUser.name,
    branch: null,
  });

  const estadoProduccion = Object.keys(EstadoProduccionEnum)
    .filter((key): key is keyof typeof EstadoProduccionEnum =>
      isNaN(Number(key))
    )
    .map((key) => ({ label: key, value: EstadoProduccionEnum[key] }));

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchOrdenPedidoPdf(row.requestId).then((response) => {
        downloadPdf(response, `orden_pedido_${row.requestId}.pdf`);
      });
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchOrdenPedidoPdf(row.requestId).then((response) => {
        if (response instanceof Blob && response.size > 0) {
          const files: File[] = [
            new File([response], `liquidacion_${row.requestId}.pdf`, {
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
      field: 'requestNumber',
      headerName: 'Nro',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'userName',
      headerName: 'Usuario',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha Creación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
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
      field: 'totalQuantity',
      headerName: 'Cantidad Solictada',
      width: 300,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'producedQuantity',
      headerName: 'Cantidad Aprobada',
      type: 'string',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      sortable: false,
      align: 'center',
    },
    {
      field: 'productionStatusId',
      headerName: 'Estado',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      sortable: false,
      valueGetter: (params) => {
        const state = params.value;
        const stateName = state
          ? estadoProduccion.find((item) => item.value === state)?.label
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
      flex: 1,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <Tooltip title="Abrir Orden de Pedido">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Orden de Pedido"
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
          navigate(PathEnum.ORDEN_PEDIDO + PathEnum.NEW);
        }}
      >
        Nueva Orden de Pedido
      </Button>
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
    const ordenPedido = rows.find((item) => item.id === id);
    openDocument({
      id: ordenPedido?.requestId,
      navigation: () =>
        navigate(PathEnum.ORDEN_PEDIDO + PathEnum.VIEW, {
          state: {
            requestId: ordenPedido?.requestId,
          },
        }),
      documentType: DocumentTypeEnum.ORDEN_DE_PEDIDO,
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formToSend = {
      startDate:
        formState.startDate !== null
          ? format(formState.startDate, 'dd/MM/yyyy')
          : null,
      endDate:
        formState.endDate !== null
          ? format(formState.endDate, 'dd/MM/yyyy')
          : null,
      code: formState.code,
      state: formState.state,
      user: formState.user,
      sucursal:
        formState.branch && formState.branch !== null
          ? formState.branch
          : sucursalUser.branchId,
    };

    const fetchGetOrdenPedido = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getOrdenesPedidoByParams(
            formToSend.startDate,
            formToSend.endDate,
            formToSend.code,
            formToSend.state,
            formToSend.user,
            formToSend.sucursal,
            null,
            null,
            OrderEnum.DESC,
            OrderEnum.SORT_FIELD_AP
          );
        if (response) {
          if (response.status === 200) {
            setOrdenPedido(response.message.list);
            const paginatedResponse: PaginatedResponseType = {
              limit: 10,
              list: response.message,
              page: 10,
              totalPages: 10,
              totalRecords: parseInt(response.message.totalRecords),
            };
            setPaginatedResponse(paginatedResponse);
            return paginatedResponse;
          } else {
            enqueueSnackbar(
              `No se pudieron cargar las ordenes de pedido: ${response.message}`,
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

    fetchGetOrdenPedido();

    setOpen(false);
    onResetForm();
  };

  return (
    <>
      <OrdenPedidoBusqueda
        open={open}
        setOpen={setOpen}
        onSubmit={onSubmit}
        formState={formState}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        onInputChange={onInputChange}
        handleOnSelect={handleOnSelect}
        onInputJustNumber={onInputJustNumber}
      />
      <CardLayout
        title="Orden de Pedido"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <OrdenPedidoPaginacion
                columns={columns}
                rows={rows}
                setRows={setRows}
                listOrdenPedido={listOrdenPedido}
                setOrdenPedido={setOrdenPedido}
                paginatedResponse={paginatedResponse}
                setPaginatedResponse={setPaginatedResponse}
              />
            </QueryClientProvider>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};
