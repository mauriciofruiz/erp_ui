import {
  FormState,
  useAllowGlobal,
  useCommonDataGrid,
  useCuentasPorCobrarAsync,
} from '@/hooks';
import {
  AdvanceClientType,
  AdvanceTypeCXC,
  PaginatedResponseType,
} from '@/types';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowSelectionModel,
  GridRowsProp,
  GridSortItem,
  GridSortModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { esES } from '@mui/x-data-grid/locales';
import { parseDateWithMiliseconds, setCurrencyNumber } from '@/functions';
import { ParametersEnum } from '@/enums';
import { MoreTime } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { Grid } from '@mui/material';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { InputAdvanceFunction, InputQuantityFunction } from './CustomCells';
import { ReprogramDialog } from './ReprogramDialog';
import { AnticiposDialog } from './AnticiposDialog';

type QueryOptionsType = {
  sortModel?: GridSortItem[];
};

interface CuentaPorCobrarDetallesProps {
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  pagination: PaginatedResponseType;
  setPagination: React.Dispatch<React.SetStateAction<PaginatedResponseType>>;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  rowSelectionModel: GridRowSelectionModel;
  setRowSelectionModel: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >;
  availableAdvances: AdvanceClientType[];
  setAvailableAdvances: React.Dispatch<
    React.SetStateAction<AdvanceClientType[]>
  >;
  selectedAdvances: AdvanceTypeCXC[];
  setSelectedAdvances: React.Dispatch<React.SetStateAction<AdvanceTypeCXC[]>>;
  handleFinishTransaction: () => void;
  selectedRows: GridValidRowModel[];
  isNormalCharge: boolean;
}

export const CuentaPorCobrarDetalles: React.FC<
  CuentaPorCobrarDetallesProps
