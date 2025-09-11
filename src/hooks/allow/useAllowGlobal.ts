import { RoleEnum } from '@/enums';
import { RootState } from '@/store/types';
import { useSelector } from 'react-redux';

export const useAllowGlobal = () => {
  const userRoles = useSelector((state: RootState) => state.auth.user?.roles);

  const enableAdmin = () => {
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    return (
      roleIds.has(RoleEnum.SISTEMAS) ||
      roleIds.has(RoleEnum.ADQUISICIONES) ||
      roleIds.has(RoleEnum.FINANCIERO_CONTABLE)
    );
  };

  const enabledBranchs = () => {
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    const isSistemas = roleIds.has(RoleEnum.SISTEMAS);
    const isAdministrativo = roleIds.has(RoleEnum.ADMINISTRATIVO);

    return isSistemas || isAdministrativo;
  };

  const navigateBetweenDocuments = () => {
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    return (
      roleIds.has(RoleEnum.COMPRAS_LOCALES) ||
      roleIds.has(RoleEnum.SISTEMAS) ||
      roleIds.has(RoleEnum.FINANCIERO_CONTABLE)
    );
  };

  const allowCheckEntry = () => {
    if (!userRoles) return false;

    const roleIds = new Set(userRoles.map((role) => role.roleId));

    return (
      roleIds.has(RoleEnum.SISTEMAS) ||
      roleIds.has(RoleEnum.FINANCIERO_CONTABLE)
    );
  };

  return {
    enableAdmin,
    enabledBranchs,
    navigateBetweenDocuments,
    allowCheckEntry,
  };
};
