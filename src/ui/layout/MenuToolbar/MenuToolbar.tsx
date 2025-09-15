import React, { useMemo, useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion, useCycle } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { usericon } from '@/assets';
import { IconButton, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconsMap } from '@/modules';
import { FootBar } from '../FootBar';
import { MenuToggle } from './MenuToggle';
import { useDimensions } from './useDimensions';
import { setHistoryMenu, setMenu } from '@/store/auth/authSlice';
import { AppDispatch, RootState } from '@/store';
import { MenuType } from '@/types';

export type MenuToolbarProps = {
  onMenuToggle?: (isOpen: boolean) => void;
};

const itemVariants = {
  closed: {
    opacity: 0,
  },
  open: { opacity: 1 },
};

const sideVariants = {
  closed: {
    transition: {
      staggerChildren: 0.2,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      staggerChildren: 0.2,
      staggerDirection: 1,
    },
  },
};

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 100}px at 40px 40px)`,
    transition: {
      type: 'spring',
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: 'circle(30px at 40px 40px)',
    transition: {
      delay: 0.5,
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
};

const MenuToolbar: React.FC<MenuToolbarProps> = ({ onMenuToggle }) => {
  const [isOpen, cycleOpen] = useCycle(false, true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { height } = useDimensions(containerRef);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    user,
    activeMenu,
    position: cargoActivo,
    historyMenu,
  } = useSelector((state: RootState) => state.auth);
  const { sucursales } = useSelector((state: RootState) => state.common);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const photo = useMemo(() => (!!user?.photo ? user?.photo : usericon), [user]);
  const cargo = useMemo(() => {
    return !!cargoActivo
      ? cargoActivo.positionName
      : '¡SESIÓN INCORRECTA! LOGUESE DE NUEVO';
  }, [cargoActivo]);
  const menus = user?.menuList.filter(
    (menu) => menu.menuIcon && menu.menuState === true && menu.menuLevel <= 1
  );
  const sucursalUsuario = useMemo(() => {
    return sucursales.find((sucursal) => sucursal.branchId === user?.branchId)
      ?.name;
  }, [sucursales, user]);

  const handleIconClick = (menu: MenuType) => {
    if (activeMenu) {
      const newHistoryMenu: MenuType[] = [...historyMenu, activeMenu];
      dispatch(setHistoryMenu(newHistoryMenu));
      localStorage.setItem('historyMenu', JSON.stringify(newHistoryMenu));
    }
    dispatch(setMenu(menu));
    localStorage.setItem('activeMenu', JSON.stringify(menu));
    navigate(menu.menuUrl);
    window.scrollTo(0, 0);
  };

  const searchMenuLevel1 = (menu: MenuType | null): MenuType | undefined => {
    if (!menu) {
      return undefined;
    }
    if (menu.menuLevel === 1) {
      return menu;
    }

    const findMenu = (menuId: number | null) =>
      user?.menuList.find((menuUser) => menuUser.menuId === menuId);

    const findMenuByLevel = (
      menuId: number | null,
      level: number
    ): MenuType | undefined => {
      const menuUser = findMenu(menuId);
      return menuUser?.menuLevel === level ? menuUser : undefined;
    };

    const menuFatherId = menu.menuFatherId;

    if (menu.menuLevel === 2) {
      return findMenuByLevel(menuFatherId, 1);
    }

    if (menu.menuLevel === 3) {
      const menuUser = findMenuByLevel(menuFatherId, 2);
      return menuUser ? searchMenuLevel1(menuUser) : undefined;
    }

    if (menu.menuLevel === 4) {
      const menuUser = findMenuByLevel(menuFatherId, 3);
      return menuUser ? searchMenuLevel1(menuUser) : undefined;
    }

    if (menu.menuLevel === 5) {
      const menuUser = findMenuByLevel(menuFatherId, 4);
      return menuUser ? searchMenuLevel1(menuUser) : undefined;
    }

    return undefined;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      if (isOpen) {
        timer = setTimeout(() => {
          cycleOpen(0);
        }, 5000);
      }
    };

    const handleActivity = () => {
      resetTimer();
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('mousemove', handleActivity);
      contentElement.addEventListener('mousedown', handleActivity);
      contentElement.addEventListener('touchstart', handleActivity, {
        passive: true,
      });
    }

    resetTimer();

    return () => {
      clearTimeout(timer);
      if (contentElement) {
        contentElement.removeEventListener('mousemove', handleActivity);
        contentElement.removeEventListener('mousedown', handleActivity);
        contentElement.removeEventListener('touchstart', handleActivity);
      }
    };
  }, [isOpen, cycleOpen]);

  // Notify parent component about menu state changes
  useEffect(() => {
    if (onMenuToggle) {
      onMenuToggle(isOpen);
    }
  }, [isOpen, onMenuToggle]);

  return (
    <motion.main
      initial={{ width: '60px' }}
      style={{ 
        display: 'flex',
        position: 'fixed',
        left: 0,
        top: '62px',
        height: 'calc(100vh - 62px)',
        zIndex: 1000,
      }}
      animate={{
        width: isOpen ? (isMobile ? '280px' : '280px') : '60px',
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ width: 0 }}
            exit={{
              width: 0,
              transition: { delay: 0.7, duration: 0.3 },
            }}
            style={{ 
              zIndex: 2, 
              position: 'relative',
              height: '100%',
              overflow: 'visible',
            }}
          >
            <motion.div
              className="container"
              initial="closed"
              animate="open"
              exit="closed"
              variants={sideVariants}
              style={{ 
                width: isMobile ? '280px' : '280px',
                height: '100%',
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
              ref={contentRef}
            >
              <div
                style={{
                  width: '100%',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0 0 16px 0',
                  marginBottom: '20px',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                      mb: 2,
                    }}
                  >
                    <img
                      src={photo}
                      alt="user"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      mb: 0.5,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {user?.userName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      mb: 0.5,
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {cargo}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {sucursalUsuario}
                  </Typography>
                </Box>
              </div>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  width: '100%',
                }}
              >
                <Box
                  component="ul"
                  sx={{
                    width: '100%',
                    padding: 0,
                    margin: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                {menus?.map((menu) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    variants={itemVariants}
                    key={menu.menuId}
                    onClick={() => handleIconClick(menu)}
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: searchMenuLevel1(activeMenu)?.menuId === menu.menuId
                        ? 'rgba(255, 255, 255, 0.2)'
                        : selectedMenu === menu.menuId
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: searchMenuLevel1(activeMenu)?.menuId === menu.menuId
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: searchMenuLevel1(activeMenu)?.menuId === menu.menuId
                        ? '0 4px 20px rgba(255, 255, 255, 0.1)'
                        : '0 2px 10px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={() => setSelectedMenu(menu.menuId)}
                    onMouseLeave={() => setSelectedMenu(null)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          background: searchMenuLevel1(activeMenu)?.menuId === menu.menuId
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'transparent',
                            },
                          }}
                        >
                          {IconsMap[menu.menuIcon]}
                        </IconButton>
                      </Box>
                      <Typography 
                        variant="subtitle1"
                        sx={{
                          color: '#ffffff',
                          fontWeight: searchMenuLevel1(activeMenu)?.menuId === menu.menuId ? 600 : 500,
                          fontSize: '0.95rem',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                          flex: 1,
                        }}
                      >
                        {menu.menuName}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
                </Box>
                
                {/* Footer positioned at the bottom */}
                <Box
                  sx={{
                    marginTop: 'auto',
                    paddingTop: 2,
                    width: '100%',
                  }}
                >
                  <FootBar />
                </Box>
              </Box>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
      <motion.div
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        custom={height}
        ref={containerRef}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: isMobile ? '280px' : '280px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            zIndex: 1,
          }}
          variants={sidebar}
        />
        <Box
          sx={{
            position: 'fixed',
            top: '74px',
            left: '10px',
            zIndex: 1002,
          }}
        >
          <MenuToggle toggle={() => cycleOpen()} />
        </Box>
      </motion.div>
    </motion.main>
  );
};

export default MenuToolbar;
