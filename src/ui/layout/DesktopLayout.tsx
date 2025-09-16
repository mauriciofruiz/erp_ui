import { Desktop } from './Desktop';
import { RootState } from '@/store';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

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

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            padding: 3,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: '#ffffff',
              background: 'linear-gradient(45deg, #ffffff, #f8fafc)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            {activeMenu?.menuName || 'Módulos'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
            }}
          >
            Selecciona un módulo para continuar
          </Typography>
        </Box>
      </motion.div>

      {/* Content Section */}
      <Box
        sx={{
          padding: 3,
          minHeight: 'calc(100% - 120px)',
        }}
      >
        <Desktop menus={menus} />
      </Box>
    </Box>
  );
};
