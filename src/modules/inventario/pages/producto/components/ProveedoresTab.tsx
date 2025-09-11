import { TabPanel } from '@/functions';
import { FormState, useProveedorAsync, useStyles } from '@/hooks';
import { PersonProviderType, ProveedorProductoType } from '@/types';
import { Cancel } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useMemo } from 'react';

type ProveedoresTabProps = {
  formState: FormState;
  tabIndex: number;
  value: number;
  createMode: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  proveedoresList: ProveedorProductoType[];
  setProveedoresList: React.Dispatch<
    React.SetStateAction<ProveedorProductoType[]>
  >;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string,
    index?: number
  ) => void;
  editMode: boolean;
  onBooleanChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string,
    index: number,
    listName: string
  ) => void;
};
const ProveedoresTab: React.FC<ProveedoresTabProps> = ({
  formState,
  tabIndex,
  createMode,
  onAutocompleteChange,
  setFormState,
  value,
  proveedoresList,
  setProveedoresList,
  onInputChange,
  editMode,
  onBooleanChange,
}) => {
  const styles = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const { fetchByParam } = useProveedorAsync();

  // * * * * * * * * CONSTANTES PARA PROVEEDORES * * * * * * * *

  const handleAutocompleteChangeProveedor = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event && inputValue !== '' && inputValue.length > 4) {
      try {
        await getProveedoresListByParam(inputValue);
      } catch (error) {
        console.error(error);
      }
    }
  };
  const getProveedoresListByParam = async (param: string) => {
    fetchByParam(param.toUpperCase()).then((response) => {
      if (response) {
        const proveedorPersona = response as PersonProviderType[];

        const proveedorProducto: ProveedorProductoType[] = proveedorPersona.map(
          (proveedor) => ({
            providerProductId: null,
            providerId: proveedor.providerId,
            providerName: proveedor.personName,
            productId: formState.productId,
            productName: formState.productName,
            productCode: '',
            providerProductCode: '',
            tariffItem: '',
            releasePercentage: 0,
            feePercentage: 0,
            cost: 0,
            checkIva: false,
            isActive: true,
            unitMeasureId: null,
          })
        );

        setProveedoresList((prevProveedoresList) => [
          ...prevProveedoresList,
          ...proveedorProducto,
        ]);
      }
    });
  };

  useEffect(() => {
    if (proveedoresList.length > 0) {
      // Use a Set to keep track of unique IDs
      const uniqueIdsSet = new Set<number>();

      // Filter the cuentasList to remove repeated items by ID
      const filteredProveedoresList = proveedoresList.filter((proveedor) => {
        // Check if the ID is unique; if not, exclude the item
        if (
          proveedor.providerId !== null &&
          !uniqueIdsSet.has(proveedor.providerId)
        ) {
          uniqueIdsSet.add(proveedor.providerId); // Add the ID to the Set
          return true; // Include the item in the filtered list
        }
        return false; // Exclude the item from the filtered list
      });
      setProveedoresList(filteredProveedoresList);
    }
  }, [proveedoresList]);

  useEffect(() => {
    if (formState.supplierList.length > 0) {
      let proveedoresList: ProveedorProductoType[] = formState.supplierList;
      const providerIds = new Set();
      let hasDuplicates = false;

      for (let i = 0; i < proveedoresList.length; i++) {
        if (providerIds.has(proveedoresList[i].providerId)) {
          hasDuplicates = true;
          proveedoresList = proveedoresList.filter((_, index) => index !== i);
          i--; // Decrementamos el índice ya que hemos eliminado un elemento
        } else {
          providerIds.add(proveedoresList[i].providerId);
        }
      }

      if (hasDuplicates) {
        enqueueSnackbar('No se pueden agregar proveedores duplicados', {
          variant: 'warning',
        });
        setFormState((prevFormState: any) => ({
          ...prevFormState,
          supplierList: proveedoresList,
        }));
      }
    }
  }, [formState.supplierList]);
  const deleteProveedor = (index: number) => {
    setFormState((prevFormState: FormState) => ({
      ...prevFormState,
      supplierList: prevFormState.supplierList.filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  const thereAreProviders = useMemo(() => {
    return formState.supplierList !== null && formState.supplierList.length > 0;
  }, [formState.supplierList]);

  return (
    <TabPanel value={tabIndex} index={value}>
      {thereAreProviders &&
        formState.supplierList.map(
          (item: ProveedorProductoType, index: number) => (
            <Grid
              container
              spacing={2}
              alignItems="center"
              position={'relative'}
            >
              {item.providerProductId === null && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -7,
                    right: -28,
                  }}
                >
                  <Tooltip title="Eliminar Proveedor">
                    <IconButton
                      style={{ backgroundColor: 'transparent' }}
                      onClick={() => deleteProveedor(index)}
                    >
                      <Cancel />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              <React.Fragment key={index}>
                <Grid item xs={4} key={item.providerId}>
                  <Autocomplete
                    className={styles.genericFieldStyle}
                    disablePortal
                    autoSelect
                    options={proveedoresList}
                    readOnly={!(createMode || item.providerProductId === null)}
                    getOptionLabel={(option) => option.providerName}
                    style={{ width: '100%' }}
                    onChange={(event, value) =>
                      onAutocompleteChange(event, 'supplierList', value, index)
                    }
                    onInputChange={(event, value) =>
                      handleAutocompleteChangeProveedor(event, value)
                    }
                    value={item.providerId === null ? null : item}
                    filterOptions={(options) => options}
                    isOptionEqualToValue={(option, value) =>
                      option.providerId === value.providerId
                    }
                    noOptionsText="Sin resultados"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Proveedor"
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
                    name="productName"
                    label="Nombre Producto"
                    value={item.productName}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    onChange={(event) =>
                      onInputChange(
                        event as ChangeEvent<HTMLInputElement>,
                        'supplierList',
                        index
                      )
                    }
                    inputProps={{
                      style: { textTransform: 'uppercase' },
                    }}
                    InputLabelProps={{
                      shrink: item.productName !== '' ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="providerProductCode"
                    label="Código Producto Proveedor"
                    value={item.providerProductCode}
                    onChange={(event) =>
                      onInputChange(
                        event as ChangeEvent<HTMLInputElement>,
                        'supplierList',
                        index
                      )
                    }
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    inputProps={{
                      style: { textTransform: 'uppercase' },
                    }}
                    InputLabelProps={{
                      shrink: item.providerProductCode !== '' ? true : false,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="tariffItem"
                    label="Partida Arancelaria"
                    value={item.tariffItem}
                    onChange={(event) =>
                      onInputChange(
                        event as ChangeEvent<HTMLInputElement>,
                        'supplierList',
                        index
                      )
                    }
                    inputProps={{
                      style: { textTransform: 'uppercase' },
                    }}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="feePercentage"
                    label="% Arancel"
                    type="number"
                    onChange={(event) =>
                      onInputChange(
                        event as ChangeEvent<HTMLInputElement>,
                        'supplierList',
                        index
                      )
                    }
                    value={item.feePercentage}
                    onFocus={(event) => event.target.select()}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="releasePercentage"
                    label="Liberación"
                    type="number"
                    onChange={(event) =>
                      onInputChange(
                        event as ChangeEvent<HTMLInputElement>,
                        'supplierList',
                        index
                      )
                    }
                    value={item.releasePercentage}
                    onFocus={(event) => event.target.select()}
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name="cost"
                    label="Costo Compra"
                    value={item.cost}
                    type="number"
                    onChange={(event) =>
                      onInputChange(
                        event as ChangeEvent<HTMLInputElement>,
                        'supplierList',
                        index
                      )
                    }
                    InputProps={{
                      readOnly: !createMode && !editMode,
                    }}
                    onFocus={(event) => event.target.select()}
                    fullWidth
                  />
                </Grid>
                <Grid
                  item
                  xs={4}
                  container
                  justifyContent="center"
                  alignItems="center"
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.checkIva}
                        disabled={!createMode && !editMode}
                        onChange={(event) =>
                          onBooleanChange(
                            event,
                            'checkIva',
                            index,
                            'supplierList'
                          )
                        }
                      />
                    }
                    label={item.checkIva ? 'Con IVA' : 'Sin IVA'}
                  />
                </Grid>
                <Grid
                  item
                  xs={4}
                  container
                  justifyContent="center"
                  alignItems="center"
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.isActive}
                        disabled={!createMode && !editMode}
                        onChange={(event) =>
                          onBooleanChange(
                            event,
                            'isActive',
                            index,
                            'supplierList'
                          )
                        }
                      />
                    }
                    label={item.isActive ? 'Activo' : 'Inactivo'}
                  />
                </Grid>
                {index < formState.supplierList.length - 1 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                )}
              </React.Fragment>
            </Grid>
          )
        )}
    </TabPanel>
  );
};

export default ProveedoresTab;
