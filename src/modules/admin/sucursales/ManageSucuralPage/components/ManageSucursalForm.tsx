import { getCityById, getCityByParams } from "@/backend"
import { CategoriaSucursalEnum, RegionEnum, TipoBodegaEnum } from "@/enums"
import { FormState, useStyles } from "@/hooks"
import { ServerResponseType } from "@/store"
import { CityType } from "@/types"
import { ToggleOff, ToggleOn } from "@mui/icons-material"
import { Autocomplete, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Tooltip } from "@mui/material"
import { GridRowModesModel, GridRowsProp } from "@mui/x-data-grid"
import axios from "axios"
import { enqueueSnackbar } from "notistack"
import { ChangeEvent, useEffect, useState } from "react"
import { ManageBodegaDetail } from "./ManageBodegaDetail"
import { randomId } from "@mui/x-data-grid-generator"
import { GridRowModes } from "@mui/x-data-grid"

export type ManageSucursalFormProps = {
    formState: FormState
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
    createMode: boolean
    editMode: boolean
    onDateChange: (value: Date, name: string) => void;
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
    onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
    onBooleanChangeClick: (name: string, value: boolean) => void;
    onValidarCorreo: (event: ChangeEvent<HTMLInputElement>) => void;
    rows: GridRowsProp;
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
    rowModesModel: GridRowModesModel;
    setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
}

