import {
  AperturaImpEnum,
  EstadoDocumentoEnum,
  ListaPedidoEnum,
  ModuloEnum,
  EstadoOrdenEnum,
  ReceiptPurchaseEnum,
  RequestPurchaseEnum,
  RoleEnum,
  EstadoListaEmpaqueEnum,
  ComprobanteEstadoEnum,
} from '@/enums';
import { RootState } from '@/store/types';
import { PeriodInterface } from '@/types';
import { parseISO } from 'date-fns';
import { useSelector } from 'react-redux';

export const useAllowAdquisicion = () => {
  const userRoles = useSelector((state: RootState) => state.auth.user?.roles);

  const currentPeriods = useSelector(
    (state: RootState) => state.auth.currentPeriods
  );

  const temp: PeriodInterface | undefined = currentPeriods.find(
    (period) => period.moduleId === ModuloEnum.ADQUISICION
  );

  const adquisicionPeriodo: PeriodInterface | null = temp
    ? {
        ...temp,
        closingPeriodDate: temp.closingPeriodDate
          ? parseISO(temp.closingPeriodDate.toString())
          : '',
      }
    : null;

  const isEditableAdquisicion = (fechaDocumento: Date) => {
    if (
      !adquisicionPeriodo?.closingPeriodDate ||
      parseISO(fechaDocumento.toString()) <
        adquisicionPeriodo?.closingPeriodDate
    ) {
      return false;
    }

    return true;
  };

  const enableEditingSC = (
    stateRequestPurchaseId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;

    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);

    const isCompras =
      roleIds.has(RoleEnum.COMPRAS_LOCALES) &&
      [
        RequestPurchaseEnum.EDICION,
        RequestPurchaseEnum.ENVIADO,
        RequestPurchaseEnum.APROBADO,
      ].includes(stateRequestPurchaseId);

    return (
      isSistemas ||
      isCompras ||
      stateRequestPurchaseId === RequestPurchaseEnum.EDICION
    );
  };

  const enableApproveSC = (
    stateRequestPurchaseId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) &&
      stateRequestPurchaseId === RequestPurchaseEnum.ENVIADO;

    const isCompras =
      roleIds.has(RoleEnum.COMPRAS_LOCALES) &&
      stateRequestPurchaseId === RequestPurchaseEnum.ENVIADO;

    return isSistemas || isCompras;
  };

  const enableEditingOC = (
    statePurchaseOrderId: number,
    createMode: boolean,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isCompras =
      roleIds.has(RoleEnum.COMPRAS_LOCALES) &&
      [EstadoOrdenEnum.EN_EDICION, EstadoOrdenEnum.CONFIRMADA].includes(
        statePurchaseOrderId
      );

    return (
      isSistemas ||
      isCompras ||
      statePurchaseOrderId === EstadoOrdenEnum.EN_EDICION
    );
  };

  const enableCloseOC = (
    statePurchaseOrderId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isCompras =
      roleIds.has(RoleEnum.COMPRAS_LOCALES) &&
      [EstadoOrdenEnum.CONFIRMADA, EstadoOrdenEnum.RECEPCION_PARCIAL].includes(
        statePurchaseOrderId
      );

    return isSistemas || isCompras;
  };

  const enableEditingRC = (
    state: number,
    createMode: boolean,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento) || !userRoles) return false;
    if (createMode) return true;

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const allowedStates = [ReceiptPurchaseEnum.FACTURADA];

    const hasRole = (role: RoleEnum) => roleIds.has(role);
    const isAllowedState = allowedStates.includes(state);

    return (
      hasRole(RoleEnum.SISTEMAS) ||
      (isAllowedState &&
        (hasRole(RoleEnum.VENTAS) ||
          hasRole(RoleEnum.COMPRAS_LOCALES) ||
          hasRole(RoleEnum.FINANCIERO_CONTABLE)))
    );
  };

  const enableEditingFProvider = (state: number, fechaDocumento: Date) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;

    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);

    const isContabilidad =
      roleIds.has(RoleEnum.FINANCIERO_CONTABLE) &&
      [
        EstadoDocumentoEnum.GENERADO,
        EstadoDocumentoEnum.CONFIRMADO,
        EstadoDocumentoEnum.ENVIADO,
      ].includes(state);

    return isSistemas || isContabilidad;
  };

  const enableEditingLP = (
    stateRequestPurchaseId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;

    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);

    const isImportaciones =
      roleIds.has(RoleEnum.COMPRAS_EXTERIORES) &&
      [
        ListaPedidoEnum.EDICION,
        ListaPedidoEnum.TRAMITE,
        ListaPedidoEnum.APROBADO,
      ].includes(stateRequestPurchaseId);

    if (stateRequestPurchaseId === ListaPedidoEnum.TRAMITE) {
      if (isImportaciones || isSistemas) {
        return true;
      } else {
        return false;
      }
    }

    return (
      isSistemas ||
      isImportaciones ||
      stateRequestPurchaseId === ListaPedidoEnum.EDICION
    );
  };

  const enableApproveLP = (
    stateRequestPurchaseId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;

    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) &&
      stateRequestPurchaseId === ListaPedidoEnum.TRAMITE;

    const isImportaciones = roleIds.has(RoleEnum.COMPRAS_EXTERIORES);
    stateRequestPurchaseId === ListaPedidoEnum.TRAMITE;

    return isSistemas || isImportaciones;
  };

  const enableEditingAI = (
    statePurchaseOrderId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;

    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);

    const isImportaciones = roleIds.has(RoleEnum.COMPRAS_EXTERIORES);

    return (
      isSistemas ||
      isImportaciones ||
      statePurchaseOrderId === EstadoOrdenEnum.EN_EDICION
    );
  };

  const enableApproveAI = (
    stateRequestPurchaseId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) &&
      stateRequestPurchaseId === AperturaImpEnum.EDICION;

    const isImportaciones =
      roleIds.has(RoleEnum.COMPRAS_EXTERIORES) &&
      stateRequestPurchaseId === AperturaImpEnum.EDICION;

    return isSistemas || isImportaciones;
  };

  const enableEditingOCExterior = (
    statePurchaseOrderId: number,
    createMode: boolean,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isCompras =
      roleIds.has(RoleEnum.COMPRAS_EXTERIORES) &&
      [EstadoOrdenEnum.EN_EDICION, EstadoOrdenEnum.CONFIRMADA].includes(
        statePurchaseOrderId
      );

    return (
      isSistemas ||
      isCompras ||
      statePurchaseOrderId === EstadoOrdenEnum.EN_EDICION
    );
  };

  const enableEditingLE = (
    state: number,
    createMode: boolean,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isCompras =
      roleIds.has(RoleEnum.COMPRAS_EXTERIORES) &&
      [EstadoListaEmpaqueEnum.GENERADA].includes(state);

    return isSistemas || isCompras;
  };

  const enableEditingLiquidacion = (
    state: number,
    createMode: boolean,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isCompras =
      roleIds.has(RoleEnum.COMPRAS_EXTERIORES) &&
      [EstadoDocumentoEnum.GENERADO].includes(state);

    const isContabilidad =
      roleIds.has(RoleEnum.FINANCIERO_CONTABLE) &&
      roleIds.has(RoleEnum.JEFE) &&
      [EstadoDocumentoEnum.GENERADO, EstadoDocumentoEnum.CONFIRMADO].includes(
        state
      );

    return isSistemas || isCompras || isContabilidad;
  };

  const enableEditingNotaCredito = (
    state: number,
    createMode: boolean,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isCompras =
      roleIds.has(RoleEnum.COMPRAS_EXTERIORES) &&
      [ComprobanteEstadoEnum.GENERADO].includes(state);

    return isSistemas || isCompras;
  };

  const enableAnulationNotaCredito = (
    state: number,
    createMode: boolean,
    fechaDocumento: Date
  ) => {
    if (!isEditableAdquisicion(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) && state !== ComprobanteEstadoEnum.ANULADO;
    return isSistemas;
  };

  return {
    adquisicionPeriodo,
    enableEditingSC,
    enableApproveSC,
    enableEditingOC,
    enableEditingRC,
    enableCloseOC,
    enableEditingFProvider,
    enableEditingLP,
    enableApproveLP,
    enableEditingAI,
    enableApproveAI,
    enableEditingOCExterior,
    enableEditingLE,
    enableEditingLiquidacion,
    enableEditingNotaCredito,
    enableAnulationNotaCredito,
  };
};
