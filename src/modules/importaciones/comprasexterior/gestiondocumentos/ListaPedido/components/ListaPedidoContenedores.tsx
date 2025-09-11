import { getProductosByProveedor } from '@/backend';
import { FormState } from '@/hooks';
import { generarNumerosAleatoriosUnicos } from '@/hooks/useUniqueNumbers';
import { ProveedorProductoType } from '@/types';
import { DetailPurchaseOrderListGet } from '@/types/importaciones/listaPedido.type';
import { Add, CloudUpload } from '@mui/icons-material';
import { Box, Button, Grid, Input, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { Productos } from './ListaPedidoCustomCell';
import Row, { createData } from './ListaPedidoDetalle';


interface ColumnsProps {
    formState: FormState
    createMode: boolean
    setCreateMode: React.Dispatch<React.SetStateAction<boolean>>
    isEditable: boolean
    setIsEditable: React.Dispatch<React.SetStateAction<boolean>>
    editMode: boolean
    validateAnulado: boolean
    isApprovable: boolean
    purchaseOrderPrueba: PurchaseOrder
    setPurchaseOrderPrueba: React.Dispatch<React.SetStateAction<PurchaseOrder>>
    detailList: DetailPurchaseOrderListGet[],
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
    //setValidarFilas: React.Dispatch<React.SetStateAction<boolean>>
    rowsTemp: PurchaseOrder
    setRowsTemp: React.Dispatch<React.SetStateAction<PurchaseOrder>>
    rowsFinalTemp: PurchaseOrder
    setRowsFinalTemp: React.Dispatch<React.SetStateAction<PurchaseOrder>>
    // rowsNewProduct: RowModelProduct[]
    // setRowsNewProduct: React.Dispatch<React.SetStateAction<RowModelProduct[]>>
}

interface RowModel {
    id: number;
    detalleContenedor: never[];
}

interface RowModelExcel {
    id: number,
    container: number,
    productCode: ProductoUpdate,
    quantity: QuantityUpdate,
    observacion: ObservacionUpdate
}

interface ProductoUpdate {
    [key: number]: ProveedorProductoType
}

interface QuantityUpdate {
    [key: number]: number;
}

interface ObservacionUpdate {
    [key: number]: string;
}

interface DetailPurchaseOrderList {
    productId: number;
    quantity: number;
    unitsPerPallet: number | null;
    observation: string;
    quantityOC: number | null;
    containerNumber: number;
    cancelled: boolean;
    orderListId: number;
    detailOrderId: number;
}

interface PurchaseOrder {
    detailPurchaseOrderList: DetailPurchaseOrderList[];
}

export default function CollapsibleTable(props: ColumnsProps) {
    const {
        formState,
        createMode,
        editMode,
        purchaseOrderPrueba,
        setPurchaseOrderPrueba,
        detailList,
        setFormState,
        //setValidarFilas,
        rowsTemp,
        setRowsTemp,
        rowsFinalTemp,
        setRowsFinalTemp
        // rowsNewProduct,
        // setRowsNewProduct
    } = props;
    const [rowsNew, setRowsNew] = useState<RowModel[]>([]);
    const [count, setCount] = useState(0);
    const [listaProductos, setListaProductos] = useState<ProveedorProductoType[]>([]);
    const [productos, setProductos] = useState<ProveedorProductoType[]>([]);
    const [inicializar] = useState<PurchaseOrder>({ detailPurchaseOrderList: [] });
    const [rowsExcelProduct, setRowsExcelProduct] = useState<RowModelExcel[]>([]);


    const handleClick = () => {
        const id = count + 1;
        setCount(id);
        setRowsNew((oldRows: any) => [
            ...oldRows,
            {
                id,
                detalleContenedor: []
            },
        ]);
    };

    const handleChildMultipleProd = (values: ProveedorProductoType[]) => {
        setProductos(values);
    };

    const importExcel = async (event: ChangeEvent<HTMLInputElement>) => {
        if (listaProductos.length === 0) {
            enqueueSnackbar(
                `Primero debe seleccionar un proveedor, para que se carguen los productos`,
                {
                    variant: 'info',
                }
            );
        } else {
            const file = event.target.files?.[0];
            const excelRows: RowModelExcel[] = [];
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
                                    && item.numeroContenedor === producto.numeroContenedor
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
                    filteredJson.forEach((productFromExcel: any) => {
                        const producto = listaProductos.find(
                            (item) =>
                                item?.productCode === productFromExcel.productCode.toString()
                        );

                        const existingRow = rowsExcelProduct.find(
                            (row) => row.productCode === productFromExcel.productCode.toString()
                        );
                        if (existingRow && producto) {
                            enqueueSnackbar(
                                `Se ha encontrado un producto con el mismo código: ${productFromExcel.productCode}`,
                                {
                                    variant: 'info',
                                }
                            );
                            const updatedQuantity = existingRow.quantity
                            //renderAlertMinMax({ ...producto, quantity: updatedQuantity });
                            const updatedRows = rowsExcelProduct.map((row) =>
                                row.productCode === productFromExcel.productCode.toString()
                                    ? {
                                        ...row,
                                        quantity: updatedQuantity,
                                    }
                                    : row
                            );
                            setRowsExcelProduct((oldRows) => (oldRows !== null ? updatedRows : []));
                        } else if (producto) {
                            const numerosUnicos = generarNumerosAleatoriosUnicos(1, 100, 10);
                            const id = numerosUnicos[0]
                            const quantityGet = isNaN(productFromExcel.quantity)
                                ? 0
                                : parseFloat(productFromExcel.quantity);
                            const containerGet = isNaN(productFromExcel.numeroContenedor)
                                ? 0
                                : parseFloat(productFromExcel.numeroContenedor);

                            excelRows.push({
                                id,
                                container: containerGet,
                                productCode: {
                                    [id]: producto
                                },
                                quantity: {
                                    [id]: quantityGet
                                },
                                observacion: {
                                    [id]: ''
                                },
                            });
                            setRowsExcelProduct(excelRows);
                        } else {
                            enqueueSnackbar(
                                `No existe el producto con el código: ${productFromExcel.productCode}`,
                                {
                                    variant: 'error',
                                }
                            );
                        }
                    });
                };
                enqueueSnackbar('Archivo Cargado Correctamente', {
                    variant: 'success',
                });
                reader.readAsBinaryString(file);
            } else {
                enqueueSnackbar('No se pudo cargar el archivo', { variant: 'error' });
            }
        }
    };

    useEffect(() => {
        if (rowsExcelProduct.length > 0) {
            const numeroContenedores = rowsExcelProduct
                ? rowsExcelProduct?.reduce((max, item) => {
                    return item.container > max ? item.container : max;
                }, rowsExcelProduct[0].container) : 0
            if (numeroContenedores > 0) {
                setFormState({
                    ...formState,
                    numeroContenedores: numeroContenedores
                })
            }
        }
    }, [rowsExcelProduct])

    useEffect(() => {
        if (formState.numeroContenedores && formState.numeroContenedores > 0) {
            setCount(0);
            const newRows = [];
            for (let i = 0; i < formState.numeroContenedores; i++) {
                newRows.push({ id: i + 1, detalleContenedor: [] });
            }
            setRowsNew(newRows)
            if (rowsNew.length > 0) {
                for (let i = 0; i < rowsNew.length; i++) {
                    createData(rowsNew[i].id);
                }
            }
            setCount(parseInt(formState.numeroContenedores, 10));
        } else {
            setCount(0);
            setRowsNew([]);
            setProductos([])
            setPurchaseOrderPrueba(inicializar)
            setRowsTemp(inicializar)
        }
    }, [formState.numeroContenedores])

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await getProductosByProveedor('', formState.providerId);
                if (response) {
                    setListaProductos(response);
                }
            } catch (error) {
                enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
            }
        }
        if (formState.providerId) {
            fetchProductos();
        }
    }, [formState.providerId])

    return (
        <>
            <Grid
                container
                direction="row"
                justifyContent="right"
                alignItems="right"
                sx={{ mt: 2 }}
            >
                {createMode ? (
                    <label htmlFor="file-upload"  >
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
                    //ref={addButtonRef}
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleClick}
                    disabled={!createMode && !editMode}
                    sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1 }}
                >
                    Agregar Contenedor
                </Button>
            </Grid>
            <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <Productos
                        listaProductos={listaProductos}
                        onValueChange={handleChildMultipleProd}
                        createMode={createMode}
                        editMode={editMode}
                        formState={formState}
                        detailList={detailList}
                    />
                    <TableContainer component={Paper}>
                        <Table aria-label="collapsible table">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Nro Contenedor</TableCell>
                                    <TableCell align="right">Añadir Producto&nbsp;</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rowsNew.map((row) => (
                                    <Row
                                        key={row.id}
                                        row={row}
                                        listaProductos={listaProductos}
                                        productos={productos}
                                        purchaseOrderPrueba={purchaseOrderPrueba}
                                        setPurchaseOrderPrueba={setPurchaseOrderPrueba}
                                        detailList={detailList}
                                        createMode={createMode}
                                        editMode={editMode}
                                        rowsExcelProduct={rowsExcelProduct}
                                        //setValidarFilas={setValidarFilas}
                                        formState={formState}
                                        rowsTemp = {rowsTemp}
                                        setRowsTemp = {setRowsTemp}
                                        rowsFinalTemp = {rowsFinalTemp}
                                        setRowsFinalTemp = {setRowsFinalTemp}
                                        // rowsNewProduct = {rowsNewProduct}
                                        // setRowsNewProduct = {setRowsNewProduct}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </>
    );
}