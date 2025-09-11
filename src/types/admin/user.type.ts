import { RolUserPost, RoleInterface } from '../common';
import { MenuType } from './menu.type';

export type UserLoginType = {
  cashId: number;
  branchId: number;
  userId: number | null;
  menuList: [MenuType] | [];
  userNick: string;
  password: string;
  photo: string;
  position: number;
  token: string;
  userName: string;
  roles: RoleInterface[];
};

export type UserType = {
  userId: number | null;
  branchId: number | null;
  personId: number | null;
  nick: string;
  password: string;
  position: number | null;
  entryDate: Date | null;
  deactivationDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  time: Date | null;
  cashId: number | null;
  unlockCode: number | null;
  photo: string | null;
  state: boolean;
};

export type UserResponse = {
  branchId: number | null;
  personId: number | null;
  nick: string;
  password: string;
  position: number | null;
  entryDate: Date | null;
  deactivationDate: Date | null;
  startTime: string;
  endTime: string;
  time: number | null;
  billingBranchCode: number | null;
  unlockCode: string;
  photo: string | null;
  state: boolean;
}


export type UserPostType = {
  nick: string
  branchId: number
  position: number
  startTime: string
  endTime: string
  stateUser: boolean,
  photo: string,
  cashId: number,
  rolesList: RolUserPost[]
}