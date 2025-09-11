import {
  getPercentageValue,
  setCurrencyNumber,
  setDecimalPlaces,
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
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    impuestos: TaxRateInterface[];
    taxes: ImpuestoDocumentoInterface[];
    setTaxes: React.Dispatch<
      React.SetStateAction<ImpuestoDocumentoInterface[]>
    >;
    createMode: boolean;
  }
}

export function FooterNotaCredito(
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
    () => props.setTaxes || (() => {}),
    [props.setTaxes]
  );

  const createMode = useMemo(() => props.createMode, [props.createMode]);

  const setFormState = useMemo(
    () => props.setFormState || (() => {}),
    [props.setFormState]
  );

  const [subTotal, setSubTotal] = useState(0);
  const [subtotalNoTax, setSubtotalNoTax] = useState(0);
  const [totalMontoIva, setTotalMontoIva] = useState(0);
  const [totalNotaCredito, setTotalNotaCredito] = useState(0);
  const [groupedTaxes, setGroupedTaxes] = useState<
    ImpuestoDocumentoInterface[]
  >(taxes || []);

  useEffect(() => {
    const getTaxBaseAndAmount = (rows: GridRowsProp) => {
      const taxBase = rows.reduce((sum: number, row: any) => {
        const taxBase = isNaN(row.totalCost) ? 0 : row.totalCost;
        return sum + taxBase;
      }, 0);

      const taxAmount = rows.reduce((sum: number, row: any) => {
        const ivaPercentage = taxRates.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        return (
          sum +
          (getPercentageValue(row.totalCost, ivaPercentage.taxRatePercentage) ||
            0)
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
      const rowsGroupedTemp = groupedRows[taxRateId];
      const taxRate = taxRates.find((t) => t.taxRateId === Number(taxRateId));

      if (!taxRate) continue;

      const { taxBase, taxAmount } = getTaxBaseAndAmount(rowsGroupedTemp);

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
            (accumulator, row) => accumulator + parseFloat(row.totalCost),
            0
          ),
        2
      )
    );
  }, [JSON.stringify(rows), JSON.stringify(taxRates), JSON.stringify(taxes)]);

  useEffect(() => {
    setSubTotal(
      setDecimalPlaces(
        groupedTaxes.reduce((accumulator, row) => {
          const taxBase = isNaN(row.taxBase) ? 0 : row.taxBase;
          return accumulator + taxBase;
        }, 0),
        2
      )
    );
    setTotalMontoIva(
      setDecimalPlaces(
        groupedTaxes.reduce(
          (accumulator, row) => accumulator + row.taxAmount,
          0
        ),
        2
      )
    );
  }, [JSON.stringify(groupedTaxes)]);

  useEffect(() => {
    const totalNCTemporal = setDecimalPlaces(
      subTotal + totalMontoIva + subtotalNoTax,
      2
    );
    setTotalNotaCredito(totalNCTemporal);

    setFormState &&
      setFormState((prevState: any) => ({
        ...prevState,
        subtotal: setDecimalPlaces(subTotal, 2),
        vat: setDecimalPlaces(totalMontoIva, 2),
        total: setDecimalPlaces(totalNCTemporal, 2),
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
  }, [subTotal, subtotalNoTax, totalMontoIva, groupedTaxes]);

  return (
    rows.length > 0 && (
      <Table>
        <TableBody>
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
              <div>Subtotal Sin Iva:</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <div>{setCurrencyNumber(subtotalNoTax)}</div>
            </StyledTableCell>
          </TableRow>
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
