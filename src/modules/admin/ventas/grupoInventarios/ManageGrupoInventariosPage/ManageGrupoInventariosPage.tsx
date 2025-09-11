'use client';
import { getCuentaById } from '@/backend';
import {
  FormState,
  useAccountAsync,
  useGrupoInventarioAsync,
  useStyles,
} from '@/hooks';
import { PaperComponent } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { AccountType, GrupoType } from '@/types';
import { EditNote, Save } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';

export type ManageGrupoInventariosPageProps = {
  openNew: boolean;
  setOpenNew: React.Dispatch<React.SetStateAction<boolean>>;
  formState: FormState;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  onResetForm: () => void;
  editMode: boolean;
  createMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  thereIsChanges: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  cuentasList: AccountType[];
  setCuentasList: React.Dispatch<React.SetStateAction<AccountType[]>>;
};

export const ManageGrupoInventariosPage: React.FC<
  ManageGrupoInventariosPageProps
> = ({
  openNew,
  setOpenNew,
  formState,
  onInputChange,
  onResetForm,
  editMode,
  createMode,
  setEditMode,
  title,
  setTitle,
  thereIsChanges,
  onAutocompleteChange,
  cuentasList,
  setCuentasList,
}) => {
  const styles = useStyles();
  const [searchCuenta, setSearchCuentas] = useState('');
  const { fetchSaveGrupo, fetchUpdateGrupo } = useGrupoInventarioAsync();
  const [cuentaInventario, setCuentaInventario] = useState<AccountType | null>(
    null
  );
  const [cuentaCosto, setCuentaCosto] = useState<AccountType | null>(null);
  const [cuentaIngreso, setCuentaIngreso] = useState<AccountType | null>(null);
  const { fetchAccountByNumber } = useAccountAsync();

  const handleAutocompleteCuenta = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchCuentas(inputValue);
    }
  };

  const setHeader = (formState: FormState): GrupoType => {
    return {
      ...(formState as GrupoType),
    };
  };

  const onEditButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
      setTitle('Grupo Inventario (Modo Edición) - N° ' + formState.groupId);
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
      setTitle('Grupo Inventario (Modo Lectura) - N° ' + formState.groupId);
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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const grupoInventarioPost = setHeader(formState);

    const response =
      formState.groupId && formState.groupId !== null
        ? await fetchUpdateGrupo(formState.groupId, grupoInventarioPost)
        : await fetchSaveGrupo(grupoInventarioPost);

    if (
      !response ||
      (response && (response as ServerResponseType).status === 400) ||
      (response && (response as ServerResponseType).status === 500)
    ) {
      enqueueSnackbar(`Error al guardar el grupo inventario`, {
        variant: 'error',
      });
      return;
    }
    enqueueSnackbar(`El Grupo Inventario se guardo correctamente`, {
      variant: 'success',
    });
    onResetForm();
    setOpenNew(false);
  };

  useEffect(() => {
    const searchGastoContable = async () => {
      fetchAccountByNumber(searchCuenta).then((response) => {
        if (response) setCuentasList(response);
      });
    };
    if (searchCuenta.length >= 3) {
      searchGastoContable();
    }
  }, [searchCuenta]);

  const fetchDataCuenta = async (idCuenta: number) => {
    try {
      const response: ServerResponseType | undefined = await getCuentaById(
        idCuenta
      );
      if (response) {
        if (response.status === 200 && response.message) {
          setCuentasList((prevCuentasList) => [
            ...prevCuentasList,
            response.message,
          ]);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setCuentasList([]);
          enqueueSnackbar('No se ha encontrado la cuenta solicitada buscado', {
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

  useEffect(() => {
    if (formState.groupId && formState.groupId !== null) {
      if (
        formState.incomeAccountGroupId &&
        formState.incomeAccountGroupId !== null
      ) {
        fetchDataCuenta(formState.incomeAccountGroupId);
      }
    }
  }, [formState.incomeAccountGroupId]);

  useEffect(() => {
    if (formState.groupId && formState.groupId !== null) {
      if (
        formState.costAccountGroupId &&
        formState.costAccountGroupId !== null
      ) {
        fetchDataCuenta(formState.costAccountGroupId);
      }
    }
  }, [formState.costAccountGroupId]);

  useEffect(() => {
    if (formState.groupId && formState.groupId !== null) {
      if (
        formState.inventoryAccountGroupId &&
        formState.inventoryAccountGroupId !== null
      ) {
        fetchDataCuenta(formState.inventoryAccountGroupId);
      }
    }
  }, [formState.inventoryAccountGroupId]);

  useEffect(() => {
    if (formState.incomeAccountGroupId === null) {
      setCuentaIngreso(null);
      return;
    }
    if (cuentaIngreso && cuentaIngreso !== null && cuentasList.length === 0)
      return;
    const cuenta = cuentasList.find(
      (cuenta) => cuenta.accountId === formState.incomeAccountGroupId
    );
    if (cuenta) {
      setCuentaIngreso(cuenta);
    }
  }, [formState.incomeAccountGroupId, cuentasList]);

  useEffect(() => {
    if (formState.inventoryAccountGroupId === null) {
      setCuentaInventario(null);
      return;
    }
    if (
      cuentaInventario &&
      cuentaInventario !== null &&
      cuentasList.length === 0
    )
      return;
    const cuenta = cuentasList.find(
      (cuenta) => cuenta.accountId === formState.inventoryAccountGroupId
    );
    if (cuenta) {
      setCuentaInventario(cuenta);
    }
  }, [formState.inventoryAccountGroupId, cuentasList]);

  useEffect(() => {
    if (formState.costAccountGroupId === null) {
      setCuentaCosto(null);
      return;
    }
    if (cuentaCosto && cuentaCosto !== null && cuentasList.length === 0) return;
    const cuenta = cuentasList.find(
      (cuenta) => cuenta.accountId === formState.costAccountGroupId
    );
    if (cuenta) {
      setCuentaCosto(cuenta);
    }
  }, [formState.costAccountGroupId, cuentasList]);

  return (
    <Dialog
      open={openNew}
      onClose={() => setOpenNew(false)}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        style={{
          cursor: 'move',
          textAlign: 'center',
        }}
        id="draggable-dialog-title"
        sx={{ mt: 2 }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                required
                name="groupName"
                label="Nombre"
                value={formState.groupName}
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink: formState.groupName ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                name="groupCode"
                label="Nemónico"
                value={formState.groupCode}
                onChange={onInputChange}
                InputProps={{
                  readOnly: !createMode && !editMode,
                }}
                InputLabelProps={{
                  shrink: formState.groupCode ? true : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={cuentasList}
                readOnly={
                  formState.incomeAccountGroupId === null || createMode === true
                    ? false
                    : true
                }
                getOptionLabel={(option) =>
                  `${option.accountNumber} - ${option.accountName}`
                }
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  onAutocompleteChange(
                    event,
                    'incomeAccountGroupId',
                    value?.accountId
                  );
                }}
                value={cuentaIngreso}
                onInputChange={handleAutocompleteCuenta}
                isOptionEqualToValue={(
                  option: AccountType,
                  value: AccountType
                ) => (option && value ? option === value : false)}
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cuenta Ingreso"
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
              <Autocomplete
                className={styles.genericFieldStyle}
                options={cuentasList}
                readOnly={
                  formState.inventoryAccountGroupId === null ||
                  createMode === true
                    ? false
                    : true
                }
                getOptionLabel={(option) =>
                  `${option.accountNumber} - ${option.accountName}`
                }
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  onAutocompleteChange(
                    event,
                    'inventoryAccountGroupId',
                    value?.accountId
                  );
                }}
                value={cuentaInventario}
                onInputChange={handleAutocompleteCuenta}
                isOptionEqualToValue={(
                  option: AccountType,
                  value: AccountType
                ) => (option && value ? option === value : false)}
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cuenta Inventario"
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
              <Autocomplete
                className={styles.genericFieldStyle}
                options={cuentasList}
                readOnly={
                  formState.costAccountGroupId === null || createMode === true
                    ? false
                    : true
                }
                getOptionLabel={(option) =>
                  `${option.accountNumber} - ${option.accountName}`
                }
                style={{ width: '100%' }}
                onChange={(event, value) => {
                  onAutocompleteChange(
                    event,
                    'costAccountGroupId',
                    value?.accountId
                  );
                }}
                value={cuentaCosto}
                onInputChange={handleAutocompleteCuenta}
                isOptionEqualToValue={(
                  option: AccountType,
                  value: AccountType
                ) => (option && value ? option === value : false)}
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cuenta Costo"
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
            {!createMode && (
              <>
                <Button
                  startIcon={<EditNote />}
                  sx={{ margin: 2 }}
                  onClick={onEditButtonClick}
                  style={{ width: '120px' }}
                >
                  {!editMode ? 'Editar' : 'Leer'}
                </Button>
              </>
            )}
            <Button
              startIcon={<Save />}
              disabled={!thereIsChanges}
              sx={{ margin: 2 }}
              type="submit"
            >
              {'Guardar'}
            </Button>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};
