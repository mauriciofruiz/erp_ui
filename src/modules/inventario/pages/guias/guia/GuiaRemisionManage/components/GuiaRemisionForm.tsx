import { EstadoEntregaEnum } from '@/enums';
import { FormState, StyledDatePicker, useAllowGlobal } from '@/hooks';
import { RootState } from '@/store';
import { Autocomplete, Chip, Grid, TextField } from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import { parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import { AccordionDocRelacionados } from './AccordionDocRelacionados';
import { RelatedDocumentsGuiaType } from '@/types';

type GuiaRemisionFormProps = {
  formState: FormState;
  styles: ClassNameMap;
  createMode: boolean;
  editMode: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onGenericChange: (value: any, field: string) => void;
  setSelectedDocument: React.Dispatch<
    React.SetStateAction<RelatedDocumentsGuiaType | null>
  >;
};

interface GuiaTypeOption {
  label: string;
  value: boolean;
}
export const GuiaRemisionForm: React.FC<GuiaRemisionFormProps> = ({
  formState,
  styles,
  createMode,
  editMode,
  onAutocompleteChange,
  onGenericChange,
  setSelectedDocument,
}) => {
  const guiaTypeList: GuiaTypeOption[] = [
    { label: 'TRANSFERENCIA', value: true },
    { label: 'FACTURA', value: false },
  ];

  const { sucursales } = useSelector((state: RootState) => state.common);

  const { enabledBranchs } = useAllowGlobal();

  return (
    <>
      <Grid item xs={4}>
        <Autocomplete
          className={styles.genericFieldStyle}
          disablePortal
          autoSelect
          options={guiaTypeList}
          readOnly={!createMode}
          getOptionLabel={(option) => option.label}
          style={{ width: '100%' }}
          onChange={(event, option) =>
            onAutocompleteChange(event, 'isTransfer', option?.value)
          }
          value={
            guiaTypeList.find(
              (option) => option.value === formState.isTransfer
            ) || null
          }
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          noOptionsText="Sin resultados"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tipo"
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
      {createMode && (
        <>
          <Grid item xs={2}>
            <StyledDatePicker
              label="Fecha Inicio"
              views={['year', 'month', 'day']}
              format="dd/MM/yyyy"
              value={
                typeof formState.startDate === 'string'
                  ? parseISO(formState.startDate)
                  : formState.startDate
              }
              onChange={(value) =>
                onGenericChange((value as Date).toISOString(), 'startDate')
              }
              readOnly={!createMode && !editMode}
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
          <Grid item xs={2}>
            <StyledDatePicker
              label="Fecha Fin"
              views={['year', 'month', 'day']}
              format="dd/MM/yyyy"
              value={
                typeof formState.endDate === 'string'
                  ? parseISO(formState.endDate)
                  : formState.endDate
              }
              onChange={(value) =>
                onGenericChange((value as Date).toISOString(), 'endDate')
              }
              readOnly={!createMode && !editMode}
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
          <Grid item xs={4} />
        </>
      )}
      {!createMode && (
        <>
          <Grid item xs={4}>
            <TextField
              name="clientName"
              label="Cliente"
              value={formState.clientName}
              InputProps={{
                readOnly: true,
              }}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputLabelProps={{
                shrink:
                  formState.clientName !== '' && formState.clientName != null
                    ? true
                    : false,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={4} />
        </>
      )}
      <Grid item xs={4}>
        <Autocomplete
          className={styles.genericFieldStyle}
          options={sucursales}
          getOptionLabel={(option) => option.name}
          style={{ width: '100%' }}
          onChange={(event, value) =>
            onAutocompleteChange(event, 'branchId', value?.branchId)
          }
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.name.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          value={
            (formState.branchId !== null
              ? sucursales.find(
                  (sucursal) => sucursal.branchId === formState.branchId
                )
              : null) || null
          }
          isOptionEqualToValue={(option, value) =>
            option.branchId === value.branchId
          }
          noOptionsText="Sin resultados"
          readOnly={!(createMode || editMode) || !enabledBranchs()}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sucursal"
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
        <StyledDatePicker
          label="Fecha Emisión"
          views={['year', 'month', 'day']}
          format="dd/MM/yyyy"
          value={
            typeof formState.issueDate === 'string'
              ? parseISO(formState.issueDate)
              : formState.issueDate
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
      <Grid item xs={4}>
        <Chip
          label={
            formState.deliveryStateId === EstadoEntregaEnum.DEPACHO_TOTAL
              ? 'DESPACHO TOTAL'
              : 'DESPACHO PARCIAL'
          }
          color="primary"
          style={{ width: '100%' }}
        />
      </Grid>
      {createMode && (
        <Grid item xs={12} sx={{ mt: 2 }}>
          <AccordionDocRelacionados
            styles={styles}
            formState={formState}
            createMode={createMode}
            setSelectedDocument={setSelectedDocument}
          />
        </Grid>
      )}
    </>
  );
};
