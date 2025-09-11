import { EstadoEgresoEnum, TipoEgresoEnum } from '@/enums';
import { setCurrencyNumber } from '@/functions';
import {
  FormState,
  useAccountAsync,
  useAllowVentas,
  useCierreCajaAsync,
} from '@/hooks';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { RootState } from '@/store';
import {
  AccountEgresoType,
  EgresoInterface,
  ImportacionesEgresoType,
  SucursalType,
} from '@/types';
import { Block, Check, Delete, Edit, ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  GridActionsCellItem,
  GridCellParams,
  GridColDef,
  GridEventListener,
  GridRenderEditCellParams,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  CustomContainerCell,
  CustomImportationCellEditor,
  CustomInputCellEditor,
  CustomInputQuantityCellEdit,
  CustomSelectCellEditor,
  EditToolbar,
  isCellEditable,
} from './CustomCellsEgresos';
import { GridPreProcessEditCellProps } from '@mui/x-data-grid';
import { GridColumnVisibilityModel } from '@mui/x-data-grid';

interface AccordionEgresosProps {
  rowsEgresos: readonly GridValidRowModel[];
  setRowsEgresos: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  createMode: boolean;
  editMode: boolean;
  formState: FormState;
  totalRowsMemo: number;
  rowModesModel: GridRowModesModel;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  sucursal: SucursalType | undefined;
}

