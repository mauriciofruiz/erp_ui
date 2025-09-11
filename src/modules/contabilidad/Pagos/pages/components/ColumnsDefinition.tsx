import { EstadoPagoEnum, ParametersEnum } from '@/enums';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import {
  AutocompleteAperturaImportacionCell,
  AutocompleteEditAccountCell,
  AutocompleteEditEmployeeCell,
  AutocompleteEditProviderCell,
  CustomUpdateTotalCell,
} from './CustomCells';
import { Dispatch, SetStateAction } from 'react';
import { setCurrencyNumber } from '@/functions';
import { SucursalType } from '@/types';
import { Tooltip } from '@mui/material';
import { Cancel, ContentCopy, Delete, Edit, Save } from '@mui/icons-material';
import { randomId } from '@mui/x-data-grid-generator';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSnackbar } from 'notistack';

interface ColumnsProps {
  createMode: boolean;
  editMode: boolean;
  isAdvancePayment: boolean;
  rows: GridRowsProp;
  setRows: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  accountId: number;
  sucursales: SucursalType[];
  rowModesModel: GridRowModesModel;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  handleEmptyRows: (currentRow: GridValidRowModel) => void;
  paymentStatusId: number;
  totalValue: number;
}

export const ColumnsDefinition = (props: ColumnsProps): GridColDef[] => {
  const {
    createMode,
    editMode,
    rows,
    setRows,
    sucursales,
    rowModesModel,
    setRowModesModel,
    handleEmptyRows,
    paymentStatusId,
    isAdvancePayment,
  } = props;

  const { projects } = useSelector((state: RootState) => state.common);
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Handles the click event for the edit button in the grid row.
   * @param id - The ID of the grid row.
   */
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleDuplicateRow = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (!row) return;

    const newRow = { ...row, id: randomId() };
    setRows([...rows, newRow]);
  };

  /**
   * Handles the click event when the save button is clicked for a specific row.
   *
   * @param id - The ID of the row.
   */
  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rows.find((row) => row.id === id);
    if (!currentRow) return;
    if (
      currentRow.accountName.includes('EMPLEADO') &&
      currentRow.employeeId === null
    ) {
      enqueueSnackbar(
        'Para esta cuenta contable, debe seleccionar un empleado',
        { variant: 'error' }
      );
      return;
    }

    if (
      currentRow.accountName.includes('IMPORTACION') &&
      currentRow.importOpeningId === null
    ) {
      enqueueSnackbar(
        'Para esta cuenta contable, debe seleccionar una importación',
        { variant: 'error' }
      );
      return;
    }

    const emptyRow = currentRow.accountNumber === '';

    const emptyRowAmount = currentRow.detailPaymentAmount === 0;

    if (emptyRowAmount) {
      enqueueSnackbar(`No se puede guardar una registro con monto 0`, {
        variant: 'error',
      });
      const existingRow = rows.find(
        (row) =>
          row.detailPaymentAmount === currentRow?.detailPaymentAmount &&
          row.id !== id
      );
      if (existingRow) {
        handleEmptyRows(currentRow);
      }
      return;
    } else {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }

    if (emptyRow) {
      const existingRow = rows.find(
        (row) =>
          row.accountNumber === currentRow?.accountNumber && row.id !== id
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
    const row = rows.find(
      (row) => row.id === id && row.id !== ParametersEnum.ID_ROW_TOTAL
    );
    if (!row) return;
    setRows(rows.filter((row) => row.id !== id));
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

  const columns: GridColDef[] = [
    {
      field: 'accountNumber',
      headerName: 'No. Cuenta',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 150,
      flex: 1,
      cellClassName: 'centered-grid',
    },
    {
      field: 'accountName',
      headerName: 'Cuenta',
      type: 'string',
      minWidth: 300,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: !isAdvancePayment,
      renderEditCell: (params) => {
        return (
          <AutocompleteEditAccountCell params={params} setRows={setRows} />
        );
      },
    },
    {
      field: 'accountTypeName',
      headerName: 'Tipo',
      type: 'string',
      minWidth: 150,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: false,
    },
    {
      field: 'detailPaymentObservation',
      headerName: 'Observación',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      editable: true,
      flex: 1,
      valueGetter: (params) => {
        return params.row.detailPaymentObservation
          ? params.row.detailPaymentObservation.toUpperCase()
          : '';
      },
      valueSetter: (params) => {
        const value = params.value ? params.value.toUpperCase() : '';
        return { ...params.row, detailPaymentObservation: value };
      },
    },
    {
      field: 'detailPaymentAmount',
      headerName: 'Monto',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      editable: true,
      flex: 1,
      valueFormatter: (params: GridValueFormatterParams) =>
        setCurrencyNumber(Number(params.value)),
      renderEditCell: (params) => (
        <CustomUpdateTotalCell params={params} rows={rows} setRows={setRows} />
      ),
    },
    {
      field: 'projectName',
      headerName: 'Proyecto',
      type: 'singleSelect',
      valueOptions: projects.map((project) => project.projectName),
      minWidth: 150,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      cellClassName: 'centered-grid',
    },
    {
      field: 'branchName',
      headerName: 'Sucursal',
      type: 'singleSelect',
      valueOptions: sucursales.map((sucursal) => sucursal.name),
      minWidth: 150,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      cellClassName: 'centered-grid',
    },
    {
      field: 'employeeName',
      headerName: 'Empleado',
      type: 'string',
      minWidth: 300,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderEditCell: (params) => {
        return (
          <AutocompleteEditEmployeeCell
            params={params}
            rows={rows}
            setRows={setRows}
          />
        );
      },
    },
    {
      field: 'importOpeningCode',
      headerName: 'Importación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 150,
      flex: 1,
      editable: true,
      cellClassName: 'centered-grid',
      renderEditCell: (params) => (
        <AutocompleteAperturaImportacionCell
          params={params}
          rows={rows}
          setRows={setRows}
        />
      ),
    },
    {
      field: 'providerName',
      headerName: 'Proveedor',
      type: 'string',
      minWidth: 300,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderEditCell: (params) => {
        return (
          <AutocompleteEditProviderCell
            params={params}
            rows={rows}
            setRows={setRows}
          />
        );
      },
    },
  ];

  if (
    createMode ||
    (editMode && paymentStatusId && paymentStatusId === EstadoPagoEnum.GENERADO)
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
        //Verifica si es la línea de los totales de se así no muestra los botones
        if (id === ParametersEnum.ID_ROW_TOTAL) {
          return [];
        }

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
        } else if (!isInEditMode) {
          return [
            <Tooltip title="Duplicar Item">
              <GridActionsCellItem
                icon={<ContentCopy />}
                label="Duplicar"
                onClick={handleDuplicateRow(id)}
              />
            </Tooltip>,
            <Tooltip title="Editar">
              <GridActionsCellItem
                icon={<Edit />}
                label="Editar"
                className="textPrimary"
                onClick={handleEditClick(id)}
                color="inherit"
              />
            </Tooltip>,
            <Tooltip title="Borrar">
              <GridActionsCellItem
                icon={<Delete />}
                label="Borrar"
                onClick={handleDeleteClick(id)}
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

  return columns;
};
