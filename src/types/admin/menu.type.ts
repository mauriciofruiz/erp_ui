export type MenuType = {
  menuId: number | null;
  menuName: string;
  menuFatherId: number | null;
  menuLevel: number;
  menuIcon: string;
  menuUrl: string;
  menuState: boolean;
  menuComponent: string;
};

export type MenuUsuarioType = {
  menuUserId: number | null;
  menuUserStatus: boolean;
  menuId: number;
  userId: number;
};