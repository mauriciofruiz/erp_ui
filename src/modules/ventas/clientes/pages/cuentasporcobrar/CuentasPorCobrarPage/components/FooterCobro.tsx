import { FormaPagoEnum, ParametersEnum } from '@/enums';
import { setCurrencyNumber, setDecimalPlaces } from '@/functions';
import { FormState, StyledTableCell, useStyles } from '@/hooks';
import { AdvanceTypeCXC, DetalleCobroFacturaInterface } from '@/types';
import { Table, TableBody, TableRow } from '@mui/material';
import { GridSlotsComponentsProps, GridValidRowModel } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    formState: FormState;
    rows: readonly GridValidRowModel[];
    setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
    diferencia: number;
    setDiferencia: React.Dispatch<React.SetStateAction<number>>;
    selectedAdvancesCXC: AdvanceTypeCXC[];
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    invoiceFeeRows: readonly GridValidRowModel[];
    isNormalCharge: boolean;
  }
}
export function FooterCobro(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const isNormalCharge = useMemo(
    () => props.isNormalCharge || false,
    [props.isNormalCharge]
  );
  const selectedAdvancesFooter = useMemo(
    () => props.selectedAdvancesCXC || [],
    [props.selectedAdvancesCXC]
  );
  const [totalFinal, setTotalFinal] = useState(0);
  const diferencia = useMemo(() => props.diferencia || 0, [props.diferencia]);
  const setDiferencia = useMemo(
    () => props.setDiferencia || (() => {}),
    [props.setDiferencia]
  );

  const setFormState = useMemo(
    () => props.setFormState || (() => {}),
    [props.setFormState]
  );

  const rows = useMemo(() => props.rows || [], [props.rows]);

  const styles = useStyles();

  const formState = useMemo(() => {
    return props.formState || {};
  }, [props.formState]);

  const setRows = useMemo(() => props.setRows || (() => {}), [props.setRows]);

  const invoiceFeeRows = useMemo(
    () => props.invoiceFeeRows || [],
    [props.invoiceFeeRows]
  );

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const rowsWithoutTotal = rows.filter(
      (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
    );

    if (rowsWithoutTotal.length === 0) {
      setFormState((prev) => ({
        ...prev,
        paymentTotal: 0,
        advancePayment: 0,
        transportAdvancePayment: 0,
        changeValue: 0,
      }));
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

    const advancePayment = isCreditNote ? 0 : formState.advancePayment;

    const allHasPaymentMethod = detallesCobro.every(
      (detalle: DetalleCobroFacturaInterface) => detalle.paymentMethodId !== ''
    );

    const allHasAmount = detallesCobro.every(
      (detalle: DetalleCobroFacturaInterface) => detalle.amount !== 0
    );

    const thereIsCreditCard =
      detallesCobro.some(
        (detalle: DetalleCobroFacturaInterface) =>
          detalle.paymentMethodId === FormaPagoEnum.TARJETA_CREDITO
      ) || selectedAdvancesFooter.some((advance) => advance.hasCreditCard);

    const thereIsPaymentDiscount = invoiceFeeRows.some(
      (row) => row.hasPercentagePayment
    );

    if (
      allHasPaymentMethod &&
      allHasAmount &&
      thereIsCreditCard &&
      thereIsPaymentDiscount
    ) {
      enqueueSnackbar(
        'Recuerde que sí paga sus facturas con tarjeta de crédito se eliminará el descuento de forma de pago y cargará una nota de débito por el monto del descuento',
        { variant: 'error', autoHideDuration: 10000 }
      );
    }

    const totalFinal = setDecimalPlaces(
      paymentTotal + formState.changeValue,
      2
    );

    setTotalFinal(totalFinal);

    const allRowsAreEffectivo = rows
      .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
      .every((row) => row.paymentMethodId === FormaPagoEnum.EFECTIVO);

    const diferenciaTemp = isNormalCharge
      ? setDecimalPlaces(
          allRowsAreEffectivo
            ? 0
            : paymentTotal -
                formState.totalToCharge -
                advancePayment -
                formState.transportAdvancePayment,
          2
        )
      : 0;

    setDiferencia(setDecimalPlaces(diferenciaTemp, 2));

    setFormState((prev) => ({
      ...prev,
      paymentTotal,
      advancePayment,
    }));

    if (!formState.totalToCharge && !paymentTotal) {
      setDiferencia(0);
      return;
    }
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
    formState.totalToCharge,
  ]);

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
                {'Total Transacción'}
              </div>
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell textAlign="right" width={'33%'}>
              <div>{setCurrencyNumber(formState.changeValue)}</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'33%'}>
              <div>{setCurrencyNumber(diferencia)}</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'34%'}>
              <div>{setCurrencyNumber(totalFinal)}</div>
            </StyledTableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  );
}
