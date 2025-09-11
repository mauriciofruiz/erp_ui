import { RoleEnum } from "@/enums";
import { RootState } from "@/store";
import { useSelector } from "react-redux";



export const useAllowTba = () => {
    const userRoles = useSelector((state: RootState) => state.auth.user?.roles);    
    const roleIds = new Set(userRoles?.map((role) => role.roleId));

    const allowsViewClientData = () => {
        if (roleIds.has(RoleEnum.SISTEMAS)
            || roleIds.has(RoleEnum.COMERCIAL) 
            || roleIds.has(RoleEnum.ADMINISTRATIVO) 
            || roleIds.has(RoleEnum.COMERCIAL)) {
            return true;
        }
        return false;
    };

    return {
        allowsViewClientData,
    };
};
