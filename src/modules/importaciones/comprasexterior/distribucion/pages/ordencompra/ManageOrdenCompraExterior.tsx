'use client';
import {
  useAccessDocument,
  useAllowAdquisicion,
  useAllowGlobal,
  useForm,
  useOrdenCompraAsync,
  useProveedorAsync,
} from '@/hooks';
import { OrdenExteriorGetInterface, PersonProviderType } from '@/types';
import { GridRowsProp } from '@mui/x-data-grid';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardLayout, CustomDialog } from '@/modules/layout';
import {
  DocumentTypeEnum,
  EstadoOrdenEnum,
  IncotermEnum,
  PathEnum,
} from '@/enums';
import { OrdenCompraExteriorForm } from './OrdenCompraExteriorForm';
import { HeaderButtonsOCExt } from './HeaderButtonsOCExt';
import { SubmitButtons } from './SubmitButtons';
import { isEqual } from 'lodash';
import { useSnackbar } from 'notistack';
import { setDetails, setHeader } from './SubmitFunctions';
import { RootState, ServerResponseType } from '@/store';
import { useSelector } from 'react-redux';
import { randomId } from '@mui/x-data-grid-generator';
import { parseISO } from 'date-fns';

type ManageOrdenCompraExteriorProps = {
  // types...
};

const initialState: OrdenExteriorGetInterface = {
  orderId: null,
  stateOrderId: EstadoOrdenEnum.EN_EDICION,
  orderListId: null,
  branchId: null,
  providerId: null,
  personName: '',
  providerIdentification: '',
  registrationDate: new Date(),
  applicationNumber: '',
  policyNumber: '',
  invoiceNumber: '',
  importOpeningId: null,
  importOpeningCode: '',
  incotermId: IncotermEnum.FOB,
  deliveryDate: null,
  containerNumber: 0,
  premiumValue: 0,
  fodinfaFreight: 0,
  advaloremFreight: 0,
  freightValue: 0,
  observation: '',
  internationalFreight: 0,
  insuranceValue: 0,
  otherExpenses: 0,
  totalValue: 0,
  detailPurchaseOrderImport: [],
  subtotal: 0,
  subtototalFodinfa: 0,
  subtototalAdvalorem: 0,
};

export const ManageOrdenCompraExterior: React.FC<
  ManageOrdenCompraExteriorProps
