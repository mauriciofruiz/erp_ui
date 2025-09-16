import { DepartmentsEnum, RoleEnum } from '@/enums';
import { getDateWithMonthName, getDepartmentByPosition } from '@/functions';
import { RootState } from '@/store';
import { DashboardCompras } from '@/ui/dashboards';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, FormControlLabel, Radio, Button, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { Home, CalendarToday } from '@mui/icons-material';

export const IndexPage = () => {
  const { position } = useSelector((state: RootState) => state.auth);
  const userRoles = useSelector((state: RootState) => state.auth.user?.roles);
  const { departments } = useSelector((state: RootState) => state.common);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: 2,
            }}
          >
            {/* Dashboard Title */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Home sx={{ color: '#ffffff', fontSize: 32 }} />
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
                }}
              >
                Dashboard
              </Typography>
            </Box>

            {/* Date Controls */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Radio
                    defaultChecked
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&.Mui-checked': {
                        color: '#ffffff',
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Mensual
                  </Typography>
                }
              />
              <Button
                variant="outlined"
                startIcon={<CalendarToday />}
                sx={{
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#ffffff',
                    fontSize: '0.9rem',
                  }}
                >
                  {getDateWithMonthName(new Date())}
                </Typography>
              </Button>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Content Section */}
      <Box
        sx={{
          padding: 3,
          minHeight: 'calc(100% - 120px)',
        }}
      >
        {dashboard}
      </Box>
    </Box>
  );
};
