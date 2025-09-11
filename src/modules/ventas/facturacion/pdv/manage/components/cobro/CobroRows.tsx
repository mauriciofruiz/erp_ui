'use client';
import { FormaPagoEnum, ParametersEnum } from '@/enums';
import {
  CustomNoRowsOverlay,
  StyledBoxCobro,
  StyledDataGrid,
  StyledTooltip,
} from '@/hooks/useStyleDataGrid';
import {
  AcquirerInterface,
  AdvanceClientType,
  BancoType,
  CardInterface,
  ClientPersonCreditPostType,
  CobroFacturaInterface,
  CrossedAdvanceClientType,
} from '@/types';
import { Cancel, Delete, Edit, ExpandMore, Save } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import {
  GridCellParams,
  GridColDef,
  GridColumnVisibilityModel,
  GridEditInputCell,
  GridEventListener,
  GridPreProcessEditCellProps,
  GridRenderEditCellParams,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState } from 'react';
import { esES } from '@mui/x-data-grid/locales';
import { setCurrencyNumber } from '@/functions';
import {
  AutocompleteAcquirerCell,
  AutocompleteBankCell,
  AutocompleteCardCell,
  CustomFormaPagoCell,
  CustomNumberCell,
  isCellEditable,
  ToolbarFormaPago,
} from './CustomCellsCobro';
import { GridActionsCellItem } from '@mui/x-data-grid';
import {
  FormState,
  useAdquirienteAsync,
  useBankAsync,
  useFacturaVentaAsync,
  useTarjetaAsync,
} from '@/hooks';
import { FooterCobro } from './FooterCobro';
import { AnticiposDialog } from '../AnticiposDialog';

export type CobroRowsProps = {
  cobros: CobroFacturaInterface[];
  setCobros: React.Dispatch<React.SetStateAction<CobroFacturaInterface[]>>;
  createMode: boolean;
  editMode: boolean;
  styles: ClassNameMap;
  rows: readonly GridValidRowModel[];
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
  formState: FormState;
  selectedCliente: ClientPersonCreditPostType | null;
  rowsProductos: readonly GridValidRowModel[];
  setRowsProductos: React.Dispatch<
    React.SetStateAction<readonly GridValidRowModel[]>
  >;
  fetchRecalculate: () => void;
  diferencia: number;
  setDiferencia: React.Dispatch<React.SetStateAction<number>>;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  availableAdvances: AdvanceClientType[];
  selectedAdvances: CrossedAdvanceClientType[];
  setAvailableAdvances: React.Dispatch<
    React.SetStateAction<AdvanceClientType[]>
  >;
  setSelectedAdvances: React.Dispatch<
    React.SetStateAction<CrossedAdvanceClientType[]>
  >;
};

