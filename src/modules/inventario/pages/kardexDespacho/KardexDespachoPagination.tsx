import { CustomToolbarKardex, FormState, useKardexDespachoAsync } from '@/hooks';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { BodegaGetInterface, PaginatedResponseType } from '@/types';
import {
  GridColDef,
  GridRowsProp,
  GridSortItem,
  GridSortModel,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import format from 'date-fns/format';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query'; // Importar useQuery desde React Query

type QueryOptionsType = {
  sortModel?: GridSortItem[];
};

interface PaginacionProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  pagination: PaginatedResponseType;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  enabledLoading: boolean;
}

export default function KardexDespachoPagination(props: PaginacionProps) {
  const {
    columns,
    rows,
    setRows,
    pagination,
    setPagination,
    formState,
    setFormState,
  } = props;

  const { fetchPaginationKardexDespacho } = useKardexDespachoAsync();
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [queryOptions, setQueryOptions] = useState<QueryOptionsType>({});
  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    setQueryOptions({ sortModel: [...sortModel] });
  }, []);
  const [paginationModel, setPaginationModel] = useState({
    page: formState.page,
    pageSize: formState.pageSize,
  });

  //if(enabledLoading){
  const { isLoading } = useQuery(['pagination', paginationModel], async () => {
    const warehouseIdList =
      formState.warehouses.length > 0
        ? formState.warehouses.map(
            (item: BodegaGetInterface) => item.warehouseId
          )
        : null;
    const warehouseIdstring =
      warehouseIdList !== null ? warehouseIdList.map(String).join(',') : null;
    const movementsIdList =
      formState.movements.length > 0
        ? formState.movements.map(
            (movement: { label: string; value: number }) => movement.value
          )
        : null;
    const movementsIdstring =
      movementsIdList !== null ? movementsIdList.map(String).join(',') : null;
    const getResult = async () => {
      setFormState({
        ...formState,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      const paginacion = await fetchPaginationKardexDespacho(
        formState.branch?.branchId ?? null,
        warehouseIdstring,
        movementsIdstring,
        formState.byCurrentMonth,
        formState.startDate !== null
          ? format(formState.startDate, 'dd/MM/yyyy')
          : null,
        formState.endDate !== null
          ? format(formState.endDate, 'dd/MM/yyyy')
          : null,
        paginationModel.page + 1,
        paginationModel.pageSize,
        formState.product?.productId ?? null
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
    const warehouseIdList =
      formState.warehouses.length > 0
        ? formState.warehouses.map(
            (item: BodegaGetInterface) => item.warehouseId
          )
        : null;
    const warehouseIdstring =
      warehouseIdList !== null ? warehouseIdList.map(String).join(',') : null;
    const movementsIdList =
      formState.movements.length > 0
        ? formState.movements.map(
            (movement: { label: string; value: number }) => movement.value
          )
        : null;
    const movementsIdstring =
      movementsIdList !== null ? movementsIdList.map(String).join(',') : null;
    const getResult = async () => {
      const paginacion = await fetchPaginationKardexDespacho(
        formState.branch?.branchId ?? null,
        warehouseIdstring,
        movementsIdstring,
        formState.byCurrentMonth,
        formState.startDate !== null
          ? format(formState.startDate, 'dd/MM/yyyy')
          : null,
        formState.endDate !== null
          ? format(formState.endDate, 'dd/MM/yyyy')
          : null,
        0,
        formState.pageSize,
        formState.product?.productId ?? null
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
  }, [queryOptions]);
  //}

  useEffect(() => {
    if (totalRowCount === 0) {
      setRows([]);
    }
  }, [totalRowCount]);

  return (
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
      //rowHeight={30}
      getRowHeight={() => 'auto'}
      columnHeaderHeight={45}
      slots={{
        noRowsOverlay: CustomNoRowsOverlay,
        toolbar: CustomToolbarKardex,
      }}
      sx={{
        height: rows.length > 0 ? 'auto' : '300px',
      }}
      localeText={{
        ...esES.components.MuiDataGrid.defaultProps.localeText,
        toolbarDensity: 'Densidad',
        toolbarFilters: 'Filtros',
        toolbarColumns: 'Columnas',
      }}
    />
  );
}
