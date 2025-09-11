import { getAllTipoComprobante, getRegimenFiscal } from '@/backend';
import {
  ComprobanteTypeEnum,
  EstadoDocumentoEnum,
  ParametersEnum,
  TipoIdetificacionFiscalEnum,
} from '@/enums';
import {
  getPercentageValue,
  parseDateWithMiliseconds,
  setCurrencyNumber,
  validarNumeroIdentificacion,
} from '@/functions';
import {
  FormState,
  StyledDatePicker,
  useAccountAsync,
  useCommonDataGrid,
  useFacturaProveedorAsync,
  useStyles,
} from '@/hooks';
import {
  CustomNoRowsOverlay,
  StyledDataGrid,
  StyledTooltip,
} from '@/hooks/useStyleDataGrid';
import { PaperComponent } from '@/modules/layout';
import {
  AccountType,
  RegimenFiscalType,
  TaxRateInterface,
  VoucherTypeInterface,
} from '@/types';
import { Add, ContentCopy, Delete } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridEditInputCell,
  GridPreProcessEditCellProps,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowModel,
  GridRowsProp,
  GridToolbarContainer,
  GridValidRowModel,
  useGridApiContext,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { esES } from '@mui/x-data-grid/locales';
import { InputNumber } from 'antd';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { AutocompleteEditAccountCell } from './CustomCells';

export type ReembolsoDialogProps = {
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  open: boolean;
  setOpen: (open: boolean) => void;
  formState: FormState;
  createMode: boolean;
  editMode: boolean;
  impuestos: TaxRateInterface[];
};

