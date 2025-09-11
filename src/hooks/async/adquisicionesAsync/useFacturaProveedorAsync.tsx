import {
  getFacturaProveedorByParams,
  getFacturaResponseById,
  getFacturasForLiquidacion,
  getFacturasProveedorMain,
  getLiquidacionCompraPdf,
  isDocumentAvailableReimbursement,
  saveFacturaProveedor,
  setFacturaFromXml,
  updateFacturaProveedor,
} from '@/backend';
import { useLoadingOverlayContext } from '@/context';
import { ServerResponseType } from '@/store';
import {
  DetalleFacturaRequest,
  FacturaProveedorRequestInterface,
  FacturaProveedorResponseInterface,
  FacturaProveedorResumeInterface,
  ImpuestoDocumentoInterface,
  PaginatedResponseType,
  ReembolsoPostPutType,
  RetencionGroupType,
} from '@/types';
import { useSnackbar } from 'notistack';

export const useFacturaProveedorAsync = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const fetchMainPage = async (
    stateIdList: string | null,
    importOpeningId: number | null,
    providerId: number | null,
    documentNumber: string | null,
    documentType: string | null,
    branchId: number | null,
    userId: number | null,
    description: string | null,
    emissionDate: string | null,
    emissionEndDate: string | null,
    creationDate: string | null,
    creationEndDate: string | null,
    currentMonth: boolean | null,
    page: number | null,
    limit: number | null,
    sortDirection: string | null,
    sortField: string | null
  ) => {
    showLoading();

    try {
      const response = await getFacturasProveedorMain(
        stateIdList,
        importOpeningId,
        providerId,
        documentNumber,
        documentType,
        branchId,
        userId,
        description,
        emissionDate,
        emissionEndDate,
        creationDate,
        creationEndDate,
        currentMonth,
        page,
        limit,
        sortDirection,
        sortField
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as PaginatedResponseType;
    } catch (error) {
      hideLoading();
    }
  };

  const saveFacturaBackEnd = async (
    header: FacturaProveedorRequestInterface,
    details: DetalleFacturaRequest[],
    retenciones: RetencionGroupType[],
    taxes: ImpuestoDocumentoInterface[],
    reimbursement: ReembolsoPostPutType[]
  ) => {
    showLoading();

    try {
      const response = await saveFacturaProveedor({
        header,
        details,
        retenciones,
        taxes,
        reimbursement,
      });

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as FacturaProveedorResponseInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const updateFacturaBackEnd = async (
    header: FacturaProveedorRequestInterface,
    details: DetalleFacturaRequest[],
    retenciones: RetencionGroupType[],
    taxes: ImpuestoDocumentoInterface[],
    reimbursement: ReembolsoPostPutType[]
  ) => {
    showLoading();

    try {
      const response = await updateFacturaProveedor(
        {
          header,
          details,
          retenciones,
          taxes,
          reimbursement,
        },
        header.providerInvoiceId as number
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as FacturaProveedorResponseInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchFacturaResponseById = async (
    idFactura: number,
    idTipoComprobante: string
  ) => {
    showLoading();

    try {
      const response = await getFacturaResponseById(
        idFactura,
        idTipoComprobante
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as FacturaProveedorResponseInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchFacturasForLiquidacion = async (idApertura: number) => {
    showLoading();

    try {
      const response = await getFacturasForLiquidacion(idApertura);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as FacturaProveedorResumeInterface[];
    } catch (error) {
      hideLoading();
    }
  };

  const fetchFacturaProveedorParams = async (
    providerId: number,
    documentNumber: string,
    idTipoNC: number
  ) => {
    try {
      const response = await getFacturaProveedorByParams(
        providerId,
        documentNumber,
        idTipoNC
      );
      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return response;
      }
      return response as FacturaProveedorResponseInterface[];
    } catch (error) {
      enqueueSnackbar('Error con el servidor', { variant: 'error' });
    }
  };

  const fetchLiquidacionPdf = async (id: number) => {
    showLoading();

    try {
      const response = await getLiquidacionCompraPdf(id);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as Blob;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchXml = async (xmlData: any) => {
    showLoading();

    try {
      const response = await setFacturaFromXml(xmlData);

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as FacturaProveedorResponseInterface;
    } catch (error) {
      hideLoading();
    }
  };

  const fetchIsDocumentAvailable = async (
    documentNumber: string,
    identification: string
  ) => {
    showLoading();

    try {
      const response = await isDocumentAvailableReimbursement(
        documentNumber,
        identification
      );

      hideLoading();

      if (response && (response as ServerResponseType).message) {
        const { message } = (response as ServerResponseType).message;
        enqueueSnackbar(message, { variant: 'error' });
        return undefined;
      }
      return response as boolean;
    } catch (error) {
      hideLoading();
    }
  };

  return {
    fetchMainPage,
    saveFacturaBackEnd,
    updateFacturaBackEnd,
    fetchFacturaResponseById,
    fetchFacturasForLiquidacion,
    fetchFacturaProveedorParams,
    fetchLiquidacionPdf,
    fetchXml,
    fetchIsDocumentAvailable,
  };
};