export const CobroRows: React.FC<CobroRowsProps> = ({
  formState,
  cobros,
  setCobros,
  createMode,
  editMode,
  styles,
  rows,
  setRows,
  selectedCliente,
  rowsProductos,
  setRowsProductos,
  fetchRecalculate,
  diferencia,
  setDiferencia,
  rowModesModel,
  setRowModesModel,
  availableAdvances,
  selectedAdvances,
  setAvailableAdvances,
  setSelectedAdvances,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [bankList, setBankList] = useState<BancoType[]>([]);

  const [cardList, setCardList] = useState<CardInterface[]>([]);

  const [acquirerList, setAcquirerList] = useState<AcquirerInterface[]>([]);

  const { fetchBankListIsBank } = useBankAsync();

  const { fetchAcquirerList } = useAdquirienteAsync();

  const { fetchCardList } = useTarjetaAsync();

  const { fetchIsDocumentAvailable } = useFacturaVentaAsync();

  const [currentCobro, setCurrentCobro] = useState<CobroFacturaInterface>(
    cobros[0]
  );

  const [openDialog, setOpenDialog] = useState(false);

  const [currentRow, setCurrentRow] = useState<GridValidRowModel>({});

  // Obtener todas las formas de pago
  const formasPagoList: { label: string; value: FormaPagoEnum }[] =
    useMemo(() => {
      return Object.keys(FormaPagoEnum)
        .filter((key): key is keyof typeof FormaPagoEnum => isNaN(Number(key)))
        .map((key) => {
          const label = key.replace(/_/g, ' ');
          return { label: label, value: FormaPagoEnum[key] };
        });
    }, []);

  useEffect(() => {
    if (cobros && cobros.length >= 1) {
      return;
    }
    setCobros([
      {
        paymentId: null,
        cashId: null,
        clientId: null,
        cashClosingId: null,
        paymentTotal: 0,
        advancePayment: 0,
        transportAdvancePayment: 0,
        changeValue: 0,
        isRecoveryPayment: false,
        paymentDetails: [],
      },
    ]);
    const fetchDataBank = async () => {
      const response = await fetchBankListIsBank();
      setBankList(response ?? []);
    };

    const fetchDataCard = async () => {
      const response = await fetchCardList();
      setCardList(response ?? []);
    };

    const fetchDataAcquirer = async () => {
      const response = await fetchAcquirerList();
      setAcquirerList(response ?? []);
    };

    if (bankList.length === 0) fetchDataBank();
    if (cardList.length === 0) fetchDataCard();
    if (acquirerList.length === 0) fetchDataAcquirer();
  }, [JSON.stringify(cobros)]);

  // ********************************* DATA GRID *********************************

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({
      bankId: false,
      documentNumber: false,
      checkNumber: false,
      cardId: false,
      acquirerId: false,
      batch: false,
      term: false,
      quotaAvailable: false,
      creditBalance: false,
    });

  const columns: GridColDef[] = [
    {
      field: 'paymentMethodId',
      headerName: 'Forma De Pago',
      minWidth: 200,
      flex: 2,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      valueFormatter: (params) => {
        if (params.id === ParametersEnum.ID_ROW_TOTAL) return 'TOTAL COBRO';
        const paymentMethodId = params.value;
        const paymentMethodName =
          formasPagoList.find((item) => item.value === paymentMethodId)
            ?.label || '';
        return paymentMethodName;
      },
      renderEditCell: (params) => {
        return (
          <CustomFormaPagoCell
            params={params}
            rows={rows}
            setRows={setRows}
            formState={formState}
            selectedCliente={selectedCliente}
            formasPagoList={formasPagoList}
            styles={styles}
            setRowModesModel={setRowModesModel}
          />
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Monto',
      minWidth: 150,
      flex: 1,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      type: 'number',
      editable: true,
      renderCell: (params) => setCurrencyNumber(params.value as number),
      renderEditCell: (params) => (
        <CustomNumberCell
          params={params}
          setRows={setRows}
          formState={formState}
          setCurrentCobro={setCurrentCobro}
          setCurrentRow={setCurrentRow}
          setOpenDialog={setOpenDialog}
        />
      ),
    },
    {
      field: 'bankId',
      headerName: 'Banco',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      preProcessEditCellProps: async (params: GridPreProcessEditCellProps) => {
        const paymetMethodId =
          params.otherFieldsProps?.paymentMethodId.value ||
          params.row.paymentMethodId;

        if (
          paymetMethodId === FormaPagoEnum.TRANSFERENCIA ||
          paymetMethodId === FormaPagoEnum.DEPOSITO
        ) {
          const documentNumber =
            params.otherFieldsProps?.documentNumber.value ||
            params.row.documentNumber;

          if (params.props.value === null) {
            return { ...params.props, error: true };
          } else if (documentNumber!.toString() === '') {
            const errorMessage = 'Debe ingresar un número de documento';
            return {
              ...params.props,
              otherFieldsProps: {
                ...params.otherFieldsProps,
                documentNumber: {
                  ...params.otherFieldsProps?.documentNumber,
                  error: errorMessage,
                },
              },
              error: true,
            };
          }
          const isDocumentAvailable = (await fetchIsDocumentAvailable(
            documentNumber!.toString(),
            params.props.value
          ))
            ? false
            : 'El documento ya fue registrado';
          return {
            ...params.props,
            otherFieldsProps: {
              ...params.otherFieldsProps,
              documentNumber: {
                ...params.otherFieldsProps?.documentNumber,
                error: isDocumentAvailable,
              },
            },
            error: isDocumentAvailable,
          };
        }
        return {
          ...params.props,
          otherFieldsProps: {
            ...params.otherFieldsProps,
          },
          error: false,
        };
      },
      renderCell: (params) => {
        const currentRow = rows.find((row) => row.id === params.id);
        if (!currentRow) return '';
        return currentRow.bankName;
      },
      renderEditCell: (params) => {
        return (
          <AutocompleteBankCell
            params={params}
            setRows={setRows}
            bankList={bankList}
          />
        );
      },
    },
    {
      field: 'documentNumber',
      headerName: 'Nro. Documento',
      type: 'string',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      preProcessEditCellProps: async (params: GridPreProcessEditCellProps) => {
        const paymetMethodId =
          params.otherFieldsProps?.paymentMethodId.value ||
          params.row.paymentMethodId;

        const bankId =
          params.otherFieldsProps?.bankId.value || params.row.bankId;
        if (
          paymetMethodId === FormaPagoEnum.TRANSFERENCIA ||
          paymetMethodId === FormaPagoEnum.DEPOSITO
        ) {
          if (bankId === null) {
            const errorMessage = 'Debe seleccionar un banco';
            return { ...params.otherFieldsProps?.bankId, error: errorMessage };
          } else if (params.props.value!.toString() === '') {
            const errorMessage = 'Debe ingresar un número de documento';
            return { ...params.props, error: errorMessage };
          }
          const isDocumentAvailable = (await fetchIsDocumentAvailable(
            params.props.value!.toString(),
            bankId
          ))
            ? false
            : 'El documento ya fue registrado';
          return {
            ...params.props,
            otherFieldsProps: {
              ...params.otherFieldsProps,
              bankId: {
                ...params.otherFieldsProps?.bankId,
                error: isDocumentAvailable,
              },
            },
            error: isDocumentAvailable,
          };
        }
        return {
          ...params.props,
          otherFieldsProps: {
            ...params.otherFieldsProps,
            bankId: {
              ...params.otherFieldsProps?.bankId,
              error: false,
            },
          },
          error: false,
        };
      },
      renderEditCell: (props: GridRenderEditCellParams) => {
        const { error } = props;

        return (
          <StyledTooltip open={!!error} title={error} placement="right">
            <GridEditInputCell {...props} />
          </StyledTooltip>
        );
      },
    },
    {
      field: 'checkNumber',
      headerName: 'Nro. Cheque',
      type: 'string',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
    },
    {
      field: 'cardId',
      headerName: 'Tarjeta',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderCell: (params) => {
        const currentRow = rows.find((row) => row.id === params.id);
        if (!currentRow) return '';
        return currentRow.cardName;
      },
      renderEditCell: (params) => (
        <AutocompleteCardCell
          params={params}
          rows={rows}
          setRows={setRows}
          styles={styles}
          cardList={cardList}
        />
      ),
    },
    {
      field: 'acquirerId',
      headerName: 'Adquiriente',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderCell: (params) => {
        const currentRow = rows.find((row) => row.id === params.id);
        if (!currentRow) return '';
        return currentRow.acquirerName;
      },
      renderEditCell: (params) => (
        <AutocompleteAcquirerCell
          params={params}
          rows={rows}
          setRows={setRows}
          styles={styles}
          acquirerList={acquirerList}
        />
      ),
    },
    {
      field: 'batch',
      headerName: 'Lote',
      type: 'string',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderEditCell: (props: GridRenderEditCellParams) => {
        return <GridEditInputCell {...props} />;
      },
    },
    {
      field: 'term',
      headerName: 'Plazo',
      type: 'number',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      valueGetter: (params) => {
        if (
          params.row.paymentMethodId === FormaPagoEnum.TARJETA_CREDITO ||
          params.row.paymentMethodId === FormaPagoEnum.TARJETA_DEBITO
        ) {
          return params.value;
        }
        return '';
      },
    },
    {
      field: 'quotaAvailable',
      headerName: 'Cupo Disponible',
      type: 'string',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: false,
      valueGetter: (params) => {
        if (params.row.paymentMethodId === FormaPagoEnum.CREDITO) {
          const creditBalance = params.value;
          return setCurrencyNumber(creditBalance);
        }
        return '';
      },
    },
    {
      field: 'creditBalance',
      headerName: 'Saldo Favor',
      type: 'string',
      minWidth: 200,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: false,
      valueGetter: (params) => {
        if (params.row.paymentMethodId === FormaPagoEnum.NOTA_CREDITO) {
          const creditBalance = params.value;
          return setCurrencyNumber(creditBalance);
        }
        return '';
      },
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

        const itsTotalRow = id === ParametersEnum.ID_ROW_TOTAL;
        if (itsTotalRow) return [];
        else if (isInEditMode) {
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

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleZeroAmount = (row: GridRowModel) => {
    const errors = [];
    if (row.amount === 0) {
      errors.push('El monto del cobro no puede ser 0');
    }
    if (row.paymentMethodId === '') {
      errors.push('Debe seleccionar una forma de pago');
    }

    // Mostrar todos los mensajes de error, si los hay
    errors.forEach((error) => enqueueSnackbar(error, { variant: 'error' }));

    // Si hay errores, filtrar la fila; de lo contrario, retornar todas las filas
    return errors.length ? rows.filter((r) => r.id !== row.id) : rows;
  };

  const handleRepeatedMethod = (
    row: GridRowModel,
    rowsTwo: readonly GridValidRowModel[]
  ) => {
    const paymentMethods = [FormaPagoEnum.CREDITO, FormaPagoEnum.NOTA_CREDITO];
    const messages: { [key in FormaPagoEnum]: string } = {
      [FormaPagoEnum.EFECTIVO]: 'Mensaje para efectivo',
      [FormaPagoEnum.CREDITO]: 'Solo puede haber un cobro a crédito',
      [FormaPagoEnum.TRANSFERENCIA]: 'Mensaje para transferencia',
      [FormaPagoEnum.DEPOSITO]: 'Mensaje para depósito',
      [FormaPagoEnum.NOTA_CREDITO]:
        'Solo puede haber un cobro a nota de crédito',
      [FormaPagoEnum.TARJETA_DEBITO]: 'Mensaje para tarjeta de débito',
      [FormaPagoEnum.TARJETA_CREDITO]: 'Mensaje para tarjeta de crédito',
      [FormaPagoEnum.CHEQUE]: 'Mensaje para cheque',
    };

    let idRowsToFilter: any[] = [];

    for (const method of paymentMethods) {
      if (row.paymentMethodId === method) {
        const isAnotherRowWithSameMethod = rowsTwo
          .filter((r) => r.id !== row.id)
          .some((r) => r.paymentMethodId === method);

        if (isAnotherRowWithSameMethod) {
          enqueueSnackbar(messages[method], { variant: 'error' });
          idRowsToFilter.push(
            rowsTwo.filter((r) => r.id === row.id).map((r) => r.id)
          );
        }
      }
    }
    return rowsTwo.filter((r) => !idRowsToFilter.includes(r.id));
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
    if (params.reason === GridRowEditStopReasons.enterKeyDown) {
      const rowsOne = handleZeroAmount(currentRow) || [];
      const rowsTwo = handleRepeatedMethod(currentRow, rowsOne);
      setRows(rowsTwo);
    }
  };

  const handleSaveClick = (id: GridRowId) => () => {
    const currentRow = rows.find((row) => row.id === id);
    if (!currentRow) return;

    const rowsOne = handleZeroAmount(currentRow) || [];
    const rowsTwo = handleRepeatedMethod(currentRow, rowsOne);
    setRows(rowsTwo);

    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    console.error(error);
  }, []);

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
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
    if (editedRow) {
      const rowsOne = handleZeroAmount(editedRow) || [];
      const rowsTwo = handleRepeatedMethod(editedRow, rowsOne);
      setRows(rowsTwo);
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  /**
   * Handles the click event for deleting a row.
   * @param id - The ID of the row to be deleted.
   */
  const handleDeleteClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);
    if (!row) return;

    setRows(rows.filter((row) => row.id !== id));
  };

  useEffect(() => {
    if (!openDialog && currentRow && currentRow.amountToCross > 0) {
      const newCrossedAdvance: CrossedAdvanceClientType = {
        crossedAdvanceId: null,
        documentId: currentRow.documentId,
        documentNumber: currentRow.documentNumber,
        documentTypeId: currentRow.documentTypeId,
        clientId: formState.clientId,
        advanceAmount: currentRow.amountToCross,
        hasCreditCard: currentRow.hasCreditCard,
      };

      setSelectedAdvances((prev) => {
        const newSelectedAdvances = prev.filter(
          (advance) =>
            advance.documentId !== newCrossedAdvance.documentId &&
            advance.documentTypeId !== newCrossedAdvance.documentTypeId
        );
        return [...newSelectedAdvances, newCrossedAdvance];
      });
      setRowModesModel({
        ...rowModesModel,
        [currentRow.id]: { mode: GridRowModes.View },
      });
    }
  }, [currentRow, openDialog]);

  useEffect(() => {
    const rowNotaCredito = rows.find(
      (row) => row.paymentMethodId === FormaPagoEnum.NOTA_CREDITO
    );
    if (rowNotaCredito) {
      const advancesTotal = selectedAdvances.reduce(
        (acc, advance) => acc + advance.advanceAmount,
        0
      );
      const newRow = {
        ...rowNotaCredito,
        amount: selectedAdvances.length === 0 ? 0 : advancesTotal,
      };
      const newRows = rows
        .filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
        .map((row) => (row.id === rowNotaCredito.id ? newRow : row));

      //const rowsFinals = handleSummaryRow(newRows);

      setRows(newRows);
    }
  }, [
    JSON.stringify(selectedAdvances),
    JSON.stringify(
      rows.filter((row) => row.id !== ParametersEnum.ID_ROW_TOTAL)
    ),
  ]);

  // const handleSummaryRow = (rowsTwo: readonly GridValidRowModel[]) => {
  //   const summary = setSummaryRow(rowsTwo);
  //   if (summary.length === 1 && summary[0].id === ParametersEnum.ID_ROW_TOTAL) {
  //     return [];
  //   } else {
  //     return summary;
  //   }
  // };

  useEffect(() => {
    const uniquePaymentMethodIds = new Set(
      rows
        .filter((row) => row.paymentMethodId !== '')
        .map((row) => row.paymentMethodId)
    );
    const visibilityModel = {
      bankId: false,
      documentNumber: false,
      checkNumber: false,
      cardId: false,
      acquirerId: false,
      batch: false,
      term: false,
      quotaAvailable: false,
      creditBalance: false,
    };

    const normalizedPaymentMethods = Array.from(uniquePaymentMethodIds).map(
      (method) => {
        if (
          method === FormaPagoEnum.TRANSFERENCIA ||
          method === FormaPagoEnum.DEPOSITO
        ) {
          return FormaPagoEnum.TRANSFERENCIA;
        }
        if (
          method === FormaPagoEnum.TARJETA_CREDITO ||
          method === FormaPagoEnum.TARJETA_DEBITO
        ) {
          return FormaPagoEnum.TARJETA_CREDITO;
        }
        return method;
      }
    );

    const uniqueNormalizedPaymentMethods = new Set(normalizedPaymentMethods);

    if (uniqueNormalizedPaymentMethods.size > 1) {
      setColumnVisibilityModel({
        ...visibilityModel,
        bankId: true,
        documentNumber: true,
        checkNumber: true,
        cardId: true,
        acquirerId: true,
        batch: true,
        term: true,
        quotaAvailable: true,
        creditBalance: true,
      });
      return;
    }

    const paymentMethodId = Array.from(uniquePaymentMethodIds)[0];
    switch (paymentMethodId) {
      case FormaPagoEnum.EFECTIVO:
        setColumnVisibilityModel(visibilityModel);
        break;
      case FormaPagoEnum.CREDITO:
        setColumnVisibilityModel({ ...visibilityModel, quotaAvailable: true });
        break;
      case FormaPagoEnum.TRANSFERENCIA:
      case FormaPagoEnum.DEPOSITO:
        setColumnVisibilityModel({
          ...visibilityModel,
          bankId: true,
          documentNumber: true,
        });
        break;
      case FormaPagoEnum.NOTA_CREDITO:
        setColumnVisibilityModel({ ...visibilityModel, creditBalance: true });
        break;
      case FormaPagoEnum.TARJETA_CREDITO:
      case FormaPagoEnum.TARJETA_DEBITO:
        setColumnVisibilityModel({
          ...visibilityModel,
          cardId: true,
          acquirerId: true,
          batch: true,
          term: true,
        });
        break;
      case FormaPagoEnum.CHEQUE:
        setColumnVisibilityModel({
          ...visibilityModel,
          bankId: true,
          checkNumber: true,
        });
        break;
      default:
        setColumnVisibilityModel(visibilityModel);
    }
  }, [JSON.stringify(rows.map((row) => row.paymentMethodId))]);

  return (
    <>
      <AnticiposDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        availableAdvances={availableAdvances}
        selectedAdvances={selectedAdvances}
        setSelectedAdvances={setSelectedAdvances}
        setAvailableAdvances={setAvailableAdvances}
        formState={formState}
      />
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <div
              style={{
                display: 'width',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>
                Formas De Pago
              </Typography>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            {cobros.map((cobro, index) => (
              <Grid item xs={12} key={index}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <div
                      style={{
                        display: 'width',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {cobro.paymentId !== null
                          ? `Cobro Nro. ${cobro.paymentId}`
                          : 'Cobro'}
                      </Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    {cobros.length <= 1 && (createMode || editMode) ? (
                      <Grid item xs={12}>
                        <StyledBoxCobro>
                          <StyledDataGrid
                            rows={rows}
                            columns={columns}
                            editMode={
                              createMode || editMode ? 'row' : undefined
                            }
                            columnVisibilityModel={columnVisibilityModel}
                            onColumnVisibilityModelChange={(newModel) =>
                              setColumnVisibilityModel(newModel)
                            }
                            rowModesModel={rowModesModel}
                            onRowModesModelChange={handleRowModesModelChange}
                            onRowEditStop={handleRowEditStop}
                            getCellClassName={(params) => {
                              const { field, cellMode } = params;

                              if (field === 'paymentMethodId') {
                                return 'super-app-theme--info';
                              }
                              if (cellMode === 'view') {
                                return 'super-app-theme--null';
                              }
                              return '';
                            }}
                            processRowUpdate={processRowUpdate}
                            onProcessRowUpdateError={
                              handleProcessRowUpdateError
                            }
                            getRowHeight={() => 'auto'}
                            columnHeaderHeight={45}
                            sx={{ height: rows.length > 0 ? '100%' : 300 }}
                            slots={{
                              noRowsOverlay: CustomNoRowsOverlay,
                              toolbar: ToolbarFormaPago,
                              footer: FooterCobro,
                            }}
                            slotProps={{
                              toolbar: {
                                createMode,
                                editMode,
                                setRows,
                                setRowModesModel,
                                formState,
                                rows,
                              },
                              footer: {
                                formState,
                                cobros,
                                setCobros,
                                createMode,
                                editMode,
                                styles,
                                rows,
                                setRows,
                                rowsProductos,
                                setRowsProductos,
                                fetchRecalculate,
                                currentCobro,
                                setCurrentCobro,
                                diferencia,
                                setDiferencia,
                                selectedAdvances,
                              },
                            }}
                            localeText={{
                              ...esES.components.MuiDataGrid.defaultProps
                                .localeText,
                              toolbarDensity: 'Densidad',
                              toolbarFilters: 'Filtros',
                              toolbarColumns: 'Columnas',
                              toolbarExport: 'Exportar',
                            }}
                            isCellEditable={(params: GridCellParams) =>
                              isCellEditable(params, rows)
                            }
                          />
                        </StyledBoxCobro>
                      </Grid>
                    ) : (
                      <div className={styles.tableContainer}>
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Monto</TableCell>
                                <TableCell>Banco</TableCell>
                                <TableCell>Nro. Documento</TableCell>
                                <TableCell>Nro. Cheque</TableCell>
                                <TableCell>Cupo Disponible</TableCell>
                                <TableCell>Saldo Favor</TableCell>
                                <TableCell>Tipo Tarjeta</TableCell>
                                <TableCell>Adquiriente</TableCell>
                                <TableCell>Lote</TableCell>
                                <TableCell>Plazo</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {cobro.paymentDetails.map(
                                (detalleCobro, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {
                                        formasPagoList.find(
                                          (item) =>
                                            item.value ===
                                            detalleCobro.paymentMethodId
                                        )?.label
                                      }
                                    </TableCell>
                                    <TableCell>
                                      {setCurrencyNumber(detalleCobro.amount)}
                                    </TableCell>
                                    <TableCell>
                                      {detalleCobro.bankName}
                                    </TableCell>
                                    <TableCell>
                                      {detalleCobro.documentNumber}
                                    </TableCell>
                                    <TableCell>
                                      {detalleCobro.checkNumber}
                                    </TableCell>
                                    <TableCell>
                                      {detalleCobro.quotaAvailable}
                                    </TableCell>
                                    <TableCell>
                                      {detalleCobro.creditBalance}
                                    </TableCell>
                                    <TableCell>
                                      {detalleCobro.cardName}
                                    </TableCell>
                                    <TableCell>
                                      {detalleCobro.acquirerName}
                                    </TableCell>
                                    <TableCell>{detalleCobro.batch}</TableCell>
                                    <TableCell>{detalleCobro.term}</TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                            <TableFooter>
                              <TableRow>
                                <TableCell
                                  style={{
                                    fontWeight: 'bold',
                                  }}
                                  colSpan={3}
                                >
                                  TOTAL
                                </TableCell>

                                <TableCell
                                  style={{
                                    fontWeight: 'bold',
                                  }}
                                  colSpan={2}
                                >
                                  CAMBIO
                                </TableCell>
                                <TableCell
                                  style={{
                                    fontWeight: 'bold',
                                  }}
                                  colSpan={3}
                                >
                                  ANTICIPO
                                </TableCell>
                                <TableCell
                                  style={{
                                    fontWeight: 'bold',
                                  }}
                                  colSpan={3}
                                >
                                  TRANSPORTE
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3}>
                                  {setCurrencyNumber(cobro.paymentTotal)}
                                </TableCell>
                                <TableCell colSpan={2}>
                                  {setCurrencyNumber(cobro.changeValue)}
                                </TableCell>
                                <TableCell colSpan={3}>
                                  {setCurrencyNumber(cobro.advancePayment)}
                                </TableCell>
                                <TableCell colSpan={3}>
                                  {setCurrencyNumber(
                                    cobro.transportAdvancePayment
                                  )}
                                </TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </TableContainer>
                      </div>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </AccordionDetails>
        </Accordion>
      </Grid>
    </>
  );
};
