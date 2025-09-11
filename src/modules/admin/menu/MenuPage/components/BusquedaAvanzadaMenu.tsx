import { FormState, useMenuAsync } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { PaginatedResponseType } from '@/types';
import { Search } from '@mui/icons-material';
import { Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import React, { ChangeEvent } from 'react';

export type BusquedaAvanzadaMenuProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    formState: FormState
    setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
    onResetForm: () => void;
    onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void;
}

export const BusquedaAvanzadaMenu: React.FC<BusquedaAvanzadaMenuProps> = ({
    open,
    setOpen,
    formState,
    setPagination,
    onResetForm,
    onInputJustNumber,
    onInputChange
}) => {

    const { fetchMainMenus } = useMenuAsync();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const getResult = async () => {
            const paginacion = await fetchMainMenus(
				formState.menuId,
				formState.menuName,
				formState.menuLevel,
				formState.page,
				formState.pageSize,
				formState.sortDirection,
				formState.sortColumn
            );
            setPagination(paginacion as PaginatedResponseType);
        };
        getResult();
        onResetForm();
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            maxWidth="md"
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: 0,
                },
            }}
        >
            <DialogTitle
                style={{
                    cursor: 'move',
                    textAlign: 'center',
                }}
                id="draggable-dialog-title"
                sx={{ mt: 2 }}
            >
                BÚSQUEDA AVANZADA MENU
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                name="menuId"
                                label="Id Menú"
                                value={formState.menuId !== null ? formState.menuId : ''}
                                onChange={onInputJustNumber}
                                InputLabelProps={{
                                    shrink: formState.menuId ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="menuName"
                                label="Nombre Menú"
                                value={formState.menuName !== null ? formState.menuName : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.menuName ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        sx={{ mt: 2 }}
                    >
                        <Button startIcon={<Search />} sx={{ margin: 2 }} type="submit">
                            {'Buscar'}
                        </Button>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    )
}
