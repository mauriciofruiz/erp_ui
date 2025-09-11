import { FormState, useCatalogBankAsync } from "@/hooks";
import { PaperComponent } from "@/modules/layout";
import { ServerResponseType } from "@/store";
import { BankType } from "@/types";
import { EditNote, Save } from "@mui/icons-material";
import { Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { ChangeEvent } from "react";

export type ManageCatalogoBancosPageProps = {
    openNew: boolean;
    setOpenNew: React.Dispatch<React.SetStateAction<boolean>>;
    formState: FormState
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void
    onResetForm: () => void
    editMode: boolean
    createMode: boolean
    setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
    title: string
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    thereIsChanges: boolean;
}


export const ManageCatalogoBancosPage: React.FC<ManageCatalogoBancosPageProps> = ({
    openNew,
    setOpenNew,
    formState,
    onInputChange,
    onResetForm,
    editMode,
    createMode,
    setEditMode,
    title,
    setTitle,
    thereIsChanges,
}) => {

    const { fetchSaveCatalogBank, fetchUpdateCatalogBank } = useCatalogBankAsync();

    const setHeader = (formState: FormState): BankType => {
        const {
			bankStatus,
			...restForm
		} = formState;
        return {
            ...restForm as BankType,
        };
    };

    const onEditButtonClick = () => {
        if (!editMode) {
            setEditMode(true);
            setTitle('Cátalogo Banco (Modo Edición) - N° ' + formState.bankCatalogId);
            enqueueSnackbar(
                <>
                    {'Modo edición habilitado'}
                    <br />
                    {'Modo lectura deshabilitado'}
                </>,
                {
                    variant: 'info',
                }
            );
        } else {
            setEditMode(false);
            setTitle('Cátalogo Banco (Modo Lectura) - N° ' + formState.bankCatalogId);
            enqueueSnackbar(
                <>
                    {'Modo edición deshabilitado'}
                    <br />
                    {'Modo lectura habilitado'}
                </>,
                {
                    variant: 'info',
                }
            );
        }
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const catalogoBancoPost = setHeader(formState);
        const response = formState.bankCatalogId && formState.bankCatalogId !== null
            ? await fetchUpdateCatalogBank(
                formState.bankCatalogId,
                catalogoBancoPost
            )
            : await fetchSaveCatalogBank(
                catalogoBancoPost
            )
        if (
            !response ||
            (response && (response as ServerResponseType).status === 400) ||
            (response && (response as ServerResponseType).status === 500)
        ) {
            enqueueSnackbar(`Error al guardar el catálogo banco`, {
                variant: 'error',
            });
            return;
        }
        enqueueSnackbar(`El Catálogo Banco se guardo correctamente`, {
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
                {title}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                required
                                name="bankCatalogName"
                                label="Nombre"
                                value={formState.bankCatalogName}
                                onChange={onInputChange}
                                InputProps={{
                                    readOnly: !createMode && !editMode,
                                }}
                                InputLabelProps={{
                                    shrink: formState.bankCatalogName ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                required
                                name="bankCatalogCode"
                                label="Código"
                                value={formState.bankCatalogCode}
                                onChange={onInputChange}
                                InputProps={{
                                    readOnly: !createMode && !editMode,
                                }}
                                InputLabelProps={{
                                    shrink: formState.bankCatalogCode ? true : false,
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
                        {!createMode && (
                            <>
                                <Button
                                    startIcon={<EditNote />}
                                    sx={{ margin: 2 }}
                                    onClick={onEditButtonClick}
                                    style={{ width: '120px' }}
                                >
                                    {!editMode ? 'Editar' : 'Leer'}
                                </Button>
                            </>
                        )}
                        <Button
                            startIcon={<Save />}
                            disabled={!thereIsChanges}
                            sx={{ margin: 2 }}
                            type="submit"
                        >
                            {'Guardar'}
                        </Button>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    );
}
