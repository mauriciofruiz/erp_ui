import {
  DocumentTypeEnum,
  EstadoDepositoEnum,
  FormaPagoEnum,
  PathEnum,
  TitlesEnum,
} from '@/enums';
import {
  FormState,
  useAllowContabilidad,
  useCommonManage,
  useDepositosAsync,
  useForm,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import { DepositoDetallePost, DepositoGetDto, DepositoPostDto } from '@/types';
import { Grid } from '@mui/material';
import { randomId } from '@mui/x-data-grid-generator';
import React, { useEffect, useMemo } from 'react';
import { DepositoForm } from './components/DepositoForm';
import { DepositDetails } from './components/DepositoDetails';
import { SubmitButtons } from './components/SubmitButtons';
import { TipoDepositoEnum } from '@/enums/TipoDepositoEnum';
import { GridRowSelectionModel, GridValidRowModel } from '@mui/x-data-grid';

export type DepositoProps = {
  // types...
};

const initialFormState: FormState = {
  depositId: null,
  depositTypeId: TipoDepositoEnum.VENTAS,
  bankId: null,
  documentNumber: null,
  branchId: null,
  depositAmount: 0,
  depositDate: new Date().toISOString(),
  registerDate: new Date().toISOString(),
  depositDescription: null,
  depositStatusId: EstadoDepositoEnum.GENERADO,
  depositMultiple: false,
  motiveAnnulment: null,
  depositDetailList: [],
  userName: null,
  paymentMethodId: FormaPagoEnum.EFECTIVO,
};

export const DepositoManage: React.FC<DepositoProps> = ({}) => {
  const {
    onInputChange,
    setFormState,
    formState,
    onAutocompleteChange,
    onGenericChange,
  } = useForm(initialFormState);

  const {
    location,
    // styles,
    title,
    setTitle,
    editMode,
    setEditMode,
    createMode,
    setCreateMode,
    setIsEditable,
    isAnulation,
    setOpenDialogAlert,
    openDialogAlert,
    dialogMessage,
    handleCommonCancel,
    stopEnterEvent,
    rows,
    setRows,
    setIsAnulation,
    enabledAnulation,
    setEnabledAnulation,
    setDialogMessage,
    isEditable,
    thereIsChanges,
    prevFormState,
    prevRows,
    enqueueSnackbar,
    user,
  } = useCommonManage(formState);

  const { fetchById, fetchSave, fetchUpdate } = useDepositosAsync();

  const { enableEditingDeposit, enableAnulationDeposit } =
    useAllowContabilidad();

  const depostioIdOpened = location?.state?.depostiosIdOpened;

  const documentId = useMemo(() => {
    if (!depostioIdOpened) return null;

    const [id, type] = depostioIdOpened.split('-');
    const isValidType = type == DocumentTypeEnum.DEPOSITO;

    return isValidType ? id : null;
  }, [depostioIdOpened]);

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  // ?  *************************** useEffect INITIALIZATION ***************************
  useEffect(() => {
    if (!documentId) {
      setCreateMode(true);
      setTitle(TitlesEnum.NUEVO_DEPOSITO);
      setEditMode(true);
      setFormState({
        ...initialFormState,
        branchId: user?.branchId,
        userName: user?.userNick,
        cashId: user?.cashId,
      });
    } else {
      setCreateMode(false);
      setEditMode(false);
      const setFormAndRows = async () => {
        const response = await fetchById(documentId);
        if (response) {
          const newFormState = response as DepositoGetDto;
          setFormState(newFormState);
          prevFormState.current = newFormState;
          setTitle(TitlesEnum.DEPOSITO_LECTURA + newFormState.depositId);
          const enableEditing = enableEditingDeposit(
            newFormState.depositDate ?? new Date(),
            newFormState.depositStatusId,
            newFormState.userId
          );
          setIsEditable(enableEditing);
          const enableAnulacion = enableAnulationDeposit(
            newFormState.depositStatusId,
            false,
            newFormState.depositDate ?? new Date()
          );
          setEnabledAnulation(enableAnulacion);
          const temporalRows = newFormState.depositDetailList.map((row) => {
            return {
              ...row,
              id: randomId(),
            };
          });
          setRows(temporalRows);
          prevRows.current = temporalRows;
        }
      };
      setFormAndRows();
    }
  }, [documentId]);

  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const validateForm = (
    selectedRows: readonly GridValidRowModel[]
  ): boolean => {
    const thereAreRows = selectedRows.length > 0;

    const allRowsHasChangeBalance = selectedRows.every(
      (row) => row.pendingValue !== row.pendingValueStatic
    );

    if (formState.depositId === null) {
      const isSales = formState.depositTypeId === TipoDepositoEnum.VENTAS;
      if (!thereAreRows && isSales) {
        enqueueSnackbar('Debe seleccionar al menos un documento', {
          variant: 'error',
        });
        return false;
      }

      if (!allRowsHasChangeBalance && isSales) {
        enqueueSnackbar(
          'Todos los documentos seleccionados deben tener un valor a pagar o cruzar distinto al saldo inicial',
          {
            variant: 'error',
          }
        );
        return false;
      }
      if (thereAreRows && !formState.depositMultiple && isSales) {
        if (!formState.documentNumber) {
          enqueueSnackbar('Ingrese el número de documento', {
            variant: 'error',
          });
          return false;
        }
        if (!formState.branchId) {
          enqueueSnackbar('Seleccione la sucursal', {
            variant: 'error',
          });
          return false;
        }

        const minIssueDate = selectedRows.reduce((acc, row) => {
          return row.documentIssueDate > acc ? row.documentIssueDate : acc;
        }, selectedRows[0].documentIssueDate);

        if (
          new Date(formState.accountingDate) < new Date(minIssueDate) &&
          isSales
        ) {
          enqueueSnackbar(
            'La fecha de contabilización no puede ser menor a la fecha de emisión del documento más antiguo',
            {
              variant: 'error',
            }
          );
          return false;
        }

        if (!formState.isValidDocument) {
          enqueueSnackbar('El número de documento no es válido', {
            variant: 'error',
          });
          return false;
        }
      } else if (thereAreRows && formState.depositMultiple && isSales) {
        const allRowsHasDocumentNumber = selectedRows.every(
          (row) => row.numberDocument !== null && row.numberDocument !== ''
        );

        if (!allRowsHasDocumentNumber) {
          enqueueSnackbar(
            'Todos los documentos seleccionados deben tener un número de documento',
            {
              variant: 'error',
            }
          );
          return false;
        }

        const allRowsHasAccountingDate = selectedRows.every(
          (row) => row.depositDate !== null && row.depositDate !== ''
        );

        if (!allRowsHasAccountingDate && isSales) {
          enqueueSnackbar(
            'Todos los documentos seleccionados deben tener una fecha de contabilización',
            {
              variant: 'error',
            }
          );
          return false;
        }

        const allRowsHasCorrectDate = selectedRows.every(
          (row) => new Date(row.depositDate) >= new Date(row.closingCashDate)
        );
        if (!allRowsHasCorrectDate && isSales) {
          enqueueSnackbar(
            'La fecha de contabilización no puede ser menor a la fecha de cierre de la caja',
            {
              variant: 'error',
            }
          );
          return false;
        }

        const allDocumentsAreValid = selectedRows.every(
          (row) => row.isValidDocument
        );
        if (!allDocumentsAreValid && isSales) {
          enqueueSnackbar(
            'Alguno de los documentos no tiene un número válido',
            {
              variant: 'error',
            }
          );
          return false;
        }
      }
    }

    if (!formState.depositTypeId) {
      enqueueSnackbar('Seleccione el tipo de deposito', {
        variant: 'error',
      });
      return false;
    }
    if (!formState.bankId) {
      enqueueSnackbar('Seleccione el banco', {
        variant: 'error',
      });
      return false;
    }
    if (!formState.depositDescription) {
      enqueueSnackbar('Ingrese la descripción del deposito', {
        variant: 'error',
      });
      return false;
    }

    if (formState.depositTypeId === TipoDepositoEnum.CONTABLE) {
      if (rows.length === 0) {
        enqueueSnackbar('Ingrese al menos un detalle de deposito', {
          variant: 'error',
        });
        return false;
      }
      if (rows.some((row) => !row.accountId)) {
        enqueueSnackbar('Seleccione la cuenta de los detalles del deposito', {
          variant: 'error',
        });
        return false;
      }
      if (rows.some((row) => !row.depositAmount)) {
        enqueueSnackbar('Ingrese el valor de los detalles del deposito', {
          variant: 'error',
        });
        return false;
      }
    }

    return true;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedRows = rows.filter((row) =>
      rowSelectionModel.includes(row.id)
    );

    if (!validateForm(selectedRows)) {
      setFormState({
        ...formState,
        depositStatusId: prevFormState.current
          ? prevFormState.current.depositStatusId
          : EstadoDepositoEnum.GENERADO,
      });
      return;
    }

    const details: DepositoDetallePost[] = rows
      .filter((row) => row.depositAmount > 0)
      .map((row) => {
        if (formState.depositMultiple) {
          return {
            depositDetailId: row.depositDetailId,
            depositId: row.depositId,
            pendingDepositId: row.pendingDepositId,
            accountId: row.accountId,
            depositAmount: row.depositAmount,
            bankId: formState.bankId,
            numberDocument: row.numberDocument,
            depositDate: row.depositDate,
            employeeId: row.employeeId,
            importOpeningId: row.importOpeningId,
            proyectId: row.proyectId,
            branchId: row.branchId,
            clientId: row.clientId,
            providerId: row.providerId,
          };
        }
        return {
          depositDetailId: row.depositDetailId,
          depositId: row.depositId,
          pendingDepositId: row.pendingDepositId,
          accountId: row.accountId,
          depositAmount: row.depositAmount,
          bankId: row.bankId,
          numberDocument: row.numberDocument,
          depositDate: row.depositDate,
          employeeId: row.employeeId,
          importOpeningId: row.importOpeningId,
          proyectId: row.proyectId,
          branchId: row.branchId,
          clientId: row.clientId,
          providerId: row.providerId,
        };
      });
    const data: DepositoPostDto = {
      depositId: formState.depositId,
      depositTypeId: formState.depositTypeId,
      bankId: formState.bankId,
      documentNumber: formState.documentNumber,
      depositDate: formState.depositDate,
      branchId: formState.branchId,
      depositAmount: formState.depositAmount,
      depositDescription: formState.depositDescription,
      depositMultiple: formState.depositMultiple,
      depositStatusId: formState.depositStatusId,
      motiveAnnulment: formState.motiveAnnulment,
      depositDetailList: details,
    };

    if (createMode) {
      await fetchSave(data);
      handleCancel();
    } else {
      await fetchUpdate(formState.depositId, data);
      handleCancel();
    }
  };

  const handleCancel = async () => {
    handleCommonCancel(
      PathEnum.DEPOSITOS,
      documentId,
      DocumentTypeEnum.DEPOSITO
    );
  };

  return (
    <>
      <CustomDialog
        fieldName="motiveAnnulment"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={isAnulation}
        motivo={formState.motiveAnnulment ?? ''}
        onInputChange={onInputChange}
        stateIdFieldName="depositStatusId"
        setFormState={setFormState}
        prevStateId={
          prevFormState.current?.depositStatusId ?? EstadoDepositoEnum.GENERADO
        }
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
      >
        <form onSubmit={onSubmit} onKeyDown={stopEnterEvent}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <DepositoForm
              formState={formState}
              createMode={createMode}
              editMode={editMode}
              onAutocompleteChange={onAutocompleteChange}
              onGenericChange={onGenericChange}
              setFormState={setFormState}
              onInputChange={onInputChange}
            />
            <DepositDetails
              formState={formState}
              setFormState={setFormState}
              createMode={createMode}
              editMode={editMode}
              rows={rows}
              setRows={setRows}
              onGenericChange={onGenericChange}
              rowSelectionModel={rowSelectionModel}
              setRowSelectionModel={setRowSelectionModel}
            />
            <SubmitButtons
              createMode={createMode}
              handleCancel={handleCancel}
              isEditable={isEditable}
              editMode={editMode}
              thereIsChanges={thereIsChanges}
              setDialogMessage={setDialogMessage}
              setIsAnulation={setIsAnulation}
              setOpenDialogAlert={setOpenDialogAlert}
              formState={formState}
              setFormState={setFormState}
              rows={rows}
              setEditMode={setEditMode}
              setTitle={setTitle}
              enableAnulation={enabledAnulation}
            />
          </Grid>
        </form>
      </CardLayout>
    </>
  );
};
