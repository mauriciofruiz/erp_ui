'use client';
import { useCommonGeneric, useForm, useRetencionClienteAsync } from '@/hooks';
import { PaginatedResponseType, RetencionMainType } from '@/types';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ColumnsDefinition } from './components/ColumnDefinition';
import { randomId } from '@mui/x-data-grid-generator';
import { CardLayout } from '@/modules/layout';
import { PathEnum } from '@/enums';
import { Grid } from '@mui/material';
import { Paginacion } from './components/Paginacion';
import { DialogoBusqueda } from './components/DialogoBusqueda';

export type RetencionMainProps = {
  // types...
};

export const RetencionMain: React.FC<RetencionMainProps> = ({}) => {
  const { fetchMainPage } = useRetencionClienteAsync();

  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const queryClient = new QueryClient();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  const { headerComponents } = useCommonGeneric();

  // * * * * * * * * * * * * PAGINACIÓN * * * * * * * * * * * *

  const [open, setOpen] = useState<boolean>(false);

  const columns: GridColDef[] = ColumnsDefinition({ rows });

  const {
    formState,
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    onGenericChange,
    setFormState,
  } = useForm({
    startDate: null,
    endDate: null,
    documentNumber: null,
    branchId: null,
    clientId: null,
    value: null,
    byCurrentMonth: true,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortField: null,
  });

  useEffect(() => {
    if (pagination) {
      const documentList = pagination.list as RetencionMainType[];

      if (!documentList) setRows([]);
      else {
        setRows(
          documentList.map((doc: RetencionMainType) => {
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
        formState.startDate,
        formState.endDate,
        formState.documentNumber,
        formState.branchId,
        formState.clientId,
        formState.value,
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
      <DialogoBusqueda
        open={open}
        setOpen={setOpen}
        setPagination={setPagination}
        formState={formState}
        onInputChange={onInputChange}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        setFormState={setFormState}
        onGenericChange={onGenericChange}
      />
      <CardLayout
        title="Retención de Clientes"
        positionTitle={'left'}
        headerActions={headerComponents({
          navigatePath: PathEnum.RETENCION_CLIENTE + PathEnum.NEW,
          firstButtonName: 'Nueva Retención',
          setOpen: setOpen,
        })}
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
