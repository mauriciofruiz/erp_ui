'use client';
import { useCobroAsync, useForm,  } from '@/hooks';
import { CobroMainType, PaginatedResponseType } from '@/types';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ColumnsDefinition } from './components/ColumnDefinition';
import { randomId } from '@mui/x-data-grid-generator';
import { CardLayout } from '@/modules/layout';
import { Box, Button, Grid } from '@mui/material';
import { Paginacion } from './components/Paginacion';
import { DialogoBusqueda } from './components/DialogoBusqueda';
import { Search } from '@mui/icons-material';

export type CobrosClientesMainProps = {
  // types...
};

export const CobrosClientesMain: React.FC<CobrosClientesMainProps> = ({}) => {

  const { fetchMainPage } = useCobroAsync();

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
    onGenericChange,
    onAutocompleteChange,
    onInputNumberChange,
    setFormState,
  } = useForm({
    chargeId: null,
    clientId: null,
    userId: null,
    invoiceNumber: null,
    branchId: null,
    amount: null,
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
      
      const documentList = pagination.list as CobroMainType[];

      if (!documentList) setRows([]);
      else {
        setRows(
          documentList.map((doc: CobroMainType) => {
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
        formState.chargeId,
        formState.clientId,
        formState.userId,
        formState.invoiceNumber,
        formState.branchId,
        formState.amount,
        formState.startDate,
        formState.endDate,
        formState.currentMonth,
        formState.page,
        formState.pageSize,
        formState.sortDirection,
        formState.sortField
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
        onInputChange={onInputChange}
        onGenericChange={onGenericChange}
        onAutocompleteChange={onAutocompleteChange}
        onInputNumberChange={onInputNumberChange}
        setFormState={setFormState}
      />
      <CardLayout
        title="Cobros Clientes"
        positionTitle={'left'}
        headerActions={
					 headerComponents 
				}
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
