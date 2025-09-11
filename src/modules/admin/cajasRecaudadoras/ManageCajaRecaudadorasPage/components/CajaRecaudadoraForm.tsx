import { FormState, useStyles } from "@/hooks"
import { CardLayout } from "@/modules/layout"
import { AccountType, SucursalType } from "@/types"
import { ToggleOff, ToggleOn } from "@mui/icons-material"
import { Autocomplete, Box, Button, Grid, TextField, Tooltip } from "@mui/material"
import { ChangeEvent } from "react"

export type CajaRecaudadoraFormProps = {
    formState: FormState
    createMode: boolean
    editMode: boolean
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
    onInputJustNumber: (event: ChangeEvent<HTMLInputElement>) => void;
    onBooleanChangeClick: (name: string, value: boolean) => void;
    sucursales: SucursalType[]
    cuentaContPasi: AccountType | null
}

export const CajaRecaudadoraForm: React.FC<CajaRecaudadoraFormProps> = ({
    formState,
    createMode,
    editMode,
    onAutocompleteChange,
    onInputChange,
    onBooleanChangeClick,
    onInputJustNumber,
    sucursales,
    cuentaContPasi
}) => {

    const styles = useStyles();
    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <CardLayout title='Datos'>
                        <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={6}>
                                    <TextField
                                        required={true}
                                        name="cashBoxNumber"
                                        label="Número Caja"
                                        value={formState.cashBoxNumber}
                                        onChange={onInputJustNumber}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.cashBoxNumber !== '' &&
                                                    formState.cashBoxNumber != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Tooltip title="Estado Caja">
                                        <span>
                                            <Button
                                                disabled={!createMode && !editMode}
                                                startIcon={
                                                    formState.cashBoxState ? (
                                                        <ToggleOn />
                                                    ) : (
                                                        <ToggleOff />
                                                    )
                                                }
                                                onClick={() =>
                                                    onBooleanChangeClick(
                                                        'cashBoxState',
                                                        !formState.cashBoxState
                                                    )
                                                }
                                                style={{ width: '100%', height: 38 }}
                                            >
                                                {formState.cashBoxState ? 'Activa' : 'Inactiva'}
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </Grid>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        className={styles.genericFieldStyle}
                                        options={sucursales}
                                        readOnly = {!createMode}
                                        getOptionLabel={(option) => option.name}
                                        style={{ width: '100%' }}
                                        onChange={(event, value) =>
                                            onAutocompleteChange(event, 'branchId', value?.branchId)
                                        }
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
                                <Grid item xs={12}>
                                    <TextField
                                        required={true}
                                        name="cashBoxName"
                                        label="Nombre Caja"
                                        value={formState.cashBoxName}
                                        onChange={onInputChange}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.cashBoxName !== '' &&
                                                    formState.cashBoxName != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="accountId"
                                        label="Cuenta Contable"
                                        value={cuentaContPasi && cuentaContPasi != null ? `${cuentaContPasi['accountNumber']} - ${cuentaContPasi['accountDescription']}` : ''}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 500 }}
                                        InputLabelProps={{
                                            shrink:
                                                cuentaContPasi &&
                                                    cuentaContPasi != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </CardLayout>
                </Grid>
                <Grid item xs={6}>
                    <CardLayout title='Secuencias'>
                        <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12}>
                                    <TextField
                                        required={true}
                                        name="cashBoxInvoiceSeq"
                                        label="Factura"
                                        value={formState.cashBoxInvoiceSeq}
                                        onChange={onInputJustNumber}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.cashBoxInvoiceSeq !== '' &&
                                                    formState.cashBoxInvoiceSeq != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required={true}
                                        name="cashBoxRetSeq"
                                        label="Retención"
                                        value={formState.cashBoxRetSeq}
                                        onChange={onInputJustNumber}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.cashBoxRetSeq !== '' &&
                                                    formState.cashBoxRetSeq != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        required={true}
                                        name="cashBoxNcSeq"
                                        label="Nota de Crédito"
                                        value={formState.cashBoxNcSeq}
                                        onChange={onInputJustNumber}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.cashBoxNcSeq !== '' &&
                                                    formState.cashBoxNcSeq != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        required={true}
                                        name="cashBoxNdSeq"
                                        label="Nota de Débito"
                                        value={formState.cashBoxNdSeq}
                                        onChange={onInputJustNumber}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.cashBoxNdSeq !== '' &&
                                                    formState.cashBoxNdSeq != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required={true}
                                        name="cashBoxLiquidationSeq"
                                        label="Liquidación"
                                        value={formState.cashBoxLiquidationSeq}
                                        onChange={onInputJustNumber}
                                        InputProps={{
                                            readOnly: !createMode && !editMode,
                                        }}
                                        inputProps={{ style: { textTransform: 'uppercase' } }}
                                        InputLabelProps={{
                                            shrink:
                                                formState.cashBoxLiquidationSeq !== '' &&
                                                    formState.cashBoxLiquidationSeq != null
                                                    ? true
                                                    : false,
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </CardLayout>
                </Grid>
            </Grid>
        </Box>
    );
}
