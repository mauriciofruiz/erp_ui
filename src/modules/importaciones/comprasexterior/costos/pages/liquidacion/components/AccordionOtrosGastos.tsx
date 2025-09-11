import { setCurrencyNumber } from '@/functions';
import { FormState, useLiquidacionAsync, useStyles } from '@/hooks';
import { DetalleLiquidacionInterface, LiquidacionInterface } from '@/types';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { GridRowsProp, GridValidRowModel } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { parseISO } from 'date-fns';
import { useEffect } from 'react';
import { ParametersEnum } from '@/enums';
import { setSummaryRow } from './SubmitFunctions';

interface AccordionOtrosGastosProps {
  rows: readonly GridValidRowModel[];
  formState: FormState;
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
}

export const AccordionOtrosGastos = (props: AccordionOtrosGastosProps) => {
  const { rows, formState, setRows, setFormState, createMode, editMode } =
    props;

  const styles = useStyles();

  const { fetchLiquidacionByAperturaImp } = useLiquidacionAsync();

  useEffect(() => {
    const totalOtherExpenses =
      formState.freightTransportOtherExpenses +
      formState.stowageOtherExpenses +
      formState.warehousingOtherExpenses +
      formState.localExpensesOtherExpenses +
      formState.custodyOtherExpenses +
      formState.exonerationOtherExpenses +
      formState.agentOtherExpenses +
      formState.isdOtherExpenses +
      formState.policyOtherExpenses +
      formState.landTransportOtherExpenses +
      formState.goodViewOtherExpenses +
      formState.otherOtherExpenses;

    const newFormState = {
      ...formState,
      otherExpenses: totalOtherExpenses,
    };

    const newRows = rows.map((row) => {
      const freightTransportOtherExpenses =
        formState.freightTransportOtherExpenses * row.fobPortion;

      const stowageOtherExpenses =
        formState.stowageOtherExpenses * row.fobPortion;

      const warehousingOtherExpenses =
        formState.warehousingOtherExpenses * row.fobPortion;

      const localExpensesOtherExpenses =
        formState.localExpensesOtherExpenses * row.fobPortion;

      const custodyOtherExpenses =
        formState.custodyOtherExpenses * row.fobPortion;

      const exonerationOtherExpenses =
        formState.exonerationOtherExpenses * row.fobPortion;

      const agentOtherExpenses = formState.agentOtherExpenses * row.fobPortion;

      const isdOtherExpenses = formState.isdOtherExpenses * row.fobPortion;

      const policyOtherExpenses =
        formState.policyOtherExpenses * row.fobPortion;

      const landTransportOtherExpenses =
        formState.landTransportOtherExpenses * row.fobPortion;

      const goodViewOtherExpenses =
        formState.goodViewOtherExpenses * row.fobPortion;

      const otherOtherExpenses = formState.otherOtherExpenses * row.fobPortion;

      const totalOtherExpenses =
        freightTransportOtherExpenses +
        stowageOtherExpenses +
        warehousingOtherExpenses +
        localExpensesOtherExpenses +
        custodyOtherExpenses +
        exonerationOtherExpenses +
        agentOtherExpenses +
        isdOtherExpenses +
        policyOtherExpenses +
        landTransportOtherExpenses +
        goodViewOtherExpenses +
        otherOtherExpenses;
      return {
        ...row,
        freightTransportOtherExpenses: freightTransportOtherExpenses,
        stowageOtherExpenses: stowageOtherExpenses,
        warehousingOtherExpenses: warehousingOtherExpenses,
        localExpensesOtherExpenses: localExpensesOtherExpenses,
        custodyOtherExpenses: custodyOtherExpenses,
        exonerationOtherExpenses: exonerationOtherExpenses,
        agentOtherExpenses: agentOtherExpenses,
        isdOtherExpenses: isdOtherExpenses,
        policyOtherExpenses: policyOtherExpenses,
        landTransportOtherExpenses: landTransportOtherExpenses,
        goodViewOtherExpenses: goodViewOtherExpenses,
        otherOtherExpenses: otherOtherExpenses,
        totalOtherExpenses: totalOtherExpenses,
      };
    });
    if (createMode || editMode) {
      getDetails(newFormState, newRows);
    }
  }, [
    formState.freightTransportOtherExpenses,
    formState.stowageOtherExpenses,
    formState.warehousingOtherExpenses,
    formState.localExpensesOtherExpenses,
    formState.custodyOtherExpenses,
    formState.exonerationOtherExpenses,
    formState.agentOtherExpenses,
    formState.isdOtherExpenses,
    formState.policyOtherExpenses,
    formState.landTransportOtherExpenses,
    formState.goodViewOtherExpenses,
    formState.otherOtherExpenses,
  ]);

  const getDetails = async (sendFormState: FormState, rows: GridRowsProp) => {
    const listToSend: LiquidacionInterface = {
      ...(sendFormState as LiquidacionInterface),
      detail: rows
        .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
        .map((row) => ({
          ...(row as DetalleLiquidacionInterface),
        })),
    };
    const response = await fetchLiquidacionByAperturaImp(listToSend);
    const listaGet = response as LiquidacionInterface;

    const newFormState = {
      ...listaGet,
      importDate:
        typeof listaGet.importDate === 'string'
          ? parseISO(listaGet.importDate)
          : listaGet.importDate ?? new Date(),
      registrationDate:
        typeof listaGet.registrationDate === 'string'
          ? parseISO(listaGet.registrationDate)
          : listaGet.registrationDate,
      detail: [],
    };

    setFormState(newFormState);

    const temporalRows: GridRowsProp =
      listaGet.detail?.map((detail) => ({
        id: randomId(),
        ...detail,
        status: true,
      })) ?? [];

    const summary = setSummaryRow(temporalRows);

    setRows(summary);
  };
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <div
          style={{
            display: 'width',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>
            Desglose Otros Gastos
          </Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className={styles.tableContainer}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Transporte Flete</TableCell>
                  <TableCell>Estibaje</TableCell>
                  <TableCell>Bodegaje</TableCell>
                  <TableCell>Gastos Locales</TableCell>
                  <TableCell>Custodia</TableCell>
                  <TableCell>Exoneración</TableCell>
                  <TableCell>Agente</TableCell>
                  <TableCell>ISD</TableCell>
                  <TableCell>Poliza</TableCell>
                  <TableCell>Transporte Terrestre</TableCell>
                  <TableCell>Visto Bueno</TableCell>
                  <TableCell>Otros Gastos</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.productCode}</TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.freightTransportOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.stowageOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.warehousingOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.localExpensesOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.custodyOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.exonerationOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.agentOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.isdOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.policyOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.landTransportOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.goodViewOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.otherOtherExpenses)}
                    </TableCell>
                    <TableCell>
                      {setCurrencyNumber(row.totalOtherExpenses)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};
