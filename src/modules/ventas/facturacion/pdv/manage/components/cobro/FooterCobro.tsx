import { FormaPagoEnum, ParametersEnum } from '@/enums';
import { setCurrencyNumber, setDecimalPlaces } from '@/functions';
import { FormState, StyledTableCell } from '@/hooks';
import { LabeledInputNumber } from '@/modules/layout';
import {
  CobroFacturaInterface,
  CrossedAdvanceClientType,
  DetalleCobroFacturaInterface,
} from '@/types';
import { Table, TableBody, TableRow } from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import { GridSlotsComponentsProps, GridValidRowModel } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    formState: FormState;
    cobros: CobroFacturaInterface[];
    setCobros: React.Dispatch<React.SetStateAction<CobroFacturaInterface[]>>;
    createMode: boolean;
    editMode: boolean;
    styles: ClassNameMap;
    rows: readonly GridValidRowModel[];
    setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
    rowsProductos: readonly GridValidRowModel[];
    setRowsProductos: React.Dispatch<
      React.SetStateAction<readonly GridValidRowModel[]>
    >;
    fetchRecalculate: () => void;
    currentCobro: CobroFacturaInterface;
    setCurrentCobro: React.Dispatch<
      React.SetStateAction<CobroFacturaInterface>
    >;
    diferencia: number;
    setDiferencia: React.Dispatch<React.SetStateAction<number>>;
    selectedAdvances: CrossedAdvanceClientType[];
  }
}
export function FooterCobro(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const selectedAdvancesFooter = useMemo(
    () => props.selectedAdvances || [],
    [props.selectedAdvances]
  );
  const [totalFinal, setTotalFinal] = useState(0);
  const diferencia = useMemo(() => props.diferencia || 0, [props.diferencia]);
  const setDiferencia = useMemo(
    () => props.setDiferencia || (() => {}),
    [props.setDiferencia]
  );
  const currentCobro = useMemo(
    () =>
      props.currentCobro || {
        paymentId: null,
        cashId: null,
        clientId: null,
        cashClosingId: null,
        paymentTotal: 0,
        advancePayment: 0,
        transportAdvancePayment: 0,
        changeValue: 0,
        isRecoveryPayment: false,
        paymentDetails: [],
      },
    [props.currentCobro]
  );

  const setCurrentCobro = useMemo(
    () => props.setCurrentCobro || (() => {}),
    [props.setCurrentCobro]
  );

  const [thereIsDiferencia, setThereIsDiferencia] = useState(false);

  const [thereIsAdvance, setThereIsAdvance] = useState(false);

  // const cobros = useMemo(() => props.cobros || [], [props.cobros]);
  const createMode = useMemo(
    () => props.createMode || false,
    [props.createMode]
  );

  const fetchRecalculate = useMemo(
    () => props.fetchRecalculate || (() => {}),
    [props.fetchRecalculate]
  );

  const setCobros = useMemo(
    () => props.setCobros || (() => {}),
    [props.setCobros]
  );

  const editMode = useMemo(() => props.editMode || false, [props.editMode]);

  const [diferenciaStatic, setDiferenciaStatic] = useState(0);

  const rows = useMemo(() => props.rows || [], [props.rows]);

  const styles: ClassNameMap = useMemo(
    () => props.styles || {},
    [props.styles]
  );

  const formState = useMemo(() => {
    return props.formState || {};
  }, [props.formState]);

  const setRows = useMemo(() => props.setRows || (() => {}), [props.setRows]);

  const [thereIsCreditNote, setThereIsCreditNote] = useState(false);

  useEffect(() => {
    const rowsWithoutTotal = rows.filter(
      (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
    );

    if (rowsWithoutTotal.length === 0) {
      setCurrentCobro({
        ...currentCobro,
        paymentTotal: 0,
        advancePayment: 0,
        transportAdvancePayment: 0,
        changeValue: 0,
        isRecoveryPayment: false,
      });
      setRows([]);
      return;
    }

    const paymentTotal = setDecimalPlaces(
      rowsWithoutTotal.reduce((acc, row) => acc + row.amount, 0),
      2
    );
    const detallesCobro: DetalleCobroFacturaInterface[] = rowsWithoutTotal.map(
      (row) => ({
        ...(row as DetalleCobroFacturaInterface),
      })
    );

    const isCreditNote = detallesCobro.some(
      (detalle) => detalle.paymentMethodId === FormaPagoEnum.NOTA_CREDITO
    );

    const cobro: CobroFacturaInterface = {
      ...currentCobro,
      paymentTotal,
      //paymentDetails: detallesCobro,
      advancePayment: isCreditNote ? 0 : currentCobro.advancePayment,
      isRecoveryPayment: false,
    };

    const allHasPaymentMethod = detallesCobro.every(
      (detalle: DetalleCobroFacturaInterface) => detalle.paymentMethodId !== ''
    );

    const allHasAmount = detallesCobro.every(
      (detalle: DetalleCobroFacturaInterface) => detalle.amount !== 0
    );

    const thereIsCredito = detallesCobro.some(
      (detalle: DetalleCobroFacturaInterface) =>
        detalle.paymentMethodId === FormaPagoEnum.CREDITO
    );

    const thereIsAdvance = detallesCobro.some(
      (detalle: DetalleCobroFacturaInterface) =>
        detalle.paymentMethodId === FormaPagoEnum.NOTA_CREDITO
    );

    const thereIsCreditCard =
      detallesCobro.some(
        (detalle: DetalleCobroFacturaInterface) =>
          detalle.paymentMethodId === FormaPagoEnum.TARJETA_CREDITO
      ) || selectedAdvancesFooter.some((advance) => advance.hasCreditCard);

    const hasPercentagePayment = formState.paymentMethodDiscountPercentage > 0;

    setThereIsCreditNote(isCreditNote);

    setThereIsAdvance(thereIsAdvance);

    if (
      (allHasPaymentMethod &&
        allHasAmount &&
        thereIsCreditCard &&
        hasPercentagePayment) ||
      thereIsCredito
    ) {
      fetchRecalculate();
    }
    const totalFinal = setDecimalPlaces(paymentTotal + cobro.changeValue, 2);

    setTotalFinal(totalFinal);

    setCurrentCobro(cobro);
  }, [
    JSON.stringify(
      rows
        .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
        .map((row) => row.paymentMethodId)
    ),
    JSON.stringify(
      rows
        .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
        .map((row) => row.amount)
    ),
  ]); // Usar la versión serializada como dependencia

  useEffect(() => {
    if (!currentCobro) {
      setDiferencia(0);
      return;
    }

    const allRowsAreEffectivo = rows
      .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
      .every((row) => row.paymentMethodId === FormaPagoEnum.EFECTIVO);

    const diferenciaTemp = setDecimalPlaces(
      allRowsAreEffectivo
        ? 0
        : currentCobro.paymentTotal -
            formState.totalToCharge -
            currentCobro.advancePayment -
            currentCobro.transportAdvancePayment,
      2
    );

    const diferenciaTempStatic = setDecimalPlaces(
      allRowsAreEffectivo
        ? 0
        : currentCobro.paymentTotal - formState.totalToCharge,
      2
    );

    setDiferenciaStatic(diferenciaTempStatic);

    setDiferencia(setDecimalPlaces(diferenciaTemp, 2));

    setThereIsDiferencia(diferenciaTempStatic > 0);

    setCobros([currentCobro]);
  }, [currentCobro, formState.totalToCharge, JSON.stringify(rows)]);

  const handleInputChange = (value: number, field: string) => {
    let maxValue = diferenciaStatic;
    if (field === 'advancePayment') {
      maxValue = maxValue - currentCobro.transportAdvancePayment;
    } else {
      maxValue = maxValue - currentCobro.advancePayment;
    }
    setCurrentCobro({
      ...currentCobro,
      [field]: value > maxValue ? maxValue : value,
    });
  };

  return (
    rows &&
    rows.length > 0 && (
      <Table>
        <TableBody>
          <TableRow>
            <StyledTableCell
              textAlign="center"
              fontWeight="bold"
              sx={{ height: '3.5vh' }}
            >
              <div className={styles.headerTitleGreen}>{'Cambio'}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="center"
              fontWeight="bold"
              sx={{ height: '3.5vh' }}
            >
              <div className={styles.headerTitleGreen}>{'Diferencia'}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="center"
              fontWeight="bold"
              sx={{ height: '3.5vh' }}
            >
              <div className={styles.headerTitleGreen}>
                {'Anticipo Cliente'}
              </div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="center"
              fontWeight="bold"
              sx={{ height: '3.5vh' }}
            >
              <div className={styles.headerTitleGreen}>{'Transporte'}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="center"
              fontWeight="bold"
              sx={{ height: '3.5vh' }}
            >
              <div className={styles.headerTitleGreen}>
                {'Total Transacción'}
              </div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell textAlign="right" width={'20%'}>
              <div>{setCurrencyNumber(currentCobro.changeValue)}</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'20%'}>
              <div>{setCurrencyNumber(diferencia)}</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'20%'}>
              <div>
                {
                  <LabeledInputNumber
                    inputNumberProps={{
                      onChange: (value) =>
                        handleInputChange(value as number, 'advancePayment'),
                      value: currentCobro.advancePayment,
                      min: 0,
                      defaultValue: 0,
                      controls: false,
                      precision: 2,
                      disabled: thereIsCreditNote,
                      readOnly:
                        thereIsAdvance ||
                        !thereIsDiferencia ||
                        (!createMode && !editMode),
                      prefix: '$',
                      onFocus: (e: any) => e.target.select(),
                    }}
                  />
                }
              </div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'20%'}>
              <div>
                {
                  <LabeledInputNumber
                    inputNumberProps={{
                      onChange: (value) =>
                        handleInputChange(
                          value as number,
                          'transportAdvancePayment'
                        ),
                      value: currentCobro.transportAdvancePayment,
                      min: 0,
                      defaultValue: 0,
                      controls: false,
                      precision: 2,
                      readOnly:
                        !thereIsDiferencia || (!createMode && !editMode),
                      prefix: '$',
                      onFocus: (e: any) => e.target.select(),
                    }}
                  />
                }
              </div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'20%'}>
              <div>{setCurrencyNumber(totalFinal)}</div>
            </StyledTableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  );
}
