import { ParametersEnum } from '@/enums';
import {
  parseDateWithMiliseconds,
  setCurrencyNumber,
  setDecimalPlaces,
} from '@/functions';
import { useCommonDataGrid, useCuentasPorCobrarAsync } from '@/hooks';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { PaperComponent } from '@/modules/layout';
import { cxcReprogramType } from '@/types';
import { Add } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import {
  GridColDef,
  GridRenderEditCellParams,
  GridRowId,
  GridRowsProp,
  GridToolbarContainer,
  GridValidRowModel,
  useGridApiContext,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { esES } from '@mui/x-data-grid/locales';
import { InputNumber } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';

interface ReprogramDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentRow: GridValidRowModel;
  handleFinishTransaction: () => void;
}

export const ReprogramDialog = (props: ReprogramDialogProps) => {
  const { open, setOpen, currentRow, handleFinishTransaction } = props;

  const [rows, setRows] = useState<GridRowsProp>([]);

  const [isValidatedFees, setIsValidatedFees] = useState(true);

  const { fecthSaveFee } = useCuentasPorCobrarAsync();

  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
  } = useCommonDataGrid(rows, setRows);

  useEffect(() => {
    if (currentRow.invoiceFeeId === null) {
      setRows([]);
      return;
    }
    if (!open) return;

    const firstRow: GridValidRowModel = {
      id: randomId(),
      numberFee: currentRow.numberFee,
      daysCredit: currentRow.daysLate,
      expirationDate: new Date(currentRow.documentDueDate).toISOString(),
      amountFee: currentRow.documentStaticBalance,
    };
    setRows([firstRow]);
  }, [open, currentRow.invoiceFeeId]);

  const columns: GridColDef[] = [
    {
      field: 'numberFee',
      headerName: 'Número Cuota',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'daysCredit',
      headerName: 'Plazo',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      renderEditCell: (params) => {
        return (
          <OnChangeCreditDays
            params={params}
            currentRow={currentRow}
            setRows={setRows}
          />
        );
      },
    },
    {
      field: 'expirationDate',
      headerName: 'Fecha Vencimiento',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: false,
      renderCell: (params) => {
        if (params.id === ParametersEnum.ID_ROW_TOTAL) return '';
        return parseDateWithMiliseconds(params.value as string);
      },
    },
    {
      field: 'amountFee',
      headerName: 'Valor $',
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
            setIsValidatedFees={setIsValidatedFees}
          />
        );
      },
    },
  ];

  const getTotals = (rowsNoTotal: readonly GridValidRowModel[]) => {
    const totalAmount = rowsNoTotal
      .map((row) => row.amountFee)
      .reduce((a, b) => a + b, 0);

    return {
      id: ParametersEnum.ID_ROW_TOTAL,
      numberFee: null,
      daysCredit: null,
      expirationDate: 'Total',
      amountFee: totalAmount,
    };
  };

  useEffect(() => {
    if (Array.isArray(rows) && rows.length > 0) {
      const rowsNoTotal = rows.filter(
        (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
      );
      if (rowsNoTotal.length > 0) {
        const totalRow = getTotals(rowsNoTotal);
        setRows([...rowsNoTotal, totalRow]);
      }
    }
  }, [JSON.stringify(rows.map((row) => row.amountFee))]);

  const handleConfirm = () => {
    const body: cxcReprogramType = {
      clientId: currentRow.clientId,
      invoiceFeeId: currentRow.invoiceFeeId,
      cxcReprogramList: rows
        .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
        .map((row) => ({
          numberFee: row.numberFee,
          daysCredit: row.daysCredit,
          expirationDate: row.expirationDate,
          amountFee: row.amountFee,
        })),
    } as cxcReprogramType;

    fecthSaveFee(body).then(() => {
      setOpen(false);
      handleFinishTransaction();
    });
  };
  return (
    <Dialog
      open={open}
      maxWidth="md"
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
        {'Reprogramación de Cuotas'}
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
                toolbar: Toolbar,
              }}
              slotProps={{
                toolbar: {
                  currentRow,
                  rows,
                  setRows,
                },
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
                params.id !== ParametersEnum.ID_ROW_TOTAL
              }
              hideFooter
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">
          Cancelar
        </Button>
        <Button
          color="primary"
          disabled={!isValidatedFees}
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
function Toolbar(props: {
  currentRow: GridValidRowModel;
  rows: GridRowsProp;
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
}) {
  const { currentRow, rows, setRows } = props;

  const handleClick = () => {
    const numberFee =
      rows.filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL).length + 1;
    const totalAmount = currentRow.documentStaticBalance;
    const amountFeeIsExact =
      Number.isInteger(totalAmount / numberFee) &&
      (totalAmount / numberFee).toFixed(2) ===
        (totalAmount / numberFee).toString();
    const basicAmount = setDecimalPlaces(totalAmount / numberFee, 2);
    const daysCredit = currentRow.daysLate * numberFee;

    const expirationDate = new Date(
      dayjs(currentRow.documentDueDate)
        .add(daysCredit, 'day')
        .format('YYYY-MM-DD')
    ).toISOString();
    const newRow = {
      id: randomId(),
      numberFee,
      daysCredit,
      expirationDate,
      amountFee: amountFeeIsExact
        ? basicAmount
        : setDecimalPlaces(totalAmount - basicAmount * (numberFee - 1), 2),
    };

    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) => ({
        ...row,
        amountFee: basicAmount,
      }));
      return [...updatedRows, newRow];
    });
  };
  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: '10px',
      }}
    >
      <Button
        color="primary"
        startIcon={<Add />}
        onClick={() => handleClick()}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1, width: '160px' }}
      >
        Agregar Cuota
      </Button>
    </GridToolbarContainer>
  );
}

function OnChangeCreditDays(props: {
  params: GridRenderEditCellParams;
  currentRow: GridValidRowModel;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
}) {
  const { params, currentRow, setRows } = props;

  const apiRef = useGridApiContext();

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

    const expirationDate = new Date(
      dayjs(currentRow.documentIssueDate).add(value, 'day').format('YYYY-MM-DD')
    ).toISOString();

    apiRef.current.setEditCellValue({
      id: id,
      field: params.field,
      value: value,
    });

    const newRows = rows.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          daysCredit: value,
          expirationDate,
        };
      }
      return row;
    });
    setRows(newRows);
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
      precision={0}
      onFocus={(e) => e.target.select()}
      style={{ flex: 1 }}
    />
  );
}

function OnChangeAmount(props: {
  params: GridRenderEditCellParams;
  currentRow: GridValidRowModel;
  setIsValidatedFees: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { params, currentRow, setIsValidatedFees } = props;

  const apiRef = useGridApiContext();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const rows = apiRef.current
      .getAllRowIds()
      .filter((r) => r !== ParametersEnum.ID_ROW_TOTAL && r !== id)
      .map((r) => apiRef.current.getRowParams(r).row);

    const totalRows = rows.reduce((acc, row) => acc + row.amountFee, 0) + value;

    setIsValidatedFees(totalRows === currentRow.documentStaticBalance);

    apiRef.current.setEditCellValue({
      id: id,
      field: params.field,
      value: value,
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
