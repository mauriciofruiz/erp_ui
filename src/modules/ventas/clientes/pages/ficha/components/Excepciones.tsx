'use client';
import { FormState, useForm } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { Grid, Tooltip } from '@mui/material';
import { setPercentageNumber, TabPanel } from '@/functions';
import { GridActionsCellItem, GridColDef, GridEventListener, GridPreProcessEditCellProps, GridRowEditStopReasons, GridRowId, GridRowModel, GridRowModes, GridRowModesModel, GridRowsProp, GridValueFormatterParams, } from '@mui/x-data-grid';
import { ExcepcionClienteDescuentoPostType, PaginatedResponseType } from '@/types';
import { TipoExcepcionClienteDescEnum } from '@/enums';
import { AutocompleteEditGroupCell, AutocompleteEditProductCell, AutocompleteEditSubgroupCell, InputQuantityFunction } from './CustomCells';
import { ClassNameMap } from '@mui/styles';
import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import ExcepcionesPaginacion from './ExcepcionesPaginacion';
import { randomId } from '@mui/x-data-grid-generator';
import { QueryClient, QueryClientProvider } from 'react-query';

type ExcepcionesTabProps = {
  clientId: number;
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  tabIndex: number;
  enqueueSnackbar: (message: string, options?: any) => void;
  styles: ClassNameMap;
  excepcionesRows: GridRowsProp;
  setExcepcionesRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

export const ExcepcionesTab: React.FC<ExcepcionesTabProps> = ({
  clientId,
  formState,
  tabIndex,
  createMode,
  editMode,
  enqueueSnackbar,
  styles,
  excepcionesRows: rows,
  setExcepcionesRows: setRows,
}) => {
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const queryClient = new QueryClient();
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const { formState: formStatePagination, setFormState: setFormStatePagination } =
    useForm({
      clientId: clientId,
      page: 0,
      pageSize: 10,
      sortDirection: null,
      sortColumn: null,
    });

  useEffect(() => {
    if (pagination) {
      const list = pagination.list as ExcepcionClienteDescuentoPostType[];
      setRows(
        list.map((lista) => {
          return {
            id: randomId(),
            ...lista,
          };
        })
      );
    }
  }, [pagination]);

  useEffect(() => {
    if (formState?.exceptions && formState.exceptions.length > 0) {
      const excepcionesList =
        formState.exceptions as ExcepcionClienteDescuentoPostType[];
      const rows = excepcionesList.map((exception, index) => {
        return {
          id: index,
          ...exception,
        };
      });

      setRows(rows);
    }
  }, [formState.exceptions]);

  const tipoExcepcionesList = () => {
    return Object.keys(TipoExcepcionClienteDescEnum)
      .filter((key): key is keyof typeof TipoExcepcionClienteDescEnum =>
        isNaN(Number(key))
      )
      .map((key) => {
        const label = key.replace(/_/g, ' ');
        return { label: label, value: TipoExcepcionClienteDescEnum[key] };
      });
  };

  const columns: GridColDef[] = [
    {
      field: 'exceptionTypeId',
      headerName: 'Tipo Excepción',
      minWidth: 100,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      type: 'singleSelect',
      valueOptions: tipoExcepcionesList(),
      valueFormatter: (params) => {
        const exceptionTypeId = params.value;
        const exceptionTypeName =
          tipoExcepcionesList().find((item) => item.value === exceptionTypeId)
            ?.label || '';
        return exceptionTypeName;
      },
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        const exceptionTypeId = params.props.value;
        if (params.hasChanged && exceptionTypeId) {
          const row = rows.find((row) => row.id === params.row.id);
          if (row) {
            const newRow = {
              ...row,
              exceptionTypeId,
            };

            setRows(
              rows.map((row) => (row.id === params.row.id ? newRow : row))
            );
          }
        }
        return { ...params.props };
      },
    },
    {
      field: 'parameterValue',
      headerName: 'Parametro',
      type: 'string',
      minWidth: 300,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderEditCell: (params) => {
        const row = rows.find((row) => row.id === params.id);
        if (row?.exceptionTypeId === TipoExcepcionClienteDescEnum.PRODUCTO) {
          return (
            <AutocompleteEditProductCell
              params={params}
              rows={rows}
              setRows={setRows}
              styles={styles}
            />
          );
        } else if (
          row?.exceptionTypeId === TipoExcepcionClienteDescEnum.SUBGRUPO
        ) {
          return (
            <AutocompleteEditSubgroupCell
              params={params}
              rows={rows}
              setRows={setRows}
              styles={styles}
            />
          );
        } else {
          return (
            <AutocompleteEditGroupCell
              params={params}
              rows={rows}
              setRows={setRows}
              styles={styles}
            />
          );
        }
      },
    },
    {
      field: 'discountPortion',
      headerName: '% Descuento',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      editable: true,
      type: 'number',
      flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => {
        return setPercentageNumber(Number(params.value), 2);
      },
      renderEditCell: (params) => {
        return <InputQuantityFunction params={params} rows={rows} />;
      },
    },
    {
      field: 'startDate',
      headerName: 'Fecha Inicio',
      type: 'dateTime',
      minWidth: 150,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      valueGetter: (params) => {
        const date = params.row.startDate
          ? new Date(params.row.startDate)
          : null;
        return date;
      },
    },
    {
      field: 'endDate',
      headerName: 'Fecha Fin',
      type: 'dateTime',
      minWidth: 150,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      valueGetter: (params) => {
        const date = params.row.endDate ? new Date(params.row.endDate) : null;
        const startDate = params.row.startDate
          ? new Date(params.row.startDate)
          : null;
        if (date && startDate && date < startDate) {
          return startDate;
        }
        return date;
      },
    },
    {
      field: 'status',
      headerName: 'Estado',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 50,
      editable: true,
      sortable: false,
      type: 'boolean',
      flex: 0.5,
    },
  ];

  if (createMode || editMode) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 120,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <Tooltip title="Guardar">
              <GridActionsCellItem
                icon={<Save />}
                label="Guardar"
                onClick={handleSaveClick(id)}
              />
            </Tooltip>,
            <Tooltip title="No Guardar">
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancelar"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            </Tooltip>,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Editar"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<Delete />}
            label="Borrar"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    });
  }

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    if (createMode) {
      const row = rows.find((row) => row.id === id);
      if (row) {
        const newRow = {
          ...row,
          status: false,
        };
        setRows(rows.map((row) => (row.id === id ? newRow : row)));
      }
    } else {
      // Find the row to be deleted in rows
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleSaveClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row)
      verifyIfExistRow(row) ? enqueueSnackbar('Ya existe una excepción con los mismos valores', { variant: 'error' }) :
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    else
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

  };

  const verifyIfExistRow = (row: GridRowModel) => {
    const rowList = rows.filter((item) => item.exceptionTypeId === row.exceptionTypeId && item.parameterValue === row.parameterValue);
    return rowList.length > 1;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    const currentRow = rows.find((row) => row.id === params.id);
    if (!currentRow) return;

    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    enqueueSnackbar(error.message, { variant: 'error' });
  }, []);

  return (
    <>
      <TabPanel value={tabIndex} index={6}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <QueryClientProvider client={queryClient}>
              <ExcepcionesPaginacion
                clientId={clientId}
                columns={columns}
                rows={rows}
                setRows={setRows}
                pagination={pagination}
                setPagination={setPagination}
                formState={formStatePagination}
                setFormState={setFormStatePagination}
                handleRowModesModelChange={handleRowModesModelChange}
                handleRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                handleProcessRowUpdateError={handleProcessRowUpdateError}
                createMode={createMode}
                editMode={editMode}
                setRowModesModel={setRowModesModel}
                totalRowCount={totalRowCount}
                setTotalRowCount={setTotalRowCount}
              />
            </QueryClientProvider>
          </Grid>
        </Grid>
      </TabPanel>
    </>
  );
};
