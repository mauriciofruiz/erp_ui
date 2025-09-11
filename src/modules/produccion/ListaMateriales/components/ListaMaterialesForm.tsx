import { FormState, useStyles } from '@/hooks'
import { RootState, ServerResponseType } from '@/store'
import { Autocomplete, Box, Divider, Grid, TextField } from '@mui/material'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import { ChangeEvent, useEffect, useState } from 'react'
import { ListaMaterialesMateriaPrima } from './ListaMaterialesMateriaPrima'
import { CostosIndirectosType, ManoObraType, ProductoRecetaType } from '@/types'
import { getProductsReceta } from '@/backend/inventario/recetaServices'
import { GridRowsProp } from '@mui/x-data-grid'
import { useSelector } from 'react-redux'

export type ListaMaterialesFormProps = {
    formState: FormState
    setFormState: React.Dispatch<React.SetStateAction<FormState>>
    createMode: boolean
    editMode: boolean
    onDateChange: (value: Date, name: string) => void;
    onAutocompleteChange: (
        event: React.ChangeEvent<{}>,
        name: string,
        value: any,
        index?: number
    ) => void;
    onInputChange: (
        event: ChangeEvent<HTMLInputElement>,
        listName?: string,
        index?: number
    ) => void;
    rowsMateriaPrima: GridRowsProp
    setRowsMateriaPrima: React.Dispatch<React.SetStateAction<GridRowsProp>>
    rowsObra: GridRowsProp
    setRowsObra: React.Dispatch<React.SetStateAction<GridRowsProp>>
    rowsCostos: GridRowsProp
    setRowsCostos: React.Dispatch<React.SetStateAction<GridRowsProp>>
    productosReceta: ProductoRecetaType[]
    setProductosReceta: React.Dispatch<React.SetStateAction<ProductoRecetaType[]>>
    materiales: ProductoRecetaType[]
    setMateriales: React.Dispatch<React.SetStateAction<ProductoRecetaType[]>>
    manoObra: ManoObraType[]
    setManoObra: React.Dispatch<React.SetStateAction<ManoObraType[]>>
    costosIndirectos: CostosIndirectosType[]
    setCostosIndirectos: React.Dispatch<React.SetStateAction<CostosIndirectosType[]>>
}

