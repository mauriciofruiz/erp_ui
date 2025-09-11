'use client';
import { getAperturaImportacionByParams } from '@/backend/adquisiciones/aperturaImportacionServices';
import { DocumentTypeEnum, OrderEnum, PathEnum } from '@/enums';
import { FormState, useAccessDocument, useForm } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType } from '@/types';
import { AperturaImportacionType } from '@/types/importaciones/aperturaImportacionType';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, SelectChangeEvent, Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from '@mui/x-data-grid';
import format from 'date-fns/format';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { BusquedaAvanzadaApertura } from './components/AperturaBusqueda';
import AperturaPaginacion from './components/AperturaPaginacion';

export type AperturaImportacionPageProps = {
  // types...
};

export const AperturaImportacionPage: React.FC<
  AperturaImportacionPageProps
> = ({}) => {
  const {
    onInputChange,
    formState,
    onResetForm,
    setFormState,
    onDateChange,
    onAutocompleteChange,
  } = useForm({
    fechaInicio: null,
    fechaFin: null,
    providerId: null,
    estado: null,
    partida: null,
    listaPedido: null,
  });

  const navigate = useNavigate();
  const { openDocument } = useAccessDocument();
  const [open, setOpen] = useState<boolean>(false);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [aperturaImportacion, setAperutaImportacion] = useState<
    AperturaImportacionType[]
  >([]);
  const [paginatedResponse, setPaginatedResponse] =
    useState<PaginatedResponseType>();
  const queryClient = new QueryClient();

  const columns: GridColDef[] = [
    {
      field: 'importOpeningId',
      headerName: 'Nro Apertura',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'importOpeningCode',
      headerName: 'Partida',
      type: 'string',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      sortable: false,
      align: 'center',
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      sortable: true,
      valueFormatter: (params) => {
        const rawDate = params.value;
        const formattedDate = rawDate
          ? format(new Date(rawDate), 'dd/MM/yyyy')
          : '';
        return formattedDate;
      },
    },
    {
      field: 'orderListId',
      headerName: 'Lista Pedido',
      width: 300,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'multiInvoice',
      headerName: 'Multi Factura',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      sortable: false,
      valueGetter: (params) => (params.value ? 'SI' : 'NO'),
    },
    {
      field: 'importStateName',
      headerName: 'Estado',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <Tooltip title="Abrir Apertura Importación">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Apertura Importación"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          navigate(PathEnum.APERTURA_IMPORTACION + PathEnum.NEW);
        }}
      >
        Nueva Aperuta
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

  const handleOnSelect = (event: SelectChangeEvent<any>) => {
    setFormState((prevState: FormState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditClick = (id: GridRowId) => () => {
    const apertura = rows.find((item) => item.id === id);
    openDocument({
      id: apertura?.importOpeningId,
      navigation: () =>
        navigate(PathEnum.APERTURA_IMPORTACION + PathEnum.VIEW, {
          state: {
            requestId: apertura?.importOpeningId,
          },
        }),
      documentType: DocumentTypeEnum.APERTURA_IMPORTACION,
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formToSend = {
      fechaInicio:
        formState.fechaInicio !== null
          ? format(formState.fechaInicio, 'dd/MM/yyyy')
          : null,
      fechaFin:
        formState.fechaFin !== null
          ? format(formState.fechaFin, 'dd/MM/yyyy')
          : null,
      proveedor: formState.providerId,
      estado: formState.estado,
      partida: formState.partida,
      listaPedido: formState.listaPedido,
    };

    const fetchGetListaPedidodBusqueda = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getAperturaImportacionByParams(
            formToSend.partida,
            formToSend.proveedor,
            formToSend.estado,
            formToSend.fechaInicio,
            formToSend.fechaFin,
            formToSend.listaPedido,
            null,
            null,
            OrderEnum.DESC,
            OrderEnum.SORT_FIELD_AP,
            false
          );
        if (response) {
          if (response.status === 200) {
            setAperutaImportacion(response.message.list);
            const paginatedResponse: PaginatedResponseType = {
              limit: 10,
              list: response.message,
              page: 10,
              totalPages: 10,
              totalRecords: parseInt(response.message.totalRecords),
            };
            setPaginatedResponse(paginatedResponse);
            return paginatedResponse;
          } else {
            enqueueSnackbar(
              `No se pudieron cargar las aperturas de importación: ${response.message}`,
              {
                variant: 'error',
              }
            );
          }
        }
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };
    fetchGetListaPedidodBusqueda();

    setOpen(false);
    onResetForm();
  };

  return (
    <>
      <BusquedaAvanzadaApertura
        open={open}
        setOpen={setOpen}
        onSubmit={onSubmit}
        formState={formState}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        onInputChange={onInputChange}
        handleOnSelect={handleOnSelect}
      />
      <CardLayout
        title="Aperturas de Importación"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <AperturaPaginacion
                columns={columns}
                rows={rows}
                setRows={setRows}
                aperturaImportacion={aperturaImportacion}
                setAperutaImportacion={setAperutaImportacion}
                paginatedResponse={paginatedResponse}
                setPaginatedResponse={setPaginatedResponse}
              />
            </QueryClientProvider>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};
