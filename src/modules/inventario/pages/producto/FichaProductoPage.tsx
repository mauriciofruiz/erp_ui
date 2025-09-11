import { getAllProductosByParams } from '@/backend/inventario';
import { DocumentTypeEnum, PathEnum } from '@/enums';
import {
  useAccessDocument,
  useAllowGlobal,
  useForm,
  useProductoAsync,
  useStyles,
} from '@/hooks';
import { CardLayout } from '@/modules';
import { ServerResponseType } from '@/store';
import { ProductMainDataType, ProductoType } from '@/types';
import { AddCircle, Info } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type FichaProductoPageProps = {};

export const FichaProductoPage: React.FC<FichaProductoPageProps> = ({}) => {
  const styles = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [productsList, setProductsList] = useState<ProductoType[]>([]);

  const { formState, onAutocompleteChange, onResetForm } = useForm({
    product: null,
  });

  const [searchTerm, setSearchTerm] = useState('');

  const [productData, setProductData] = useState<ProductMainDataType>();

  const navigate = useNavigate();

  const [showEditButton, setShowEditButton] = useState(false);

  const { openDocument } = useAccessDocument();

  const { enableAdmin } = useAllowGlobal();

  const { fetchMainData } = useProductoAsync();

  const handleInputChangeAutocomplete = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setSearchTerm(newInputValue);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: ServerResponseType | undefined =
          await getAllProductosByParams(searchTerm.toUpperCase());
        if (response) {
          if (response.status === 200) {
            setProductsList(response.message);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setProductsList([]);
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

    if (searchTerm.length >= 3) {
      fetchData();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (formState.product === null) {
      onResetForm();
      setSearchTerm('');
      setProductData({
        productId: undefined,
        productCode: undefined,
        productName: undefined,
        productGroup: undefined,
        productSubGroup: undefined,
        productRawMaterial: undefined,
        productCostAccount: undefined,
        productInventoryAccount: undefined,
        productSaleAccount: undefined,
        productCost: undefined,
        productPvp: undefined,
        warehouseList: [],
      });
      setShowEditButton(false);
    } else {
      const fetchGetProductData = async () => {
        fetchMainData(formState.product.productId).then((response) => {
          if (response) {
            setProductData(response);
          }
        });
      };
      fetchGetProductData();
      setShowEditButton(true);
    }
  }, [formState.product]);

  const headerComponents: React.ReactNode = (
    <Box sx={{ mt: 0.5 }}>
      {enableAdmin() && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 1, width: '200px' }}
          startIcon={<AddCircle />}
          onClick={() => {
            navigate(PathEnum.FICHA_PRODUCTO + PathEnum.NEW);
          }}
        >
          Nuevo Producto
        </Button>
      )}

      {showEditButton && enableAdmin() && (
        <Button
          variant="contained"
          color="secondary"
          sx={{ width: '200px' }}
          startIcon={<Info />}
          onClick={() => {
            if (productData?.productId) {
              openDocument({
                id: productData.productId,
                navigation: () =>
                  navigate(PathEnum.FICHA_PRODUCTO + PathEnum.VIEW, {
                    state: {
                      productId: productData.productId,
                    },
                  }),
                documentType: DocumentTypeEnum.PRODUCTO,
              });
            }
          }}
        >
          Ver Producto
        </Button>
      )}
    </Box>
  );

  return (
    <>
      <CardLayout
        title="FICHA PRODUCTO"
        positionTitle="left"
        headerActions={headerComponents}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12}>
            <Autocomplete
              className={styles.genericFieldStyle}
              options={productsList}
              getOptionLabel={(option: ProductoType) =>
                `${option.productCode} - ${option.shortName}`
              }
              style={{ width: '100%' }}
              onChange={(event, value) =>
                onAutocompleteChange(event, 'product', value)
              }
              onInputChange={(event, newInputValue) =>
                handleInputChangeAutocomplete(event, newInputValue)
              }
              value={formState.product}
              isOptionEqualToValue={(option, value) =>
                option?.shortName === value?.shortName
              }
              filterOptions={(options) => options}
              autoHighlight
              autoSelect
              fullWidth
              handleHomeEndKeys
              noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Producto"
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
          {formState.product !== null && (
            <>
              <Grid item xs={4}>
                <TextField
                  label="Código"
                  value={
                    productData?.productCode ? productData?.productCode : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: productData?.productCode ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Grupo"
                  value={
                    productData?.productGroup ? productData?.productGroup : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: productData?.productGroup ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Subgrupo"
                  value={
                    productData?.productSubGroup
                      ? productData?.productSubGroup
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: productData?.productSubGroup ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Cuenta Ingreso"
                  value={
                    productData?.productSaleAccount
                      ? productData?.productSaleAccount
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: productData?.productSaleAccount ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Cuenta Inventario"
                  value={
                    productData?.productInventoryAccount
                      ? productData?.productInventoryAccount
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: productData?.productInventoryAccount ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Cuenta Costo"
                  value={
                    productData?.productCostAccount
                      ? productData?.productCostAccount
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: productData?.productCostAccount ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="PVP"
                  value={productData?.productPvp ? productData?.productPvp : ''}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: productData?.productPvp ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Costo"
                  value={
                    productData?.productCost ? productData?.productCost : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink: productData?.productCost ? true : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Materia Prima"
                  value={
                    productData?.productRawMaterial !== undefined
                      ? productData?.productRawMaterial
                        ? 'SÍ'
                        : 'NO'
                      : ''
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    className: styles.textWhiteStyle,
                  }}
                  InputLabelProps={{
                    shrink:
                      productData?.productRawMaterial !== undefined
                        ? true
                        : false,
                    className: styles.textGreenStyle,
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
        {formState.product !== null && (
          <>
            <Divider sx={{ mt: 3, mb: 3 }} />
            <TableContainer
              component={Paper}
              style={{
                maxHeight: 450,
                overflow: 'auto',
              }}
            >
              <Table size="small" aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Bodega</TableCell>
                    <TableCell align="center">Cantidad Disponible</TableCell>
                    <TableCell align="center">Cantidad Existente</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productData?.warehouseList.map((warehouse) => (
                    <TableRow key={warehouse.branchId}>
                      <TableCell align="center">
                        {warehouse.branchName}
                      </TableCell>
                      <TableCell align="center">
                        {warehouse.availableQuantity.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        {warehouse.existenceQuantity?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </CardLayout>
    </>
  );
};
