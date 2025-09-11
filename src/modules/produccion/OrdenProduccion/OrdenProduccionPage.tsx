'use client';
import { defaultSucursalType } from '@/constants';
import { DocumentTypeEnum, EstadoOrdenProduccionEnum, PathEnum } from '@/enums';
import {
  FormState,
  useAccessDocument,
  useForm,
  useOrdenProduccionAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { PaginatedResponseType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, SelectChangeEvent, Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { OrdenProduccionBusqueda } from './components/OrdenProduccionBusqueda';
import OrdenProduccionPaginacion from './components/OrdenProduccionPaginacion';
import { OrdenProduccionMain } from '@/types/inventario/ordenProduccion.type';
import { randomId } from '@mui/x-data-grid-generator';
import { parseDateWithMiliseconds, setDecimalPlacesString } from '@/functions';

export type OrdenProduccionProps = {};

export const OrdenProduccionPage: React.FC<OrdenProduccionProps> = ({}) => {
  const { sucursales } = useSelector((state: RootState) => state.common);
  const { user } = useSelector((state: RootState) => state.auth);
  const sucursalUser = sucursales.filter(
    (s) => s.branchId === user?.branchId
  )[0] || {
    ...defaultSucursalType,
  };

  const {
    onInputChange,
    formState,
    onResetForm,
    setFormState,
    onDateChange,
    onAutocompleteChange,
    onInputJustNumber,
  } = useForm({
    fechaInicio: null,
    fechaFin: null,
    orderNumber: null,
    state: null,
    orderRequest: null,
    branchRequest: null,
    sucursal: sucursalUser.name,
    byCurrentMonth: false,
    page: 0,
    pageSize: 10,
    sortDirection: 'DESC',
    sortColumn: 'orderId',
  });
  const queryClient = new QueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const { fetchMainPageOP } = useOrdenProduccionAsync();
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const { openDocument } = useAccessDocument();
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const estadoProduccion = Object.keys(EstadoOrdenProduccionEnum)
    .filter((key): key is keyof typeof EstadoOrdenProduccionEnum =>
      isNaN(Number(key))
    )
    .map((key) => ({ label: key, value: EstadoOrdenProduccionEnum[key] }));

  const columns: GridColDef[] = [
    {
      field: 'orderNumber',
      headerName: 'Nro Orden',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 100,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'requestNumber',
      headerName: 'Nro Pedido',
      type: 'string',
      flex: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      sortable: false,
      align: 'center',
    },
    {
      field: 'scheduledQuantity',
      headerName: 'Cantidad Solicitada',
      width: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      renderCell: (params) => setDecimalPlacesString(params.value, 2),
    },
    {
      field: 'totalCostMP',
      headerName: 'Costo T MP',
      width: 125,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      renderCell: (params) => setDecimalPlacesString(params.value, 2),
    },
    {
      field: 'totalCostMO',
      headerName: 'Costo T MO',
      width: 125,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      renderCell: (params) => setDecimalPlacesString(params.value, 2),
    },
    {
      field: 'totalCostCIF',
      headerName: 'Costo T CIF',
      width: 125,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      renderCell: (params) => setDecimalPlacesString(params.value, 2),
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha Creación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 150,
      sortable: true,
      type: 'date',
      valueFormatter: (params) =>
        parseDateWithMiliseconds(params.value as string),
    },
    {
      field: 'endDate',
      headerName: 'Fecha Finalización',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 150,
      sortable: true,
      type: 'date',
      valueFormatter: (params) =>
        parseDateWithMiliseconds(new Date(params.value).toISOString()),
    },
    {
      field: 'orderStatusId',
      headerName: 'Estado',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 120,
      sortable: false,
      valueFormatter: (params) => {
        const status = params.value;
        const statusName = status
          ? estadoProduccion.find((item) => item.value === status)?.label
          : '';
        return statusName;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 100,
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
        ];
      },
    },
  ];

  const handleOnSelect = (event: SelectChangeEvent<any>) => {
    setFormState((prevState: FormState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditClick = (id: GridRowId) => () => {
    const orderProd = rows.find((item) => item.id === id);
    openDocument({
      id: orderProd?.orderId,
      navigation: () =>
        navigate(PathEnum.ORDEN_PRODUCCION + PathEnum.VIEW, {
          state: {
            requestId: orderProd?.orderId,
          },
        }),
      documentType: DocumentTypeEnum.ORDEN_PRODUCCION,
    });
  };

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          navigate(PathEnum.ORDEN_PRODUCCION + PathEnum.NEW);
        }}
      >
        Nueva Orden
      </Button>
      <Button
        variant="contained"
        color="secondary"
        sx={{ width: '200px' }}
        startIcon={<Search />}
        onClick={() => {
          setOpen(true);
          onResetForm();
        }}
      >
        Buscar
      </Button>
    </Box>
  );

  useEffect(() => {
    if (pagination) {
      const listaPedido = pagination.list as OrdenProduccionMain[];
      setRows(
        listaPedido.map((ordenProd: OrdenProduccionMain) => {
          return {
            id: randomId(),
            ...ordenProd,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fetchMainPageOP(
        formState.fechaInicio,
        formState.fechaFin,
        formState.orderNumber,
        formState.state,
        formState.orderRequest,
        formState.branchRequest,
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
      <OrdenProduccionBusqueda
        open={open}
        setOpen={setOpen}
        formState={formState}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        onInputChange={onInputChange}
        handleOnSelect={handleOnSelect}
        setPagination={setPagination}
        onResetForm={onResetForm}
        onInputJustNumber={onInputJustNumber}
      />
      <CardLayout
        title="Orden de Producción"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <OrdenProduccionPaginacion
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
