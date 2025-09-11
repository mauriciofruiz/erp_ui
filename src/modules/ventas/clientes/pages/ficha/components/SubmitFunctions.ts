import { FormState } from '@/hooks';
import {
  ClientPersonCreditPostType,
  ExcepcionClienteDescuentoPostType,
} from '@/types';
import { GridValidRowModel } from '@mui/x-data-grid';

export const setHeader = (
  formState: FormState,
  excepcionesList: readonly GridValidRowModel[]
): ClientPersonCreditPostType => {
  return {
    ...(formState as ClientPersonCreditPostType),
    exceptions: excepcionesList.map((row) => {
      return {
        ...(row as ExcepcionClienteDescuentoPostType),
      };
    }),
  };
};
