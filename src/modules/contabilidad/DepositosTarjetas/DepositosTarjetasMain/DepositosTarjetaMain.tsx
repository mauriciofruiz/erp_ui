'use client';
import { useDepositosTarjetasAsync, useForm } from '@/hooks';
import { depositoTarjetaType, PaginatedResponseType } from '@/types';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { QueryClient, QueryClientProvider } from 'react-query';
import { randomId } from '@mui/x-data-grid-generator';
import { Box, Button, Grid } from '@mui/material';
import { Search } from '@mui/icons-material';
import { CardLayout } from '@/modules/layout';
import { ColumnsDefinition } from './components/ColumnDefinition';
import { DialogoBusqueda } from './components/DialogoBusqueda';
import { Paginacion } from './components/Paginacion';
import React, { useEffect, useState } from 'react';

export type DepositosTarjetaMainProps = {
  // types...
};

export const DepositosTarjetaMain: React.FC<
  DepositosTarjetaMainProps
> = ({}) => {
  const { fetchMainPage } = useDepositosTarjetasAsync();

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

  const columns: GridColDef[] = ColumnsDefinition();

  const {
    formState,
    onDateChange,
    onAutocompleteChange,
    setFormState,
    onInputChange,
  } = useForm({
    branchId: null,
    bankId: null,
    amount: null,
    documentNumber: null,
    statusListIds: null,
    registrationStartDate: null,
    registrationEndDate: null,
    startDate: null,
    endDate: null,
    currentMonth: true,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortField: null,
  });
  useEffect(() => {
    if (pagination) {
      const documentList = pagination.list as depositoTarjetaType[];

      if (!documentList) setRows([]);
      else {
        setRows(
          documentList.map((doc: depositoTarjetaType) => {
            return {
              id: randomId(),
              ...doc,
            };
          })
        );
      }
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fetchMainPage(
        formState.branchId,
        formState.bankId,
        formState.amount,
        formState.documentNumber,
        formState.statusListIds,
        formState.registrationStartDate,
        formState.registrationEndDate,
        formState.startDate,
        formState.endDate,
        formState.byCurrentMonth,
        formState.page,
        formState.pageSize,
        formState.sortColumn,
        formState.sortDirection
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
        Búsqueda Avanzada
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
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        setFormState={setFormState}
        onInputChange={onInputChange}
      />
      <CardLayout
        title="Depositos Tarjeta"
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
