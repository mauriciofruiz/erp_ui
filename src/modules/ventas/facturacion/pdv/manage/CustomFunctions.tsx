import { EstadoDocumentoEnum, FormaPagoEnum, ParametersEnum } from '@/enums';
import { setCurrencyNumber } from '@/functions';
import { FormState } from '@/hooks';
import { CobroFacturaInterface, UserLoginType } from '@/types';
import {
  GridCellModes,
  GridCellModesModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
} from '@mui/x-data-grid';

type validateFormType = {
  user: UserLoginType | null;
  rows: GridRowsProp;
  formState: FormState;
  enqueueSnackbar: (message: string, options?: any) => void;
  diferencia: number;
  cobrosInitialized: CobroFacturaInterface[];
  rowsDetalleCobro: GridRowsProp;
  rowModesModelCobro: GridRowModesModel;
  cellModesModel: GridCellModesModel;
};

export const validateForm = ({
  user,
  rows,
  formState,
  enqueueSnackbar,
  diferencia,
  cobrosInitialized,
  rowsDetalleCobro,
  rowModesModelCobro,
  cellModesModel,
}: validateFormType): boolean => {
  if (
    formState.isConsumidorFinal &&
    formState.totalToCharge > ParametersEnum.MONTO_MAXIMO_CONSUMIDOR_FINAL
  ) {
    enqueueSnackbar(
      `El monto total a cobrar no puede ser mayor a ${setCurrencyNumber(
        ParametersEnum.MONTO_MAXIMO_CONSUMIDOR_FINAL
      )} para consumidor final`,
      {
        variant: 'error',
      }
    );
    return false;
  }
  if (user?.cashId === null) {
    enqueueSnackbar('No se ha asignado una caja a este usuario', {
      variant: 'error',
    });
    return false;
  }
  if (!formState.clientId) {
    enqueueSnackbar('Debe seleccionar un cliente', { variant: 'error' });
    return false;
  }
  if (rows.length === 0) {
    enqueueSnackbar('Debe agregar al menos un producto', {
      variant: 'error',
    });
    return false;
  } else {
    const thereIsACellEditing = rows.some((row) => {
      const cellModes = cellModesModel[row.id] || {};
      return (
        cellModes.productName?.mode === GridCellModes.Edit ||
        cellModes.quantity?.mode === GridCellModes.Edit
      );
    });
    if (thereIsACellEditing) {
      enqueueSnackbar('Debe guardar los cambios en el detalle de factura', {
        variant: 'error',
      });
      return false;
    }
  }
  if (formState.invoiceStatusId === EstadoDocumentoEnum.CONFIRMADO) {
    if (diferencia !== 0) {
      enqueueSnackbar(
        'La diferencia entre el total y el total a cobrar debe ser 0',
        { variant: 'error' }
      );
      return false;
    }
    if (cobrosInitialized.length === 0) {
      enqueueSnackbar('Debe agregar al menos un cobro', {
        variant: 'error',
      });
      return false;
    } else if (cobrosInitialized.length > 0) {
      const detallesCobro = rowsDetalleCobro;
      if (cobrosInitialized[0].paymentTotal < formState.totalToCharge) {
        enqueueSnackbar('Debe cobrar la totalidad de la factura', {
          variant: 'error',
        });
        return false;
      }
      if (detallesCobro.length === 0) {
        enqueueSnackbar('Debe agregar al menos un detalle de cobro', {
          variant: 'error',
        });
        return false;
      } else {
        // ? Verificar si hay un detalle de cobro en edición
        const thereIsARowEditing = detallesCobro.some((row) => {
          return rowModesModelCobro[row.id]?.mode === GridRowModes.Edit;
        });
        if (thereIsARowEditing) {
          enqueueSnackbar('Debe guardar los cambios en el detalle de cobro', {
            variant: 'error',
          });
          return false;
        } else {
          return validateFormasPago(detallesCobro, enqueueSnackbar);
        }
      }
    }
  }
  return true;
};

const validateFormasPago = (
  rowsDetalleCobro: readonly GridValidRowModel[],
  enqueueSnackbar: (message: string, options?: any) => void
): boolean => {
  for (const row of rowsDetalleCobro) {
    if (
      !row.paymentMethodId ||
      row.paymentMethodId === null ||
      row.paymentMethodId === ''
    ) {
      enqueueSnackbar('Debe seleccionar una forma de pago', {
        variant: 'error',
      });
      return false;
    }
    if (row.amount <= 0) {
      enqueueSnackbar('El monto de todos los cobros debe ser mayor a 0', {
        variant: 'error',
      });
      return false;
    }
    if (
      row.paymentMethodId === FormaPagoEnum.TRANSFERENCIA ||
      row.paymentMethodId === FormaPagoEnum.DEPOSITO
    ) {
      if (!row.bankId || row.bankId === null) {
        enqueueSnackbar('Debe seleccionar un banco', {
          variant: 'error',
        });
        return false;
      }
      if (
        !row.documentNumber ||
        row.documentNumber === null ||
        row.documentNumber === ''
      ) {
        enqueueSnackbar('Debe ingresar un número de documento', {
          variant: 'error',
        });
        return false;
      }
    } else if (row.paymentMethodId === FormaPagoEnum.CHEQUE) {
      if (!row.bankId || row.bankId === null) {
        enqueueSnackbar('Debe seleccionar un banco', {
          variant: 'error',
        });
        return false;
      }
      if (
        !row.checkNumber ||
        row.checkNumber === null ||
        row.checkNumber === ''
      ) {
        enqueueSnackbar('Debe ingresar un número de cheque', {
          variant: 'error',
        });
        return false;
      }
    } else if (row.paymentMethodId === FormaPagoEnum.CREDITO) {
      if (row.amount > row.quotaAvailable) {
        enqueueSnackbar('El monto no puede ser mayor al crédito disponible', {
          variant: 'error',
        });
        return false;
      }
    } else if (
      row.paymentMethodId === FormaPagoEnum.TARJETA_CREDITO ||
      row.paymentMethodId === FormaPagoEnum.TARJETA_DEBITO
    ) {
      if (!row.cardId || row.cardId === null) {
        enqueueSnackbar('Debe seleccionar una tarjeta', {
          variant: 'error',
        });
        return false;
      }
      if (!row.acquirerId || row.acquirerId === null) {
        enqueueSnackbar('Debe seleccionar un adquiriente', {
          variant: 'error',
        });
        return false;
      }
      if (!row.batch || row.batch === null) {
        enqueueSnackbar('Debe ingresar un número de lote', {
          variant: 'error',
        });
        return false;
      }
      if (!row.term || row.term === null) {
        enqueueSnackbar('Debe ingresar un número de plazo', {
          variant: 'error',
        });
        return false;
      }
    }
  }
  return true;
};
