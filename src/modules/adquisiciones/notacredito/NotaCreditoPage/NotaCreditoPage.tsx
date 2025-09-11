'use client';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  FormState,
  useAccessDocument,
  useForm,
  useNotaCreditoProveedorAsyc,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { NotaCreditoMain, PaginatedResponseType } from '@/types';
import { AddCircle, OpenInNew, Search } from '@mui/icons-material';
import { Box, Button, Grid, SelectChangeEvent, Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from '@mui/x-data-grid';
import format from 'date-fns/format';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { BusquedaAvanzadaNC } from './components';
import NotaCreditoPaginacion from './components/NotaCreditoPaginacion';
import { setCurrencyNumber } from '@/functions';

export type NotaCreditoPageProps = {
  // types...
};

export const NotaCreditoPage: React.FC<NotaCreditoPageProps> = ({}) => {
  const {
    onInputChange,
    formState,
    onResetForm,
    setFormState,
    onDateChange,
    onAutocompleteChange,
    onInputNumberChange,
  } = useForm({
    startDate: null,
    endDate: null,
    numberNc: null,
    user: null,
    providerId: null,
    stateIdList: null,
    value: null,
    type: null,
    byCurrentMonth: false,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortColumn: null,
  });

  const queryClient = new QueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const { openDocument } = useAccessDocument();
  const { fetchMainNotaCreditoP } = useNotaCreditoProveedorAsyc();
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const columns: GridColDef[] = [
    {
      field: 'emmisionDate',
      headerName: 'Fecha Emisión',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      minWidth: 100,
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
      field: 'creditNoteNumber',
      headerName: 'Nro NC',
      flex: 1,
      minWidth: 120,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'invoiceNumber',
      headerName: 'Nro Factura',
      flex: 1,
      minWidth: 120,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'ncTypeName',
      headerName: 'Tipo',
      flex: 1,
      minWidth: 120,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'providerName',
      headerName: 'Proveedor',
      flex: 2,
      minWidth: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'creditNoteValue',
      headerName: 'Valor de la NC',
      flex: 0.8,
      minWidth: 80,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      valueFormatter: (params) =>
        params.value === undefined
          ? setCurrencyNumber(0.0)
          : setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'crossedValue',
      headerName: 'Valor Cruzado',
      flex: 0.8,
      minWidth: 80,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      valueFormatter: (params) =>
        params.value === undefined
          ? setCurrencyNumber(0.0)
          : setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'creditNoteStatusName',
      headerName: 'Estado',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      minWidth: 100,
      sortable: false,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      minWidth: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <Tooltip title="Abrir Lista Pedido">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Lista Pedido"
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
          navigate(PathEnum.NOTA_CREDITO + PathEnum.NEW);
        }}
      >
        NC Tributaria
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          navigate(PathEnum.NOTA_CREDITO + PathEnum.NEW);
        }}
      >
        NC Contable
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
    const row = rows.find((row) => row.id === id);

    if (row) {
      openDocument({
        id: row.id,
        navigation: () => {
          const combinedId = `${row.id}-${DocumentTypeEnum.NOTA_CREDITO_COMPRA}`;
          navigate(PathEnum.NOTA_CREDITO + PathEnum.VIEW, {
            state: {
              requestId: combinedId,
            },
          });
        },
        documentType: DocumentTypeEnum.NOTA_CREDITO_COMPRA,
      });
    }
  };

  useEffect(() => {
    if (pagination) {
      const notaCredito = pagination.list as NotaCreditoMain[];
      setRows(
        notaCredito.map((nc: NotaCreditoMain) => {
          return {
            id: nc.id,
            emmisionDate: nc.emmisionDate,
            creditNoteNumber: nc.creditNoteNumber,
            invoiceNumber: nc.invoiceNumber,
            ncTypeName: nc.ncTypeName,
            providerName: nc.providerName,
            creditNoteValue: nc.creditNoteValue,
            crossedValue: nc.crossedValue,
            creditNoteStatusName: nc.creditNoteStatusName,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fetchMainNotaCreditoP(
        formState.startDate,
        formState.endDate,
        formState.numberNc,
        formState.user,
        formState.providerId,
        formState.stateIdList,
        formState.value,
        formState.type,
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
      <BusquedaAvanzadaNC
        open={open}
        setOpen={setOpen}
        formState={formState}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        onInputChange={onInputChange}
        handleOnSelect={handleOnSelect}
        setPagination={setPagination}
        onResetForm={onResetForm}
        onInputNumberChange={onInputNumberChange}
        setFormState={setFormState}
      />
      <CardLayout
        title="Notas de Credito"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <NotaCreditoPaginacion
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
