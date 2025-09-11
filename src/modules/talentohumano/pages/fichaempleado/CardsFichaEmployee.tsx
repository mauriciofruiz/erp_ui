import { Autocomplete, Avatar, Button, Grid, TextField } from '@mui/material';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import {
  AccountingDataType,
  CardType,
  ContractualInformationType,
  EmployeeResumeType,
  FichaEmpleadoType,
} from '@/types';
import { useStyles } from '@/hooks';
import { createApiConfig } from '@/backend';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import {
  defaultContractualInformation,
  defaultFichaEmpleado,
  defaultPerson,
} from '@/constants';
import { CardLayout } from '@/modules';
import { AddCircle } from '@mui/icons-material';
import getServiceUrls from '@/backend/servicesUrl';
import { PersonalInformationPage } from './PersonalInformationPage';
import { ContractualInformationPage } from './ContractualInformationPage';
import { AccountingDataPage } from './AccountingDataPage';

// * COMPONENTE QUE CONTIENE TODAS LAS CARDS MOSTRADAS DEL EMPLEADO

export const CardsFichaEmployee: (
  setVisibleButtons: Dispatch<SetStateAction<boolean>>,
  handleClickNext: () => void,
  setCurrentCard: Dispatch<SetStateAction<number>>
) => CardType[] = (setVisibleButtons, handleClickNext, setCurrentCard) => {
  // * * * * * * * * * * * * * * * * * * * * * * CONSTANTES / VARIABLES / DECLARACIONES * * * * * * * * * * * * * * *
  const serviceUrls = getServiceUrls();

  const api = createApiConfig(serviceUrls.tbaServiceUrl);

  const [employees, setEmployees] = useState<EmployeeResumeType[]>([]); // Lista donde se guardaran los empleados por identificacion o nombre

  const [selectedPerson, setSelectedPerson] =
    useState<EmployeeResumeType>(defaultPerson); // Constante para seleccionar un empleado resumen despues de buscarlo (se muestra solo en la primera card)

  const [selectedEmployee, setSelectedEmployee] =
    useState<FichaEmpleadoType>(defaultFichaEmpleado);

  const [createMode, setCreateMode] = useState(false);

  const [inputValue, setInputValue] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const classesHook = useStyles();

  const [contractualInformation, setContractualInformation] =
    useState<ContractualInformationType>(defaultContractualInformation);

  const [accountingData, setAccountingData] = useState<
    AccountingDataType[] | null
  >(null);

  const [saveNew, setSaveNew] = useState(false);

  // * * * * * * * * * * * * * * * * * * * * * * * * * * USE EFFECTS * * * * * * * * * * * * * * * * * * * * * * * * *

  useEffect(() => {
    if (inputValue.length >= 4) {
      const fetchData = async () => {
        try {
          const response = await api.get(`/empleado/get?param=${inputValue}`);

          if (response.status === 200) {
            setEmployees(response.data);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
              // Handle case when no employee is found
              setEmployees([]); // Set an empty array to clear the results
              enqueueSnackbar('No se ha encontrado el empleado buscado', {
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

      fetchData();
    } else {
      // If inputValue length is less than 4, clear the employees list
      setEmployees([]);
    }
  }, [inputValue]);

  useEffect(() => {
    if (
      !!selectedPerson &&
      selectedPerson?.employeeId !== 0 &&
      selectedPerson?.employeeId !== null
    ) {
      const getEmployeeComplete = async () => {
        try {
          const response = await api.get(
            `/empleado/get/${selectedPerson?.employeeId}`
          );

          if (response.status === 200) {
            setSelectedEmployee(response.data);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            enqueueSnackbar(
              'Error Al Obtener La Información Del Empleado: ' + error.message,
              {
                variant: 'error',
              }
            );
          }
        }
      };
      const getContractualInformation = async () => {
        try {
          const response = await api.get(
            `/empleado/informacion_contractual/get/${selectedPerson?.employeeId}`
          );

          if (response.status === 200) {
            setContractualInformation(response.data);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            enqueueSnackbar(
              'Error Al Obtener La Información Contractual Del Empleado: ' +
                error.message,
              {
                variant: 'error',
              }
            );
          }
        }
      };

      const getAccountingData = async () => {
        try {
          const response = await api.get(
            `/empleado/datos_contables/get/${selectedPerson?.employeeId}`
          );

          if (response.status === 200) {
            setAccountingData(response.data);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            enqueueSnackbar(
              'Error Al Obtener Datos Contables: ' + error.message,
              {
                variant: 'error',
              }
            );
          }
        }
      };

      getEmployeeComplete();
      getContractualInformation();
      getAccountingData();
    }
  }, [selectedPerson]);

  useEffect(() => {
    if (selectedPerson.employeeId === null) {
      setCreateMode(true);
    } else {
      setCreateMode(false);
    }
  }, [selectedPerson]);

  useEffect(() => {
    if (saveNew) {
      const saveEmployee = async () => {
        try {
          const requestBody = {
            employeeInformation: selectedEmployee,
            informationContractualEmployee: contractualInformation,
          };
          await api.post(`/empleado/create`, requestBody, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
              enqueueSnackbar('No se ha encontrado el empleado buscado', {
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

      saveEmployee();
    }
  }, [saveNew]);

  useEffect(() => {
    selectedEmployee.employeeId !== null &&
    contractualInformation !== null &&
    accountingData !== null
      ? setVisibleButtons(true)
      : setVisibleButtons(false);
  }, [selectedEmployee, contractualInformation, accountingData]);

  // * * * * * * * * * * * * * * * * * * * *  * HANDLERS * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  const handleAutocompleteChange = (
    event: React.ChangeEvent<{}>,
    newValue: EmployeeResumeType | null
  ) => {
    cleanVariables(); // Clean todas las variables al buscar un nuevo empleado
    if (event !== null && newValue !== null) {
      setSelectedPerson(newValue);
    }
  };
  const handleInputChangeAutocomplete = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setEmployees([]);
      setInputValue(newInputValue);
    }
  };

  const handleCreateMode = () => {
    cleanVariables();
    handleClickNext();
    enqueueSnackbar('Modo De Creación Activado', {
      variant: 'info',
    });
  };

  const handleCancelCreateMode = () => {
    cleanVariables();
    setCurrentCard(0);
    enqueueSnackbar(
      'Se canceló la creación del nuevo empleado. NO SE GUARDÓ NINGÚN DATO',
      {
        variant: 'info',
      }
    );
  };

  // * * * * * * *  FUNCION PARA LIMPIAR VARIABLES * * * * * * * * * *
  const cleanVariables = () => {
    setSelectedPerson(defaultPerson);

    setSelectedEmployee(defaultFichaEmpleado);

    setContractualInformation(defaultContractualInformation);

    setEmployees([]);
  };

  return [
    {
      id: 1,
      content: (
        <CardLayout title="FICHA EMPLEADO">
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid item xs={12}>
              <Autocomplete
                id="autocomplete-employee"
                className={classesHook.genericFieldStyle}
                options={employees}
                getOptionLabel={(option) => option.personName}
                style={{ width: '100%', marginBottom: '20px' }}
                onChange={(event, newValue) =>
                  handleAutocompleteChange(event, newValue)
                }
                onInputChange={(event, newInputValue) =>
                  handleInputChangeAutocomplete(event, newInputValue)
                }
                value={
                  selectedPerson?.employeeId !== null
                    ? selectedPerson
                    : null || null
                }
                isOptionEqualToValue={(option, value) =>
                  option.employeeId === value.employeeId
                }
                noOptionsText="Sin resultados"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccione un empleado"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Nombre"
                    value={selectedPerson?.personName || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedPerson?.personName ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Celular"
                    value={selectedPerson?.personCellphone || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedPerson?.personCellphone ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Email"
                    type="email"
                    value={selectedPerson?.personEmail || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedPerson?.personEmail ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Cargo"
                    value={selectedPerson?.positionName || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedPerson?.positionName ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Sucursal"
                    value={selectedPerson?.nameBranch || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedPerson?.nameBranch ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Salario"
                    value={
                      selectedPerson?.employeeSalary === 0
                        ? ''
                        : selectedPerson?.employeeSalary
                    }
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedPerson?.employeeSalary ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Fecha De Ingreso"
                    value={selectedPerson?.employeeEntryDate || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedPerson?.employeeEntryDate ? true : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Fecha De Reingreso"
                    value={selectedPerson?.employeeReentryDate || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      className: classesHook.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      shrink: selectedPerson?.employeeReentryDate
                        ? true
                        : false,
                      className: classesHook.textGreenStyle,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Avatar
                alt={selectedPerson?.personName}
                src={selectedPerson?.imgUser}
                style={{
                  height: '200px',
                  left: '685px',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: '210px',
                  width: '200px',
                }}
              />
            </Grid>
          </Grid>
          {createMode ? (
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Button
                startIcon={<AddCircle />}
                onClick={handleCreateMode}
                sx={{ margin: 2 }}
              >
                {'Crear Nuevo Empleado'}
              </Button>
            </Grid>
          ) : null}
        </CardLayout>
      ),
    },
    {
      id: 2,
      content: (
        <PersonalInformationPage
          setSelectedEmployee={setSelectedEmployee}
          selectedEmployee={selectedEmployee}
          createMode={createMode}
          handleCancelCreateMode={handleCancelCreateMode}
          handleClickNext={handleClickNext}
        />
      ),
    },
    {
      id: 3,
      content: (
        <ContractualInformationPage
          contractualInformation={contractualInformation}
          setContractualInformation={setContractualInformation}
          employeeId={selectedPerson.employeeId ? selectedPerson.employeeId : 0}
          createMode={createMode}
          handleCancelCreateMode={handleCancelCreateMode}
          setSaveNew={setSaveNew}
        />
      ),
    },
    {
      id: 4,
      content: <AccountingDataPage accountingData={accountingData} />,
    },
  ];
};
