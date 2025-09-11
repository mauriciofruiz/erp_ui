import { EstadoOrdenEnum } from '@/enums';
import {
  downloadPdf,
  setCurrencyNumber,
  setDecimalPlacesString,
} from '@/functions';
import { FormState, useListaEmpaqueAsync, useProveedorAsync } from '@/hooks';
import { Cancel, Delete, FireTruck, Save } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
import {
  GridEventListener,
  GridRenderCellParams,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { GridRowModel } from '@mui/x-data-grid';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { esES } from '@mui/x-data-grid/locales';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { EditQuatityCell, ProveedorEditCell } from './CustomFunctions';
import { useCallback, useEffect, useState } from 'react';
import { FooterListaEmpaque } from './FooterListaEmpaque';
import { PersonProviderType } from '@/types';
import { ToolbarListaEmpaque } from './ToolbarListaEmpaque';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

interface DetalleListaEmpaqueProps {
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
}

export const DetalleListaEmpaque = (props: DetalleListaEmpaqueProps) => {
  const {
    rows,
    setRows,
    formState,
    setFormState,
    createMode,
    editMode,
    rowModesModel,
    setRowModesModel,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { fetchDownloadTransportePdf } = useListaEmpaqueAsync();

  const { fetchTransportistas } = useProveedorAsync();

  const [transportistasList, setTransportistasList] = useState<
    PersonProviderType[]
  >([]);

  const fetchTransportistasList = useCallback(async () => {
    const response = await fetchTransportistas();
    setTransportistasList(response ?? []);
  }, []);

  useEffect(() => {
    fetchTransportistasList();
  }, [fetchTransportistasList]);

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    const currentRow = rows.find((row) => row.id === params.id);
    if (!currentRow) return;

    const emptyRow = currentRow.productId === null;

    if (emptyRow) {
      handleEmptyRows(currentRow);
    } else if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEmptyRows = (currentRow: any) => {
    enqueueSnackbar(`No se puede guardar una registro sin un item`, {
      variant: 'info',
    });
    const updatedRows = rows.filter((row) => row.id !== currentRow?.id);

    setRows(updatedRows);
  };

  /**
   * Handles the click event when the save button is clicked for a specific row.
   *
   * @param id - The ID of the row.
   */
  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rows.find((row) => row.id === id);
    if (!currentRow) return;

    const emptyRow = currentRow.productCode === '';

    if (emptyRow) {
      const existingRow = rows.find(
        (row) => row.productCode === currentRow?.productCode && row.id !== id
      );
      if (existingRow) {
        handleEmptyRows(currentRow);
      }
    } else {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  /**
   * Handles the click event for deleting a row.
   * @param id - The ID of the row to be deleted.
   */
  const handleDeleteClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (!row) return;
    let containerNumber = 0;
    if (row.packingListDetailId && row.packingListDetailIdetailId !== null) {
      const newRows = rows.map((row) =>
        row.id === id ? { ...row, status: false } : row
      );
      setRows(newRows);

      containerNumber = newRows.filter((row) => row.status === true).length;
    } else {
      const newRows = rows.filter((row) => row.id !== id);
      setRows(newRows);
      containerNumber = newRows.length;
    }
    setFormState({
      ...formState,
      numberContainers: containerNumber,
    });
  };

  /**
   * Handles the cancel click event for a specific row in the grid.
   * @param id - The ID of the row to cancel.
   */
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

  const { sucursales } = useSelector((state: RootState) => state.common);

  const ProductValue = ({ value }: { value: string[] }) => (
    <div>
      {value.map((codigo, index) => (
        <div key={index}>{codigo}</div>
      ))}
    </div>
  );

  const QuantityValue = ({ value }: { value: number[] }) => (
    <div>
      {value.map((quantity, index) => (
        <div key={index}>{setDecimalPlacesString(Number(quantity), 0)}</div>
      ))}
    </div>
  );

  const handleDownloadTransportClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      const provider = transportistasList.find(
        (provider) => provider.providerId === row.transportProviderId
      );

      const providerName = provider ? provider.personName : 'Sin Transportista';

      fetchDownloadTransportePdf(
        row.packingListId,
        row.transportProviderId
      ).then((response) => {
        downloadPdf(response, `LE #${row.packingListId} ${providerName}.pdf`);
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'containerNumber',
      headerName: 'Nro. Contendedor',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 80,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'container',
      headerName: 'Contenedor',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 150,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'string',
      editable: true,
      valueGetter: (params) => {
        return params.row.container ? params.row.container.toUpperCase() : '';
      },
      valueSetter: (params) => {
        const value = params.value ? params.value.toUpperCase() : '';
        return { ...params.row, container: value };
      },
    },
    {
      field: 'branchId',
      headerName: 'Sucursal',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      type: 'singleSelect',
      minWidth: 150,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
      editable: true,
      valueOptions: sucursales.map((sucursal) => ({
        value: sucursal.branchId,
        label: sucursal.name,
      })),
      renderCell: (params) => {
        const sucursal = sucursales.find(
          (sucursal) => sucursal.branchId === params.row.branchId
        );

        return sucursal ? sucursal.name : 'Sin Sucursal';
      },
    },
    {
      field: 'productCode',
      headerName: 'Código',
      type: 'string',
      minWidth: 150,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <ProductValue value={params.value as string[]} />
      ),
    },
    {
      field: 'productName',
      headerName: 'Producto',
      type: 'string',
      minWidth: 300,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <ProductValue value={params.value as string[]} />
      ),
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      minWidth: 100,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      editable: true,
      flex: 1,
      renderEditCell: (params) => (
        <EditQuatityCell
          params={params}
          rows={rows}
          setRows={setRows}
          quantityList={params.value as number[]}
        />
      ),
      renderCell: (params: GridRenderCellParams) => (
        <QuantityValue value={params.value as number[]} />
      ),
    },
    {
      field: 'transportShift',
      headerName: 'Turno Transporte',
      type: 'dateTime',
      minWidth: 150,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      valueGetter: (params) => {
        const date = new Date(params.row.transportShift);
        return date;
      },
    },
    {
      field: 'transportInvoice',
      headerName: 'Factura Transporte',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 150,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'string',
      editable: true,
    },
    {
      field: 'transportValue',
      headerName: 'Valor Transporte',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      editable: true,
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'transportProviderId',
      headerName: 'Transportista',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 250,
      flex: 2,
      cellClassName: 'centered-grid',
      align: 'center',
      editable: true,
      renderCell: (params) => {
        const provider = transportistasList.find(
          (provider) => provider.providerId === params.row.transportProviderId
        );

        return provider ? provider.personName : 'Sin Transportista';
      },
      renderEditCell: (params) => (
        <ProveedorEditCell
          params={params}
          rows={rows}
          setRows={setRows}
          transportistasList={transportistasList}
        />
      ),
    },
    {
      field: 'stevedoringValue',
      headerName: 'Valor Estibaje',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      editable: false,
      flex: 1,
      valueFormatter: (params) => setCurrencyNumber(Number(params.value)),
    },
    {
      field: 'receptionDate',
      headerName: 'Fecha Recepción',
      type: 'dateTime',
      minWidth: 150,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      valueGetter: (params) => {
        const date = params.row.receptionDate
          ? new Date(params.row.receptionDate)
          : null;
        return date;
      },
    },
    {
      field: 'observation',
      headerName: 'Novedades',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 200,
      flex: 1,
      cellClassName: 'centered-grid',
      align: 'center',
      type: 'string',
      editable: true,
      valueGetter: (params) => {
        return params.row.observation
          ? params.row.observation.toUpperCase()
          : '';
      },
    },
    {
      field: 'download',
      type: 'actions',
      headerName: 'Descargar',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const hasTransportist = rows.find(
          (row) => row.transportProviderId !== null
        );
        if (hasTransportist) {
          return [
            <Tooltip title="Descargar Transporte">
              <GridActionsCellItem
                icon={<FireTruck />}
                label="Descargar Transporte"
                className="textPrimary"
                onClick={handleDownloadTransportClick(id)}
                color="inherit"
              />
            </Tooltip>,
          ];
        } else {
          return [];
        }
      },
    },
  ];

  if (
    createMode ||
    (editMode && formState.statusId === EstadoOrdenEnum.EN_EDICION)
  ) {
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

        if (isInEditMode) {
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
            icon={<Delete />}
            label="Borrar"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    });
  }

  useEffect(() => {
    const hasZeroQuantity = rows.some((row) => row.quantity.includes(0));

    if (hasZeroQuantity) {
      const newRows = rows.map((row) => {
        const index = row.quantity.findIndex(
          (quantity: number) => quantity === 0
        );
        if (index !== -1) {
          row.productId.splice(index, 1);
          row.productCode.splice(index, 1);
          row.productName.splice(index, 1);
          row.quantity.splice(index, 1);
        }
        return row;
      });
      setRows(newRows);
    }
  }, [JSON.stringify(rows.map((item) => item.quantity))]);

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <StyledDataGrid
          rows={rows.filter((row) => row.status === true)}
          columns={columns}
          editMode={createMode || editMode ? 'cell' : undefined}
          isCellEditable={(params) => !params.row.isTransfered}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          getRowClassName={(params) =>
            params !== null ? `super-app-theme--intermitente` : ''
          }
          processRowUpdate={processRowUpdate}
          getRowHeight={() => 'auto'}
          columnHeaderHeight={45}
          sx={{ height: rows.length > 0 ? '100%' : 300 }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            footer: FooterListaEmpaque,
            toolbar: ToolbarListaEmpaque,
          }}
          slotProps={{
            footer: {
              formState,
              rows,
            },
          }}
          localeText={{
            ...esES.components.MuiDataGrid.defaultProps.localeText,
            toolbarDensity: 'Densidad',
            toolbarFilters: 'Filtros',
            toolbarColumns: 'Columnas',
            toolbarExport: 'Exportar',
          }}
        />
      </Grid>
    </Grid>
  );
};
