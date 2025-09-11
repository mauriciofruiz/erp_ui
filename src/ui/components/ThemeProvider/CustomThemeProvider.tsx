'use client';
import { DepartmentsEnum } from '@/enums';
import { getDepartmentByPosition } from '@/functions';
import { RootState } from '@/store';
import { createTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import {
  comprasTheme,
  contabilidadTheme,
  customTheme,
  recursosHumanosTheme,
  ventasTheme,
} from '@/ui/layout';

export type CustomThemeProviderProps = {
  children: React.ReactNode;
};

const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
}) => {
  const { position } = useSelector((state: RootState) => state.auth);
  const { departments } = useSelector((state: RootState) => state.common);

  const [theme, setTheme] = useState(customTheme(createTheme()));

  useEffect(() => {
    const departmentId = getDepartmentByPosition(
      position?.departmentId || 0,
      departments
    );

    switch (departmentId) {
      case DepartmentsEnum.ADQUISICIONES:
        setTheme(comprasTheme(createTheme()));
        break;

      case DepartmentsEnum.FINANCIERO_CONTABLE:
        setTheme(contabilidadTheme(createTheme()));
        break;

      case DepartmentsEnum.COMERCIAL: // Se comenta para evitar errores de compilación, modificar estilos
        setTheme(ventasTheme(createTheme()));
        break;

      case DepartmentsEnum.TALENTO_HUMANO:
        setTheme(recursosHumanosTheme(createTheme()));
        break;

      default:
        setTheme(customTheme(createTheme()));
        break;
    }
  }, [position, departments]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export default CustomThemeProvider;
