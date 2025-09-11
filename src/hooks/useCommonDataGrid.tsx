import { useState } from 'react';
import {
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { GridColDef } from '@mui/x-data-grid';
import { GridRowId } from '@mui/x-data-grid';
import { TaxRateInterface } from '@/types';
import { randomId } from '@mui/x-data-grid-generator';

export const useCommonDataGrid = (
  rows: GridRowsProp,
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>
) => {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [columns, setColumns] = useState<GridColDef[]>([]);

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    const currentRow = rows.find((row) => row.id === params.id);
    if (!currentRow) return;

    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    const rowToDelete = rows.find((row) => row.id === id);
    if (rowToDelete) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleDuplicateClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (!row) return;

    const newRow = { ...row, id: randomId() };
    setRows([...rows, newRow]);
  };

  const ImpuestoValue = ({
    value,
    impuestos,
  }: {
    value: number;
    impuestos: TaxRateInterface[];
  }) => {
    const impuesto = impuestos.map((impuesto: TaxRateInterface) => {
      if (impuesto.taxRateId === value) {
        return impuesto.taxDescription;
      }
      return null;
    });

    return <div>{impuesto}</div>;
  };

  return {
    columns,
    setColumns,
    rowModesModel,
    setRowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleDeleteClick,
    ImpuestoValue,
    handleDuplicateClick,
  };
};
