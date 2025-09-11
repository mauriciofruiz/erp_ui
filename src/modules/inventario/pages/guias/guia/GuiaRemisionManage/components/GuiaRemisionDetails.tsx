import { EstadoEntregaEnum, ParametersEnum } from '@/enums';
import { FormState, useCommonDataGrid } from '@/hooks';
import { Grid } from '@mui/material';
import {
  GridColumnVisibilityModel,
  GridRenderEditCellParams,
  GridRowId,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { useEffect, useRef, useState } from 'react';
import {
  allowDecimalsMeaseurementUnit,
  getDecimalPlaces,
  setDecimalPlaces,
} from '@/functions';
import { InputNumber } from 'antd';
import { useSnackbar } from 'notistack';

export type GuiaRemisionDetailsProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

export const GuiaRemisionDetails: React.FC<GuiaRemisionDetailsProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  rows,
  setRows,
}) => {
  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    columns,
    setColumns,
  } = useCommonDataGrid(rows, setRows);

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      quantityToDispatch: false,
      quantityPending: false,
    });

  useEffect(() => {
    setColumns([
      {
        field: 'productCode',
        headerName: 'Código Producto',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
      },
      {
        field: 'productName',
        headerName: 'Item',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        flex: 1,
      },
      {
        field: 'unitMeasureName',
        headerName: 'Unidad Medida',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        flex: 1,
      },
      {
        field: 'quantity',
        headerName: 'Cantidad',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
        sortable: false,
        disableColumnMenu: true,
        valueFormatter: (params) => {
          const unitMeasureId = rows.find((row) => row.id === params.id)
            ?.unitMeasureId as number;
          if (allowDecimalsMeaseurementUnit(unitMeasureId)) {
            return setDecimalPlaces(params.value as number, 6);
          }
          return setDecimalPlaces(params.value as number, 0);
        },
      },
      {
        field: 'quantityToDispatch',
        headerName: 'Cantidad a Despachar',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'right',
        minWidth: 50,
        flex: 0.5,
        type: 'number',
        sortable: false,
        disableColumnMenu: true,
        valueFormatter: (params) => {
          const unitMeasureId = rows.find((row) => row.id === params.id)
            ?.unitMeasureId as number;
          if (allowDecimalsMeaseurementUnit(unitMeasureId)) {
            return setDecimalPlaces(params.value as number, 6);
          }
          return setDecimalPlaces(params.value as number, 0);
        },
        editable: true,
        renderEditCell: (params) => {
          return <InputNumberFunction params={params} setRows={setRows} />;
        },
      },
      {
        field: 'quantityPending',
        headerName: 'Cantidad Pendiente',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
        sortable: false,
        disableColumnMenu: true,
        valueFormatter: (params) => {
          const unitMeasureId = rows.find((row) => row.id === params.id)
            ?.unitMeasureId as number;
          if (allowDecimalsMeaseurementUnit(unitMeasureId)) {
            return setDecimalPlaces(params.value as number, 6);
          }
          return setDecimalPlaces(params.value as number, 0);
        },
      },
    ]);
  }, [rows.length]);

  useEffect(() => {
    if (Array.isArray(rows) && rows.length > 0) {
      const rowsNoTotal = rows.filter(
        (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
      );
      if (rowsNoTotal.length > 0) {
        const totalQuantity = rowsNoTotal
          .map((row) => row.quantity)
          .reduce((a, b) => a + b, 0);
        const totalToDispatch = rowsNoTotal
          .map((row) => row.quantityToDispatch)
          .reduce((a, b) => a + b, 0);
        const totalPending = rowsNoTotal
          .map((row) => row.quantityPending)
          .reduce((a, b) => a + b, 0);

        const totalRow = {
          id: ParametersEnum.ID_ROW_TOTAL,
          unitMeasureName: 'TOTAL',
          quantity: totalQuantity,
          quantityToDispatch: totalToDispatch,
          quantityPending: totalPending,
        };
        const isTotal = totalRow.quantityToDispatch === totalRow.quantity;
        setFormState((prev) => ({
          ...prev,
          deliveryStateId: isTotal
            ? EstadoEntregaEnum.DEPACHO_TOTAL
            : EstadoEntregaEnum.DESPACHO_PARCIAL,
        }));
        setRows([...rowsNoTotal, totalRow]);
      }
    }
  }, [JSON.stringify(rows.map((row) => row.quantityToDispatch))]);

  useEffect(() => {
    if (createMode || editMode) {
      setColumnVisibilityModel({
        quantityToDispatch: true,
        quantityPending: true,
      });
    }
  }, [createMode, editMode]);

  return (
    <Grid item xs={12}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        editMode="cell"
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) =>
          setColumnVisibilityModel(newModel)
        }
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        getRowClassName={(params) =>
          params.id === ParametersEnum.ID_ROW_TOTAL
            ? `super-app-theme--true`
            : 'super-app-theme--null'
        }
        processRowUpdate={processRowUpdate}
        getRowHeight={() => 'auto'}
        columnHeaderHeight={45}
        sx={{ height: rows.length > 0 ? '100%' : 300 }}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        isCellEditable={(params) => {
          return (
            (createMode || editMode) &&
            !formState.isTransfer &&
            params.id !== ParametersEnum.ID_ROW_TOTAL
          );
        }}
        hideFooter
      />
    </Grid>
  );
};

function InputNumberFunction(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
}) {
  const { params, setRows } = props;

  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = apiRef.current.getRowParams(id).row;
    if (row) {
      const quantityDispatched = row.quantityDispatched;
      const maximumQuantity = row.quantity - quantityDispatched;
      if (value > maximumQuantity) {
        enqueueSnackbar(
          `La cantidad ingresada no puede ser mayor a la disponible de ${maximumQuantity}`,
          {
            variant: 'warning',
          }
        );
        value = maximumQuantity;
      } else if (value < 0) {
        enqueueSnackbar(`La cantidad ingresado debe ser mayor a 0`, {
          variant: 'warning',
        });
        value = 0;
      }

      const quantityPending = maximumQuantity - value;

      apiRef.current.setEditCellValue({
        id: id,
        field: params.field,
        value: value,
      });

      const newRow = {
        ...row,
        quantityPending,
        quantityToDispatch: value,
      };
      const newRows = apiRef.current
        .getAllRowIds()
        .map((r) => (r === id ? newRow : apiRef.current.getRowParams(r).row));
      setRows(newRows);
    }
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
      precision={getDecimalPlaces(params.row.unitMeasureId as number)}
      onFocus={(e) => e.target.select()}
      style={{ flex: 1 }}
    />
  );
}
