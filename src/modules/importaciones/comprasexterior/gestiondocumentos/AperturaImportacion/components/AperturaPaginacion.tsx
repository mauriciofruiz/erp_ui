import { getAperturaImportacionByParams } from '@/backend/adquisiciones/aperturaImportacionServices';
import { OrderEnum } from '@/enums';
import { CustomToolbar } from '@/hooks/useCustomToolBar';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType } from '@/types';
import { AperturaImportacionType } from '@/types/importaciones/aperturaImportacionType';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { randomId } from '@mui/x-data-grid-generator';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query'; // Importar useQuery desde React Query
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
interface PaginacionProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  aperturaImportacion: AperturaImportacionType[];
  setAperutaImportacion: React.Dispatch<
    React.SetStateAction<AperturaImportacionType[]>
  >;
  paginatedResponse: PaginatedResponseType | undefined;
  setPaginatedResponse: React.Dispatch<
    React.SetStateAction<PaginatedResponseType | undefined>
  >;
}

export default function AperturaPaginacion(props: PaginacionProps) {
  const {
    columns,
    rows,
    setRows,
    aperturaImportacion,
    setAperutaImportacion,
    paginatedResponse,
    setPaginatedResponse,
  } = props;

  const [totalRowCount, setTotalRowCount] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { isLoading } = useQuery(['pagination', paginationModel], async () => {
    const response: ServerResponseType | undefined =
      await getAperturaImportacionByParams(
        null,
        null,
        null,
        null,
        null,
        null,
        paginationModel.page + 1,
        paginationModel.pageSize,
        OrderEnum.DESC,
        OrderEnum.SORT_FIELD_AP,
        true
      );
    if (response) {
      if (response.status === 200) {
        setAperutaImportacion(response.message.list);
        const paginatedResponse: PaginatedResponseType = {
          limit: 10,
          list: response.message,
          page: 10,
          totalPages: 10,
          totalRecords: parseInt(response.message.totalRecords),
        };
        setPaginatedResponse(paginatedResponse);
        return paginatedResponse;
      } else {
        enqueueSnackbar(
          `No se pudieron cargar las listas de pedido: ${response.message}`,
          {
            variant: 'error',
          }
        );
      }
    }
  }); // Use useQuery to fetch data

  useEffect(() => {
    if (!isLoading && paginatedResponse) {
      setTotalRowCount(paginatedResponse.totalRecords);
    }
  }, [isLoading, paginatedResponse]); // Update state when data is loaded

  useEffect(() => {
    if (totalRowCount === 0) {
      setRows([]);
    }
  }, [totalRowCount]);

  useEffect(() => {
    if (aperturaImportacion && aperturaImportacion.length > 0) {
      setRows(
        aperturaImportacion.map((item) => ({
          id: randomId(),
          ...item,
        }))
      );
    }
  }, [aperturaImportacion]);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        pagination
        getRowClassName={(params) =>
          params !== null ? `super-app-theme--null` : ''
        }
        rowCount={totalRowCount}
        loading={isLoading}
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
          height: rows.length > 0 ? '100%' : '300px',
        }}
        localeText={{
          ...esES.components.MuiDataGrid.defaultProps.localeText,
          toolbarDensity: 'Densidad',
          toolbarFilters: 'Filtros',
          toolbarColumns: 'Columnas',
          toolbarExport: 'Exportar',
        }}
      />
    </div>
  );
}
