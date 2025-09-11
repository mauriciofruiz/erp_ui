'use client';
import { FormState } from '@/hooks';
import { ClientPersonCreditPostType, RetencionType } from '@/types';
import { Grid } from '@mui/material';
import {
  GridCellEditStopReasons,
  GridCellModes,
  GridCellModesModel,
  GridColumnVisibilityModel,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import React, { ChangeEvent, useEffect } from 'react';
import { ColDefFacturaVentas } from './ColDefFacturaVentas';
import { useSnackbar } from 'notistack';
import { esES } from '@mui/x-data-grid/locales';
import { ToolbarFacturaVenta } from './ToolbarFacturaVenta';
import { FooterFacturaVentas } from './FooterFacturaVentas';
import { ClassNameMap } from '@mui/styles';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

export type FacturaVentaRowsProps = {
  formState: FormState;
  rows: readonly GridValidRowModel[];
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
  createMode: boolean;
  editMode: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  onInputNumberChange: (value: number, field: string) => void;
  cellModesModel: GridCellModesModel;
  setCellModesModel: React.Dispatch<React.SetStateAction<GridCellModesModel>>;
  addNewRow: () => void;
  retencionList: RetencionType[];
  addButtonRef: React.RefObject<HTMLButtonElement>;
  styles: ClassNameMap;
  commonKeyEvents: (event: React.KeyboardEvent<HTMLFormElement>) => void;
  fetchRecalculate: () => void;
  selectedCliente: ClientPersonCreditPostType | null;
  thereIsDiscount: boolean;
  setThereIsDiscount: React.Dispatch<React.SetStateAction<boolean>>;
};

export const FacturaVentaRows: React.FC<FacturaVentaRowsProps> = ({
  formState,
  rows,
  setRows,
  createMode,
  editMode,
  cellModesModel,
  setCellModesModel,
  addNewRow,
  retencionList,
  addButtonRef,
  styles,
  commonKeyEvents,
  onInputNumberChange,
  fetchRecalculate,
  selectedCliente,
  thereIsDiscount,
  setThereIsDiscount,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  //const [triggeredByEnter, setTriggeredByEnter] = useState(false);

  // ********************************** DATA GRID *********************************************
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      retentions: false,
      branchId: false,
      availableQuantity: true,
    });

  useEffect(() => {
    setColumnVisibilityModel({
      retentions: false,
      branchId: false,
      availableQuantity: createMode || editMode,
    });
  }, [createMode, editMode]);

  const columns = ColDefFacturaVentas({
    createMode,
    editMode,
    rows,
    setRows,
    sucursalId: formState.branchId,
    invoiceStatusId: formState.invoiceStatusId,
  });

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    //setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));

    const { productCode, quantity, id } = newRow;
    const emptyRow = !productCode || quantity <= 0;

    if (emptyRow) {
      enqueueSnackbar('No se puede guardar una registro sin un item', {
        variant: 'info',
      });
      setRows(rows.filter((row) => row.id !== id));
      return {};
    }

    const repeatedCodeRow = rows.find(
      (row) => row.productCode === productCode && row.id !== id
    );

    if (repeatedCodeRow) {
      enqueueSnackbar(
        'Este producto ya se encuentra registrado, se agregó una unidad',
        {
          variant: 'info',
        }
      );
      const mergedRow = {
        ...repeatedCodeRow,
        quantity: repeatedCodeRow.quantity + quantity,
        isNew: false,
      };
      setRows(
        rows
          .filter((row) => row.id !== id && row.id !== repeatedCodeRow.id)
          .concat(mergedRow)
      );
      return mergedRow;
    } else {
      setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
      return updatedRow;
    }
  };

  const handleCellModesModelChange = (newRowModesModel: GridCellModesModel) => {
    setCellModesModel(newRowModesModel);
  };

  const handleCellEditStop: GridEventListener<'cellEditStop'> = (
    params,
    event
  ) => {
    if (params.reason === GridCellEditStopReasons.cellFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  useEffect(() => {
    fetchRecalculate();
  }, [
    ,
    JSON.stringify(rows.map((row) => row.quantity)),
    JSON.stringify(rows.map((row) => row.productId)),
    // JSON.stringify(rows.map((row) => row.retentionSourceId)),
    // JSON.stringify(rows.map((row) => row.retentionIVAId)),
    formState.paymentMethodDiscountPercentage,
  ]);

  // useEffect(() => {
  //   if (triggeredByEnter) {
  //     setTimeout(() => {
  //       setTriggeredByEnter(false);
  //       setAddRowState(true);
  //     }, 600); // Espera 3 segundos antes de ejecutar
  //   }
  // }, [triggeredByEnter]);

  const handleKeyEventCell: GridEventListener<'cellKeyDown'> = (
    params, // GridCellParams<any>
    event // MuiEvent<React.KeyboardEvent<HTMLElement>>
    //details // GridCallbackDetails
  ) => {
    // Verifica si la celda es editable y si alguna tecla modificadora está presionada junto con Enter
    if (
      params.isEditable &&
      (event.key === 'Enter' || event.key === 'Tab') &&
      params.field === 'productName' &&
      params.cellMode === GridCellModes.Edit
    ) {
      event.stopPropagation();
      event.preventDefault();
      setCellModesModel((oldModel) => ({
        ...oldModel,
        [params.id]: {
          ...cellModesModel[params.id],
          ['productName']: { mode: GridCellModes.View },
          ['quantity']: { mode: GridCellModes.Edit },
        },
      }));

      //handleStopEdit(params.id);
    } else if (
      params.isEditable &&
      event.key === 'Enter' &&
      params.field === 'quantity' &&
      params.cellMode === GridCellModes.Edit
    ) {
      event.stopPropagation();
      event.preventDefault();
      setCellModesModel((oldModel) => ({
        ...oldModel,
        [params.id]: {
          ...cellModesModel[params.id],
          ['productName']: { mode: GridCellModes.View },
          ['quantity']: { mode: GridCellModes.View },
        },
      }));
      //handleStopEdit(params.id);
      //setTriggeredByEnter(true);

      const thereIsAPreviousRowWithoutProduct = rows.some(
        (row) => row.productId === null
      );
      const thereIsACellEditing = rows
        .filter((row) => row.id !== params.id)
        .some((row) => {
          const cellModes = cellModesModel[row.id] || {};
          return (
            cellModes.productName?.mode === GridCellModes.Edit ||
            cellModes.quantity?.mode === GridCellModes.Edit
          );
        });
      if (thereIsAPreviousRowWithoutProduct || thereIsACellEditing) {
        enqueueSnackbar(
          'Complete la fila existente antes de agregar una nueva',
          {
            variant: 'warning',
          }
        );
        return;
      }
      addNewRow();
    } else if (
      params.isEditable &&
      (event.ctrlKey || event.shiftKey) &&
      event.key === 'Enter'
    ) {
      // Detiene la propagación y previene el comportamiento por defecto
      // cuando Enter se presiona con cualquier tecla modificadora (Ctrl, Shift, Alt, Meta)
      event.stopPropagation();
      event.preventDefault();
      // Aserción de tipo para convertir el evento a React.KeyboardEvent<HTMLFormElement>

      const formEvent =
        event as unknown as React.KeyboardEvent<HTMLFormElement>;
      commonKeyEvents(formEvent);
    }
  };

  // const handleProcessRowUpdateError = React.useCallback((error: Error) => {
  //   enqueueSnackbar(error.message, { variant: 'error' });
  // }, []);

  return (
    <Grid item xs={12}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        editMode={createMode || editMode ? 'cell' : undefined}
        cellModesModel={cellModesModel}
        // rowModesModel={rowModesModel}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) =>
          setColumnVisibilityModel(newModel)
        }
        //onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        onCellModesModelChange={handleCellModesModelChange}
        onCellEditStop={handleCellEditStop}
        getRowClassName={(params) =>
          params !== null ? `super-app-theme--null` : ''
        }
        processRowUpdate={processRowUpdate}
        // onProcessRowUpdateError={handleProcessRowUpdateError}
        getRowHeight={() => 'auto'}
        columnHeaderHeight={45}
        sx={{ height: rows.length > 0 ? '100%' : 300 }}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
          footer: FooterFacturaVentas,
          toolbar: ToolbarFacturaVenta,
        }}
        slotProps={{
          toolbar: {
            createMode,
            editMode,
            formState,
            addButtonRef,
            addNewRow,
          },
          footer: {
            retencionList,
            formState,
            rows,
            setRows,
            createMode,
            styles,
            editMode,
            onInputNumberChange,
            selectedCliente,
            thereIsDiscount,
            setThereIsDiscount,
          },
        }}
        localeText={{
          ...esES.components.MuiDataGrid.defaultProps.localeText,
          toolbarDensity: 'Densidad',
          toolbarFilters: 'Filtros',
          toolbarColumns: 'Columnas',
          toolbarExport: 'Exportar',
        }}
        onCellKeyDown={handleKeyEventCell}
      />
    </Grid>
  );
};
