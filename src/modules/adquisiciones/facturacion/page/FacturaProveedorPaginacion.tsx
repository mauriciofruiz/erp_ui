import { FormState, useFacturaProveedorAsync } from '@/hooks';
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
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

export default function FacturaProveedorPaginacion(props: PaginacionProps) {
  const {
    columns,
    rows,
    setRows,
    pagination,
    setPagination,
    formState,
    setFormState,
  } = props;

  const [totalRowCount, setTotalRowCount] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: formState.page,
    pageSize: formState.pageSize,
  });

  const { fetchMainPage } = useFacturaProveedorAsync();

  const { isLoading } = useQuery(['pagination', paginationModel], async () => {
    const getResult = async () => {
      setFormState({
        ...formState,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      const paginacion = await fetchMainPage(
        formState.stateIdList,
        formState.importOpeningId,
        formState.providerId,
        formState.documentNumber,
        formState.documentType,
        formState.branchId,
        formState.userId,
        formState.description,
        formState.emissionDate,
        formState.emissionEndDate,
        formState.creationDate,
        formState.creationEndDate,
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
      convertFieldToSort(
        queryOptions.sortModel &&
          queryOptions.sortModel[0] &&
          queryOptions.sortModel[0].field.toString()
      ) || null;

    setFormState({
      ...formState,
      page: 0,
      sortDirection,
      sortColumn,
    });
    const getResult = async () => {
      const paginacion = await fetchMainPage(
        formState.stateIdList,
        formState.importOpeningId,
        formState.providerId,
        formState.documentNumber,
        formState.documentType,
        formState.branchId,
        formState.userId,
        formState.description,
        formState.emissionDate,
        formState.emissionEndDate,
        formState.creationDate,
        formState.creationEndDate,
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

  const convertFieldToSort = (field: string | undefined) => {
    switch (field) {
      case 'providerInvoiceNumber':
        return 'doc.doc_numerodocumento';
      case 'branchName':
        return 'sucursal.nombre_sucursal';
      case 'providerName':
        return 'persona.nombre_persona';
      case 'providerInvoiceIssueDate':
        return 'doc.doc_fechaemision';
      case 'registrationDate':
        return 'doc.fecha_creacion';
      case 'baseIvaZero':
        return 'doc.doc_noobjetoiva';
      case 'baseIva':
        return 'doc.doc_totalsiniva';
      case 'totalTaxes':
        return 'doc.doc_montoiva';
      case 'total':
        return 'doc.doc_valor';
      case 'providerInvoiceStatusName':
        return 'estado.nombre_estadodocumento';
      case 'userName':
        return 'usuario.nick_usr';
      default:
        return '';
    }
  };

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
