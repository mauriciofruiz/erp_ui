import {
  ProductoByBodegaType,
  TransferDetailList,
  TransferDetailListGet,
} from '@/types';
import { GridRowsProp } from '@mui/x-data-grid';

export async function setRequestDetailsSelectedFunction(
  sucursalId: number | null,
  existingDetails: TransferDetailListGet[] | undefined,
  currentRows: GridRowsProp,
  fetchBySucursalIdAndCode: (
    sucursalId: number | null,
    productCode: string
  ) => Promise<ProductoByBodegaType | undefined>
): Promise<TransferDetailList[]> {
  const fetchProductoByBodega = async (
    productCode: string
  ): Promise<ProductoByBodegaType | undefined> => {
    return fetchBySucursalIdAndCode(sucursalId, productCode)
      .then((response) => {
        if (response) {
          return response;
        } else {
          console.error('No se pudieron cargar los productos de bodega');
          return undefined;
        }
      })
      .catch((error) => {
        console.error(error);
        return undefined;
      });
  };

  if (existingDetails && existingDetails.length > 0) {
    const promises = currentRows.map(async (current, index) => {
      const producto = await fetchProductoByBodega(current.productCode);
      const productId = producto ? producto.productId : null;

      return {
        transferId: existingDetails[index]
          ? existingDetails[index].transferId
          : null,
        productId: productId,
        quantity: current.quantity,
        weight: current.weight,
        abasRequestCode: '',
        toBill: current.toBill,
        canceled: false,
        quantityToDispatch: current.quantity,
        detailTransferId: existingDetails[index]
          ? existingDetails[index].detailTransferId
          : null,
      };
    });

    return Promise.all(promises);
  } else {
    const promises = currentRows.map(async (current) => {
      const producto = await fetchProductoByBodega(current.productCode);
      const productId = producto ? producto?.productId : null;

      return {
        transferId: null,
        productId: productId,
        quantity: current.quantity,
        weight: current.weight,
        abasRequestCode: '',
        toBill: current.toBill,
        canceled: false,
        quantityToDispatch: current.quantity,
        detailTransferId: null,
      };
    });

    return Promise.all(promises);
  }
}

export function validateDetails(
  detailsRows: TransferDetailList[],
  detailsFromDb: TransferDetailListGet[] | undefined
) {
  if (detailsFromDb) {
    const rows = detailsFromDb
      .filter((found) => {
        const exists = detailsRows.some(
          (detail) => detail.detailTransferId === found.detailTransferId
        );
        return !exists;
      })
      .map((found) => ({
        productId: found.productId,
        quantity: found.quantity,
        weight: found.weight,
        abasRequestCode: '',
        toBill: found.toBill,
        canceled: found.canceled,
        quantityToDispatch: found.pendingQuantity,
        detailTransferId: found.detailTransferId,
      }));
    return [...detailsRows, ...rows];
  } else {
    return detailsRows;
  }
}
