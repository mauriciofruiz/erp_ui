import { MeasurementUnitsEnum, ProductRotationEnum } from '@/enums';
import { TabPanel } from '@/functions';
import { FormState, useStyles } from '@/hooks';
import { LabeledInputNumber } from '@/modules/layout';
import { RootState } from '@/store';
import { Autocomplete, Grid, TextField } from '@mui/material';
import { useSelector } from 'react-redux';

type InformacionTabProps = {
  formState: FormState;
  tabIndex: number;
  value: number;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  createMode: boolean;
  editMode: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onInputNumberChange: (value: number, field: string) => void;
};
const InformacionTab: React.FC<InformacionTabProps> = ({
  formState,
  tabIndex,
  onInputChange,
  createMode,
  editMode,
  onAutocompleteChange,
  setFormState,
  value,
  onInputNumberChange,
}) => {
  const styles = useStyles();
  const unidadMedidaList = Object.keys(MeasurementUnitsEnum)
    .filter((key): key is keyof typeof MeasurementUnitsEnum =>
      isNaN(Number(key))
    )
    .map((key) => ({ label: key, value: MeasurementUnitsEnum[key] }));

  const rotacionList = Object.keys(ProductRotationEnum)
    .filter((key): key is keyof typeof ProductRotationEnum =>
      isNaN(Number(key))
    )
    .map((key) => {
      return { label: key, value: ProductRotationEnum[key] };
    });

  const { grupos, subgrupos } = useSelector((state: RootState) => state.common);

  return (
    <TabPanel value={tabIndex} index={value}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6}>
          <LabeledInputNumber
            label="Ancho"
            inputNumberProps={{
              onChange: (value) =>
                onInputNumberChange(value as number, 'productWidth'),
              value: formState.productWidth,
              min: 0,
              defaultValue: 0,
              controls: false,
              precision: 2,
              onFocus: (e: any) => e.target.select(),
              readOnly: !createMode && !editMode,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <LabeledInputNumber
            label="Peso (Kg)"
            inputNumberProps={{
              onChange: (value) =>
                onInputNumberChange(value as number, 'productWeight'),
              value: formState.productWeight,
              min: 0,
              defaultValue: 0,
              controls: false,
              precision: 4,
              onFocus: (e: any) => e.target.select(),
              readOnly: !createMode && !editMode,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <LabeledInputNumber
            label="Largo"
            inputNumberProps={{
              onChange: (value) =>
                onInputNumberChange(value as number, 'productLarge'),
              value: formState.productLarge,
              min: 0,
              defaultValue: 0,
              controls: false,
              precision: 2,
              onFocus: (e: any) => e.target.select(),
              readOnly: !createMode && !editMode,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="productBrand"
            label="Marca"
            value={formState.productBrand}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            inputProps={{ style: { textTransform: 'uppercase' } }}
            InputLabelProps={{
              shrink:
                formState.productBrand !== '' && formState.productBrand != null
                  ? true
                  : false,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <LabeledInputNumber
            label="Espesor"
            inputNumberProps={{
              onChange: (value) =>
                onInputNumberChange(value as number, 'productThickness'),
              value: formState.productThickness,
              min: 0,
              defaultValue: 0,
              controls: false,
              precision: 2,
              onFocus: (e: any) => e.target.select(),
              readOnly: !createMode && !editMode,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="productCaracteristics"
            label="Características"
            value={formState.productCaracteristics}
            onChange={onInputChange}
            InputProps={{
              readOnly: !createMode && !editMode,
            }}
            inputProps={{ style: { textTransform: 'uppercase' } }}
            InputLabelProps={{
              shrink:
                formState.productCaracteristics !== '' &&
                formState.productCaracteristics != null
                  ? true
                  : false,
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <Autocomplete
            className={styles.genericFieldStyle}
            disablePortal
            options={unidadMedidaList}
            readOnly={!createMode && !editMode}
            getOptionLabel={(option) => option.label}
            style={{ width: '100%' }}
            onChange={(event, value) => {
              onAutocompleteChange(event, 'unidadMedida', value);
              if (value !== null) {
                setFormState((prevState: FormState) => ({
                  ...prevState,
                  productMeasurementUnitId: value.value,
                }));
              }
            }}
            value={formState.unidadMedida}
            filterOptions={(options, { inputValue }) => {
              return options.filter((option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
            isOptionEqualToValue={(option, value) =>
              option?.value === value?.value
            }
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unidad"
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
        <Grid item xs={6}>
          <Autocomplete
            className={styles.genericFieldStyle}
            disablePortal
            options={rotacionList}
            readOnly={!createMode && !editMode}
            getOptionLabel={(option) => option.label}
            style={{ width: '100%' }}
            onChange={(event, value) => {
              onAutocompleteChange(event, 'rotacion', value);
              if (value !== null) {
                setFormState((prevState: any) => ({
                  ...prevState,
                  productRotationProductId: value.value,
                }));
              }
            }}
            value={formState.rotacion}
            filterOptions={(options, { inputValue }) => {
              return options.filter((option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
            isOptionEqualToValue={(option, value) =>
              option?.value === value?.value
            }
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rotación"
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
        <Grid item xs={6}>
          <Autocomplete
            className={styles.genericFieldStyle}
            disablePortal
            options={grupos}
            readOnly={!createMode && !editMode}
            getOptionLabel={(option) => option.groupName}
            style={{ width: '100%' }}
            onChange={(event, value) => {
              onAutocompleteChange(event, 'grupo', value);
              if (value !== null) {
                setFormState((prevState: any) => ({
                  ...prevState,
                  productGroupId: value.groupId,
                }));
              }
            }}
            value={formState.grupo}
            filterOptions={(options, { inputValue }) => {
              return options.filter((option) =>
                option.groupName
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
              );
            }}
            isOptionEqualToValue={(option, value) =>
              option?.groupId === value?.groupId
            }
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Grupo"
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
        <Grid item xs={6}>
          <Autocomplete
            className={styles.genericFieldStyle}
            disablePortal
            options={subgrupos}
            readOnly={!createMode && !editMode}
            getOptionLabel={(option) => option.subgroupName}
            style={{ width: '100%' }}
            onChange={(event, value) => {
              onAutocompleteChange(event, 'subgrupo', value);
              if (value !== null) {
                setFormState((prevState: any) => ({
                  ...prevState,
                  productSubGroupId: value.subgroupId,
                }));
              }
            }}
            value={formState.subgrupo}
            filterOptions={(options, { inputValue }) => {
              if (formState.grupo && formState.grupo !== null && createMode) {
                return options.filter((option) => {
                  return (
                    option.groupId === formState.grupo.groupId &&
                    option.subgroupName
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  );
                });
              }
              return options.filter((option) =>
                option.subgroupName
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
              );
            }}
            isOptionEqualToValue={(option, value) =>
              option?.subgroupId === value?.subgroupId
            }
            noOptionsText="Sin resultados"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Subgrupo"
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
      </Grid>
    </TabPanel>
  );
};

export default InformacionTab;