> = ({
  rows,
  setRows,
  pagination,
  setPagination,
  formState,
  setFormState,
  rowSelectionModel,
  setRowSelectionModel,
  availableAdvances,
  setAvailableAdvances,
  selectedAdvances,
  setSelectedAdvances,
  handleFinishTransaction,
  selectedRows,
  isNormalCharge,
}) => {
  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
  } = useCommonDataGrid(rows, setRows);

  const { enabledBranchs } = useAllowGlobal();

  const [openDialog, setOpenDialog] = useState(false);

  const [openReprogram, setOpenReprogram] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [totalRowCount, setTotalRowCount] = useState(0);

  const [currentRow, setCurrentRow] = useState<GridValidRowModel>({});

  const [paginationModel, setPaginationModel] = useState({
    page: formState.page,
    pageSize: formState.pageSize,
  });
  const { fetchMainCXC } = useCuentasPorCobrarAsync();

  //const { fetchIsPaymentDocumentNumberAvailable } = usePaymentAsync();

  const [columns, setColumns] = useState<GridColDef[]>([]);

  const { isLoading } = useQuery(['pagination', paginationModel], async () => {
    const getResult = async () => {
      setFormState({
        ...formState,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
      const paginacion = await fetchMainCXC(
        formState.clientId,
        formState.endDate,
        formState.isDue,
        formState.rangeDaysId,
        formState.documentNumber,
        paginationModel.page + 1,
        paginationModel.pageSize,
        formState.sortDirection,
        formState.sortField
      );
      setPagination(
        paginacion?.invoicesReceivableList as PaginatedResponseType
      );
    };
    getResult();
  }); // Use useQuery to fetch data

  useEffect(() => {
    if (!isLoading && pagination) {
      setTotalRowCount(pagination.totalRecords);
    }
  }, [isLoading, pagination]); // Update state when data is loaded

  useEffect(() => {
    if (totalRowCount === 0) {
      setRows([]);
    }
  }, [totalRowCount]);

  const [queryOptions, setQueryOptions] = useState<QueryOptionsType>({});

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    setQueryOptions({ sortModel: [...sortModel] });
  }, []);

  useEffect(() => {
    const sortDirection =
      (queryOptions.sortModel &&
        queryOptions.sortModel[0] &&
        queryOptions.sortModel[0].sort?.toString()) ||
      'asc';
    const sortColumn =
      (queryOptions.sortModel &&
        queryOptions.sortModel[0] &&
        queryOptions.sortModel[0].field.toString()) ||
      'documentDueDate';

    setFormState({
      ...formState,
      sortDirection: sortDirection,
      sortColumn: sortColumn,
    });
    const getResult = async () => {
      const paginacion = await fetchMainCXC(
        formState.clientId,
        formState.endDate,
        formState.isDue,
        formState.rangeDaysId,
        formState.documentNumber,
        0,
        formState.pageSize,
        sortDirection,
        sortColumn
      );
      setPagination(
        paginacion?.invoicesReceivableList as PaginatedResponseType
      );
    };
    getResult();
  }, [queryOptions]);

  useEffect(() => {
    if (Array.isArray(rows) && rows.length > 0) {
      const totalValue = selectedRows
        .map((row) => row.documentAmount)
        .reduce((a, b) => a + b, 0);
      const totalPayment = selectedRows
        .map((row) => row.paymentAmount)
        .reduce((a, b) => a + b, 0);
      const totalBalance = selectedRows
        .map((row) => row.documentBalance)
        .reduce((a, b) => a + b, 0);

      const totalAdvance = selectedRows
        .map((row) => row.advanceAmount)
        .reduce((a, b) => a + b, 0);

      const totalRow = {
        id: ParametersEnum.ID_ROW_TOTAL,
        documentIssueDate: '',
        documentNumber: '',
        providerName: '',
        documentType: '',
        documentDueDate: '',
        documentAmount: totalValue,
        advanceAmount: totalAdvance,
        paymentAmount: totalPayment,
        documentBalance: totalBalance,
        documentStatus: '',
      };
      setFormState((prev) => ({
        ...prev,
        totalToCharge: totalPayment + totalAdvance,
      }));

      const rowsWithoutTotal = rows.filter(
        (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
      );
      setRows([...rowsWithoutTotal, totalRow]);
    }
  }, [
    JSON.stringify(selectedRows.map((row) => row.paymentAmount)),
    JSON.stringify(selectedRows.map((row) => row.advanceAmount)),
  ]);

  // useEffect(() => {
  //   if (formState.cxcTypeId === CuentaPorCobrarEnum.POSTFECHADO) {
  //     const newRowsWithoutPayment = rows.map((row) => {
  //       const lastDayPreviousMonth = new Date(
  //         new Date().getFullYear(),
  //         new Date().getMonth(),
  //         0
  //       ).toISOString();
  //       return {
  //         ...row,
  //         chargeDate: lastDayPreviousMonth,
  //       };
  //     });

  //     setRows(newRowsWithoutPayment);
  //     setColumns((prevColumns) => [
  //       ...prevColumns,
  //       {
  //         field: 'chargeDate',
  //         headerName: 'Fecha Cobro',
  //         headerClassName: 'super-app-theme--header',
  //         headerAlign: 'center',
  //         align: 'center',
  //         minWidth: 50,
  //         flex: 0.5,
  //         sortable: false,
  //         disableColumnMenu: true,
  //         editable: false,
  //         renderCell: (params) => {
  //           if (
  //             params.value === null ||
  //             params.value === undefined ||
  //             params.value === ''
  //           )
  //             return '';
  //           return parseDateWithMiliseconds(
  //             new Date(params.value).toISOString()
  //           );
  //         },
  //         renderEditCell: (params) => {
  //           return <OnDateChange params={params} setRows={setRows} />;
  //         },
  //       },
  //     ]);
  //   } else {
  //     const newRowsWithoutPayment = rows
  //       .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
  //       .map((row) => {
  //         return {
  //           ...row,
  //           chargeDate: new Date().toISOString(),
  //         };
  //       });
  //     setRows(newRowsWithoutPayment);
  //     setColumns((prevColumns) =>
  //       prevColumns.filter((column) => column.field !== 'chargeDate')
  //     );
  //   }
  // }, [formState.cxcTypeId]);

  useEffect(() => {
    const hasId = currentRow.id !== undefined && currentRow.id !== null;
    if (!hasId) return;
    const newRows = rows.map((row) =>
      row.id === currentRow.id ? currentRow : row
    );
    setRows(newRows);
  }, [currentRow]);

  const restartAdvancesByRow = (row: GridValidRowModel) => {
    const filteredSelectedAdvances = selectedAdvances.filter(
      (advance) => advance.invoiceFeeId === row.invoiceFeeId
    );

    setSelectedAdvances(
      selectedAdvances.filter(
        (advance) => advance.invoiceFeeId !== row.invoiceFeeId
      )
    );
    const restoredAvailableAdvaces = availableAdvances.map((advance) => {
      const advanceSelected = filteredSelectedAdvances.find(
        (selected) =>
          selected.documentId === advance.documentId &&
          selected.documentTypeId === advance.documentTypeId
      );
      if (advanceSelected) {
        return {
          ...advance,
          availableAmount:
            advance.availableAmount + advanceSelected.advanceAmount,
        };
      }
      return advance;
    });

    setAvailableAdvances(restoredAvailableAdvaces);
  };

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
              paymentAmount: r.documentBalance,
              documentBalance: 0,
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
        deselectedRows.forEach((rowId) => {
          const newRow = rows.find((r) => r.id === rowId);
          restartAdvancesByRow(newRow as GridValidRowModel);
        });
        const newRows = rows.map((r) => {
          if (deselectedRows.includes(r.id)) {
            return {
              ...r,
              paymentAmount: 0,
              advanceAmount: 0,
              documentBalance: r.documentStaticBalance,
            };
          }
          return r;
        });
        setRows(newRows);
      }
    }
  };

  useEffect(() => {
    const newColumns: GridColDef[] = [
      {
        field: 'numberFee',
        headerName: 'Nro. Cuota',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 30,
        flex: 0.3,
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
        field: 'documentIssueDate',
        headerName: 'Fecha Emisión',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
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
        headerName: 'Número Factura',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        flex: 1,
      },
      {
        field: 'clientName',
        headerName: 'Cliente',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        flex: 1,
      },
      {
        field: 'documentType',
        headerName: 'Tipo',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: 'documentDueDate',
        headerName: 'Fecha Vencimiento',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
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
        field: 'daysLate',
        headerName: 'Días Mora',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 30,
        flex: 0.3,
      },
      {
        field: 'documentAmount',
        headerName: 'Valor Factura',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'right',
        minWidth: 50,
        flex: 0.5,
        type: 'number',
        valueFormatter: (params) => setCurrencyNumber(params.value as number),
      },
      {
        field: 'advanceAmount',
        headerName: 'Valor Anticipo',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'right',
        minWidth: 50,
        flex: 0.5,
        type: 'number',
        valueFormatter: (params) => setCurrencyNumber(params.value as number),
        editable: isNormalCharge,
        renderEditCell: (params) => {
          return (
            <InputAdvanceFunction
              params={params}
              setOpenDialog={setOpenDialog}
              setCurrentRow={setCurrentRow}
            />
          );
        },
      },
      {
        field: 'paymentAmount',
        headerName: 'Abono / Pago',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'right',
        minWidth: 50,
        flex: 0.5,
        type: 'number',
        valueFormatter: (params) => setCurrencyNumber(params.value as number),
        editable: true,
        renderEditCell: (params) => {
          return <InputQuantityFunction params={params} setRows={setRows} />;
        },
      },
      {
        field: 'documentBalance',
        headerName: 'Saldo',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'right',
        minWidth: 50,
        flex: 0.5,
        type: 'number',
        valueFormatter: (params) => setCurrencyNumber(params.value as number),
      },
      {
        field: 'documentStatus',
        headerName: 'Estado',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 50,
        flex: 0.5,
        sortable: false,
        disableColumnMenu: true,
      },
    ];

    if (enabledBranchs()) {
      newColumns.push({
        field: 'actions',
        type: 'actions',
        headerName: 'Reprogramación',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        minWidth: 80,
        flex: 0.5,
        cellClassName: 'actions',
        getActions: ({ id }) => {
          if (id === ParametersEnum.ID_ROW_TOTAL) {
            return [];
          }

          return [
            <GridActionsCellItem
              icon={<MoreTime />}
              label="Editar"
              className="textPrimary"
              onClick={() => handleReprogram(id as GridRowId)}
              color="inherit"
            />,
          ];
        },
      });
    }

    setColumns(newColumns);
  }, [rows.length, enabledBranchs()]);

  const handleReprogram = useCallback(
    (id: GridRowId) => {
      const row = rows.find((r) => r.id === id);
      if (row) {
        if (!row.allowReprogram) {
          enqueueSnackbar('No se puede reprogramar esta cuota', {
            variant: 'error',
          });
          return;
        }
        setOpenReprogram(true);
        setCurrentRow(row);
      }
    },
    [rows.length]
  );

  return (
    <>
      <ReprogramDialog
        open={openReprogram}
        setOpen={setOpenReprogram}
        currentRow={currentRow}
        handleFinishTransaction={handleFinishTransaction}
      />
      <AnticiposDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        availableAdvances={availableAdvances}
        selectedAdvances={selectedAdvances}
        setSelectedAdvances={setSelectedAdvances}
        setAvailableAdvances={setAvailableAdvances}
      />
      <Grid item xs={12} sx={{ mt: 2 }}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          pagination
          getCellClassName={(params) => {
            const { id, field, row } = params;

            if (id === ParametersEnum.ID_ROW_TOTAL) {
              return 'super-app-theme--true';
            }

            if (
              id !== ParametersEnum.ID_ROW_TOTAL &&
              field === 'advanceAmount'
            ) {
              const clientId = row.clientId as number;
              if (!clientId) {
                return 'super-app-theme--null';
              }

              const thereAreAdvances = availableAdvances.some(
                (advance) =>
                  advance.clientId === clientId && advance.availableAmount > 0
              );

              return thereAreAdvances
                ? 'super-app-theme--info'
                : 'super-app-theme--null';
            }

            return 'super-app-theme--null';
          }}
          editMode="cell"
          rowCount={totalRowCount}
          loading={isLoading}
          onSortModelChange={handleSortModelChange}
          pageSizeOptions={[5, 10, 15, 25, 50, 100]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
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
          checkboxSelection
          disableRowSelectionOnClick
          isRowSelectable={(params) =>
            params.id !== ParametersEnum.ID_ROW_TOTAL
          }
          slotProps={{
            panel: {
              sx: {
                [`& .MuiDataGrid-columnsPanel > div:first-of-type`]: {
                  display: 'none',
                },
              },
            },
          }}
          isCellEditable={(params) => params.id !== ParametersEnum.ID_ROW_TOTAL}
          onRowSelectionModelChange={handleRowSelectionChange}
          rowSelectionModel={rowSelectionModel}
        />
      </Grid>
    </>
  );
};
