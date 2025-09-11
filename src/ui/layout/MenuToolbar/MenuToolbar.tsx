import React, { useMemo, useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion, useCycle } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { usericon } from '@/assets';
import { Grid, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconsMap } from '@/modules';
import { useStyles } from '@/hooks';
import { FootBar } from '../FootBar';
import { MenuToggle } from './MenuToggle';
import { useDimensions } from './useDimensions';
import { setHistoryMenu, setMenu } from '@/store/auth/authSlice';
import { AppDispatch, RootState } from '@/store';
import { MenuType } from '@/types';

export type MenuToolbarProps = {
  // types...
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

const MenuToolbar: React.FC<MenuToolbarProps> = ({}) => {
  const [isOpen, cycleOpen] = useCycle(false, true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { height } = useDimensions(containerRef);
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
  const styles = useStyles();

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

  return (
    <motion.main
      initial={{ width: '60px' }}
      style={{ display: 'flex' }}
      animate={{
        width: isOpen ? '260px' : '60px',
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
            style={{ zIndex: 2, position: 'relative', marginTop: '62px' }}
          >
            <motion.div
              className="container"
              initial="closed"
              animate="open"
              exit="closed"
              variants={sideVariants}
              style={{ width: '260px' }}
              ref={contentRef}
            >
              <div
                className="user-info"
                style={{
                  marginLeft: '-6.5%',
                  width: '260px',
                }}
              >
                <figure className="rounded-image profile__img">
                  <img
                    className="media-object"
                    src={photo}
                    alt="user"
                    height={150}
                    width={110}
                    style={{ marginTop: '-20px' }}
                  />
                </figure>
                <Grid container direction="column" justifyContent="center">
                  <h2 className="user-info__name">{user?.userName}</h2>
                  <h3 className="user-info__role" style={{ marginTop: '10px' }}>
                    {cargo}
                  </h3>
                  <h3 className="user-info__role">{sucursalUsuario}</h3>
                </Grid>
              </div>
              <ul
                className="main-nav"
                style={{
                  marginLeft: '-6.5%',
                  width: '260px',
                }}
              >
                {menus?.map((menu) => (
                  <motion.li
                    whileHover={{ scale: 1.1 }}
                    variants={itemVariants}
                    key={menu.menuId}
                    className={
                      searchMenuLevel1(activeMenu)?.menuId === menu.menuId
                        ? styles.navigateBarColor
                        : selectedMenu === menu.menuId
                        ? 'main-nav__link:hover'
                        : ''
                    }
                    onMouseEnter={() => setSelectedMenu(menu.menuId)}
                    onMouseLeave={() => setSelectedMenu(null)}
                    onClick={() => handleIconClick(menu)}
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Grid
                      container
                      alignItems="center"
                      className="main-nav__link"
                    >
                      <Grid item sx={{ ml: 1 }}>
                        <IconButton size="medium">
                          {IconsMap[menu.menuIcon]}
                        </IconButton>
                      </Grid>
                      <Grid item sx={{ ml: 1, mt: 1 }}>
                        <Typography variant="subtitle1">
                          {menu.menuName}
                        </Typography>
                      </Grid>
                    </Grid>
                  </motion.li>
                ))}
                <li>
                  <div
                    style={{
                      position: 'relative',
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  >
                    <FootBar />
                  </div>
                </li>
              </ul>
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
            width: '260px',
            backgroundColor: '#4f5052',
            zIndex: 1,
          }}
          variants={sidebar}
        />
        <MenuToggle toggle={() => cycleOpen()} />
      </motion.div>
    </motion.main>
  );
};

export default MenuToolbar;
