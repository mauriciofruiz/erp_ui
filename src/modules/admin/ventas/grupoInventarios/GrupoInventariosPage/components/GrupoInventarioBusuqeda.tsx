import { FormState, useGrupoInventarioAsync } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { PaginatedResponseType } from '@/types';
import { Search } from '@mui/icons-material';
import { Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import React, { ChangeEvent } from 'react'

export type GrupoInventarioBusuqedaProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    formState: FormState
    setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
    onResetForm: () => void;
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void;
}

export const GrupoInventarioBusuqeda: React.FC<GrupoInventarioBusuqedaProps> = ({
    open,
    setOpen,
    formState,
    setPagination,
    onResetForm,
    onInputChange
}) => {

    const { fetchMainGrupos } = useGrupoInventarioAsync();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const getResult = async () => {
            const paginacion = await fetchMainGrupos(
                formState.groupName,
                formState.page,
                formState.limit,
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
                BÚSQUEDA AVANZADA GRUPO INVENTARIOS
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                name="groupName"
                                label="Nombre"
                                value={formState.groupName !== '' ? formState.groupName : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.groupName ? true : false,
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
