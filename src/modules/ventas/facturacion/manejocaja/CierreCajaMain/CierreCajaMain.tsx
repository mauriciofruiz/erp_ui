'use client';
import { useCierreCajaAsync, useForm } from '@/hooks';
import { CierreCajaMainInterface, PaginatedResponseType } from '@/types';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ColumnsDefinition } from './components/ColumnDefinition';
import { randomId } from '@mui/x-data-grid-generator';
import { Box, Button, Grid } from '@mui/material';
import { PathEnum } from '@/enums';
import { AddCircle, Search } from '@mui/icons-material';
import { DialogoBusqueda } from './components/DialogoBusqueda';
import { CardLayout } from '@/modules/layout';
import { Paginacion } from './components/Paginacion';

export type CierreCajaMainProps = {
  // types...
};

export const CierreCajaMain: React.FC<CierreCajaMainProps> = ({}) => {
  const navigate = useNavigate();

  const { fetchMainPage } = useCierreCajaAsync();

  //const { allowCreateFacturaVenta } = useAllowVentas();

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

  const { formState, onDateChange, onAutocompleteChange, setFormState } =
    useForm({
      stateIds: null,
      branchId: null,
      userId: null,
      byCurrentMonth: true,
      startDate: null,
      endDate: null,
      page: 0,
      pageSize: 10,
      sortDirection: null,
      sortField: null,
    });

  useEffect(() => {
    if (pagination) {
      const documentList = pagination.list as CierreCajaMainInterface[];

      if (!documentList) setRows([]);
      else {
        setRows(
          documentList.map((doc: CierreCajaMainInterface) => {
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
        formState.userId,
        formState.byCurrentMonth,
        formState.startDate,
        formState.endDate,
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
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          navigate(PathEnum.CIERRE_CAJA + PathEnum.NEW);
        }}
      >
        Nuevo Cierre
      </Button>
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
      />
      <CardLayout
        title="Cierra de Caja"
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