export const AccordionEgresos = (props: AccordionEgresosProps) => {
  const {
    rowsEgresos: rows,
    setRowsEgresos: setRows,
    createMode,
    editMode,
    formState,
    totalRowsMemo,
    rowModesModel,
    setRowModesModel,
    sucursal,
  } = props;

  const { fetchAccountEgresoCaja } = useAccountAsync();

  const { fetchUpdateEgreso, fetchImportacionesEgreso } = useCierreCajaAsync();

  const [accountsList, setAccountsList] = useState<AccountEgresoType[]>([]);

  const { user } = useSelector((state: RootState) => state.auth);

  const { allowChangeAccountEgreso } = useAllowVentas();

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      packingListId: false,
      containerNumber: false,
    });

  const [importacionesEgreso, setImportacionesEgreso] = useState<
    ImportacionesEgresoType[]
  >([]);

  const tipoEgresoList = () => {
    return Object.keys(TipoEgresoEnum)
      .filter((key): key is keyof typeof TipoEgresoEnum => isNaN(Number(key)))
      .map((key) => {
        const label = key.replace(/_/g, ' ');
        return { label: label, value: TipoEgresoEnum[key] };
      });
  };

  const estadosEgresoList = () => {
    return Object.keys(EstadoEgresoEnum)
      .filter((key): key is keyof typeof EstadoEgresoEnum => isNaN(Number(key)))
      .map((key) => {
        const label = key.replace(/_/g, ' ');
        return { label: label, value: EstadoEgresoEnum[key] };
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchAccountEgresoCaja();
      if (response) {
        setAccountsList(response);
      }
    };
    fetchData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'outflowTypeId',
      headerName: 'Tipo Egreso',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      type: 'singleSelect',
      valueOptions: tipoEgresoList().map((item) => ({
        value: item.value,
        label: item.label,
      })),
      renderCell: (params) => {
        const value = tipoEgresoList().find(
          (item) => item.value === params.value
        )?.label;
        return value && value !== null ? value : 'Sin Tipo De Egreso';
      },
      renderEditCell: (params) => (
        <CustomSelectCellEditor
          params={params}
          accountsList={accountsList}
          user={user}
          rows={rows}
          setRows={setRows}
        />
      ),
      editable: true,
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'packingListId',
      headerName: 'Importación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      type: 'singleSelect',
      valueOptions: importacionesEgreso.map((item) => ({
        value: item.packingListId,
        label: item.importOpeningCode,
      })),
      renderCell: (params) => {
        if (importacionesEgreso.length === 0)
          return params.row.importOpeningCode
            ? params.row.importOpeningCode
            : 'Sin Importación';
        const value = importacionesEgreso.find(
          (item) => item.packingListId === params.value
        )?.importOpeningCode;
        return value && value !== null ? value : 'Sin Importación';
      },
      renderEditCell: (params) => (
        <CustomImportationCellEditor params={params} />
      ),
      editable: true,
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'containerNumber',
      headerName: 'Contenedor',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      renderCell: (params) => {
        if (importacionesEgreso.length === 0)
          return params.row.containerName
            ? params.row.containerName
            : 'Sin Contenedor';

        const containerList =
          importacionesEgreso.find(
            (item) => item.packingListId === params.row.packingListId
          )?.containersList || [];

        const value = containerList.find(
          (item) => item.containerNumber === params.value
        )?.containerName;

        return value && value !== null ? value : 'Sin Contenedor';
      },
      renderEditCell: (props: GridRenderEditCellParams) => (
        <CustomContainerCell
          params={props}
          importacionesList={importacionesEgreso}
        />
      ),
      editable: true,
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'accountId',
      headerName: 'Cuenta Contable',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      type: 'singleSelect',
      valueOptions: (params) => {
        const outflowTypeIdMemo = params.row.outflowTypeId;
        const hasDetails =
          Array.isArray(accountsList) && accountsList.length > 0;

        if (!hasDetails || !outflowTypeIdMemo) return [];

        const accountsListMemo = accountsList.filter(
          (account) => account.outflowTypeId === outflowTypeIdMemo
        );

        return accountsListMemo.map((account) => ({
          value: account.accountId,
          label: account.accountName,
        }));
      },
      renderCell: (params) => {
        const value = accountsList.find(
          (cuenta) => cuenta.accountId === params.value
        )?.accountName;
        return value && value !== null ? value : 'Sin Cuenta';
      },
      editable: allowChangeAccountEgreso(),
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'amount',
      headerName: 'Valor Egreso',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      minWidth: 50,
      flex: 0.5,
      editable: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => setCurrencyNumber(params.value),
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        const value = params.props.value;
        if (value <= 0) {
          const errorMessage = 'Debe ingresar un valor superior a cero';
          return { ...params.props, error: errorMessage };
        }
        return { ...params.props, error: false };
      },
      renderEditCell: (params: GridRenderEditCellParams) => {
        const { error } = params;
        return (
          <CustomInputQuantityCellEdit
            params={params}
            rows={rows}
            formState={formState}
            error={error}
          />
        );
      },
    },
    {
      field: 'description',
      headerName: 'Descripción',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      editable: true,
      sortable: false,
      disableColumnMenu: true,
      renderEditCell: (params) => <CustomInputCellEditor {...params} />,
    },
    {
      field: 'outflowStatusId',
      headerName: 'Estado',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 1,
      editable: false,
      sortable: false,
      disableColumnMenu: true,
      type: 'singleSelect',
      valueOptions: estadosEgresoList().map((item) => ({
        value: item.value,
        label: item.label,
      })),
      renderCell: (params) => {
        const value = estadosEgresoList().find(
          (item) => item.value === params.value
        )?.label;
        return value && value !== null ? value : 'Sin Estado';
      },
    },
  ];

  const getCommonActions = (id: GridRowId) => {
    return [
      <GridActionsCellItem
        icon={<Delete />}
        label="Borrar"
        onClick={handleDeleteClick(id)}
        color="inherit"
      />,
    ];
  };

  const getSpecialActions = (id: GridRowId) => [
    <Tooltip title="Confirmar">
      <GridActionsCellItem
        icon={<Check />}
        label="Confirmar"
        className="textPrimary"
        onClick={handleConfirmClick(id)}
        color="inherit"
      />
    </Tooltip>,
    <Tooltip title="Anular">
      <GridActionsCellItem
        icon={<Block />}
        label="Anular"
        className="textPrimary"
        onClick={handleDeleteClick(id)}
        color="inherit"
      />
    </Tooltip>,
    <GridActionsCellItem
      icon={<Edit />}
      label="Editar"
      className="textPrimary"
      onClick={handleEditClick(id)}
      color="inherit"
    />,
  ];

  if (allowChangeAccountEgreso()) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 80,
      flex: 0.5,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isConfirmedOrAnulated = rows.find(
          (row) =>
            row.id === id &&
            (row.outflowStatusId === EstadoEgresoEnum.CONFIRMADO ||
              row.outflowStatusId === EstadoEgresoEnum.ANULADO)
        );
        return isConfirmedOrAnulated
          ? []
          : createMode
          ? getCommonActions(id)
          : getSpecialActions(id);
      },
    });
  } else if (createMode || editMode) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 120,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isConfirmedOrAnulated = rows.find(
          (row) =>
            row.id === id &&
            (row.outflowStatusId === EstadoEgresoEnum.CONFIRMADO ||
              row.outflowStatusId === EstadoEgresoEnum.ANULADO)
        );
        return isConfirmedOrAnulated ? [] : getCommonActions(id);
      },
    });
  }

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const updateEgresoStatus = (id: GridRowId, newStatus: EstadoEgresoEnum) => {
    const rowToUpdate = rows.find((row) => row.id === id);
    const hasCashOutflowId =
      rowToUpdate?.cashOutflowId !== undefined &&
      rowToUpdate.cashOutflowId !== null;

    if (!hasCashOutflowId) {
      if (rowToUpdate) {
        setRows(rows.filter((row) => row.id !== id));
      }
    } else {
      if (rowToUpdate) {
        const confirmationUserId =
          rowToUpdate.confirmationUserId &&
          rowToUpdate.confirmationUserId !== null
            ? rowToUpdate.confirmationUserId
            : newStatus === EstadoEgresoEnum.CONFIRMADO
            ? user?.userId
            : null;
        const egresoToUpdate: EgresoInterface = {
          accountId: rowToUpdate.accountId,
          amount: rowToUpdate.amount,
          cashId: rowToUpdate.cashId,
          cashOutflowId: rowToUpdate.cashOutflowId,
          closingCashId: rowToUpdate.closingCashId,
          confirmationUserId,
          description: rowToUpdate.description,
          entryId: rowToUpdate.entryId,
          issueDate: rowToUpdate.issueDate,
          outflowStatusId: newStatus,
          outflowTypeId: rowToUpdate.outflowTypeId,
          packingListId: rowToUpdate.packingListId,
          containerNumber: rowToUpdate.containerNumber,
        };

        if (egresoToUpdate.cashOutflowId !== null) {
          fetchUpdateEgreso(egresoToUpdate, egresoToUpdate.cashOutflowId).then(
            () => {
              setRows(
                rows.map((row) =>
                  row.id === id ? { ...row, outflowStatusId: newStatus } : row
                )
              );
            }
          );
        }
      }
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    updateEgresoStatus(id, EstadoEgresoEnum.ANULADO);
  };

  const handleConfirmClick = (id: GridRowId) => () => {
    updateEgresoStatus(id, EstadoEgresoEnum.CONFIRMADO);
  };

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
    if (rows.length > 0) {
      const thereIsAEstibajeEgreso = rows.some(
        (row) =>
          row.outflowTypeId === TipoEgresoEnum.ANTICIPO_ESTIBAJE_CONTENEDOR
      );

      const fetchDatosImportaciones = async (branchId: number) => {
        fetchImportacionesEgreso(branchId).then((response) => {
          if (response) {
            const importacionesEgreso = response as ImportacionesEgresoType[];
            setImportacionesEgreso(importacionesEgreso);
          }
        });
      };

      if (thereIsAEstibajeEgreso && sucursal && sucursal.branchId) {
        fetchDatosImportaciones(sucursal.branchId);
        setColumnVisibilityModel({
          ...columnVisibilityModel,
          packingListId: true,
          containerNumber: true,
        });
      } else {
        setColumnVisibilityModel({
          ...columnVisibilityModel,
          packingListId: false,
          containerNumber: false,
        });
      }
    }
  }, [JSON.stringify(rows.map((row) => row.outflowTypeId)), sucursal]);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography
            sx={{ fontWeight: 'bold' }}
          >{`Egresos de caja (Disponible: ${setCurrencyNumber(
            formState.availableValue || 0
          )})`}</Typography>
          <Typography sx={{ fontWeight: 'bold' }}>{`Total: ${setCurrencyNumber(
            totalRowsMemo
          )}`}</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          editMode={createMode || editMode ? 'cell' : undefined}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
          getRowClassName={(params) => {
            const isConfirmed =
              params.row.outflowStatusId === EstadoEgresoEnum.CONFIRMADO;
            const isAnulated =
              params.row.outflowStatusId === EstadoEgresoEnum.ANULADO;
            return isConfirmed
              ? 'super-app-theme--info'
              : isAnulated
              ? 'super-app-theme--false'
              : 'super-app-theme--null';
          }}
          processRowUpdate={processRowUpdate}
          // onProcessRowUpdateError={handleProcessRowUpdateError}
          getRowHeight={() => 'auto'}
          columnHeaderHeight={45}
          sx={{ height: rows.length > 0 ? '100%' : 300 }}
          slotProps={{
            toolbar: {
              setRows,
              setRowModesModel,
              createMode,
              editMode,
              accountsList,
              user,
              formState,
            },
          }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            toolbar: EditToolbar,
          }}
          hideFooter
          isCellEditable={(params: GridCellParams) =>
            isCellEditable(params, rows)
          }
        />
      </AccordionDetails>
    </Accordion>
  );
};
