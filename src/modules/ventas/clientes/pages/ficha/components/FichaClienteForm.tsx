"use client";
import { FormState, StyledDatePicker, useComunAsync, useStyles } from "@/hooks";
import {
  CityType,
  GenderType,
  MaritalStatusType,
  PaisType,
  ParroquiaType,
  ProvinceType,
  RegimenFiscalType,
  TipoContribuyenteType,
  UserType,
} from "@/types";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  TextField,
  Tooltip,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { getIdentificacionRepetidaCliente } from "@/backend";
import { ClienteEnum, ProveedorEnum } from "@/enums";
import { validateCedulaRuc } from "@/functions";
import { ToggleOff, ToggleOn } from "@mui/icons-material";
import { parseISO } from "date-fns";
import dayjs from "dayjs";

type FichaClienteFormProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  setCreateMode: React.Dispatch<React.SetStateAction<boolean>>;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
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
  onValidacionRazonNombreComerial: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  formErrors: FormState;
  onValidarCorreo: (event: ChangeEvent<HTMLInputElement>) => void;
  onBooleanChangeClick: (name: string, value: boolean) => void;
  onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (value: Date, name: string) => void;
};

export const FichaClienteForm: React.FC<FichaClienteFormProps> = ({
  formState,
  setFormState,
  formErrors,
  createMode,
  setCreateMode,
  editMode,
  setEditMode,
  onAutocompleteChange,
  onInputChange,
  onValidacionRazonNombreComerial,
  onValidarCorreo,
  onBooleanChangeClick,
  onInputJustNumber,
  onDateChange,
}) => {
  const styles = useStyles();

  const [regimenFiscalList, setRegimenFiscalList] = useState<
    RegimenFiscalType[]
  >([]);
  const [error, setError] = useState({ personIdentification: "" });
  const [enabledidentificacionfis, setEnabledidentificacionfis] =
    useState<boolean>(false);
  const {
    fetchContribuyenteList,
    fetchPaisList,
    fetchRegimenFiscalList,
    fetchGenderList,
    fetchEstadoCivilList,
    fetchSalesUsersList,
    fetchCityByProvinceId,
    fetchProvincesByCountryId, 
    fetchParishesByCityId,
  } = useComunAsync();
  const { enqueueSnackbar } = useSnackbar();
  const [maxLen, setMaxLen] = useState(10);
  const [paisList, setPaisList] = useState<PaisType[]>([]);
  const [parroquiaList, setParroquiaList] = useState<ParroquiaType[]>([]);
  const [contribuyenteList, setContribuyenteList] = useState<
    TipoContribuyenteType[]
  >([]);
  const [genderList, setGenderList] = useState<GenderType[]>([]);
  const [maritalStatusList, setMaritalStatusList] = useState<
    MaritalStatusType[]
  >([]);
  const [salesUserList, setSalesUserList] = useState<UserType[]>([]);
  const [provinceList, setProvinceList] = useState<ProvinceType[]>([]);
  const [cityList, setCityList] = useState<CityType[]>([]);
  const [originalCreateMode, setOriginalCreateMode] = useState(false);
  const [originalEditMode, setOriginalEditMode] = useState(false);
  const [enableProv, setEnableProv] = useState(true);
  const [enableCity, setEnableCity] = useState(false);
  const [enableParish, setEnableParish] = useState(false);

  const nombreComercial = async () => {
    setFormState((prevState) => ({
      ...prevState,
      personName: formState.personName,
    }));
  };

  const validarExistenciaIdentCI = async () => {
    const response = await getIdentificacionRepetidaCliente(
      formState.personIdentification
    );
    if (response?.status === 409) {
      const mensajeError = response.message;
      enqueueSnackbar(
        <>{mensajeError.message + formState.personIdentification}</>,
        {
          variant: "error",
        }
      );
      setError({
        ...error,
        personIdentification: "Ya existe un cliente con esta identificación",
      });
      setEditMode(false);
      setCreateMode(false);
    } else {
      setError({
        ...error,
        [formState.personIdentification]: "",
      });
      setEditMode(originalEditMode);
      setCreateMode(originalCreateMode);
    }
  };

  const validarNumeroIdentificacion = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const name = event.target.name;
    // Expresión regular que solo permite letras y números
    const ciRuc = /^[0-9\s]*$/;
    const passport = /^[a-zA-z0-9\s]*$/;
    let valueForm = 0;
    if (formState.personIdentification === formState[name]) {
      valueForm = parseInt(formState.fiscalTypeId, 10);
    }
    if (valueForm === parseInt(ClienteEnum.RUC, 10)) {
      setMaxLen(13);
      if (ciRuc.test(value)) {
        if (value.length == 13) {
          if (validateCedulaRuc(value)) {
            setFormState({
              ...formState,
              [name]: value,
            });
            enqueueSnackbar(<>{"RUC Correcto"}</>, {
              variant: "success",
            });
          } else {
            setFormState({
              ...formState,
              [name]: value,
            });
            enqueueSnackbar(<>{"RUC Incorrecto"}</>, {
              variant: "error",
            });
          }
          setError({
            ...error,
            [name]: "",
          });
        } else {
          setFormState({
            ...formState,
            [name]: value,
          });
          setError({
            ...error,
            [name]: "El número de caracteres tiene que ser igual a 13",
          });
        }
      }
    } else if (valueForm === parseInt(ClienteEnum.CEDULA, 10)) {
      setMaxLen(10);
      if (ciRuc.test(value)) {
        if (value.length == 10) {
          if (validateCedulaRuc(value)) {
            setFormState({
              ...formState,
              [name]: value,
            });
            enqueueSnackbar(<>{"Cédula Correcta"}</>, {
              variant: "success",
            });
          } else {
            setFormState({
              ...formState,
              [name]: value,
            });
            enqueueSnackbar(<>{"Cédula Incorrecta"}</>, {
              variant: "error",
            });
          }
          setError({
            ...error,
            [name]: "",
          });
        } else {
          setFormState({
            ...formState,
            [name]: value,
          });
          setError({
            ...error,
            [name]: "El número de caracteres tiene que ser igual a 10",
          });
        }
      }
    } else if (
      valueForm === parseInt(ClienteEnum.PASAPORTE_IDENTIFICACION, 10)
    ) {
      if (passport.test(value)) {
        setMaxLen(13);
        if (value.length == 13) {
          setFormState({
            ...formState,
            [name]: value,
          });
          setError({
            ...error,
            [name]: "",
          });
        } else {
          setFormState({
            ...formState,
            [name]: value,
          });
          setError({
            ...error,
            [name]: "El número de caracteres tiene que ser igual a 13",
          });
        }
      }
    } else {
      setFormState({
        ...formState,
        [name]: value,
      });
      setError({
        ...error,
        [name]: "El número de caracteres tiene que ser igual a 13",
      });
    }
  };

  useEffect(() => {
    const searchCity = async () => {
      const responseCityList = await fetchCityByProvinceId(
        formState.provinceId
      );
      if (responseCityList) {
        const dto = responseCityList as CityType[];
        setCityList(dto);
        setEnableCity(true);
      }
    };
    if (formState.provinceId !== null) {
      searchCity();
    } else {
      setEnableCity(false);
      setEnableParish(false);
      setFormState((prevState: any) => ({
        ...prevState,
        cityName: "",
        parishName: "",
        parishId: null,
        cityId: null,
      }));
    }
  }, [formState.provinceId]);

  useEffect(() => {
    const searchParish = async () => {
      const responseParroquiaList = await fetchParishesByCityId(
        formState.cityId
      );
      if (responseParroquiaList) {
        const dto = responseParroquiaList as ParroquiaType[];
        setParroquiaList(dto);
        setEnableParish(true);
      }
    };
    if (formState.cityId !== null && formState.cityId !== undefined) {
      searchParish();
    } else {
      setEnableParish(false);
      setFormState((prevState: any) => ({
        ...prevState,
        parishName: "",
        parishId: null,
      }));
    }
  }, [formState.cityId]);

  useEffect(() => {
    const setData = async () => {
      try {
        const responseContribuyenteList = await fetchContribuyenteList();
        if (responseContribuyenteList) {
          const dto = responseContribuyenteList as TipoContribuyenteType[];
          setContribuyenteList(dto);
        }
        const responsePaisList = await fetchPaisList();
        if (responsePaisList) {
          const dto = responsePaisList as PaisType[];
          setPaisList(dto);
        }

        const responseProvinceList = await fetchProvincesByCountryId(
          ProveedorEnum.ECUADOR
        );
        if (responseProvinceList) {
          const dto = responseProvinceList as ProvinceType[];
          setProvinceList(dto);
        }
        const responseRegimenFiscalList = await fetchRegimenFiscalList();
        if (responseRegimenFiscalList) {
          const dto = responseRegimenFiscalList as RegimenFiscalType[];
          setRegimenFiscalList(dto);
        }
        const responseGenderList = await fetchGenderList();
        if (responseGenderList) {
          const dto = responseGenderList as GenderType[];
          setGenderList(dto);
        }

        const responseMaritalStatusList = await fetchEstadoCivilList();
        if (responseMaritalStatusList) {
          const dto = responseMaritalStatusList as MaritalStatusType[];
          setMaritalStatusList(dto);
        }

        const responseSalesUserList = await fetchSalesUsersList();
        if (responseSalesUserList) {
          const dto = responseSalesUserList as UserType[];
          setSalesUserList(dto);
        }
        setOriginalCreateMode(createMode);
        setOriginalEditMode(editMode);
      } catch (error) {
        console.error(error);
      }
    };
    setData();
  }, []);

  useEffect(() => {
    if (error.personIdentification != "") {
      setEditMode(false);
      setCreateMode(false);
    } else {
      setEditMode(originalEditMode);
      setCreateMode(originalCreateMode);
    }
  }, [formState.personIdentification]);

  useEffect(() => {
    if (createMode) {
      setFormState((prevState: any) => ({
        ...prevState,
        clientCommercialName: formState.personName,
      }));
    }
  }, [formState.personName]);

  return (
    <>
      <Box sx={{ width: "100%", bgcolor: "background.paper", mb: 2 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={regimenFiscalList}
                    readOnly={!createMode && !editMode}
                    getOptionLabel={(option) =>
                      option.fiscalIdentificationTypeName
                    }
                    style={{ width: "100%" }}
                    onChange={(event, value) => {
                      onAutocompleteChange(
                        event,
                        "fiscalTypeId",
                        value?.fiscalIdentificationTypeId
                      );
                      if (value !== null) {
                        setFormState((prevState: any) => ({
                          ...prevState,
                          fiscalIdentificationTypeId:
                            value.fiscalIdentificationTypeId,
                          personIdentification: "",
                        }));
                        setError({
                          ...error,
                          personIdentification: "",
                        });
                        setEnabledidentificacionfis(true);
                      } else {
                        setEnabledidentificacionfis(false);
                      }
                    }}
                    value={
                      formState.fiscalIdentificationTypeId !== null
                        ? regimenFiscalList.find(
                            (regimen) =>
                              regimen.fiscalIdentificationTypeId ===
                              formState.fiscalIdentificationTypeId
                          )
                        : null
                    }
                    filterOptions={(options) => {
                      return options.filter((option) =>
                        option.fiscalIdentificationTypeTransaction.includes(
                          "VENTA"
                        )
                      );
                    }}
                    isOptionEqualToValue={(
                      option: RegimenFiscalType,
                      value: RegimenFiscalType
                    ) =>
                      option && value
                        ? option.fiscalIdentificationTypeId ===
                          value.fiscalIdentificationTypeId
                        : false
                    }
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Régimen Fiscal"
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
                <Grid item xs={12}>
                  <TextField
                    required={true}
                    name="personIdentification"
                    disabled={!enabledidentificacionfis}
                    label="Número de Identificación"
                    value={formState.personIdentification}
                    onChange={validarNumeroIdentificacion}
                    onBlur={validarExistenciaIdentCI}
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      maxLength: maxLen,
                    }}
                    InputLabelProps={{
                      shrink:
                        formState.personIdentification !== "" &&
                        formState.personIdentification != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                  {formState.personIdentification != null &&
                  error.personIdentification != ""
                    ? error && (
                        <p style={{ color: "cornsilk" }}>
                          {error.personIdentification}
                        </p>
                      )
                    : null}
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={paisList}
                    readOnly={!createMode && !editMode}
                    getOptionLabel={(option) => option.countryName}
                    style={{ width: "100%" }}
                    onChange={(event, value) => {
                      onAutocompleteChange(
                        event,
                        "countryId",
                        value?.countryId
                      );
                      if (value?.countryId === ProveedorEnum.ECUADOR) {
                        setEnableProv(true);
                      } else {
                        setEnableProv(false);
                        setEnableCity(false);
                        setEnableParish(false);
                        setFormState((prevState: any) => ({
                          ...prevState,
                          provinceName: "",
                          cityName: "",
                          parishName: "",
                          parishId: null,
                          cityId: null,
                          provinceId: null,
                        }));
                      }
                    }}
                    value={
                      (formState.countryId !== null
                        ? paisList.find(
                            (pais) => pais.countryId === formState.countryId
                          )
                        : null) || null
                    }
                    isOptionEqualToValue={(option: PaisType, value: PaisType) =>
                      option && value ? option === value : false
                    }
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="País"
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
                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={provinceList}
                    disabled={!enableProv}
                    readOnly={!createMode && !editMode}
                    getOptionLabel={(option) => option.provinceName}
                    style={{ width: "100%" }}
                    onChange={(event, value) => {
                      onAutocompleteChange(
                        event,
                        "provinceId",
                        value?.provinceId
                      );
                    }}
                    value={
                      (formState.provinceId !== null
                        ? provinceList.find(
                            (province) =>
                              province.provinceId === formState.provinceId
                          )
                        : null) || null
                    }
                    isOptionEqualToValue={(
                      option: ProvinceType,
                      value: ProvinceType
                    ) => (option && value ? option === value : false)}
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Provincia"
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
                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    disabled={!enableCity}
                    options={cityList}
                    readOnly={!createMode && !editMode}
                    getOptionLabel={(option) => option.cityName}
                    style={{ width: "100%" }}
                    onChange={(event, value) => {
                      onAutocompleteChange(event, "cityId", value?.cityId);
                    }}
                    value={
                      (formState.cityId !== null
                        ? cityList.find(
                            (city) => city.cityId === formState.cityId
                          )
                        : null) || null
                    }
                    isOptionEqualToValue={(option: CityType, value: CityType) =>
                      option && value ? option === value : false
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
                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    disabled={!enableParish}
                    options={parroquiaList}
                    readOnly={!createMode && !editMode}
                    getOptionLabel={(option) => option.parishName}
                    style={{ width: "100%" }}
                    onChange={(event, value) => {
                      onAutocompleteChange(event, "parishId", value?.parishId);
                    }}
                    value={
                      formState.parishId !== null
                        ? parroquiaList.find(
                            (parroquia) =>
                              parroquia.parishId === formState.parishId
                          )
                        : null
                    }
                    isOptionEqualToValue={(
                      option: ParroquiaType,
                      value: ParroquiaType
                    ) => (option && value ? option === value : false)}
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Parroquia"
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
                <Grid item xs={12}>
                  <TextField
                    required={true}
                    name="personAddress"
                    label="Dirección"
                    value={formState.personAddress}
                    onChange={onInputChange}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    InputLabelProps={{
                      shrink:
                        formState.personAddress !== "" &&
                        formState.personAddress != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                  {formErrors.personAddress != ""
                    ? formErrors.personAddress && (
                        <p style={{ color: "cornsilk" }}>
                          {formErrors.personAddress}
                        </p>
                      )
                    : null}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    required={true}
                    name="personName"
                    label="Razón Social"
                    value={formState.personName}
                    onBlur={nombreComercial}
                    onChange={onValidacionRazonNombreComerial}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      maxLength: 500,
                    }}
                    InputLabelProps={{
                      shrink:
                        formState.personName !== "" &&
                        formState.personName != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                  {formErrors != null
                    ? formErrors.personName && (
                        <p style={{ color: "cornsilk" }}>
                          {formErrors.personName}
                        </p>
                      )
                    : null}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required={true}
                    name="clientCommercialName"
                    label="Nombre Comercial"
                    value={formState.clientCommercialName}
                    onChange={onValidacionRazonNombreComerial}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      maxLength: 500,
                    }}
                    InputLabelProps={{
                      shrink:
                        formState.clientCommercialName !== "" &&
                        formState.clientCommercialName != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                  {formErrors != null
                    ? formErrors.clientCommercialName && (
                        <p style={{ color: "cornsilk" }}>
                          {formErrors.clientCommercialName}
                        </p>
                      )
                    : null}
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={contribuyenteList}
                    readOnly={!createMode && !editMode}
                    getOptionLabel={(option) => option.contributorTypeName}
                    style={{ width: "100%" }}
                    onChange={(event, value) => {
                      onAutocompleteChange(
                        event,
                        "contributorTypeId",
                        value?.contributorTypeId
                      );
                      if (value !== null) {
                        setFormState((prevState: any) => ({
                          ...prevState,
                          contributorTypeId: value.contributorTypeId,
                        }));
                        setError({
                          ...error,
                        });
                      }
                    }}
                    value={
                      formState.contributorTypeId !== null
                        ? contribuyenteList.find(
                            (contribuyente) =>
                              contribuyente.contributorTypeId ===
                              formState.contributorTypeId
                          )
                        : null
                    }
                    isOptionEqualToValue={(
                      option: TipoContribuyenteType,
                      value: TipoContribuyenteType
                    ) =>
                      option && value
                        ? option.contributorTypeId === value.contributorTypeId
                        : false
                    }
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo Contribuyente"
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
                <Grid item xs={12}>
                  <TextField
                    required={true}
                    name="personEmail"
                    label="Correo Fiscal"
                    value={formState.personEmail}
                    onChange={onValidarCorreo}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    InputLabelProps={{
                      shrink:
                        formState.personEmail !== "" &&
                        formState.personEmail != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                  {formState.personEmail != null && formErrors.personEmail != ""
                    ? formErrors.personEmail && (
                        <p style={{ color: "cornsilk" }}>
                          {formErrors.personEmail}
                        </p>
                      )
                    : null}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required={true}
                    name="clientContactCellphone"
                    label="Celular"
                    value={formState.clientContactCellphone}
                    onChange={onInputJustNumber}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      maxLength: 10,
                    }}
                    InputLabelProps={{
                      shrink:
                        formState.clientContactCellphone !== "" &&
                        formState.clientContactCellphone != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                  {formState.clientContactCellphone != null &&
                  formErrors.clientContactCellphone != ""
                    ? formErrors.clientContactCellphone && (
                        <p style={{ color: "cornsilk" }}>
                          {formErrors.clientContactCellphone}
                        </p>
                      )
                    : null}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="personPhone"
                    label="Teléfono"
                    value={formState.personPhone}
                    onChange={onInputJustNumber}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      maxLength: 10,
                    }}
                    InputLabelProps={{
                      shrink:
                        formState.personPhone !== "" &&
                        formState.personPhone != null
                          ? true
                          : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    options={genderList}
                    readOnly={!createMode && !editMode}
                    getOptionLabel={(option) => option.genderName}
                    style={{ width: "100%" }}
                    onChange={(event, value) => {
                      onAutocompleteChange(event, "genderId", value?.genderId);
                      if (value !== null) {
                        setFormState((prevState: any) => ({
                          ...prevState,
                          genderId: value.genderId,
                        }));
                        setError({
                          ...error,
                        });
                      }
                    }}
                    value={
                      formState.genderId !== null
                        ? genderList.find(
                            (gender) => gender.genderId === formState.genderId
                          )
                        : null
                    }
                    isOptionEqualToValue={(
                      option: GenderType,
                      value: GenderType
                    ) =>
                      option && value
                        ? option.genderId === value.genderId
                        : false
                    }
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Género"
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
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={3.6}>
                  <Tooltip title="Estado Del Cliente">
                    <span>
                      <Button
                        startIcon={
                          formState.clientStatus ? <ToggleOn /> : <ToggleOff />
                        }
                        onClick={() => {
                          onBooleanChangeClick(
                            "clientStatus",
                            !formState.clientStatus
                          );
                          if (!formState.clientStatus === false) {
                            enqueueSnackbar(
                              <>
                                {
                                  "El cliente se encuentra inactivo, no se permite editar"
                                }
                              </>,
                              {
                                variant: "info",
                              }
                            );
                            setEditMode(false);
                            setCreateMode(false);
                          } else {
                            setEditMode(originalEditMode);
                            setCreateMode(originalCreateMode);
                            enqueueSnackbar(<>{"Puede editar al cliente"}</>, {
                              variant: "info",
                            });
                          }
                        }}
                        style={{ width: "100%", height: 35 }}>
                        {formState.clientStatus ? "Activo" : "Inactivo"}
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
                <Grid item xs={4.2}>
                  <StyledDatePicker
                    label="Fecha Registro"
                    views={["year", "month", "day"]}
                    defaultValue={new Date()}
                    format="dd/MM/yyyy"
                    value={
                      typeof formState.registrationDate === "string"
                        ? parseISO(formState.registrationDate)
                        : new Date()
                    }
                    onChange={(value) => {
                      const newDate = dayjs(value as Date).toDate();
                      onDateChange(value as Date, "registrationDate");
                      onDateChange(newDate, "registrationDate");
                    }}
                    readOnly={true}
                    slotProps={{
                      textField: {
                        className: styles.genericFieldStyle,
                        sx: {
                          minWidth: "100%",
                        },
                        InputProps: {
                          className: styles.textWhiteStyle,
                        },
                        InputLabelProps: {
                          className: styles.textGreenStyle,
                          shrink: true,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={4.2}>
                  <StyledDatePicker
                    label="Fecha Modificación"
                    views={["year", "month", "day"]}
                    defaultValue={new Date()}
                    format="dd/MM/yyyy"
                    value={
                      typeof formState.modificationDate === "string"
                        ? parseISO(formState.modificationDate)
                        : new Date()
                    }
                    onChange={(value) => {
                      const newDate = dayjs(value as Date).toDate();
                      onDateChange(value as Date, "modificationDate");
                      onDateChange(newDate, "modificationDate");
                    }}
                    readOnly={true}
                    slotProps={{
                      textField: {
                        className: styles.genericFieldStyle,
                        sx: {
                          minWidth: "100%",
                        },
                        InputProps: {
                          className: styles.textWhiteStyle,
                        },
                        InputLabelProps: {
                          className: styles.textGreenStyle,
                          shrink: true,
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} mt={2}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={maritalStatusList}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) => option.maritalStatusName}
                  style={{ width: "100%" }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      "maritalStatusId",
                      value?.maritalStatusId
                    );
                    if (value !== null) {
                      setFormState((prevState: any) => ({
                        ...prevState,
                        maritalStatusId: value.maritalStatusId,
                      }));
                      setError({
                        ...error,
                      });
                    }
                  }}
                  value={
                    formState.maritalStatusId !== null
                      ? maritalStatusList.find(
                          (maritalStatus) =>
                            maritalStatus.maritalStatusId ===
                            formState.maritalStatusId
                        )
                      : null
                  }
                  isOptionEqualToValue={(
                    option: MaritalStatusType,
                    value: MaritalStatusType
                  ) =>
                    option && value
                      ? option.maritalStatusId === value.maritalStatusId
                      : false
                  }
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Estado Civil"
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
              <Grid item xs={12} mt={2}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={salesUserList}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) => option.nick}
                  style={{ width: "100%" }}
                  onChange={(event, value) => {
                    onAutocompleteChange(event, "salesUserId", value?.userId);
                    if (value !== null) {
                      setFormState((prevState: any) => ({
                        ...prevState,
                        salesUserId: value.userId,
                      }));
                      setError({
                        ...error,
                      });
                    }
                  }}
                  value={
                    formState.salesUserId !== null
                      ? salesUserList.find(
                          (salesUser) =>
                            salesUser.userId === formState.salesUserId
                        )
                      : null
                  }
                  isOptionEqualToValue={(option: UserType, value: UserType) =>
                    option && value ? option.userId === value.userId : false
                  }
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Vendedor"
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

              <Grid item xs={12} mt={2}>
                <StyledDatePicker
                  label="Fecha Nacimiento"
                  views={["year", "month", "day"]}
                  maxDate={new Date()}
                  format="dd/MM/yyyy"
                  value={
                    typeof formState.personBirthDate === "string"
                      ? parseISO(formState.personBirthDate)
                      : formState.personBirthDate
                  }
                  onChange={(value) => {
                    const newDate = dayjs(value as Date).toDate();
                    onDateChange(value as Date, "personBirthDate");
                    onDateChange(newDate, "personBirthDate");
                  }}
                  readOnly={!createMode && !editMode}
                  slotProps={{
                    textField: {
                      className: styles.genericFieldStyle,
                      sx: {
                        minWidth: "100%",
                      },
                      InputProps: {
                        className: styles.textWhiteStyle,
                      },
                      InputLabelProps: {
                        className: styles.textGreenStyle,
                        shrink: true,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} mt={2}>
                <TextField
                  name="plate"
                  label="Placa"
                  value={formState.plate}
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode && !editMode,
                  }}
                  inputProps={{
                    style: { textTransform: "uppercase" },
                    maxLength: 7,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.plate !== "" && formState.plate != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} mb={13.2}></Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};