export const ManageSucursalForm: React.FC<ManageSucursalFormProps> = ({
    formState,
    setFormState,
    createMode,
    editMode,
    onAutocompleteChange,
    onInputChange,
    onBooleanChangeClick,
    onValidarCorreo,
    onInputJustNumber,
    rows,
    setRows,
    rowModesModel,
    setRowModesModel,
}) => {
    const styles = useStyles();
    const [searchCity, setSearchCity] = useState('');
    const [cityList, setCityList] = useState<CityType[]>([]);


    const regiones = Object.keys(RegionEnum)
        .filter((key): key is keyof typeof RegionEnum =>
            isNaN(Number(key))
        )
        .map((key) => ({  label: key.replace(/_/g, ' '), value: RegionEnum[key] }));

    const tipoBodegas = Object.keys(TipoBodegaEnum)
        .filter((key): key is keyof typeof TipoBodegaEnum =>
            isNaN(Number(key))
        )
        .map((key) => ({ label: key.replace(/_/g, ' '), value: TipoBodegaEnum[key] }));

        const categorias = Object.keys(CategoriaSucursalEnum)
        .filter((key): key is keyof typeof CategoriaSucursalEnum =>
            isNaN(Number(key))
        )
        .map((key) => ({
            label: key.replace(/_/g, ' '),
            value: CategoriaSucursalEnum[key]
        }));

    const handleOnSelect = (event: SelectChangeEvent<any>) => {
        setFormState((prevState: FormState) => ({
            ...prevState,
            [event.target.name]: event.target.value,
        }));
    };

    const handleAutocompleteCity = async (
        event: React.SyntheticEvent<Element, Event>,
        inputValue: string
    ) => {
        if (event !== null) {
            event.preventDefault();
            setSearchCity(inputValue);
        }
    };

    const handleSetWareHouse = () => {
        if(formState.branchId && formState.branchId !== null){
            const rowIndex = rows.findIndex((row) => row.warehouseName === 'BOD ' + tipoBodegas.find(item => item.value === TipoBodegaEnum.VENTAS)?.label + ' ' + formState.nameTemp);
            if (rows[rowIndex]) {
                
                const newRows = [...rows];
                newRows[rowIndex] = {
                    ...newRows[rowIndex],
                    warehouseName: 'BOD ' + tipoBodegas.find(item => item.value === TipoBodegaEnum.VENTAS)?.label + ' ' + formState.name,
                };
                setRows(newRows);
            }
        }else{
            const id = randomId();
            setRows([
                {
                    id: randomId(),
                    branchId: null,
                    warehouseId: null,
                    warehouseCode: "",
                    warehouseName: 'BOD ' + tipoBodegas.find(item => item.value === TipoBodegaEnum.VENTAS)?.label + ' ' + formState.name,
                    warehouseSequence: 0,
                    warehouseTypeId: TipoBodegaEnum.VENTAS,
                },
                {
                    id: randomId(),
                    branchId: null,
                    warehouseId: null,
                    warehouseCode: "",
                    warehouseName: 'BOD ' + tipoBodegas.find(item => item.value === TipoBodegaEnum.DESPACHO)?.label + ' ' + formState.name,
                    warehouseSequence: 0,
                    warehouseTypeId: TipoBodegaEnum.DESPACHO,
                },
            ]);
            setRowModesModel((oldModel) => ({
                ...oldModel,
                [id]: { mode: GridRowModes.View, fieldToFocus: 'warehouseTypeId' },
            }));
        }
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

    useEffect(() =>{
        const fectchDataCiudad = async () => {
            const response = await getCityById(formState.cityId);
            if (response) {
                const listaCiudad: CityType[] = [response];
                setCityList(listaCiudad);
            }
        }
        if(formState.cityId && formState.cityId !== null){
            fectchDataCiudad();
        }
    }, [formState.cityId])

    return (
        <>
            <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3} >
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12}>
                                    <TextField
                                        required={true}
                                        name="name"
                                        label="Nombre"
                                        value={formState.name}
                                        onChange={onInputChange}
                                        onBlur={handleSetWareHouse}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
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
                                <Grid item xs={12}>
                                    <TextField
                                        required={true}
                                        name="cellphone"
                                        label="Celular"
                                        value={formState.cellphone}
                                        onChange={onInputJustNumber}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 10 }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.cellphone !== '' &&
                                                    formState.cellphone != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="phone"
                                        label="Teléfono"
                                        value={formState.phone}
                                        onChange={onInputJustNumber}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 10 }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.phone !== '' &&
                                                    formState.phone != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={3} >
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12}>
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
                                <Grid item xs={12}>
                                    <TextField
                                        required={true}
                                        name="email"
                                        label="Correo Fiscal"
                                        value={formState.email}
                                        onChange={onValidarCorreo}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.email !== '' &&
                                                    formState.email != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                    {/* {formState.email != null && formErrors.email != '' ? formErrors.email && <p style={{ color: 'cornsilk' }}>{formErrors.email}</p> : null} */}
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="phone2"
                                        label="Teléfono 2"
                                        value={formState.phone2}
                                        onChange={onInputJustNumber}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 10 }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.phone2 !== '' &&
                                                    formState.phone2 != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={4} >
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={6}>
                                    <Autocomplete
                                        className={styles.genericFieldStyle}
                                        options={cityList}
                                        readOnly={!createMode && !editMode}
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
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel id="state-label">Categoria</InputLabel>
                                        <Select
                                            name="branchCategoryId"
                                            labelId="state-label"
                                            id="state-select"
                                            label="Categoría"
                                            value={formState.branchCategoryId === '' ? '' : formState.branchCategoryId}
                                            onChange={handleOnSelect}
                                            fullWidth
                                        >
                                            {categorias.map((categoria) => (
                                                <MenuItem
                                                    key={categoria.value}
                                                    value={categoria.value?.toString()}
                                                >
                                                    {categoria.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required={true}
                                        name="address"
                                        label="Dirección"
                                        value={formState.address}
                                        onChange={onInputChange}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.address !== '' &&
                                                    formState.address != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="responsible"
                                        label="Responsable"
                                        value={formState.responsible}
                                        onChange={onInputChange}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.responsible !== '' &&
                                                    formState.responsible != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={2}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12}>
                                    <Tooltip title="Estado Sucursal">
                                        <span>
                                            <Button
                                                disabled={!createMode && !editMode}
                                                startIcon={
                                                    formState.state ? (
                                                        <ToggleOn />
                                                    ) : (
                                                        <ToggleOff />
                                                    )
                                                }
                                                onClick={() =>
                                                    onBooleanChangeClick(
                                                        'state',
                                                        !formState.state
                                                    )
                                                }
                                                style={{ width: '100%', height: 38 }}
                                            >
                                                {formState.state ? 'Activa' : 'Inactiva'}
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </Grid>
                                <Grid item xs={12}>
                                    <Tooltip title="Es Outlet">
                                        <span>
                                            <Button
                                                disabled={!createMode && !editMode}
                                                startIcon={
                                                    formState.isOutlet ? (
                                                        <ToggleOn />
                                                    ) : (
                                                        <ToggleOff />
                                                    )
                                                }
                                                onClick={() =>
                                                    onBooleanChangeClick(
                                                        'isOutlet',
                                                        !formState.isOutlet
                                                    )
                                                }
                                                style={{ width: '100%', height: 38 }}
                                            >
                                                {formState.isOutlet ? 'Es Outlet' : 'No es Outlet'}
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </Grid>
                                <Grid item xs={12}>
                                    <Tooltip title="Impresora Térmica">
                                        <span>
                                            <Button
                                                disabled={!createMode && !editMode}
                                                startIcon={
                                                    formState.thermalPrinting ? (
                                                        <ToggleOn />
                                                    ) : (
                                                        <ToggleOff />
                                                    )
                                                }
                                                onClick={() =>
                                                    onBooleanChangeClick(
                                                        'thermalPrinting',
                                                        !formState.thermalPrinting
                                                    )
                                                }
                                                style={{ width: '100%', height: 38 }}
                                            >
                                                {formState.thermalPrinting ? 'Térmica' : 'No Térmica'}
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <ManageBodegaDetail
                        formState={formState}
                        createMode={createMode}
                        editMode={editMode}
                        rows={rows}
                        setRows={setRows}
                        rowModesModel={rowModesModel}
                        setRowModesModel={setRowModesModel}
                    />
                </Box>
            </Box>
        </>
    );
}