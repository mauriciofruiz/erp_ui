import {
  CargoEnum,
  DimensionContenedorEnum,
  DocumentTypeEnum,
  EstadoListaEmpaqueEnum,
  PathEnum,
} from '@/enums';
import {
  useAccessDocument,
  useAllowAdquisicion,
  useForm,
  useListaEmpaqueAsync,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import { RootState, ServerResponseType } from '@/store';
import { ListaEmpaqueGetInterface, PersonProviderType } from '@/types';
import { GridRowsProp } from '@mui/x-data-grid';
import { isEqual } from 'lodash';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ListaEmpaqueForm } from './ListaEmpaqueForm';
import { SubmitButtons } from './SubmitButtons';
import { setDetails, setHeader } from './SubmitFunctions';
import { parseISO } from 'date-fns';
import { randomId } from '@mui/x-data-grid-generator';
import { GroupRows } from './CustomFunctions';

type ManageListaEmpaqueProps = {
  // types...
};

const initialFormState: ListaEmpaqueGetInterface = {
  packingListId: null,
  packingListStateId: EstadoListaEmpaqueEnum.GENERADA,
  importOpeningId: null,
  importCode: '',
  userId: null,
  userName: '',
  registrationDate: new Date(),
  numberOfInvoices: 1,
  policy: '',
  providerId: null,
  personName: '',
  arrivalDate: null,
  departureDate: null,
  ship: '',
  shippingCompany: '',
  bl: '',
  blPathFile: '',
  warehouse: '',
  application: '',
  agent: '',
  numberContainers: 1,
  containerDimensionId: DimensionContenedorEnum.VEINTE.id,
  freeDays: 0,
  totalQuantity: 0,
  multipleInvoice: false,
  observation: '',
  detailPackingList: [],
};

