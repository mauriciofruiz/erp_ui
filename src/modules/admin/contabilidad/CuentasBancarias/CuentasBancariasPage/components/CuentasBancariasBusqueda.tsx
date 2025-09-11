import { FormState, useBankAsync } from "@/hooks";
import { PaperComponent } from "@/modules/layout";
import { PaginatedResponseType } from "@/types";
import { Search } from "@mui/icons-material";
import { Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { ChangeEvent } from "react";

export type CuentaBancariaProps = {
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


export const CuentasBancariasBusqueda: React.FC<CuentaBancariaProps> = ({
    open,
    setOpen,
    formState,
    setPagination,
    onResetForm,
    onInputChange
}) =>  {

    const {fetchMainAccountBank} = useBankAsync();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const getResult = async () => {
            const paginacion = await fetchMainAccountBank(
                formState.bankName,
                formState.bankAccountNumber,
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
                BÚSQUEDA AVANZADA BANCOS
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                name="bankName"
                                label="Nombre Banco"
                                value={formState.bankName && formState.bankName !== null ? formState.bankName : '' }
                                onChange={onInputChange}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.bankName !== '' &&
                                            formState.bankName != null
                                            ? true
                                            : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="bankAccountNumber"
                                label="Número Cuenta"
                                value={formState.bankAccountNumber && formState.bankAccountNumber !== null ? formState.bankAccountNumber : '' }
                                onChange={onInputChange}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.bankAccountNumber !== '' &&
                                            formState.bankAccountNumber != null
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
