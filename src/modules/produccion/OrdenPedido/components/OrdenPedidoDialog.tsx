import { EstadoProduccionEnum } from "@/enums";
import { FormState, StyledDatePicker, useStyles } from "@/hooks";
import { Info } from "@mui/icons-material";
import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { ChangeEvent } from "react";

interface OrdenPedidoDialogosProps {
    openDialogAlert: boolean
    setOpenDialogAlert: React.Dispatch<React.SetStateAction<boolean>>
    openAnulation: boolean
    setOpenAnulation: React.Dispatch<React.SetStateAction<boolean>>
    openHistory: boolean
    setOpenHistory: React.Dispatch<React.SetStateAction<boolean>>
    formState: FormState
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void
    setStateForRequest: React.Dispatch<React.SetStateAction<number>>
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export const OrdenPedidoDialog = (props: OrdenPedidoDialogosProps) => {
    const styles = useStyles();
    const { openDialogAlert, setOpenDialogAlert, openAnulation, setOpenAnulation, formState, onInputChange, openHistory, setOpenHistory, setStateForRequest, onSubmit} = props

    const onDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setOpenAnulation(false);
        setOpenDialogAlert(false);
        onSubmit(event);
    };

    return (
        <>
            <Dialog open={openDialogAlert} onClose={() => setOpenDialogAlert(false)}>
                <form onSubmit={onDialogConfirm}>
                    <DialogContent>
                        <Alert severity="warning" icon={<Info />}>
                            <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
                            Los datos no se podrán modificar después de enviar la orden de pedido.
                            ¿Estás seguro de que deseas proceder?
                        </Alert>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialogAlert(false)} color="primary">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            onClick={() => setStateForRequest(EstadoProduccionEnum.ENVIADO)}
                        >
                            Confirmar
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog open={openAnulation} onClose={() => setOpenAnulation(false)}>
                <form onSubmit={onDialogConfirm}>
                    <DialogContent>
                        <Alert severity="info" icon={<Info />}>
                            <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
                            Los datos no se podrán restablecer después de anular la orden de pedido.
                            ¿Estás seguro de que deseas proceder?
                        </Alert>
                        <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
                            <Grid item xs={12}>
                                <TextField
                                    name="reasonCancel"
                                    label="Motivo Anulación"
                                    value={
                                        formState.reasonCancel !== null
                                            ? formState.reasonCancel
                                            : ''
                                    }
                                    onChange={onInputChange}
                                    InputLabelProps={{
                                        shrink:
                                            formState.reasonCancel !== null && formState.reasonCancel !== ''
                                                ? true
                                                : false,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAnulation(false)} color="primary">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            onClick={() => setStateForRequest(EstadoProduccionEnum.ANULADO)}
                            disabled={formState.reasonCancel === null || formState.reasonCancel === ''}
                        >
                            Confirmar
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog open={openHistory} onClose={() => setOpenHistory(false)}>
                <DialogTitle
                    style={{
                        cursor: 'move',
                        textAlign: 'center',
                    }}
                    id="draggable-dialog-title"
                    sx={{ mt: 2 }}
                >
                    Historial
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                            <TextField
                                name="usuarioEnvia"
                                label="Usuario Creación"
                                value={
                                    formState.usuarioEnvia === null ? '' : formState.usuarioEnvia
                                }
                                InputProps={{
                                    readOnly: true,
                                }}
                                InputLabelProps={{
                                    shrink: formState.usuarioEnvia !== null ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="usuarioAprueba"
                                label="Usuario Aprueba"
                                value={
                                    formState.usuarioAprueba === null
                                        ? ''
                                        : formState.usuarioAprueba
                                }
                                InputProps={{
                                    readOnly: true,
                                }}
                                InputLabelProps={{
                                    shrink: formState.usuarioAprueba !== null ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="usuarioAnula"
                                label="Usuario Anula"
                                value={
                                    formState.usuarioAnula === null ? '' : formState.usuarioAnula
                                }
                                InputProps={{
                                    readOnly: true,
                                }}
                                InputLabelProps={{
                                    shrink: formState.usuarioAnula !== null ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <StyledDatePicker
                                label="Fecha Solicitud"
                                disableOpenPicker
                                readOnly
                                format="dd/MM/yyyy"
                                value={formState.fechaSolicitud}
                                slotProps={{
                                    textField: {
                                        className: styles.genericFieldStyle,
                                        sx: {
                                            minWidth: '100%',
                                        },
                                        InputProps: {
                                            className: styles.textWhiteStyle,
                                        },
                                        InputLabelProps: {
                                            className: styles.textGreenStyle,
                                            shrink: true,
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <StyledDatePicker
                                label="Fecha Aprobación"
                                disableOpenPicker
                                readOnly
                                format="dd/MM/yyyy"
                                value={formState.fechaAprobacion}
                                slotProps={{
                                    textField: {
                                        required: false,
                                        className: styles.genericFieldStyle,
                                        sx: {
                                            minWidth: '100%',
                                        },
                                        InputProps: {
                                            className: styles.textWhiteStyle,
                                        },
                                        InputLabelProps: {
                                            className: styles.textGreenStyle,
                                            shrink: true,
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <StyledDatePicker
                                label="Fecha Modificación"
                                disableOpenPicker
                                readOnly
                                format="dd/MM/yyyy"
                                value={formState.fechaModificacion}
                                slotProps={{
                                    textField: {
                                        className: styles.genericFieldStyle,
                                        sx: {
                                            minWidth: '100%',
                                        },
                                        InputProps: {
                                            className: styles.textWhiteStyle,
                                        },
                                        InputLabelProps: {
                                            className: styles.textGreenStyle,
                                            shrink: true,
                                        },
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistory(false)} color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
