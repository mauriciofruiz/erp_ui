import { TipoDepositoEnum } from "@/enums/TipoDepositoEnum";
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

export function DepositoFooter(
  props: NonNullable<GridSlotsComponentsProps["footer"]>
) {
  const rows = useMemo(() => {
    if (props.rows) {
      return props.rows.filter((row) => row && row.depositAmount > 0);
    }
    return [];
  }, [props.rows]);

  const setFormState = useMemo(
    () => props.setFormState || (() => {}),
    [props.setFormState]
  );

  const [totalDeposito, setTotalDeposito] = useState(0);

  useEffect(() => {
    setTotalDeposito(
      setDecimalPlaces(
        rows.reduce(
          (accumulator, row) => accumulator + parseFloat(row.depositAmount),
          0
        ),
        2
      )
    );

    setFormState((prevState: FormState) => ({
      ...prevState,
      depositAmount: setDecimalPlaces(totalDeposito, 2),
    }));
  }, [JSON.stringify(rows), totalDeposito]);

  return (
    <>
      {props.formState?.depositTypeId === TipoDepositoEnum.CONTABLE && (
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
                <div>{setCurrencyNumber(totalDeposito)} </div>
              </StyledTableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </>
  );
}
