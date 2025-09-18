import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { randomId } from '@mui/x-data-grid-generator';
import {
  GridEventListener,
  GridRenderEditCellParams,
  GridRowEditStopReasons,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';
import axios from 'axios';
import {
  getProductoByBodega,
  getProductosByParams,
} from '@/backend/inventario';
import { ServerResponseType } from '@/store';
import {
  SolicitudCompraDetailType,
  SucursalType,
} from '@/types';
import {
  ProductoByBodegaType,
  ProductoType,
} from '@/types/inventario/producto.type';
import { RequestPurchaseEnum } from '@/enums';

export const useSolicitudCompraDataGrid = (
  requestPurchaseDetailsSelected: SolicitudCompraDetailType[],
  sucursalUser: SucursalType,
  requestPurchaseSelected: any,
  fetchBySucursalIdAndCode: any,
  formState: any
) => {
  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [productosToSelect, setProductosToSelect] = useState<string[]>([]);
  const [productosByBodegaList, setProductosByBodegaList] = useState<ProductoByBodegaType[]>([]);
  const [isValidDataGrid, setIsValidDataGrid] = useState(true);
  const [inputValue, setInputValue] = useState('');

  // Initialize rows from requestPurchaseDetailsSelected
  useEffect(() => {
    setRows(
      requestPurchaseDetailsSelected &&
        requestPurchaseDetailsSelected.length > 0
        ? requestPurchaseDetailsSelected.map((item) => ({
            id: randomId(),
            productName: item.productName,
            productCode: item.productCode,
            availableQuantity: item.quantityAvailableBranch,
            quantity: item.quantityRequestDetailProduct,
            quantityApproved: item.quantityApprovedDetailProduct,
            weight: (item.weight * item.quantityApprovedDetailProduct).toFixed(2),
            productObservation: item.obsDetailRequestProduct,
            state: item.gestionadoDetailProduct,
          }))
        : []
    );
  }, [requestPurchaseDetailsSelected]);

  // Validate rows and fetch product data
  useEffect(() => {
    if (rows && rows.length > 0) {
      let productosListTemporal: ProductoByBodegaType[] = [];
      
      const fetchProductoByBodega = async (
        productCode: string,
        row: GridValidRowModel
      ) => {
        fetchBySucursalIdAndCode(
          sucursalUser?.branchId ?? null,
          productCode
        ).then((response) => {
          if (response) {
            const producto: ProductoByBodegaType = {
              ...response,
              quantity: row.quantity,
            };
            
            // Validate min/max quantities for non-gestionado products
            requestPurchaseSelected &&
            (requestPurchaseSelected.stateRequestPurchaseId ===
              RequestPurchaseEnum.EDICION ||
              requestPurchaseSelected.stateRequestPurchaseId ===
                RequestPurchaseEnum.ENVIADO)
              ? renderAlertMinMax(producto)
              : null;
              
            productosListTemporal.push(producto);
          }
        });
      };

      rows.forEach((row) => {
        fetchProductoByBodega(row.productCode, row);
      });
      
      setProductosByBodegaList(productosListTemporal);
      
      // Validate rows
      let flag = true;
      rows.forEach((row) => {
        if (row.productCode === '' && row.productName === '') {
          setRowModesModel({
            ...rowModesModel,
            [row.id]: { mode: GridRowModes.Edit },
          });
          flag = false;
        }
        if (
          row.productCode !== '' &&
          row.productName !== '' &&
          row.quantity === 0
        ) {
          enqueueSnackbar('No puede guardar productos con cantidad 0', {
            variant: 'error',
            preventDuplicate: true,
          });
          flag = false;
        }
      });
      
      setIsValidDataGrid(flag);
      if (!flag) {
        enqueueSnackbar('Existen campos vacios en la lista de productos', {
          variant: 'warning',
          preventDuplicate: true,
        });
      }
    } else {
      setIsValidDataGrid(false);
    }
  }, [rows]);

  // Search products when inputValue changes
  useEffect(() => {
    if (!inputValue.includes(' ') && inputValue.length >= 3) {
      const fetchData = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductosByParams(inputValue);
          if (response) {
            if (response.status === 200) {
              setProductosToSelect(
                response.message.map((p: ProductoType) =>
                  p.productId
                    ?.toString()
                    .concat(' - ', p.productCode.concat(' - ', p.shortName))
                )
              );
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
              setProductosToSelect([]);
              enqueueSnackbar('No se ha encontrado el producto buscado', {
                variant: 'info',
              });
            } else {
              enqueueSnackbar('Error Del Servidor: ' + error.message, {
                variant: 'error',
              });
            }
          }
        }
      };
      fetchData();
    } else {
      setProductosToSelect([]);
    }
  }, [inputValue]);

  const renderAlertMinMax = (product: ProductoByBodegaType) => {
    const showMinimum =
      product.availableQuantity + product.quantity < product.minimumQuantity;
    const showMaximum =
      product.availableQuantity + product.quantity > product.maximumQuantity;
      
    if (showMinimum)
      enqueueSnackbar(
        `La cantidad del producto ${product.productCode} está por debajo del MÍNIMO recomendado que es: ${product.minimumQuantity}`,
        { variant: 'warning' }
      );
    if (showMaximum)
      enqueueSnackbar(
        `La cantidad del producto ${product.productCode} está por arriba del MÁXIMO recomendado que es: ${product.maximumQuantity}`,
        { variant: 'warning' }
      );
  };

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string | null,
    params: GridRenderEditCellParams
  ) => {
    if (event && newValue !== null) {
      const fetchProductoByBodega = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductoByBodega(
              sucursalUser.branchId,
              parseInt(newValue.split(' - ')[0]),
              formState.tipoAbastecimiento
            );
          if (response) {
            if (response.status === 200) {
              const producto: ProductoByBodegaType = response.message;

              setProductosByBodegaList([...productosByBodegaList, producto]);

              const rowIndex = rows.findIndex((row) => row.id === params.id);

              const newRows = [...rows];
              newRows[rowIndex] = {
                ...newRows[rowIndex],
                productCode: producto.productCode,
                productName: producto.productName,
                availableQuantity: producto.availableQuantity,
                weight: producto.weight,
                quantity: 1,
                quantityApproved: 1,
                cdaQuantity: producto.cdaQuantity,
              };

              setRows(newRows);
            } else {
              enqueueSnackbar(
                `No se pudo cargar el producto: ${response.status}`,
                { variant: 'error' }
              );
            }
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
      };
      fetchProductoByBodega();
    } else {
      const rowIndex = rows.findIndex((row) => row.id === params.id);

      const newRows = [...rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        productCode: '',
        productName: '',
        availableQuantity: 0,
        quantity: 0,
        weight: 0,
        quantityApproved: 0,
        cdaQuantity: 0,
      };
      setRows(newRows);
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
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

    const existingRow = rows.find(
      (row) =>
        row.productCode === currentRow.productCode && row.id !== params.id
    );

    if (existingRow) {
      enqueueSnackbar(
        `Se ha encontrado un producto con el mismo código: ${currentRow.productCode}`,
        { variant: 'info' }
      );
      const updatedQuantity =
        parseFloat(existingRow.quantity) + parseFloat(currentRow.quantity);
      const updatedWeight = existingRow.weight + currentRow.weight;

      const updatedRows = rows
        .map((row) =>
          row.productCode === currentRow.productCode
            ? { ...row, quantity: updatedQuantity, weight: updatedWeight }
            : row
        )
        .filter((row) => row.id !== currentRow.id);

      setRows(updatedRows);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  return {
    rows,
    setRows,
    rowModesModel,
    setRowModesModel,
    productosToSelect,
    setProductosToSelect,
    productosByBodegaList,
    setProductosByBodegaList,
    isValidDataGrid,
    setIsValidDataGrid,
    inputValue,
    setInputValue,
    handleAutocompleteChange,
    processRowUpdate,
    handleRowModesModelChange,
    handleRowEditStop,
    renderAlertMinMax,
  };
};
