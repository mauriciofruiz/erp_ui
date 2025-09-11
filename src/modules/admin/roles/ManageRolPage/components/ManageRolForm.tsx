import { FormState } from '@/hooks'
import { Box, Grid, TextField } from '@mui/material'
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import dayjs, { Dayjs } from 'dayjs'
import React, { ChangeEvent } from 'react'


export type ManageRolFormProps = {
    formState: FormState
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
    createMode: boolean
    editMode: boolean
    onDateChange: (value: Date, name: string) => void;
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void;
    onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const ManageRolForm: React.FC<ManageRolFormProps> = ({
    formState,
    setFormState,
    createMode,
    editMode,
    onInputChange,
    onInputJustNumber
}) => {

    const handleTimeChange = (name: string, newValue: Dayjs) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: newValue,
        }));
    };

    return (
        <>
            <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6}>
                            <TextField
                                name="roleName"
                                label="Nombre"
                                value={formState.roleName !== null ? formState.roleName : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.roleName ? true : false,
                                }}
                                InputProps={{
                                    readOnly: !createMode && !editMode,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="roleDescription"
                                label="Descripción"
                                value={formState.roleDescription !== null ? formState.roleDescription : ''}
                                onChange={onInputChange}
                                InputLabelProps={{
                                    shrink: formState.roleDescription ? true : false,
                                }}
                                InputProps={{
                                    readOnly: !createMode && !editMode,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']}>
                                        <TimePicker
                                            label="Hora Inicio"
                                            value={formState.roleStartTime !== '' ? formState.roleStartTime : dayjs()}
                                            onChange={(newValue) => handleTimeChange('roleStartTime', newValue)}
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
                                            value={formState.roleEndTime !== '' ? formState.roleEndTime : dayjs()}
                                            onChange={(newValue) => handleTimeChange('roleEndTime', newValue)}
                                            readOnly={!createMode && !editMode}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="roleTime"
                                label="Tiempo Rol"
                                value={formState.roleTime !== 0 ? formState.roleTime : ''}
                                onChange={onInputJustNumber}
                                InputLabelProps={{
                                    shrink: formState.roleTime ? true : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </>
    )
}
