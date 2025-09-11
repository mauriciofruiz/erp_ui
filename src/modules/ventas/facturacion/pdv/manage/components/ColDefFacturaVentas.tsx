import { EstadoDocumentoEnum } from '@/enums';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridValidRowModel,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { Dispatch, SetStateAction } from 'react';
import {
  getDecimalPlaces,
  setCurrencyNumber,
  setDecimalPlaces,
  setDecimalPlacesString,
  setPercentageNumber,
} from '@/functions';
import { TaxRateInterface } from '@/types';
import { Delete } from '@mui/icons-material';
import {
  AutocompleteEditProductCell,
  InputQuantityFunction,
} from './CustomCells';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ColumnsProps {
  createMode: boolean;
  editMode: boolean;
  rows: readonly GridValidRowModel[];
  setRows: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  sucursalId: number;
  invoiceStatusId: number;
}

export const ColDefFacturaVentas = (props: ColumnsProps): GridColDef[] => {
  const { createMode, editMode, rows, setRows, sucursalId, invoiceStatusId } =
    props;

  const { sucursales, impuestos } = useSelector(
    (state: RootState) => state.common
  );

  //const { enqueueSnackbar } = useSnackbar();
  /**
   * Renders the RetentionValue component.
   *
   * @param value - An array of RetencionType objects.
   * @returns The rendered RetentionValue component.
   */
  // const RetentionValue = ({ value }: { value: RetencionType[] }) => (
  //   <div>
  //     {value.map((retencion, index) => (
  //       <div key={index}>* {retencion.retentionDetail}</div>
  //     ))}
  //   </div>
  // );

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
  // const handleEditClick = (id: GridRowId) => () => {
  //   setCellModesModel({ ...cellModesModel, [id]: { mode: GridRowModes.Edit } });
  // };

  // Función de utilidad para actualizar las filas
  // const actualizarFilasBasadoEnCondicion = (
  //   id: GridRowId,
  //   rows: readonly GridValidRowModel[],
  //   setRows: (rows: readonly GridValidRowModel[]) => void,
  //   cellModesModel: any,
  //   setCellModesModel: (model: any) => void,
  //   enqueueSnackbar: (message: string, options: any) => void,
  //   esCancelacion: boolean
  // ) => {
  //   const currentRow = rows.find((row) => row.id === id);
  //   if (!currentRow) return;

  //   const emptyRow = currentRow.productCode === '' || currentRow.quantity <= 0;
  //   const repeatedCodeRow = rows.find(
  //     (row) => row.productCode === currentRow.productCode && row.id !== id
  //   );

  //   if (emptyRow) {
  //     enqueueSnackbar(`No se puede guardar un registro sin un ítem`, {
  //       variant: 'warning',
  //     });
  //     setRows(rows.filter((row) => row.id !== id));
  //   } else if (repeatedCodeRow) {
  //     const mergedRow = {
  //       ...repeatedCodeRow,
  //       quantity: repeatedCodeRow.quantity + currentRow.quantity,
  //     };
  //     setRows([
  //       ...rows.filter((row) => row.id !== id && row.id !== repeatedCodeRow.id),
  //       mergedRow,
  //     ]);
  //   } else {
  //     if (esCancelacion) {
  //       setCellModesModel({
  //         ...cellModesModel,
  //         [id]: { mode: GridRowModes.View, ignoreModifications: true },
  //       });

  //       const editedRow = rows.find((row) => row.id === id);
  //       if (editedRow!.isNew) {
  //         setRows(rows.filter((row) => row.id !== id));
  //       }
  //     } else {
  //       setCellModesModel({
  //         ...cellModesModel,
  //         [id]: { mode: GridRowModes.View },
  //       });
  //     }
  //   }
  // };

  // Modificado handleSaveClick usando la función de utilidad
  // const handleSaveClick = (id: GridRowId) => () => {
  //   actualizarFilasBasadoEnCondicion(
  //     id,
  //     rows,
  //     setRows,
  //     cellModesModel,
  //     setCellModesModel,
  //     enqueueSnackbar,
  //     false
  //   );
  // };

  // // Modificado handleCancelClick usando la función de utilidad
  // const handleCancelClick = (id: GridRowId) => () => {
  //   actualizarFilasBasadoEnCondicion(
  //     id,
  //     rows,
  //     setRows,
  //     cellModesModel,
  //     setCellModesModel,
  //     enqueueSnackbar,
  //     true
  //   );
  // };

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

  const columns: GridColDef[] = [
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
        return (
          <AutocompleteEditProductCell
            params={params}
            sucursalId={sucursalId}
          />
        );
      },
    },
    {
      field: 'availableQuantity',
      headerName: 'Cantidad Disponible',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      renderCell: (params) =>
        setDecimalPlacesString(
          params.value,
          getDecimalPlaces(params.row.unitMeasureId)
        ),
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
      renderCell: (params) =>
        setDecimalPlacesString(
          params.value,
          getDecimalPlaces(params.row.unitMeasureId)
        ),
      renderEditCell: (params) => {
        return <InputQuantityFunction params={params} />;
      },
    },
    {
      field: 'unitPrice',
      headerName: 'Precio Unitario',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => {
        return setDecimalPlaces(Number(params.value), 6).toFixed(6);
      },
    },
    {
      field: 'discountPercentage',
      headerName: '% Descuento',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => {
        return setPercentageNumber(Number(params.value), 2);
      },
    },
    {
      field: 'discountValue',
      headerName: 'Descuento',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => {
        return setCurrencyNumber(Number(params.value));
      },
    },
    {
      field: 'clientPrice',
      headerName: 'Precio Cliente',
      minWidth: 150,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      valueFormatter: (params: GridValueFormatterParams) => {
        return setDecimalPlaces(Number(params.value), 6).toFixed(6);
      },
    },
    {
      field: 'hasIva',
      headerName: 'IVA',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      minWidth: 50,
      sortable: false,
      type: 'boolean',
      flex: 0.5,
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
      valueFormatter: (params: GridValueFormatterParams) => {
        return setCurrencyNumber(Number(params.value));
      },
    },
    // {
    //   field: 'retentions',
    //   headerName: 'Retencion',
    //   minWidth: 400,
    //   flex: 3,
    //   sortable: false,
    //   headerClassName: 'super-app-theme--header',
    //   headerAlign: 'center',
    //   align: 'left',
    //   editable: !hasCredit,
    //   renderEditCell: (params) => (
    //     <RetencionMultipleCell
    //       params={params}
    //       rows={rows}
    //       setRows={setRows}
    //       retencionList={retencionList}
    //       styles={styles}
    //     />
    //   ),
    //   renderCell: (params: GridRenderCellParams) => (
    //     <RetentionValue value={params.value as RetencionType[]} />
    //   ),
    // },
    {
      field: 'branchId',
      headerName: 'Sucursal',
      minWidth: 100,
      flex: 1,
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
        //const isInEditMode = cellModesModel[id]?.mode === GridRowModes.Edit;

        // if (isInEditMode) {
        //   return [
        //     <Tooltip title="Guardar">
        //       <GridActionsCellItem
        //         icon={<Save />}
        //         label="Guardar"
        //         onClick={handleSaveClick(id)}
        //       />
        //     </Tooltip>,
        //     <Tooltip title="No Guardar">
        //       <GridActionsCellItem
        //         icon={<Cancel />}
        //         label="Cancelar"
        //         className="textPrimary"
        //         onClick={handleCancelClick(id)}
        //         color="inherit"
        //       />
        //     </Tooltip>,
        //   ];
        // }

        const rowHasIdDetail = rows.find(
          (row) => row.id === id
        )?.invoiceDetailId;

        if (!rowHasIdDetail) {
          return [
            <GridActionsCellItem
              icon={<Delete />}
              label="Borrar"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />,
          ];
        }

        return [];
      },
    });
  }

  return columns;
};
