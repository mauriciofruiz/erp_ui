'use client';
import { useForm } from '@/hooks';
import { LiquidacionMainInterface, PaginatedResponseType } from '@/types';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ColumnsDefinition } from './ColumnsDefinition';
import { randomId } from '@mui/x-data-grid-generator';
import { Box, Button, Grid } from '@mui/material';
import { AddCircle, Search } from '@mui/icons-material';
import { PathEnum } from '@/enums';
import { DialogoBusqueda } from './DialogoBusqueda';
import { CardLayout } from '@/modules/layout';
import Paginacion from './Paginacion';

type LiquidacionPageProps = {
  // types...
};

export const LiquidacionPage: React.FC<LiquidacionPageProps> = ({}) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState<boolean>(false);

  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const queryClient = new QueryClient();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  const columns: GridColDef[] = ColumnsDefinition({ rows });

  const { formState, onDateChange, onAutocompleteChange, setFormState } =
    useForm({
      stateIdList: null,
      userId: null,
      providerId: null,
      importOpeningId: null,
      startDate: null,
      endDate: null,
      byCurrentMonth: true,
      page: 0,
      pageSize: 10,
      sortDirection: null,
      sortColumn: null,
    });

  useEffect(() => {
    if (pagination) {
      const list = pagination.list as LiquidacionMainInterface[];
      setRows(
        list.map((lista: LiquidacionMainInterface) => {
          return {
            id: randomId(),
            ...lista,
          };
        })
      );
    }
  }, [pagination]);

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          const path = PathEnum.LIQUIDACION;
          navigate(path + PathEnum.NEW);
        }}
      >
        Nueva Liquidación
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
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        setFormState={setFormState}
      />
      <CardLayout
        title={'LIQUIDACIONES DE IMPORTACIONES'}
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
