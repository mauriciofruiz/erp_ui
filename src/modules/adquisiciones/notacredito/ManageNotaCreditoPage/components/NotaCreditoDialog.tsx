import { Info } from "@mui/icons-material";
import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, Grid, TextField } from "@mui/material";

interface NotaCreditoDialogProps {
    fieldName: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    onDialogConfirm: (event: React.FormEvent<HTMLFormElement>) => void;
    dialogMessage: string;
    isAnulation: boolean;
    motivo: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NotaCreditoDialog = (props: NotaCreditoDialogProps) => {

    const {
        fieldName,
        open,
        setOpen,
        onDialogConfirm,
        dialogMessage,
        isAnulation,
        motivo,
        onInputChange,
    } = props;

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <form onSubmit={onDialogConfirm}>
                <DialogContent>
                    <Alert severity="warning" icon={<Info />}>
                        <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
                        {dialogMessage}
                    </Alert>
                    {isAnulation && (
                        <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
                            <Grid item xs={12}>
                                <TextField
                                    name={fieldName}
                                    label="Motivo Anulación"
                                    value={motivo}
                                    onChange={onInputChange}
                                    InputLabelProps={{
                                        shrink: motivo !== null && motivo !== '' ? true : false,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        disabled={
                            isAnulation
                                ? motivo === null || motivo === ''
                                    ? true
                                    : false
                                : false
                        }
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
