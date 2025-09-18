import { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { formatDateBackEnd } from '@/functions';
import { RequestPurchaseEnum, TipoAdquisicionEnum } from '@/enums';
import {
  SolicitudCompraDetailSendType,
  SolicitudCompraDetailType,
  SolicitudCompraSendType,
  SucursalType,
} from '@/types';
import { GridRowsProp } from '@mui/x-data-grid';

// Helper function to set request purchase details
async function setRequestPurchaseDetailsSelectedFunction(
  existingDetails: SolicitudCompraDetailType[] | undefined,
  currentRows: GridRowsProp,
  sucursalUser: SucursalType,
  requestPurchase: SolicitudCompraSendType
): Promise<SolicitudCompraDetailSendType[]> {
  const fetchProductoByBodega = async (
    productCode: string
  ): Promise<any[] | undefined> => {
    try {
      const { getProductosByParams } = await import('@/backend/inventario');
      const response = await getProductosByParams(productCode);
      if (response) {
        if (response.status === 200) {
          return response.message;
        } else {
          console.error('No se pudieron cargar los productos de bodega');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (existingDetails && existingDetails.length > 0) {
    const promises = currentRows.map(async (current, index) => {
      const producto = await fetchProductoByBodega(current.productCode);
      const productId = producto ? producto[0].productId : null;

      return {
        branchId: sucursalUser.branchId,
        detailProductRequestPurchaseId: existingDetails[index]
          ? existingDetails[index].detailProductRequestPurchaseId
          : null,
        gestionadoDetailProduct: current.state,
        obsDetailRequestProduct: current.productObservation,
        productId: productId,
        quantityApprovedDetailProduct: current.quantityApproved,
        quantityRequestDetailProduct: current.quantity,
        quantityTransferedDetail: 0,
        quantityManagedDetailProduct: 0,
        requestProductPurchaseId: requestPurchase.requestPurchaseId,
        stateDetailRequestProduct: true,
        transfer: false,
      };
    });

    return Promise.all(promises);
  } else {
    const promises = currentRows.map(async (current) => {
      const producto = await fetchProductoByBodega(current.productCode);
      const productId = producto ? producto[0].productId : null;

      return {
        branchId: sucursalUser.branchId,
        detailProductRequestPurchaseId: null,
        gestionadoDetailProduct: current.state,
        obsDetailRequestProduct: current.productObservation,
        productId: productId,
        quantityApprovedDetailProduct: current.quantityApproved,
        quantityRequestDetailProduct: current.quantity,
        quantityTransferedDetail: 0,
        quantityManagedDetailProduct: 0,
        requestProductPurchaseId: requestPurchase.requestPurchaseId,
        stateDetailRequestProduct: true,
        transfer: false,
      };
    });

    return Promise.all(promises);
  }
}

// Helper function to validate details
function validateDetails(
  detailsRows: SolicitudCompraDetailSendType[],
  detailsFromDb: SolicitudCompraDetailType[] | undefined
) {
  if (detailsFromDb) {
    const rows = detailsFromDb
      .filter((found) => {
        const exists = detailsRows.some(
          (detail) =>
            detail.detailProductRequestPurchaseId ===
            found.detailProductRequestPurchaseId
        );
        return !exists;
      })
      .map((found) => ({
        branchId: found.branchId,
        detailProductRequestPurchaseId: found.detailProductRequestPurchaseId,
        gestionadoDetailProduct: found.gestionadoDetailProduct,
        obsDetailRequestProduct: found.obsDetailRequestProduct,
        productId: found.productId,
        quantityApprovedDetailProduct: found.quantityApprovedDetailProduct,
        quantityRequestDetailProduct: found.quantityRequestDetailProduct,
        quantityTransferedDetail: found.quantityTransferedDetail,
        requestProductPurchaseId: found.requestProductPurchaseId,
        quantityManagedDetailProduct: found.quantityManagedDetailProduct,
        stateDetailRequestProduct: false,
        transfer: false,
      }));
    return [...detailsRows, ...rows];
  } else {
    return detailsRows;
  }
}

export const useSolicitudCompraValidation = (
  formState: any,
  rows: GridRowsProp,
  adquisicionPeriodo: any,
  isValidDataGrid: boolean
) => {
  const { enqueueSnackbar } = useSnackbar();

  const validateForm = () => {
    let isValid = true;

    if (
      adquisicionPeriodo?.closingPeriodDate &&
      formState.fechaSolicitud < adquisicionPeriodo.closingPeriodDate
    ) {
      enqueueSnackbar(
        'La fecha de creacion no puede ser anterior al periodo de cierre',
        { variant: 'error' }
      );
      isValid = false;
    }

    if (rows.length === 0) {
      enqueueSnackbar('Debe agregar al menos un producto', {
        variant: 'error',
      });
      isValid = false;
    }

    if (formState.tipoAbastecimiento !== TipoAdquisicionEnum.COMPRA_LOCAL) {
      rows.forEach((row) => {
        if (row.quantity === 0) {
          enqueueSnackbar(
            `La cantidad del producto ${row.productCode} no puede ser 0`,
            { variant: 'error' }
          );
          isValid = false;
        }

        if (row.quantity > row.cdaQuantity) {
          enqueueSnackbar(
            `La cantidad del producto ${row.productCode} no puede ser mayor a la cantidad del CDA`,
            { variant: 'error' }
          );
          isValid = false;
        }
      });
    }

    return isValid;
  };

  const createRequestData = async (
    stateForRequest: number,
    userNick: string | undefined,
    requestPurchaseSelected: any,
    requestPurchaseDetailsSelected: SolicitudCompraDetailType[],
    sucursalUser: SucursalType,
    rows: GridRowsProp
  ) => {
    const request: SolicitudCompraSendType = {
      branchId: formState.branchId,
      codUsrAprob:
        formState.usuarioAprueba !== null
          ? formState.usuarioAprueba
          : stateForRequest === RequestPurchaseEnum.APROBADO
          ? userNick
          : null,
      codUsrSend:
        formState.usuarioEnvia !== null ? formState.usuarioEnvia : userNick,
      dateApprovedSc:
        stateForRequest === RequestPurchaseEnum.APROBADO
          ? new Date()
          : null,
      dateCreationRequestPurchase: formState.fechaSolicitud,
      dateModificationRequestPurchase:
        requestPurchaseSelected?.requestPurchaseId ? new Date() : null,
      dateRequiredRequestPurchase: formatDateBackEnd(formState.fechaRequerida),
      daysRequestSc: null,
      obsRequestPurchase: formState.observacion,
      reasonRequestId: formState.razonSolicitud,
      reasonRequestPurchase: formState.motivo,
      requestPurchaseId: requestPurchaseSelected?.requestPurchaseId || null,
      stateRequestPurchaseId: stateForRequest,
      transfer: false,
      typeAdquisitionId: formState.tipoAbastecimiento,
      typeRequestId: formState.tipoSolicitud,
      userId: formState.usuario.userId,
      codUsrAnula:
        formState.usuarioAnula !== null
          ? formState.usuarioAnula
          : stateForRequest === RequestPurchaseEnum.ANULADO
          ? userNick
          : null,
    };

    const detailsBuilder: SolicitudCompraDetailSendType[] =
      await setRequestPurchaseDetailsSelectedFunction(
        requestPurchaseDetailsSelected,
        rows,
        sucursalUser,
        request
      );

    const details: SolicitudCompraDetailSendType[] = validateDetails(
      detailsBuilder,
      requestPurchaseDetailsSelected
    );

    return { request, details };
  };

  return {
    validateForm,
    createRequestData,
  };
};
