import { FormState, useStyles } from "@/hooks";
import { generarNumerosAleatoriosUnicos } from "@/hooks/useUniqueNumbers";
import { ProveedorProductoType } from "@/types"
import { DetailPurchaseOrderListGet } from "@/types/importaciones/listaPedido.type"
import { Delete, Save } from "@mui/icons-material";
import { Autocomplete, Box, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface RowModelProduct {
    id: number,
    container?: number,
    productCode: ProductoUpdate,
    quantity: QuantityUpdate,
    observacion: ObservacionUpdate
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

export function createData(
    id: number,
) {
    return {
        id,
        detalleContenedor: [],
    };
}

export default function Row(props:
    {
        row: ReturnType<typeof createData>,
        listaProductos: ProveedorProductoType[],
        productos: ProveedorProductoType[],
        purchaseOrderPrueba: PurchaseOrder
        setPurchaseOrderPrueba: React.Dispatch<React.SetStateAction<PurchaseOrder>>
        detailList: DetailPurchaseOrderListGet[]
        createMode: boolean
        editMode: boolean
        rowsExcelProduct: RowModelExcel[]
        formState: FormState
        rowsTemp: PurchaseOrder
        setRowsTemp: React.Dispatch<React.SetStateAction<PurchaseOrder>>
        rowsFinalTemp: PurchaseOrder
        setRowsFinalTemp: React.Dispatch<React.SetStateAction<PurchaseOrder>>
    }) {
    const {
        row,
        listaProductos,
        productos,
        purchaseOrderPrueba,
        setPurchaseOrderPrueba,
        detailList,
        createMode,
        editMode,
        rowsExcelProduct,
        formState,
        rowsTemp,
        setRowsTemp,
        rowsFinalTemp,
        setRowsFinalTemp,
    } = props;

    const styles = useStyles();
    const [open, setOpen] = useState(false);
    const [rowsNewProduct, setRowsNewProduct] = useState<RowModelProduct[]>([]);
    const [updateProduct, setUpdateProduct] = useState<ProveedorProductoType[]>([]);
    const [editingRows, setEditingRows] = useState<number[]>([]);

    const handleAddProduct = () => {
        const numerosUnicos = generarNumerosAleatoriosUnicos(1, 100, 100);
        const id = numerosUnicos[1]
        setRowsNewProduct((oldRows: any) => [
            ...oldRows,
            {
                id,
                container: row.id,
                productCode: '',
                quantity: {
                    [id]: 0
                },
                observacion: {
                    [id]: ''
                },
            }
        ]);
    };

    const startEditing = (rowId: number, product: RowModelProduct) => {
        handleCancel(rowId);
        setPurchaseOrderPrueba((prevState: any) => {
            const index = prevState?.detailPurchaseOrderList?.findIndex((item: any) => item.productId === product.productCode[product.id].productId && item.containerNumber === row.id);
            if (index !== -1) {
                return {
                    ...prevState,
                    detailPurchaseOrderList: prevState?.detailPurchaseOrderList?.map((item: any, idx: number) => {
                        if (idx === index) {
                            return {
                                ...item,
                                productId: product.productCode[product.id].productId,
                                quantity: 0,
                                unitsPerPallet: '',
                                observation: product.observacion[product.id],
                                quantityOC: '',
                                containerNumber: row.id,
                                cancelled: false,
                                orderListId: detailList.length > 0 ? detailList[0]?.orderListId : ''
                            };
                        }
                        return item;
                    })
                };
            }
        });
        handleDeleteTemp(product);
    };

    const saveLista = (id: number, product: RowModelProduct) => {
        if (product.quantity[product.id] === 0 || product.quantity[product.id] === null) {
            enqueueSnackbar(
                `La cantidad no puede ser 0 o vacía`,
                {
                    variant: 'error',
                }
            );
        } else {
            handleDeleteTemp(product);
            setEditingRows(
                [
                    ...editingRows,
                    id
                ]
            );
            setPurchaseOrderPrueba((prevState: any) => {
                const index = prevState?.detailPurchaseOrderList?.findIndex((item: any) => item.productId === product.productCode[product.id].productId && item.containerNumber === row.id);

                if (index !== -1) {
                    return {
                        ...prevState,
                        detailPurchaseOrderList: prevState?.detailPurchaseOrderList?.map((item: any, idx: number) => {
                            if (idx === index) {
                                // Actualizar el elemento existente con los nuevos valores
                                return {
                                    ...item,
                                    productId: product.productCode[product.id].productId,
                                    quantity: product.quantity[product.id],
                                    unitsPerPallet: '',
                                    observation: product.observacion[product.id],
                                    quantityOC: '',
                                    containerNumber: row.id,
                                    cancelled: false,
                                    orderListId: detailList.length > 0 ? detailList[0]?.orderListId : ''
                                };
                            }
                            return item;
                        })
                    };
                } else {
                    // Si el elemento no existe, agregar uno nuevo
                    return {
                        ...prevState,
                        detailPurchaseOrderList: [
                            ...prevState?.detailPurchaseOrderList,
                            {
                                productId: product.productCode[product.id].productId,
                                quantity: product.quantity[product.id],
                                unitsPerPallet: '',
                                observation: product.observacion[product.id],
                                quantityOC: '',
                                containerNumber: row.id,
                                cancelled: false,
                                orderListId: detailList.length > 0 ? detailList[0]?.orderListId : ''
                            }
                        ]
                    };
                }
            });
        }
    };

    const handleCancel = (id: number) => {
        setEditingRows(editingRows.filter(row => row !== id)) // Restaurar los valores originales
    };

    const handleDeleteClick = (id: number, product: RowModelProduct) => {
        setRowsNewProduct(rowsNewProduct.filter(row => row.id !== id));
        if (purchaseOrderPrueba?.detailPurchaseOrderList?.length > 0) {
            const productoDelete = purchaseOrderPrueba.detailPurchaseOrderList.find(item => item.productId === product.productCode[product.id].productId && item.containerNumber === row.id)
            if (productoDelete && productoDelete.containerNumber === row.id) {
                setPurchaseOrderPrueba((prevState: any) => {
                    const index = prevState?.detailPurchaseOrderList?.findIndex((item: any) => item.productId === product.productCode[product.id].productId && item.containerNumber === row.id);
                    if (index !== -1) {
                        const updatedList = [...prevState?.detailPurchaseOrderList];
                        updatedList.splice(index, 1);
                        return {
                            ...prevState,
                            detailPurchaseOrderList: updatedList,
                        };
                    }
                });
            }
        }
        handleDeleteTemp(product)
    };

    const handleDeleteTemp = (product: RowModelProduct) => {
        if (rowsTemp?.detailPurchaseOrderList?.length > 0) {
            const productoDelete = rowsTemp.detailPurchaseOrderList.find(item => item.productId === product.productCode[product.id].productId && item.containerNumber === row.id)
            if (productoDelete && productoDelete.containerNumber === row.id) {
                setRowsTemp((prevState: any) => {
                    const index = prevState?.detailPurchaseOrderList?.findIndex((item: any) => item.productId === product.productCode[product.id].productId && item.containerNumber === row.id);
                    if (index !== -1) {
                        const updatedList = [...prevState?.detailPurchaseOrderList];
                        updatedList.splice(index, 1);
                        return {
                            ...prevState,
                            detailPurchaseOrderList: updatedList,
                        };
                    }
                });
            }
        } else if (rowsFinalTemp?.detailPurchaseOrderList?.length > 0) {
            const productoDelete = rowsFinalTemp.detailPurchaseOrderList.find(item => item.productId === product.productCode[product.id].productId && item.containerNumber === row.id)
            if (productoDelete && productoDelete.containerNumber === row.id) {
                setRowsFinalTemp((prevState: any) => {
                    const index = prevState?.detailPurchaseOrderList?.findIndex((item: any) => item.productId === product.productCode[product.id].productId && item.containerNumber === row.id);
                    if (index !== -1) {
                        const updatedList = [...prevState?.detailPurchaseOrderList];
                        updatedList.splice(index, 1);
                        return {
                            ...prevState,
                            detailPurchaseOrderList: updatedList,
                        };
                    }
                });
            }
        }
    }

    const handleAutocompleteChange = (value: ProveedorProductoType, rowIndex: number) => {
        if (purchaseOrderPrueba.detailPurchaseOrderList.find(elemento => elemento.productId === value.productId && elemento.containerNumber === row.id)) {
            setRowsNewProduct(rowsNewProduct.filter(row => row.id !== rowIndex));
            enqueueSnackbar(
                `El código de producto ya existe`,
                {
                    variant: 'error',
                }
            );
        }
        else {
            const prodNewProduct = rowsNewProduct.map((elemento) => {
                return elemento.productCode[elemento.id];
            })
            if (prodNewProduct.find(item => item?.productId === value.productId)) {
                setRowsNewProduct(rowsNewProduct.filter(row => row.id !== rowIndex));
                enqueueSnackbar(
                    `El código de producto ya existe`,
                    {
                        variant: 'error',
                    }
                );
            } else {
                setRowsNewProduct(prevValores => {
                    const nuevosValores = [...prevValores];
                    for (let i = 0; i < nuevosValores.length; i++) {
                        if (nuevosValores[i]['id'] === rowIndex) {
                            nuevosValores[i].productCode = { [rowIndex]: value };
                            nuevosValores[i].quantity = { [rowIndex]: 1 };
                            break;
                        }
                    }
                    return nuevosValores;
                });
                setRowsTemp((prevState: any) => {
                    const updatedList = [...prevState?.detailPurchaseOrderList];
                    let found = false;
                    // Buscar si ya existe un elemento con el mismo productId
                    for (let i = 0; i < updatedList.length; i++) {
                        if (updatedList[i].id === rowIndex) {
                            updatedList[i] = {
                                ...updatedList[i],
                                containerNumber: row.id,
                                // Actualiza otros campos según sea necesario
                            };
                            found = true;
                            break;
                        }
                    }
                    // Si no se encontró un elemento existente, agregar uno nuevo
                    if (!found) {
                        updatedList.push({
                            id: rowIndex,
                            productId: value.productId,
                            quantity: 0,
                            unitsPerPallet: '',
                            observation: '',
                            quantityOC: '',
                            containerNumber: row.id,
                            cancelled: false,
                            orderListId: ''
                        });
                    }
                    return {
                        ...prevState,
                        detailPurchaseOrderList: updatedList
                    };
                });
            }
        }
    };

    const getQuantity = (event: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
        const value = event?.target.value
        const numeros = /^[0-9\s]*$/;
        if (numeros.test(value) && value != '') {
            setRowsNewProduct(prevValores => {
                const nuevosValores = [...prevValores];
                for (let i = 0; i < nuevosValores.length; i++) {
                    if (nuevosValores[i]['id'] === rowIndex) {
                        nuevosValores[i].quantity = { [rowIndex]: parseInt(value, 10) };
                        break;
                    }
                }
                return nuevosValores;
            });
        }
    };

    const getObservacion = (event: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
        const value = event?.target.value
        setRowsNewProduct(prevValores => {
            const nuevosValores = [...prevValores];
            for (let i = 0; i < nuevosValores.length; i++) {
                if (nuevosValores[i]['id'] === rowIndex) {
                    nuevosValores[i].observacion = { [rowIndex]: value };
                    break;
                }
            }
            return nuevosValores;
        });
    };


    useEffect(() => {
        const colocarProductos = () => {
            const nuevosRows: RowModelProduct[] = [];
            const editRows: number[] = [];
            const nuevosUpdateProducts: ProveedorProductoType[] = [];
            for (let i = 0; i < productos.length; i++) {

                const numerosUnicos = generarNumerosAleatoriosUnicos(1, 100, 100);
                const id = numerosUnicos[i]

                const prodNewProduct = rowsNewProduct.map((elemento) => {
                    return elemento?.productCode[elemento.id];
                })
                const rowExists = prodNewProduct.some((existingRow) => {
                    return existingRow?.productId === productos[i].productId;
                });
                if (!rowExists) {
                    editRows.push(id)
                    const newRow = {
                        id,
                        productCode: {
                            [id]: productos[i],
                        },
                        quantity: {
                            [id]: 1,
                        },
                        observacion: {
                            [id]: '',
                        },
                    };
                    nuevosRows.push(newRow)
                    nuevosUpdateProducts.push(productos[i])
                }
            }
            setRowsNewProduct((prevRows) => [...prevRows, ...nuevosRows]);
            setUpdateProduct((prevRows) => [...prevRows, ...nuevosUpdateProducts]);
        }
        const colocarProductosinDetails = () => {
            const detailRows: DetailPurchaseOrderList[] = [];
            const detailRowsTemp: DetailPurchaseOrderList[] = [];
            if (purchaseOrderPrueba.detailPurchaseOrderList.length > 0) {
                for (let i = 0; i < purchaseOrderPrueba.detailPurchaseOrderList.length; i++) {
                    detailRows.push({
                        productId: purchaseOrderPrueba.detailPurchaseOrderList[i].productId,
                        quantity: purchaseOrderPrueba.detailPurchaseOrderList[i].quantity,
                        unitsPerPallet: purchaseOrderPrueba.detailPurchaseOrderList[i].unitsPerPallet,
                        observation: purchaseOrderPrueba.detailPurchaseOrderList[i].observation,
                        quantityOC: purchaseOrderPrueba.detailPurchaseOrderList[i].quantityOC,
                        containerNumber: purchaseOrderPrueba.detailPurchaseOrderList[i].containerNumber,
                        cancelled: purchaseOrderPrueba.detailPurchaseOrderList[i].cancelled,
                        orderListId: purchaseOrderPrueba.detailPurchaseOrderList[i].orderListId,
                        detailOrderId: purchaseOrderPrueba.detailPurchaseOrderList[i].detailOrderId
                    })
                }
                const productsNotFind = productos.filter(producto => !purchaseOrderPrueba.detailPurchaseOrderList.some(item => item.productId === producto.productId));
                if (productsNotFind) {
                    for (let i = 0; i < productsNotFind.length; i++) {
                        for (let j = 0; j < formState.numeroContenedores; j++) {
                            detailRowsTemp.push({
                                productId: productsNotFind[i].productId,
                                quantity: 0,
                                unitsPerPallet: 0,
                                observation: '',
                                quantityOC: 0,
                                containerNumber: j + 1,
                                cancelled: false,
                                orderListId: 0,
                                detailOrderId: 0
                            })
                        }
                    }
                    setRowsFinalTemp({
                        detailPurchaseOrderList: detailRowsTemp
                    });
                }
            } else {
                for (let i = 0; i < productos.length; i++) {
                    for (let j = 0; j < formState.numeroContenedores; j++) {
                        detailRows.push({
                            productId: productos[i].productId,
                            quantity: 0,
                            unitsPerPallet: 0,
                            observation: '',
                            quantityOC: 0,
                            containerNumber: j + 1,
                            cancelled: false,
                            orderListId: 0,
                            detailOrderId: 0
                        })
                    }
                }
                setRowsTemp({
                    detailPurchaseOrderList: detailRows
                });
            }
        }
        if (productos.length > 0) {
            colocarProductos();
            colocarProductosinDetails();
        }
        else {
            if (detailList.length === 0) {
                const newRows: RowModelProduct[] = [];
                setRowsNewProduct(newRows);
            }
        }
    }, [productos])

    useEffect(() => {
        const conjunto: RowModelProduct[] = [];
        if (rowsNewProduct.length > 0) {
            for (const fila of rowsNewProduct) {
                const id = fila.id
                const newRow = {
                    id,
                    container: fila.container,
                    productCode: {
                        [id]: fila.productCode[fila.id],
                    },
                    quantity: {
                        [id]: fila.quantity[fila.id],
                    },
                    observacion: {
                        [id]: fila.observacion[fila.id],
                    },
                };
                if (conjunto.find(item => item?.productCode[item.id]?.productId === newRow?.productCode[newRow.id]?.productId)) {
                    const encontrado = conjunto.find(item => item?.productCode[item.id]?.productId === newRow?.productCode[newRow.id]?.productId)
                    setRowsNewProduct(rowsNewProduct.filter(row => row.id !== encontrado?.id));
                } else {
                    conjunto.push(newRow)
                    //setRowsNewProductTemp(conjunto);
                }
            }
        }
    }, [rowsNewProduct])

    useEffect(() => {
        if (updateProduct.length > 0) {
            if (productos.length !== updateProduct.length) {
                for (let i = 0; i < updateProduct.length; i++) {
                    const productoUpdate = updateProduct[i];
                    const existeEnProductos = productos.some(producto => producto.productId === productoUpdate.productId);
                    if (!existeEnProductos) {
                        setRowsNewProduct(rowsNewProduct.filter(row => row.productCode[row.id]?.productId !== productoUpdate?.productId));
                        setUpdateProduct(updateProduct.filter(row => row?.productId !== productoUpdate?.productId));
                        if (purchaseOrderPrueba?.detailPurchaseOrderList?.length > 0) {
                            setPurchaseOrderPrueba((prevState: any) => {
                                const updatedList = prevState.detailPurchaseOrderList.filter((item: any) => item.productId !== productoUpdate?.productId);
                                return {
                                    ...prevState,
                                    detailPurchaseOrderList: updatedList,
                                };
                            });
                        }
                        break;
                    }
                }
            }
        }
    }, [productos, updateProduct])

    useEffect(() => {
        const colocarProductos = () => {
            const newRows: RowModelProduct[] = [];
            const editRows: number[] = [];
            for (let i = 0; i < detailList.length; i++) {
                if (row.id === detailList[i].containerNumber) {
                    const numerosUnicos = generarNumerosAleatoriosUnicos(1, 100, 10);
                    const id = numerosUnicos[i]
                    const producto = listaProductos.find(item => item.productId === detailList[i].productId)
                    if (producto) {
                        editRows.push(id)
                        newRows.push({
                            id,
                            productCode: {
                                [id]: producto
                            },
                            quantity: {
                                [id]: detailList[i].quantity
                            },
                            observacion: {
                                [id]: detailList[i].observation
                            },
                        })
                    }
                }
            }
            setRowsNewProduct(newRows);
            setEditingRows(editRows);
        }
        const colocarProductosActualizar = () => {
            const updateRows: DetailPurchaseOrderList[] = [];
            for (let i = 0; i < detailList.length; i++) {
                updateRows.push({
                    productId: detailList[i].productId,
                    quantity: detailList[i].quantity,
                    unitsPerPallet: detailList[i].unitsPerPallet,
                    observation: detailList[i].observation,
                    quantityOC: detailList[i].quantityOC,
                    containerNumber: detailList[i].containerNumber,
                    cancelled: detailList[i].cancelled,
                    orderListId: detailList[i].orderListId,
                    detailOrderId: detailList[i].detailOrderId
                })
            }
            setPurchaseOrderPrueba({
                detailPurchaseOrderList: updateRows
            });
        }
        if (detailList.length > 0) {
            colocarProductos();
            colocarProductosActualizar();
        }
    }, [listaProductos, detailList])

    useEffect(() => {
        const colocarProductosExcel = () => {
            const newRows: RowModelProduct[] = [];
            for (let i = 0; i < rowsExcelProduct.length; i++) {
                if (row.id === rowsExcelProduct[i].container) {
                    newRows.push({
                        id: rowsExcelProduct[i].id,
                        productCode: rowsExcelProduct[i].productCode,
                        quantity: rowsExcelProduct[i].quantity,
                        observacion: rowsExcelProduct[i].observacion
                    })
                }
            }
            setRowsNewProduct(newRows);
        }
        const colocarProductosActualizar = () => {
            const updateExcelRows: DetailPurchaseOrderList[] = [];
            for (let i = 0; i < rowsExcelProduct.length; i++) {
                updateExcelRows.push({
                    productId: rowsExcelProduct[i].productCode[rowsExcelProduct[i].id].productId,
                    quantity: rowsExcelProduct[i].quantity[rowsExcelProduct[i].id],
                    unitsPerPallet: null,
                    observation: '',
                    quantityOC: null,
                    containerNumber: rowsExcelProduct[i].container,
                    cancelled: false,
                    orderListId: 0,
                    detailOrderId: 0
                });
            }
            setPurchaseOrderPrueba({
                detailPurchaseOrderList: updateExcelRows
            });
        }
        if (rowsExcelProduct.length > 0) {
            colocarProductosExcel();
            colocarProductosActualizar();
        }
    }, [listaProductos, rowsExcelProduct])

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" colSpan={0}>
                    {row.id}
                </TableCell>
                <TableCell align="right">
                    <div className={styles.iconContainer}>
                        <Tooltip title="Añadir Producto">
                            <span>
                                <IconButton disabled={!createMode && !editMode} onClick={() => handleAddProduct()}>
                                    <AddCircleIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                </TableCell>
            </TableRow>
            {open && (
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                        <Collapse in={open} timeout="auto">
                            <Box sx={{ margin: 1 }}>
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Contenedor</TableCell>
                                            <TableCell>Nombre Producto</TableCell>
                                            <TableCell align="right">Cantidad</TableCell>
                                            <TableCell align="right">Observaciones</TableCell>
                                            <TableCell align="right">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rowsNewProduct.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell component="th" scope="row" colSpan={0}>
                                                    {row.id}
                                                </TableCell>
                                                <TableCell>
                                                    {editingRows.includes(product.id) ? (
                                                        <Autocomplete
                                                            className={styles.genericFieldStyle}
                                                            readOnly
                                                            options={listaProductos}
                                                            getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
                                                            style={{ width: '100%' }}
                                                            value={product.productCode[product.id] || null}
                                                            isOptionEqualToValue={(option, value) =>
                                                                option.productCode === value.productCode
                                                            }
                                                            noOptionsText="Sin resultados"
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    variant="outlined"
                                                                    InputProps={{
                                                                        ...params.InputProps,
                                                                        className: styles.textWhiteStyle,
                                                                    }}
                                                                    InputLabelProps={{
                                                                        ...params.InputLabelProps,
                                                                        className: styles.textGreenStyle,
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    ) : (
                                                        <Autocomplete
                                                            readOnly={!createMode && !editMode}
                                                            className={styles.genericFieldStyle}
                                                            options={listaProductos}
                                                            getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
                                                            style={{ width: '100%' }}
                                                            onChange={(event, value) => {
                                                                if (event != null && value !== null) {
                                                                    handleAutocompleteChange(value, product.id); // `rowIndex` debe ser el índice de la fila que estás editando
                                                                }
                                                            }}
                                                            value={product.productCode[product.id] || null}
                                                            isOptionEqualToValue={(option, value) =>
                                                                option.productCode === value.productCode
                                                            }
                                                            noOptionsText="Sin resultados"
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    variant="outlined"
                                                                    InputProps={{
                                                                        ...params.InputProps,
                                                                        className: styles.textWhiteStyle,
                                                                    }}
                                                                    InputLabelProps={{
                                                                        ...params.InputLabelProps,
                                                                        className: styles.textGreenStyle,
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {editingRows.includes(product.id) ? (
                                                        <div>
                                                            <input
                                                                id="quantity"
                                                                type="text"
                                                                disabled
                                                                value={product.quantity[product.id] || ''}
                                                                onFocus={(event) => setTimeout(() => event.target.select(), 0)}
                                                                style={{ width: '30%', color: 'black', textAlign: 'center' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <input
                                                                id="quantity"
                                                                type="text"
                                                                disabled={!createMode && !editMode}
                                                                value={product.quantity[product.id] || ''}
                                                                onChange={(event) => getQuantity(event, product.id)}
                                                                onFocus={(event) => setTimeout(() => event.target.select(), 0)}
                                                                style={{ width: '30%', color: 'black', textAlign: 'center' }}
                                                            />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {editingRows.includes(product.id) ? (
                                                        <div>
                                                            <input
                                                                id="quantity"
                                                                type="text"
                                                                disabled
                                                                value={product.observacion[product.id] || ''}
                                                                onFocus={(event) => setTimeout(() => event.target.select(), 0)}
                                                                style={{ width: '60%', color: 'black', textAlign: 'center' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <input
                                                                id="quantity"
                                                                type="text"
                                                                disabled={!createMode && !editMode}
                                                                value={product.observacion[product.id] || ''}
                                                                onChange={(event) => {
                                                                    getObservacion(event, product.id)
                                                                }}
                                                                onFocus={(event) => setTimeout(() => event.target.select(), 0)}
                                                                style={{ width: '60%', color: 'black', textAlign: 'center' }}
                                                            />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {editingRows.includes(product.id) ? (
                                                        <Tooltip title="Editar Producto">
                                                            <span>
                                                                <IconButton disabled={!createMode && !editMode} onClick={() => startEditing(product.id, product)}>
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Guardar Producto">
                                                            <span>
                                                                <IconButton disabled={!createMode && !editMode} onClick={() => saveLista(product.id, product)}>
                                                                    <Save />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Eliminar Fila">
                                                        <span>
                                                            <IconButton disabled={!createMode && !editMode} onClick={() => handleDeleteClick(product.id, product)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
}
