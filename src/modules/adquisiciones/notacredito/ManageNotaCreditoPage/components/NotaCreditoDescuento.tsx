import { NotaCreditoEnum } from '@/enums';
import { setCurrencyNumber, setDecimalPlacesString } from '@/functions';
import { FormState, useCommonDataGrid } from '@/hooks';
import {
  AccountType,
  FacturaProveedorResponseInterface,
  ImpuestoDocumentoInterface,
  SucursalType,
  TaxRateInterface,
} from '@/types';
import { Grid } from '@mui/material';
import {
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowModesModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import React, { useEffect } from 'react';
import {
  CuentaContableCell,
  ImpuestoBooleanCell,
} from './NotaCreditoCustomCell';
import { FooterNotaCredito } from './NotaCreditoFooter';
import { ImpuestoCell, InputChangeNC } from './NotaCreditoCustomCell';
import { CustomToolbarNotaCredito } from './NotaCreditoToolBar';
import { enqueueSnackbar } from 'notistack';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

export type NotaCreditoProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  rowsNotaCredito: GridRowsProp;
  setRowsNotaCredito: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  createMode: boolean;
  editMode: boolean;
  rowModesModel: GridRowModesModel;
  sucursales: SucursalType[];
  impuestos: TaxRateInterface[];
  taxes: ImpuestoDocumentoInterface[];
  setTaxes: React.Dispatch<React.SetStateAction<ImpuestoDocumentoInterface[]>>;
  cuentaGastosList: AccountType[];
  setSearchCuentaGasto: React.Dispatch<React.SetStateAction<string>>;
  invoiceSelected: FacturaProveedorResponseInterface | null;
};

