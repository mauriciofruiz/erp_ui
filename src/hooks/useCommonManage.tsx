import { useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useStyles } from './useStyle';
import { FormState } from './useForm';
import { GridRowsProp } from '@mui/x-data-grid';
import { DocumentTypeEnum, ParametersEnum } from '@/enums';
import { useAccessDocument } from './useAccessDocument';
import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

type EditButtonFormProps = {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  setTitle: (value: string) => void;
  documentNumber: string;
  edicionMessage: string;
  lecturaMessage: string;
};

/**
 * Hook personalizado para la gestión común.
 * Proporciona funciones y estados relacionados con la gestión de formularios y diálogos.
 *
 * @returns Un objeto que contiene las siguientes propiedades y funciones:
 *  - location: la ubicación actual de la página.
 *  - navigate: función para navegar a una nueva ubicación.
 *  - styles: estilos CSS personalizados.
 *  - enqueueSnackbar: función para mostrar notificaciones en la interfaz de usuario.
 *  - prevFormState: referencia mutable al estado anterior del formulario.
 *  - prevRows: referencia mutable a las filas anteriores.
 *  - title: el título actual de la página.
 *  - setTitle: función para establecer el título de la página.
 *  - editMode: indica si el modo de edición está habilitado.
 *  - setEditMode: función para habilitar o deshabilitar el modo de edición.
 *  - createMode: indica si el modo de creación está habilitado.
 *  - setCreateMode: función para habilitar o deshabilitar el modo de creación.
 *  - isEditable: indica si el formulario es editable.
 *  - setIsEditable: función para habilitar o deshabilitar la edición del formulario.
 *  - isAnulation: indica si la anulación está habilitada.
 *  - setIsAnulation: función para habilitar o deshabilitar la anulación.
 *  - enabledAnulation: indica si la anulación está habilitada.
 *  - setEnabledAnulation: función para habilitar o deshabilitar la anulación.
 *  - onEditButtonClick: función para manejar el evento de clic en el botón de edición.
 *  - openDialogAlert: indica si el diálogo de alerta está abierto.
 *  - setOpenDialogAlert: función para abrir o cerrar el diálogo de alerta.
 *  - dialogMessage: el mensaje actual del diálogo.
 *  - setDialogMessage: función para establecer el mensaje del diálogo.
 *  - handleCommonCancel: función para manejar la cancelación común.
 *  - stopEnterEvent: función para detener el evento de tecla Enter.
 */
export const useCommonManage = (formState?: FormState) => {
  const location = useLocation();
  const navigate = useNavigate();
  const styles = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useSelector((state: RootState) => state.auth);

  const [rows, setRows] = useState<GridRowsProp>([]);

  const prevFormState = useRef<FormState | undefined>(undefined);
  const prevRows = useRef<GridRowsProp | undefined>(undefined);
  const [title, setTitle] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [isAnulation, setIsAnulation] = useState(false);
  const [enabledAnulation, setEnabledAnulation] = useState(false);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);

  const [dialogMessage, setDialogMessage] = useState('');

  const { closeDocument } = useAccessDocument();

  const onEditButtonClick = ({
    editMode,
    setEditMode,
    setTitle,
    documentNumber,
    edicionMessage,
    lecturaMessage,
  }: EditButtonFormProps) => {
    if (!editMode) {
      setEditMode(true);
      setTitle(edicionMessage + documentNumber);
      enqueueSnackbar(
        <>
          {ParametersEnum.MODO_EDICION_HABILITADO}
          <br />
          {ParametersEnum.MODO_LECTURA_DESHABILITADO}
        </>,
        {
          variant: 'info',
        }
      );
    } else {
      setEditMode(false);
      setTitle(lecturaMessage + documentNumber);
      enqueueSnackbar(
        <>
          {ParametersEnum.MODO_EDICION_DESHABILITADO}
          <br />
          {ParametersEnum.MODO_LECTURA_HABILITADO}
        </>,
        {
          variant: 'info',
        }
      );
    }
  };

  const handleCommonCancel = async (
    path: string,
    id?: number,
    documentType?: DocumentTypeEnum
  ) => {
    if (id && documentType) {
      closeDocument({
        id: id,
        documentType: documentType,
      });
    }
    navigate(path);
  };

  const stopEnterEvent = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  const thereIsChanges = useMemo(() => {
    return (
      !isEqual(prevFormState.current, formState) ||
      !isEqual(prevRows.current, rows)
    );
  }, [formState, rows]);

  return {
    location,
    navigate,
    styles,
    enqueueSnackbar,
    prevFormState,
    prevRows,
    title,
    setTitle,
    editMode,
    setEditMode,
    createMode,
    setCreateMode,
    isEditable,
    setIsEditable,
    isAnulation,
    setIsAnulation,
    enabledAnulation,
    setEnabledAnulation,
    onEditButtonClick,
    openDialogAlert,
    setOpenDialogAlert,
    dialogMessage,
    setDialogMessage,
    handleCommonCancel,
    stopEnterEvent,
    rows,
    setRows,
    thereIsChanges,
    user,
  };
};
