'use client';
import { ModuloEnum, PathEnum } from '@/enums';
import { CustomToolbar, useForm, usePeriodosAsync } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { PeriodInterface } from '@/types';
import { Search } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { esES } from '@mui/x-data-grid/locales';
import { CalendarIcon } from '@mui/x-date-pickers';
import format from 'date-fns/format';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { PeriodoDetalle } from './components/PeriodoDetalle';
import { PeriodoFecha } from './components/PeriodoFecha';
import { useNavigate } from 'react-router-dom';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

export type PeriodoContableProps = {
  // types...
};

export const PeriodoContablePage: React.FC<PeriodoContableProps> = ({}) => {
  const { formState, onResetForm, setFormState, onDateChange } = useForm({
    moduleId: null,
    startDate: null,
    endDate: null,
    page: 0,
    pageSize: 10,
    sortDirection: null,
    sortColumn: null,
    newDatePeriod: null,
  });

  const navigate = useNavigate();
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [periodsList, setPeriodosList] = useState<PeriodInterface[]>([]);
  const { fetchMainPeriodos, fetchSavePeriodo } = usePeriodosAsync();
  const [title, setTitle] = useState<string>('');
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const modulos = Object.keys(ModuloEnum)
    .filter((key): key is keyof typeof ModuloEnum => isNaN(Number(key)))
    .map((key) => ({ label: key.replace(/_/g, ' '), value: ModuloEnum[key] }));

  const columns: GridColDef[] = [
    {
      field: 'moduleId',
      headerName: 'Módulo',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
      valueFormatter: (params) => {
        const idModulo = params.value;
        const moduloName = idModulo
          ? modulos.find((a) => a.value === idModulo)?.label
          : '';
        return moduloName;
      },
    },
    {
      field: 'closingPeriodDate',
      headerName: 'Fecha Cierre Periódo',
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
      field: 'previousPeriodDate',
      headerName: 'Fecha Previa',
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
          <Tooltip title="Abrir Periodo">
            <GridActionsCellItem
              icon={<Search />}
              label="Abrir Periodo"
              className="textPrimary"
              onClick={handleViewDetail(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title="Cerrar Periodo">
            <GridActionsCellItem
              icon={<CalendarIcon />}
              label="Cerrar Periodo"
              className="textPrimary"
              onClick={handleEditPeriodo(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];

  const handleViewDetail = (id: GridRowId) => () => {
    const periodo = rows.find((item) => item.id === id);
    if (periodo && periodo !== null) {
      setTitle('Detalle Periódo del Modulo  N° ' + periodo.moduleId);
      setOpenDetail(true);
      setFormState({
        ...formState,
        moduleId: periodo.moduleId,
      });
    }
  };

  const handleEditPeriodo = (id: GridRowId) => () => {
    const periodo = rows.find((item) => item.id === id);
    if (periodo && periodo !== null) {
      setTitle('Cambiar Fecha del Modulo  N° ' + periodo.moduleId);
      setOpenEdit(true);
      setFormState({
        moduleId: periodo.moduleId,
        closingPeriodDate: periodo.closingPeriodDate,
      });
    }
  };

  useEffect(() => {
    const getMainPage = async () => {
      const response = await fetchMainPeriodos();
      if (response) {
        setPeriodosList(response);
      }
    };
    getMainPage();
  }, []);

  useEffect(() => {
    if (periodsList && periodsList.length > 0) {
      setRows(
        periodsList.map((per: PeriodInterface) => {
          return {
            id: randomId(),
            moduleId: per.moduleId,
            periodId: per.periodId,
            closingPeriodDate: per.closingPeriodDate,
            previousPeriodDate: per.previousPeriodDate,
          };
        })
      );
    }
  }, [periodsList]);

  const handleCancel = async () => {
    navigate(PathEnum.PERIODO_CONTABLE);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const periodoPost: PeriodInterface = {
      closingPeriodDate: formState.newDatePeriod,
      creationUserId: null,
      modificationDate: null,
      modificationUserId: null,
      moduleId: formState.moduleId,
      periodId: null,
      previousPeriodDate: formState.closingPeriodDate,
      registrationDate: null,
    };
    const response = await fetchSavePeriodo(periodoPost);
    if (
      !response ||
      (response && (response as ServerResponseType).status === 400) ||
      (response && (response as ServerResponseType).status === 500)
    ) {
      enqueueSnackbar(`Error al guardar el periódo contable`, {
        variant: 'error',
      });
      return;
    }
    enqueueSnackbar(`El Periódo Contable se guardó correctamente`, {
      variant: 'success',
    });
    onResetForm();
    setOpenEdit(false);
    handleCancel();
  };

  return (
    <>
      <PeriodoDetalle
        open={openDetail}
        setOpen={setOpenDetail}
        formState={formState}
        onResetForm={onResetForm}
        onDateChange={onDateChange}
        setFormState={setFormState}
        title={title}
        modulos={modulos}
      />
      <PeriodoFecha
        open={openEdit}
        setOpen={setOpenEdit}
        formState={formState}
        onDateChange={onDateChange}
        onSubmit={onSubmit}
      />
      <CardLayout title="Periódos Contables" positionTitle={'left'}>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <StyledDataGrid
              rows={rows}
              columns={columns}
              pagination
              getRowClassName={(params) =>
                params !== null ? `super-app-theme--null` : ''
              }
              rowHeight={30}
              columnHeaderHeight={45}
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
                toolbar: CustomToolbar,
              }}
              sx={{
                height: rows.length > 0 ? 'auto' : '300px',
              }}
              localeText={{
                ...esES.components.MuiDataGrid.defaultProps.localeText,
                toolbarDensity: 'Densidad',
                toolbarFilters: 'Filtros',
                toolbarColumns: 'Columnas',
                toolbarExport: 'Exportar',
              }}
            />
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};
