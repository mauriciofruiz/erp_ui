import { useNotaCreditoProveedorAsyc } from '@/hooks';
import { CustomToolbar } from '@/hooks/useCustomToolBar';
import { PaginatedResponseType } from '@/types';
import {
  GridColDef,
  GridRowsProp,
  GridSortItem,
  GridSortModel,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query'; // Importar useQuery desde React Query
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

type QueryOptionsType = {
  sortModel?: GridSortItem[];
};

interface PaginacionProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  pagination: PaginatedResponseType;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  formState: any;
  setFormState: React.Dispatch<React.SetStateAction<any>>;
}

export default function NotaCreditoPaginacion(props: PaginacionProps) {
  const {
    columns,
    rows,
    setRows,
    pagination,
    setPagination,
    formState,
    setFormState,
  } = props;

  const { fetchMainNotaCreditoP } = useNotaCreditoProveedorAsyc();
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
      const paginacion = await fetchMainNotaCreditoP(
        formState.startDate,
        formState.endDate,
        formState.numberNc,
        formState.user,
        formState.providerId,
        formState.state,
        formState.value,
        formState.type,
        formState.byCurrentMonth,
        paginationModel.page + 1,
        paginationModel.pageSize,
        formState.sortDirection,
        formState.sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
  }); // Use useQuery to fetch data

  useEffect(() => {
    if (!isLoading && pagination) {
      setTotalRowCount(pagination.totalRecords);
    }
  }, [isLoading, pagination]); // Update state when data is loade

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
      sortDirection: sortDirection,
      sortColumn: sortColumn,
    });
    const getResult = async () => {
      const paginacion = await fetchMainNotaCreditoP(
        formState.startDate,
        formState.endDate,
        formState.numberNc,
        formState.user,
        formState.providerId,
        formState.state,
        formState.value,
        formState.type,
        formState.byCurrentMonth,
        0,
        formState.pageSize,
        sortDirection ? sortDirection : formState.sortDirection,
        sortColumn ? sortColumn : formState.sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
  }, [queryOptions]);

  return (
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
  );
}
