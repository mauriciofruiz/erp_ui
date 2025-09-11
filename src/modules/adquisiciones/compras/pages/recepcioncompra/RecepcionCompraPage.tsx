import { useForm, useRecepcionProveedorAsync } from '@/hooks';
import { CardLayout } from '@/modules';
import { PaginatedResponseType, RecepcionCompraGetType } from '@/types';
import { Box, Button, Grid } from '@mui/material';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ColumnsDefinition, DialogoBusqueda } from './page';
import { randomId } from '@mui/x-data-grid-generator';
import Paginacion from './page/Paginacion';
import { Search } from '@mui/icons-material';

export type RecepcionCompraPageProps = {};

const RecepcionCompraPage: React.FC<RecepcionCompraPageProps> = ({}) => {
  const { fetchMainPage } = useRecepcionProveedorAsync();

  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const queryClient = new QueryClient();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  // * * * * * * * * * * * * PAGINACIÓN * * * * * * * * * * * *

  const [open, setOpen] = useState<boolean>(false);

  const columns: GridColDef[] = ColumnsDefinition({ rows });

  const {
    formState,
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    setFormState,
  } = useForm({
    stateIdList: null,
    receptionId: null,
    invoiceNumber: null,
    providerId: null,
    branchId: null,
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
      const list = pagination.list as RecepcionCompraGetType[];
      setRows(
        list.map((recepcion: RecepcionCompraGetType) => {
          return {
            id: randomId(),
            ...recepcion,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fetchMainPage(
        formState.stateIdList,
        formState.receptionId,
        formState.invoiceNumber,
        formState.providerId,
        formState.branchId,
        formState.starDate,
        formState.endDate,
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

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
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
      />
      <CardLayout
        title="RECEPCIÓN DE COMPRA"
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
              />
            </QueryClientProvider>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};

export default RecepcionCompraPage;
