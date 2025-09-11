'use client';
import { useForm, useSolicitudCompraAsync } from '@/hooks';
import {  PaginatedResponseType, SolicitudCompraType } from '@/types';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ColumnsDefinition } from './components/ColumnDefinition';
import { randomId } from '@mui/x-data-grid-generator';
import { Box, Button, Grid } from '@mui/material';
import { AddCircle, Search } from '@mui/icons-material';
import { PathEnum } from '@/enums';
import { DialogoBusqueda } from './components/DialogoBusqueda';
import { CardLayout } from '@/modules/layout';
import { Paginacion } from './components/Paginacion';

export type SolicitudCompraPageProps = {
  // types...
};

export const SolicitudCompraPage: React.FC<SolicitudCompraPageProps> = ({}) => {
  const navigate = useNavigate();

  const { fetchMainPage } = useSolicitudCompraAsync();


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
    requestPurchaseId: null,
    branchId: null,
    userId: null,
    typeAdquisitionId: null,
    startDate: null,
    endDate: null,
    byCurrentMonth: true,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortField: null,
  });

  useEffect(() => {
    if (pagination) {
      const documentList = pagination.list as SolicitudCompraType[];

      if (!documentList) setRows([]);
      else {
        setRows(
          documentList.map((doc: SolicitudCompraType) => {
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
        formState.stateIdList,
        formState.requestPurchaseId,
        formState.branchId,
        formState.userId,
        formState.typeAdquisitionId,
        formState.byCurrentMonth,
        formState.startDate,
        formState.endDate,
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
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          navigate(PathEnum.SOLICITUD_COMPRA + PathEnum.NEW);
        }}
      >
        Nueva Solicitud 
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
        onInputChange={onInputChange}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        setFormState={setFormState}
      />
      <CardLayout
        title="Solicitud de Compra"
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
