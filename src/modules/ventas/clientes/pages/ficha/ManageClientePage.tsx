import { CountryEnum, DocumentTypeEnum, PathEnum } from "@/enums";
import {
  useAccessDocument,
  useAllowTba,
  useClienteAsync,
  useForm,
  useStyles,
} from "@/hooks";
import { CardLayout, CustomDialog } from "@/modules/layout";
import { RootState } from "@/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { isEqual } from "lodash";
import { setHeader } from "./components/SubmitFunctions";
import { SubmitButtons } from "./components/SubmitButtons";
import { FichaClienteForm } from "./components/FichaClienteForm";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ClientPersonCreditPostType,
  DetailStatementAccountClientType,
} from "@/types";
import React from "react";
import { InformacionComercialTab } from "./components/InformacionComercialTab";
import { AlertasTab } from "./components/AlertasTab";
import { CreditoTab } from "./components/CreditoTab";
import { ImpuestosTab } from "./components/ImpuestosTab";
import { ContabilidadTab } from "./components/ContabilidadTab";
import { EstadoCuentaTab } from "./components/EstadoCuentaTab";
import { ExcepcionesTab } from "./components/Excepciones";
import { HistorialTab } from "./components/HistorialTab";
import { MenuTab } from "./components/MenuTab";
import { MenuClientEnum } from "./components/MenuClientEnum";
import { GridRowsProp } from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";

type ManageClienteProps = {};

const initialFormState = {
  personId: null,
  contributorTypeId: null,
  countryId: CountryEnum.ECUADOR,
  parishId: null,
  maritalStatusId: null,
  genderId: null,
  taxIdentificationId: null,
  personIdentification: "",
  personName: "",
  personBirthDate: null,
  personAddress: "",
  personCellphone: "",
  personPhone: "",
  personEmail: "",
  isClient: true,
  isEmployee: false,
  isSupplier: false,
  personRegistrationDate: null,
  personResidenceNeighborhood: "",
  personResidenceCity: "",
  personResidenceParish: "",
  personResidenceSector: "",
  clientCategoryId: 1,
  incomeOriginId: null,
  fiscalIdentificationTypeId: null,
  accountId: null,
  clientCommercialName: "",
  clientAddress2: "",
  clientEmail2: "",
  clientCellphone2: "",
  clientPhone2: "",
  clientBalance: null,
  clientContact: "",
  clientContactPosition: "",
  clientContactPhone: "",
  clientContactEmail: "",
  clientContactCellphone: "",
  specialDiscount: 0,
  discountExpirationDate: null,
  discountObservation: "",
  generalAlert: "",
  billingAlert: "",
  collectionAlert: "",
  clientUnlockCode: "",
  clientChangeNumber: 0,
  clientInactiveReason: "",
  clientStatus: true,
  salesUserId: null,
  clientCashInvoice: true,
  specialCategory: "",
  clientPolicy: "",
  clientDiscount: 0,
  ivaRetentionId: null,
  sourceRetentionId: null,
  creditClientId: null,
  clientId: null,
  authorizedCreditLimit: 0,
  availableCreditLimit: 0,
  usedCreditLimit: 0,
  guaranteeAmount: 0,
  guaranteeDate: null,
  creditDays: 0,
  creditObservation: "",
  overlimit: 0,
  overlimitExpirationDate: null,
  registrationDate: null,
  modificationDate: null,
  plate: "",
  exceptions: [],
  statementAccount: null,
};

