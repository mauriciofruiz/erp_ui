import { FormState, useForm, useStyles } from '@/hooks';
import { ServerResponseType } from '@/store';
import { MenuType } from '@/types';
import { AddCircle, Edit, Save } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { CardLayout, IconsMap, PaperComponent } from '../layout';
import { createMenu, getAllMenus, updateMenu } from '@/backend/tba';

export type MenuPageProps = {};

export const MenuPage: React.FC<MenuPageProps> = ({}) => {
  const [menuList, setMenuList] = useState<MenuType[]>([]);

  const [open, setOpen] = useState<boolean>(false);

  const [sorting, setSorting] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  }>({
    column: 'menuName', // Default sorting column
    direction: 'asc', // Default sorting direction
  });

  const { enqueueSnackbar } = useSnackbar();

  const styles = useStyles();

  const { onInputChange, formState, onResetForm, setFormState, isFormValid } =
    useForm({
      menuId: null,
      menuName: '',
      menuLevel: 1,
      menuFatherId: 1,
      menuIcon: '',
      menuUrl: '',
      menuComponent: '',
    });

  const handleSort = (column: string) => {
    setSorting((prevSorting) => ({
      column,
      direction:
        prevSorting.column === column && prevSorting.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const sortedMenuList = menuList?.slice().sort((a, b) => {
    const isAsc = sorting.direction === 'asc';
    switch (sorting.column) {
      case 'menuName':
        return isAsc
          ? a.menuName.localeCompare(b.menuName)
          : b.menuName.localeCompare(a.menuName);
      case 'menuLevel':
        return isAsc ? a.menuLevel - b.menuLevel : b.menuLevel - a.menuLevel;
      // Add additional cases for other columns if needed
      default:
        return 0;
    }
  });

  const levels = [1, 2, 3, 4];

  const componentsMenu = ['Menu', 'Page'];

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

  const handleOnSelect = (event: SelectChangeEvent<any>) => {
    setFormState((prevState: FormState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEdit = (menu: MenuType) => {
    setOpen(true);
    setFormState({
      menuId: menu.menuId,
      menuName: menu.menuName,
      menuLevel: menu.menuLevel,
      menuFatherId: menu.menuFatherId,
      menuIcon: menu.menuIcon,
      menuUrl: menu.menuUrl,
      menuComponent: menu.menuComponent,
    });
  };

  const onNewMenu = () => {
    setFormState({
      menuId: null,
      menuName: '',
      menuLevel: 1,
      menuFatherId: 1,
      menuIcon: '',
      menuUrl: '',
      menuComponent: '',
    });

    setOpen(true);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const menuToSave: MenuType = {
      menuId: formState.menuId,
      menuName: formState.menuName,
      menuFatherId: formState.menuFatherId,
      menuLevel: formState.menuLevel,
      menuIcon: formState.menuIcon,
      menuUrl: formState.menuUrl,
      menuState: true,
      menuComponent: formState.menuComponent,
    };
    const saveMenu = async () => {
      try {
        let response: ServerResponseType | undefined; // Define response here

        if (menuToSave.menuId === null) {
          response = await createMenu(menuToSave); // Assign to response here
        } else {
          response = await updateMenu(menuToSave.menuId, menuToSave); // Assign to response here
        }

        if (response) {
          if (response.status === 200) {
            fetchMenuData();
            enqueueSnackbar(`Guardado exitoso`, { variant: 'success' });
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

    saveMenu();

    onResetForm();
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const iconNames = Object.keys(IconsMap);
  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          style={{
            cursor: 'move',
            textAlign: 'center',
          }}
          id="draggable-dialog-title"
          sx={{ mt: 2 }}
        >
          EDITAR MENU
        </DialogTitle>
        <DialogContent>
          <form onSubmit={onSubmit}>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  name="menuName"
                  label="Nombre"
                  value={formState.menuName}
                  onChange={onInputChange}
                  InputLabelProps={{
                    shrink: formState.menuName ? true : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="levels-label">Nivel</InputLabel>
                  <Select
                    name="menuLevel"
                    required
                    labelId="levels-label"
                    id="levels-select"
                    label="Nivel"
                    value={formState.menuLevel}
                    onChange={handleOnSelect}
                    fullWidth
                  >
                    {levels.map((nivel) => (
                      <MenuItem key={nivel} value={nivel}>
                        {nivel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="father-laber">Padre</InputLabel>
                  <Select
                    name="menuFatherId"
                    required
                    labelId="father-label"
                    id="father-select"
                    label="Padre"
                    value={formState.menuFatherId}
                    onChange={handleOnSelect}
                    fullWidth
                  >
                    {menuList
                      .filter((nivel) => nivel.menuLevel < formState.menuLevel)
                      .map((menu) => (
                        <MenuItem
                          key={menu.menuId}
                          value={parseInt(menu.menuId?.toString() || '')}
                        >
                          {menu.menuName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="component-label">Tipo</InputLabel>
                  <Select
                    name="menuComponent"
                    required
                    labelId="component-label"
                    id="component-select"
                    label="Tipo"
                    value={formState.menuComponent}
                    onChange={handleOnSelect}
                    fullWidth
                  >
                    {componentsMenu.map((component) => (
                      <MenuItem key={component} value={component}>
                        {component}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="menuUrl"
                  label="URL"
                  value={formState.menuUrl}
                  onChange={onInputChange}
                  InputLabelProps={{
                    shrink: formState.menuUrl ? true : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="icon-label">Ícono</InputLabel>
                  <Select
                    name="menuIcon"
                    required
                    labelId="icon-label"
                    id="icon-select"
                    label="Ícono"
                    value={formState.menuIcon}
                    onChange={handleOnSelect}
                    fullWidth
                  >
                    {iconNames.map((icon) => (
                      <MenuItem key={icon} value={icon}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          <span>{icon}</span>
                          <span>
                            {React.cloneElement(IconsMap[icon], {
                              style: { color: '#000' },
                            })}
                          </span>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Button
                startIcon={<Save />}
                onClick={() => setOpen(false)}
                disabled={!isFormValid}
                sx={{ margin: 2 }}
                type="submit"
              >
                {'Guardar'}
              </Button>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
      <CardLayout title="ADMINISTRACIÓN MENÚ" marginTop={10}>
        <div className={styles.tableContainer}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sorting.column === 'menuName'}
                      direction={
                        sorting.column === 'menuName'
                          ? sorting.direction
                          : 'asc'
                      }
                      onClick={() => handleSort('menuName')}
                    >
                      Nombre
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sorting.column === 'menuLevel'}
                      direction={
                        sorting.column === 'menuLevel'
                          ? sorting.direction
                          : 'asc'
                      }
                      onClick={() => handleSort('menuLevel')}
                    >
                      Nivel
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Padre</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMenuList?.map((menu, index) => (
                  <TableRow key={index}>
                    <TableCell>{menu.menuName}</TableCell>
                    <TableCell>{menu.menuLevel}</TableCell>
                    <TableCell>
                      {findParentName(menu, sortedMenuList)}
                    </TableCell>
                    <TableCell>{menu.menuUrl}</TableCell>
                    <TableCell>
                      <div className={styles.iconContainer}>
                        <Tooltip title="Editar Menú">
                          <IconButton onClick={() => handleEdit(menu)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          <Button
            startIcon={<AddCircle />}
            onClick={onNewMenu}
            sx={{ margin: 2 }}
          >
            {'Nuevo Menú'}
          </Button>
        </Grid>
      </CardLayout>
    </>
  );
};

function findParentName(menu: MenuType, menuList: MenuType[]) {
  const parentMenu = menuList.find(
    (menuTemp) => menuTemp.menuId === menu.menuFatherId
  );
  return parentMenu ? parentMenu.menuName : 'N/A';
}
