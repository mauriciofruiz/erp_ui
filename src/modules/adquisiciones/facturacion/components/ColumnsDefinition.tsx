import { EstadoDocumentoEnum, TipoDetalleFacturaEnum } from '@/enums';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
  GridValueFormatterParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import {
  AutocompleteAperturaImportacionCell,
  AutocompleteEditEmployeeCell,
  AutocompleteEditProductCell,
  AutocompleteEditServiceCell,
  CustomUpdateTotalCell,
  ImpuestoBooleanCell,
  ImpuestoCell,
  RetencionMultipleCell,
} from './CustomCells';
import { Dispatch, SetStateAction } from 'react';
import {
  getDecimalPlaces,
  setCurrencyNumber,
  setDecimalPlaces,
  setDecimalPlacesString,
} from '@/functions';
import { RetencionType, SucursalType, TaxRateInterface } from '@/types';
import { Tooltip } from '@mui/material';
import { Cancel, ContentCopy, Delete, Edit, Save } from '@mui/icons-material';
import { randomId } from '@mui/x-data-grid-generator';

interface ColumnsProps {
  createMode: boolean;
  editMode: boolean;
  rows: GridRowsProp;
  setRows: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  providerId: number;
  retencionList: RetencionType[];
  sucursales: SucursalType[];
  rowModesModel: GridRowModesModel;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  handleEmptyRows: (currentRow: GridValidRowModel) => void;
  invoiceStatusId: number;
  impuestos: TaxRateInterface[];
  isForeign: boolean;
  totalValue: number;
}

