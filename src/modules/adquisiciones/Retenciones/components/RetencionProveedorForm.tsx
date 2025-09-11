import { setCurrencyNumber, setDecimalPlacesString } from '@/functions';
import { FormState, StyledDatePicker, useStyles } from '@/hooks';
import { Box, Grid, TextField } from '@mui/material';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { RetencionProveedorFooter } from './RetencionProveedorFooter';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';

export type RetencionProveedorFormProps = {
  formState: FormState;
  rows: GridRowsProp;
};

export const RetencionProveedorForm: React.FC<RetencionProveedorFormProps> = ({
  formState,
  rows,
}) => {
  const styles = useStyles();

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Descripcion Impuesto',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 150,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'base',
      headerName: 'Base Imponible',
      type: 'number',
      flex: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      sortable: false,
      align: 'center',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
    {
      field: 'type',
      headerName: 'Impuesto',
      width: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'code',
      headerName: 'Código Retención',
      width: 150,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: true,
    },
    {
      field: 'percentage',
      headerName: 'Porcentaje Retención',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <strong>
            {params.row.percentage !== null
              ? `${setDecimalPlacesString(params.row.percentage, 2)} %`
              : 'No Definido'}
          </strong>
        );
      },
    },
    {
      field: 'value',
      headerName: 'Valor Retenido',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 100,
      sortable: false,
      type: 'number',
      valueFormatter: (params) => setCurrencyNumber(params.value as number),
    },
  ];

  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField
                name="providerName"
                label="Proveedor"
                value={
                  formState.providerName !== null ? formState.providerName : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink:
                    formState.providerName !== '' &&
                    formState.providerName != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="retentionNumber"
                label="Número Retención"
                value={
                  formState.retentionNumber !== null
                    ? formState.retentionNumber
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink:
                    formState.retentionNumber !== '' &&
                    formState.retentionNumber != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="invoiceNumber"
                label="Número Factura"
                value={
                  formState.invoiceNumber !== null
                    ? formState.invoiceNumber
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink:
                    formState.invoiceNumber !== '' &&
                    formState.invoiceNumber != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="autorizationNumber"
                label="Número Autorización"
                value={
                  formState.autorizationNumber !== null
                    ? formState.autorizationNumber
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink:
                    formState.autorizationNumber !== '' &&
                    formState.autorizationNumber != null
                      ? true
                      : false,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <StyledDatePicker
                label="Fecha Creación"
                minDate={formState.creationDate}
                readOnly
                format="dd/MM/yyyy"
                value={
                  formState.creationDate !== null ? formState.creationDate : ''
                }
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
          </Grid>
        </Box>
      </Box>
      <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <StyledDataGrid
            rows={rows}
            columns={columns}
            pagination
            getRowClassName={(params) =>
              params !== null ? `super-app-theme--null` : ''
            }
            getRowHeight={() => 'auto'}
            columnHeaderHeight={45}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
              footer: RetencionProveedorFooter,
            }}
            slotProps={{
              footer: { rows },
            }}
            sx={{
              height: rows.length > 0 ? 'auto' : '300px',
            }}
            localeText={{
              ...esES.components.MuiDataGrid.defaultProps.localeText,
              toolbarDensity: 'Densidad',
              toolbarFilters: 'Filtros',
              toolbarColumns: 'Columnas',
              toolbarExport: 'Exportar',
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};
