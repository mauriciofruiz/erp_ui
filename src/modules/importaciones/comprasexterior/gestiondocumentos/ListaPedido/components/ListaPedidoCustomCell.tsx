import { FormState } from "@/hooks";
import { ProveedorProductoType } from "@/types";
import { DetailPurchaseOrderListGet } from "@/types/importaciones/listaPedido.type";
import { Autocomplete, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";


interface ProductosByProveedorProps {
    listaProductos: ProveedorProductoType[];
    onValueChange: (values: ProveedorProductoType[]) => void
    createMode: boolean
    editMode: boolean
    formState: FormState
    detailList: DetailPurchaseOrderListGet[]
}

export function Productos(props: ProductosByProveedorProps) {
    const { listaProductos, onValueChange, createMode, editMode, formState, detailList } = props;
    const [selectedOptions, setSelectedOptions] = useState<ProveedorProductoType[]>([]);

    useEffect(() =>{
        if(formState.numeroContenedores === ''){
            setSelectedOptions([]);
        }
    }, [formState.numeroContenedores])

    const handleChange = (event: React.ChangeEvent<{}>, values: ProveedorProductoType[]) => {
        if (event != null && values !== null) {
            if (values.length !== 0) {
                if (formState.numeroContenedores) {
                    if (detailList.length > 0) {
                        if (values.length !== 0) {
                            const newProducts: ProveedorProductoType[] = values.filter(value => !detailList.some(item => item.productId === value.productId));
                            if (newProducts.length === 0) {
                                enqueueSnackbar('El producto seleccionado ya existe', { variant: 'error' });
                            } else {
                                setSelectedOptions(newProducts);
                                onValueChange(newProducts);
                            }
                        }
                        else {
                            setSelectedOptions(values);
                            onValueChange(values);
                        }
                    } else {
                        setSelectedOptions(values);
                        onValueChange(values);
                    }
                } else {
                    enqueueSnackbar('Primero debe digitar el número de contenedores', { variant: 'info' });
                }
            }
            else {
                setSelectedOptions(values);
                onValueChange(values);
            }
        }
    };
    return (
        <Autocomplete
            disabled={!createMode && !editMode}
            multiple
            options={listaProductos}
            getOptionLabel={(option) => `${option.productCode}-${option.productName}`}
            value={selectedOptions}
            onChange={handleChange}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="SELECCIONAR PRODUCTOS"
                />
            )}
        />
    );
}