> = ({}) => {
  const [isEditable, setIsEditable] = useState(false);

  const {
    fetchSaveOCExterior,
    fetchUpdateOCExterior,
    fetchOrdenCompraExteriorById,
  } = useOrdenCompraAsync();

  const { fetchPendientesByListaPedido } = useProveedorAsync();

  const { enableEditingOCExterior } = useAllowAdquisicion();

  const { closeDocument, openDocument } = useAccessDocument();
  const location = useLocation();

  const orderId = useMemo(() => {
    const state =
      location.state || JSON.parse(localStorage.getItem('state') || '{}');
    const documentId = state.orderId;
    if (!documentId) return null;
    const [id, type] = documentId.split('-');
    const isValidType = Number(type) === DocumentTypeEnum.ORDEN_COMPRA;

    return isValidType ? id : null;
  }, [location.state]);

  const [createMode, setCreateMode] = useState(true);

  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');

  const { navigateBetweenDocuments } = useAllowGlobal();

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  const [thereIsChanges, setThereIsChanges] = useState<boolean>(false);

  const [dialogMessage, setDialogMessage] = useState('');

  const [isAnulation, setIsAnulation] = useState(false);

  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  const prevFormState = useRef<any | undefined>(undefined);

  const prevRows = useRef<any | undefined>(undefined);

  const [editMode, setEditMode] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useSelector((state: RootState) => state.auth);

  const {
    formState,
    setFormState,
    onInputChange,
    onDateChange,
    onAutocompleteChange,
    onInputNumberChange,
  } = useForm(initialState);

  const [proveedoresList, setProveedoresList] = useState<PersonProviderType[]>(
    []
  );

  const headerComponents: React.ReactNode = HeaderButtonsOCExt(
    orderId,
    closeDocument,
    openDocument,
    navigate
  );

  /**
   * Handles the cancel action for the factura (invoice) management page.
   */
  const handleCancel = () => {
    if (orderId) {
      closeDocument({
        id: orderId,
        documentType: DocumentTypeEnum.ORDEN_COMPRA,
      });
    }
    navigate(PathEnum.ORDEN_COMPRA_EXTERIOR);
  };

  useEffect(() => {
    const getProveedores = async () => {
      const response = await fetchPendientesByListaPedido();
      setProveedoresList((response as unknown as PersonProviderType[]) ?? []);
    };
    if (!orderId) {
      setCreateMode(true);
      setTitle('Nueva Orden de Compra');
      getProveedores();
      setIsEditable(true);
    } else {
      setCreateMode(false);
      setEditMode(false);
      setTitle('Orden Del Exterior (Modo Lectura) - N° ' + orderId);
      const setFormAndRows = async () => {
        const response = await fetchOrdenCompraExteriorById(orderId);
        if (response) {
          const order = response as OrdenExteriorGetInterface;

          const newFormState = {
            ...order,
            deliveryDate:
              typeof order.deliveryDate === 'string'
                ? parseISO(order.deliveryDate)
                : order.deliveryDate,
            registrationDate:
              typeof order.registrationDate === 'string'
                ? parseISO(order.registrationDate)
                : order.registrationDate,
            detailPurchaseOrderImport: [],
          };

          setFormState(newFormState);
          prevFormState.current = newFormState;

          const enableEditing =
            order.stateOrderId !== EstadoOrdenEnum.ANULADA
              ? enableEditingOCExterior(
                  order.stateOrderId,
                  false,
                  order.registrationDate ?? new Date()
                )
              : false;
          setIsEditable(enableEditing);
          const temporalRows = order.detailPurchaseOrderImport.map((row) => {
            return {
              id: randomId(),
              ...row,
              status: true,
            };
          });
          setRows(temporalRows);
          prevRows.current = temporalRows;
        }
      };

      setFormAndRows();
    }
  }, [orderId]);

  useEffect(() => {
    if (
      !isEqual(prevFormState.current, formState) ||
      !isEqual(prevRows.current, rows)
    ) {
      setThereIsChanges(true);
    } else {
      setThereIsChanges(false);
    }
  }, [formState, rows]);

  const validateForm = () => {
    let isValid = true;

    if (formState.importOpeningCode === '') {
      enqueueSnackbar(
        'El campo Código de Apertura de Importación es requerido',
        {
          variant: 'error',
        }
      );
      isValid = false;
    }
    if (formState.incotermId === 0 && formState.incotermId === null) {
      enqueueSnackbar('El campo Incoterm es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.deliveryDate === null) {
      enqueueSnackbar('El campo Fecha de Entrega es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.containerNumber === 0) {
      enqueueSnackbar('El campo Número de Contenedor es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.providerId === 0 && formState.providerId === null) {
      enqueueSnackbar('El campo Proveedor es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.observation === '') {
      enqueueSnackbar('El campo Observación es requerido', {
        variant: 'error',
      });
      isValid = false;
    }

    if (formState.applicationNumber === '') {
      enqueueSnackbar('El campo Número de Aplicación es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.policyNumber === '') {
      enqueueSnackbar('El campo Número de Póliza es requerido', {
        variant: 'error',
      });
      isValid = false;
    }

    if (formState.invoiceNumber === '') {
      enqueueSnackbar('El campo Número de Factura es requerido', {
        variant: 'error',
      });
      isValid = false;
    }

    if (rows.length === 0) {
      enqueueSnackbar('Debe agregar al menos un producto', {
        variant: 'error',
      });
      isValid = false;
    }
    return isValid;
  };

  /**
   * Handles the click event of the edit button.
   * If edit mode is disabled, enables it and updates the title.
   * If edit mode is enabled, disables it and updates the title.
   * Also updates the row modes and displays a snackbar message.
   */

  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  /**
   * Handles the change event of the provider selection.
   *
   * @param event - The change event object.
   * @param value - The selected provider value.
   */

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      setFormState({
        ...formState,
        stateOrderId: prevFormState.current
          ? prevFormState.current.stateOrderId
          : EstadoOrdenEnum.EN_EDICION,
      });
      return;
    }

    const branchId =
      formState.branchId && formState.branchId !== null
        ? formState.branchId
        : user?.branchId;
    const header = setHeader(formState, branchId);

    const details = setDetails(rows);

    const response = orderId
      ? await fetchUpdateOCExterior(
          {
            purchaseOrder: header,
            purchaseOrderDetail: details,
            taxes: [],
          },
          orderId
        )
      : await fetchSaveOCExterior({
          purchaseOrder: header,
          purchaseOrderDetail: details,
          taxes: [],
        });

    if (
      (response && (response as ServerResponseType).status === 400) ||
      (response && (response as ServerResponseType).status === 500)
    ) {
      setFormState({
        ...formState,
        stateOrderId: prevFormState.current
          ? prevFormState.current.stateOrderId
          : EstadoOrdenEnum.EN_EDICION,
      });
      return;
    }
    handleCancel();
  };
  return (
    <>
      <CustomDialog
        fieldName="motive"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.motive ?? ''}
        onInputChange={onInputChange}
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
        headerActions={
          !createMode && orderId && navigateBetweenDocuments()
            ? headerComponents
            : null
        }
      >
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <OrdenCompraExteriorForm
            initialState={initialState}
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onDateChange={onDateChange}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            onInputNumberChange={onInputNumberChange}
            rows={rows}
            setRows={setRows}
            proveedoresList={proveedoresList}
          />
          <SubmitButtons
            createMode={createMode}
            editMode={editMode}
            handleCancel={handleCancel}
            isEditable={isEditable}
            thereIsChanges={thereIsChanges}
            setDialogMessage={setDialogMessage}
            setIsAnulation={setIsAnulation}
            setOpenDialogAlert={setOpenDialogAlert}
            formState={formState}
            setFormState={setFormState}
            rows={rows}
            setEditMode={setEditMode}
            setTitle={setTitle}
          />
        </form>
      </CardLayout>
    </>
  );
};
