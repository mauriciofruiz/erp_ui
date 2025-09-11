import { PathEnum } from '@/enums';
import { useAllowVentas, useFacturaVentaAsync, useForm } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { FacturaVentaMain, PaginatedResponseType } from '@/types';
import { AddCircle, Search } from '@mui/icons-material';
import { Box, Button, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GridRowsProp } from '@mui/x-data-grid';
import { GridColDef } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import {
  ColumnsDefinition,
  DialogoBusqueda,
  FacturaVentaPaginacion,
} from './components';
import { enqueueSnackbar } from 'notistack';

export type FacturacionVentaPageProps = {
  // types...
};

export const FacturacionVentaPage: React.FC<
  FacturacionVentaPageProps
> = ({}) => {
  const navigate = useNavigate();

  const { fetchMainPage } = useFacturaVentaAsync();

  const { allowCreateFacturaVenta } = useAllowVentas();

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
    branchId: null,
    userId: null,
    emissionStartDate: null,
    emissionEndDate: null,
    byCurrentMonth: true,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortColumn: null,
  });

  useEffect(() => {
    if (pagination) {
      const facturaList = pagination.list as FacturaVentaMain[];

      if (!facturaList) setRows([]);
      else {
        setRows(
          facturaList.map((factura: FacturaVentaMain) => {
            return {
              id: randomId(),
              ...factura,
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
        formState.branchId,
        formState.userId,
        formState.emissionStartDate,
        formState.emissionEndDate,
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
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={async () => {
          const canCreate = await allowCreateFacturaVenta();
          if (canCreate) {
            navigate(PathEnum.FACTURA_VENTA + PathEnum.NEW);
          } else {
            enqueueSnackbar(
              <div>
                No puede crear una factura de venta, por alguno de los
                siguientes motivos:
                <br /> * No tiene permisos para crear una factura de venta
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
        Nueva Factura
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
        title="FACTURACIÓN PDV"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <FacturaVentaPaginacion
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
