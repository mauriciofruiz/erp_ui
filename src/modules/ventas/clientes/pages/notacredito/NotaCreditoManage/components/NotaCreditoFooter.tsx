import { TipoNotaCreditoEnum } from '@/enums';
import {
  getPercentageValue,
  setCurrencyNumber,
  setDecimalPlaces,
  setPercentageNumber,
} from '@/functions';
import { FormState, StyledTableCell } from '@/hooks';
import { ImpuestoDocumentoInterface, TaxRateInterface } from '@/types';
import { Table, TableBody, TableRow } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { GridSlotsComponentsProps } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    rows: GridRowsProp;
    formState: FormState;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    impuestos: TaxRateInterface[];
    taxes: ImpuestoDocumentoInterface[];
    setTaxes: React.Dispatch<
      React.SetStateAction<ImpuestoDocumentoInterface[]>
    >;
    createMode: boolean;
  }
}

export function NotaCreditoFooter(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const rows = useMemo(() => {
    if (props.rows) {
      return props.rows.filter((row) => row && row.returnedQuantity > 0);
    }
    return [];
  }, [props.rows]);

  const taxRates = useMemo(() => props.impuestos || [], [props.impuestos]);

  const taxes = useMemo(() => props.taxes || [], [props.taxes]);

  const setTaxes = useMemo(
    () => props.setTaxes || (() => { }),
    [props.setTaxes]
  );

  const createMode = useMemo(() => props.createMode, [props.createMode]);

  const formState = useMemo(() => {
    return props.formState || {};
  }, [props.formState]);

  const setFormState = useMemo(
    () => props.setFormState || (() => { }),
    [props.setFormState]
  );

  const isNotDevolution = formState.ncTypeId !== TipoNotaCreditoEnum.DEVOLUCION;

  const isAccountant = formState.ncTypeId === TipoNotaCreditoEnum.CONTABLE;

  const [subTotal, setSubTotal] = useState(0);
  const [subtotalNoTax, setSubtotalNoTax] = useState(0);
  const [totalMontoIva, setTotalMontoIva] = useState(0);
  const [totalNotaCredito, setTotalNotaCredito] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [groupedTaxes, setGroupedTaxes] = useState<
    ImpuestoDocumentoInterface[]
  >(taxes || []);

  useEffect(() => {
    const getTaxBaseAndAmount = (rows: GridRowsProp) => {
      const taxBase = rows.reduce((sum: number, row: any) => {
        const taxBase = isNaN(row.totalAfterDiscount)
          ? 0
          : row.totalAfterDiscount;
        return sum + taxBase;
      }, 0);

      const taxAmount = rows.reduce((sum: number, row: any) => {
        const ivaPercentage = taxRates.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        return (
          sum +
          (getPercentageValue(
            row.totalAfterDiscount,
            ivaPercentage.taxRatePercentage
          ) || 0)
        );
      }, 0);

      return { taxBase, taxAmount };
    };

    const groupedRows = (rows || [])
      .filter((row) => row && row.hasIva)
      .reduce((groups, row) => {
        if (row) {
          (groups[row.taxRateId] = groups[row.taxRateId] || []).push(row);
        }
        return groups;
      }, {});

    let result: ImpuestoDocumentoInterface[] = groupedTaxes;
    for (const taxRateId in groupedRows) {
      const rowsGrouped = groupedRows[taxRateId];
      const taxRate = taxRates.find((t) => t.taxRateId === Number(taxRateId));

      if (!taxRate) continue;

      const { taxBase, taxAmount } = getTaxBaseAndAmount(rowsGrouped);

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
      result.filter((tax) => existenceTaxCodes.includes(tax.taxCode))
    );

    setSubtotalNoTax(
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

    setSubTotal(
      setDecimalPlaces(
        rows
          .filter((row) => row.hasIva)
          .reduce(
            (accumulator, row) => accumulator + parseFloat(row.totalPrice),
            0
          ),
        2
      )
    );
    setDiscountValue(
      isNotDevolution
        ? 0
        : setDecimalPlaces(
          rows.reduce(
            (accumulator, row) =>
              accumulator + row.paymentMethodDiscountValue,
            0
          ),
          2
        )
    );
  }, [JSON.stringify(rows), JSON.stringify(taxRates), isNotDevolution, JSON.stringify(taxes)]);

  useEffect(() => {
    setTotalMontoIva(
      setDecimalPlaces(
        groupedTaxes.reduce(
          (accumulator, row) => accumulator + row.taxAmount,
          0
        ),
        2
      )
    );
  }, [groupedTaxes]);

  useEffect(() => {
    const totalNCTemporal = setDecimalPlaces(
      subTotal + totalMontoIva + subtotalNoTax - discountValue,
      2
    );
    setTotalNotaCredito(totalNCTemporal);

    setFormState((prevState: FormState) => ({
      ...prevState,
      subtotal: setDecimalPlaces(subTotal, 2),
      subtotalNoTax: setDecimalPlaces(subtotalNoTax, 2),
      taxValue: setDecimalPlaces(totalMontoIva, 2),
      total: setDecimalPlaces(totalNCTemporal, 2),
      paymentMethodDiscount: setDecimalPlaces(discountValue, 2),
    }));
    if (!createMode) {
      taxes.forEach((tax) => {
        let found = false;
        groupedTaxes.forEach((row) => {
          if (tax.taxCode === row.taxCode) {
            found = true;
          }
        });

        if (!found) {
          groupedTaxes.push({
            ...tax,
            taxState: false,
          });
        }
      });
    }
    setTaxes(groupedTaxes);
  }, [subTotal, subtotalNoTax, totalMontoIva, groupedTaxes, discountValue]);

  return (
    rows.length > 0 && (
      <Table>
        <TableBody>
          {!isAccountant && (
            <>
            <TableRow>
              <StyledTableCell textAlign="right" width={'55%'} colSpan={1}>
                <div> </div>
              </StyledTableCell>
              <StyledTableCell
                textAlign="left"
                fontWeight="bold"
                width={'15%'}
                colSpan={1}
              >
                <div>Subtotal:</div>
              </StyledTableCell>
              <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
                <div>{setCurrencyNumber(subTotal)}</div>
              </StyledTableCell>
            </TableRow>
            {!isNotDevolution && (
            <TableRow>
              <StyledTableCell textAlign="right" width={'55%'} colSpan={1}>
                <div> </div>
              </StyledTableCell>
              <StyledTableCell
                textAlign="left"
                fontWeight="bold"
                width={'15%'}
                colSpan={1}
              >
                <div>
                  Descuento Forma De Pago{' '}
                  {setPercentageNumber(
                    formState.paymentMethodDiscountPercentage,
                    2
                  )}
                </div>
              </StyledTableCell>
              <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
                <div>{setCurrencyNumber(discountValue)}</div>
              </StyledTableCell>
            </TableRow>
          )}
          {groupedTaxes
            .filter((row) => row.taxState)
            .map((row, index) => (
              <TableRow key={index}>
                <StyledTableCell colSpan={1} />
                <StyledTableCell textAlign="left" fontWeight="bold" colSpan={1}>
                  <div>IVA {row.taxDescription}</div>
                </StyledTableCell>
                <StyledTableCell textAlign="right" colSpan={1}>
                  <div>{setCurrencyNumber(row.taxAmount)}</div>
                </StyledTableCell>
              </TableRow>
            ))}
            </>
          )}
          <TableRow>
            <StyledTableCell textAlign="right" width={'55%'} colSpan={1}>
              <div> </div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>TOTAL:</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <div>{setCurrencyNumber(totalNotaCredito)} </div>
            </StyledTableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  );
}
