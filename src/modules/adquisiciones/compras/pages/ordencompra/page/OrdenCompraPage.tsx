import { useForm, useOrdenCompraAsync } from '@/hooks';
import { CardLayout, DialogoBusqueda } from '@/modules';
import { OrdenCompraGetType, PaginatedResponseType } from '@/types';
import { Box, Button, Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ColumnsDefinition } from './ColumnsDefinition';
import { randomId } from '@mui/x-data-grid-generator';
import Paginacion from './Paginacion';
import { AddCircle, Search } from '@mui/icons-material';
import { PathEnum } from '@/enums';

type OrdenCompraPageProps = {
  isForeign: boolean;
};

export const OrdenCompraPage: React.FC<OrdenCompraPageProps> = ({
  isForeign = false,
}) => {
  const location = useLocation();

  const navigate = useNavigate();

  const productId =
    location && location.state && location.state.productId
      ? location.state.productId
      : localStorage.getItem('state')
      ? JSON.parse(localStorage.getItem('state') || '').productId || undefined
      : undefined;

  const [open, setOpen] = useState<boolean>(false);

  const { fetchMainPage } = useOrdenCompraAsync();

  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const queryClient = new QueryClient();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  const columns: GridColDef[] = ColumnsDefinition({ rows, isForeign });

  const {
    formState,
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    setFormState,
  } = useForm({
    stateIdList: null,
    orderId: null,
    userId: null,
    providerId: null,
    branchId: null,
    importOpeningId: null,
    productId: null,
    starDate: null,
    endDate: null,
    byCurrentMonth: true,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortColumn: null,
  });

  useEffect(() => {
    if (pagination) {
      const list = pagination.list as OrdenCompraGetType[];
      setRows(
        list.map((orden: OrdenCompraGetType) => {
          return {
            id: randomId(),
            ...orden,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    if (productId && productId !== null) {
      setFormState({
        ...formState,
        byCurrentMonth: true,
        productId: productId,
      });

      const getMainPage = async () => {
        const paginacion = await fetchMainPage(
          formState.stateIdList,
          formState.orderId,
          formState.userId,
          formState.providerId,
          formState.branchId,
          formState.importOpeningId,
          productId,
          formState.starDate,
          formState.endDate,
          true,
          isForeign,
          formState.page,
          formState.pageSize,
          formState.sortDirection,
          formState.sortColumn
        );
        setPagination(paginacion as PaginatedResponseType);
      };
      getMainPage();
    }
  }, [productId]);

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          const path = isForeign
            ? PathEnum.ORDEN_COMPRA_EXTERIOR
            : PathEnum.ORDEN_COMPRA;
          navigate(path + PathEnum.NEW);
        }}
      >
        Nueva Orden
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

  return (
    <>
      <DialogoBusqueda
        open={open}
        setOpen={setOpen}
        setPagination={setPagination}
        formState={formState}
        onInputChange={onInputChange}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        setFormState={setFormState}
        isForeign={isForeign}
      />
      <CardLayout
        title={'ORDEN DE COMPRA' + (isForeign ? ' DEL EXTERIOR' : ' NACIONAL')}
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <Paginacion
                columns={columns}
                rows={rows}
                setRows={setRows}
                pagination={pagination}
                setPagination={setPagination}
                formState={formState}
                setFormState={setFormState}
                isForeign={isForeign}
              />
            </QueryClientProvider>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};
