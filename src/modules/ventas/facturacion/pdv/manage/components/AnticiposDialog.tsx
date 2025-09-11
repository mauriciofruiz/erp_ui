import { ParametersEnum } from '@/enums';
import {
  parseDateWithMiliseconds,
  setCurrencyNumber,
  setDecimalPlaces,
} from '@/functions';
import { FormState, useCommonDataGrid } from '@/hooks';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { PaperComponent } from '@/modules/layout';
import { AdvanceClientType, CrossedAdvanceClientType } from '@/types';
import { Dialog, DialogContent, DialogTitle, Grid } from '@mui/material';
import {
  GridColDef,
  GridRenderEditCellParams,
  GridRowId,
  GridRowsProp,
  GridValidRowModel,
  useGridApiContext,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { esES } from '@mui/x-data-grid/locales';
import { InputNumber } from 'antd';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';

interface AnticiposDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  currentRow: GridValidRowModel;
  setCurrentRow: React.Dispatch<React.SetStateAction<GridValidRowModel>>;
  availableAdvances: AdvanceClientType[];
  selectedAdvances: CrossedAdvanceClientType[];
  setSelectedAdvances: React.Dispatch<
    React.SetStateAction<CrossedAdvanceClientType[]>
  >;
  setAvailableAdvances: React.Dispatch<
    React.SetStateAction<AdvanceClientType[]>
  >;
  formState: FormState;
}

