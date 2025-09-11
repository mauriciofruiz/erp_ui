import { FormState, useExceptionsAsync } from '@/hooks';
import { PaginatedResponseType } from '@/types';
import {
  GridColDef,
  GridEventListener,
  GridRowModel,
  GridRowModesModel,
  GridRowsProp,
  GridSortItem,
  GridSortModel,
} from '@mui/x-data-grid';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { esES } from '@mui/x-data-grid/locales';
import { LinearProgress } from '@mui/material';
import { ToolbarExcepciones } from './CustomCells';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

type QueryOptionsType = {
  sortModel?: GridSortItem[];
};

interface PaginacionProps {
  clientId: number;
  columns: GridColDef[];
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  pagination: PaginatedResponseType;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  handleRowModesModelChange: (newRowModesModel: GridRowModesModel) => void;
  handleRowEditStop: GridEventListener<'rowEditStop'>;
  processRowUpdate: (newRow: GridRowModel) => GridRowModel;
  handleProcessRowUpdateError: (error: Error) => void;
  createMode: boolean;
  editMode: boolean;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  totalRowCount: number;
  setTotalRowCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function ExcepcionesPaginacion(props: PaginacionProps) {
  const {
    clientId,
    columns,
    rows,
    setRows,
    pagination,
    setPagination,
    formState,
    setFormState,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    handleProcessRowUpdateError,
    createMode,
    editMode,
    setRowModesModel,
    totalRowCount,
    setTotalRowCount,
  } = props;

  const [paginationModel, setPaginationModel] = useState({
    page: formState.page,
    pageSize: formState.pageSize,
  });

  const { fetchExceptionsByClient } = useExceptionsAsync();

  const { isLoading } = useQuery(
    ['pagination', paginationModel],
    async () => {
      const getResult = async () => {
        setFormState({
          ...formState,
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
        });
        const paginacion = await fetchExceptionsByClient(
          clientId,
          paginationModel.page + 1,
          paginationModel.pageSize,
          formState.sortDirection,
          formState.sortColumn
        );
        setPagination(paginacion as PaginatedResponseType);
      };
      getResult();
    },
    {
      onError: () => {},
    }
  ); // Use useQuery to fetch data

  useEffect(() => {
    if (!isLoading && pagination) {
      setTotalRowCount(pagination.totalRecords);
    }
  }, [isLoading, pagination]); // Update state when data is loaded

  const [queryOptions, setQueryOptions] = useState<QueryOptionsType>({});

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    setQueryOptions({ sortModel: [...sortModel] });
  }, []);

  useEffect(() => {
    const sortDirection =
      (queryOptions.sortModel &&
        queryOptions.sortModel[0] &&
        queryOptions.sortModel[0].sort?.toString()) ||
      null;
    const sortColumn =
      (queryOptions.sortModel &&
        queryOptions.sortModel[0] &&
        queryOptions.sortModel[0].field.toString()) ||
      null;

    setFormState({
      ...formState,
      page: 0,
      sortDirection,
      sortColumn,
    });
    const getResult = async () => {
      const paginacion = await fetchExceptionsByClient(
        clientId,
        0,
        formState.pageSize,
        sortDirection,
        sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
  }, [queryOptions]);

  return (
    <>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        pagination
        getRowClassName={(params) =>
          params !== null ? `super-app-theme--null` : ''
        }
        rowCount={totalRowCount}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[5, 10, 15, 25]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        getRowHeight={() => 'auto'}
        columnHeaderHeight={45}
        slots={{
          loadingOverlay: LinearProgress,
          noRowsOverlay: CustomNoRowsOverlay,
          toolbar: ToolbarExcepciones,
        }}
        slotProps={{
          toolbar: {
            createMode,
            editMode,
            setRows,
            setRowModesModel,
          },
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
    </>
  );
}
