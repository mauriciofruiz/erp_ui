import { getAllMenus } from '@/backend'
import { FormState, useMenuAsync, useStyles } from '@/hooks'
import { IconsMap, PaperComponent } from '@/modules/layout'
import { ServerResponseType } from '@/store'
import { MenuType } from '@/types'
import { Save } from '@mui/icons-material'
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import React, { ChangeEvent, useEffect, useState } from 'react'

export type MenuFormProps = {
    openNew: boolean;
    setOpenNew: React.Dispatch<React.SetStateAction<boolean>>;
    formState: FormState
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void
    handleOnSelect: (event: SelectChangeEvent<any>) => void
    menuList: MenuType[]
    onResetForm: () => void;
    onAutocompleteChange: (
        event: React.ChangeEvent<{}>,
        name: string,
        value: any,
        index?: number
    ) => void;
}
export const MenuForm: React.FC<MenuFormProps> = ({
    openNew,
    setOpenNew,
    formState,
    onInputChange,
    handleOnSelect,
    //menuList,
    onResetForm,
    onAutocompleteChange
}) => {

    const styles = useStyles();
    const iconNames = Object.keys(IconsMap);
    const levels = [1, 2, 3, 4];
    const componentsMenu = ['Menu', 'Page'];
    const { fetchSaveMenu, fetchUpdateMenu } = useMenuAsync();
    const [menusList, setMenusList] = useState<MenuType[]>([]);
    const [menuPadreSelected, setMenuPadreSelected] = useState<MenuType | null>(null);

    const fetchMenuData = async () => {
        try {
            const response: ServerResponseType | undefined = await getAllMenus();
            if (response) {
                if (response.status === 200) {
                    setMenusList(response.message);
                } else {
                    setMenusList([]);
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

    const validateForm = () => {
        let isValid = true;

        if (formState.menuName === '') {
            enqueueSnackbar(
                'El campo Nombre es requerido',
                {
                    variant: 'error',
                }
            );
            isValid = false;
        }
        if (formState.menuLevel === null) {
            enqueueSnackbar(
                'El campo Nivel es Requerido',
                {
                    variant: 'error',
                }
            );
            isValid = false;
        }
        if (formState.menuComponent === '') {
            enqueueSnackbar(
                'El campo Tipo es requerido',
                {
                    variant: 'error',
                }
            );
            isValid = false;
        }
        if (formState.menuUrl === '') {
            enqueueSnackbar('El campo Url es requerido', {
                variant: 'error',
            });
            isValid = false;
        }
        return isValid;
    };

    useEffect(() => {
        fetchMenuData();
    }, []);

    useEffect(() => {
        if (formState.menuFatherId === null) {
            setMenuPadreSelected(null);
            return;
        }
        if (menuPadreSelected && menuPadreSelected !== null && menusList.length === 0) return;
        const menu = menusList.find((menu) => menu.menuId === formState.menuFatherId);
        if (menu) {
            setMenuPadreSelected(menu);
        }
    }, [formState.menuFatherId, menuPadreSelected]);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }
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

        const response = menuToSave.menuId
            ? await fetchUpdateMenu(
                menuToSave.menuId,
                menuToSave
            )
            : await fetchSaveMenu(
                menuToSave
            )
        if (
            !response ||
            (response && (response as ServerResponseType).status === 400) ||
            (response && (response as ServerResponseType).status === 500)
        ) {
            enqueueSnackbar(`Error al guardar el menu`, {
                variant: 'error',
            });
            return;
        }
        enqueueSnackbar(`El menu se guardo correctamente`, {
            variant: 'success',
        });
        onResetForm();
        setOpenNew(false);
    };

    return (
        <Dialog
            open={openNew}
            onClose={() => setOpenNew(false)}
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
                {formState.menuId && formState.menuId !== null ? 'EDITAR MENÚ' : 'NUEVO MENÚ'}
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
                                    value={formState.menuLevel !== null ? formState.menuLevel : 1}
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
                            <Autocomplete
                                className={styles.genericFieldStyle}
                                options={menusList}
                                getOptionLabel={(option) => option.menuName}
                                style={{ width: '100%' }}
                                onChange={(event, value) =>
                                    onAutocompleteChange(event, 'menuFatherId', value?.menuId)
                                }
                                value={menuPadreSelected}
                                isOptionEqualToValue={(option, value) =>
                                    option.menuId === value.menuId
                                }
                                noOptionsText="Sin resultados"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Padre"
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
                            //disabled={!isFormValid}
                            sx={{ margin: 2 }}
                            type="submit"
                        >
                            {'Guardar'}
                        </Button>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    )
}
