import { ParametersEnum } from '@/enums';
import {
  parseDateWithMiliseconds,
  setCurrencyNumber,
  setDecimalPlaces,
} from '@/functions';
import { useCommonDataGrid } from '@/hooks';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { PaperComponent } from '@/modules/layout';
import { AdvanceClientType, AdvanceTypeCXC } from '@/types';
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
import { useEffect, useMemo, useRef, useState } from 'react';

interface AnticiposDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  currentRow: GridValidRowModel;
  setCurrentRow: React.Dispatch<React.SetStateAction<GridValidRowModel>>;
  availableAdvances: AdvanceClientType[];
  selectedAdvances: AdvanceTypeCXC[];
  setSelectedAdvances: React.Dispatch<React.SetStateAction<AdvanceTypeCXC[]>>;
  setAvailableAdvances: React.Dispatch<
    React.SetStateAction<AdvanceClientType[]>
  >;
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
  } = props;

  const [rows, setRows] = useState<GridRowsProp>([]);

  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
  } = useCommonDataGrid(rows, setRows);

  const selectedAdvancesClient = useMemo(
    () =>
      selectedAdvances.filter(
        (advance) => advance.clientId === currentRow.clientId
      ),
    [JSON.stringify(selectedAdvances), currentRow.clientId]
  );

  const clientAdvances = useMemo(
    () =>
      availableAdvances.filter(
        (advance) => advance.clientId === currentRow.clientId
      ),
    [JSON.stringify(availableAdvances), currentRow.clientId]
  );

  useEffect(() => {
    if (currentRow.clientId === null) {
      setRows([]);
      return;
    }
    if (!openDialog) return;

    const calculateAmounts = (advance: AdvanceClientType) => {
      const advanceSelected = selectedAdvancesClient.filter(
        (selectedAdvance) =>
          selectedAdvance.clientId === advance.clientId &&
          selectedAdvance.documentId === advance.documentId &&
          selectedAdvance.documentTypeId === advance.documentTypeId
      );

      const advancesSelectedInvoiceFee = advanceSelected.filter(
        (selectedAdvance) =>
          selectedAdvance.invoiceFeeId === currentRow.invoiceFeeId
      );

      if (advancesSelectedInvoiceFee.length > 0) {
        const amoutCrossedTotal = advancesSelectedInvoiceFee.reduce(
          (a, b) => a + b.advanceAmount,
          0
        );
        return {
          ...advance,
          availableAmount: advance.availableAmount + amoutCrossedTotal,
          amountToCross: amoutCrossedTotal,
        };
      }

      const amoutCrossedTotal = advanceSelected.reduce(
        (a, b) => a + b.advanceAmount,
        0
      );
      return {
        ...advance,
        availableAmount: advance.availableStaticAmount - amoutCrossedTotal,
        amountToCross: 0,
      };
    };

    const availableAdvancesWithNewAmount = clientAdvances.map(calculateAmounts);

    const clientRows = availableAdvancesWithNewAmount.map((advance) => ({
      id: randomId(),
      ...advance,
    }));
    setRows(clientRows);
  }, [
    openDialog,
    selectedAdvancesClient,
    clientAdvances,
    currentRow.clientId,
    currentRow.invoiceFeeId,
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
      renderCell: (params) => {
        if (
          params.value === null ||
          params.value === undefined ||
          params.value === ''
        )
          return '';
        return parseDateWithMiliseconds(new Date(params.value).toISOString());
      },
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
      documentTypeName: 'TOTAL',
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
          advance.documentTypeId === row.documentTypeId &&
          advance.invoiceFeeId === currentRow.invoiceFeeId
      );

      if (advance) {
        advance.advanceAmount = row.amountToCross;
      } else if (row.amountToCross > 0) {
        temporalSelectedAdvances.push({
          documentId: row.documentId,
          documentTypeId: row.documentTypeId,
          documentNumber: row.documentNumber,
          invoiceFeeId: currentRow.invoiceFeeId,
          advanceAmount: row.amountToCross,
          clientId: currentRow.clientId,
          crossedAdvanceId: null,
          hasCreditCard: row.hasCredit
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
      apiRef.current.getRowParams(id).row.availableAmount,
      2
    );

    const totalCrosses = setDecimalPlaces(
      rows
        .filter((row) => row.id !== id)
        .map((row) => row.amountToCross)
        .reduce((a, b) => a + b, 0),
      2
    );

    const currentBalance = setDecimalPlaces(
      currentRow.documentStaticBalance -
        totalCrosses -
        currentRow.paymentAmount,
      2
    );

    if (value > maxAdvance) {
      enqueueSnackbar(
        `La valor ingresado no puede ser mayor al saldo del los anticipos disponibles`,
        {
          variant: 'warning',
        }
      );
      value = maxAdvance;
    }
    if (value > currentBalance) {
      enqueueSnackbar(
        `La valor ingresado no puede ser mayor al saldo del documento`,
        {
          variant: 'warning',
        }
      );
      value = currentBalance;
    }
    if (value < 0) {
      enqueueSnackbar(`El valor ingresado debe ser mayor a 0`, {
        variant: 'warning',
      });
      value = 0;
    }

    const newTotalAmount = totalCrosses + value;

    apiRef.current.setEditCellValue({
      id: id,
      field: params.field,
      value: value,
    });

    const documentBalance = setDecimalPlaces(
      currentRow.documentStaticBalance -
        currentRow.paymentAmount -
        newTotalAmount,
      2
    );

    setCurrentRow({
      ...currentRow,
      documentBalance,
      advanceAmount: newTotalAmount,
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
