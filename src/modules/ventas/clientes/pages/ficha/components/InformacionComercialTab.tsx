"use client";
import {
  FormState,
  StyledDatePicker,
  useComunAsync,
  useClienteAsync,
  useStyles,
} from "@/hooks";
import { ClientCategoryType, SucursalType, UserType } from "@/types";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Autocomplete, Grid, TextField } from "@mui/material";
import { TabPanel } from "@/functions";
import { parseISO } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type InformacionComercialTabProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  formErrors: FormState;
  setFormErrors: React.Dispatch<React.SetStateAction<FormState>>;
  tabIndex: number;
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
  onDateChange: (value: Date, name: string) => void;
  onInputNumberChange: (value: number, name: string) => void;
  allowViewComponent: boolean;
  onInputChangeDiscountPorcentage: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
};

export const InformacionComercialTab: React.FC<
  InformacionComercialTabProps
> = ({
  formState,
  setFormState,
  createMode,
  formErrors,
  setFormErrors,
  editMode,
  tabIndex,
  onAutocompleteChange,
  onInputChange,
  onDateChange,
  onInputChangeDiscountPorcentage,
  allowViewComponent,
}) => {
  const styles = useStyles();

  const { fetchGetClientCategoryList } = useClienteAsync();
  const { fetchBranchById, fetchGetUserById } = useComunAsync();
  const [branchName, setBranchName] = useState<string>("");
  const [modificationUser, setModificationUser] = useState<UserType>();
  const [clientCategoryTypeList, setClientCategoryTypeList] = useState<
    ClientCategoryType[]
  >([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const setData = async () => {
      try {
        const responseClientCategory = await fetchGetClientCategoryList();
        if (responseClientCategory) {
          const dto = responseClientCategory as ClientCategoryType[];
          setClientCategoryTypeList(dto);
        }
        if (createMode && user && user.branchId !== null) {
          const responseBranch = await fetchBranchById(user.branchId);
          if (responseBranch) {
            const dto = responseBranch as SucursalType;
            setBranchName(dto.name);
          }
        } else {
          const responseUser = await fetchGetUserById(
            formState.modificationUserId
          );
          if (responseUser) {
            const dto = responseUser as UserType;
            setModificationUser(dto);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    setData();
  }, []);

  useEffect(() => {
    const setData = async () => {
      if (modificationUser && modificationUser.branchId !== null) {
        const responseBranch = await fetchBranchById(modificationUser.branchId);
        if (responseBranch) {
          setBranchName(responseBranch.name);
        }
      }
    };
    setData();
  }, [modificationUser]);

  return (
    <>
      <TabPanel value={tabIndex} index={allowViewComponent ? 0 : 1}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={9}>
                <Autocomplete
                  className={styles.genericFieldStyle}
                  options={clientCategoryTypeList}
                  readOnly={!createMode && !editMode}
                  getOptionLabel={(option) => option.clientCategoryName}
                  style={{ width: "100%" }}
                  onChange={(event, value) => {
                    onAutocompleteChange(
                      event,
                      "clientCategoryId",
                      value?.clientCategoryId
                    );
                    if (value !== null) {
                      setFormState((prevState: any) => ({
                        ...prevState,
                        clientCategoryId: value.clientCategoryId,
                        clientDiscount: value.clientCategoryDiscount,
                      }));
                      setFormErrors({
                        ...formErrors,
                      });
                    }
                  }}
                  value={
                    formState.clientCategoryId !== null
                      ? clientCategoryTypeList.find(
                          (maritalStatus) =>
                            maritalStatus.clientCategoryId ===
                            formState.clientCategoryId
                        )
                      : null
                  }
                  isOptionEqualToValue={(
                    option: ClientCategoryType,
                    value: ClientCategoryType
                  ) =>
                    option && value
                      ? option.clientCategoryId === value.clientCategoryId
                      : false
                  }
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Clasificación Cliente"
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
              <Grid item xs={3}>
                <TextField
                  name="clientDiscount"
                  label="Descuento Clasificación"
                  type="number"
                  value={formState.clientDiscount}
                  onChange={onInputChangeDiscountPorcentage}
                  InputProps={{
                    endAdornment: "%",
                    readOnly: !createMode && !editMode,
                  }}
                  inputProps={{
                    style: { textTransform: "uppercase", textAlign: "right" },
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.clientDiscount !== "" &&
                      formState.clientDiscount != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
                {formState.clientDiscount != null &&
                formErrors.clientDiscount != ""
                  ? formErrors && (
                      <p style={{ color: "cornsilk" }}>
                        {formErrors.clientDiscount}
                      </p>
                    )
                  : null}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={3}>
                <TextField
                  name="specialDiscount"
                  label="Descuento Especial"
                  type="number"
                  value={formState.specialDiscount}
                  onChange={onInputChangeDiscountPorcentage}
                  InputProps={{
                    endAdornment: "%",
                    readOnly: !createMode && !editMode,
                  }}
                  inputProps={{
                    style: { textTransform: "uppercase", textAlign: "right" },
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.specialDiscount !== "" &&
                      formState.specialDiscount != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
                {formState.specialDiscount != null &&
                formErrors.specialDiscount != ""
                  ? formErrors && (
                      <p style={{ color: "cornsilk" }}>
                        {formErrors.specialDiscount}
                      </p>
                    )
                  : null}
              </Grid>
              <Grid item xs={9}>
                <StyledDatePicker
                  label="Fecha Vencimiento"
                  views={["year", "month", "day"]}
                  minDate={new Date()}
                  maxDate={
                    new Date(
                      new Date().getFullYear() + 5,
                      new Date().getMonth(),
                      new Date().getDate()
                    )
                  }
                  format="dd/MM/yyyy"
                  value={
                    typeof formState.discountExpirationDate === "string"
                      ? parseISO(formState.discountExpirationDate)
                      : formState.discountExpirationDate
                  }
                  onChange={(value) => {
                    onDateChange(value as Date, "discountExpirationDate");
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
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="discountObservation"
              label="Observación"
              value={formState.discountObservation}
              onChange={onInputChange}
              InputProps={{
                readOnly: !createMode && !editMode,
              }}
              inputProps={{ style: { textTransform: "uppercase" } }}
              InputLabelProps={{
                shrink:
                  formState.discountObservation !== "" &&
                  formState.discountObservation != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Sucursal"
              value={branchName}
              onChange={onInputChange}
              InputProps={{
                readOnly: true,
              }}
              inputProps={{ style: { textTransform: "uppercase" } }}
              fullWidth
            />
          </Grid>
        </Grid>
      </TabPanel>
    </>
  );
};