export const ColumnsDefinition = (props: ColumnsProps): GridColDef[] => {
  const {
    createMode,
    editMode,
    rows,
    setRows,
    providerId,
    retencionList,
    sucursales,
    rowModesModel,
    setRowModesModel,
    handleEmptyRows,
    invoiceStatusId,
    impuestos,
    isForeign,
    totalValue,
  } = props;
  /**
   * Renders the RetentionValue component.
   *
   * @param value - An array of RetencionType objects.
   * @returns The rendered RetentionValue component.
   */
  const RetentionValue = ({ value }: { value: RetencionType[] }) => (
    <div>
      {value.map((retencion, index) => (
        <div key={index}>* {retencion.retentionDetail}</div>
      ))}
    </div>
  );

  /**
   * Componente que muestra el valor del impuesto correspondiente.
   *
   * @param value - Valor del impuesto.
   * @returns El componente que muestra el valor del impuesto.
   */
  const ImpuestoValue = ({ value }: { value: number }) => {
    const impuesto = impuestos.map((impuesto: TaxRateInterface) => {
      if (impuesto.taxRateId === value) {
        return impuesto.taxDescription;
      }
      return null;
    });

    return <div>{impuesto}</div>;
  };

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
    if (row.detailId && row.detailId !== null) {
      setRows(
        rows.map((row) => (row.id === id ? { ...row, status: false } : row))
      );
    } else {
      setRows(rows.filter((row) => row.id !== id));
    }
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

  const columns: GridColDef[] = isForeign
    ? [
        {
          field: 'productCode',
          headerName: 'Código',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 150,
          flex: 1,
          cellClassName: 'centered-grid',
        },
        {
          field: 'providerProductCode',
          headerName: 'Código Proveedor',
          type: 'string',
          minWidth: 200,
          flex: 1,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: createMode || editMode,
        },
        {
          field: 'productName',
          headerName: 'Item',
          type: 'string',
          minWidth: 300,
          flex: 2,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: true,
          renderEditCell: (params) => {
            if (params.row.detailTypeId === TipoDetalleFacturaEnum.INVENTARIO) {
              return (
                <AutocompleteEditProductCell
                  params={params}
                  rows={rows}
                  setRows={setRows}
                  providerId={providerId}
                />
              );
            } else {
              return (
                <AutocompleteEditServiceCell
                  params={params}
                  rows={rows}
                  setRows={setRows}
                />
              );
            }
          },
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
          field: 'quantity',
          headerName: 'Cantidad',
          minWidth: 150,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          editable: true,
          flex: 1,
          renderCell: (params: GridRenderCellParams) =>
            setDecimalPlacesString(
              params.value as number,
              getDecimalPlaces(params.row.unitMeasureId)
            ),
          renderEditCell: (params) => (
            <CustomUpdateTotalCell
              params={params}
              rows={rows}
              setRows={setRows}
            />
          ),
        },
        {
          field: 'unitPrice',
          headerName: 'Precio Unitario',
          minWidth: 150,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          editable: true,
          flex: 1,
          valueFormatter: (params: GridValueFormatterParams) => {
            return setDecimalPlaces(Number(params.value), 6).toFixed(6);
          },
          renderEditCell: (params) => (
            <CustomUpdateTotalCell
              params={params}
              rows={rows}
              setRows={setRows}
            />
          ),
        },
        {
          field: 'participationPercentage',
          headerName: '% Participación',
          minWidth: 150,
          flex: 1,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          type: 'number',
          valueGetter: (params: GridValueGetterParams) => {
            const row = rows.find((row) => row.id === params.row.id);
            if (!row) return false;
            return row.totalPrice / totalValue;
          },
          valueFormatter: (params: GridValueFormatterParams) => {
            return new Intl.NumberFormat('es-ES', {
              style: 'percent',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(params.value as number);
          },
        },
        {
          field: 'totalPrice',
          headerName: 'Valor Total',
          minWidth: 150,
          flex: 1,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          type: 'number',
          editable: true,
          valueFormatter: (params: GridValueFormatterParams) => {
            return setDecimalPlaces(Number(params.value), 2).toFixed(2);
          },
          renderEditCell: (params) => (
            <CustomUpdateTotalCell
              params={params}
              rows={rows}
              setRows={setRows}
            />
          ),
        },
        {
          field: 'employeeName',
          headerName: 'Empleado',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 250,
          flex: 2,
          editable: true,
          cellClassName: 'centered-grid',
          renderEditCell: (params) => (
            <AutocompleteEditEmployeeCell
              params={params}
              rows={rows}
              setRows={setRows}
            />
          ),
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
              providerId={providerId}
              isForeign={isForeign}
            />
          ),
        },
      ]
    : [
        {
          field: 'productCode',
          headerName: 'Código',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 150,
          flex: 1,
          cellClassName: 'centered-grid',
        },
        {
          field: 'providerProductCode',
          headerName: 'Código Proveedor',
          type: 'string',
          minWidth: 200,
          flex: 1,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: createMode || editMode,
        },
        {
          field: 'productName',
          headerName: 'Item',
          type: 'string',
          minWidth: 300,
          flex: 2,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: true,
          renderEditCell: (params) => {
            if (params.row.detailTypeId === TipoDetalleFacturaEnum.INVENTARIO) {
              return (
                <AutocompleteEditProductCell
                  params={params}
                  rows={rows}
                  setRows={setRows}
                  providerId={providerId}
                />
              );
            } else {
              return (
                <AutocompleteEditServiceCell
                  params={params}
                  rows={rows}
                  setRows={setRows}
                />
              );
            }
          },
        },
        {
          field: 'quantity',
          headerName: 'Cantidad',
          minWidth: 150,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          editable: true,
          flex: 1,
          renderCell: (params: GridRenderCellParams) =>
            setDecimalPlacesString(
              params.value as number,
              getDecimalPlaces(params.row.unitMeasureId)
            ),
          renderEditCell: (params) => (
            <CustomUpdateTotalCell
              params={params}
              rows={rows}
              setRows={setRows}
            />
          ),
        },
        {
          field: 'unitPrice',
          headerName: 'Precio Unitario',
          minWidth: 150,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          editable: true,
          flex: 1,
          valueFormatter: (params: GridValueFormatterParams) => {
            return setDecimalPlaces(Number(params.value), 6).toFixed(6);
          },
          renderEditCell: (params) => (
            <CustomUpdateTotalCell
              params={params}
              rows={rows}
              setRows={setRows}
            />
          ),
        },
        {
          field: 'discount',
          headerName: 'Descuento',
          minWidth: 150,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          editable: true,
          flex: 1,
          valueFormatter: (params: GridValueFormatterParams) => {
            return setDecimalPlaces(Number(params.value), 2).toFixed(2);
          },
          renderEditCell: (params) => (
            <CustomUpdateTotalCell
              params={params}
              rows={rows}
              setRows={setRows}
            />
          ),
        },
        {
          field: 'isTaxCredit',
          headerName: 'CT',
          align: 'center',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          minWidth: 50,
          sortable: false,
          editable: true,
          type: 'boolean',
          flex: 0.5,
        },
        {
          field: 'hasIva',
          headerName: 'IVA',
          align: 'center',
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          minWidth: 50,
          sortable: false,
          editable: true,
          type: 'boolean',
          flex: 0.5,
          renderEditCell: (params) => (
            <ImpuestoBooleanCell params={params} setRows={setRows} />
          ),
        },
        {
          field: 'taxRateId',
          headerName: 'Tarifa Impuesto',
          minWidth: 50,
          flex: 1,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          editable: true,
          renderEditCell: (params) => (
            <ImpuestoCell
              params={params}
              rows={rows}
              setRows={setRows}
              impuestos={impuestos}
            />
          ),
          renderCell: (params: GridRenderCellParams) => (
            <ImpuestoValue value={params.value as number} />
          ),
        },
        {
          field: 'totalPrice',
          headerName: 'Valor Total',
          minWidth: 150,
          flex: 1,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'right',
          type: 'number',
          editable: true,
          valueFormatter: (params: GridValueFormatterParams) =>
            setCurrencyNumber(params.value as number),
          renderEditCell: (params) => (
            <CustomUpdateTotalCell
              params={params}
              rows={rows}
              setRows={setRows}
            />
          ),
        },
        {
          field: 'retentions',
          headerName: 'Retencion',
          minWidth: 400,
          flex: 3,
          sortable: false,
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'left',
          editable: true,
          renderEditCell: (params) => (
            <RetencionMultipleCell
              params={params}
              rows={rows}
              setRows={setRows}
              retencionList={retencionList}
            />
          ),
          renderCell: (params: GridRenderCellParams) => (
            <RetentionValue value={params.value as RetencionType[]} />
          ),
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
          headerClassName: 'super-app-theme--header',
          headerAlign: 'center',
          align: 'center',
          minWidth: 250,
          flex: 2,
          editable: true,
          cellClassName: 'centered-grid',
          renderEditCell: (params) => (
            <AutocompleteEditEmployeeCell
              params={params}
              rows={rows}
              setRows={setRows}
            />
          ),
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
      ];

  if (
    createMode ||
    (editMode &&
      invoiceStatusId &&
      invoiceStatusId === EstadoDocumentoEnum.GENERADO)
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

        const isService =
          rows.find((row) => row.id === id)?.detailTypeId ===
          TipoDetalleFacturaEnum.SERVICIOS;

        if (isInEditMode && isService) {
          return [
            <Tooltip title="Duplicar Item">
              <GridActionsCellItem
                icon={<ContentCopy />}
                label="Duplicar"
                onClick={handleDuplicateRow(id)}
              />
            </Tooltip>,
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
        } else if (!isInEditMode && isService) {
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
        } else if (isInEditMode && !isService) {
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

  return columns;
};
