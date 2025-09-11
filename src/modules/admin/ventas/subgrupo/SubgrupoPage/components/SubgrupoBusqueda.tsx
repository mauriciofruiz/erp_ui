import { FormState, useGrupoInventarioAsync } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { PaginatedResponseType } from '@/types';
import { Search } from '@mui/icons-material';
import { Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import React, { ChangeEvent } from 'react'

export type SubgrupoBusuqedaProps = {
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

export const SubgrupoBusqueda: React.FC<SubgrupoBusuqedaProps> = ({
    open,
    setOpen,
    formState,
    setPagination,
    onResetForm,
    onInputChange
}) =>{

    const { fetchMainSubGrupos } = useGrupoInventarioAsync();
    
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const getResult = async () => {
            const paginacion = await fetchMainSubGrupos(
                formState.subgroupName,
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
                BÚSQUEDA AVANZADA SUBGRUPOS
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                name="subgroupName"
                                label="Nombre"
                                value={formState.subgroupName !== '' ? formState.subgroupName : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.subgroupName ? true : false,
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
