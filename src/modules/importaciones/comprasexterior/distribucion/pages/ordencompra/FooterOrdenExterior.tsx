import { setCurrencyNumber } from '@/functions';
import { FormState, StyledTableCell } from '@/hooks';
import { LabeledInputNumber } from '@/modules/layout';
import { Table, TableBody, TableRow } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { GridSlotsComponentsProps } from '@mui/x-data-grid';
import { useMemo } from 'react';

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    createMode: boolean;
    editMode: boolean;
    formState: FormState;
    setFormState: React.Dispatch<React.SetStateAction<FormState>>;
    rows: GridRowsProp;
    onInputNumberChange: (value: number, field: string) => void;
  }
}

export function FooterOrdenExterior(
  props: NonNullable<GridSlotsComponentsProps['footer']>
) {
  const form = useMemo(() => props.formState || {}, [props.formState]);

  const createMode = props.createMode ?? false;

  const editMode = props.editMode ?? false;

  const onInputNumberChange = props.onInputNumberChange ?? (() => {});
  return (
    props.rows &&
    props.rows.length > 0 && (
      <Table>
        <TableBody>
          <TableRow>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>Subtotal</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <div>{setCurrencyNumber(form.subtotal)}</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" fontWeight="bold" colSpan={2} />
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>Flete Internacional</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <LabeledInputNumber
                inputNumberProps={{
                  onChange: (value) =>
                    onInputNumberChange(
                      value as number,
                      'internationalFreight'
                    ),
                  value: form.internationalFreight,
                  min: 0,
                  defaultValue: 0,
                  controls: false,
                  precision: 2,
                  readOnly: !createMode && !editMode,
                  prefix: '$',
                  onFocus: (e: any) => e.target.select(),
                }}
                delay={500}
              />
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>Subtotal Fodinfa</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <div>{setCurrencyNumber(form.subtototalFodinfa)}</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" fontWeight="bold" colSpan={2} />
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>Insurance</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <LabeledInputNumber
                inputNumberProps={{
                  onChange: (value) =>
                    onInputNumberChange(value as number, 'insuranceValue'),
                  value: form.insuranceValue,
                  min: 0,
                  defaultValue: 0,
                  controls: false,
                  precision: 2,
                  readOnly: !createMode && !editMode,
                  prefix: '$',
                  onFocus: (e: any) => e.target.select(),
                }}
                delay={500}
              />
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>Subtotal Advalorem</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <div>{setCurrencyNumber(form.subtototalAdvalorem)}</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" fontWeight="bold" colSpan={2} />
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>Otros Gastos</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <LabeledInputNumber
                inputNumberProps={{
                  onChange: (value) =>
                    onInputNumberChange(value as number, 'otherExpenses'),
                  value: form.otherExpenses,
                  min: 0,
                  defaultValue: 0,
                  controls: false,
                  precision: 2,
                  readOnly: !createMode && !editMode,
                  prefix: '$',
                  onFocus: (e: any) => e.target.select(),
                }}
                delay={500}
              />
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell textAlign="right" fontWeight="bold" colSpan={4} />
            <StyledTableCell
              textAlign="left"
              fontWeight="bold"
              width={'15%'}
              colSpan={1}
            >
              <div>Total</div>
            </StyledTableCell>
            <StyledTableCell textAlign="right" width={'12%'} colSpan={1}>
              <LabeledInputNumber
                inputNumberProps={{
                  onChange: (value) =>
                    onInputNumberChange(value as number, 'totalValue'),
                  value: form.totalValue,
                  min: 0,
                  defaultValue: 0,
                  controls: false,
                  precision: 2,
                  readOnly: !createMode && !editMode,
                  prefix: '$',
                  onFocus: (e: any) => e.target.select(),
                }}
                delay={500}
              />
            </StyledTableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  );
}
