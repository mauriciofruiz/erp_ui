'use client';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  FormState,
  useAccessDocument,
  useForm,
  useRetencionProveedorAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { PaginatedResponseType, RetencionMainInterface } from '@/types';
import { Download, OpenInNew, Search, Share } from '@mui/icons-material';
import { Box, Button, Grid, SelectChangeEvent, Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import format from 'date-fns/format';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { RetencionProveedorBusqueda } from './components/RetencionProveedorBusqueda';
import { RetencionProveedorPaginacion } from './components/RetencionProveedorPaginacion';
import { useSnackbar } from 'notistack';
import { downloadPdf, onShare, setCurrencyNumber } from '@/functions';

export type RetencionProveedorProps = {
  // types...
};

export const RetencionProveedorPage: React.FC<
  RetencionProveedorProps
> = ({}) => {
  const {
    onInputChange,
    formState,
    onResetForm,
    setFormState,
    onDateChange,
    onAutocompleteChange,
    onInputJustNumber,
    onInputNumberChange,
  } = useForm({
    startDate: null,
    endDate: null,
    retentionNumber: null,
    invoiceNumber: null,
    providerId: null,
    retentionValue: null,
    invoiceValue: null,
    branchId: null,
    stateId: null,
    userId: null,
    byCurrentMonth: false,
    page: 0,
    pageSize: 10,
    sortDirection: 'DESC',
    sortColumn: null,
  });
  const queryClient = new QueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const { openDocument } = useAccessDocument();
  const { fetchMainPageRP, fetchRetencionProveedorPdf } =
    useRetencionProveedorAsync();
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const { enqueueSnackbar } = useSnackbar();

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchRetencionProveedorPdf(row.retentionId).then((response) => {
        downloadPdf(response, `retencion_${row.retentionNumber}.pdf`);
      });
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchRetencionProveedorPdf(row.retentionId).then((response) => {
        if (response instanceof Blob && response.size > 0) {
          const files: File[] = [
            new File([response], `retencion_${row.retentionNumber}.pdf`, {
              type: 'application/pdf',
            }),
          ];
          onShare(files);
        } else {
          enqueueSnackbar('No se pudo compartir el documento', {
            variant: 'error',
          });
        }
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'retentionNumber',
      headerName: 'Nro Retención',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 100,
      flex: 2,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'retentionDate',
      headerName: 'Fecha',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 150,
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
      field: 'providerName',
      headerName: 'Proveedor',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 150,
      flex: 2,
      sortable: true,
    },
    {
      field: 'branchName',
      headerName: 'Sucursal',
      type: 'string',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      sortable: false,
      align: 'center',
      flex: 1,
    },
    {
      field: 'invoiceNumber',
      headerName: 'Nro Factura',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      flex: 2,
    },
    {
      field: 'state',
      headerName: 'Estado',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 150,
      sortable: false,
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Correo',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 200,
      sortable: false,
      flex: 2,
    },
    {
      field: 'stateSRI',
      headerName: 'Estado SRI',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 150,
      sortable: false,
      flex: 1,
    },
    {
      field: 'value',
      headerName: 'Valor',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 100,
      sortable: false,
      flex: 1,
      renderCell: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 150,
      flex: 3,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <Tooltip title="Abrir Retencion Proveedor">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Retencion Proveedor"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Descargar Documento">
            <GridActionsCellItem
              icon={<Download />}
              label="Descargar Documento"
              className="textPrimary"
              onClick={handleDownloadClick(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Compartir Documento">
            <GridActionsCellItem
              icon={<Share />}
              label="Compartir Documento"
              className="textPrimary"
              onClick={handleShareClick(id)}
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
        id: row.retentionId,
        navigation: () => {
          const combinedId = `${row.retentionId}-${DocumentTypeEnum.RETENCION_PROVEEDOR}`;
          navigate(PathEnum.RETENCION_PROVEEDOR + PathEnum.VIEW, {
            state: {
              requestId: combinedId,
            },
          });
        },
        documentType: DocumentTypeEnum.RETENCION_PROVEEDOR,
      });
    }
  };

  useEffect(() => {
    if (pagination) {
      const retencion = pagination.list as RetencionMainInterface[];
      setRows(
        retencion.map((retencion: RetencionMainInterface) => {
          return {
            id: randomId(),
            ...retencion,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fetchMainPageRP(
        formState.startDate,
        formState.endDate,
        formState.retentionNumber,
        formState.invoiceNumber,
        formState.providerId,
        formState.retentionValue,
        formState.invoiceValue,
        formState.branchId,
        formState.stateId,
        formState.userId,
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
      <RetencionProveedorBusqueda
        open={open}
        setOpen={setOpen}
        formState={formState}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        onInputChange={onInputChange}
        handleOnSelect={handleOnSelect}
        setPagination={setPagination}
        onResetForm={onResetForm}
        onInputJustNumber={onInputJustNumber}
        onInputNumberChange={onInputNumberChange}
        setFormState={setFormState}
      />
      <CardLayout
        title="RETENCIÓN PROVEEDOR"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <RetencionProveedorPaginacion
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
