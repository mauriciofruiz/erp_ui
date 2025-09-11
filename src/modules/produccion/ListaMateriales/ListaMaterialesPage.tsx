'use client';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  FormState,
  useAccessDocument,
  useForm,
  useListaMaterialesAsync,
} from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { PaginatedResponseType } from '@/types';
import { ListReceta } from '@/types/inventario/receta.type';
import {
  AddCircle,
  Download,
  OpenInNew,
  Search,
  Share,
} from '@mui/icons-material';
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
import { ListaMaterialesBusqueda } from './components/ListaMaterialesBusqueda';
import { ListaMaterialesPaginacion } from './components/ListaMaterialesPaginacion';
import { useSnackbar } from 'notistack';
import { downloadPdf, onShare } from '@/functions';
export type ListaMetrialesProps = {
  // types...
};

export const ListaMaterialesPage: React.FC<ListaMetrialesProps> = ({}) => {
  const {
    onInputJustNumber,
    onInputChange,
    formState,
    onResetForm,
    setFormState,
    onDateChange,
    onAutocompleteChange,
  } = useForm({
    startDate: null,
    endDate: null,
    code: null,
    product: null,
    productName: null,
    user: null,
    byCurrentMonth: false,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortColumn: null,
  });

  const navigate = useNavigate();
  const queryClient = new QueryClient();
  const { openDocument } = useAccessDocument();
  const [open, setOpen] = useState<boolean>(false);
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const { fecthMainPageListaMateriales } = useListaMaterialesAsync();
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const { enqueueSnackbar } = useSnackbar();

  const { fetchListaMaterialPdf } = useListaMaterialesAsync();

  const handleDownloadClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchListaMaterialPdf(row.recipeId).then((response) => {
        downloadPdf(response, `lista_materiales_${row.recipeId}.pdf`);
      });
    }
  };

  const handleShareClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      fetchListaMaterialPdf(row.recipeId).then((response) => {
        if (response instanceof Blob && response.size > 0) {
          const files: File[] = [
            new File([response], `lista_materiales_${row.recipeId}.pdf`, {
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
      field: 'recipeId',
      headerName: 'Nro',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'productCode',
      headerName: 'Cod. Producto',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'productName',
      headerName: 'Producto',
      type: 'string',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      sortable: false,
      align: 'center',
    },
    {
      field: 'state',
      headerName: 'Estado',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      sortable: false,
      valueGetter: (params) => (params.value ? 'Activo' : 'Inactivo'),
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha Creación',
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
      field: 'cost',
      headerName: 'Costo',
      width: 300,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'userName',
      headerName: 'Creado Por',
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
          <Tooltip title="Abrir Receta">
            <GridActionsCellItem
              icon={<OpenInNew />}
              label="Abrir Receta"
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
        color="primary"
        sx={{ mr: 1, width: '200px' }}
        startIcon={<AddCircle />}
        onClick={() => {
          navigate(PathEnum.LISTA_MATERIALES + PathEnum.NEW);
        }}
      >
        Nueva Lista de Material
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
    const receta = rows.find((item) => item.id === id);
    openDocument({
      id: receta?.recipeId,
      navigation: () =>
        navigate(PathEnum.LISTA_MATERIALES + PathEnum.VIEW, {
          state: {
            requestId: receta?.recipeId,
          },
        }),
      documentType: DocumentTypeEnum.LISTA_MATERIALES,
    });
  };

  useEffect(() => {
    if (pagination) {
      const listaMateriales = pagination.list as ListReceta[];
      setRows(
        listaMateriales.map((receta: ListReceta) => {
          return {
            id: randomId(),
            recipeId: receta.recipeId,
            productCode: receta.productCode,
            productName: receta.productName,
            state: receta.state,
            registrationDate: receta.registrationDate,
            cost: receta.cost,
            userName: receta.userName,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    const getMainPage = async () => {
      const paginacion = await fecthMainPageListaMateriales(
        formState.startDate,
        formState.endDate,
        formState.code,
        formState.product,
        formState.productName,
        formState.user,
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
      <ListaMaterialesBusqueda
        open={open}
        setOpen={setOpen}
        formState={formState}
        onDateChange={onDateChange}
        onAutocompleteChange={onAutocompleteChange}
        onInputChange={onInputChange}
        handleOnSelect={handleOnSelect}
        onInputJustNumber={onInputJustNumber}
        setPagination={setPagination}
        onResetForm={onResetForm}
      />
      <CardLayout
        title="Lista de Materiales"
        positionTitle={'left'}
        headerActions={headerComponents}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <ListaMaterialesPaginacion
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
