import { FormState, useDepositosAsync } from "@/hooks";
import { CustomNoRowsOverlay, StyledDataGrid } from "@/hooks/useStyleDataGrid";
import { PaginatedResponseType } from "@/types";
import { GridColDef, GridRowsProp, GridSortItem, GridSortModel } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import { esES } from "@mui/x-data-grid/locales";
import { useQuery } from "react-query";

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
}

export const Paginacion: React.FC<PaginacionProps> = ({
    columns,
    rows,
    setRows,
    pagination,
    setPagination,
    formState,
    setFormState,
}) => {
    const [totalRowCount, setTotalRowCount] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: formState.page,
    pageSize: formState.pageSize,
  });

  const { fetchMainPage } = useDepositosAsync();

  const { isLoading } = useQuery(["pagination", paginationModel], async () => {
    const getResult = async () => {
      setFormState({
        ...formState,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      const paginacion = await fetchMainPage(
        formState.depositId,
        formState.documentNumber,
        formState.bankId,
        formState.amount,
        formState.startDate,
        formState.endDate,
        formState.registrationStartDate,
        formState.registrationEndDate,
        formState.branchId,
        formState.statusListIds,
        formState.currentMonth,
        paginationModel.page,
        paginationModel.pageSize,
        formState.sortDirection,
        formState.sortField
      );
      setPagination(paginacion as PaginatedResponseType);
    };
    getResult();
  });

  useEffect(() => {
    if (!isLoading && pagination) {
      setTotalRowCount(pagination.totalRecords);
    }
  }, [pagination, isLoading]);

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

    const sortField =
      (queryOptions.sortModel &&
        queryOptions.sortModel[0] &&
        queryOptions.sortModel[0].field.toString()) ||
      null;

    setFormState({
      ...formState,
      sortDirection: sortDirection,
      sortField: sortField,
    });

    const getResult = async () => {
      const paginacion = await fetchMainPage(
        formState.depositId,
        formState.documentNumber,
        formState.bankId,
        formState.amount,
        formState.startDate,
        formState.endDate,
        formState.registrationStartDate,
        formState.registrationEndDate,
        formState.branchId,
        formState.statusListIds,
        formState.currentMonth,
        0,
        formState.pageSize,
        sortDirection,
        sortField
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
        getCellClassName={(params) =>
          params !== null ? `super-app-theme--null` : ''
        }
        rowCount={totalRowCount}
        loading={isLoading}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[5, 10, 15, 25]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        getRowHeight={() => "auto"}
        columnHeaderHeight={45}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        sx={{
          height: rows.length > 0 ? "auto" : "300px",
        }}
        localeText={{
          ...esES.components.MuiDataGrid.defaultProps.localeText,
          toolbarDensity: "Densidad",
          toolbarFilters: "Filtros",
          toolbarColumns: "Columnas",
          toolbarExport: "Exportar",
        }}
      />
    </>
  );
}
