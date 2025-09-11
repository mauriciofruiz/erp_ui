'use client';
import {
  useBitacoraAsync,
  useForm,
} from '@/hooks';
import { BitacoraType, PaginatedResponseType } from '@/types';
import React, { useEffect, useState } from 'react';
import {
  Grid,
} from '@mui/material';
import { TabPanel } from '@/functions';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import BitacoraClientePaginacion from './BitacoraClientePaginacion';
import { QueryClient, QueryClientProvider } from 'react-query';

type HistorialTabProps = {
  clientId: number | null;
  tabIndex: number;
};

export const HistorialTab: React.FC<HistorialTabProps> = ({
  clientId,
  tabIndex,
}) => {

  const {
    formState,
    setFormState,
  } = useForm({
    clientId: clientId,
    page: 0,
    pageSize: 10,
    sortDirection: 'DESC',
    sortColumn: 'date',
  });
  const queryClient = new QueryClient();
  const { fetchBitacoraByClient } = useBitacoraAsync();
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const invoiceColums: GridColDef[] = [
    {
      field: 'userName',
      headerName: 'Nombre Usuario',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      editable: false,
      flex: 1,
    },
    {
      field: 'field',
      headerName: 'Campo editado',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      editable: false,
      flex: 1,
    },
    {
      field: 'oldValue',
      headerName: 'Valor anterior',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      editable: false,
      flex: 1,
    },
    {
      field: 'newValue',
      headerName: 'Valor nuevo',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      editable: false,
      flex: 1,
    },
    {
      field: 'date',
      headerName: 'Fecha de modificación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      editable: false,
      flex: 1,
    },
  ];

  useEffect(() => {
    if (pagination) {
      const data = pagination.list as BitacoraType[];
      setRows(
        data.map((bitacoraType: BitacoraType) => {
          return {
            id: bitacoraType.logId,
            userId: bitacoraType.userId,
            userName: bitacoraType.userName,
            field: bitacoraType.field,
            oldValue: bitacoraType.oldValue,
            newValue: bitacoraType.newValue,
            date: bitacoraType.date,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      if (clientId !== null) {
        const paginacion = await fetchBitacoraByClient(
          formState.clientId,
          formState.page,
          formState.pageSize,
          formState.sortDirection,
          formState.sortColumn
        );
        setPagination(paginacion as PaginatedResponseType);
      }
    };
    getMainPage();
  }, [clientId]);

  return (
    <>
      <TabPanel value={tabIndex} index={8}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <BitacoraClientePaginacion
                columns={invoiceColums}
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
      </TabPanel>
    </>
  );
};
