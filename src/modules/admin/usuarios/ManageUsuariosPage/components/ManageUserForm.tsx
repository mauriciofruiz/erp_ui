import { getCajaBySucursalId, getCargos, getPersonById, getPersonByParams } from "@/backend";
import { RoleEnum, SucursalEnum } from "@/enums";
import { FormState, ImageBackdrop, ImageButton, ImageSrc, StyledDatePicker, VisuallyHiddenInput, useRolUsuarioAsync, useStyles } from "@/hooks";
import { ServerResponseType } from "@/store";
import { CajaGetType, CargoType, SucursalType } from "@/types";
import { PersonType, RolUserPost, RoleInterface } from "@/types/common";
import { CloudUpload, Image, ToggleOff, ToggleOn } from "@mui/icons-material";
import { Autocomplete, Box, Button, Checkbox, FormControlLabel, FormGroup, Grid, TextField, Tooltip, Typography } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { ChangeEvent, useEffect, useState } from "react";

export type ManageUserFormProps = {
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
    sucursales: SucursalType[];
    onImageChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void;
    roles: RoleInterface[]
    onBooleanChangeClick: (name: string, value: boolean) => void;
    selectedRoles: RolUserPost[]
    setSelectedRoles: React.Dispatch<React.SetStateAction<RolUserPost[]>>
}

