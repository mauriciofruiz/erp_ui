import { StyledDatePicker, useStyles } from '@/hooks';
import { RootState } from '@/store';
import {
  ContractModalityType,
  ContractModeType,
  ContractType,
  ContractualInformationType,
  DepartmentType,
  PositionType,
  SucursalType,
} from '@/types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  Input,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, {
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  DoneAll,
  AddCircle,
  Info,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import isEqual from 'lodash.isequal';
import { createApiConfig } from '@/backend';
import axios from 'axios';
import { checkAndSetAsync } from '@/functions';
import { CardLayout } from '@/modules';
import { defaultContractType } from '@/constants';
import getServiceUrls from '@/backend/servicesUrl';

export type ContractualInformationPageProps = {
  contractualInformation: ContractualInformationType;
  setContractualInformation: Dispatch<
    SetStateAction<ContractualInformationType>
  >;
  employeeId: number;
  createMode: boolean;
  handleCancelCreateMode: () => void;
  setSaveNew: Dispatch<SetStateAction<boolean>>;
};

export const ContractualInformationPage: React.FC<
  ContractualInformationPageProps
> = ({
  contractualInformation,
  setContractualInformation,
  employeeId,
  createMode,
  handleCancelCreateMode,
  setSaveNew,
}) => {
  const serviceUrls = getServiceUrls();

  const apiTba = createApiConfig(serviceUrls.tbaServiceUrl);

  const apiRRHH = createApiConfig(serviceUrls.tbaServiceUrl);

  const classesHook = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [editMode, setEditMode] = useState(false);

  const { positions, sucursales, departments } = useSelector(
    (state: RootState) => state.common
  );

  // * * * * * * * * * * * * * * * * *  * DEPARTAMENTO DECLARATE * * * * * * * * * * * * * *

  const [departmentsList, setDepartmentsList] =
    useState<DepartmentType[]>(departments);

  const getDepartmentSelected = () => {
    const matchingDepartment = departmentsList.find(
      (d) => d.departmentId === contractualInformation.departmentId
    );
    return matchingDepartment || null;
  };

  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentType | null>(getDepartmentSelected());

  //  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

  const [positionsList, setPositionsList] = useState<PositionType[]>(
    positions.filter((p) => p.departmentId === selectedDepartment?.departmentId)
  );

  const [sucursalesList, setSucursalesList] =
    useState<SucursalType[]>(sucursales);

  // ? START * * * * * * * * * * * * * * * *  FUNCTIONS TO INITIALIZE VARIABLES * * * * * * * * * * * * * *

  const getPositionSelected = () => {
    const matchingPosition = positionsList.find(
      (p) => p.positionId === contractualInformation.positionId
    );
    return matchingPosition || null;
  };

  const getSucursalSelected = () => {
    const matchingSucursal = sucursalesList.find(
      (s) => s.branchId === contractualInformation.branchId
    );
    return matchingSucursal || null;
  };

  const getContractModeSelected = (contract: ContractType) => {
    const matchingContractMode = contractModeList.find(
      (c) => c.contractTypeId === contract.contractTypeId
    );
    return matchingContractMode || null;
  };
  const getContractModalitySelected = (contract: ContractType) => {
    const matchingContractMode = contractModalityList.find(
      (c) => c.contractModalityId === contract.contractModalityId
    );
    return matchingContractMode || null;
  };
  // ? END * * * * * * * * * * * * * * * *  FUNCTIONS TO INITIALIZE VARIABLES * * * * * * * * * * * * * *

  const [selectedPosition, setSelectedPosition] = useState<PositionType | null>(
    getPositionSelected()
  );

  const [selectedSucursal, setSelectedSucursal] = useState<SucursalType | null>(
    getSucursalSelected()
  );

  const prevContractualInformation = useRef<ContractualInformationType>(
    contractualInformation
  );

  const [contractModeList, setContractModeList] = useState<ContractModeType[]>(
    []
  );

  const [contractModalityList, setContractModalityList] = useState<
    ContractModalityType[]
  >([]);

  const [inputDeparment, setInputDepartment] = useState('');

  const [inputPosition, setInputPosition] = useState('');

  const [inputSucursal, setInputSucursal] = useState('');

  const [open, setOpen] = useState(false);

  // * * * * * * * * * * * * * * * * *  FUNCTIONS  * * * * * * * * * * * * * * * *

  const setContractsListAsync = async () => {
    try {
      const response = await apiRRHH.get('/tipo_contrato/get');
      if (response.status === 200) {
        setContractModeList(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar('Error Al Obtener Contratos: ' + error.message, {
          variant: 'error',
        });
      }
    }
  };

  const setContractsModalityListAsync = async () => {
    try {
      const response = await apiRRHH.get('/modalidad_contrato/get');
      if (response.status === 200) {
        setContractModalityList(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar(
          'Error Al Obtener Modalidad Contratos: ' + error.message,
          {
            variant: 'error',
          }
        );
      }
    }
  };

  // ? * * * * * * * * * * * * * * * * * USE EFFECTS * * * * * * * * * * * * * * *

  useEffect(() => {
    if (inputDeparment.length > 4) {
      const matchingDepartments = departments.filter((d) =>
        d.departmentName.toLowerCase().includes(inputDeparment.toLowerCase())
      );
      setDepartmentsList(matchingDepartments);
    }
  }, [inputDeparment]);

  useEffect(() => {
    if (inputPosition.length > 4) {
      const matchingPositions = positions.filter((p) =>
        p.positionName.toLowerCase().includes(inputPosition.toLowerCase())
      );
      setPositionsList(
        matchingPositions.filter(
          (p) => p.departmentId === selectedDepartment?.departmentId
        )
      );
    }
  }, [inputPosition]);

  useEffect(() => {
    if (inputSucursal.length > 4) {
      const matchingSucursales = sucursales.filter((s) =>
        s.name.toLowerCase().includes(inputSucursal.toLowerCase())
      );
      setSucursalesList(matchingSucursales);
    }
  }, [inputSucursal]);

  useEffect(() => {
    setPositionsList(
      positions.filter(
        (p) =>
          p.departmentId === selectedDepartment?.departmentId && p.positionState
      )
    );
    setSelectedPosition(getPositionSelected());

    setContractualInformation((prevState) => {
      if (!prevState) return prevState;

      const updatedState = {
        ...prevState,
        departmentId: selectedDepartment?.departmentId || null,
        departmentName: selectedDepartment?.departmentName || '',
      };

      return updatedState;
    });
  }, [selectedDepartment]);

  useEffect(() => {
    setContractualInformation((prevState) => {
      if (!prevState) return prevState;

      const updatedState = {
        ...prevState,
        positionId: selectedPosition?.positionId || null,
        jobName: selectedPosition?.positionName || '',
      };

      return updatedState;
    });
  }, [selectedPosition]);

  useEffect(() => {
    setContractualInformation((prevState) => {
      if (!prevState) return prevState;

      const updatedState = {
        ...prevState,
        branchId: selectedSucursal?.branchId || null,
        branchName: selectedSucursal?.name || '',
      };

      return updatedState;
    });
  }, [selectedSucursal]);

  useEffect(() => {
    checkAndSetAsync(contractModeList, setContractsListAsync);
    checkAndSetAsync(contractModalityList, setContractsModalityListAsync);
  }, [editMode]);

  // * * * * * * * * * * * * * * * * * * HANDLERS * * * * * * * * * * * * * * * *
  const handleEditClick = () => {
    prevContractualInformation.current = contractualInformation;
    setEditMode(true);
    enqueueSnackbar('Modo edición habilitado', {
      variant: 'info',
    });
  };

  const handleSaveClick = async () => {
    setEditMode(false);
    if (!isEqual(prevContractualInformation.current, contractualInformation)) {
      try {
        const response = await apiTba.put(
          `/empleado/informacion_contractual/update/${employeeId}`,
          contractualInformation
        );
        if (response.status === 200) {
          prevContractualInformation.current = contractualInformation;
          enqueueSnackbar('Los cambios se guardarón exitósamente', {
            variant: 'success',
          });
        } else {
          enqueueSnackbar('Los cambios lo pudieron guardarse', {
            variant: 'error',
          });
        }
      } catch (error) {
        enqueueSnackbar(
          'Existió un error de conexión, los cambios no se guardaron',
          { variant: 'error' }
        );
      }
    } else {
      enqueueSnackbar('No se realizó ningún cambio al momento de editar', {
        variant: 'info',
      });
    }
  };

  const handleCancelClick = () => {
    setEditMode(false);
    if (prevContractualInformation.current) {
      setContractualInformation(prevContractualInformation.current);
    }
    enqueueSnackbar('Se canceló el modo edición', {
      variant: 'info',
    });
  };

  const handleInputDepartamento = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setInputDepartment(newInputValue);
    }
  };

  const handleInputPosition = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setInputPosition(newInputValue);
    }
  };

  const handleInputSucursal = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setInputSucursal(newInputValue);
    }
  };

  const handleDeparmentChange = (
    event: React.ChangeEvent<{}>,
    newValue: DepartmentType | null
  ) => {
    if (event !== null) {
      event.preventDefault();
    }
    setSelectedDepartment(newValue);
  };

  const handlePositionChange = (
    event: React.ChangeEvent<{}>,
    newValue: PositionType | null
  ) => {
    if (event !== null) {
      event.preventDefault();
    }
    setSelectedPosition(newValue);
  };

  const handleSucursalChange = (
    event: React.ChangeEvent<{}>,
    newValue: SucursalType | null
  ) => {
    if (event !== null) {
      event.preventDefault();
    }
    setSelectedSucursal(newValue);
  };

  const handleDateChange = (value: Date | null, field: string) => {
    setContractualInformation((prevState) => {
      if (!prevState) return prevState;
      const updatedState = { ...prevState };
      switch (field) {
        case 'companyEntryDate':
          updatedState.companyEntryDate = value;
          break;
      }

      return updatedState;
    });
  };

  const handleDateChangeContract = (
    value: Date | null,
    field: string,
    contractTemp: ContractType
  ) => {
    switch (field) {
      case 'startDateContract':
        setContractualInformation((prevState: ContractualInformationType) => ({
          ...prevState,
          listContract: prevState.listContract.map((contract) =>
            contract.contractId === contractTemp.contractId
              ? {
                  ...contract,
                  startDateContract: value || null,
                }
              : contract
          ),
        }));
        break;
      case 'endDateContract':
        setContractualInformation((prevState: ContractualInformationType) => ({
          ...prevState,
          listContract: prevState.listContract.map((contract) =>
            contract.contractId === contractTemp.contractId
              ? {
                  ...contract,
                  endDateContract: value || null,
                }
              : contract
          ),
        }));
        break;
      default:
        enqueueSnackbar('No se modificó la fecha', {
          variant: 'info',
        });
        break;
    }
  };

  const onInputChangeForm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setContractualInformation((prevState) =>
      prevState ? { ...prevState, [name]: value } : prevState
    );
  };

  const handleAutocompleteContractMode = (
    event: React.ChangeEvent<{}>,
    value: ContractModeType | null,
    contractTemp: ContractType
  ) => {
    if (event !== null) {
      event.preventDefault();
    }
    setContractualInformation((prevState: ContractualInformationType) => ({
      ...prevState,
      listContract: prevState.listContract.map((contract) =>
        contract.contractId === contractTemp.contractId
          ? {
              ...contract,
              contractName: value?.contractTypeName || '',
              contractTypeId: value?.contractTypeId || null,
            }
          : contract
      ),
    }));
  };

  const handleAutocompleteContractModality = (
    event: React.ChangeEvent<{}>,
    value: ContractModalityType | null,
    contractTemp: ContractType
  ) => {
    if (event !== null) {
      event.preventDefault();
    }
    setContractualInformation((prevState: ContractualInformationType) => ({
      ...prevState,
      listContract: prevState.listContract.map((contract) =>
        contract.contractId === contractTemp.contractId
          ? {
              ...contract,
              contractModalityId: value?.contractModalityId || null,
              nameContractType: value?.contractModalityName || '',
            }
          : contract
      ),
    }));
  };

  const handleChangeBooleanContract = (
    event: React.ChangeEvent<HTMLInputElement>,
    contractTemp: ContractType
  ) => {
    setContractualInformation((prevState: ContractualInformationType) => ({
      ...prevState,
      listContract: prevState.listContract.map((contract) =>
        contract.contractId === contractTemp.contractId
          ? {
              ...contract,
              stateContract: event.target.checked,
              endDateContract: new Date(),
            }
          : contract
      ),
    }));
  };

  const handleChangeBoolean = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    setContractualInformation((prevState) => {
      if (!prevState) return prevState;

      const updatedState = { ...prevState, [name]: event.target.checked };
      return updatedState;
    });
  };

  // * * * * * * * * * * * * * * * *  FOR CREATE EXCLUSIVE * * * * * * * * * * * *
  const enabledDisabled = () => {
    if (editMode) {
      return true;
    } else if (!editMode && createMode) {
      return true;
    } else {
      return false;
    }
  };

  // TODO: agregar nuevo contrato a la lista previamente existente
  const handleNewContract = () => {
    const contractList = defaultContractType;
    setContractualInformation((prevState) => {
      if (!prevState) return prevState;

      const updatedState = { ...prevState };
      updatedState.listContract = [...prevState.listContract, contractList];

      return updatedState;
    });
  };
  return (
    <CardLayout
      title="INFORMACIÓN CONTRACTUAL"
      createMode={createMode}
      cancelFunction={handleCancelCreateMode}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              {enabledDisabled() ? (
                <Autocomplete
                  id="autocomplete-department"
                  className={classesHook.genericFieldStyle}
                  options={departmentsList}
                  getOptionLabel={(option) => option.departmentName}
                  style={{ width: '100%', marginBottom: '20px' }}
                  onChange={handleDeparmentChange}
                  onInputChange={handleInputDepartamento}
                  value={selectedDepartment}
                  isOptionEqualToValue={(option, value) =>
                    option.departmentId === value.departmentId
                  }
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Departamento"
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
              ) : (
                <TextField
                  label="Departamento"
                  placeholder="Departamento"
                  value={contractualInformation.departmentName}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: contractualInformation.departmentName
                      ? true
                      : false,
                    className: classesHook.textGreenStyle,
                  }}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              {enabledDisabled() ? (
                <Autocomplete
                  id="autocomplete-position"
                  className={classesHook.genericFieldStyle}
                  options={positionsList}
                  getOptionLabel={(option) => option.positionName}
                  style={{ width: '100%', marginBottom: '20px' }}
                  onChange={handlePositionChange}
                  onInputChange={handleInputPosition}
                  value={selectedPosition}
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
                        className: classesHook.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: classesHook.textGreenStyle,
                      }}
                    />
                  )}
                />
              ) : (
                <TextField
                  label="Cargo"
                  placeholder="Cargo"
                  value={contractualInformation.jobName}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: contractualInformation.jobName ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              {enabledDisabled() ? (
                <Autocomplete
                  id="autocomplete-sucursal"
                  className={classesHook.genericFieldStyle}
                  options={sucursales}
                  getOptionLabel={(option) => option.name}
                  style={{ width: '100%', marginBottom: '20px' }}
                  onChange={handleSucursalChange}
                  onInputChange={handleInputSucursal}
                  value={selectedSucursal}
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
                        className: classesHook.textWhiteStyle,
                      }}
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        className: classesHook.textGreenStyle,
                      }}
                    />
                  )}
                />
              ) : (
                <TextField
                  label="Sucursal"
                  placeholder="Sucursal"
                  value={contractualInformation.branchName}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: classesHook.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: contractualInformation.branchName ? true : false,
                    className: classesHook.textGreenStyle,
                  }}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <StyledDatePicker
                label="Fecha Ingreso"
                views={['year', 'month', 'day']}
                minDate={dayjs(new Date()).subtract(100, 'year').toDate()}
                maxDate={new Date()}
                format="dd/MM/yyyy"
                readOnly={!enabledDisabled()}
                value={
                  contractualInformation.companyEntryDate
                    ? new Date(contractualInformation.companyEntryDate)
                    : null
                }
                onChange={(value) =>
                  handleDateChange(value as Date, 'companyEntryDate')
                }
                slotProps={{
                  textField: {
                    className: classesHook.genericFieldStyle,
                    sx: {
                      minWidth: '100%',
                    },
                    InputProps: {
                      className: classesHook.textWhiteStyle,
                    },
                    InputLabelProps: {
                      className: classesHook.textGreenStyle,
                      shrink: contractualInformation.companyEntryDate
                        ? true
                        : false,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="employeeSalary"
                label="Salario"
                value={contractualInformation.employeeSalary}
                fullWidth
                InputProps={{
                  readOnly: !enabledDisabled(),
                  className: classesHook.textWhiteStyle,
                }}
                InputLabelProps={{
                  shrink:
                    contractualInformation.employeeSalary ||
                    contractualInformation.employeeSalary === 0
                      ? true
                      : false,
                  className: classesHook.textGreenStyle,
                }}
                onChange={onInputChangeForm}
              />
            </Grid>
          </Grid>
          <Divider sx={{ height: '2px', margin: 4 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                variant="h6"
                className={classesHook.headerTitleWhite}
                sx={{ mb: 3 }}
              >
                CONTRATOS
              </Typography>
              {contractualInformation.listContract.map((contract) => (
                <Accordion key={contract.contractId} sx={{ mb: 2 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {contract.contractName}
                      </Typography>
                      <Typography sx={{ fontWeight: 'bold', mr: 2 }}>
                        ESTADO: {contract.stateContract ? 'ACTIVO' : 'INACTIVO'}
                      </Typography>
                    </div>
                  </AccordionSummary>
                  <Divider sx={{ mb: 3 }} />
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        {enabledDisabled() ? (
                          <Autocomplete
                            id="autocomplete-contract-type"
                            className={classesHook.genericFieldStyle}
                            options={contractModeList}
                            getOptionLabel={(option) => option.contractTypeName}
                            style={{ width: '100%', marginBottom: '20px' }}
                            onChange={(event, newValue) =>
                              handleAutocompleteContractMode(
                                event,
                                newValue,
                                contract
                              )
                            }
                            //   onInputChange={(event, newInputValue) =>
                            //     handleInputChangeAutocomplete(event, newInputValue)
                            //   }
                            value={getContractModeSelected(contract)}
                            isOptionEqualToValue={(option, value) =>
                              option.contractTypeId === value.contractTypeId
                            }
                            readOnly={
                              contract.endDateContract !== null &&
                              !contract.stateContract
                            }
                            noOptionsText="Sin resultados"
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Tipo De Contrato"
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
                        ) : (
                          <TextField
                            name="contractName"
                            label="Tipo De Contrato"
                            placeholder="Tipo De Contrato"
                            value={contract.contractName}
                            fullWidth
                            InputProps={{
                              readOnly: true,
                              className: classesHook.textWhiteStyle,
                            }}
                            InputLabelProps={{
                              shrink: contract.contractName ? true : false,
                              className: classesHook.textGreenStyle,
                            }}
                          />
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {enabledDisabled() ? (
                          <Autocomplete
                            id="autocomplete-contract-modality-type"
                            className={classesHook.genericFieldStyle}
                            options={contractModalityList}
                            getOptionLabel={(option) =>
                              option.contractModalityName
                            }
                            style={{ width: '100%', marginBottom: '20px' }}
                            onChange={(event, newValue) =>
                              handleAutocompleteContractModality(
                                event,
                                newValue,
                                contract
                              )
                            }
                            value={getContractModalitySelected(contract)}
                            isOptionEqualToValue={(option, value) =>
                              option.contractModalityId ===
                              value.contractModalityId
                            }
                            readOnly={
                              contract.endDateContract !== null &&
                              !contract.stateContract
                            }
                            noOptionsText="Sin resultados"
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Modalidad"
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
                        ) : (
                          <TextField
                            name="nameContractType"
                            label="Modalidad"
                            placeholder="Modalidad"
                            value={contract.nameContractType}
                            fullWidth
                            InputProps={{
                              readOnly: true,
                              className: classesHook.textWhiteStyle,
                            }}
                            InputLabelProps={{
                              shrink: contract.nameContractType ? true : false,
                              className: classesHook.textGreenStyle,
                            }}
                          />
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <StyledDatePicker
                          label="Fecha Inicio"
                          views={['year', 'month', 'day']}
                          minDate={dayjs(new Date())
                            .subtract(100, 'year')
                            .toDate()}
                          maxDate={new Date()}
                          format="dd/MM/yyyy"
                          readOnly={
                            !enabledDisabled() ||
                            (contract.endDateContract !== null &&
                              !contract.stateContract)
                          }
                          value={
                            contract.startDateContract
                              ? new Date(contract.startDateContract)
                              : null
                          }
                          onChange={(value) =>
                            handleDateChangeContract(
                              value as Date,
                              'startDateContract',
                              contract
                            )
                          }
                          slotProps={{
                            textField: {
                              className: classesHook.genericFieldStyle,
                              sx: {
                                minWidth: '100%',
                              },
                              InputProps: {
                                className: classesHook.textWhiteStyle,
                              },
                              InputLabelProps: {
                                className: classesHook.textGreenStyle,
                                shrink: contract.startDateContract
                                  ? true
                                  : false,
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <StyledDatePicker
                          label="Fecha Fin"
                          views={['year', 'month', 'day']}
                          minDate={dayjs(new Date())
                            .subtract(100, 'year')
                            .toDate()}
                          maxDate={new Date()}
                          format="dd/MM/yyyy"
                          readOnly={
                            !enabledDisabled() ||
                            (contract.endDateContract !== null &&
                              !contract.stateContract)
                          }
                          value={
                            contract.endDateContract
                              ? new Date(contract.endDateContract)
                              : null
                          }
                          onChange={(value) =>
                            handleDateChangeContract(
                              value as Date,
                              'endDateContract',
                              contract
                            )
                          }
                          slotProps={{
                            textField: {
                              className: classesHook.genericFieldStyle,
                              sx: {
                                minWidth: '100%',
                              },
                              InputProps: {
                                className: classesHook.textWhiteStyle,
                              },
                              InputLabelProps: {
                                className: classesHook.textGreenStyle,
                                shrink: contract.endDateContract ? true : false,
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={6}
                        container
                        justifyContent="center"
                        alignItems="center"
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              disabled={
                                !enabledDisabled() || !contract.stateContract
                              }
                              checked={contract.stateContract}
                              onChange={(event) =>
                                handleChangeBooleanContract(event, contract)
                              }
                            />
                          }
                          label="Contrato Inactivo/Activo"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            {/* Button for downloading a file */}
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<CloudDownloadIcon />}
                              fullWidth
                              disabled={contract.fileContract == null}
                              // onClick={handleDownloadFile} // Define this function
                            >
                              Download File
                            </Button>
                          </Grid>
                          <Grid item xs={6}>
                            {/* Button for uploading a file */}
                            <label
                              htmlFor="file-upload"
                              style={{ width: '100%' }}
                            >
                              <Input
                                id="file-upload"
                                type="file"
                                style={{ display: 'none' }}
                                // onChange={handleFileUpload} // Define this function
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                disabled={
                                  !enabledDisabled() || !contract.stateContract
                                }
                                fullWidth
                              >
                                Upload File
                              </Button>
                            </label>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 0.5 }}
          >
            {enabledDisabled() ? (
              <Button
                startIcon={<AddCircle />}
                onClick={handleNewContract}
                sx={{ margin: 2 }}
              >
                {'Nuevo Contrato'}
              </Button>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
      <Divider sx={{ height: '2px', margin: 4 }} />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            className={classesHook.headerTitleWhite}
            sx={{ mb: 3 }}
          >
            PROVISIONES
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="incomeTax"
            label="Impuesto Renta"
            value={contractualInformation.incomeTax}
            fullWidth
            type="number"
            InputProps={{
              readOnly: !enabledDisabled(),
              className: classesHook.textWhiteStyle,
            }}
            InputLabelProps={{
              shrink:
                contractualInformation.incomeTax ||
                contractualInformation.incomeTax === 0
                  ? true
                  : false,
              className: classesHook.textGreenStyle,
            }}
            onChange={onInputChangeForm}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="fortnightValue"
            label="Quincena"
            value={contractualInformation.fortnightValue}
            type="number"
            fullWidth
            InputProps={{
              readOnly: !enabledDisabled(),
              className: classesHook.textWhiteStyle,
            }}
            InputLabelProps={{
              shrink:
                contractualInformation.fortnightValue ||
                contractualInformation.fortnightValue === 0
                  ? true
                  : false,
              className: classesHook.textGreenStyle,
            }}
            onChange={onInputChangeForm}
          />
        </Grid>
        <Grid item xs={3} container justifyContent="center" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={contractualInformation.vacationProvision}
                onChange={(event) =>
                  handleChangeBoolean(event, 'vacationProvision')
                }
                disabled={!enabledDisabled()}
              />
            }
            label="Provisionar Vacaciones"
            className={classesHook.textWhiteStyle}
          />
        </Grid>
        <Grid item xs={3} container justifyContent="center" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={contractualInformation.employerIESS}
                onChange={(event) => handleChangeBoolean(event, 'employerIESS')}
                disabled={!enabledDisabled()}
              />
            }
            label="Aporte Personal"
            className={classesHook.textWhiteStyle}
          />
        </Grid>
        <Grid item xs={3} container justifyContent="center" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={contractualInformation.employerPatronalIESS}
                onChange={(event) =>
                  handleChangeBoolean(event, 'employerPatronalIESS')
                }
                disabled={!enabledDisabled()}
              />
            }
            label="Aporte Patronal"
            className={classesHook.textWhiteStyle}
          />
        </Grid>
        <Grid item xs={3} container justifyContent="center" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={contractualInformation.fortnight}
                onChange={(event) => handleChangeBoolean(event, 'fortnight')}
                disabled={!enabledDisabled()}
              />
            }
            label="Recibe Quincena"
            className={classesHook.textWhiteStyle}
          />
        </Grid>
        <Grid item xs={6} container alignItems="center">
          <Typography
            className={classesHook.textWhiteStyle}
            sx={{ mr: 3 }}
            style={{ fontWeight: 'bold' }}
          >
            Décimo Tercer:
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={!contractualInformation.accumulatedThirteenth}
                onChange={(event) =>
                  handleChangeBoolean(event, 'accumulatedThirteenth')
                }
                disabled={!enabledDisabled()}
              />
            }
            label="Mensual"
            className={classesHook.textWhiteStyle}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={contractualInformation.accumulatedThirteenth}
                onChange={(event) =>
                  handleChangeBoolean(event, 'accumulatedThirteenth')
                }
                disabled={!enabledDisabled()}
              />
            }
            label="Acumulado"
            className={classesHook.textWhiteStyle}
          />
        </Grid>

        <Grid item xs={6} container alignItems="center">
          <Typography
            className={classesHook.textWhiteStyle}
            sx={{ mr: 3 }}
            style={{ fontWeight: 'bold' }}
          >
            Fondo Reserva IESS:
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  !contractualInformation.accumulatedReserveFundsEmployee
                }
                onChange={(event) =>
                  handleChangeBoolean(event, 'accumulatedReserveFundsEmployee')
                }
                disabled={!enabledDisabled()}
              />
            }
            label="Mensual"
            className={classesHook.textWhiteStyle}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={contractualInformation.accumulatedReserveFundsEmployee}
                onChange={(event) =>
                  handleChangeBoolean(event, 'accumulatedReserveFundsEmployee')
                }
                disabled={!enabledDisabled()}
              />
            }
            label="Acumulado"
            className={classesHook.textWhiteStyle}
          />
        </Grid>
        <Grid item xs={6} container alignItems="center">
          <Typography
            className={classesHook.textWhiteStyle}
            sx={{ mr: 3 }}
            style={{ fontWeight: 'bold' }}
          >
            Décimo Cuarto:
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={!contractualInformation.accumulatedFourteenth}
                onChange={(event) =>
                  handleChangeBoolean(event, 'accumulatedFourteenth')
                }
                disabled={!enabledDisabled()}
              />
            }
            label="Mensual"
            className={classesHook.textWhiteStyle}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={contractualInformation.accumulatedFourteenth}
                onChange={(event) =>
                  handleChangeBoolean(event, 'accumulatedFourteenth')
                }
                disabled={!enabledDisabled()}
              />
            }
            label="Acumulado"
            className={classesHook.textWhiteStyle}
          />
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 3 }}
      >
        {createMode ? (
          <>
            <Button
              startIcon={<DoneAll />}
              onClick={() => setOpen(true)}
              // disabled={!enableNextPage}
              sx={{ margin: 2 }}
            >
              {'Finalizar'}
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogContent>
                <Alert severity="info" icon={<Info />}>
                  <AlertTitle sx={{ fontWeight: 'bold' }}>Atención</AlertTitle>
                  Los datos no se podrán modificar después de continuar. ¿Estás
                  seguro de que deseas guardar el nuevo empleado?
                </Alert>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)} color="primary">
                  Cancelar
                </Button>
                <Button onClick={() => setSaveNew(true)} color="primary">
                  Confirmar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <>
            <Button
              startIcon={editMode ? <SaveIcon /> : <EditIcon />}
              onClick={editMode ? handleSaveClick : handleEditClick}
              sx={{ margin: 2 }}
              variant="contained"
            >
              {editMode ? 'Guardar' : 'Editar'}
            </Button>

            {editMode && (
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancelClick}
                sx={{ margin: 2 }}
                variant="contained"
              >
                Cancelar
              </Button>
            )}
          </>
        )}
      </Grid>
    </CardLayout>
  );
};
