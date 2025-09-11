import { getUsuarioByName } from '@/backend';
import { FormState, StyledDatePicker, useListaMaterialesAsync, useStyles } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, UserType } from '@/types';
import { Search } from '@mui/icons-material';
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, Grid, SelectChangeEvent, TextField } from '@mui/material';
import axios from 'axios';
import format from 'date-fns/format';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';

export type ListaMaterialesBusquedaProps = {
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
    onInputJustNumber: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
    onResetForm: () => void;
}

export const ListaMaterialesBusqueda: React.FC<ListaMaterialesBusquedaProps> = (props: ListaMaterialesBusquedaProps) => {
    const { open, setOpen, formState, onDateChange, onInputChange, onAutocompleteChange, setPagination, onResetForm } = props
    const styles = useStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const [userList, setUserlist] = useState<UserType[]>([]);
    const [userSelected, setUserSelected] = useState<UserType | null>(null);
    const { fecthMainPageListaMateriales } = useListaMaterialesAsync();

    const handleAutocompleteUser = async (
        event: React.SyntheticEvent<Element, Event>,
        inputValue: string
    ) => {
        if (event !== null) {
            event.preventDefault();
            setSearchTerm(inputValue);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: ServerResponseType | undefined =
                    await getUsuarioByName(searchTerm.toUpperCase(), true);
                if (response) {
                    if (response.status === 200) {
                        setUserlist(response.message);
                    }
                } else {
                    setUserlist([]);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setUserlist([]);
                        enqueueSnackbar('No se ha encontrado el usuario buscado', {
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
        if (searchTerm.length >= 3) {
            fetchData();
        }
    }, [searchTerm]);

    useEffect(() => {
        if (formState.user === null) {
            setUserSelected(null);
            return;
        }
        if (userSelected && userSelected !== null && userList.length === 0) return;
        const user = userList.find((user) => user.userId === formState.user);
        if (user) {
            setUserSelected(user);
        }
    }, [formState.user, userSelected]);

    
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const getResult = async () => {
            const paginacion = await fecthMainPageListaMateriales(
                formState.startDate !== null ? format(formState.startDate, 'dd/MM/yyyy') : null,
				formState.endDate !== null ? format(formState.endDate, 'dd/MM/yyyy') : null,
				formState.code,
				formState.product,
                formState.productName,
				formState.user,
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
                BÚSQUEDA AVANZADA LISTA MATERIALES
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
                                format="dd/MM/yyyy"
                                maxDate={new Date()}
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
                            <TextField
                                name="code"
                                label="Código"
                                value={formState.code !== null ? formState.code : ''}
                                type="number"
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.code ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="productName"
                                label="Producto"
                                value={formState.productName !== null ? formState.productName : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.productName ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                id="autocomplete-sucursales"
                                className={styles.genericFieldStyle}
                                options={userList}
                                getOptionLabel={(option) => option.nick}
                                style={{ width: '100%' }}
                                onChange={(event, value) =>
                                    onAutocompleteChange(event, 'user', value?.userId)
                                }
                                onInputChange={(event, newInputValue) =>
                                    handleAutocompleteUser(event, newInputValue)
                                }
                                value={userSelected}
                                isOptionEqualToValue={(option, value) =>
                                    option.userId === value.userId
                                }
                                noOptionsText="Sin resultados"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Usuario"
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
