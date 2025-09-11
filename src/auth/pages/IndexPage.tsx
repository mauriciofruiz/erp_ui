import { DepartmentsEnum, RoleEnum } from '@/enums';
import { getDateWithMonthName, getDepartmentByPosition } from '@/functions';
import { RootState } from '@/store';
import { DashboardCompras } from '@/ui/dashboards';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export const IndexPage = () => {
  const { position } = useSelector((state: RootState) => state.auth);
  const userRoles = useSelector((state: RootState) => state.auth.user?.roles);
  const { departments } = useSelector((state: RootState) => state.common);

  const [dashboard, setDashboard] = useState<React.ReactNode>(<></>);

  useEffect(() => {
    const departmentId = getDepartmentByPosition(
      position?.departmentId || 0,
      departments
    );

    const roleIds = new Set(userRoles?.map((role) => role.roleId));

    if (departmentId === DepartmentsEnum.ADQUISICIONES) {
      if (roleIds.has(RoleEnum.COMPRAS_LOCALES)) {
        setDashboard(<DashboardCompras />);
      } else if (roleIds.has(RoleEnum.COMPRAS_EXTERIORES)) {
        setDashboard(<></>);
      } else {
        setDashboard(<></>);
      }
    } else if (departmentId === DepartmentsEnum.FINANCIERO_CONTABLE) {
      setDashboard(<></>);
    } else {
      setDashboard(<></>);
    }
  }, [position, departments, userRoles]);

  return (
    <div className="wrapper">
      <section className="content">
        <header className="main-header">
          <div className="main-header__nav" style={{ marginTop: 12 }}>
            <h1 className="main-header__title">
              <i className="pe-7f-home" />
              <span>Dashboard</span>
            </h1>
          </div>
          <div className="main-header__date">
            <input
              type="radio"
              id="radio_date_1"
              name="tab-radio"
              defaultValue="today"
              defaultChecked
            />
            <label className="fixed-width" htmlFor="radio_date_1">
              Mensual
            </label>
            <button>
              <i className="pe-7f-date" />
              <span>{getDateWithMonthName(new Date())}</span>
            </button>
          </div>
        </header>
        {dashboard}
      </section>
    </div>
  );
};
