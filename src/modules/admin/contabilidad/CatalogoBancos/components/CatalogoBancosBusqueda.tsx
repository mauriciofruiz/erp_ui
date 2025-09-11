import { FormState, useCatalogBankAsync } from "@/hooks";
import { PaperComponent } from "@/modules/layout";
import { PaginatedResponseType } from "@/types";
import { Search } from "@mui/icons-material";
import { Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { ChangeEvent } from "react";

export type CatalogoBancosBusquedaProps = {
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

export const CatalogoBancosBusqueda: React.FC<CatalogoBancosBusquedaProps> = ({
    open,
    setOpen,
    formState,
    setPagination,
    onResetForm,
    onInputChange
}) => {

    const { fetchMainCatalogBanks } = useCatalogBankAsync();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const getResult = async () => {
            const paginacion = await fetchMainCatalogBanks(
                formState.bankCatalogName,
                formState.bankCatalogCode,
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
                BÚSQUEDA AVANZADA CATÁLOGO
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                name="bankCatalogName"
                                label="Nombre Banco"
                                value={formState.bankCatalogName && formState.bankCatalogName !== null ? formState.bankCatalogName : ''}
                                onChange={onInputChange}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.bankCatalogName !== '' &&
                                            formState.bankCatalogName != null
                                            ? true
                                            : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="bankCatalogCode"
                                label="Código Banco"
                                value={formState.bankCatalogCode && formState.bankCatalogCode !== null ? formState.bankCatalogCode : ''}
                                onChange={onInputChange}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.bankCatalogCode !== '' &&
                                            formState.bankCatalogCode != null
                                            ? true
                                            : false,
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
