'use client';
import { CustomToolbar, useRetencionProveedorAsync } from '@/hooks';
import { PaginatedResponseType } from '@/types';
import { GridColDef, GridRowsProp, GridSortModel } from '@mui/x-data-grid';
import { GridSortItem } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useState } from 'react';
import { esES } from '@mui/x-data-grid/locales';
import { useQuery } from 'react-query';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

type QueryOptionsType = {
  sortModel?: GridSortItem[];
};

export type RetencionProveedorPaginacionProps = {
  // types...
  columns: GridColDef[];
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  pagination: PaginatedResponseType;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  formState: any;
  setFormState: React.Dispatch<React.SetStateAction<any>>;
};

export const RetencionProveedorPaginacion: React.FC<
  RetencionProveedorPaginacionProps
> = ({
  columns,
  rows,
  setRows,
  pagination,
  setPagination,
  formState,
  setFormState,
}) => {
  const { fetchMainPageRP } = useRetencionProveedorAsync();
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [queryOptions, setQueryOptions] = useState<QueryOptionsType>({});
  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    setQueryOptions({ sortModel: [...sortModel] });
  }, []);
  const [paginationModel, setPaginationModel] = useState({
    page: formState.page,
    pageSize: formState.pageSize,
  });

  const { isLoading } = useQuery(['pagination', paginationModel], async () => {
    const getResult = async () => {
      setFormState({
        ...formState,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
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
        paginationModel.page + 1,
        paginationModel.pageSize,
        formState.sortDirection,
        formState.sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
  });

  useEffect(() => {
    if (!isLoading && pagination) {
      setTotalRowCount(pagination.totalRecords);
    }
  }, [isLoading, pagination]);

  useEffect(() => {
    if (totalRowCount === 0) {
      setRows([]);
    }
  }, [totalRowCount]);

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
      sortDirection: sortDirection,
      sortColumn: sortColumn,
    });
    const getResult = async () => {
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
        loading={isLoading}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[5, 10, 15, 25]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        getRowHeight={() => 'auto'}
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
    </>
  );
};
