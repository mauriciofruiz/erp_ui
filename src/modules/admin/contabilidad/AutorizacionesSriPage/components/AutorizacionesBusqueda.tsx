import { getComprobanteTypeList } from '@/functions';
import { FormState, useAutorizacionesSriAsync, useStyles } from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { PaginatedResponseType } from '@/types';
import { Search } from '@mui/icons-material';
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import React, { ChangeEvent } from 'react'

export type AutorizacionesBusquedaProps = {
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
    onAutocompleteChange: (
        event: React.ChangeEvent<{}>,
        name: string,
        value: any,
        index?: number
    ) => void;
}

export const AutorizacionesBusqueda: React.FC<AutorizacionesBusquedaProps> = ({
    open,
    setOpen,
    formState,
    setPagination,
    onResetForm,
    onInputChange,
    onAutocompleteChange
}) => {

    const styles = useStyles();
    const { fetchMainDocs } = useAutorizacionesSriAsync();
    const tipoComprobanteList = getComprobanteTypeList();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const getResult = async () => {
            const paginacion = await fetchMainDocs(
                formState.documentNumber,
                formState.documentType,
                formState.identification,
                formState.name,
                formState.accesKey,
                formState.isAuthorized,
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
                BÚSQUEDA AVANZADA DOCUMENTOS
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                name="documentNumber"
                                label="Número Documento"
                                value={formState.documentNumber !== '' ? formState.documentNumber : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.documentNumber ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="identification"
                                label="Identificación"
                                value={formState.identification !== '' ? formState.identification : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.identification ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
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
                            <TextField
                                name="accesKey"
                                label="Clave de Acceso"
                                value={formState.accesKey !== '' ? formState.accesKey : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.accesKey ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                className={styles.genericFieldStyle}
                                options={tipoComprobanteList}
                                getOptionLabel={(option) => option.label}
                                style={{ width: '100%' }}
                                onChange={(event, value) =>
                                    onAutocompleteChange(event, 'documentType', value?.value)
                                }
                                value={
                                    (formState.documentType !== null
                                        ? tipoComprobanteList.find(
                                            (tipo) => tipo.value === formState.documentType
                                        )
                                        : null) || null
                                }
                                isOptionEqualToValue={(option, value) =>
                                    option.value === value.value
                                }
                                filterSelectedOptions
                                noOptionsText="Sin resultados"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tipo Documento"
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