export const ManageUserForm: React.FC<ManageUserFormProps> = ({
    formState,
    setFormState,
    createMode,
    editMode,
    onAutocompleteChange,
    onInputChange,
    onDateChange,
    sucursales,
    onImageChange,
    roles,
    onBooleanChangeClick,
    selectedRoles,
    setSelectedRoles,
}) => {

    const styles = useStyles();
    const [peopleList, setPeopleList] = useState<PersonType[]>([]);
    const [personSelected, setPersonSelected] = useState<PersonType | null>(null);
    const [searchPerson, setSearchPerson] = useState('');
    const [sucursalSelected, setSucursalSelected] = useState<SucursalType | null>(null);
    const [cargoList, setCargoList] = useState<CargoType[]>([]);
    const [cargoSelected, setCargoSelected] = useState<CargoType | null>(null);
    const [ventas, setVentas] = useState(false);
    const [boxWidth, setBoxwidth] = useState(12);
    const [cajaList, setCajaList] = useState<CajaGetType[]>([]);
    const [cajaSelected, setCajaSelected] = useState<CajaGetType | null>(null);
    const { fetchRolesUser } = useRolUsuarioAsync();

    const handleAutocompletePerson = async (
        event: React.SyntheticEvent<Element, Event>,
        inputValue: string
    ) => {
        if (event !== null) {
            event.preventDefault();
            setSearchPerson(inputValue);
        }
    };

    const handleTimeChange = (name: string, newValue: Dayjs) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: newValue,
        }));
    };

    const handleCheckboxChange = (role: RoleInterface) => {
        const currentIndex2 = selectedRoles.find(r => r.roleId === role.roleId);
        const newChecked = [...selectedRoles];
        if (!currentIndex2) {
            const rolToSave: RolUserPost = {
                roleUserId: null,
                userId: formState.userId,
                roleId: role.roleId,
                roleUserStatus: true
            }
            newChecked.push(rolToSave);
        } else {
            const currentIndex = selectedRoles.indexOf(currentIndex2);
            newChecked[currentIndex] = {
                ...newChecked[currentIndex],
                roleUserStatus: newChecked[currentIndex].roleUserStatus === false ? true : false
            };
        }
        setSelectedRoles(newChecked);
    };

    const isRoleChecked = (roleId: number | null) => {
        const role = selectedRoles.find(r => r.roleId === roleId);
        return role ? role.roleUserStatus : false;
    };


    useEffect(() => {
        if (selectedRoles && selectedRoles.length > 0) {
            const isVentas = selectedRoles.some(rol => rol.roleId === RoleEnum.VENTAS && rol.roleUserStatus === true);
            const isMatriz = SucursalEnum.MATRIZ === formState.branchId;
            if (isVentas && isMatriz) {
                setVentas(false)
                setBoxwidth(12);
            } else {
                setVentas(isVentas);
                setBoxwidth(!isVentas ? 12 : 6);
            }
        }
    }, [selectedRoles])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: ServerResponseType | undefined =
                    await getPersonByParams(searchPerson.toUpperCase());
                if (response) {
                    if (response.status === 200) {
                        setPeopleList(response.message);
                    }
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setPeopleList([]);
                        enqueueSnackbar('No se ha encontrado la persona buscada', {
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
        if (searchPerson.length >= 3) {
            fetchData();
        }
    }, [searchPerson]);

    useEffect(() => {
        if (formState.personId === null) {
            setPersonSelected(null);
            return;
        }
        if (
            personSelected &&
            personSelected !== null &&
            peopleList.length === 0
        )
            return;
        const person = peopleList.find(
            (person) => person.personId === formState.personId
        );
        if (person) {
            setPersonSelected(person);
        }
    }, [formState.personId, peopleList]);

    useEffect(() => {
        if (personSelected && personSelected !== null) {
            setFormState({
                ...formState,
                personName: personSelected.personName,
                personIdentification: personSelected.personIdentification,
                personAddress: personSelected.personAddress,
                personPhone: personSelected.personPhone,
                personEmail: personSelected.personEmail
            })
        }
    }, [personSelected])

    useEffect(() => {
        if (formState.branchId === null) {
            setSucursalSelected(null);
            return;
        }
        if (
            personSelected &&
            personSelected !== null &&
            sucursales.length === 0
        )
            return;
        const sucursal = sucursales.find(
            (sucursal) => sucursal.branchId === formState.branchId
        );
        if (sucursal) {
            setSucursalSelected(sucursal);
        }
    }, [formState.branchId, sucursales]);

    useEffect(() => {
        const fetchDataCargo = async () => {
            try {
                const response: ServerResponseType | undefined =
                    await getCargos();
                if (response) {
                    if (response.status === 200) {
                        setCargoList(response.message);
                    }
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setCargoList([]);
                        enqueueSnackbar('No se han encontrado Cargos', {
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
        fetchDataCargo();
    }, [])

    useEffect(() => {
        if (formState.position === null) {
            setCargoSelected(null);
            return;
        }
        if (
            cargoSelected &&
            cargoSelected !== null &&
            cargoList.length === 0
        )
            return;
        const cargo = cargoList.find(
            (cargo) => cargo.positionId === formState.position
        );
        if (cargo) {
            setCargoSelected(cargo);
        }
    }, [formState.position, cargoList]);

    useEffect(() => {
        const fetchPersonID = async () => {
            try {
                const response: ServerResponseType | undefined =
                    await getPersonById(formState.personId);
                if (response) {
                    if (response.status === 200) {
                        const personData: PersonType[] = [response.message];
                        setPeopleList(personData);
                    }
                } else {
                    setPeopleList([]);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setPeopleList([]);
                        enqueueSnackbar('No se han encontrado la persona', {
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
        if (formState.personId) {
            fetchPersonID();
        }
    }, [formState.personId])

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response: ServerResponseType | RolUserPost[] | undefined =
                    await fetchRolesUser(formState.userId);
                if (response) {
                    setSelectedRoles(response);
                } else {
                    setSelectedRoles([]);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setSelectedRoles([]);
                        enqueueSnackbar('No se han encontrado la persona', {
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
        if (formState.userId) {
            fetchRoles();
        }
    }, [formState.userId])

    useEffect(() => {
        if (formState.cashId === null) {
            setCajaSelected(null);
            return;
        }
        if (
            cajaSelected &&
            cajaSelected !== null &&
            cajaList.length === 0
        )
            return;
        const caja = cajaList.find(
            (caja) => caja.cashBoxId === formState.cashId
        );
        if (caja) {
            setCajaSelected(caja);
        }
    }, [formState.cashId, cajaList]);

    useEffect(() => {
        const fetchCaja = async () => {
            try {
                const response: ServerResponseType | undefined =
                    await getCajaBySucursalId(formState.branchId);
                if (response) {
                    if (response.status === 200) {
                        setCajaList(response.message);
                    }
                } else {
                    setCajaList([]);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setCajaList([]);
                        enqueueSnackbar('No se han encontrado la caja', {
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
        if (formState.branchId && formState.branchId !== null) {
            fetchCaja();
        }
    }, [formState.branchId])

    return (
        <>
            <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                            {formState.photo === null ? (
                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUpload />}
                                >
                                    Cargar Imagen
                                    <VisuallyHiddenInput
                                        type="file"
                                        name="productPhoto"
                                        accept="image/jpeg"
                                        onChange={onImageChange}
                                    />
                                </Button>
                            ) : (
                                <ImageButton
                                    component="label"
                                    variant="contained"
                                    key={formState.nick}
                                    style={{
                                        width: 425,
                                        height: 200,
                                    }}
                                >
                                    <ImageSrc>
                                        <img
                                            srcSet={formState.photo}
                                            src={formState.photo}
                                            alt={formState.nick}
                                            style={{
                                                maxWidth: '100%', // Set max width to 100%
                                                maxHeight: '100%', // Set max height to 100%
                                                width: 'inherit',
                                                height: 'inherit',
                                            }}
                                            loading="lazy"
                                        />
                                    </ImageSrc>
                                    <ImageBackdrop className="MuiImageBackdrop-root" />
                                    <Image>
                                        <VisuallyHiddenInput
                                            type="file"
                                            name="productPhoto"
                                            accept="image/jpeg"
                                            onChange={onImageChange}
                                        />
                                        <Typography
                                            component="span"
                                            variant="subtitle1"
                                            color="inherit"
                                            sx={{
                                                position: 'relative',
                                                p: 4,
                                                pt: 2,
                                                pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                                            }}
                                        >
                                            {'Actualizar Imagen'}
                                        </Typography>
                                    </Image>
                                </ImageButton>
                            )}
                        </Grid>
                        <Grid item xs={4} container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                                <TextField
                                    name="nick"
                                    label="Usuario"
                                    value={formState.nick !== null ? formState.nick : ''}
                                    onChange={onInputChange}
                                    InputLabelProps={{
                                        shrink: formState.nick ? true : false,
                                    }}
                                    InputProps={{
                                        readOnly: !createMode && !editMode,
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Tooltip title="Estado Usuario">
                                    <span>
                                        <Button
                                            disabled={!editMode}
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
                                            style={{ width: '100%', height: 42 }}
                                        >
                                            {formState.state ? 'Activo' : 'Inactivo'}
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={boxWidth}>
                                <Autocomplete
                                    className={styles.genericFieldStyle}
                                    readOnly={!createMode && !editMode}
                                    options={sucursales}
                                    getOptionLabel={(option) => option.name}
                                    style={{ width: '100%' }}
                                    onChange={(event, value) =>
                                        onAutocompleteChange(event, 'branchId', value?.branchId)
                                    }
                                    value={sucursalSelected}
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
                            </Grid>
                            {ventas && (
                                <Grid item xs={6}>
                                    <Autocomplete
                                        className={styles.genericFieldStyle}
                                        readOnly={!createMode && !editMode}
                                        options={cajaList}
                                        getOptionLabel={(option) => option.cashBoxName}
                                        style={{ width: '100%' }}
                                        onChange={(event, value) =>
                                            onAutocompleteChange(event, 'cashId', value?.cashBoxId)
                                        }
                                        value={cajaSelected}
                                        isOptionEqualToValue={(option, value) =>
                                            option.cashBoxId === value.cashBoxId
                                        }
                                        noOptionsText="Sin resultados"
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Caja"
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
                            )}
                            <Grid item xs={12}>
                                <Autocomplete
                                    className={styles.genericFieldStyle}
                                    readOnly={!createMode && !editMode}
                                    options={cargoList}
                                    getOptionLabel={(option) => option.positionName}
                                    style={{ width: '100%' }}
                                    onChange={(event, value) =>
                                        onAutocompleteChange(event, 'position', value?.positionId)
                                    }
                                    value={cargoSelected}
                                    isOptionEqualToValue={(option, value) =>
                                        option.positionId === value.positionId
                                    }
                                    noOptionsText="Sin resultados"
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Cargo"
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
                        <Grid item xs={4} container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                                <StyledDatePicker
                                    label="Fecha Ingreso"
                                    readOnly
                                    maxDate={new Date()}
                                    views={['year', 'month', 'day']}
                                    format="dd/MM/yyyy"
                                    value={formState.entryDate !== null ? formState.entryDate : null}
                                    onChange={(value) =>
                                        onDateChange(value as Date, 'entryDate')
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
                                                shrink: formState.entryDate ? true : false,
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledDatePicker
                                    label="Fecha Inactivación"
                                    readOnly
                                    maxDate={new Date()}
                                    views={['year', 'month', 'day']}
                                    format="dd/MM/yyyy"
                                    value={formState.deactivationDate !== null ? formState.deactivationDate : null}
                                    onChange={(value) =>
                                        onDateChange(value as Date, 'deactivationDate')
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
                                                shrink: formState.deactivationDate ? true : false,
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']}>
                                        <TimePicker
                                            label="Hora Inicio"
                                            value={formState.startTime !== '' ? formState.startTime : dayjs()}
                                            onChange={(newValue) => handleTimeChange('startTime', newValue)}
                                            readOnly={!createMode && !editMode}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']} >
                                        <TimePicker
                                            label="Hora Fin"
                                            value={formState.endTime !== '' ? formState.endTime : dayjs()}
                                            onChange={(newValue) => handleTimeChange('endTime', newValue)}
                                            readOnly={!createMode && !editMode}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                        <Grid item xs={4}>
                            <Autocomplete
                                className={styles.genericFieldStyle}
                                readOnly
                                options={peopleList}
                                getOptionLabel={(option) => option.personName}
                                style={{ width: '100%' }}
                                onChange={(event, value) =>
                                    onAutocompleteChange(event, 'personId', value?.personId)
                                }
                                onInputChange={(event, newInputValue) =>
                                    handleAutocompletePerson(event, newInputValue)
                                }
                                value={personSelected}
                                isOptionEqualToValue={(option, value) =>
                                    option.personId === value.personId
                                }
                                noOptionsText="Sin resultados"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Persona"
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
                        <Grid item xs={4}>
                            <TextField
                                name="personName"
                                label="Nombre"
                                value={formState.personName !== null ? formState.personName : ''}
                                InputLabelProps={{
                                    shrink: formState.personName ? true : false,
                                }}
                                InputProps={{
                                    readOnly: true,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="personIdentification"
                                label="RUC/CI"
                                value={formState.personIdentification !== null ? formState.personIdentification : ''}
                                InputLabelProps={{
                                    shrink: formState.personIdentification ? true : false,
                                }}
                                InputProps={{
                                    readOnly: true,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="personAddress"
                                label="Dirección"
                                value={formState.personAddress !== null ? formState.personAddress : ''}
                                InputLabelProps={{
                                    shrink: formState.personAddress ? true : false,
                                }}
                                InputProps={{
                                    readOnly: true,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="personEmail"
                                label="Correo Electrónico"
                                value={formState.personEmail !== null ? formState.personEmail : ''}
                                InputLabelProps={{
                                    shrink: formState.personEmail ? true : false,
                                }}
                                InputProps={{
                                    readOnly: true,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="personPhone"
                                label="Teléfono"
                                value={formState.personPhone !== null ? formState.personPhone : ''}
                                InputLabelProps={{
                                    shrink: formState.personPhone ? true : false,
                                }}
                                InputProps={{
                                    readOnly: true,
                                }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormGroup>
                                <Grid container spacing={0.5}>
                                    {roles.map((role) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={role.roleId}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        disabled={!createMode && !editMode}
                                                        checked={isRoleChecked(role.roleId)}
                                                        onChange={() => handleCheckboxChange(role)}
                                                        name={role.roleName}
                                                    />
                                                }
                                                label={role.roleName}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </FormGroup>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </>
    );
}