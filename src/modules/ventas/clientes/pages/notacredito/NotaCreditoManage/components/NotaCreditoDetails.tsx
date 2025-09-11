import { ParametersEnum, TipoNotaCreditoEnum } from '@/enums';
import { FormState, useCommonDataGrid } from '@/hooks';
import { Grid } from '@mui/material';
import {
  GridColumnVisibilityModel,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { useEffect, useState } from 'react';
import {
  allowDecimalsMeaseurementUnit,
  setCurrencyNumber,
  setDecimalPlacesString,
} from '@/functions';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import {
  AccountType,
  ImpuestoDocumentoInterface,
  TaxRateInterface,
} from '@/types';
import { NotaCreditoToolBar } from './NotaCreditoToolBar';
import { NotaCreditoFooter } from './NotaCreditoFooter';
import {
  ImpuestoBooleanCell,
  ImpuestoCell,
  InputQuantityFunction,
  InputValueFunction,
} from './CustomCells';
import { AutocompleteEditAccountCell } from '@/modules/contabilidad/Pagos/pages/components/CustomCells';

export type NotaCreditoDetailsProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  cuentaList: AccountType[];
  taxes: ImpuestoDocumentoInterface[];
  setTaxes: React.Dispatch<React.SetStateAction<ImpuestoDocumentoInterface[]>>;
};

export const NotaCreditoDetails: React.FC<NotaCreditoDetailsProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  rows,
  setRows,
  cuentaList,
  taxes,
  setTaxes,
}) => {
  const { sucursales, impuestos } = useSelector(
    (state: RootState) => state.common
  );

  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    columns,
    setColumns,
  } = useCommonDataGrid(rows, setRows);

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      quantity: false,
      invoiceQuantity: false,
    });

  const ImpuestoValue = ({ value }: { value: number }) => {
    const impuesto = impuestos.map((impuesto: TaxRateInterface) => {
      if (impuesto.taxRateId === value) {
        return impuesto.taxDescription;
      }
      return null;
    });

    return <div>{impuesto}</div>;
  };

  useEffect(() => {
    if (formState.ncTypeId === TipoNotaCreditoEnum.DEVOLUCION) {
      setColumns([
        {
          field: 'productCode',
          headerName: 'Código Producto',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 50,
          flex: 0.5,
        },
        {
          field: 'productName',
          headerName: 'Item',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 70,
          flex: 1,
        },
        {
          field: 'branchId',
          headerName: 'Sucursal',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 70,
          flex: 1,
          type: 'singleSelect',
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
          field: 'quantity',
          headerName: 'Cantidad',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.5,
          sortable: false,
          disableColumnMenu: true,
          valueFormatter: (params) => {
            const unitMeasureId = rows.find((row) => row.id === params.id)
              ?.unitMeasureId as number;
            if (allowDecimalsMeaseurementUnit(unitMeasureId)) {
              return setDecimalPlacesString(params.value as number, 6);
            }
            return setDecimalPlacesString(params.value as number, 0);
          },
        },
        {
          field: 'invoiceQuantity',
          headerName: 'Cantidad Disponible',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.5,
          sortable: false,
          disableColumnMenu: true,
          valueFormatter: (params) => {
            const unitMeasureId = rows.find((row) => row.id === params.id)
              ?.unitMeasureId as number;
            if (allowDecimalsMeaseurementUnit(unitMeasureId)) {
              return setDecimalPlacesString(params.value as number, 6);
            }
            return setDecimalPlacesString(params.value as number, 0);
          },
        },
        {
          field: 'unitPrice',
          headerName: 'Precio Unitario',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          type: 'number',
          minWidth: 50,
          flex: 0.8,
          sortable: false,
          disableColumnMenu: true,
          valueFormatter: (params) =>
            setDecimalPlacesString(params.value as number, 6),
        },
        {
          field: 'hasIva',
          headerName: 'IVA',
          align: 'center',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          minWidth: 30,
          sortable: false,
          type: 'boolean',
          flex: 0.5,
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
          renderCell: (params: GridRenderCellParams) => (
            <ImpuestoValue value={params.value as number} />
          ),
        },
        {
          field: 'returnedQuantity',
          headerName: 'Cantidad Devolución',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.8,
          type: 'number',
          sortable: false,
          disableColumnMenu: true,
          valueFormatter: (params) => {
            const unitMeasureId = rows.find((row) => row.id === params.id)
              ?.unitMeasureId as number;
            if (allowDecimalsMeaseurementUnit(unitMeasureId)) {
              return setDecimalPlacesString(params.value as number, 6);
            }
            return setDecimalPlacesString(params.value as number, 0);
          },
          editable: true,
          renderEditCell: (params) => {
            return <InputQuantityFunction params={params} setRows={setRows} />;
          },
        },
        {
          field: 'totalPrice',
          headerName: 'Total',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.8,
          sortable: false,
          disableColumnMenu: true,
          valueFormatter: (params) => setCurrencyNumber(params.value as number),
        },
      ]);
    } else if (formState.ncTypeId === TipoNotaCreditoEnum.DESCUENTO) {
      setColumns([
        {
          field: 'branchId',
          headerName: 'Sucursal',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 70,
          flex: 1,
          type: 'singleSelect',
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
          field: 'unitPrice',
          headerName: 'Valor NC',
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
          field: 'accountId',
          headerName: 'Cuenta Contable',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 70,
          flex: 1,
          renderCell: (params) => {
            const cuenta = cuentaList.find(
              (cuenta) => cuenta.accountId === params.value
            );
            return cuenta
              ? `${cuenta.accountNumber} - ${cuenta.accountName}`
              : 'Sin Cuenta';
          },
        },
        {
          field: 'hasIva',
          headerName: 'IVA',
          align: 'center',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          minWidth: 30,
          sortable: false,
          type: 'boolean',
          flex: 0.5,
          editable: true,
          renderEditCell: (params) => (
            <ImpuestoBooleanCell params={params} setRows={setRows} />
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
              setRows={setRows}
              impuestos={impuestos}
            />
          ),
        },
        {
          field: 'totalPrice',
          headerName: 'Total',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          minWidth: 50,
          flex: 0.5,
          sortable: false,
          disableColumnMenu: true,
          valueFormatter: (params) => setCurrencyNumber(params.value as number),
        },
      ]);
    } else if (formState.ncTypeId === TipoNotaCreditoEnum.CONTABLE) {
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
          field: 'branchId',
          headerName: 'Sucursal',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 70,
          flex: 1,
          type: 'singleSelect',
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
          field: 'unitPrice',
          headerName: 'Valor NC',
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
      ]);
    }
  }, [
    rows.length,
    formState.ncTypeId,
    JSON.stringify(cuentaList),
    JSON.stringify(rows.map((row) => row.accountId)),
  ]);

  useEffect(() => {
    if (createMode || editMode) {
      setColumnVisibilityModel({
        quantity: true,
        invoiceQuantity: true,
      });
    }
  }, [createMode, editMode]);

  return (
    <Grid item xs={12}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        editMode={createMode || editMode ? 'cell' : undefined}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) =>
          setColumnVisibilityModel(newModel)
        }
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
          toolbar: NotaCreditoToolBar,
          footer: NotaCreditoFooter,
        }}
        slotProps={{
          toolbar: {
            setRows,
            createMode,
            formState,
            cuentaList,
          },
          footer: {
            rows,
            setRows,
            formState,
            setFormState,
            impuestos,
            taxes,
            setTaxes,
            createMode,
          },
        }}
      />
    </Grid>
  );
};
