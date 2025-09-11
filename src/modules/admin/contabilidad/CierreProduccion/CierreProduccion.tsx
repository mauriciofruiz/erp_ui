'use client';
import { ParametersEnum, PathEnum, TipoCostoEnum, TitlesEnum } from '@/enums';
import {
  FormState,
  useCommonManage,
  useForm,
  useOrdenProduccionAsync,
} from '@/hooks';
import { CardLayout, CustomDialog } from '@/modules/layout';
import { Button, Grid } from '@mui/material';
import React, { useEffect } from 'react';
import { CierreProduccionForm } from './components/CierreProduccionForm';
import { CierreProduccionDetails } from './components/CierreProduccionDetails';
import { Check } from '@mui/icons-material';
import { CierreOrdenType } from '@/types';

type CierreProduccionProps = {
  // types...
};

const initialFormState: FormState = {
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  costTypeId: null,
};

export const CierreProduccion: React.FC<CierreProduccionProps> = ({}) => {
  const { formState, onGenericChange } = useForm(initialFormState);

  const {
    title,
    setTitle,
    createMode,
    setCreateMode,
    setIsEditable,
    setOpenDialogAlert,
    openDialogAlert,
    dialogMessage,
    handleCommonCancel,
    stopEnterEvent,
    rows,
    setRows,
    setIsAnulation,
    setDialogMessage,
    enqueueSnackbar,
  } = useCommonManage(formState);

  const { fetchCloseOrders } = useOrdenProduccionAsync();

  // ?  *************************** useEffect INITIALIZATION ***************************
  useEffect(() => {
    setCreateMode(true);
    setTitle(TitlesEnum.CIERRE_PRODUCCION);
    setIsEditable(true);
  }, []);

  const handleCancel = async () => {
    handleCommonCancel(PathEnum.HOME);
  };

  const handleDialogConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenDialogAlert(false);
    onSubmit(event);
  };

  const validateForm = () => {
    const thereAreRows = rows.filter(
      (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
    ).length;

    if (!thereAreRows) {
      enqueueSnackbar('No hay ordenes para cerrar.', {
        variant: 'error',
      });
      return false;
    }

    if (formState.costTypeId === null) {
      enqueueSnackbar('Seleccione un tipo de costo.', {
        variant: 'error',
      });
      return false;
    }
    const totalMpCost: number =
      rows.find((row) => row.id === ParametersEnum.ID_ROW_TOTAL)?.mpCost || 0;

    if (
      formState.costTypeId === TipoCostoEnum.MATERIA_PRIMA &&
      totalMpCost === 0
    ) {
      enqueueSnackbar('No hay ordenes de tipo MP para cerrar.', {
        variant: 'error',
      });
      return false;
    }

    const totalMoCost: number =
      rows.find((row) => row.id === ParametersEnum.ID_ROW_TOTAL)?.moCost || 0;

    if (formState.costTypeId === TipoCostoEnum.MANO_OBRA && totalMoCost === 0) {
      enqueueSnackbar('No hay ordenes de tipo MO para cerrar.', {
        variant: 'error',
      });
      return false;
    }

    const totalCifCost: number =
      rows.find((row) => row.id === ParametersEnum.ID_ROW_TOTAL)?.cifCost || 0;

    if (
      formState.costTypeId === TipoCostoEnum.COSTOS_INDIRECTOS &&
      totalCifCost === 0
    ) {
      enqueueSnackbar('No hay ordenes de tipo CIF para cerrar.', {
        variant: 'error',
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;
    const body: CierreOrdenType[] = rows
      .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
      .map((row) => {
        return {
          orderId: row.orderId,
          branchId: row.branchId,
          orderStatusId: row.orderStatusId,
          requestId: row.requestId,
          orderStatusName: row.orderStatusName,
          orderDate: row.orderDate,
          mpCost: row.mpCost,
          moCost: row.moCost,
          cifCost: row.cifCost,
          closingMPEntryId: row.closingMPEntryId,
          closingMOEntryId: row.closingMOEntryId,
          closingCIFEntryId: row.closingCIFEntryId,
        };
      });

    const response = await fetchCloseOrders(
      body,
      formState.endDate,
      formState.costTypeId
    );

    if (response) {
      enqueueSnackbar(response.message, {
        variant: response.status === 200 ? 'success' : 'error',
      });
    }
  };

  return (
    <>
      <CustomDialog
        fieldName="nothing"
        open={openDialogAlert}
        setOpen={setOpenDialogAlert}
        onDialogConfirm={handleDialogConfirm}
        dialogMessage={dialogMessage}
        isAnulation={false}
        motivo={null}
      />
      <CardLayout
        title={title}
        createMode={createMode}
        cancelFunction={handleCancel}
      >
        <form onSubmit={onSubmit} onKeyDown={stopEnterEvent}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <CierreProduccionForm
              formState={formState}
              onGenericChange={onGenericChange}
            />
            <CierreProduccionDetails
              rows={rows}
              setRows={setRows}
              formState={formState}
            />
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 5 }}
            >
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                <Grid item>
                  <div style={{ width: '20vw' }}>
                    <Button
                      type="button"
                      startIcon={<Check />}
                      fullWidth
                      onClick={() => {
                        setDialogMessage(
                          ParametersEnum.MENSAJE_TRANSACCION_GENERICO
                        );
                        setIsAnulation(false);
                        setOpenDialogAlert(true);
                      }}
                    >
                      {'Aceptar'}
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </Grid>{' '}
          </Grid>
        </form>
      </CardLayout>
    </>
  );
};
