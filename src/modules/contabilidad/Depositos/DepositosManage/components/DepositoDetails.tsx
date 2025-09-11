import { ParametersEnum } from '@/enums';
import { formatDateBackEnd, setCurrencyNumber } from '@/functions';
import { FormState, useCommonDataGrid, useDepositosAsync } from '@/hooks';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import {
  AutocompleteEditAccountCell,
  InputQuantityFunction,
  InputValueFunction,
  OnDateChange,
} from './CustomCells';
import { Delete } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
import {
  GridActionsCellItem,
  GridRowSelectionModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import { useEffect } from 'react';
import { DepositoToolBar } from './DepositoToolBar';
import { DepositoFooter } from './DepositoFooter';
import { TipoDepositoEnum } from '@/enums/TipoDepositoEnum';
import { DepositoPendienteDto } from '@/types';
import { randomId } from '@mui/x-data-grid-generator';

export type DepositDetailsProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  onGenericChange: (value: any, name: string) => void;
  rowSelectionModel: GridRowSelectionModel;
  setRowSelectionModel: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
};

export const DepositDetails: React.FC<DepositDetailsProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  rows,
  setRows,
  onGenericChange,
  rowSelectionModel,
  setRowSelectionModel,
}) => {
  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    columns,
    setColumns,
    handleDeleteClick,
  } = useCommonDataGrid(rows, setRows);

  const { depositPendings, fetchIsDepositDocumentNumberAvailable } =
    useDepositosAsync();

  useEffect(() => {
    const setDepositPending = async () => {
      const response = await depositPendings(
        formState.cashId,
        formState.paymentMethodId
      );
      if (response) {
        const data = response as DepositoPendienteDto[];
        const temporalRows = data.map((row) => {
          return {
            ...row,
            id: randomId(),
          };
        });
        setRows(temporalRows);
      }
    };

    if (formState.depositTypeId === TipoDepositoEnum.VENTAS && createMode) {
      setDepositPending();
    }
  }, [formState.paymentMethodId, createMode]);

  useEffect(() => {
    if (formState.depositMultiple) {
      setFormState((prevForm) => ({
        ...prevForm,
        documentNumber: '',
        depositDate: new Date().toISOString(),
      }));
      setColumns((prevColumns) => [
        ...prevColumns,
        {
          field: 'numberDocument',
          headerName: 'Documento Depósito',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 50,
          flex: 0.5,
          sortable: false,
          disableColumnMenu: true,
          editable: true,
        },
        {
          field: 'depositDate',
          headerName: 'Fecha Depósito',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 50,
          flex: 0.5,
          sortable: false,
          disableColumnMenu: true,
          editable: true,
          valueFormatter: (params) => formatDateBackEnd(params.value as string),
          renderEditCell: (params) => {
            return <OnDateChange params={params} setRows={setRows} />;
          },
        },
      ]);
    } else {
      const newRowsWithoutPayment = rows.map((row) => {
        return {
          ...row,
          numberDocument: '',
          depositDate: '',
        };
      });
      setRows(newRowsWithoutPayment);
      setColumns((prevColumns) =>
        prevColumns.filter(
          (column) =>
            column.field !== 'numberDocument' && column.field !== 'depositDate'
        )
      );
    }
  }, [formState.depositMultiple]);

  useEffect(() => {
    if (!formState.depositMultiple) return;

    const validateDepositDocumentNumber = async () => {
      const newRows = rows.map(async (row) => {
        if (rowSelectionModel.includes(row.id)) {
          if (
            formState.bankId !== null &&
            row.depositDate !== null &&
            row.numberDocument.trim().length > 3
          ) {
            const sanitizedValue = row.numberDocument
              .trim()
              .replace(/[.,]/g, '');
            const response = await fetchIsDepositDocumentNumberAvailable(
              formState.bankId,
              sanitizedValue
            );
            return {
              ...row,
              numberDocument: sanitizedValue,
              isValidDocument: response,
            };
          }
        }
        return row;
      });

      const updatedRows = await Promise.all(newRows);
      setRows(updatedRows);
    };

    validateDepositDocumentNumber();
  }, [
    JSON.stringify(rows.map((row) => row.numberDocument)),
    JSON.stringify(rows.map((row) => row.depositDate)),
    formState.depositMultiple,
    formState.bankId,
  ]);

  useEffect(() => {
    if (formState.depositTypeId === TipoDepositoEnum.VENTAS && createMode) {
      setColumns([
        {
          field: 'closingCashDate',
          headerName: 'Fecha del Cierre',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 50,
          flex: 0.5,
          valueFormatter: (params) => formatDateBackEnd(params.value as string),
        },
        {
          field: 'cashName',
          headerName: 'Caja',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 50,
          flex: 0.5,
        },
        {
          field: 'value',
          headerName: 'Valor Cierre',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.5,
          type: 'number',
          valueFormatter: (params) => setCurrencyNumber(params.value as number),
        },
        {
          field: 'pendingValue',
          headerName: 'Valor Pendiente',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.5,
          type: 'number',
          valueFormatter: (params) => setCurrencyNumber(params.value as number),
        },
        {
          field: 'depositAmount',
          headerName: 'Valor Depósito',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.5,
          type: 'number',
          editable: true,
          valueFormatter: (params) => setCurrencyNumber(params.value as number),
        },
      ]);
    } else if (
      formState.depositTypeId === TipoDepositoEnum.VENTAS &&
      !createMode
    ) {
      setColumns([
        {
          field: 'depositForm',
          headerName: 'Tipo',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 50,
          flex: 1,
          editable: false,
        },
        {
          field: 'description',
          headerName: 'Descripción',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 50,
          flex: 1,
          editable: false,
        },
        {
          field: 'depositAmount',
          headerName: 'Valor',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.8,
          type: 'number',
          sortable: false,
          disableColumnMenu: true,
          valueFormatter: (params) => setCurrencyNumber(params.value as number),
          editable: false,
          renderEditCell: (params) => {
            return <InputQuantityFunction params={params} setRows={setRows} />;
          },
        },
      ]);
    } else {
      setColumns([
        {
          field: 'accountNumber',
          headerName: 'Código Cuenta',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 50,
          flex: 1,
          editable: false,
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
          editable: true,
          renderEditCell: (params) => {
            return (
              <AutocompleteEditAccountCell params={params} setRows={setRows} />
            );
          },
        },
        {
          field: 'depositAmount',
          headerName: 'Valor',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.8,
          type: 'number',
          sortable: false,
          disableColumnMenu: true,
          valueFormatter: (params) => setCurrencyNumber(params.value as number),
          editable: true,
          renderEditCell: (params) => {
            return <InputValueFunction params={params} setRows={setRows} />;
          },
        },
        {
          field: 'actions',
          type: 'actions',
          headerName: 'Acciones',
          align: 'center',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          flex: 0.5,
          cellClassName: 'actions',
          renderCell: (params) => {
            if (params.row.detailId == null) {
              return [
                <Tooltip title="Borrar">
                  <GridActionsCellItem
                    icon={<Delete />}
                    label="Borrar"
                    onClick={handleDeleteClick(params.row.id)}
                    color="inherit"
                  />
                </Tooltip>,
              ];
            }
          },
        },
      ]);
    }
  }, [rows.length, formState.depositTypeId, createMode, editMode]);

  const handleRowSelectionChange = (
    newRowSelectionModel: GridRowSelectionModel
  ) => {
    const isSelecting = newRowSelectionModel.length > rowSelectionModel.length;
    const isDeselecting =
      newRowSelectionModel.length < rowSelectionModel.length;

    setRowSelectionModel(newRowSelectionModel);
    if (isSelecting) {
      const newSelectedRows = newRowSelectionModel.filter(
        (row) => !rowSelectionModel.includes(row)
      );
      if (newSelectedRows.length > 0) {
        const newRows = rows.map((r) => {
          if (newSelectedRows.includes(r.id)) {
            return {
              ...r,
              depositAmount: r.pendingValue,
              pendingValue: 0,
            };
          }
          return r;
        });
        setRows(newRows);
      }
    } else if (isDeselecting) {
      const deselectedRows = rowSelectionModel.filter(
        (row) => !newRowSelectionModel.includes(row)
      );
      if (deselectedRows.length > 0) {
        const newRows = rows.map((r) => {
          if (deselectedRows.includes(r.id)) {
            return {
              ...r,
              depositAmount: 0,
              pendingValue: r.pendingValueStatic,
            };
          }
          return r;
        });
        setRows(newRows);
      }
    }
  };

  return (
    <Grid item xs={12}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        editMode={createMode || editMode ? 'cell' : undefined}
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
          toolbar: DepositoToolBar,
          footer: DepositoFooter,
        }}
        slotProps={{
          toolbar: {
            setRows,
            createMode,
            formState,
            onGenericChange,
            setFormState,
          },
          footer: {
            rows,
            setRows,
            formState,
            setFormState,
            createMode,
          },
          panel: {
            sx: {
              [`& .MuiDataGrid-columnsPanel > div:first-of-type`]: {
                display: 'none',
              },
            },
          },
        }}
        checkboxSelection={
          formState.depositTypeId === TipoDepositoEnum.VENTAS && createMode
        }
        disableRowSelectionOnClick
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={handleRowSelectionChange}
      />
    </Grid>
  );
};
