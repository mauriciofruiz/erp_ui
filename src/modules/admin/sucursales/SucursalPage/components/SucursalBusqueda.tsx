import { getCityById, getCityByParams } from "@/backend";
import { RegionEnum } from "@/enums";
import { FormState, useStyles, useSucursalAsync } from "@/hooks";
import { PaperComponent } from "@/modules/layout";
import { ServerResponseType } from "@/store";
import { CityType, PaginatedResponseType } from "@/types";
import { Search } from "@mui/icons-material";
import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { ChangeEvent, useEffect, useState } from "react";

export type SucursalBusquedaProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    formState: FormState
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    onAutocompleteChange: (
        event: React.ChangeEvent<{}>,
        name: string,
        value: any,
        index?: number
    ) => void;
    setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
    onResetForm: () => void;
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void;
}
export const SucursalBusqueda: React.FC<SucursalBusquedaProps> = ({
    open,
    setOpen,
    formState,
    setFormState,
    onAutocompleteChange,
    setPagination,
    onResetForm,
    onInputChange
}) => {
    const styles = useStyles();
    const [searchCity, setSearchCity] = useState('');
    const [cityList, setCityList] = useState<CityType[]>([]);
    const { fetchMainSucursales } = useSucursalAsync();

    const handleAutocompleteCity = async (
        event: React.SyntheticEvent<Element, Event>,
        inputValue: string
    ) => {
        if (event !== null) {
            event.preventDefault();
            setSearchCity(inputValue);
        }
    };

    const regiones = Object.keys(RegionEnum)
        .filter((key): key is keyof typeof RegionEnum =>
            isNaN(Number(key))
        )
        .map((key) => ({ label: key, value: RegionEnum[key] }));

        
    const handleOnSelect = (event: SelectChangeEvent<any>) => {
        setFormState((prevState: FormState) => ({
            ...prevState,
            [event.target.name]: event.target.value,
        }));
    };

    useEffect(() => {
        const searchCities = async () => {
            try {
                const response: ServerResponseType | undefined =
                    await getCityByParams(searchCity.toUpperCase());
                if (response) {
                    if (response.status === 200) {
                        setCityList(response.message);
                    }
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setCityList([]);
                        enqueueSnackbar('No se ha encontrado la ciudad buscada', {
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
        if (searchCity.length >= 3) {
            searchCities();
        }
    }, [searchCity]);

    useEffect(() => {
        const fectchDataCiudad = async () => {
            const response = await getCityById(formState.cityId);
            if (response) {
                const listaCiudad: CityType[] = [response];
                setCityList(listaCiudad);
            }
        }
        if (formState.cityId && formState.cityId !== null) {
            fectchDataCiudad();
        }
    }, [formState.cityId])

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const getResult = async () => {
            const paginacion = await fetchMainSucursales(
                formState.cityId,
                formState.regionId,
                formState.categoryBranchId,
                formState.name,
                formState.mnemonic,
                formState.isOutlets,
                formState.isActive,
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
                BÚSQUEDA AVANZADA SUCURSAL
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                            <TextField
                                name="name"
                                label="Nombre"
                                value={formState.name && formState.name !== null ? formState.name : '' }
                                onChange={onInputChange}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.name !== '' &&
                                            formState.name != null
                                            ? true
                                            : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                <InputLabel id="state-label">Región</InputLabel>
                                <Select
                                    name="regionId"
                                    labelId="state-label"
                                    id="state-select"
                                    label="Estado"
                                    value={formState.regionId === null ? '' : formState.regionId}
                                    onChange={handleOnSelect}
                                    fullWidth
                                >
                                    {regiones.map((region) => (
                                        <MenuItem
                                            key={region.value}
                                            value={parseInt(region.value?.toString() || '')}
                                        >
                                            {region.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <Autocomplete
                                className={styles.genericFieldStyle}
                                options={cityList}
                                getOptionLabel={(option) => option.cityName}
                                style={{ width: '100%' }}
                                onChange={(event, value) => {
                                    onAutocompleteChange(event, 'cityId', value?.cityId);
                                }}
                                value={
                                    (formState.cityId !== null
                                        ?
                                        cityList.find(
                                            (city) =>
                                                city.cityId === formState.cityId
                                        )
                                        : null) || null
                                }
                                onInputChange={handleAutocompleteCity}
                                isOptionEqualToValue={(
                                    option: CityType,
                                    value: CityType
                                ) =>
                                    option && value
                                        ? option === value
                                        : false
                                }
                                noOptionsText="Sin resultados"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Ciudad"
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
