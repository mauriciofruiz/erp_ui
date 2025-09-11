import { getProductByStoreCode } from '@/backend';
import { FormState } from '@/hooks';
import { ServerResponseType } from '@/store';
import { ProductoByBodegaType, SucursalType } from '@/types';
import { Add, CloudUpload } from '@mui/icons-material';
import { Button, Input } from '@mui/material';
import {
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { useSnackbar } from 'notistack';
import { ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  createMode: boolean;
  editMode: boolean;
  sucursalUser: SucursalType;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  rows: GridRowsProp;
  setProductosByBodegaList: React.Dispatch<
    React.SetStateAction<ProductoByBodegaType[]>
  >;
  renderAlertMinMax: (product: ProductoByBodegaType) => void;
  formState: FormState;
}

export function EditToolbar(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    createMode,
    editMode,
    addButtonRef,
    rows,
    setProductosByBodegaList,
    renderAlertMinMax,
    formState,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        productCode: '',
        productName: '',
        availableQuantity: 0,
        quantity: 0,
        quantityApproved: 0,
        weight: 0,
        state: null,
      },
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' },
    }));
  };

  const fetchProductoByBodega = async (productFromExcel: any) => {
    try {
      const response: ServerResponseType | undefined =
        await getProductByStoreCode(
          formState.departureWarehouse,
          productFromExcel.productCode
        );
      if (response) {
        if (response.status === 200) {
          const producto: ProductoByBodegaType = response.message;
          return producto;
        } else {
          enqueueSnackbar(`No se pudo cargar el producto: ${response.status}`, {
            variant: 'error',
          });
          return undefined;
        }
      }
    } catch (error) {
      enqueueSnackbar('Existió un error de conexión', {
        variant: 'error',
      });
      return undefined;
    }
  };

  const fetchAllProductos = async (json: any[]) => {
    const promises = json.map((productFromExcel) =>
      fetchProductoByBodega(productFromExcel)
    );
    return Promise.all(promises);
  };

  const importExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        // parse data
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any = XLSX.utils.sheet_to_json(worksheet);

        const filteredJson = (json as any[]).reduce(
          (acc: any[], producto: any) => {
            const found = acc.find(
              (item) => item.productCode === producto.productCode
            );
            if (found) {
              found.quantity += producto.quantity;
            } else {
              acc.push({ ...producto });
            }
            return acc;
          },
          [] as any[]
        );

        if (
          formState.departureWarehouse !== null &&
          formState.departureWarehouse !== undefined
        ) {
          const productosList = await fetchAllProductos(filteredJson);

          filteredJson.forEach((productFromExcel: any) => {
            const producto = productosList.find(
              (item) =>
                item?.productCode === productFromExcel.productCode.toString()
            );

            const existingRow = rows.find(
              (row) =>
                row.productCode === productFromExcel.productCode.toString()
            );

            setProductosByBodegaList(productosList as ProductoByBodegaType[]);

            if (existingRow && producto) {
              if (producto.quantity > 0) {
                enqueueSnackbar(
                  `Se ha encontrado un producto con el mismo código: ${productFromExcel.productCode}`,
                  {
                    variant: 'info',
                  }
                );
                const updatedQuantity =
                  parseFloat(existingRow.quantity) +
                  (isNaN(productFromExcel.quantity)
                    ? 0
                    : parseFloat(productFromExcel.quantity));
                renderAlertMinMax({ ...producto, quantity: updatedQuantity });
                const updatedWeight =
                  existingRow.weight +
                  (producto ? producto?.weight * productFromExcel.quantity : 0);

                const updatedRows = rows.map((row) =>
                  row.productCode === productFromExcel.productCode.toString()
                    ? {
                        ...row,
                        quantity: updatedQuantity,
                        weight: updatedWeight,
                        quantityApproved: updatedQuantity,
                      }
                    : row
                );
                setRows((oldRows) => (oldRows !== null ? updatedRows : []));
              } else {
                enqueueSnackbar(
                  `No posee cantidad disponle el producto: ${productFromExcel.productCode}`,
                  {
                    variant: 'error',
                  }
                );
              }
            } else if (producto) {
              if (producto.quantity > 0) {
                const id = randomId();
                const quantityGet = isNaN(productFromExcel.quantity)
                  ? 0
                  : parseFloat(productFromExcel.quantity);

                renderAlertMinMax({ ...producto, quantity: quantityGet });
                setRows((oldRows) => [
                  ...oldRows,
                  {
                    id,
                    productCode: productFromExcel.productCode.toString(),
                    productName: producto?.productName,
                    availableQuantity: producto?.availableQuantity,
                    quantity: quantityGet,
                    quantityApproved: productFromExcel.quantity,
                    weight: producto ? producto?.weight * quantityGet : 0,
                    productObservation: '',
                    state: null,
                  },
                ]);
              } else {
                enqueueSnackbar(
                  `No posee cantidad disponle el producto: ${productFromExcel.productCode}`,
                  {
                    variant: 'error',
                  }
                );
              }
            } else {
              enqueueSnackbar(
                `No existe el producto con el código: ${productFromExcel.productCode}`,
                {
                  variant: 'error',
                }
              );
            }
          });
          enqueueSnackbar('Archivo Cargado Correctamente', {
            variant: 'success',
          });
        } else {
          enqueueSnackbar('Seleccionar una bodega de salida', {
            variant: 'warning',
          });
        }
      };
      reader.readAsBinaryString(file);
    } else {
      enqueueSnackbar('No se pudo cargar el archivo', { variant: 'error' });
    }
  };
  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      {createMode && (
        <label htmlFor="file-upload">
          <Input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            disabled={!createMode && !editMode}
            onChange={importExcel}
          />
          <Button
            variant="contained"
            color="primary"
            component="span"
            startIcon={<CloudUpload />}
            disabled={!createMode && !editMode}
            fullWidth
            sx={{ mb: 2, mt: 1 }}
          >
            Subir Archivo
          </Button>
        </label>
      )}
      <Button
        id="addButonProduct"
        ref={addButtonRef}
        color="primary"
        startIcon={<Add />}
        onClick={handleClick}
        disabled={!createMode && !editMode}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1 }}
      >
        Agregar Producto
      </Button>
    </GridToolbarContainer>
  );
}
