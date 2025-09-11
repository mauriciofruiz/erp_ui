import { PathEnum } from '@/enums';
import { navigateExternal } from '@/functions';
import {
  FormState,
  Image,
  ImageBackdrop,
  ImageButton,
  ImageSrc,
  StyledDatePicker,
  useStyles,
  VisuallyHiddenInput,
} from '@/hooks';
import {
  CloudUpload,
  Factory,
  LocalGroceryStore,
  PointOfSale,
  Store,
  ToggleOff,
  ToggleOn,
  Warehouse,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { parseISO } from 'date-fns';

type ProductFormProps = {
  formState: FormState;
  onImageChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  createMode: boolean;
  editMode: boolean;
  onBooleanChangeClick: (name: string, value: boolean) => void;
};
const ProductForm: React.FC<ProductFormProps> = ({
  formState,
  onImageChange,
  onInputChange,
  createMode,
  editMode,
  onBooleanChangeClick,
}) => {
  const styles = useStyles();
  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            {formState.productPhoto === null ? (
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUpload />}
              >
                Cargar Imagen
                <VisuallyHiddenInput
                  type="file"
                  name="productPhoto"
                  accept="image/jpeg"
                  onChange={onImageChange}
                />
              </Button>
            ) : (
              <ImageButton
                component="label"
                variant="contained"
                key={formState.productName}
                style={{
                  width: 425,
                  height: 200,
                }}
              >
                <ImageSrc>
                  <img
                    srcSet={formState.productPhoto}
                    src={formState.productPhoto}
                    alt={formState.productName}
                    style={{
                      maxWidth: '100%', // Set max width to 100%
                      maxHeight: '100%', // Set max height to 100%
                      width: 'inherit',
                      height: 'inherit',
                    }}
                    loading="lazy"
                  />
                </ImageSrc>
                <ImageBackdrop className="MuiImageBackdrop-root" />
                <Image>
                  <VisuallyHiddenInput
                    type="file"
                    name="productPhoto"
                    accept="image/jpeg"
                    onChange={onImageChange}
                  />
                  <Typography
                    component="span"
                    variant="subtitle1"
                    color="inherit"
                    sx={{
                      position: 'relative',
                      p: 4,
                      pt: 2,
                      pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                    }}
                  >
                    {'Actualizar Imagen'}
                  </Typography>
                </Image>
              </ImageButton>
            )}
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <TextField
                  name="productCode"
                  label="Código Producto"
                  value={formState.productCode}
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode,
                  }}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  InputLabelProps={{
                    shrink:
                      formState.productCode !== '' &&
                      formState.productCode != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="productName"
                  label="Nombre Producto"
                  value={formState.productName}
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode && !editMode,
                  }}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  InputLabelProps={{
                    shrink:
                      formState.productName !== '' &&
                      formState.productName != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              {/* <Grid item xs={12}>
                <TextField
                  name="productLongName"
                  label="Nombre Largo Producto"
                  value={formState.productLongName}
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode && !editMode,
                  }}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  InputLabelProps={{
                    shrink:
                      formState.productLongName !== '' &&
                      formState.productLongName != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid> */}
              {!createMode && (
                <>
                  <Grid item xs={6}>
                    <StyledDatePicker
                      label="Fecha Creación"
                      views={['year', 'month', 'day']}
                      format="dd/MM/yyyy"
                      value={
                        formState.productCreationDate
                          ? typeof formState.productCreationDate === 'string'
                            ? parseISO(formState.productCreationDate)
                            : formState.productCreationDate
                          : null
                      }
                      readOnly
                      disableOpenPicker
                      slotProps={{
                        textField: {
                          className: styles.genericFieldStyle,
                          sx: {
                            minWidth: '100%',
                          },
                          InputProps: {
                            className: styles.textWhiteStyle,
                          },
                          InputLabelProps: {
                            className: styles.textGreenStyle,
                            shrink: true,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <StyledDatePicker
                      label="Fecha Modificación"
                      views={['year', 'month', 'day']}
                      format="dd/MM/yyyy"
                      value={
                        formState.productModificationDate
                          ? typeof formState.productModificationDate ===
                            'string'
                            ? parseISO(formState.productModificationDate)
                            : formState.productModificationDate
                          : null
                      }
                      disableOpenPicker
                      readOnly
                      slotProps={{
                        textField: {
                          className: styles.genericFieldStyle,
                          sx: {
                            minWidth: '100%',
                          },
                          InputProps: {
                            className: styles.textWhiteStyle,
                          },
                          InputLabelProps: {
                            className: styles.textGreenStyle,
                            shrink: true,
                          },
                        },
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <Tooltip title="Estado Del Producto">
                  <span>
                    <Button
                      disabled={formState.productTotalQuantity > 0 || !editMode}
                      startIcon={
                        formState.productState ? <ToggleOn /> : <ToggleOff />
                      }
                      onClick={() =>
                        onBooleanChangeClick(
                          'productState',
                          !formState.productState
                        )
                      }
                      style={{ width: '100%', height: 82 }}
                    >
                      {formState.productState ? 'Activo' : 'Inactivo'}
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item xs={4}>
                <Tooltip title="Cantidad Disponible">
                  <Button
                    startIcon={<Store />}
                    style={{ width: '100%', height: 82 }}
                  >
                    {formState.productTotalQuantity}
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item xs={4}>
                <Tooltip title="Cantidad Existente">
                  <Button
                    startIcon={<Factory />}
                    style={{ width: '100%', height: 82 }}
                  >
                    {formState.productTotalExistQuantity}
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item xs={4}>
                <Tooltip title="Cantidad Kardex">
                  <span>
                    <Button
                      startIcon={<Warehouse />}
                      style={{ width: '100%', height: 82 }}
                      disabled={formState.productId === null}
                      onClick={() =>
                        navigateExternal(PathEnum.KARDEX_VIEW, {
                          state: {
                            productId: formState.productId,
                          },
                        })
                      }
                    >
                      {formState.productKardexQuantity}
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item xs={4}>
                <Tooltip title="Número De Compras">
                  <span>
                    <Button
                      startIcon={<LocalGroceryStore />}
                      style={{ width: '100%', height: 82 }}
                      onClick={() =>
                        navigateExternal(PathEnum.ORDEN_COMPRA, {
                          state: {
                            productId: formState.productId,
                          },
                        })
                      }
                    >
                      {formState.productPurchaseQuantity}
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item xs={4}>
                <Tooltip title="Número De Ventas">
                  <Button
                    startIcon={<PointOfSale />}
                    style={{ width: '100%', height: 82 }}
                  >
                    {formState.productSaleQuantity}
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductForm;