export const ManageListaEmpaque: React.FC<ManageListaEmpaqueProps> = ({}) => {
  const [isEditable, setIsEditable] = useState(false);

  const { closeDocument } = useAccessDocument();

  const { enableEditingLE } = useAllowAdquisicion();

  const location = useLocation();

  const packingListId =
    location && location.state && location.state.packingListId
      ? location.state.packingListId
      : localStorage.getItem('state')
      ? JSON.parse(localStorage.getItem('state') || '').packingListId ||
        undefined
      : undefined;

  const { user } = useSelector((state: RootState) => state.auth);

  const [createMode, setCreateMode] = useState(true);

  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');

  const [rows, setRows] = useState<GridRowsProp>([]);

  const [dialogMessage, setDialogMessage] = useState('');

  const [isAnulation, setIsAnulation] = useState(false);

  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  const prevFormState = useRef<any | undefined>(undefined);

  const prevRows = useRef<any | undefined>(undefined);

  const [editMode, setEditMode] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const { fetchSave, fetchUpdate, fetchGetById } = useListaEmpaqueAsync();

  const [groupedRows, setGroupedRows] = useState<GridRowsProp>([]);

  const [providerSelected, setProviderSelected] =
    useState<PersonProviderType | null>(null);

  const { position } = useSelector((state: RootState) => state.auth);

  const {
    formState,
    setFormState,
    onInputChange,
    onDateChange,
    onAutocompleteChange,
  } = useForm(initialFormState);

  const handleCancel = () => {
    if (packingListId) {
      closeDocument({
        id: packingListId,
        documentType: DocumentTypeEnum.LISTA_EMPAQUE,
      });
    }
    navigate(PathEnum.LISTA_EMPAQUE);
  };

  useEffect(() => {
    if (!packingListId) {
      setCreateMode(true);
      setTitle('Nueva Lista De Empaque');
      setIsEditable(true);

      setFormState({
        ...formState,
        userId: user?.userId,
        userName: user?.userName,
      });
    } else {
      setCreateMode(false);
      setEditMode(false);
      setTitle('Lista De Empaque (Modo Lectura) - N° ' + packingListId);
      const setFormAndRows = async () => {
        const response = await fetchGetById(packingListId);
        if (response) {
          const dto = response as ListaEmpaqueGetInterface;

          const newFormState = {
            ...dto,
            arrivalDate:
              typeof dto.arrivalDate === 'string'
                ? parseISO(dto.arrivalDate)
                : dto.arrivalDate,
            departureDate:
              typeof dto.departureDate === 'string'
                ? parseISO(dto.departureDate)
                : dto.departureDate,
            registrationDate:
              typeof dto.registrationDate === 'string'
                ? parseISO(dto.registrationDate)
                : dto.registrationDate,
            detailPackingList: [],
          };

          setProviderSelected({
            personAddress: '',
            personEmail: '',
            personId: null,
            personIdentification: '',
            personName: dto.personName,
            personPhone: '',
            providerId: dto.providerId,
            providerName: dto.personName,
          });
          setFormState(newFormState);
          prevFormState.current = newFormState;

          const temporalRows = dto.detailPackingList.map((row) => {
            return {
              id: randomId(),
              ...row,
              status: true,
            };
          });

          const someWithoutTransfer = temporalRows.some(
            (row) => row.isTransfered === false
          );

          const enableEditing =
            dto.packingListStateId !== EstadoListaEmpaqueEnum.ANULADA
              ? enableEditingLE(
                  dto.packingListStateId,
                  false,
                  dto.registrationDate ?? new Date()
                )
              : false;

          const editableFinal =
            enableEditing ||
            (someWithoutTransfer &&
              position?.positionId === CargoEnum.ANALISTA_IMPORTACIONES);

          setIsEditable(editableFinal);

          setRows(temporalRows);
          setGroupedRows(GroupRows(temporalRows));
          prevRows.current = temporalRows;
        }
      };

      setFormAndRows();
    }
  }, [packingListId]);

  const thereIsChanges = useMemo(() => {
    return (
      !isEqual(prevFormState.current, formState) ||
      !isEqual(prevRows.current, rows)
    );
  }, [formState, rows]);

  const validateForm = () => {
    let isValid = true;

    if (formState.importOpeningId === null) {
      enqueueSnackbar(
        'El campo Código de Apertura de Importación es requerido',
        {
          variant: 'error',
        }
      );
      isValid = false;
    }
    if (
      formState.numberOfInvoices === 0 &&
      formState.numberOfInvoices === null
    ) {
      enqueueSnackbar('El campo número de facturas es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.policy === '') {
      enqueueSnackbar('El campo Póliza es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.providerId === null) {
      enqueueSnackbar('El campo Proveedor es requerido', {
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
    if (formState.arrivalDate === null) {
      enqueueSnackbar('El campo Fecha De Llegada es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.departureDate === null) {
      enqueueSnackbar('El campo Fecha De Salida es requerido', {
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

    if (formState.ship === '') {
      enqueueSnackbar('El campo Buque es requerido', {
        variant: 'error',
      });
      isValid = false;
    }
    if (formState.shippingCompany === '') {
      enqueueSnackbar('El campo Naviera es requerido', {
        variant: 'error',
      });
      isValid = false;
    }

    if (formState.bl === '') {
      enqueueSnackbar('El campo BL es requerido', {
        variant: 'error',
      });
      isValid = false;
    }

    if (formState.warehouse === '') {
      enqueueSnackbar('El campo Almacén es requerido', {
        variant: 'error',
      });
      isValid = false;
    }

    if (formState.application === '') {
      enqueueSnackbar('El campo Aplicación es requerido', {
        variant: 'error',
      });
      isValid = false;
    }

    if (formState.agent === '') {
      enqueueSnackbar('El campo Agente es requerido', {
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
        packingListStateId: prevFormState.current
          ? prevFormState.current.packingListStateId
          : EstadoListaEmpaqueEnum.GENERADA,
      });
      return;
    }

    const header = setHeader(formState);

    const details = setDetails(rows);

    const response = packingListId
      ? await fetchUpdate(
          {
            header,
            details,
          },
          packingListId
        )
      : await fetchSave({
          header,
          details,
        });

    if (
      !response ||
      (response && (response as ServerResponseType).status === 400) ||
      (response && (response as ServerResponseType).status === 500)
    ) {
      setFormState({
        ...formState,
        packingListStateId: prevFormState.current
          ? prevFormState.current.packingListStateId
          : EstadoListaEmpaqueEnum.GENERADA,
      });
      return;
    }
    handleCancel();
  };
  return (
    <>
      <CustomDialog
        fieldName="observation"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.observation ?? ''}
        onInputChange={onInputChange}
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
      >
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <ListaEmpaqueForm
            initialState={initialFormState}
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onDateChange={onDateChange}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            setRows={setRows}
            groupedRows={groupedRows}
            setGroupedRows={setGroupedRows}
            providerSelected={providerSelected}
            setProviderSelected={setProviderSelected}
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
