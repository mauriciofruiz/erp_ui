import { setCurrencyNumber, setDecimalPlacesString } from '@/functions';
import { FormState, StyledTableCell } from '@/hooks';
import { Table, TableBody, TableRow } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { GridSlotsComponentsProps } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    formState: FormState;
    rows: GridRowsProp;
  }
}

export function FooterListaEmpaque(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const form = useMemo(() => props.formState || {}, [props.formState]);

  const rows = useMemo(() => props.rows || [], [props.rows]);

  const [packedQuantityList, setPackedQuantityList] = useState(0);

  useEffect(() => {
    let accumulatedQuantity = 0;
    rows.forEach((item) => {
      item.quantity.forEach((quantity: number) => {
        accumulatedQuantity += quantity;
      });
    });
    setPackedQuantityList(accumulatedQuantity);
  }, [JSON.stringify(rows.map((item) => item.quantity))]);

  const pendingQuantity = useMemo(() => {
    return form.totalQuantity - packedQuantityList;
  }, [packedQuantityList, form.totalQuantity]);

  const totalTransport = useMemo(() => {
    return rows.reduce((acc, item) => {
      return Number(acc) + Number(item.transportValue);
    }, 0);
  }, [JSON.stringify(rows.map((item) => item.transportValue))]);

  const totalEstibaje = useMemo(() => {
    return rows.reduce((acc, item) => {
      return Number(acc) + Number(item.stevedoringValue);
    }, 0);
  }, [JSON.stringify(rows.map((item) => item.stevedoringValue))]);

  return (
    props.rows &&
    props.rows.length > 0 && (
      <Table>
        <TableBody>
          <TableRow>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'10%'}
              colSpan={1}
            >
              <div>Cant. Empacada</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
              <div>{setDecimalPlacesString(packedQuantityList, 2)}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'10%'}
              colSpan={1}
            >
              <div>Cant. Ordenes</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
              <div>{setDecimalPlacesString(form.totalQuantity, 2)}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'10%'}
              colSpan={1}
            >
              <div>Cant. Pendiente</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'9%'} colSpan={0.5}>
              <div>{setDecimalPlacesString(pendingQuantity, 2)}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'10%'}
              colSpan={1}
            >
              <div>Total Transporte</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'10%'} colSpan={1}>
              <div>{setCurrencyNumber(totalTransport)}</div>
            </StyledTableCell>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'10%'}
              colSpan={1}
            >
              <div>Total Estibaje</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'10%'} colSpan={1}>
              <div>{setCurrencyNumber(totalEstibaje)}</div>
            </StyledTableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  );
}
