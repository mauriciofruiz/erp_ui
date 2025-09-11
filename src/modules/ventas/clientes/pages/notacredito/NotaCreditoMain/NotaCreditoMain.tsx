'use client';
import { useAllowVentas, useForm, useNotaCreditoCAsync } from '@/hooks';
import { NotaCreditoVentaMain, PaginatedResponseType } from '@/types';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ColumnsDefinition } from './components/ColumnDefinition';
import { randomId } from '@mui/x-data-grid-generator';
import { PathEnum } from '@/enums';
import { CardLayout } from '@/modules/layout';
import { Box, Button, Grid } from '@mui/material';
import { Paginacion } from './components/Paginacion';
import { DialogoBusqueda } from './components/DialogoBusqueda';
import { AddCircle, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export type NotaCreditoMainProps = {
  // types...
};

export const NotaCreditoMain: React.FC<NotaCreditoMainProps> = ({}) => {
  const { fetchMainPage } = useNotaCreditoCAsync();

  const { allowCreateNCVenta } = useAllowVentas();

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
    clientId: null,
    documentNumber: null,
    invoiceNumber: null,
    branchId: null,
    ncTypeId: null,
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
      const documentList = pagination.list as NotaCreditoVentaMain[];

      if (!documentList) setRows([]);
      else {
        setRows(
          documentList.map((doc: NotaCreditoVentaMain) => {
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
        formState.clientId,
        formState.documentNumber,
        formState.invoiceNumber,
        formState.branchId,
        formState.ncTypeId,
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

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={async () => {
          const canCreate = await allowCreateNCVenta();
          if (canCreate) {
            navigate(PathEnum.NOTA_CREDITO_CLIENTE + PathEnum.NEW);
          } else {
            enqueueSnackbar(
              <div>
                No puede crear una nota de crédito, por alguno de los siguientes
                motivos:
                <br /> * No tiene permisos para crear una nota de crédito
                <br /> * No tiene asignada una caja
                <br /> * No ha cerrado correctamente su caja previa
              </div>,
              {
                variant: 'error',
                autoHideDuration: 10000,
              }
            );
          }
        }}
      >
        Nueva NC
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
        title="Notas De Crédito"
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
