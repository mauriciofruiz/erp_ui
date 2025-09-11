import { getUsuarioByName } from '@/backend';
import { FormState, useStyles, useUserAsync } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { PaginatedResponseType, UserType } from '@/types';
import { Search } from '@mui/icons-material';
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

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
}

export const UsuariosBusqueda: React.FC<UsuarioBusquedaProps> = ({
    open,
    setOpen,
    formState,
    onAutocompleteChange,
    setPagination,
    onResetForm
}) => {

    const styles = useStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const [userList, setUserlist] = useState<UserType[]>([]);
    const [userSelected, setUserSelected] = useState<UserType | null>(null);
    const { fetchMainUsers } = useUserAsync();

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
        if (formState.nick === null) {
            setUserSelected(null);
            return;
        }
        if (userSelected && userSelected !== null && userList.length === 0) return;
        const user = userList.find((user) => user.nick === formState.nick);
        if (user) {
            setUserSelected(user);
        }
    }, [formState.nick, userSelected]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: ServerResponseType | undefined = await getUsuarioByName(
                    searchTerm.toUpperCase(),
                    true
                );
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

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const getResult = async () => {
            const paginacion = await fetchMainUsers(
                formState.nick,
                formState.status,
                formState.identification,
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
                        <Grid item xs={12}>
                            <Autocomplete
                                className={styles.genericFieldStyle}
                                options={userList}
                                getOptionLabel={(option) => option.nick}
                                style={{ width: '100%' }}
                                onChange={(event, value) =>
                                    onAutocompleteChange(event, 'nick', value?.nick)
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
                                        label="Nombre usuario"
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
