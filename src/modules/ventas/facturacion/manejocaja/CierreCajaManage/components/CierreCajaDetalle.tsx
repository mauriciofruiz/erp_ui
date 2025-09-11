import { FormState } from '@/hooks';
import {
  Box,
  Checkbox,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ColumnsDefinition } from './ColumnsDefinition';
import {
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { ClassNameMap } from '@mui/styles';
import { CierreDetailInterface, SucursalType } from '@/types';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { setCurrencyNumber, setDecimalPlaces } from '@/functions';
import { useSnackbar } from 'notistack';
import { AccordionEgresos } from './AccordionEgresos';
import { FormaPagoEnum, ParametersEnum } from '@/enums';

export type CierreCajaDetalleProps = {
  createMode: boolean;
  editMode: boolean;
  rows: readonly GridValidRowModel[];
  setRows: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  rowModesModel: GridRowModesModel;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  styles: ClassNameMap;
  detallesCobro: CierreDetailInterface[];
  rowsForTable: CierreDetailInterface[];
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  formState: FormState;
  rowsEgresos: readonly GridValidRowModel[];
  setRowsEgresos: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  rowModesModelEgresos: GridRowModesModel;
  setRowModesModelEgresos: Dispatch<SetStateAction<GridRowModesModel>>;
  totalEgresos: number;
  setDetallesCobro: Dispatch<SetStateAction<CierreDetailInterface[]>>;
  sucursal: SucursalType | undefined;
};
export const CierreCajaDetalle: React.FC<CierreCajaDetalleProps> = ({
  createMode,
  editMode,
  rows,
  setRows,
  rowModesModel,
  setRowModesModel,
  styles,
  detallesCobro,
  rowsForTable,
  setFormState,
  formState,
  rowsEgresos,
  setRowsEgresos,
  rowModesModelEgresos,
  setRowModesModelEgresos,
  totalEgresos,
  setDetallesCobro,
  sucursal,
}) => {
  const columns = ColumnsDefinition({
    createMode,
    editMode,
    rows,
    setRows,
    rowModesModel,
    setRowModesModel,
  });

  const { enqueueSnackbar } = useSnackbar();

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.enterKeyDown) {
      const currentRow = rows.find((row) => row.id === params.id);
      if (!currentRow) return;
      setRowModesModel({
        ...rowModesModel,
        [params.id]: { mode: GridRowModes.View },
      });
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  useEffect(() => {
    let totalOtrasFormas = 0;

    const subTotalRow = rows.find(
      (row) => row.id === ParametersEnum.ID_ROW_SUBTOTAL
    );

    const totalRow = rows.find((row) => row.id === ParametersEnum.ID_ROW_TOTAL);

    if (rowsForTable.length > 0) {
      rowsForTable.forEach((row) => {
        totalOtrasFormas += row.amount;
      });
    }

    const transactionsValue = setDecimalPlaces(
      (subTotalRow?.total || 0) + totalOtrasFormas,
      2
    );

    const finalAmount = setDecimalPlaces(
      (totalRow?.total || 0) + totalOtrasFormas,
      2
    );

    const finalAmountSystem = setDecimalPlaces(transactionsValue, 2);

    const availableValue = setDecimalPlaces(
      Math.max((subTotalRow?.total || 0) - formState.initialAmount, 0),
      2
    );

    setFormState((prevState) => ({
      ...prevState,
      transactionsValue,
      finalAmount,
      finalAmountSystem,
      availableValue,
    }));

    if (finalAmount > finalAmountSystem) {
      enqueueSnackbar('El monto final es superior al monto del sistema', {
        variant: 'error',
      });
    }
  }, [rowsForTable, JSON.stringify(rows.map((row) => row.total))]);

  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});

  function Row(props: {
    row: CierreDetailInterface;
    open: boolean;
    setOpen: (open: boolean) => void;
  }) {
    const { row, open, setOpen } = props;

    const [detallesInside, setDetallesInside] =
      useState<CierreDetailInterface[]>(detallesCobro);

    const detailsFilteredByRow = useMemo(() => {
      return detallesInside.filter(
        (detail) => detail.paymentMethodId === row.paymentMethodId
      );
    }, [detallesInside, row.paymentMethodId]);

    const handleCheckboxChange =
      (chargeDetailId: number | null) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (chargeDetailId === null) return;
        const newDetails = detallesInside.map((detail) => {
          if (detail.chargeDetailId === chargeDetailId) {
            const updatedDetail = { ...detail };
            updatedDetail.isPhysicallyChecked = event.target.checked;
            return updatedDetail;
          }
          return detail;
        });
        setDetallesInside(newDetails);
        setDetallesCobro(newDetails);
      };

    const formasPagoList: { label: string; value: FormaPagoEnum }[] =
      useMemo(() => {
        return Object.keys(FormaPagoEnum)
          .filter((key): key is keyof typeof FormaPagoEnum =>
            isNaN(Number(key))
          )
          .map((key) => {
            const label = key.replace(/_/g, ' ');
            return { label: label, value: FormaPagoEnum[key] };
          });
      }, []);

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {
              formasPagoList.find((item) => item.value === row.paymentMethodId)
                ?.label
            }
          </TableCell>
          <TableCell>{row.quantity}</TableCell>
          <TableCell>{setCurrencyNumber(row.amount)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Revisado</TableCell>
                      <TableCell>Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailsFilteredByRow.map((detailRow, index) => (
                      <TableRow key={detailRow.chargeDetailId || index}>
                        <TableCell component="th" scope="row" />
                        <TableCell>
                          <Checkbox
                            checked={detailRow.isPhysicallyChecked}
                            onChange={handleCheckboxChange(
                              detailRow.chargeDetailId
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          {setCurrencyNumber(detailRow.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }

  return (
    <>
      <Grid item xs={12}>
        <AccordionEgresos
          rowsEgresos={rowsEgresos}
          setRowsEgresos={setRowsEgresos}
          createMode={createMode}
          editMode={editMode}
          formState={formState}
          totalRowsMemo={totalEgresos}
          rowModesModel={rowModesModelEgresos}
          setRowModesModel={setRowModesModelEgresos}
          sucursal={sucursal}
        />
      </Grid>

      <Grid item xs={6}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          editMode={createMode || editMode ? 'cell' : undefined}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          getRowClassName={(params) => {
            if (params.id === ParametersEnum.ID_ROW_TOTAL) {
              return 'super-app-theme--true';
            } else if (params.id === ParametersEnum.ID_ROW_SUBTOTAL) {
              return 'super-app-theme--info';
            } else {
              return 'super-app-theme--null';
            }
          }}
          processRowUpdate={processRowUpdate}
          getRowHeight={() => 'auto'}
          columnHeaderHeight={45}
          sx={{ height: rows.length > 0 ? '100%' : 300 }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          isCellEditable={(params) => {
            return (
              params.id !== ParametersEnum.ID_ROW_TOTAL &&
              params.id !== ParametersEnum.ID_ROW_SUBTOTAL
            );
          }}
          hideFooter
        />
      </Grid>
      <Grid item xs={6}>
        <div className={styles.tableContainer}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Forma De Pago</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowsForTable.map((row) => (
                  <Row
                    key={row.paymentMethodId}
                    row={row}
                    open={!!openRows[row.paymentMethodId]}
                    setOpen={(open) =>
                      setOpenRows((prev) => ({
                        ...prev,
                        [row.paymentMethodId]: open,
                      }))
                    }
                  />
                ))}
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell align="right">
                    {setCurrencyNumber(
                      rowsForTable.reduce((a, b) => a + b.amount, 0)
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Grid>
    </>
  );
};