export const AnticiposDialog = (props: AnticiposDialogProps) => {
  const {
    openDialog,
    setOpenDialog,
    currentRow,
    setCurrentRow,
    availableAdvances,
    selectedAdvances,
    setSelectedAdvances,
    setAvailableAdvances,
    formState,
  } = props;

  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
  } = useCommonDataGrid(rows, setRows);

  useEffect(() => {
    if (currentRow.clientId === null) {
      setRows([]);
      return;
    }
    if (!openDialog) return;

    const calculateAmounts = (advance: AdvanceClientType) => {
      const advanceSelected = selectedAdvances.filter(
        (selectedAdvance) =>
          selectedAdvance.documentId === advance.documentId &&
          selectedAdvance.documentTypeId === advance.documentTypeId &&
          selectedAdvance.advanceAmount > 0
      );

      const amoutCrossedTotal = setDecimalPlaces(
        advanceSelected.reduce((a, b) => a + b.advanceAmount, 0),
        2
      );
      return {
        ...advance,
        availableAmount: setDecimalPlaces(
          advance.availableStaticAmount - amoutCrossedTotal,
          2
        ),
        amountToCross: amoutCrossedTotal,
      };
    };

    const availableAdvancesWithNewAmount =
      availableAdvances.map(calculateAmounts);

    const clientRows = availableAdvancesWithNewAmount.map((advance) => ({
      id: randomId(),
      ...advance,
    }));

    setRows(clientRows);
  }, [
    openDialog,
    JSON.stringify(selectedAdvances),
    JSON.stringify(availableAdvances),
    currentRow.clientId,
    currentRow.invoiceId,
  ]);

  const columns: GridColDef[] = [
    {
      field: 'issueDate',
      headerName: 'F. Emisión',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 30,
      flex: 0.5,
      type: 'date',
      valueFormatter: (params) =>
        parseDateWithMiliseconds(params.value as string),
    },
    {
      field: 'documentNumber',
      headerName: 'Número de documento',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
    },
    {
      field: 'branchName',
      headerName: 'Sucursal',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
    },
    {
      field: 'documentTypeName',
      headerName: 'Tipo de documento',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
    },
    {
      field: 'paymentMethodName',
      headerName: 'Método de Pago',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
    },
    {
      field: 'hasCreditCard',
      headerName: 'Incluye TC',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      type: 'boolean',
    },
    {
      field: 'advanceAmount',
      headerName: 'Valor del Anticipo',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      minWidth: 50,
      flex: 0.5,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'availableAmount',
      headerName: 'Valor del Disponible',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      minWidth: 50,
      flex: 0.5,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'amountToCross',
      headerName: 'Valor del Cruce',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      minWidth: 50,
      flex: 0.5,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      renderEditCell: (params) => {
        return (
          <OnChangeAmount
            params={params}
            currentRow={currentRow}
            setCurrentRow={setCurrentRow}
            formState={formState}
          />
        );
      },
    },
  ];

  const getTotals = (rowsNoTotal: readonly GridValidRowModel[]) => {
    const totalAdvanceAmount = rowsNoTotal
      .map((row) => row.advanceAmount)
      .reduce((a, b) => a + b, 0);
    const totalAvailableAmount = rowsNoTotal
      .map((row) => row.availableAmount)
      .reduce((a, b) => a + b, 0);
    const totalAmountToCross = rowsNoTotal
      .map((row) => row.amountToCross)
      .reduce((a, b) => a + b, 0);

    return {
      id: ParametersEnum.ID_ROW_TOTAL,
      documentNumber: '',
      branchName: '',
      documentTypeName: '',
      paymentMethodName: 'TOTAL',
      hasCreditCard: '',
      advanceAmount: totalAdvanceAmount,
      availableAmount: totalAvailableAmount,
      amountToCross: totalAmountToCross,
    };
  };

  const setRowsToCross = (rowsNoTotal: readonly GridValidRowModel[]) => {
    const temporalSelectedAdvances = selectedAdvances;

    rowsNoTotal.forEach((row) => {
      const advance = temporalSelectedAdvances.find(
        (advance) =>
          advance.documentId === row.documentId &&
          advance.documentTypeId === row.documentTypeId
      );

      if (advance) {
        advance.advanceAmount = row.amountToCross;
      } else if (row.amountToCross > 0) {
        temporalSelectedAdvances.push({
          crossedAdvanceId: null,
          documentId: row.documentId,
          documentTypeId: row.documentTypeId,
          documentNumber: row.documentNumber,
          advanceAmount: row.amountToCross,
          clientId: currentRow.clientId,
          hasCreditCard: row.hasCreditCard,
        });
      }
    });

    const finalSelectedAdvances = temporalSelectedAdvances.filter(
      (advance) => advance.advanceAmount > 0
    );

    const newAvailableAdvances = availableAdvances.map((advance) => {
      const advanceSelected = finalSelectedAdvances.filter(
        (selectedAdvance) =>
          selectedAdvance.documentId === advance.documentId &&
          selectedAdvance.documentTypeId === advance.documentTypeId
      );

      const totalCrossed = advanceSelected.reduce(
        (a, b) => a + b.advanceAmount,
        0
      );

      if (advanceSelected) {
        advance.availableAmount = advance.availableStaticAmount - totalCrossed;
      }

      return advance;
    });

    setAvailableAdvances([...newAvailableAdvances]);

    setSelectedAdvances([...finalSelectedAdvances]);
  };

  useEffect(() => {
    if (Array.isArray(rows) && rows.length > 0) {
      const rowsNoTotal = rows.filter(
        (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
      );
      if (rowsNoTotal.length > 0) {
        setRowsToCross(rowsNoTotal);
        const totalRow = getTotals(rowsNoTotal);
        setRows([...rowsNoTotal, totalRow]);
      }
    }
  }, [JSON.stringify(rows.map((row) => row.amountToCross))]);

  return (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      maxWidth="lg"
      fullWidth
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle
        style={{
          cursor: 'move',
          textAlign: 'center',
        }}
        id="draggable-dialog-title"
      >
        {'Anticipos'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <StyledDataGrid
              rows={rows}
              columns={columns}
              pagination
              getRowClassName={(params) =>
                params.id === ParametersEnum.ID_ROW_TOTAL
                  ? 'super-app-theme--true'
                  : `super-app-theme--null`
              }
              editMode="cell"
              getRowHeight={() => 'auto'}
              columnHeaderHeight={45}
              rowModesModel={rowModesModel}
              onRowModesModelChange={handleRowModesModelChange}
              onRowEditStop={handleRowEditStop}
              processRowUpdate={processRowUpdate}
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
              }}
              sx={{
                height: rows.length > 0 ? 'auto' : '300px',
              }}
              localeText={{
                ...esES.components.MuiDataGrid.defaultProps.localeText,
                toolbarDensity: 'Densidad',
                toolbarFilters: 'Filtros',
                toolbarColumns: 'Columnas',
                toolbarExport: 'Exportar',
              }}
              isCellEditable={(params) =>
                params.id !== ParametersEnum.ID_ROW_TOTAL &&
                params.field === 'amountToCross'
              }
              hideFooter
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

function OnChangeAmount(props: {
  params: GridRenderEditCellParams;
  currentRow: GridValidRowModel;
  setCurrentRow: React.Dispatch<React.SetStateAction<GridValidRowModel>>;
  formState: FormState;
}) {
  const { params, currentRow, setCurrentRow } = props;

  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const rows = apiRef.current
      .getAllRowIds()
      .filter((r) => r !== ParametersEnum.ID_ROW_TOTAL)
      .map((r) => apiRef.current.getRowParams(r).row);

    const maxAdvance = setDecimalPlaces(
      apiRef.current.getRowParams(id).row.availableStaticAmount,
      2
    );

    const totalCrosses = setDecimalPlaces(
      rows
        .filter((row) => row.id !== id)
        .map((row) => row.amountToCross)
        .reduce((a, b) => a + b, 0),
      2
    );

    // const currentBalance = setDecimalPlaces(
    //   formState.totalToCharge - totalCrosses,
    //   2
    // );

    if (value > maxAdvance) {
      enqueueSnackbar(
        `La valor ingresado no puede ser mayor al saldo del los anticipos disponibles`,
        {
          variant: 'warning',
        }
      );
      value = maxAdvance;
    }
    // if (value > currentBalance) {
    //   enqueueSnackbar(
    //     `La valor ingresado no puede ser mayor al saldo del documento`,
    //     {
    //       variant: 'warning',
    //     }
    //   );
    //   value = currentBalance;
    // }
    if (value < 0) {
      enqueueSnackbar(`El valor ingresado debe ser mayor a 0`, {
        variant: 'warning',
      });
      value = 0;
    }

    const newTotalAmount = setDecimalPlaces(totalCrosses + value, 2);

    apiRef.current.setEditCellValue({
      id: id,
      field: params.field,
      value: setDecimalPlaces(value, 2),
    });

    setCurrentRow({
      ...currentRow,
      amount: newTotalAmount,
    });
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={params.value !== null ? params.value : 0}
      onChange={(value) => onQuantityChange(value, params.id)}
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={2}
      onFocus={(e) => e.target.select()}
      style={{ flex: 1 }}
    />
  );
}
