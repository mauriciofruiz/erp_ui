import {
  getAllMenus,
  getMenuById,
  getMenuUsuarioParams,
  getUsuarioParams,
  updateMenuUsuarioByList,
} from '@/backend/tba';
import { useLoadingOverlayContext } from '@/context';
import { useStyles } from '@/hooks';
import { ServerResponseType } from '@/store';
import { MenuType, MenuUsuarioType, UserType } from '@/types';
import { Save } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Collapse,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { CardLayout } from '../layout';

export type MenuUsuarioPageProps = {};

function not(a: readonly MenuType[], b: readonly MenuType[]) {
  return a.filter((value) => !b.some((item) => item.menuId === value.menuId));
}

function intersection(a: readonly MenuType[], b: readonly MenuType[]) {
  return a.filter((value) => b.some((item) => item.menuId === value.menuId));
}

function union(a: readonly MenuType[], b: readonly MenuType[]) {
  return [...a, ...not(b, a)];
}

export const MenuUsuarioPage: React.FC<MenuUsuarioPageProps> = ({}) => {
  // * ----------------------------- DECLARATIONS ---------------------------------

  const styles = useStyles();

  const [inputValue, setInputValue] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const [menuList, setMenuList] = useState<MenuType[]>([]);

  const [menuListByUser, setMenuListByUser] = useState<MenuType[]>([]);

  const [menuUsuarioList, setMenuUsuarioList] = useState<
    MenuUsuarioType[] | null
  >(null);

  const [usersList, setUsersList] = useState<UserType[]>([]);

  const [user, setUser] = useState<UserType | null>(null);

  const [checked, setChecked] = React.useState<MenuType[]>([]);
  const [nuevosChecked, setNewChecked] = React.useState<MenuType[]>([]);

  const [open, setOpen] = useState(false);

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  // * ------------------------------------------ USE EFFECT -------------------------
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response: ServerResponseType | undefined = await getAllMenus();
        if (response) {
          if (response.status === 200) {
            setMenuList(response.message);
          } else {
            enqueueSnackbar(
              `No se pudieron cargar los menús: ${response.message}`,
              { variant: 'error' }
            );
          }
        }
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };
    fetchMenuData();
  }, []);

  useEffect(() => {
    const fetchMenuByUser = async () => {
      showLoading();

      try {
        const menuPromises =
          menuUsuarioList?.map((menuArray) => getMenuById(menuArray.menuId)) ||
          [];
        const responses = await Promise.all(menuPromises);
        const successfulResponses = responses.filter(
          (response) => response && response.status === 200
        );
        const tempListMenu = menuUsuarioList?.filter((m) => m.menuUserStatus);
        const tempListMenuFalse = menuUsuarioList?.filter(
          (m) => !m.menuUserStatus
        );
        // Filter tempListMenu based on menuId existence in successfulResponses
        const filteredMenusTrue = successfulResponses
          .map((response) => response?.message)
          .filter((tempMenu) =>
            tempListMenu?.some((menu) => menu.menuId === tempMenu.menuId)
          )
          .map((menu) => ({ ...menu, menuState: true }));
        // Filter tempListMenu based on menuId non-existence in successfulResponses
        const filteredMenusFalse = successfulResponses
          .map((response) => response?.message)
          .filter((tempMenu) =>
            tempListMenuFalse?.some((menu) => menu.menuId === tempMenu.menuId)
          )
          .map((menu) => ({ ...menu, menuState: false }));
        // Combine menus with menuState true and false
        const updatedMenus = [...filteredMenusTrue, ...filteredMenusFalse];

        menuList.forEach((menu) => {
          const matchingMenu = updatedMenus.find(
            (u) => u.menuId === menu.menuId
          );
          if (matchingMenu) {
            menu.menuState = matchingMenu.menuState;
          }
        });

        setMenuList(menuList);
        setChecked(updatedMenus);
        setMenuListByUser(updatedMenus);
        hideLoading();
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        hideLoading();
      }
    };
    fetchMenuByUser();
  }, [menuUsuarioList]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response: ServerResponseType | undefined = await getUsuarioParams(
          inputValue.toUpperCase(),
          true
        );
        if (response) {
          if (response.status === 200) {
            setUsersList(response.message);
          } else {
            setUsersList([]); // Set an empty array if there are no results
            enqueueSnackbar(
              `No se pudieron cargar los usuarios: ${response.message}`,
              { variant: 'error' }
            );
          }
        }
      } catch (error) {
        setUsersList([]); // Set an empty array on error
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };
    fetchUser();
  }, [inputValue]);

  useEffect(() => {
    const fetchMenuUsuarioData = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getMenuUsuarioParams(user?.userId ?? 0);
        if (response) {
          if (response.status === 200) {
            setMenuUsuarioList(response.message);
          } else {
            enqueueSnackbar(
              `No se pudieron cargar los menús del usuario: ${user?.nick}`,
              { variant: 'error' }
            );
          }
        }
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };
    if (user !== null) {
      fetchMenuUsuarioData();
    }
  }, [user]);

  // * -------------------------------------- HANDLERS ------------------------------------

  const handleAutocompleteChange = (
    event: React.ChangeEvent<{}>,
    newValue: UserType | null
  ) => {
    setUser(null);
    if (event !== null && newValue !== null) {
      setUser(newValue);
    }
  };

  const handleInputChangeAutocomplete = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setInputValue(newInputValue);
    }
  };

  // ? ------------------------------- HANDLERS TRANSFER LIST ---------------------
  const handleToggle = (value: MenuType) => () => {
    const currentIndex2 = checked.find((a) => a.menuId === value.menuId);
    const validateCheckToSave = nuevosChecked.find(
      (a) => a.menuId === value.menuId
    );
    const newChecked = [...checked];
    const checkedToSave = [...nuevosChecked];
    setOpen(true);

    if (!currentIndex2) {
      newChecked.push(value);
    } else {
      const currentIndex = checked.indexOf(currentIndex2);
      newChecked.splice(currentIndex, 1);
    }
    if (!validateCheckToSave) {
      checkedToSave.push(value);
    } else {
      const currentIndex = nuevosChecked.indexOf(validateCheckToSave);
      checkedToSave.splice(currentIndex, 1);
    }
    setChecked(newChecked);
    setNewChecked(checkedToSave);
  };

  const numberOfChecked = (items: MenuType[]) =>
    intersection(checked, items).length;

  const handleToggleAll = (items: MenuType[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  useEffect(() => {
    if (menuListByUser.length > 0) {
      const checkedItems = menuListByUser.map((element) => {
        return element;
      });
      setChecked(checkedItems);
      setOpen(true);
    }
  }, [menuListByUser]);

  const handleSwitchMenuState = (
    event: React.ChangeEvent<HTMLInputElement>,
    menuCheckBox: MenuType
  ) => {
    const indexNewToModify = nuevosChecked.findIndex(
      (menu) => menu.menuId === menuCheckBox.menuId
    );

    if (indexNewToModify !== -1) {
      const newMenus = [...nuevosChecked];
      newMenus[indexNewToModify] = {
        ...(menuCheckBox || newMenus[indexNewToModify]),
        menuState: event.target.checked,
      };
      setNewChecked(newMenus);
      menuList.forEach((menu) => {
        const matchingMenu = newMenus.find((u) => u.menuId === menu.menuId);
        if (matchingMenu) {
          menu.menuState = matchingMenu.menuState;
        }
      });
    } else {
      const indexUpdateToModify = checked.findIndex(
        (menu) => menu.menuId === menuCheckBox.menuId
      );

      if (indexUpdateToModify !== -1) {
        const updatedMenu = [...checked];
        updatedMenu[indexUpdateToModify] = {
          ...(menuCheckBox || updatedMenu[indexUpdateToModify]),
          menuState: event.target.checked,
        };
        const menusModificated = [...nuevosChecked];
        menusModificated.push(updatedMenu[indexUpdateToModify]);
        setChecked(updatedMenu);
        setNewChecked(menusModificated);
        menuList.forEach((menu) => {
          const matchingMenu = updatedMenu.find(
            (u) => u.menuId === menu.menuId
          );
          if (matchingMenu) {
            menu.menuState = matchingMenu.menuState;
          }
        });
      }
    }
  };

  const customList = (title: React.ReactNode, items: MenuType[]) => (
    <Card sx={{ bgcolor: '#696969' }}>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              numberOfChecked(items) === items.length && items.length !== 0
            }
            indeterminate={
              numberOfChecked(items) !== items.length &&
              numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} seleccionados`}
      />
      <Divider />
      <List
        sx={{
          width: 'auto',
          height: 400,
          bgcolor: '#fff',
          overflow: 'auto',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        dense
        component="div"
        role="list"
      >
        {items.map((value: MenuType) => {
          if (value.menuFatherId === 1) {
            const labelId = `transfer-list-all-item-${value.menuId}-label`;
            return (
              <ListItem key={value.menuId} role="listitem">
                <ListItemIcon>
                  <Checkbox
                    checked={checked.some(
                      (check) => check.menuId === value.menuId
                    )}
                    tabIndex={-1}
                    disableRipple
                    onClick={handleToggle(value)}
                    inputProps={{
                      'aria-labelledby': labelId,
                    }}
                  />
                  {switchMenu(value, labelId)}
                </ListItemIcon>
                <ListItemText id={labelId}>
                  <Typography style={{ color: '#000' }}>
                    {value.menuName}
                  </Typography>
                  {checked.some((item) => item.menuId === value.menuId) && (
                    <Collapse in={open} timeout="auto" unmountOnExit>
                      {menuList.map((level2: MenuType) => {
                        if (value.menuId === level2.menuFatherId) {
                          return (
                            <ListItem key={level2.menuId} role="listitem">
                              <ListItemIcon>
                                <Checkbox
                                  checked={checked.some(
                                    (check) => check.menuId === level2.menuId
                                  )}
                                  tabIndex={-1}
                                  disableRipple
                                  onClick={handleToggle(level2)}
                                  inputProps={{
                                    'aria-labelledby': labelId,
                                  }}
                                />
                                {switchMenu(level2, labelId)}
                              </ListItemIcon>
                              <ListItemText>
                                <Typography style={{ color: '#000' }}>
                                  {level2.menuName}
                                </Typography>
                                {checked.some(
                                  (item) => item.menuId === level2.menuId
                                ) && (
                                  <Collapse
                                    in={open}
                                    timeout="auto"
                                    unmountOnExit
                                  >
                                    {menuList.map((level3: MenuType) => {
                                      if (
                                        level2.menuId === level3.menuFatherId
                                      ) {
                                        return (
                                          <ListItem
                                            key={level3.menuId}
                                            role="listitem"
                                          >
                                            <ListItemIcon>
                                              <Checkbox
                                                checked={checked.some(
                                                  (check) =>
                                                    check.menuId ===
                                                    level3.menuId
                                                )}
                                                tabIndex={-1}
                                                disableRipple
                                                onClick={handleToggle(level3)}
                                                inputProps={{
                                                  'aria-labelledby': labelId,
                                                }}
                                              />
                                              {switchMenu(level3, labelId)}
                                            </ListItemIcon>
                                            <ListItemText>
                                              <Typography
                                                style={{ color: '#000' }}
                                              >
                                                {level3.menuName}
                                              </Typography>
                                              {checked.some(
                                                (item) =>
                                                  item.menuId === level3.menuId
                                              ) && (
                                                <Collapse
                                                  in={open}
                                                  timeout="auto"
                                                  unmountOnExit
                                                >
                                                  {menuList.map(
                                                    (level4: MenuType) => {
                                                      if (
                                                        level3.menuId ===
                                                        level4.menuFatherId
                                                      ) {
                                                        return (
                                                          <ListItem
                                                            key={level4.menuId}
                                                            role="listitem"
                                                          >
                                                            <ListItemIcon>
                                                              <Checkbox
                                                                checked={checked.some(
                                                                  (check) =>
                                                                    check.menuId ===
                                                                    level4.menuId
                                                                )}
                                                                tabIndex={-1}
                                                                disableRipple
                                                                onClick={handleToggle(
                                                                  level4
                                                                )}
                                                                inputProps={{
                                                                  'aria-labelledby':
                                                                    labelId,
                                                                }}
                                                              />
                                                              {switchMenu(
                                                                level4,
                                                                labelId
                                                              )}
                                                            </ListItemIcon>
                                                            <ListItemText>
                                                              <Typography
                                                                style={{
                                                                  color: '#000',
                                                                }}
                                                              >
                                                                {
                                                                  level4.menuName
                                                                }
                                                              </Typography>
                                                              {checked.some(
                                                                (item) =>
                                                                  item.menuId ===
                                                                  level4.menuId
                                                              ) && (
                                                                <Collapse
                                                                  in={open}
                                                                  timeout="auto"
                                                                  unmountOnExit
                                                                >
                                                                  {menuList.map(
                                                                    (
                                                                      level5: MenuType
                                                                    ) => {
                                                                      if (
                                                                        level4.menuId ===
                                                                        level5.menuFatherId
                                                                      ) {
                                                                        return (
                                                                          <ListItem
                                                                            key={
                                                                              level5.menuId
                                                                            }
                                                                            role="listitem"
                                                                          >
                                                                            <ListItemIcon>
                                                                              <Checkbox
                                                                                checked={checked.some(
                                                                                  (
                                                                                    check
                                                                                  ) =>
                                                                                    check.menuId ===
                                                                                    level5.menuId
                                                                                )}
                                                                                tabIndex={
                                                                                  -1
                                                                                }
                                                                                disableRipple
                                                                                onClick={handleToggle(
                                                                                  level5
                                                                                )}
                                                                                inputProps={{
                                                                                  'aria-labelledby':
                                                                                    labelId,
                                                                                }}
                                                                              />
                                                                              {switchMenu(
                                                                                level5,
                                                                                labelId
                                                                              )}
                                                                            </ListItemIcon>
                                                                            <ListItemText>
                                                                              <Typography
                                                                                style={{
                                                                                  color:
                                                                                    '#000',
                                                                                }}
                                                                              >
                                                                                {
                                                                                  level5.menuName
                                                                                }
                                                                              </Typography>
                                                                            </ListItemText>
                                                                          </ListItem>
                                                                        );
                                                                      }
                                                                    }
                                                                  )}
                                                                </Collapse>
                                                              )}
                                                            </ListItemText>
                                                          </ListItem>
                                                        );
                                                      }
                                                    }
                                                  )}
                                                </Collapse>
                                              )}
                                            </ListItemText>
                                          </ListItem>
                                        );
                                      }
                                    })}
                                  </Collapse>
                                )}
                              </ListItemText>
                            </ListItem>
                          );
                        }
                      })}
                    </Collapse>
                  )}
                </ListItemText>
              </ListItem>
            );
          }
        })}
      </List>
    </Card>
  );

  const switchMenu = (value: MenuType, labelId: string) => {
    return (
      <ListItemIcon>
        <Switch
          checked={value.menuState}
          tabIndex={-1}
          disableRipple
          inputProps={{
            'aria-labelledby': labelId,
          }}
          onChange={(event) => handleSwitchMenuState(event, value)}
        />
      </ListItemIcon>
    );
  };

  const handleSaveClick = () => {
    const menuUsuarioListToSave: MenuUsuarioType[] = nuevosChecked.map(
      (menu) => {
        const menuExistente = menuUsuarioList?.filter(
          (mu) => mu.menuId === menu.menuId && mu.userId === user?.userId
        );
        const menuUsuario: MenuUsuarioType = {
          menuUserId:
            menuExistente && menuExistente.length > 0
              ? menuExistente[0]?.menuUserId
              : null,
          menuUserStatus:
            menu.menuState && menu.menuState !== null ? menu.menuState : false,
          menuId: menu.menuId ?? 0,
          userId: user?.userId ?? 0,
        };
        return menuUsuario;
      }
    );
    setMenuUsuarioList(menuUsuarioListToSave);
    const fetchUpdate = async () => {
      showLoading();

      try {
        const response: ServerResponseType | undefined =
          await updateMenuUsuarioByList(menuUsuarioListToSave);
        if (response) {
          if (response.status === 200) {
            enqueueSnackbar(`Menús Actualizados Correctamente`, {
              variant: 'success',
            });
            hideLoading();

            handleCancel();
          } else {
            enqueueSnackbar(
              `No se pudieron cargar los menús del usuario: ${user?.nick}`,
              { variant: 'error' }
            );
            hideLoading();

            handleCancel();
          }
        }
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        hideLoading();

        handleCancel();
      }
    };
    fetchUpdate();
  };

  const handleCancel = () => {
    setInputValue('');
    setMenuList([]);
    // setMenuListByUser([])
    // setMenuUsuarioList([])
    setUsersList([]);
    setUser(null);
    setChecked([]);
    setNewChecked([]);
    setUser(null);
  };

  return (
    <CardLayout title="ADMINISTRACIÓN MENÚ POR USUARIO" marginTop={10}>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12}>
          <Autocomplete
            id="autocomplete-users"
            className={styles.genericFieldStyle}
            options={usersList}
            getOptionLabel={(option) => option.nick}
            style={{ width: '100%', marginBottom: '20px' }}
            onChange={(event, newValue) =>
              handleAutocompleteChange(event, newValue)
            }
            onInputChange={(event, newInputValue) =>
              handleInputChangeAutocomplete(event, newInputValue)
            }
            value={user?.userId !== null ? user : null || null}
            isOptionEqualToValue={(option, value) =>
              option?.userId === value?.userId
            }
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Seleccione un usuario"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  className: styles.textWhiteStyle,
                }}
                InputLabelProps={{
                  ...params.InputLabelProps,
                  className: styles.textGreenStyle,
                }}
              />
            )}
          />
        </Grid>
        {user && user.userId ? (
          <Grid item xs={12}>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item>{customList('Menus Disponibles', menuList)}</Grid>
            </Grid>
          </Grid>
        ) : null}
      </Grid>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 2 }}
      >
        {user && user.userId ? (
          <Button
            startIcon={<Save />}
            onClick={handleSaveClick}
            sx={{ margin: 2 }}
            variant="contained"
          >
            {'Guardar'}
          </Button>
        ) : null}
      </Grid>
    </CardLayout>
  );
};
