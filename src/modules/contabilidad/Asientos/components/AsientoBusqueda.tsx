import { AsientoEnum } from "@/enums";
import { FormState, StyledDatePicker, useAsientoAsync, useStyles } from "@/hooks";
import { PaperComponent } from "@/modules/layout";
import { PaginatedResponseType, SucursalType } from "@/types";
import { Search } from "@mui/icons-material";
import { Button, Dialog, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import format from "date-fns/format";
import { ChangeEvent } from "react";

export type AsientoBusquedaProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    formState: FormState
    onDateChange: (value: Date, name: string) => void
    onAutocompleteChange: (
        event: React.ChangeEvent<{}>,
        name: string,
        value: any,
        index?: number
    ) => void;
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void;
    handleOnSelect: (event: SelectChangeEvent<any>) => void
    setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
    onResetForm: () => void;
    sucursales: SucursalType[];
}

export const AsientoBusqueda: React.FC<AsientoBusquedaProps> = ({
    open,
    setOpen,
    formState,
    onDateChange,
    handleOnSelect,
    setPagination,
    onResetForm,
    sucursales
}) => {

    const styles = useStyles();
    const { fetchMainAsiento } = useAsientoAsync();

    const estadoAsiento = Object.keys(AsientoEnum)
        .filter((key): key is keyof typeof AsientoEnum =>
            isNaN(Number(key))
        )
        .map((key) => ({ label: key, value: AsientoEnum[key] }));


    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const getResult = async () => {
            const paginacion = await fetchMainAsiento(
                formState.branchId,
                formState.isAutomatic,
                formState.movement,
                formState.state,
                formState.startDate !== null ? format(formState.startDate, 'dd/MM/yyyy') : null,
                formState.endDate !== null ? format(formState.endDate, 'dd/MM/yyyy') : null,
                formState.byCurrentMonth,
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
            fullWidth
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
                BÚSQUEDA AVANZADA DE ASIENTOS
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <StyledDatePicker
                                label="Fecha Inicio"
                                views={['year', 'month', 'day']}
                                format="dd/MM/yyyy"
                                maxDate={formState.endDate}
                                value={formState.startDate !== null ? formState.startDate : null}
                                onChange={(value) =>
                                    onDateChange(value as Date, 'startDate')
                                }
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
                                            shrink: formState.startDate ? true : false,
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StyledDatePicker
                                label="Fecha Fin"
                                views={['year', 'month', 'day']}
                                maxDate={new Date()}
                                format="dd/MM/yyyy"
                                value={formState.endDate !== null ? formState.endDate : null}
                                onChange={(value) =>
                                    onDateChange(value as Date, 'endDate')
                                }
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
                                            shrink: formState.endDate ? true : false,
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="state-label">Estado</InputLabel>
                                <Select
                                    name="state"
                                    labelId="state-label"
                                    id="state-select"
                                    label="Estado"
                                    value={formState.state === null ? '' : formState.state}
                                    onChange={handleOnSelect}
                                    fullWidth
                                >
                                    {estadoAsiento.map((estado) => (
                                        <MenuItem
                                            key={estado.value}
                                            value={parseInt(
                                                estado.value?.toString() || ''
                                            )}
                                        >
                                            {estado.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="state-label">Sucursal</InputLabel>
                                <Select
                                    name="branchId"
                                    labelId="state-label"
                                    id="state-select"
                                    label="Estado"
                                    value={formState.branchId === null ? '' : formState.branchId}
                                    onChange={handleOnSelect}
                                    fullWidth
                                >
                                    {sucursales.map((sucursal) => (
                                        <MenuItem
                                            key={sucursal.branchId}
                                            value={parseInt(sucursal.branchId?.toString() || '')}
                                        >
                                            {sucursal.name}
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
                        <Button startIcon={<Search />} sx={{ margin: 2 }} type="submit">
                            {'Buscar'}
                        </Button>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    )
}