export const NotaCreditoDescuento: React.FC<NotaCreditoProps> = ({
  formState,
  setFormState,
  rowsNotaCredito,
  setRowsNotaCredito,
  createMode,
  editMode,
  rowModesModel,
  sucursales,
  impuestos,
  taxes,
  setTaxes,
  cuentaGastosList,
  setSearchCuentaGasto,
  invoiceSelected,
}) => {
  const ImpuestoValue = ({ value }: { value: number }) => {
    const impuesto = impuestos.map((impuesto: TaxRateInterface) => {
      if (impuesto.taxRateId === value) {
        return impuesto.taxDescription;
      }
      return null;
    });

    return <div>{impuesto}</div>;
  };

  const {
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    columns,
    setColumns,
  } = useCommonDataGrid(rowsNotaCredito, setRowsNotaCredito);

  useEffect(() => {
    if (formState.ncTypeId === NotaCreditoEnum.DESCUENTO) {
      setColumns([
        {
          field: 'productCode',
          headerName: 'Código',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          minWidth: 130,
          flex: 1,
          cellClassName: 'centered-grid',
        },
        {
          field: 'productName',
          headerName: 'Nombre',
          type: 'string',
          minWidth: 250,
          flex: 2,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
        },
        {
          field: 'branchId',
          headerName: 'Sucursal',
          minWidth: 100,
          flex: 0.9,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          valueFormatter: (params) => {
            const branchId = params.value;
            const branchName = branchId
              ? sucursales.find((item) => item.branchId === branchId)?.name
              : '';
            return branchName;
          },
        },
        {
          field: 'invoiceTotalPrice',
          headerName: 'Valor FC',
          minWidth: 150,
          flex: 1,
          sortable: false,
          type: 'number',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          valueFormatter: (params) =>
            params.value === null
              ? ''
              : setCurrencyNumber(Number(params.value)),
        },
        {
          field: 'valueNC',
          headerName: 'Valor NC',
          minWidth: 150,
          flex: 1,
          sortable: false,
          type: 'number',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: true,
          renderEditCell: (params) => (
            <InputChangeNC
              params={params}
              rowsNotaCredito={rowsNotaCredito}
              setRowsNotaCredito={setRowsNotaCredito}
              enqueueSnackbar={enqueueSnackbar}
            />
          ),
          valueFormatter: (params) =>
            params.value === undefined
              ? setCurrencyNumber(0.0)
              : setCurrencyNumber(Number(params.value)),
        },
        {
          field: 'accountName',
          headerName: 'Cuenta Contable',
          minWidth: 300,
          flex: 3,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: true,
          renderEditCell: (params) => (
            <CuentaContableCell
              params={params}
              rowsNotaCredito={rowsNotaCredito}
              setRowsNotaCredito={setRowsNotaCredito}
              cuentaGastosList={cuentaGastosList}
              setSearchCuentaGasto={setSearchCuentaGasto}
              onAutocompleteChange={(event, newValue) =>
                handleAutocompleteChange(event, newValue, params)
              }
            />
          ),
        },
        {
          field: 'hasIva',
          headerName: 'IVA',
          minWidth: 80,
          flex: 0.8,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          type: 'boolean',
          editable: true,
          renderEditCell: (params) => (
            <ImpuestoBooleanCell params={params} setRows={setRowsNotaCredito} />
          ),
        },
        {
          field: 'taxRateId',
          headerName: 'Tarifa Impuesto',
          minWidth: 50,
          flex: 0.8,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: true,
          renderCell: (params) => (
            <ImpuestoValue value={params.value as number} />
          ),
          renderEditCell: (params) => (
            <ImpuestoCell
              params={params}
              setRows={setRowsNotaCredito}
              impuestos={impuestos}
            />
          ),
        },
        {
          field: 'totalCost',
          headerName: 'Total',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          type: 'number',
          minWidth: 150,
          flex: 1,
          sortable: false,
          valueFormatter: (params) =>
            params.value === undefined
              ? setCurrencyNumber(0.0)
              : setCurrencyNumber(Number(params.value)),
        },
      ]);
    } else if (formState.ncTypeId === NotaCreditoEnum.DEVOLUCION) {
      setColumns([
        {
          field: 'productCode',
          headerName: 'Código',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          minWidth: 130,
          flex: 1,
          cellClassName: 'centered-grid',
        },
        {
          field: 'productName',
          headerName: 'Nombre',
          type: 'string',
          minWidth: 250,
          flex: 2,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
        },
        {
          field: 'branchId',
          headerName: 'Sucursal',
          minWidth: 100,
          flex: 0.9,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          valueFormatter: (params) => {
            const branchId = params.value;
            const branchName = branchId
              ? sucursales.find((item) => item.branchId === branchId)?.name
              : '';
            return branchName;
          },
        },
        {
          field: 'quantity',
          headerName: 'Cantidad',
          minWidth: 150,
          flex: 1,
          sortable: false,
          type: 'number',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          renderCell: (params) => setDecimalPlacesString(params.value, 2),
        },
        {
          field: 'availableQuantity',
          headerName: 'Cantidad Disponible',
          minWidth: 150,
          flex: 1,
          sortable: false,
          type: 'number',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          renderCell: (params) => setDecimalPlacesString(params.value, 2),
        },
        {
          field: 'unitPrice',
          headerName: 'Precio Unitario',
          minWidth: 150,
          flex: 1,
          sortable: false,
          type: 'number',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          renderCell: (params) => setDecimalPlacesString(params.value, 6),
        },
        {
          field: 'hasIva',
          headerName: 'IVA',
          minWidth: 80,
          flex: 0.8,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          type: 'boolean',
          editable: true,
          renderEditCell: (params) => (
            <ImpuestoBooleanCell params={params} setRows={setRowsNotaCredito} />
          ),
        },
        {
          field: 'taxRateId',
          headerName: '% IVA',
          minWidth: 80,
          flex: 0.8,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: true,
          renderCell: (params: GridRenderCellParams) => (
            <ImpuestoValue value={params.value as number} />
          ),
          renderEditCell: (params) => (
            <ImpuestoCell
              params={params}
              setRows={setRowsNotaCredito}
              impuestos={impuestos}
            />
          ),
        },
        {
          field: 'returnedQuantity',
          headerName: 'C. Devolución',
          minWidth: 150,
          flex: 1,
          sortable: false,
          type: 'number',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: true,
          renderCell: (params) => setDecimalPlacesString(params.value, 2),
          renderEditCell: (params) => (
            <InputChangeNC
              params={params}
              rowsNotaCredito={rowsNotaCredito}
              setRowsNotaCredito={setRowsNotaCredito}
              enqueueSnackbar={enqueueSnackbar}
            />
          ),
        },
        {
          field: 'totalCost',
          headerName: 'Total',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          type: 'number',
          minWidth: 150,
          flex: 1,
          sortable: false,
          valueFormatter: (params) =>
            params.value === undefined
              ? setCurrencyNumber(0.0)
              : setCurrencyNumber(Number(params.value)),
        },
      ]);
    }
  }, [
    rowsNotaCredito.length,
    formState.ncTypeId,
    JSON.stringify(cuentaGastosList),
    JSON.stringify(sucursales),
    JSON.stringify(impuestos),
  ]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AccountType,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rowsNotaCredito.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rowsNotaCredito[rowIndex]) {
        const newRows = [...rowsNotaCredito];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          accountId: newValue.accountId,
        };
        setRowsNotaCredito(newRows);
      }
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
      <Grid item xs={12}>
        <StyledDataGrid
          rows={rowsNotaCredito}
          columns={columns}
          editMode={createMode || editMode ? 'cell' : undefined}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          getRowClassName={(params) =>
            params !== null ? `super-app-theme--null` : ''
          }
          processRowUpdate={processRowUpdate}
          getRowHeight={() => 'auto'}
          onRowEditStop={handleRowEditStop}
          columnHeaderHeight={45}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
            footer: FooterNotaCredito,
            toolbar: CustomToolbarNotaCredito,
          }}
          slotProps={{
            footer: {
              rows: rowsNotaCredito,
              setRows: setRowsNotaCredito,
              setFormState,
              impuestos,
              taxes,
              setTaxes,
              createMode,
            },
            toolbar: {
              setRows: setRowsNotaCredito,
              rows: rowsNotaCredito,
              createMode,
              formState,
              cuentaGastosList,
              invoiceSelected,
            },
          }}
          sx={{
            height: rowsNotaCredito.length > 0 ? '100%' : '300px',
          }}
        />
      </Grid>
    </Grid>
  );
};
