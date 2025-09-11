import { useOrdenCompraAsync } from '@/hooks';
import { PaginatedResponseType } from '@/types';
import {
  GridColDef,
  GridRowsProp,
  GridSortItem,
  GridSortModel,
} from '@mui/x-data-grid';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { esES } from '@mui/x-data-grid/locales';
import { useLoadingOverlayContext } from '@/context';
import { LinearProgress } from '@mui/material';
import { GridColumnVisibilityModel } from '@mui/x-data-grid';
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
  isForeign: boolean;
}

export default function Paginacion(props: PaginacionProps) {
  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const {
    columns,
    rows,
    setRows,
    pagination,
    setPagination,
    formState,
    setFormState,
    isForeign,
  } = props;

  const [totalRowCount, setTotalRowCount] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: formState.page,
    pageSize: formState.pageSize,
  });

  const { fetchMainPage } = useOrdenCompraAsync();

  const { isLoading } = useQuery(
    ['pagination', paginationModel],
    async () => {
      const getResult = async () => {
        showLoading();

        setFormState({
          ...formState,
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
        });
        const paginacion = await fetchMainPage(
          formState.stateIdList,
          formState.orderId,
          formState.userId,
          formState.providerId,
          formState.branchId,
          formState.importOpeningId,
          formState.productId,
          formState.starDate,
          formState.endDate,
          formState.byCurrentMonth,
          isForeign,
          paginationModel.page + 1,
          paginationModel.pageSize,
          formState.sortDirection,
          formState.sortColumn
        );
        setPagination(paginacion as PaginatedResponseType);

        hideLoading();
      };
      getResult();
    },
    {
      onError: () => {
        hideLoading();
      },
    }
  ); // Use useQuery to fetch data

  useEffect(() => {
    if (!isLoading && pagination) {
      setTotalRowCount(pagination.totalRecords);
    }
  }, [isLoading, pagination]); // Update state when data is loaded

  useEffect(() => {
    if (totalRowCount === 0) {
      setRows([]);
    }
  }, [totalRowCount]);

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
      const paginacion = await fetchMainPage(
        formState.stateIdList,
        formState.orderId,
        formState.userId,
        formState.providerId,
        formState.branchId,
        formState.importOpeningId,
        formState.productId,
        formState.starDate,
        formState.endDate,
        formState.byCurrentMonth,
        isForeign,
        0,
        formState.pageSize,
        sortDirection,
        sortColumn
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
  }, [queryOptions]);

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      importOpeningCode: isForeign,
    });

  return (
    <>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        pagination
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) =>
          setColumnVisibilityModel(newModel)
        }
        getRowClassName={(params) =>
          params !== null ? `super-app-theme--null` : ''
        }
        rowCount={totalRowCount}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[5, 10, 15, 25]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        getRowHeight={() => 'auto'}
        columnHeaderHeight={45}
        slots={{
          loadingOverlay: LinearProgress,
          noRowsOverlay: CustomNoRowsOverlay,
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
