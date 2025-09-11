import {
  ModuloEnum,
  RoleEnum,
  EstadoDocumentoEnum,
  EstadoCierreCajaEnum,
  TipoNotaCreditoEnum,
} from '@/enums';
import { RootState } from '@/store/types';
import { PeriodInterface } from '@/types';
import { parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import { useCierreCajaAsync } from '../async';
import { useCallback, useMemo } from 'react';
import { getNCTypeList } from '@/functions';

export const useAllowVentas = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRoles = useSelector((state: RootState) => state.auth.user?.roles);

  const { fetchValidateFacturacion } = useCierreCajaAsync();

  const currentPeriods = useSelector(
    (state: RootState) => state.auth.currentPeriods
  );

  const ventasPeriodo: PeriodInterface | null = useMemo(() => {
    const temp = currentPeriods?.find(
      (period) => period.moduleId === ModuloEnum.VENTAS
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

  const isEditableVentas = useCallback(
    (fechaDocumento: Date | string) => {
      if (
        !ventasPeriodo?.closingPeriodDate ||
        parseISO(fechaDocumento.toString()) < ventasPeriodo?.closingPeriodDate
      ) {
        return false;
      }

      return true;
    },
    [ventasPeriodo]
  );

  const enableEditingFactura = (fechaDocumento: Date, state: number) => {
    if (!isEditableVentas(fechaDocumento)) return false;

    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) && state !== EstadoDocumentoEnum.ANULADO;

    const isVentas =
      roleIds.has(RoleEnum.VENTAS) && state === EstadoDocumentoEnum.GENERADO;

    return isSistemas || isVentas;
  };

  const enableAnulationFactura = (
    state: number,
    createMode: boolean,
    fechaDocumento: Date
  ) => {
    if (!isEditableVentas(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) && state !== EstadoDocumentoEnum.ANULADO;
    return isSistemas;
  };

  const allowCreateFacturaVenta = async () => {
    const fetchData = async (cashId: number | undefined) => {
      if (!cashId) return false;
      const response = await fetchValidateFacturacion(cashId);
      if (response) {
        return response;
      }
      return false;
    };

    if (!userRoles) return false;
    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isVentas = roleIds.has(RoleEnum.VENTAS);
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);

    const validCashId = user?.cashId ? user.cashId : undefined;

    const validated: boolean = await fetchData(validCashId);

    return validated && !!validCashId && (isVentas || isSistemas);
  };

  const allowChangeAccountEgreso = () => {
    if (!userRoles) return false;
    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isAdministrativo = roleIds.has(RoleEnum.ADMINISTRATIVO);
    return isSistemas || isAdministrativo;
  };

  const enableEditingCloseCash = (
    closingStatusId: number,
    fechaDocumento: Date | string,
    userId: number
  ) => {
    if (!isEditableVentas(fechaDocumento)) return false;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      (roleIds.has(RoleEnum.SISTEMAS) ||
        roleIds.has(RoleEnum.FINANCIERO_CONTABLE)) &&
      closingStatusId === EstadoCierreCajaEnum.GENERADO;

    const sameUser =
      user?.userId === userId &&
      closingStatusId === EstadoCierreCajaEnum.GENERADO;

    return isSistemas || sameUser;
  };

  const enableEditingNotaCredito = (
    fechaDocumento: string,
    state: number,
    userId: number
  ) => {
    if (!isEditableVentas(fechaDocumento)) return false;

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

  const enableAnulationNotaCredito = (
    state: number,
    createMode: boolean,
    fechaDocumento: string
  ) => {
    if (!isEditableVentas(fechaDocumento)) return false;
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

  const enableEditingRetention = (fechaDocumento: string) => {
    if (!isEditableVentas(fechaDocumento)) return false;

    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      roleIds.has(RoleEnum.SISTEMAS) ||
      roleIds.has(RoleEnum.FINANCIERO_CONTABLE);

    return isSistemas;
  };

  const enableAnulationRetention = (
    state: number,
    createMode: boolean,
    fechaDocumento: string
  ) => {
    if (!isEditableVentas(fechaDocumento)) return false;
    if (createMode) return true;
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas =
      (roleIds.has(RoleEnum.SISTEMAS) ||
        roleIds.has(RoleEnum.FINANCIERO_CONTABLE)) &&
      state !== EstadoDocumentoEnum.ANULADO;

    return isSistemas;
  };

  const allowCreateNCVenta = async () => {
    const fetchData = async (cashId: number | undefined) => {
      if (!cashId) return false;
      const response = await fetchValidateFacturacion(cashId);
      if (response) {
        return response;
      }
      return false;
    };

    if (!userRoles) return false;
    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isVentas = roleIds.has(RoleEnum.VENTAS);
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isContable = roleIds.has(RoleEnum.FINANCIERO_CONTABLE);

    const validCashId = user?.cashId ? user.cashId : undefined;

    const validated: boolean = await fetchData(validCashId);

    return validated && !!validCashId && (isVentas || isSistemas || isContable);
  };

  const enableNcTypes = () => {
    if (!userRoles) return [];

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isVentas = roleIds.has(RoleEnum.VENTAS);

    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isContable = roleIds.has(RoleEnum.FINANCIERO_CONTABLE);

    const list =
      isSistemas || isContable
        ? getNCTypeList()
        : isVentas
        ? getNCTypeList().filter(
            (type) => type.value === TipoNotaCreditoEnum.DEVOLUCION
          )
        : [];

    return list;
  };

  const allowConfirmNCVenta = () => {
    if (!userRoles) return false;
    const roleIds = new Set(userRoles.map((role) => role.roleId));
    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isContable = roleIds.has(RoleEnum.FINANCIERO_CONTABLE);

    // const validCashId = user?.cashId ? user.cashId : undefined; !!validCashId &&

    return isSistemas || isContable;
  };

  return {
    ventasPeriodo,
    isEditableVentas,
    enableEditingFactura,
    enableAnulationFactura,
    allowCreateFacturaVenta,
    allowChangeAccountEgreso,
    enableEditingCloseCash,
    enableEditingNotaCredito,
    enableAnulationNotaCredito,
    enableEditingRetention,
    enableAnulationRetention,
    enableNcTypes,
    allowCreateNCVenta,
    allowConfirmNCVenta,
  };
};