export const ReembolsoDialog: React.FC<ReembolsoDialogProps> = ({
  rows,
  setRows,
  open,
  setOpen,
  formState,
  createMode,
  editMode,
  impuestos,
}) => {
  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    ImpuestoValue,
    handleDeleteClick,
    handleDuplicateClick,
  } = useCommonDataGrid(rows, setRows);

  const { fetchById } = useAccountAsync();

  const { fetchIsDocumentAvailable } = useFacturaProveedorAsync();

  const styles = useStyles();

  const stateId = useMemo(
    () => formState.providerInvoiceStatusId,
    [formState.providerInvoiceStatusId]
  );

  const [identificacionFiscalList, setIdentificacionFiscalList] = useState<
    RegimenFiscalType[]
  >([]);

  const [voucherTypeList, setVoucherTypeList] = useState<
    VoucherTypeInterface[]
  >([]);

  useEffect(() => {
    if (!open) {
      setIdentificacionFiscalList([]);
      return;
    }

    const fetchIdentificacionFiscalList = async () => {
      const response = (await getRegimenFiscal()) as RegimenFiscalType[];
      const identificacionFiscalListFiltered = response.filter(
        (item) =>
          item.fiscalIdentificationTypeTransaction ===
          ParametersEnum.TIPO_TRANSACCION_ID_FISCAL_COMPRA
      );
      setIdentificacionFiscalList(identificacionFiscalListFiltered);
    };

    const fetchAllTipoComprobante = async () => {
      const response = await getAllTipoComprobante();
      if (response) {
        const list: VoucherTypeInterface[] = response.filter(
          (voucherType) =>
            voucherType.voucherTypeCode === ComprobanteTypeEnum.FACTURA ||
            voucherType.voucherTypeCode ===
              ComprobanteTypeEnum.NOTA_O_BOLETA_DE_VENTA
        );
        setVoucherTypeList(list);
      }
    };

    fetchIdentificacionFiscalList();
    fetchAllTipoComprobante();
  }, [open]);

  const columns: GridColDef[] = [
    {
      field: 'fiscalIdType',
      headerName: 'Tipo Identificación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      type: 'singleSelect',
      valueOptions: identificacionFiscalList.map((regimen) => ({
        value: regimen.fiscalIdentificationTypeId,
        label: regimen.fiscalIdentificationTypeName,
      })),
      renderCell: (params) => {
        if (params.value === null || identificacionFiscalList.length === 0)
          return '';
        const identificacionFiscal = identificacionFiscalList.find(
          (item: RegimenFiscalType) =>
            item.fiscalIdentificationTypeId === params.value
        ) as RegimenFiscalType;
        return identificacionFiscal.fiscalIdentificationTypeName;
      },
    },
    {
      field: 'reimbursementIdentification',
      headerName: 'Nro. Identificación',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      renderEditCell: (props: GridRenderEditCellParams) => {
        const apiRef = useGridApiContext();
        return (
          <GridEditInputCell
            {...props}
            onChange={(e: any) => {
              const re = /^[0-9\b]+$/;
              if (e.target.value === '' || re.test(e.target.value)) {
                apiRef.current.setEditCellValue({
                  id: props.id,
                  field: props.field,
                  value: e.target.value,
                });
              }
            }}
            inputProps={{
              maxLength: 13,
            }}
          />
        );
      },
      valueSetter: (params) => {
        const { value, row } = params;
        const fiscalIdType = row.fiscalIdType as string;
        const validLength =
          fiscalIdType == TipoIdetificacionFiscalEnum.CEDULA_COMPRA ? 10 : 13;
        if (
          fiscalIdType == TipoIdetificacionFiscalEnum.CEDULA_COMPRA &&
          value.length === validLength
        ) {
          const validated = validarNumeroIdentificacion(value, fiscalIdType);
          if (!validated) {
            enqueueSnackbar('Número de identificación incorrecto', {
              variant: 'error',
            });
            return {
              ...row,
              reimbursementIdentification: 'Ingrese un número válido',
            };
          }
        } else if (
          (fiscalIdType == TipoIdetificacionFiscalEnum.RUC_COMPRA ||
            fiscalIdType == TipoIdetificacionFiscalEnum.PASSPORT_COMPRA) &&
          value.length === validLength
        ) {
          const validated = validarNumeroIdentificacion(value, fiscalIdType);
          if (!validated) {
            enqueueSnackbar('Número de identificación incorrecto', {
              variant: 'error',
            });
            return {
              ...row,
              reimbursementIdentification: 'Ingrese un número válido',
            };
          }
        }
        if (value.length !== validLength) {
          enqueueSnackbar('Ingrese la longitud de carácteres correcta', {
            variant: 'error',
          });
          return {
            ...row,
            reimbursementIdentification: 'Ingrese un número válido',
          };
        }
        return { ...row, reimbursementIdentification: value };
      },
    },
    {
      field: 'voucherTypeId',
      headerName: 'Tipo Comprobante',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      type: 'singleSelect',
      valueOptions: voucherTypeList.map((item) => ({
        value: item.voucherTypeId,
        label: item.voucherTypeName,
      })),
      renderCell: (params) => {
        if (params.value === null || voucherTypeList.length === 0) return '';
        const voucher = voucherTypeList.find(
          (item: VoucherTypeInterface) => item.voucherTypeId === params.value
        ) as VoucherTypeInterface;
        return voucher.voucherTypeName;
      },
    },
    {
      field: 'reimbursementDate',
      headerName: 'Fecha',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      type: 'date',
      valueFormatter: (params) =>
        parseDateWithMiliseconds(params.value as string),
      renderEditCell: (params) => {
        const apiRef = useGridApiContext();
        return (
          <StyledDatePicker
            views={['year', 'month', 'day']}
            format="dd/MM/yyyy"
            minDate={new Date(formState.providerInvoiceIssueDate)}
            maxDate={new Date()}
            defaultValue={new Date()}
            value={new Date(params.value as string)}
            onChange={(value) => {
              apiRef.current.setEditCellValue({
                id: params.id,
                field: params.field,
                value: new Date(value as string).toISOString(),
              });
            }}
            slotProps={{
              textField: {
                className: styles.genericFieldStyle,
                sx: {
                  minWidth: '100%',
                },
                InputProps: {
                  className: styles.textWhiteStyle,
                },
              },
            }}
          />
        );
      },
    },
    {
      field: 'reimbursementDocumentNumber',
      headerName: 'Nro. Comprobante',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 70,
      flex: 0.7,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      renderEditCell: (props: GridRenderEditCellParams) => {
        const { error } = props;

        const apiRef = useGridApiContext();
        return (
          <StyledTooltip open={!!error} title={error} placement="right">
            <GridEditInputCell
              {...props}
              onChange={(e: any) => {
                const re = /^[0-9\b]+$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  apiRef.current.setEditCellValue({
                    id: props.id,
                    field: props.field,
                    value: e.target.value,
                  });
                }
              }}
              inputProps={{
                maxLength: 15,
              }}
            />
          </StyledTooltip>
        );
      },
      preProcessEditCellProps: async (params: GridPreProcessEditCellProps) => {
        const documentNumber = params.props.value;

        const identification =
          params.otherFieldsProps?.reimbursementIdentification.value ||
          params.row.reimbursementIdentification;

        if (documentNumber === '') {
          const errorMessage = 'Debe ingresar un número de documento';
          return {
            ...params.otherFieldsProps?.reimbursementIdentification,
            error: errorMessage,
          };
        } else if (identification === '') {
          const errorMessage = 'Debe ingresar un número de identificación';
          return { ...params.props, error: errorMessage };
        } else if (documentNumber.length < 15) {
          const errorMessage = 'El número de comprobante debe tener 15 dígitos';
          return { ...params.props, error: errorMessage };
        } else if (documentNumber.length === 15 && identification !== '') {
          const isDocumentAvailable = (await fetchIsDocumentAvailable(
            documentNumber,
            identification
          ))
            ? false
            : 'El documento ya fue registrado';
          return {
            ...params.props,
            otherFieldsProps: {
              ...params.otherFieldsProps,
              reimbursementIdentification: {
                ...params.otherFieldsProps?.reimbursementIdentification,
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
            reimbursementIdentification: {
              ...params.otherFieldsProps?.reimbursementIdentification,
              error: false,
            },
          },
          error: false,
        };
      },
    },
    {
      field: 'reimbursementDocumentAuthNumber',
      headerName: 'Nro. Autorización',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 80,
      flex: 1,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      renderEditCell: (props: GridRenderEditCellParams) => {
        const { error } = props;

        const apiRef = useGridApiContext();
        return (
          <StyledTooltip open={!!error} title={error} placement="right">
            <GridEditInputCell
              {...props}
              onChange={(e: any) => {
                const re = /^[0-9\b]+$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  apiRef.current.setEditCellValue({
                    id: props.id,
                    field: props.field,
                    value: e.target.value,
                  });
                }
              }}
              inputProps={{
                maxLength: 49,
              }}
            />
          </StyledTooltip>
        );
      },
      preProcessEditCellProps: async (params: GridPreProcessEditCellProps) => {
        const autorizationNumber = params.props.value;

        if (autorizationNumber === '') {
          const errorMessage = 'Debe ingresar un número de autorización';
          return {
            ...params.props,
            error: errorMessage,
          };
        } else if (
          autorizationNumber.length !== 10 &&
          autorizationNumber.length !== 47 &&
          autorizationNumber.length !== 49
        ) {
          const errorMessage =
            'El número de autorización debe tener 10, 47 o 49 dígitos';
          return { ...params.props, error: errorMessage };
        }
        return {
          ...params.props,
          error: false,
        };
      },
    },
    {
      field: 'taxRateId',
      headerName: 'Tarifa IVA',
      minWidth: 40,
      flex: 0.4,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      type: 'singleSelect',
      valueOptions: impuestos.map((iva) => ({
        value: iva.taxRateId,
        label: iva.taxDescription,
      })),
      renderCell: (params: GridRenderCellParams) => (
        <ImpuestoValue value={params.value as number} impuestos={impuestos} />
      ),
    },
    {
      field: 'reimbursementZeroIvaRate',
      headerName: 'Tarifa 0%',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
      renderEditCell: (params) => {
        const apiRef = useGridApiContext();
        return (
          <InputNumber
            min={0}
            value={params.value !== null ? params.value : 0}
            onChange={(value) => {
              apiRef.current.setEditCellValue({
                id: params.id,
                field: params.field,
                value: value,
              });
            }}
            size="small"
            variant="borderless"
            controls={false}
            className="mi-input-number"
            precision={2}
            onFocus={(e) => e.target.select()}
          />
        );
      },
    },
    {
      field: 'reimbursementIvaRate',
      headerName: 'Tarifa IVA%',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
      renderEditCell: (params) => {
        const apiRef = useGridApiContext();
        return (
          <InputNumber
            min={0}
            value={params.value !== null ? params.value : 0}
            onChange={(value) => {
              apiRef.current.setEditCellValue({
                id: params.id,
                field: params.field,
                value: value,
              });
            }}
            size="small"
            variant="borderless"
            controls={false}
            className="mi-input-number"
            precision={2}
            onFocus={(e) => e.target.select()}
          />
        );
      },
    },
    {
      field: 'reimbursementNonIvaRate',
      headerName: 'Tarifa No Objeto IVA',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: true,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
      renderEditCell: (params) => {
        const apiRef = useGridApiContext();
        return (
          <InputNumber
            min={0}
            value={params.value !== null ? params.value : 0}
            onChange={(value) => {
              apiRef.current.setEditCellValue({
                id: params.id,
                field: params.field,
                value: value,
              });
            }}
            size="small"
            variant="borderless"
            controls={false}
            className="mi-input-number"
            precision={2}
            onFocus={(e) => e.target.select()}
          />
        );
      },
    },

    {
      field: 'reimbursementIvaAmount',
      headerName: 'Monto IVA',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      minWidth: 50,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      editable: false,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'reimbursementTotal',
      headerName: 'Total Reembolso',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      minWidth: 50,
      flex: 0.5,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
      sortable: false,
      disableColumnMenu: true,
      editable: true,
    },
    {
      field: 'accountId',
      headerName: 'Cuenta',
      minWidth: 100,
      flex: 1,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      editable: true,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value || params.value === null) return 'Sin Cuenta';
        return params.row.accountName;
      },
      renderEditCell: (params) => {
        return <AutocompleteEditAccountCell params={params} />;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 120,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const row = rows.find((row) => row.id === id);
        if (!row) return [];
        return [
          <Tooltip title="Duplicar Item">
            <GridActionsCellItem
              icon={<ContentCopy />}
              label="Duplicar"
              onClick={handleDuplicateClick(id)}
            />
          </Tooltip>,
          <Tooltip title="Borrar">
            <GridActionsCellItem
              icon={<Delete />}
              disabled={row.reimbursementId !== null}
              label="Borrar"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };

    const {
      taxRateId,
      reimbursementZeroIvaRate,
      reimbursementIvaRate,
      reimbursementNonIvaRate,
      accountId,
    } = newRow;

    let mergedRow: GridValidRowModel = {
      ...updatedRow,
    };

    if (accountId !== null) {
      const account = await fetchById(accountId).then(
        (response) => response as AccountType
      );
      mergedRow = {
        ...newRow,
        accountId,
        accountName: account.accountName,
        isNew: false,
      };
    }

    if (taxRateId !== null) {
      const taxRate = impuestos.find((tax) => tax.taxRateId === taxRateId);

      const reimbursementIvaAmount = taxRate
        ? getPercentageValue(reimbursementIvaRate, taxRate.taxRatePercentage)
        : 0;

      const reimbursementTotal =
        reimbursementIvaAmount +
        reimbursementIvaRate +
        reimbursementZeroIvaRate +
        reimbursementNonIvaRate;

      mergedRow = {
        ...mergedRow,
        reimbursementIvaAmount,
        reimbursementTotal,
        reimbursementIvaRate,
        reimbursementZeroIvaRate,
        reimbursementNonIvaRate,
        isNew: false,
      };
    }

    const rowIndex = rows.findIndex((row) => row.id === newRow.id);

    setRows((oldRows) => {
      const newRows = [...oldRows];
      newRows[rowIndex] = mergedRow;
      return newRows;
    });
    return mergedRow;
  };
  return (
    <Dialog
      open={open}
      maxWidth={false}
      fullWidth
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle
        style={{
          cursor: 'move',
          textAlign: 'center',
        }}
        id="draggable-dialog-title"
      >
        {'Reembolsos'}
      </DialogTitle>
      <DialogContent style={{ overflowX: 'auto' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <StyledDataGrid
              rows={rows}
              columns={columns}
              pagination
              getRowClassName={(params) =>
                params.id === ParametersEnum.ID_ROW_TOTAL
                  ? 'super-app-theme--true'
                  : `super-app-theme--null`
              }
              editMode="cell"
              getRowHeight={() => 'auto'}
              columnHeaderHeight={45}
              rowModesModel={rowModesModel}
              onRowModesModelChange={handleRowModesModelChange}
              onRowEditStop={handleRowEditStop}
              processRowUpdate={processRowUpdate}
              slots={{
                noRowsOverlay: CustomNoRowsOverlay,
                toolbar: DialogToolbar,
              }}
              slotProps={{
                toolbar: {
                  setRows,
                  formState,
                },
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
              isCellEditable={(params) =>
                params.id !== ParametersEnum.ID_ROW_TOTAL
              }
              hideFooter
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">
          Cancelar
        </Button>
        <Button
          color="primary"
          disabled={
            rows.length === 0 ||
            !(
              (createMode && formState.providerId !== null) ||
              (editMode && stateId !== EstadoDocumentoEnum.CONFIRMADO)
            )
          }
          //   onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function DialogToolbar(props: {
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  formState: FormState;
}) {
  const { setRows, formState } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        reimbursementId: null,
        fiscalIdType: null,
        voucherTypeId: null,
        reimbursementIdentification: '',
        reimbursementDocumentNumber: '',
        reimbursementDocumentAuthNumber: '',
        reimbursementDate: new Date().toISOString(),
        reimbursementIvaRate: 0,
        reimbursementIvaAmount: 0,
        reimbursementNonIvaRate: 0,
        reimbursementCancelled: false,
        reimbursementZeroIvaRate: 0,
        accountId: null,
        documentId: formState.providerInvoiceId,
        reimbursementTotal: 0,
        taxRateId: ParametersEnum.TAX_RATE_ID_DEFAULT,
      },
    ]);
  };

  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: '10px',
      }}
    >
      <Button
        color="primary"
        startIcon={<Add />}
        onClick={() => handleClick()}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1, width: '160px' }}
      >
        Agregar
      </Button>
    </GridToolbarContainer>
  );
}
