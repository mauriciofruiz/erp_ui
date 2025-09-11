import { ParametersEnum } from '@/enums';
import { FormState } from '@/hooks';
import { DetalleLiquidacionInterface, LiquidacionInterface } from '@/types';
import { GridValidRowModel } from '@mui/x-data-grid';

export const setHeader = (formState: FormState): LiquidacionInterface => {
  return {
    ...(formState as LiquidacionInterface),
  };
};

export const setDetails = (
  rows: readonly GridValidRowModel[]
): DetalleLiquidacionInterface[] => {
  return rows.map((row) => {
    return {
      ...(row as DetalleLiquidacionInterface),
    };
  });
};

export const setSummaryRow = (
  rows: readonly GridValidRowModel[]
): readonly GridValidRowModel[] => {
  const summaryRow = rows.reduce(
    (acc, row) => {
      acc.quantity += row.quantity;
      acc.fob += row.fob;
      acc.fobPortion += row.fobPortion;
      acc.policy += row.policy;
      acc.freight += row.freight;
      acc.cif += row.cif;
      acc.fodinfa += row.fodinfa;
      acc.adValorem += row.adValorem;
      acc.iva += row.iva;
      acc.freightTransportOtherExpenses += row.freightTransportOtherExpenses;
      acc.stowageOtherExpenses += row.stowageOtherExpenses;
      acc.warehousingOtherExpenses += row.warehousingOtherExpenses;
      acc.localExpensesOtherExpenses += row.localExpensesOtherExpenses;
      acc.custodyOtherExpenses += row.custodyOtherExpenses;
      acc.exonerationOtherExpenses += row.exonerationOtherExpenses;
      acc.agentOtherExpenses += row.agentOtherExpenses;
      acc.isdOtherExpenses += row.isdOtherExpenses;
      acc.policyOtherExpenses += row.policyOtherExpenses;
      acc.landTransportOtherExpenses += row.landTransportOtherExpenses;
      acc.goodViewOtherExpenses += row.goodViewOtherExpenses;
      acc.otherOtherExpenses += row.otherOtherExpenses;
      acc.totalOtherExpenses += row.totalOtherExpenses;
      acc.totalGeneral += row.totalGeneral;
      acc.cuWithoutIva += row.cuWithoutIva;
      acc.cuWithIva += row.cuWithIva;
      acc.totalCosts += row.totalCosts;
      return acc;
    },
    {
      id: ParametersEnum.ID_ROW_TOTAL,
      productCode: '',
      productName: 'TOTALES',
      quantity: 0,
      fobUnit: null,
      fob: 0,
      fobPortion: 0,
      policy: 0,
      freight: 0,
      cif: 0,
      tariff: null,
      release: null,
      fodinfa: 0,
      adValorem: 0,
      iva: 0,
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
      totalOtherExpenses: 0,
      totalGeneral: 0,
      cuWithoutIva: 0,
      cuWithIva: 0,
      totalCosts: 0,
      pvp: null,
      profitCost: null,
    }
  );

  const newRows = rows.concat(summaryRow);

  return newRows;
};
