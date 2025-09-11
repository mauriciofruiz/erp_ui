import {
  getPercentageValue,
  setCurrencyNumber,
  setDecimalPlaces,
} from '@/functions';
import { ImpuestoDocumentoInterface, TaxRateInterface } from '@/types';
import { Table, TableCell, TableFooter, TableRow } from '@mui/material';
import { GridRowsProp, GridSlotsComponentsProps } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    rows: GridRowsProp;
    setSubtotalIva: React.Dispatch<React.SetStateAction<number>>;
    setSubtotalZero: React.Dispatch<React.SetStateAction<number>>;
    setDiscountTotal: React.Dispatch<React.SetStateAction<number>>;
    setIvaTotal: React.Dispatch<React.SetStateAction<number>>;
    setTotalFinal: React.Dispatch<React.SetStateAction<number>>;
    impuestos: TaxRateInterface[];
    taxes: ImpuestoDocumentoInterface[];
    setTaxes: React.Dispatch<
      React.SetStateAction<ImpuestoDocumentoInterface[]>
    >;
    createMode: boolean;
  }
}
export function CustomFooterOrden(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const rows = useMemo(() => props.rows || [], [props.rows]);

  const taxRates = useMemo(() => props.impuestos || [], [props.impuestos]);

  const [subtotal, setSubtotal] = useState(0);

  const [zeroSubtotal, setZeroSubtotal] = useState(0);

  const [discount, setDiscount] = useState(0);

  const [iva, setIva] = useState(0);

  const [totalValue, setTotalValue] = useState(0);

  const taxesMemo = useMemo(() => props.taxes || [], [props.taxes]);

  const [groupedTaxes, setGroupedTaxes] =
    useState<ImpuestoDocumentoInterface[]>(taxesMemo);

  useEffect(() => {
    const getTaxBaseAndAmount = (rows: GridRowsProp) => {
      const taxBase = rows.reduce(
        (sum: number, row: any) => sum + Number(row.totalPrice),
        0
      );

      const taxAmount = rows.reduce((sum: number, row: any) => {
        const ivaPercentage = taxRates.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        return (
          sum +
          (getPercentageValue(
            Number(row.totalPrice) - Number(row.discountValue),
            ivaPercentage.taxRatePercentage
          ) || 0)
        );
      }, 0);

      return { taxBase, taxAmount };
    };

    // ************************** Impuestos ********************************

    const groupedRows = rows
      .filter((row) => row.hasIva)
      .reduce((groups, row) => {
        (groups[row.taxRateId] = groups[row.taxRateId] || []).push(row);
        return groups;
      }, {});

    let result: ImpuestoDocumentoInterface[] = groupedTaxes;

    if (Object.keys(groupedRows).length === 0) {
      const newResult = result
        .filter((tax: ImpuestoDocumentoInterface) => tax.taxId !== null)
        .map((tax: ImpuestoDocumentoInterface) => {
          return {
            ...tax,
            taxState: false,
          };
        });

      result = newResult;
    }

    for (const taxRateId in groupedRows) {
      const rows = groupedRows[taxRateId];
      const taxRate = taxRates.find((t) => t.taxRateId === Number(taxRateId));

      if (!taxRate) continue;

      const { taxBase, taxAmount } = getTaxBaseAndAmount(rows);

      const taxRateResult = result.find(
        (t) => t.taxCode === taxRate.taxRateCode
      );

      if (taxRateResult) {
        taxRateResult.taxBase = taxBase;
        taxRateResult.taxAmount = taxAmount;
        result[result.indexOf(taxRateResult)] = taxRateResult;
      } else {
        const taxDocument: ImpuestoDocumentoInterface = {
          taxId: null,
          documentId: null,
          documentTypeId: null,
          voucherId: null,
          taxPercentage: taxRate.taxRatePercentage,
          taxDescription: taxRate.taxDescription,
          taxCode: taxRate.taxRateCode,
          accountId: taxRate.purchaseAccountId ?? null,
          taxBase,
          taxAmount,
          taxState: taxRate.taxRateState,
        };

        result.push(taxDocument);
      }
    }

    const keys = Object.keys(groupedRows);

    const existenceTaxCodes = keys.map((taxRateId) => {
      return taxRates.find((tax) => tax.taxRateId === Number(taxRateId))
        ?.taxRateCode;
    });

    setGroupedTaxes(
      result.length === 0
        ? []
        : result.filter((tax) => existenceTaxCodes.includes(tax.taxCode))
    );

    setDiscount(
      setDecimalPlaces(
        rows.reduce(
          (accumulator, row) => accumulator + parseFloat(row.discountValue),
          0
        ),
        2
      )
    );

    setZeroSubtotal(
      setDecimalPlaces(
        rows
          .filter((row) => !row.hasIva)
          .reduce(
            (accumulator, row) => accumulator + parseFloat(row.totalPrice),
            0
          ),
        2
      )
    );
  }, [rows, taxRates]);

  const subtotalMemo = useMemo(
    () =>
      setDecimalPlaces(
        groupedTaxes.reduce((accumulator, row) => accumulator + row.taxBase, 0),
        2
      ),
    [groupedTaxes]
  );

  const ivaMemo = useMemo(
    () =>
      setDecimalPlaces(
        groupedTaxes.reduce(
          (accumulator, row) => accumulator + row.taxAmount,
          0
        ),
        2
      ),
    [groupedTaxes]
  );

  useEffect(() => {
    setSubtotal(subtotalMemo);
    setIva(ivaMemo);
  }, [subtotalMemo, ivaMemo]);

  useEffect(() => {
    const totalTemporal = subtotal + zeroSubtotal - discount + iva;

    setTotalValue(totalTemporal);
    props.setSubtotalIva
      ? props.setSubtotalIva(setDecimalPlaces(subtotal, 2))
      : null;
    props.setSubtotalZero
      ? props.setSubtotalZero(setDecimalPlaces(zeroSubtotal, 2))
      : null;
    props.setDiscountTotal
      ? props.setDiscountTotal(setDecimalPlaces(discount, 2))
      : null;
    props.setIvaTotal ? props.setIvaTotal(setDecimalPlaces(iva, 2)) : null;
    props.setTotalFinal
      ? props.setTotalFinal(setDecimalPlaces(totalTemporal, 2))
      : null;
    if (props.setTaxes) {
      if (!props.createMode) {
        taxesMemo.forEach((tax) => {
          let found = false;
          groupedTaxes.forEach((row) => {
            if (tax.taxCode === row.taxCode) {
              found = true;
            }
          });

          if (!found) {
            groupedTaxes.push({
              ...tax,
              taxState: true,
            });
          }
        });
      }
      props.setTaxes(groupedTaxes);
    }
  }, [props, subtotal, zeroSubtotal, discount, iva, taxesMemo, groupedTaxes]);

  return props.rows && props.rows.length > 0 ? (
    <Table>
      <TableFooter>
        <TableRow>
          <TableCell
            style={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'right' }}
          >
            Subtotal IVA:
          </TableCell>
          <TableCell
            style={{ textAlign: 'right', fontSize: '16px' }}
            width={'150px'}
          >
            {setCurrencyNumber(subtotal as number)}
          </TableCell>
          <TableCell width={'85px'}></TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            style={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'right' }}
          >
            Subtotal Sin IVA:
          </TableCell>
          <TableCell
            style={{ textAlign: 'right', fontSize: '16px' }}
            width={'150px'}
          >
            {setCurrencyNumber(zeroSubtotal as number)}
          </TableCell>
          <TableCell width={'85px'}></TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            style={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'right' }}
          >
            Descuento:
          </TableCell>
          <TableCell
            style={{ textAlign: 'right', fontSize: '16px' }}
            width={'150px'}
          >
            {setCurrencyNumber(discount as number)}
          </TableCell>
          <TableCell width={'85px'}></TableCell>
        </TableRow>
        {groupedTaxes
          .filter((row) => row.taxState)
          .map((row, index) => (
            <TableRow key={index}>
              <TableCell
                style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  textAlign: 'right',
                }}
              >
                IVA {row.taxDescription}:
              </TableCell>
              <TableCell
                style={{ textAlign: 'right', fontSize: '16px' }}
                width={'150px'}
              >
                {setCurrencyNumber(row.taxAmount as number)}
              </TableCell>
              <TableCell width={'85px'}></TableCell>
            </TableRow>
          ))}
        <TableRow>
          <TableCell
            style={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'right' }}
          >
            Total:
          </TableCell>
          <TableCell
            style={{ textAlign: 'right', fontSize: '16px' }}
            width={'150px'}
          >
            {setCurrencyNumber(totalValue as number)}
          </TableCell>
          <TableCell width={'85px'}></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ) : null;
}
