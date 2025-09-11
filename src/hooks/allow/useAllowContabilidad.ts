import {
  EstadoDepositoEnum,
  EstadoPagoEnum,
  ModuloEnum,
  RoleEnum,
} from '@/enums';
import { RootState } from '@/store';
import { PeriodInterface } from '@/types';
import { parseISO } from 'date-fns';
import { useSelector } from 'react-redux';

export const useAllowContabilidad = () => {
  const userRoles = useSelector((state: RootState) => state.auth.user?.roles);
  const user = useSelector((state: RootState) => state.auth.user);
  const currentPeriods = useSelector(
    (state: RootState) => state.auth.currentPeriods
  );
  const temp: PeriodInterface | undefined = currentPeriods.find(
    (period) => period.moduleId === ModuloEnum.CONTABILIDAD_FINANZAS
  );

  const contabilidadPeriodo: PeriodInterface | null = temp
    ? {
        ...temp,
        closingPeriodDate: temp.closingPeriodDate
          ? parseISO(temp.closingPeriodDate.toString())
          : '',
      }
    : null;

  const isEditableContabilidad = (fechaDocumento: Date | string) => {
    if (
      !contabilidadPeriodo?.closingPeriodDate ||
      parseISO(fechaDocumento.toString()) <
        contabilidadPeriodo?.closingPeriodDate
    ) {
      return false;
    }
    return true;
  };

  const enablePaymentEditing = (
    paymentStateId: number,
    fechaDocumento: Date
  ) => {
    if (!isEditableContabilidad(fechaDocumento)) return false;
    if (!userRoles) return false;
    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isPayment =
      roleIds.has(RoleEnum.FINANCIERO_CONTABLE) &&
      [EstadoPagoEnum.GENERADO].includes(paymentStateId);
    return (
      isSistemas || isPayment || paymentStateId === EstadoPagoEnum.GENERADO
    );
  };

  const enablePaymentAnulation = (
    paymentStateId: number,
    createMode: boolean,
    fechaDocumento: Date
  ) => {
    if (!isEditableContabilidad(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas =
      (roleIds.has(RoleEnum.SISTEMAS) ||
        roleIds.has(RoleEnum.FINANCIERO_CONTABLE)) &&
      paymentStateId !== EstadoPagoEnum.ANULADO;
    return isSistemas;
  };

  const allowCreateDepositAdmin = () => {
    if (!userRoles) return false;
    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isContable = roleIds.has(RoleEnum.FINANCIERO_CONTABLE);

    return isSistemas || isContable;
  };

  const enableEditingDeposit = (
    fechaDocumento: string,
    state: number,
    userId: number
  ) => {
    if (!isEditableContabilidad(fechaDocumento)) return false;

    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const validStates =
      state === EstadoDepositoEnum.GENERADO ||
      state === EstadoDepositoEnum.CONFIRMADO;

    const isSistemas =
      (roleIds.has(RoleEnum.SISTEMAS) ||
        roleIds.has(RoleEnum.FINANCIERO_CONTABLE)) &&
      validStates;

    const sameUser = user?.userId === userId && validStates;

    return isSistemas || sameUser;
  };

  const enableAnulationDeposit = (
    state: number,
    createMode: boolean,
    fechaDocumento: string
  ) => {
    if (!isEditableContabilidad(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      (roleIds.has(RoleEnum.SISTEMAS) ||
        roleIds.has(RoleEnum.FINANCIERO_CONTABLE)) &&
      state !== EstadoDepositoEnum.ANULADO;

    const isAdministrativo =
      roleIds.has(RoleEnum.ADMINISTRATIVO) &&
      state !== EstadoDepositoEnum.ANULADO;

    return isSistemas || isAdministrativo;
  };

  return {
    enablePaymentEditing,
    enablePaymentAnulation,
    contabilidadPeriodo,
    allowCreateDepositAdmin,
    enableEditingDeposit,
    enableAnulationDeposit,
  };
};
