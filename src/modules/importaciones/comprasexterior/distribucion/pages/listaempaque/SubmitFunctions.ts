import { FormState } from '@/hooks';
import {
  DetalleListaEmpaqueSendInterface,
  ListaEmpaqueSendInterface,
} from '@/types';
import { GridValidRowModel } from '@mui/x-data-grid';

export const setHeader = (formState: FormState): ListaEmpaqueSendInterface => {
  return {
    packingListId: formState.packeageListId,
    packingListStateId: formState.packingListStateId,
    importOpeningId: formState.importOpeningId,
    containerDimensionId: formState.containerDimensionId,
    arrivalDate: formState.arrivalDate,
    departureDate: formState.departureDate,
    ship: formState.ship,
    shippingCompany: formState.shippingCompany,
    bl: formState.bl,
    blPathFile: formState.blPathFile,
    policy: formState.policy,
    application: formState.application,
    freeDays: formState.freeDays,
    containers: formState.numberContainers,
    observation: formState.observation,
    warehouse: formState.warehouse,
    agent: formState.agent,
    numberOfInvoices: formState.numberOfInvoices,
  };
};

export const setDetails = (
  rows: readonly GridValidRowModel[]
): DetalleListaEmpaqueSendInterface[] => {
  return rows.map((row) => {
    return {
      ...(row as DetalleListaEmpaqueSendInterface),
    };
  });
};
