import { TabPanel } from '@/functions';
import { FormState, useAccountAsync, useStyles } from '@/hooks';
import { AccountType } from '@/types';
import { Autocomplete, Grid, TextField } from '@mui/material';
import { useEffect } from 'react';

type FilesTabProps = {
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
  cuentasList: AccountType[];
  setCuentasList: React.Dispatch<React.SetStateAction<AccountType[]>>;
};
const FilesTab: React.FC<FilesTabProps> = ({
  formState,
  tabIndex,
  cuentasList,
  createMode,
  setCuentasList,
  onAutocompleteChange,
  setFormState,
  value,
}) => {
  const styles = useStyles();

  const { fetchAccountByNumber } = useAccountAsync();

  // * * * * * * * * CONSTANTES PARA CUENTAS * * * * * * * *

  /**
   * Function to get Cuentas by param
   * @param inputValue
   */
  const getCuentasList = async (inputValue: string) => {
    fetchAccountByNumber(inputValue).then((response) => {
      if (response)
        setCuentasList((prevCuentasList) => [...prevCuentasList, ...response]);
      return response;
    });
  };

  /**
   * useEffect to get DELETE repeated
   */
  useEffect(() => {
    if (cuentasList.length > 0) {
      // Use a Set to keep track of unique IDs
      const uniqueIdsSet = new Set<number>();

      // Filter the cuentasList to remove repeated items by ID
      const filteredCuentasList = cuentasList.filter((cuenta) => {
        // Check if the ID is unique; if not, exclude the item
        if (!uniqueIdsSet.has(cuenta.accountId)) {
          uniqueIdsSet.add(cuenta.accountId); // Add the ID to the Set
          return true; // Include the item in the filtered list
        }
        return false; // Exclude the item from the filtered list
      });
      setCuentasList(filteredCuentasList);
    }
  }, [cuentasList]);

  const handleAutocompleteChange = async (
    event: React.SyntheticEvent<Element, Event>,
    inputValue: string
  ) => {
    if (event && inputValue !== '' && inputValue.length > 4) {
      await getCuentasList(inputValue);
    } else {
      setCuentasList([]);
    }
  };

  return (
    <TabPanel value={tabIndex} index={value}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={5}>
          <Autocomplete
            className={styles.genericFieldStyle}
            disablePortal
            options={cuentasList}
            readOnly={!createMode}
            getOptionLabel={(option) => option.accountName}
            style={{ width: '100%' }}
            onChange={(event, value) => {
              onAutocompleteChange(event, 'cuentaCosto', value);
              if (value !== null) {
                setFormState((prevState: FormState) => ({
                  ...prevState,
                  productCostAccount: value.accountName,
                  productCostAccountId: value.accountId,
                }));
              }
            }}
            onInputChange={(event, value) =>
              handleAutocompleteChange(event, value)
            }
            value={formState.cuentaCosto}
            filterOptions={(options) => options}
            isOptionEqualToValue={(option, value) =>
              option?.accountName === value?.accountName
            }
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cuenta Costo"
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
        <Grid item xs={2}>
          <TextField
            label="Código Cuenta"
            value={
              formState.cuentaCosto !== null
                ? formState.cuentaCosto.accountNumber
                : ''
            }
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: formState.cuentaCosto != null ? true : false,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            label="Descripción Cuenta"
            value={
              formState.cuentaCosto !== null
                ? formState.cuentaCosto.accountDescription
                : ''
            }
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: formState.cuentaCosto != null ? true : false,
            }}
            fullWidth
          />
        </Grid>

        <Grid item xs={5}>
          <Autocomplete
            className={styles.genericFieldStyle}
            disablePortal
            options={cuentasList}
            readOnly={!createMode}
            getOptionLabel={(option) => option.accountName}
            style={{ width: '100%' }}
            onChange={(event, value) => {
              onAutocompleteChange(event, 'cuentaInventario', value);
              if (value !== null) {
                setFormState((prevState: FormState) => ({
                  ...prevState,
                  productInventoryAccount: value.accountName,
                  productInventoryAccountId: value.accountId,
                }));
              }
            }}
            onInputChange={(event, value) =>
              handleAutocompleteChange(event, value)
            }
            value={formState.cuentaInventario}
            filterOptions={(options) => options}
            isOptionEqualToValue={(option, value) =>
              option?.accountName === value?.accountName
            }
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cuenta Inventario"
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
        <Grid item xs={2}>
          <TextField
            label="Código Cuenta"
            value={
              formState.cuentaInventario !== null
                ? formState.cuentaInventario.accountNumber
                : ''
            }
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: formState.cuentaInventario != null ? true : false,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            label="Descripción Cuenta"
            value={
              formState.cuentaInventario !== null
                ? formState.cuentaInventario.accountDescription
                : ''
            }
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: formState.cuentaInventario != null ? true : false,
            }}
            fullWidth
          />
        </Grid>

        <Grid item xs={5}>
          <Autocomplete
            className={styles.genericFieldStyle}
            disablePortal
            options={cuentasList}
            readOnly={!createMode}
            getOptionLabel={(option) => option.accountName}
            style={{ width: '100%' }}
            onChange={(event, value) => {
              onAutocompleteChange(event, 'cuentaIngreso', value);
              if (value !== null) {
                setFormState((prevState: FormState) => ({
                  ...prevState,
                  productSaleAccount: value.accountName,
                  productSaleAccountId: value.accountId,
                }));
              }
            }}
            onInputChange={(event, value) =>
              handleAutocompleteChange(event, value)
            }
            value={formState.cuentaIngreso}
            filterOptions={(options) => options}
            isOptionEqualToValue={(option, value) =>
              option?.accountName === value?.accountName
            }
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cuenta Ingreso"
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
        <Grid item xs={2}>
          <TextField
            label="Código Cuenta"
            value={
              formState.cuentaIngreso !== null
                ? formState.cuentaIngreso.accountNumber
                : ''
            }
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: formState.cuentaIngreso != null ? true : false,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            label="Descripción Cuenta"
            value={
              formState.cuentaIngreso !== null
                ? formState.cuentaIngreso.accountDescription
                : ''
            }
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: formState.cuentaIngreso != null ? true : false,
            }}
            fullWidth
          />
        </Grid>
      </Grid>
    </TabPanel>
  );
};

export default FilesTab;
