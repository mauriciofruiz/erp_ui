import { getSucursalByName } from "@/backend";
import { EstadoOrdenProduccionEnum } from "@/enums";
import { FormState, StyledDatePicker, useAllowGlobal, useOrdenProduccionAsync, useStyles } from "@/hooks";
import { PaperComponent } from "@/modules/layout";
import { PaginatedResponseType, SucursalType } from "@/types";
import { Search } from "@mui/icons-material";
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import axios from "axios";
import format from 'date-fns/format';
import { enqueueSnackbar } from "notistack";
import { ChangeEvent, useEffect, useState } from "react";

export type BusquedaAvanzadaProps = {
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
    onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const OrdenProduccionBusqueda: React.FC<BusquedaAvanzadaProps> = ({ open, setOpen, formState, onDateChange, onAutocompleteChange, onInputChange, handleOnSelect, setPagination, onResetForm, onInputJustNumber}) => {

    const styles = useStyles();
    const { fetchMainPageOP } = useOrdenProduccionAsync();
    const [enable, setEnabled] = useState(false);
    const { enabledBranchs } = useAllowGlobal();
    const [sucursal, setSucusral] = useState<SucursalType[]>([]);
    const [searchBranch, setBranch] = useState('');
    const estadoOrdenProduccion = Object.keys(EstadoOrdenProduccionEnum)
        .filter((key): key is keyof typeof EstadoOrdenProduccionEnum =>
            isNaN(Number(key))
        )
        .map((key) => ({ label: key, value: EstadoOrdenProduccionEnum[key] }));

    const handleAutocompleteBranch = async (
        event: React.SyntheticEvent<Element, Event>,
        inputValue: string
    ) => {
        if (event !== null) {
            event.preventDefault();
            setBranch(inputValue);
        }
    };

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const getResult = async () => {
            const paginacion = await fetchMainPageOP(
                formState.fechaInicio!== null ? format(formState.fechaInicio, 'dd/MM/yyyy') : null,
                formState.fechaFin!== null ? format(formState.fechaFin, 'dd/MM/yyyy') : null,
                formState.orderNumber,
                formState.state,
                formState.orderRequest,
                formState.branchRequest,
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
    }

    useEffect(() => {
        const enabledSucursal = enabledBranchs;
        setEnabled(enabledSucursal);
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: SucursalType[] | undefined =
                    await getSucursalByName(searchBranch.toUpperCase(), true);
                if (response) {
                    setSucusral(response);
                } else {
                    setSucusral([]);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setSucusral([]);
                        enqueueSnackbar('No se ha encontrado la sucursal buscadoa', {
                            variant: 'info',
                        });
                    } else {
                        enqueueSnackbar('Error Del Servidor: ' + error.message, {
                            variant: 'error',
                        });
                    }
                }
            }
        };
        if (searchBranch.length >= 3) {
            fetchData();
        }
    }, [searchBranch]);

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
                BÚSQUEDA AVANZADA ORDEN PRODUCCIÓN
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <StyledDatePicker
                                label="Fecha Inicio"
                                views={['year', 'month', 'day']}
                                format="dd/MM/yyyy"
                                maxDate={formState.fechaFin}
                                value={formState.fechaInicio !== null ? formState.fechaInicio : null}
                                onChange={(value) =>
                                    onDateChange(value as Date, 'fechaInicio')
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
                                            shrink: formState.fechaInicio ? true : false,
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StyledDatePicker
                                label="Fecha Fin"
                                maxDate={new Date()}
                                views={['year', 'month', 'day']}
                                format="dd/MM/yyyy"
                                value={formState.fechaFin !== null ? formState.fechaFin : null}
                                onChange={(value) =>
                                    onDateChange(value as Date, 'fechaFin')
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
                                            shrink: formState.fechaFin ? true : false,
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="orderNumber"
                                label="Número Orden"
                                value={formState.orderNumber !== null ? formState.orderNumber : ''}
                                onChange={onInputJustNumber}
                                InputLabelProps={{
                                    shrink: formState.orderNumber ? true : false,
                                }}
                                fullWidth
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
                                    {estadoOrdenProduccion.map((estado) => (
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
                            <TextField
                                name="orderRequest"
                                label="Número Pedido"
                                value={formState.orderRequest !== null ? formState.orderRequest : ''}
                                onChange={onInputJustNumber}
                                InputLabelProps={{
                                    shrink: formState.orderRequest ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            {enable ? (
                                <Autocomplete
                                    className={styles.genericFieldStyle}
                                    options={sucursal}
                                    getOptionLabel={(option) => option.name}
                                    style={{ width: '100%' }}
                                    onChange={(event, value) =>
                                        onAutocompleteChange(event, 'branch', value?.branchId)
                                    }
                                    onInputChange={(event, newInputValue) =>
                                        handleAutocompleteBranch(event, newInputValue)
                                    }
                                    value={
                                        (formState.branch !== null
                                            ?
                                            sucursal.find(
                                                (provider) =>
                                                    provider.branchId === formState.branch
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
                            ) :
                                <TextField
                                    name="sucursal"
                                    label="Sucursal"
                                    value={formState.sucursal !== null ? formState.sucursal : ''}
                                    onChange={onInputChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    fullWidth
                                />
                            }
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
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    )
}