export const ListaMaterialesForm = (props: ListaMaterialesFormProps) => {
    const {
        formState,
        createMode,
        editMode,
        onInputChange,
        onAutocompleteChange,
        setFormState,
        rowsMateriaPrima,
        setRowsMateriaPrima,
        rowsObra,
        setRowsObra,
        rowsCostos,
        setRowsCostos,
        productosReceta,
        setProductosReceta,
        materiales,
        setMateriales,
        manoObra,
        setManoObra,
        costosIndirectos,
        setCostosIndirectos
    } = props;

    const styles = useStyles();
    const { grupos } = useSelector((state: RootState) => state.common);
    const [productSelected, setProductSelected] = useState<ProductoRecetaType | null>(null)
    const [searchCode, setSearchCode] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState<string | null>(null);

    const handleAutocompleteProduct = async (
        event: React.SyntheticEvent<Element, Event>,
        inputValue: string
    ) => {
        if (event !== null) {
            event.preventDefault();
            const intValue = parseInt(inputValue);
            if (!isNaN(intValue)) {
                setSearchCode(inputValue);
            } else {
                setSearchTerm(inputValue);
            }
        }
    };

    useEffect(() => {
        const fetchProductoReceta = async (code: string | null, name: string | null) => {
            try {
                const response: ServerResponseType | undefined =
                    await getProductsReceta(
                        code, 
                        name, 
                        true, 
                        null, 
                        null,
                        null
                    );
                if (response) {
                    if (response.status === 200) {
                        setProductosReceta(response.message);
                    }
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        setProductosReceta([]);
                        enqueueSnackbar('No se ha encontrado el producto buscado', {
                            variant: 'info',
                        });
                    } else {
                        enqueueSnackbar('Error Del Servidor: ' + error.message, {
                            variant: 'error',
                        });
                    }
                }
            }
        };

        if(searchTerm !== '' && searchTerm !== null){
            if (searchTerm.length >= 3) {
                fetchProductoReceta(null, searchTerm);
                setSearchTerm(null);
            }
        }else if(searchCode !== null  && searchCode !== ''){
            if (searchCode.length >= 3) {
                fetchProductoReceta(searchCode, null);
                setSearchCode(null);
            }
        }
    }, [searchTerm, searchCode])

    useEffect(() => {
        if (formState.groupId) {
            const grupoProd = grupos.filter((s) => s.groupId === formState?.groupId)[0].groupName
            setFormState({
                ...formState,
                productGroup: grupoProd
            })
        }
    }, [formState.groupId])

    useEffect(() => {
        if (formState.productCode) {
            const fetchProductoReceta = async () => {
                try {
                    const response: ServerResponseType | undefined =
                        await getProductsReceta(formState.productCode, null, true, null, null, null);
                    if (response) {
                        if (response.status === 200) {
                            setProductosReceta(response.message);
                        }
                    }
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        if (error.response?.status === 404) {
                            setProductosReceta([]);
                            enqueueSnackbar('No se ha encontrado la parroquia buscada', {
                                variant: 'info',
                            });
                        } else {
                            enqueueSnackbar('Error Del Servidor: ' + error.message, {
                                variant: 'error',
                            });
                        }
                    }
                }
            };
            fetchProductoReceta();
        }
    }, [formState.productCode])

    useEffect(() => {
        if (formState.product === null) {
            setProductSelected(null);
            return;
        }
        if (
            productSelected &&
            productSelected !== null &&
            productosReceta.length === 0
        )
            return;
        const receta = productosReceta.find(
            (product) => product.productId === formState.product
        );
        if (receta) {
            setProductSelected(receta);
        }

    }, [formState.product, productosReceta]);

    return (
        <>
            <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                            <Autocomplete
                                readOnly={!createMode && !editMode}
                                className={styles.genericFieldStyle}
                                options={productosReceta}
                                getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
                                style={{ width: '100%' }}
                                onChange={(event, value) => {
                                    onAutocompleteChange(event, 'product', value?.productId)
                                    if (value != null) {
                                        setFormState((prevState: any) => ({
                                            ...prevState,
                                            product: value?.productId,
                                            nameProduct: value?.productName,
                                            unitMesure: value?.measurementUnitName,
                                            groupId: value?.groupId
                                        }));
                                    }
                                }}
                                onInputChange={handleAutocompleteProduct}
                                value={productSelected}
                                isOptionEqualToValue={(
                                    option: ProductoRecetaType,
                                    value: ProductoRecetaType
                                ) =>
                                    option.productId === value.productId
                                }
                                noOptionsText="Sin resultados"
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Productos"
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
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="nameProduct"
                                label="Nombre Producto"
                                value={formState.nameProduct ? formState.nameProduct : ''}
                                onChange={onInputChange}
                                InputProps={{
                                    readOnly: !createMode && !editMode,
                                }}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.nameProduct !== '' &&
                                            formState.nameProduct != null
                                            ? true
                                            : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="productGroup"
                                label="Grupo Producto"
                                value={formState.productGroup ? formState.productGroup : ''}
                                onChange={onInputChange}
                                InputProps={{
                                    readOnly: !createMode && !editMode,
                                }}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.productGroup !== '' &&
                                            formState.productGroup != null
                                            ? true
                                            : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="unitMesure"
                                label="Unidad de Medida"
                                value={formState.unitMesure ? formState.unitMesure : ''}
                                onChange={onInputChange}
                                InputProps={{
                                    readOnly: !createMode && !editMode,
                                }}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.unitMesure !== '' &&
                                            formState.unitMesure != null
                                            ? true
                                            : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="cost"
                                label="Costo Receta"
                                value={formState.cost}
                                type='number'
                                //onChange={onInputChange}
                                InputProps={{
                                    readOnly: true,
                                }}
                                InputLabelProps={{
                                    shrink:
                                        formState.cost != null
                                            ? true
                                            : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                name="description"
                                label="Descipción"
                                value={formState.description ? formState.description : ''}
                                onChange={onInputChange}
                                InputProps={{
                                    readOnly: !createMode && !editMode,
                                }}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.description !== '' &&
                                            formState.description != null
                                            ? true
                                            : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="instructions"
                                label="Instrucciones"
                                value={formState.instructions ? formState.instructions : ''}
                                onChange={onInputChange}
                                InputProps={{
                                    readOnly: !createMode && !editMode,
                                }}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                                InputLabelProps={{
                                    shrink:
                                        formState.instructions !== '' &&
                                            formState.instructions != null
                                            ? true
                                            : false,
                                }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Divider sx={{ mt: 4, height: 4 }} />
            <ListaMaterialesMateriaPrima
                rowsMateriaPrima={rowsMateriaPrima}
                setRowsMateriaPrima={setRowsMateriaPrima}
                rowsCostos={rowsCostos}
                setRowsCostos={setRowsCostos}
                rowsObra={rowsObra}
                setRowsObra={setRowsObra}
                createMode={createMode}
                editMode={editMode}
                materiales={materiales}
                setMateriales={setMateriales}
                manoObra={manoObra}
                setManoObra={setManoObra}
                costosIndirectos={costosIndirectos}
                setCostosIndirectos={setCostosIndirectos}
            />
        </>
    )
}
