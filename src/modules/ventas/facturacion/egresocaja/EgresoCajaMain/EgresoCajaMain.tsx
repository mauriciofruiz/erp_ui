'use client';
import { useEgresoCajaAsync, useForm } from '@/hooks';
import { EgresoCajaType, PaginatedResponseType } from '@/types';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { QueryClient, QueryClientProvider } from 'react-query';
import { randomId } from '@mui/x-data-grid-generator';
import { Box, Button, Grid } from '@mui/material';
import {  Search } from '@mui/icons-material';
import { CardLayout } from '@/modules/layout';
import { ColumnsDefinition } from './components/ColumnDefinition';
import { DialogoBusqueda } from './components/DialogoBusqueda';
import { Paginacion } from './components/Paginacion';
import React, { useEffect, useState } from 'react';

export type EgresoCajaMainProps = {
  // types...
};

export const EgresoCajaMain: React.FC<EgresoCajaMainProps> = ({}) => {
  const { fetchMainPage } = useEgresoCajaAsync();

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

  const { formState, onDateChange, onAutocompleteChange, setFormState, onInputChangeTwoDecimal , onInputChange} =
    useForm({
      stateIds: null,
      branchId: null,
      flowOutId: null, 
      amount: null,
      description: null,
      userId: null,
      byCurrentMonth: true,
      startDate: null,
      endDate: null,
      page: 0,
      pageSize: 10,
      sortField: null,
      sortDirection: null,
    });
    useEffect(() => {
      if (pagination) {
        const documentList = pagination.list as EgresoCajaType[];
  
        if (!documentList) setRows([]);
        else {
          setRows(
            documentList.map((doc: EgresoCajaType) => {
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
          formState.stateIds,
          formState.branchId,
          formState.flowOutId,
          formState.amount,
          formState.description,
          formState.userId,
          formState.byCurrentMonth,
          formState.startDate,
          formState.endDate,
          formState.page,
          formState.pageSize,
          formState.sortColumn,
          formState.sortDirection,
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
          onInputChangeTwoDecimal={onInputChangeTwoDecimal}
          onInputChange={onInputChange}
        />
        <CardLayout
          title="Egreso de Caja"
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
