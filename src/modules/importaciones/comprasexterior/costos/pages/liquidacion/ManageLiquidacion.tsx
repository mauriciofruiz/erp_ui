import {
  ComprobanteEstadoEnum,
  DocumentTypeEnum,
  ParametersEnum,
  PathEnum,
} from '@/enums';
import {
  useAccessDocument,
  useAllowAdquisicion,
  useForm,
  useLiquidacionAsync,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import { RootState } from '@/store';
import { LiquidacionInterface } from '@/types';
import { GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { LiquidacionForm } from './components/LiquidacionForm';
import { useSnackbar } from 'notistack';
import { parseISO } from 'date-fns';
import { randomId } from '@mui/x-data-grid-generator';
import { isEqual } from 'lodash';
import {
  setDetails,
  setHeader,
  setSummaryRow,
} from './components/SubmitFunctions';
import { SubmitButtons } from './components/SubmitButtons';

type ManageLiquidacionProps = {
  // types...
};

const initialFormState: LiquidacionInterface = {
  liquidationId: null,
  entryId: null,
  liquidationNumberLiquidation: '',
  observationLiquidation: '',
  importOpeningId: null,
  importOpeningCode: '',
  importDate: null,
  liquidationState: ComprobanteEstadoEnum.GENERADO,
  invoiceNumber: '',
  totalInvoice: 0,
  applicationValue: 0,
  fodinfa: 0,
  adValorem: 0,
  freightTransportOtherExpenses: 0,
  stowageOtherExpenses: 0,
  warehousingOtherExpenses: 0,
  localExpensesOtherExpenses: 0,
  custodyOtherExpenses: 0,
  exonerationOtherExpenses: 0,
  agentOtherExpenses: 0,
  isdOtherExpenses: 0,
  policyOtherExpenses: 0,
  landTransportOtherExpenses: 0,
  goodViewOtherExpenses: 0,
  otherOtherExpenses: 0,
  otherExpenses: 0,
  totalImportCost: 0,
  totalImport: 0,
  creationUserId: null,
  userName: '',
  registrationDate: new Date(),
  detail: [],
};

export const ManageLiquidacion: React.FC<ManageLiquidacionProps> = ({}) => {
  const [isEditable, setIsEditable] = useState(false);

  const { closeDocument } = useAccessDocument();
  const { fetchGetById, fetchSave, fetchUpdate } = useLiquidacionAsync();
  const { enableEditingLiquidacion } = useAllowAdquisicion();
  const location = useLocation();

  const liquidationId =
    location && location.state && location.state.liquidationId
      ? location.state.liquidationId
      : localStorage.getItem('state')
      ? JSON.parse(localStorage.getItem('state') || '').liquidationId ||
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
  const [idFacturasAsignadas, setIdFacturasAsignadas] = useState<number[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const {
    formState,
    setFormState,
    onInputChange,
    onAutocompleteChange,
    onInputNumberChange,
  } = useForm(initialFormState);

  const handleCancel = () => {
    if (liquidationId) {
      closeDocument({
        id: liquidationId,
        documentType: DocumentTypeEnum.LIQUIDACION,
      });
    }
    navigate(PathEnum.LIQUIDACION);
  };

  useEffect(() => {
    if (!liquidationId) {
      setCreateMode(true);
      setTitle('Nueva Liquidación');
      setIsEditable(true);

      setFormState({
        ...formState,
        creationUserId: user?.userId,
        userName: user?.userName,
      });
    } else {
      setCreateMode(false);
      setEditMode(false);
      setTitle('Liquidación (Modo Lectura) - N° ' + liquidationId);
      const setFormAndRows = async () => {
        const response = await fetchGetById(liquidationId);
        if (response) {
          const dto = response as LiquidacionInterface;

          const newFormState = {
            ...dto,
            importDate:
              typeof dto.importDate === 'string'
                ? parseISO(dto.importDate)
                : dto.importDate ?? new Date(),
            registrationDate:
              typeof dto.registrationDate === 'string'
                ? parseISO(dto.registrationDate)
                : dto.registrationDate,
            detail: [],
          };

          setFormState(newFormState);
          prevFormState.current = newFormState;

          const enableEditing =
            dto.liquidationState !== ComprobanteEstadoEnum.ANULADO
              ? enableEditingLiquidacion(
                  dto.liquidationState,
                  false,
                  dto.registrationDate ?? new Date()
                )
              : false;
          setIsEditable(enableEditing);
          const temporalRows =
            dto.detail?.map((row) => {
              return {
                id: randomId(),
                ...row,
                status: true,
              };
            }) ?? [];
          const summary = setSummaryRow(temporalRows);

          setRows(summary);
          prevRows.current = summary;
        }
      };

      setFormAndRows();
    }
  }, [liquidationId]);

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
      formState.liquidationNumberLiquidation === '' ||
      formState.numberOfInvoices === null
    ) {
      enqueueSnackbar('El campo número de liquidación', {
        variant: 'error',
      });
      isValid = false;
    }

    if (formState.observationLiquidation === '') {
      enqueueSnackbar('El campo Observación es requerido', {
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
        liquidationState: prevFormState.current
          ? prevFormState.current.liquidationState
          : ComprobanteEstadoEnum.GENERADO,
      });
      return;
    }

    const header = setHeader(formState);

    const details = setDetails(
      rows.filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
    );

    if (createMode) {
      await fetchSave({
        header,
        details,
        idFacturasAsignadas,
      });
    } else {
      await fetchUpdate(
        {
          header,
          details,
          idFacturasAsignadas,
        },
        liquidationId
      );
    }
    handleCancel();
  };
  return (
    <>
      <CustomDialog
        fieldName="observationLiquidation"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.observationLiquidation ?? ''}
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
          <LiquidacionForm
            formState={formState}
            setFormState={setFormState}
            createMode={createMode}
            editMode={editMode}
            onAutocompleteChange={onAutocompleteChange}
            onInputChange={onInputChange}
            rows={rows}
            setRows={setRows}
            onInputNumberChange={onInputNumberChange}
            idFacturasAsignadas={idFacturasAsignadas}
            setIdFacturasAsignadas={setIdFacturasAsignadas}
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