export const ManageClientePage: React.FC<ManageClienteProps> = ({}) => {
  const [isEditable, setIsEditable] = useState(true);
  const { fetchSave, fetchGetClientById, fetchUpdate } = useClienteAsync();
  const location = useLocation();
  const clientId =
    location && location.state && location.state.clientId
      ? location.state.clientId
      : localStorage.getItem("state")
      ? JSON.parse(localStorage.getItem("state") || "").clientId || undefined
      : undefined;
  const { user } = useSelector((state: RootState) => state.auth);
  const { allowsViewClientData } = useAllowTba();
  const [allowsViewComponent, setAllowsViewComponent] = useState(false);
  const { closeDocument } = useAccessDocument();
  const [createMode, setCreateMode] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [dialogMessage] = useState("");
  const [isAnulation, setIsAnulation] = useState(false);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const prevFormState = useRef<any | undefined>(undefined);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [tabIndex, setTabIndex] = React.useState(
    MenuClientEnum.INFORMACION_COMERCIAL
  );

  const styles = useStyles();

  const [excepcionesRows, setExcepcionesRows] = useState<GridRowsProp>([]);

  const {
    formState,
    setFormState,
    onInputChange,
    onAutocompleteChange,
    onValidacionRazonNombreComerial,
    formErrors,
    setFormErrors,
    onValidarCorreo,
    onBooleanChangeClick,
    onInputJustNumber,
    onInputNumberChange,
    onDateChange,
    onBooleanChange,
    onInputChangeDiscountPorcentage,
    onInputChangeTwoDecimal,
  } = useForm(initialFormState);

  const handleCancel = () => {
    if (clientId) {
      closeDocument({
        id: clientId,
        documentType: DocumentTypeEnum.CLIENTE,
      });
    }
    navigate(PathEnum.FICHA_CLIENTE);
  };

  const thereIsChanges = useMemo(() => {
    return !isEqual(prevFormState.current, formState);
  }, [formState]);

  const validateForm = () => {
    let isValid = true;
    if (
      formErrors.clientCommercialName ||
      formState.clientCommercialName.length < 5
    ) {
      setFormErrors({
        clientCommercialName:
          "El número de carateres del nombre comercial debe ser mayor a 5",
      });
      enqueueSnackbar(
        "El número de carateres del nombre comercial debe ser mayor a 5",
        {
          variant: "error",
        }
      );
      isValid = false;
    }
    if (formErrors.personName || formState.personName.length < 5) {
      setFormErrors({
        personName:
          "El número de carateres de la razón social debe ser mayor a 5",
      });
      enqueueSnackbar(
        "El número de carateres de la razón social debe ser mayor a 5",
        {
          variant: "error",
        }
      );
      isValid = false;
    }
    if (
      formState.fiscalIdentificationTypeId === null ||
      formState.fiscalIdentificationTypeId === "" ||
      formState.fiscalIdentificationTypeId === "0"
    ) {
      enqueueSnackbar("Seleccione un tipo de Régimen Fiscal", {
        variant: "error",
      });
      isValid = false;
    }
    if (
      formState.contributorTypeId === null ||
      formState.contributorTypeId === "" ||
      formState.contributorTypeId === 0
    ) {
      enqueueSnackbar("Seleccione un tipo de contribuyente", {
        variant: "error",
      });
      isValid = false;
    }

    if (
      formErrors.personIdentification ||
      formState.personIdentification.length < 5
    ) {
      setFormErrors({
        personIdentification: "Revise la identificación",
      });
      enqueueSnackbar("Revise la identificación", {
        variant: "error",
      });
      isValid = false;
    }

    if (formErrors.personEmail || formState.personEmail.length < 5) {
      setFormErrors({
        personEmail: "Revise el correo",
      });
      enqueueSnackbar("Revise el correo", {
        variant: "error",
      });
      isValid = false;
    }
    if (
      formState.countryId === null ||
      formState.countryId === "" ||
      formState.countryId === 0
    ) {
      enqueueSnackbar("Seleccione un país", {
        variant: "error",
      });
      isValid = false;
    }
    if (
      formState.parishId === null ||
      formState.parishId === "" ||
      formState.parishId === 0
    ) {
      enqueueSnackbar("Seleccione una parroquia", {
        variant: "error",
      });
      isValid = false;
    }
    if (
      formState.genderId === null ||
      formState.genderId === "" ||
      formState.genderId === 0
    ) {
      enqueueSnackbar("Seleccione un género", {
        variant: "error",
      });
      isValid = false;
    }
    if (
      formState.maritalStatusId === null ||
      formState.maritalStatusId === "" ||
      formState.maritalStatusId === 0
    ) {
      enqueueSnackbar("Seleccione un estado civil", {
        variant: "error",
      });
      isValid = false;
    }
    if (
      formState.salesUserId === null ||
      formState.salesUserId === "" ||
      formState.salesUserId === 0
    ) {
      enqueueSnackbar("Seleccione un usuario de ventas", { variant: "error" });
      isValid = false;
    }
    if (
      formState.clientCategoryId === null ||
      formState.clientCategoryId === 0
    ) {
      enqueueSnackbar("Seleccione una clasificación de cliente", {
        variant: "error",
      });
      isValid = false;
    }
    if (formState.ivaRetentionId === null || formState.ivaRetentionId === 0) {
      enqueueSnackbar("Seleccione una retención de IVA", { variant: "error" });
      isValid = false;
    }
    if (
      formState.sourceRetentionId === null ||
      formState.sourceRetentionId === 0
    ) {
      enqueueSnackbar("Seleccione una retención de fuente", {
        variant: "error",
      });
      isValid = false;
    }

    if (
      formErrors.clientDiscount ||
      formState.clientDiscount < 0 ||
      formState.clientDiscount > 100
    ) {
      enqueueSnackbar(
        "El descuento de clasificación debe estar entre 0 y 100",
        { variant: "error" }
      );
      isValid = false;
    }

    if (
      formErrors.specialDiscount ||
      formState.specialDiscount < 0 ||
      formState.specialDiscount > 100
    ) {
      enqueueSnackbar("El descuento especial debe estar entre 0 y 100", {
        variant: "error",
      });
      isValid = false;
    }

    if (formState.personAddress === "") {
      enqueueSnackbar("Ingrese la dirección", {
        variant: "error",
      });
      setFormErrors({
        personAddress: "Ingrese la dirección",
      });
      isValid = false;
    }

    if (formState.clientContactCellphone === "") {
      enqueueSnackbar("Ingrese el número de celular", {
        variant: "error",
      });
      setFormErrors({
        clientContactCellphone: "Ingrese el número de celular",
      });
      isValid = false;
    }

    if (formState.authorizedCreditLimit > 0 && formState.creditDays == 0) {
      enqueueSnackbar("Ingrese los días de crédito", { variant: "error" });
      isValid = false;
    }

    if (
      formState.overlimit > 0 &&
      (formState.overlimitExpirationDate == null ||
        formState.overlimitExpirationDate == "")
    ) {
      enqueueSnackbar("Ingrese una fecha de vencimiento del sobre cupo", {
        variant: "error",
      });
      isValid = false;
    }

    if (
      formState.specialDiscount > 0 &&
      (formState.discountExpirationDate == null ||
        formState.discountExpirationDate == "")
    ) {
      enqueueSnackbar(
        "Ingrese una fecha de vencimiento del descuento especial",
        { variant: "error" }
      );
      isValid = false;
    }

    return isValid;
  };

  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      setFormState({
        ...formState,
      });
      return;
    }
    const header = setHeader(formState, excepcionesRows);
    try {
      const response = clientId
        ? await fetchUpdate(header, clientId)
        : await fetchSave(header);
      if (response === null || response === undefined) {
        enqueueSnackbar("No se pudo guardar", {
          variant: "error",
        });
        return;
      }
      setFormState({
        ...formState,
      });
      enqueueSnackbar("Guardado Correctamente", {
        variant: "success",
      });
      handleCancel();
      return;
    } catch (error) {
      enqueueSnackbar(`Error al guardar el proveedor: ${error}`, {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    const enable = allowsViewClientData();
    setAllowsViewComponent(enable);
  }, []);

  useEffect(() => {
    if (!clientId) {
      setCreateMode(true);
      setTitle("Nuevo Cliente");
      setIsEditable(true);
      setFormState({
        ...formState,
        creationUserId: user?.userId,
        userName: user?.userName,
        salesUserId: user?.userId,
      });
    } else {
      setCreateMode(false);
      setEditMode(false);
      const setClientData = async () => {
        const response = await fetchGetClientById(clientId);
        if (response) {
          const dto = response as ClientPersonCreditPostType;
          const details: DetailStatementAccountClientType[] =
            dto.statementAccount.detailAccountPayableStatus;
          if (Array.isArray(details) && details.length > 0) {
            const temporalRows = details.map((row) => ({
              id: randomId(),
              ...row,
            }));
            setRows(temporalRows);
          } else {
            setRows([]);
          }
          const newFormState = {
            ...dto,
          };
          setTitle("Cliente - (Modo Lectura) " + dto?.clientId);
          setFormState(newFormState);
          prevFormState.current = newFormState;
        }
      };
      setClientData();
    }
  }, [clientId]);

  return (
    <>
      <CustomDialog
        fieldName="observationClient"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.observationClient ?? ""}
        onInputChange={onInputChange}
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}>
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}>
          <FichaClienteForm
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            setCreateMode={setCreateMode}
            editMode={editMode}
            setEditMode={setEditMode}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            onValidacionRazonNombreComerial={onValidacionRazonNombreComerial}
            formErrors={formErrors}
            onValidarCorreo={onValidarCorreo}
            onBooleanChangeClick={onBooleanChangeClick}
            onInputJustNumber={onInputJustNumber}
            onDateChange={onDateChange}
          />
          <MenuTab
            tabIndex={tabIndex}
            setTabIndex={setTabIndex}
            allowViewComponent={allowsViewComponent}
          />
          <InformacionComercialTab
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            tabIndex={tabIndex}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            onDateChange={onDateChange}
            onInputNumberChange={onInputNumberChange}
            allowViewComponent={allowsViewComponent}
            onInputChangeDiscountPorcentage={onInputChangeDiscountPorcentage}
          />
          <CreditoTab
            formState={formState}
            createMode={createMode}
            editMode={editMode}
            tabIndex={tabIndex}
            onInputChange={onInputChange}
            onDateChange={onDateChange}
            onBooleanChange={onBooleanChange}
            setFormState={setFormState}
            onInputChangeTwoDecimal={onInputChangeTwoDecimal}
          />
          <AlertasTab
            formState={formState}
            createMode={createMode}
            editMode={editMode}
            tabIndex={tabIndex}
            onInputChange={onInputChange}
          />
          <ImpuestosTab
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            tabIndex={tabIndex}
            onAutocompleteChange={onAutocompleteChange}
            allowViewComponent={allowsViewComponent}
          />
          <ContabilidadTab
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            tabIndex={tabIndex}
            onAutocompleteChange={onAutocompleteChange}
          />
          <EstadoCuentaTab
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            tabIndex={tabIndex}
            rows={rows}
            setRows={setRows}
          />
          <HistorialTab clientId={clientId} tabIndex={tabIndex} />
          <ExcepcionesTab
            clientId={clientId}
            formState={formState}
            createMode={createMode}
            editMode={editMode}
            tabIndex={tabIndex}
            enqueueSnackbar={enqueueSnackbar}
            styles={styles}
            excepcionesRows={excepcionesRows}
            setExcepcionesRows={setExcepcionesRows}
          />
          <SubmitButtons
            createMode={createMode}
            editMode={editMode}
            handleCancel={handleCancel}
            isEditable={isEditable}
            thereIsChanges={thereIsChanges}
            setIsAnulation={setIsAnulation}
            formState={formState}
            setFormState={setFormState}
            setEditMode={setEditMode}
            setTitle={setTitle}
            rows={[]}
          />
        </form>
      </CardLayout>
    </>
  );
};
