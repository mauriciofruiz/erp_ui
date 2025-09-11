import { setCurrencyNumber, setDecimalPlaces } from "@/functions";
import { FormState, StyledTableCell } from "@/hooks";
import { Table, TableBody, TableRow } from "@mui/material";
import { GridRowsProp, GridSlotsComponentsProps } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";

declare module "@mui/x-data-grid" {
  interface FooterPropsOverrides {
    rows: GridRowsProp;
    formState: FormState;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    createMode: boolean;
  }
}

export function NotaDebitoFooter(
  props: NonNullable<GridSlotsComponentsProps["footer"]>
) {
  const rows = useMemo(() => {
    if (props.rows) {
      return props.rows.filter((row) => row && row.returnedQuantity > 0);
    }
    return [];
  }, [props.rows]);

  const setFormState = useMemo(
    () => props.setFormState || (() => {}),
    [props.setFormState]
  );

  const [totalNotaDebito, setTotalNotaDebito] = useState(0);
  const [subTotal, setSubTotal] = useState(0);

  useEffect(() => {
    setSubTotal(
      setDecimalPlaces(
        rows
          .reduce(
            (accumulator, row) => accumulator + parseFloat(row.totalPrice),
            0
          ),
        2
      )
    );

    const totalNCTemporal = setDecimalPlaces(subTotal, 2);
    setTotalNotaDebito(totalNCTemporal);

    setFormState((prevState: FormState) => ({
      ...prevState,
      subtotal: setDecimalPlaces(subTotal, 2),
      subtotalNoTax: 0,
      taxValue: 0,
      total: setDecimalPlaces(totalNCTemporal, 2),
      paymentMethodDiscount: 0,
    }));
  }, [JSON.stringify(rows), subTotal]);

  return (
    rows.length > 0 && (
      <Table>
        <TableBody>
          <TableRow>
            <StyledTableCell textAlign="right" width={"55%"} colSpan={1}>
              <div> </div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={"15%"}
              colSpan={1}>
              <div>TOTAL:</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={"12%"} colSpan={1}>
              <div>{setCurrencyNumber(totalNotaDebito)} </div>
            </StyledTableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  );
}
