import {
  CargoEnum,
  EstadoDocumentoEnum,
  EstadoLogisticaEnum,
  ModuloEnum,
  RoleEnum,
} from '@/enums';
import { RootState } from '@/store/types';
import { PeriodInterface } from '@/types';
import { parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import { useBodegaAsync } from '../async';

export const useAllowAlmacenamiento = () => {
  const userRoles = useSelector((state: RootState) => state.auth.user?.roles);

  const user = useSelector((state: RootState) => state.auth.user);

  const { fetchBodegaById } = useBodegaAsync();

  const userBranchId = useSelector(
    (state: RootState) => state.auth.user?.branchId
  );

  const positionId = useSelector(
    (state: RootState) => state.auth.user?.position
  );

  const currentPeriods = useSelector(
    (state: RootState) => state.auth.currentPeriods
  );

  const temp: PeriodInterface | undefined = currentPeriods.find(
    (period) => period.moduleId === ModuloEnum.ALMACENAMIENTO
  );

  const almacenamientoPeriodo: PeriodInterface | null = temp
    ? {
        ...temp,
        closingPeriodDate: temp.closingPeriodDate
          ? parseISO(temp.closingPeriodDate.toString())
          : '',
      }
    : null;

  const isEditableAlmacenamiento = (fechaDocumento: Date | string) => {
    if (
      !almacenamientoPeriodo?.closingPeriodDate ||
      parseISO(fechaDocumento.toString()) <
        almacenamientoPeriodo?.closingPeriodDate
    ) {
      return false;
    }

    return true;
  };

  const enableEditingTR = (
    statePurchaseOrderId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableAlmacenamiento(fechaDocumento)) return false;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isGenerada = statePurchaseOrderId === EstadoLogisticaEnum.GENERADA;

    if (statePurchaseOrderId === EstadoLogisticaEnum.ENVIADA) {
      return false;
    }
    return (
      isGenerada ||
      roleIds.has(RoleEnum.SISTEMAS) ||
      roleIds.has(RoleEnum.FINANCIERO_CONTABLE)
    );
  };

  const enableConfirmTR = (
    stateRequestPurchaseId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableAlmacenamiento(fechaDocumento)) return false;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);

    const isAdministrativo = roleIds.has(RoleEnum.ADMINISTRATIVO);

    const isGenerada = stateRequestPurchaseId === EstadoLogisticaEnum.GENERADA;

    return isSistemas || isGenerada || isAdministrativo;
  };

  const enableApproveTR = async (
    stateRequestPurchaseId: number,
    fechaDocumento: Date,
    warehouseIdDestino: number | undefined
  ): Promise<boolean> => {
    if (
      !isEditableAlmacenamiento(fechaDocumento) ||
      !userRoles ||
      !userBranchId ||
      !warehouseIdDestino ||
      !positionId
    ) {
      return false;
    }

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isEnviada = stateRequestPurchaseId === EstadoLogisticaEnum.ENVIADA;

    const branchIdDestino = await fetchBodegaById(warehouseIdDestino)
      .then((response) => {
        if (response) {
          return response.branchId;
        }
        return null;
      })
      .catch(() => null);

    const roleConditions = {
      [RoleEnum.SISTEMAS]: () => isEnviada,
      [RoleEnum.COMPRAS_EXTERIORES]: () => isEnviada,
      [RoleEnum.ADMINISTRATIVO]: () =>
        isEnviada && [branchIdDestino].includes(userBranchId),
      [RoleEnum.VENTAS]: () =>
        isEnviada &&
        [branchIdDestino].includes(userBranchId) &&
        positionId === CargoEnum.JEFE_SUCURSAL,
      [RoleEnum.JEFE]: () =>
        isEnviada && [branchIdDestino].includes(userBranchId),
    };

    return Object.entries(roleConditions).some(
      ([role, condition]) => roleIds.has(Number(role)) && condition()
    );
  };

  const enabledBranchs = () => {
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isAdministrativo = roleIds.has(RoleEnum.ADMINISTRATIVO);

    return isSistemas || isAdministrativo;
  };

  const enableEditingGuia = (
    fechaDocumento: string,
    state: number,
    userId: number
  ) => {
    if (!isEditableAlmacenamiento(fechaDocumento)) return false;

    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      (roleIds.has(RoleEnum.SISTEMAS) ||
        roleIds.has(RoleEnum.FINANCIERO_CONTABLE)) &&
      state === EstadoDocumentoEnum.GENERADO;

    const sameUser =
      user?.userId === userId && state === EstadoDocumentoEnum.GENERADO;

    return isSistemas || sameUser;
  };

  const enableAnulationGuia = (
    state: number,
    createMode: boolean,
    fechaDocumento: string
  ) => {
    if (!isEditableAlmacenamiento(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      (roleIds.has(RoleEnum.SISTEMAS) ||
        roleIds.has(RoleEnum.FINANCIERO_CONTABLE)) &&
      state !== EstadoDocumentoEnum.ANULADO;

    const isAdministrativo =
      roleIds.has(RoleEnum.ADMINISTRATIVO) &&
      state !== EstadoDocumentoEnum.ANULADO;

    return isSistemas || isAdministrativo;
  };

  return {
    almacenamientoPeriodo,
    enableEditingTR,
    enableApproveTR,
    enableConfirmTR,
    enabledBranchs,
    enableEditingGuia,
    enableAnulationGuia,
  };
};
