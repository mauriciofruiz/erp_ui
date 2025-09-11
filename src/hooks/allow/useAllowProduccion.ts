import {
  EstadoOrdenProduccionEnum,
  EstadoProduccionEnum,
  ModuloEnum,
  RoleEnum,
} from '@/enums';
import { RootState } from '@/store/types';
import { PeriodInterface } from '@/types';
import { parseISO } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useAllowProduccion = () => {
  const userRoles = useSelector((state: RootState) => state.auth.user?.roles);

  const userBranchId = useSelector(
    (state: RootState) => state.auth.user?.branchId
  );

  const currentPeriods = useSelector(
    (state: RootState) => state.auth.currentPeriods
  );

  const produccionPeriodo: PeriodInterface | null = useMemo(() => {
    const temp = currentPeriods?.find(
      (period) => period.moduleId === ModuloEnum.PRODUCCION
    );
    return temp
      ? {
          ...temp,
          closingPeriodDate: temp.closingPeriodDate
            ? parseISO(temp.closingPeriodDate.toString())
            : '',
        }
      : null;
  }, [currentPeriods]);

  const isEditableProduccion = useCallback(
    (fechaDocumento: Date | string) => {
      if (
        !produccionPeriodo?.closingPeriodDate ||
        parseISO(fechaDocumento.toString()) <
          produccionPeriodo?.closingPeriodDate
      ) {
        return false;
      }

      return true;
    },
    [produccionPeriodo]
  );

  const enableEditingOP = (
    statePurchaseOrderId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableProduccion(fechaDocumento)) return false;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    if (
      (statePurchaseOrderId === EstadoProduccionEnum.ENVIADO &&
        roleIds.has(RoleEnum.JEFE)) ||
      roleIds.has(RoleEnum.SISTEMAS)
    ) {
      return true;
    } else if (statePurchaseOrderId === EstadoProduccionEnum.ENVIADO) {
      return false;
    }

    return roleIds.has(RoleEnum.SISTEMAS) || roleIds.has(RoleEnum.MANUFACTURA);
  };

  const enableApproveOP = (
    stateRequestPurchaseId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableProduccion(fechaDocumento)) return false;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) &&
      stateRequestPurchaseId === EstadoProduccionEnum.ENVIADO;

    const isJefePlanta =
      roleIds.has(RoleEnum.MANUFACTURA) &&
      roleIds.has(RoleEnum.JEFE) &&
      stateRequestPurchaseId === EstadoProduccionEnum.ENVIADO;

    return isSistemas || isJefePlanta;
  };

  const enableEditOProduccion = (
    stateRequestPurchaseId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableProduccion(fechaDocumento)) return false;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) &&
      stateRequestPurchaseId === EstadoOrdenProduccionEnum.GENERADA;

    const isJefeProduccion =
      roleIds.has(RoleEnum.JEFE) &&
      stateRequestPurchaseId != EstadoOrdenProduccionEnum.CERRADO;

    return isSistemas || isJefeProduccion;
  };

  const enableCerrarOProduccion = (
    stateRequestPurchaseId: number,
    fechaDocumento: Date,
    branchIdProduced: number
  ) => {
    if (!isEditableProduccion(fechaDocumento)) return false;
    if (!userRoles) return false;
    if (!branchIdProduced) return false;
    if (!userBranchId) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) &&
      stateRequestPurchaseId === EstadoOrdenProduccionEnum.PRODUCIDO;

    const isJefeProduccion =
      roleIds.has(RoleEnum.JEFE) &&
      stateRequestPurchaseId === EstadoOrdenProduccionEnum.PRODUCIDO &&
      branchIdProduced === userBranchId;

    return isSistemas || isJefeProduccion;
  };

  return {
    produccionPeriodo,
    enableEditingOP,
    enableApproveOP,
    enableEditOProduccion,
    enableCerrarOProduccion,
  };
};
