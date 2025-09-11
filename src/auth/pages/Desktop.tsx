import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MenuType } from '@/types';
import { motion } from 'framer-motion';
import { RootState } from '@/store';
import { IconsMap } from '@/modules';
import { StyledIconButton, StyledPaper } from '@/hooks';
import { setHistoryMenu, setMenu } from '@/store/auth/authSlice';
import { Search, SortByAlpha } from '@mui/icons-material';

const iconList = IconsMap;

export type DesktopProps = {
  menus: MenuType[] | undefined;
};

export const Desktop: React.FC<DesktopProps> = ({ menus }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [order, setOrder] = useState('asc');

  const { activeMenu, historyMenu } = useSelector(
    (state: RootState) => state.auth
  );
  const [searchText, setSearchText] = useState('');

  const handleSearchTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value);
  };

  const [filteredIcons, setFilteredIcons] = useState<MenuType[]>([]);

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
    <Box className="desktop">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%',
          position: 'relative',
        }}
      >
        <TextField
          className="desktop search"
          placeholder="Buscador ..."
          variant="outlined"
          size="small"
          value={searchText}
          onChange={handleSearchTextChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Ordenar">
                  <IconButton onClick={toggleOrder}>
                    <SortByAlpha
                      style={{
                        transform:
                          order === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)',
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          fullWidth
          style={{
            position: 'absolute',
            paddingLeft: '10%',
            paddingRight: '20%',
          }}
        />
      </Box>

      <Box className="desktop container" style={{ width: '100%' }}>
        <Grid container spacing={1}>
          {filteredIcons.map((icon, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={icon.menuId}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 10,
                  delay: index * 0.2,
                }}
              >
                <StyledIconButton
                  onClick={() => handleIconClick(icon)}
                  onTouchStart={() => handleIconClick(icon)}
                  size="medium"
                >
                  <StyledPaper className="desktop paper">
                    {iconList[icon.menuIcon]}
                    <Typography variant="subtitle1">{icon.menuName}</Typography>
                  </StyledPaper>
                </StyledIconButton>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};
