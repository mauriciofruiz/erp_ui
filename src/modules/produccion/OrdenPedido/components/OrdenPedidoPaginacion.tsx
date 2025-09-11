import { getOrdenesPedidoByParams } from '@/backend/inventario/ordenPedidoServices';
import { OrderEnum } from '@/enums';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType } from '@/types';
import { OrdenPedidoList } from '@/types/inventario/ordenPedido.type';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { esES } from '@mui/x-data-grid/locales';
import { CustomToolbar } from '@/hooks/useCustomToolBar';

interface PaginacionProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  listOrdenPedido: OrdenPedidoList[];
  setOrdenPedido: React.Dispatch<React.SetStateAction<OrdenPedidoList[]>>;
  paginatedResponse: PaginatedResponseType | undefined;
  setPaginatedResponse: React.Dispatch<
    React.SetStateAction<PaginatedResponseType | undefined>
  >;
}

export const OrdenPedidoPaginacion = (props: PaginacionProps) => {
  const {
    columns,
    rows,
    setRows,
    listOrdenPedido,
    setOrdenPedido,
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
      await getOrdenesPedidoByParams(
        null,
        null,
        null,
        null,
        null,
        null,
        paginationModel.page + 1,
        paginationModel.pageSize,
        OrderEnum.DESC,
        OrderEnum.SORT_FIELD_AP
      );
    if (response) {
      if (response.status === 200) {
        setOrdenPedido(response.message.list);
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
  });

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
    if (listOrdenPedido && listOrdenPedido.length > 0) {
      setRows(
        listOrdenPedido.map((item) => ({
          id: randomId(),
          ...item,
        }))
      );
    }
  }, [listOrdenPedido]);

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
    </div>
  );
};
