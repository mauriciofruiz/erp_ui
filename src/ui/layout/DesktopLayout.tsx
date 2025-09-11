import { Desktop } from '@/auth';
import { RootState } from '@/store';
import React from 'react';
import { useSelector } from 'react-redux';

export type DesktopLayoutProps = {};

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({}) => {
  const { user, activeMenu } = useSelector((state: RootState) => state.auth);

  const menus = user?.menuList.filter(
    (menu) =>
      menu.menuIcon &&
      menu.menuState &&
      menu.menuLevel ===
        (activeMenu?.menuLevel ? activeMenu?.menuLevel + 1 : null) &&
      menu.menuFatherId === activeMenu?.menuId
  );

  return <Desktop menus={menus} />;
};
