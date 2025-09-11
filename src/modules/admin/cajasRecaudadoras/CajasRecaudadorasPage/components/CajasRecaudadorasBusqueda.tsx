import { FormState, useCajaAsync, useStyles } from "@/hooks";
import { PaperComponent } from "@/modules/layout";
import { PaginatedResponseType, SucursalType } from "@/types";
import { Search } from "@mui/icons-material";
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { ChangeEvent } from "react";

export type UsuarioBusquedaProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    formState: FormState
    onAutocompleteChange: (
        event: React.ChangeEvent<{}>,
        name: string,
        value: any,
        index?: number
    ) => void;
    setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
    onResetForm: () => void;
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void;
    sucursales: SucursalType[]
}

export const CajasRecaudadorasBusqueda: React.FC<UsuarioBusquedaProps> = ({
    open,
    setOpen,
    formState,
    onAutocompleteChange,
    setPagination,
    onResetForm,
    onInputChange,
    sucursales
}) => {

    const styles = useStyles();
    const { fetchMainCajas } = useCajaAsync();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const getResult = async () => {
            const paginacion = await fetchMainCajas(
                formState.branchId,
                formState.name,
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
                BÚSQUEDA AVANZADA USUARIO
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                name="name"
                                label="Nombre"
                                value={formState.name !== '' ? formState.name : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.name ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                className={styles.genericFieldStyle}
                                options={sucursales}
                                getOptionLabel={(option) => option.name}
                                style={{ width: '100%' }}
                                onChange={(event, value) =>
                                    onAutocompleteChange(event, 'branchId', value?.branchId)
                                }
                                value={
                                    (formState.branchId !== null
                                        ? sucursales.find(
                                            (sucursal) => sucursal.branchId === formState.branchId
                                        )
                                        : null) || null
                                }
                                isOptionEqualToValue={(option, value) =>
                                    option.branchId === value.branchId
                                }
                                noOptionsText="Sin resultados"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Sucursal"
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
