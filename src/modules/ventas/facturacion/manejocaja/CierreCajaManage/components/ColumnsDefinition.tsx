import {
  GridActionsCellItem,
  GridColDef,
  GridRenderEditCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
  GridValueFormatterParams,
  useGridApiContext,
} from '@mui/x-data-grid';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { setCurrencyNumber, setDecimalPlacesString } from '@/functions';
import { Tooltip } from '@mui/material';
import { Cancel, Edit, Save } from '@mui/icons-material';
import { ParametersEnum } from '@/enums';
import { useSnackbar } from 'notistack';
import { InputNumber } from 'antd';

interface ColumnsDefinitionProps {
  createMode: boolean;
  editMode: boolean;
  rows: readonly GridValidRowModel[];
  setRows: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  rowModesModel: GridRowModesModel;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
}

export const ColumnsDefinition = (
  props: ColumnsDefinitionProps
): GridColDef[] => {
  const {
    createMode,
    editMode,
    rows,
    setRows,
    rowModesModel,
    setRowModesModel,
  } = props;

  /**
   * Handles the click event for the edit button in the grid row.
   * @param id - The ID of the grid row.
   */
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rows.find((row) => row.id === id);
    if (!currentRow) return;
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'denomination',
      headerName: 'Denominación Efectivo',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      minWidth: 150,
      flex: 1,
      cellClassName: 'centered-grid',
      editable: false,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const value =
          params.id === ParametersEnum.ID_ROW_TOTAL ||
          params.id === ParametersEnum.ID_ROW_SUBTOTAL
            ? params.value
            : setDecimalPlacesString(params.value, 2);
        return <span>{value}</span>;
      },
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      type: 'number',
      minWidth: 100,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      editable: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const value =
          params.id === ParametersEnum.ID_ROW_TOTAL ||
          params.id === ParametersEnum.ID_ROW_SUBTOTAL
            ? ''
            : params.value;
        return <span>{value}</span>;
      },
      renderEditCell: (params: GridRenderEditCellParams) => (
        <CustomNumberCell params={params} setRows={setRows} />
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      editable: false,
      sortable: false,
      disableColumnMenu: true,
      valueFormatter: (params: GridValueFormatterParams) =>
        setCurrencyNumber(Number(params.value)),
    },
  ];

  if (createMode || editMode) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 120,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (
          id === ParametersEnum.ID_ROW_TOTAL ||
          id === ParametersEnum.ID_ROW_SUBTOTAL
        ) {
          return [];
        } else if (isInEditMode) {
          return [
            <Tooltip title="Guardar">
              <GridActionsCellItem
                icon={<Save />}
                label="Guardar"
                onClick={handleSaveClick(id)}
              />
            </Tooltip>,
            <Tooltip title="No Guardar">
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancelar"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            </Tooltip>,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Editar"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
        ];
      },
    });
  }

  return columns;
};

type CustomCellProps = {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
};

function CustomNumberCell({ params, setRows }: CustomCellProps) {
  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number) => {
    const rows = apiRef.current
      .getAllRowIds()
      .map((id) => apiRef.current.getRow(id));
    const row = rows.find((row) => row.id === params.id);
    if (row === undefined) return;

    let quantity = value || 0;

    if (quantity < 0) {
      enqueueSnackbar('La cantidad no puede ser menor a 0', {
        variant: 'error',
      });
      quantity = 0;
    }

    const total = row.denomination * quantity;

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: quantity,
    });

    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'total',
      value: total,
    });

    const newRow = {
      ...rows.find((row) => row.id === params.id),
      quantity,
      total,
    } as GridValidRowModel;

    const newRows = rows.map((row) =>
      row.id === params.id ? newRow : row
    ) as GridValidRowModel[];

    const totalRow: GridValidRowModel = newRows.find(
      (row) => row.id === ParametersEnum.ID_ROW_TOTAL
    ) as GridValidRowModel;

    const totalRowValue = newRows
      .filter(
        (row) =>
          row.id !== ParametersEnum.ID_ROW_TOTAL &&
          row.id !== ParametersEnum.ID_ROW_SUBTOTAL
      )
      .reduce((acc, row) => acc + row.total, 0);

    const newTotalRow: GridValidRowModel = {
      ...totalRow,
      total: totalRowValue,
    };

    newRows.splice(
      newRows.findIndex((row) => row.id === ParametersEnum.ID_ROW_TOTAL),
      1,
      newTotalRow
    );

    setRows(newRows);
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return 0;
  }, [params.value]);

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={getValue()}
      onChange={(value) => onQuantityChange(value)}
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={0}
      onFocus={(e) => e.target.select()}
    />
  );
}
