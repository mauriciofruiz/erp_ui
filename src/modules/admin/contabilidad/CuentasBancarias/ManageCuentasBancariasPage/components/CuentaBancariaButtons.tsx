import { FormState } from '@/hooks';
import { EditNote, ExitToApp, Save } from '@mui/icons-material';
import { Button, Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react'


interface CuentaBancariaButtonsProps {
    createMode: boolean;
    handleCancel: () => void;
    isEditable: boolean;
    editMode: boolean;
    thereIsChanges: boolean;
    formState: FormState;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
}

export const CuentaBancariaButtons = (props: CuentaBancariaButtonsProps) => {

    const {
        createMode,
        handleCancel,
        isEditable,
        editMode,
        thereIsChanges,
        setEditMode,
        setTitle,
        formState
    } = props;

    const { enqueueSnackbar } = useSnackbar();

    const onEditButtonClick = () => {
        if (!editMode) {
            setEditMode(true);
            setTitle('Cuenta Bancaria (Modo Edición) - N° ' + formState.bankId);
            enqueueSnackbar(
                <>
                    {'Modo edición habilitado'}
                    <br />
                    {'Modo lectura deshabilitado'}
                </>,
                {
                    variant: 'info',
                }
            );
        } else {
            setEditMode(false);
            setTitle('Cuenta Bancaria (Modo Lectura) - N° ' + formState.bankId);
            enqueueSnackbar(
                <>
                    {'Modo edición deshabilitado'}
                    <br />
                    {'Modo lectura habilitado'}
                </>,
                {
                    variant: 'info',
                }
            );
        }
    };

    return (
        <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
        >
            {!createMode && (
                <>
                    <Button
                        startIcon={<ExitToApp />}
                        sx={{ margin: 2 }}
                        onClick={handleCancel}
                        style={{ width: '120px' }}
                    >
                        {'Salir'}
                    </Button>
                    {isEditable && (
                        <Button
                            startIcon={<EditNote />}
                            sx={{ margin: 2 }}
                            onClick={onEditButtonClick}
                            style={{ width: '120px' }}
                        >
                            {!editMode ? 'Editar' : 'Leer'}
                        </Button>
                    )}
                </>
            )}
            {isEditable && (
                <>
                    <Button
                        startIcon={<Save />}
                        disabled={!thereIsChanges}
                        sx={{ margin: 2 }}
                        type="submit"
                        style={{ width: '120px' }}
                    >
                        {'Guardar'}
                    </Button>
                </>
            )}
        </Grid>
    );
}
