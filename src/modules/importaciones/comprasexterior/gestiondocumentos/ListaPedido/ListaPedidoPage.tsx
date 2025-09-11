'use client';

import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  FormState,
  useAccessDocument,
  useForm,
  useListaPedidoAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { PaginatedResponseType } from '@/types';
import { ListaPedidoMain } from '@/types/importaciones/listaPedido.type';
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
import { randomId } from '@mui/x-data-grid-generator';
import format from 'date-fns/format';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import ListaPaginacionPedido from './components/ListaPaginacionPedido';
import { BusquedaAvanzada } from './components/ListaPedidoBusqueda';
import { downloadPdf, onShare } from '@/functions';
import { useSnackbar } from 'notistack';

export type ListaPedidoPageProps = {};

export const ListaPedidoPage: React.FC<ListaPedidoPageProps> = ({}) => {
  const {
    onInputChange,
    formState,
    onResetForm,
    setFormState,
    onDateChange,
    onAutocompleteChange,
  } = useForm({
    fechaInicio: null,
    fechaFin: null,
    providerId: null,
    estado: null,
    partida: null,
    byCurrentMonth: false,
    page: 0,
    pageSize: 10,
    sortDirection: 'DESC',
    sortColumn: 'registrationDate',
  });

  const queryClient = new QueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const { openDocument } = useAccessDocument();
  const { fetchMainPageLP, fetchDownloadPdf } = useListaPedidoAsync();
  const { enqueueSnackbar } = useSnackbar();
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchDownloadPdf(row.orderListId).then((response) => {
        downloadPdf(response, `lista_pedido_${row.orderListId}.pdf`);
      });
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchDownloadPdf(row.orderListId).then((response) => {
        if (response instanceof Blob && response.size > 0) {
          const files: File[] = [
            new File([response], `lista_pedido_${row.orderListId}.pdf`, {
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
      field: 'orderListId',
      headerName: 'Nro Lista',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'importCode',
      headerName: 'Partida',
      type: 'string',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      sortable: false,
      align: 'center',
    },
    {
      field: 'providerName',
      headerName: 'Proveedor',
      width: 300,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha',
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
      field: 'stateName',
      headerName: 'Estado',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      sortable: false,
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
          <Tooltip title="Abrir Lista Pedido">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Lista Pedido"
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
          navigate(PathEnum.LISTA_PEDIDO + PathEnum.NEW);
        }}
      >
        Nueva Lista Pedido
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
    const listaPedido = rows.find((item) => item.id === id);
    openDocument({
      id: listaPedido?.orderListId,
      navigation: () =>
        navigate(PathEnum.LISTA_PEDIDO + PathEnum.VIEW, {
          state: {
            requestId: listaPedido?.orderListId,
          },
        }),
      documentType: DocumentTypeEnum.LISTA_PEDIDO,
    });
  };

  useEffect(() => {
    if (pagination) {
      const listaPedido = pagination.list as ListaPedidoMain[];
      setRows(
        listaPedido.map((listPedido: ListaPedidoMain) => {
          return {
            id: randomId(),
            orderListId: listPedido.orderListId,
            importCode: listPedido.importCode,
            providerName: listPedido.providerName,
            registrationDate: listPedido.registrationDate,
            stateName: listPedido.stateName,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fetchMainPageLP(
        formState.partida,
        formState.providerId,
        formState.estado,
        formState.fechaInicio,
        formState.fechaFin,
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
      <BusquedaAvanzada
        open={open}
        setOpen={setOpen}
        formState={formState}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        onInputChange={onInputChange}
        handleOnSelect={handleOnSelect}
        setPagination={setPagination}
        onResetForm={onResetForm}
      />
      <CardLayout
        title="Lista de Pedido"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <ListaPaginacionPedido
                columns={columns}
                rows={rows}
                setRows={setRows}
                pagination={pagination}
                setPagination={setPagination}
                formState={formState}
                setFormState={setFormState}
              />
            </QueryClientProvider>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};
