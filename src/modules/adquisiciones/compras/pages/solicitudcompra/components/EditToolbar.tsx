import { useProductoAsync } from '@/hooks';
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
}

export function EditToolbar(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    createMode,
    editMode,
    sucursalUser,
    addButtonRef,
    rows,
    setProductosByBodegaList,
    renderAlertMinMax,
  } = props;

  const { enqueueSnackbar } = useSnackbar();
  const { fetchBySucursalIdAndCode } = useProductoAsync();

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
        productObservation: '',
        state: null,
      },
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' },
    }));
  };

  const fetchProductoByBodega = async (
    productFromExcel: any
  ): Promise<ProductoByBodegaType | null> => {
    try {
      const response = await fetchBySucursalIdAndCode(
        sucursalUser.branchId,
        productFromExcel.productCode
      );
      return response ? response : null;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  };

  const fetchAllProductos = async (
    json: any[]
  ): Promise<ProductoByBodegaType[]> => {
    const promises = json.map(fetchProductoByBodega);
    const results = await Promise.all(promises);
    return results.filter(
      (result): result is ProductoByBodegaType => result !== null
    );
  };

  const importExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      enqueueSnackbar('No se pudo cargar el archivo', { variant: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const filteredJson = json.reduce((acc: any[], producto: any) => {
          const found = acc.find(
            (item) => item.productCode === producto.productCode
          );
          if (found) {
            found.quantity += producto.quantity;
          } else {
            acc.push({ ...producto });
          }
          return acc;
        }, []);

        const productosList = await fetchAllProductos(filteredJson);
        setProductosByBodegaList(productosList as ProductoByBodegaType[]);

        filteredJson.forEach((productFromExcel: any) => {
          const producto = productosList.find(
            (item) =>
              item?.productCode === productFromExcel.productCode.toString()
          );

          const existingRow = rows.find(
            (row) => row.productCode === productFromExcel.productCode.toString()
          );

          if (existingRow && producto) {
            enqueueSnackbar(
              `Se ha encontrado un producto con el mismo código: ${productFromExcel.productCode}`,
              { variant: 'info' }
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

            setRows(() => updatedRows);
          } else if (producto) {
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
              `No existe el producto con el código: ${productFromExcel.productCode}`,
              { variant: 'error' }
            );
          }
        });
        enqueueSnackbar('Archivo Cargado Correctamente', {
          variant: 'success',
        });
      } catch (error) {
        console.error('Error reading file:', error);
        enqueueSnackbar('Error al procesar el archivo', { variant: 'error' });
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      {createMode ? (
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
      ) : null}
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
