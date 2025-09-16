import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MenuType } from '@/types';
import { motion } from 'framer-motion';
import { RootState } from '@/store';
import { IconsMap } from '@/modules';
import { setHistoryMenu, setMenu } from '@/store/auth/authSlice';
import { Search, SortByAlpha } from '@mui/icons-material';

const iconList = IconsMap;

export type DesktopProps = {
  menus: MenuType[] | undefined;
};

export const Desktop: React.FC<DesktopProps> = ({ menus }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [order, setOrder] = useState('asc');
  const { activeMenu, historyMenu } = useSelector(
    (state: RootState) => state.auth
  );
  const [searchText, setSearchText] = useState('');
  const [filteredIcons, setFilteredIcons] = useState<MenuType[]>([]);

  const handleSearchTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    const filteredMenus = !menus
      ? []
      : menus.filter(
          (icon) =>
            icon.menuName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
        );

    setFilteredIcons(filteredMenus);
  }, [menus, searchText]);

  const handleIconClick = (menu: MenuType) => {
    if (activeMenu) {
      const newHistoryMenu: MenuType[] = [...historyMenu, activeMenu];
      dispatch(setHistoryMenu(newHistoryMenu));
      localStorage.setItem('historyMenu', JSON.stringify(newHistoryMenu));
    }
    dispatch(setMenu(menu));
    localStorage.setItem('activeMenu', JSON.stringify(menu));
    navigate(menu.menuUrl);
  };

  const toggleOrder = () => {
    const newOrder = order === 'asc' ? 'desc' : 'asc';
    setOrder(newOrder);
    const sortedIcons = [...filteredIcons].sort((a, b) => {
      if (newOrder === 'asc') return a.menuName.localeCompare(b.menuName);
      else return b.menuName.localeCompare(a.menuName);
    });
    setFilteredIcons(sortedIcons);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        height: '100%',
      }}
    >
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            px: isMobile ? 1 : 4,
          }}
        >
          <TextField
            placeholder="Buscar módulos..."
            variant="outlined"
            size="medium"
            value={searchText}
            onChange={handleSearchTextChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={order === 'asc' ? 'Ordenar A-Z' : 'Ordenar Z-A'}>
                    <IconButton 
                      onClick={toggleOrder}
                      sx={{
                        color: '#667eea',
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        },
                      }}
                    >
                      <SortByAlpha
                        sx={{
                          transform: order === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{
              width: '100%',
              maxWidth: isMobile ? '100%' : '600px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#667eea',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
                borderWidth: 2,
              },
            }}
          />
        </Box>
      </motion.div>

      {/* Menu Items Grid */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: isMobile ? 1 : 2,
        }}
      >
        <Grid container spacing={isMobile ? 2 : 3}>
          {filteredIcons.map((icon, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              xl={2} 
              key={icon.menuId}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                  delay: index * 0.1,
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  onClick={() => handleIconClick(icon)}
                  onTouchStart={() => handleIconClick(icon)}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 1)',
                      boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
                      transform: 'translateY(-4px)',
                    },
                    '&:active': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: 3,
                      minHeight: isMobile ? '120px' : '140px',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                        mb: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 6px 25px rgba(102, 126, 234, 0.4)',
                        },
                      }}
                    >
                      <Box sx={{ color: '#ffffff', fontSize: 28 }}>
                        {iconList[icon.menuIcon]}
                      </Box>
                    </Box>
                    <Typography 
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: '#475569',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        lineHeight: 1.2,
                        textAlign: 'center',
                      }}
                    >
                      {icon.menuName}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {filteredIcons.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 1,
                }}
              >
                {searchText ? 'No se encontraron módulos' : 'No hay módulos disponibles'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                {searchText ? 'Intenta con otro término de búsqueda' : 'Contacta al administrador para obtener acceso'}
              </Typography>
            </Box>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};
