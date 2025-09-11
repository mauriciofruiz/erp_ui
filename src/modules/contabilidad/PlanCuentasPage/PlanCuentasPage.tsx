'use client';
import { getCuentaById } from '@/backend/contabilidad';
import { AccountTypeEnum, FinancialIndexEnum } from '@/enums';
import { getStartDateSystem } from '@/functions';
import { StyledDatePicker, useAccountAsync, useForm, useStyles } from '@/hooks';
import { CardLayout } from '@/modules/layout';
import { ServerResponseType } from '@/store';
import { AccountTreeNodeType, AccountType } from '@/types';
import { Add } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  SvgIcon,
  SvgIconProps,
  Switch,
  TextField,
} from '@mui/material';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import { parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';

type PlanCuentasPageProps = {
  // types...
};

export const PlanCuentasPage: React.FC<PlanCuentasPageProps> = ({}) => {
  const styles = useStyles();

  const [planCuentas, setPlanCuentas] = useState<AccountTreeNodeType>();

  const [selectedCuenta, setSelectedCuenta] = useState<AccountType>();

  const { fetchPlanCuentas } = useAccountAsync();

  const {
    onAutocompleteChange,
    onInputChange,
    onDateChange,
    onBooleanChange,
    formState,
    onBooleanChangeClick,
    setFormState,
  } = useForm({
    user: null,
    financialIndex: null,
    accountType: null,
    accountNumber: '',
    parentAccountNumber: '',
    accountName: '',
    accountDescription: '',
    initialBalance: 0,
    balance: 0,
    manual: false,
    automatic: false,
    isLabor: false,
    hasFixedAsset: false,
    requiresProject: false,
    requiresEmployee: false,
    requiresDepartment: false,
    requiresImportation: false,
    requiresBranch: false,
    requiresInventory: false,
    requiresClient: false,
    requiresSupplier: false,
    requiresCash: false,
    creationDate: new Date(),
    modificationDate: null,
    accountStatus: false,
  });

  const accountTypes = Object.keys(AccountTypeEnum)
    .filter((key): key is keyof typeof AccountTypeEnum => isNaN(Number(key)))
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, value: AccountTypeEnum[key] };
    });

  const financialIndexes = Object.keys(FinancialIndexEnum)
    .filter((key): key is keyof typeof FinancialIndexEnum => isNaN(Number(key)))
    .map((key) => {
      const label = key.replace(/_/g, ' ');
      return { label: label, value: FinancialIndexEnum[key] };
    });

  const [createMode, setCreateMode] = useState(false);

  useEffect(() => {
    const getPlanCuentas = async () => {
      fetchPlanCuentas().then((response) => {
        if (response) {
          setPlanCuentas(response);
        }
      });
    };
    getPlanCuentas();
  }, []);

  const renderTree = (nodes: AccountTreeNodeType) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.accountNumber}
      label={`${nodes.accountNumber} ---> ${nodes.name}`}
      onClick={() => setAccount(nodes)}
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  const setAccount = (node: AccountTreeNodeType) => {
    const fetchCuenta = async () => {
      const response: ServerResponseType | undefined = await getCuentaById(
        node.id
      );

      if (response) {
        if (response.status === 200) {
          setSelectedCuenta(response.message);
        } else {
          setSelectedCuenta(undefined);
        }
      }
    };
    fetchCuenta();
  };

  function FolderIcon(props: SvgIconProps) {
    return (
      <SvgIcon fontSize="inherit" style={{ width: 22, height: 22 }} {...props}>
        {/* tslint:disable-next-line: max-line-length */}
        <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z" />
      </SvgIcon>
    );
  }

  function OpenFolderIcon(props: SvgIconProps) {
    return (
      <SvgIcon fontSize="inherit" style={{ width: 22, height: 22 }} {...props}>
        <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z" />
      </SvgIcon>
    );
  }

  function FileIcon(props: SvgIconProps) {
    return (
      <SvgIcon fontSize="inherit" style={{ width: 22, height: 22 }} {...props}>
        <path d="M6.646 5.646a.5.5 0 1 1 .708.708L5.707 8l1.647 1.646a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2zm2.708 0a.5.5 0 1 0-.708.708L10.293 8 8.646 9.646a.5.5 0 0 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2z" />
        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" />
      </SvgIcon>
    );
  }

  useEffect(() => {
    if (selectedCuenta) {
      setFormState({
        ...selectedCuenta,
        user: {
          userId: selectedCuenta.userId,
          nick: selectedCuenta.userName,
        },
        financialIndex: {
          value: selectedCuenta.financialIndexId,
          label: selectedCuenta.financialIndexName,
        },
        accountType: {
          value: selectedCuenta.accountTypeId,
          label: selectedCuenta.accountTypeName,
        },
        creationDate: parseISO(selectedCuenta.creationDate.toString()),
        modificationDate:
          selectedCuenta.modificationDate !== null
            ? parseISO(selectedCuenta.modificationDate.toString())
            : null,
      });
    }
  }, [selectedCuenta]);

  return (
    <>
      <CardLayout
        title={'PLAN DE CUENTAS'}
        createMode={false}
        cancelFunction={() => {}}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ minHeight: 110, flexGrow: 1, maxWidth: 500 }}>
              {planCuentas && (
                <TreeView
                  aria-label="rich object"
                  defaultCollapseIcon={<OpenFolderIcon />}
                  defaultExpanded={['root']}
                  defaultExpandIcon={<FolderIcon />}
                  defaultEndIcon={<FileIcon />}
                >
                  {renderTree(planCuentas)}
                </TreeView>
              )}
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Autocomplete
                  id="autocomplete-financial"
                  className={styles.genericFieldStyle}
                  disablePortal
                  options={financialIndexes}
                  readOnly={!createMode}
                  getOptionLabel={(option) => option.label}
                  style={{ width: '100%' }}
                  onChange={(event, value) =>
                    onAutocompleteChange(event, 'financialIndex', value)
                  }
                  value={formState.financialIndex}
                  filterOptions={(options, { inputValue }) => {
                    return options.filter((option) =>
                      option.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option?.value === value?.value
                  }
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Estado Financiero"
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
                  id="autocomplete-type"
                  className={styles.genericFieldStyle}
                  disablePortal
                  options={accountTypes}
                  readOnly={!createMode}
                  getOptionLabel={(option) => option.label}
                  style={{ width: '100%' }}
                  onChange={(event, value) =>
                    onAutocompleteChange(event, 'accountType', value)
                  }
                  value={formState.accountType}
                  filterOptions={(options, { inputValue }) => {
                    return options.filter((option) =>
                      option.label
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option?.value === value?.value
                  }
                  noOptionsText="Sin resultados"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo De Cuenta"
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
                <TextField
                  name="parentAccountNumber"
                  label="Número De Cuenta Padre"
                  value={formState.parentAccountNumber}
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode,
                  }}
                  InputLabelProps={{
                    shrink:
                      formState.parentAccountNumber !== '' &&
                      formState.parentAccountNumber != null
                        ? true
                        : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="accountNumber"
                  label="Número De Cuenta"
                  value={formState.accountNumber}
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode,
                  }}
                  InputLabelProps={{
                    shrink: formState.accountNumber != '' ? true : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="accountName"
                  label="Nombre De Cuenta"
                  value={formState.accountName}
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode,
                  }}
                  InputLabelProps={{
                    shrink: formState.accountName != '' ? true : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="accountDescription"
                  label="Descripción De Cuenta"
                  value={formState.accountDescription}
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode,
                  }}
                  InputLabelProps={{
                    shrink: formState.accountDescription != '' ? true : false,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="initialBalance"
                  label="Balance Inicial"
                  value={formState.initialBalance}
                  type="number"
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="balance"
                  label="Balance"
                  value={formState.balance}
                  type="number"
                  onChange={onInputChange}
                  InputProps={{
                    readOnly: !createMode,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <StyledDatePicker
                  label="Fecha Creación"
                  views={['year', 'month', 'day']}
                  minDate={getStartDateSystem()}
                  maxDate={new Date()}
                  format="dd/MM/yyyy"
                  value={formState.creationDate}
                  readOnly={!createMode}
                  onChange={(value) =>
                    onDateChange(value as Date, 'creationDate')
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
                        shrink: formState.creationDate ? true : false,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <StyledDatePicker
                  label="Fecha Modificación"
                  views={['year', 'month', 'day']}
                  minDate={getStartDateSystem()}
                  maxDate={new Date()}
                  format="dd/MM/yyyy"
                  value={formState.modificationDate}
                  readOnly={!createMode}
                  onChange={(value) =>
                    onDateChange(value as Date, 'modificationDate')
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
                        shrink: formState.modificationDate ? true : false,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Usuario"
                  value={formState.user?.nick}
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <Chip
                  label={formState.accountStatus ? 'ACTIVA' : 'INACTIVA'}
                  color="primary"
                  style={{ width: '100%' }}
                  disabled={!createMode}
                  onClick={() =>
                    onBooleanChangeClick(
                      'accountStatus',
                      !formState.accountStatus
                    )
                  }
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} alignItems="center">
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
                      disabled={!createMode}
                      checked={formState.manual}
                      onChange={(event) => onBooleanChange(event, 'manual')}
                    />
                  }
                  label="Es Manual"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.automatic}
                      onChange={(event) => onBooleanChange(event, 'automatic')}
                    />
                  }
                  label="Es Automática"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.isLabor}
                      onChange={(event) => onBooleanChange(event, 'isLabor')}
                    />
                  }
                  label="Es M. Obra"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.hasFixedAsset}
                      onChange={(event) =>
                        onBooleanChange(event, 'hasFixedAsset')
                      }
                    />
                  }
                  label="Tiene Activo"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.requiresProject}
                      onChange={(event) =>
                        onBooleanChange(event, 'requiresProject')
                      }
                    />
                  }
                  label="Proyecto"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.requiresEmployee}
                      onChange={(event) =>
                        onBooleanChange(event, 'requiresEmployee')
                      }
                    />
                  }
                  label="Empleado"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.requiresDepartment}
                      onChange={(event) =>
                        onBooleanChange(event, 'requiresDepartment')
                      }
                    />
                  }
                  label="Departamento"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.requiresImportation}
                      onChange={(event) =>
                        onBooleanChange(event, 'requiresImportation')
                      }
                    />
                  }
                  label="Importación"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.requiresBranch}
                      onChange={(event) =>
                        onBooleanChange(event, 'requiresBranch')
                      }
                    />
                  }
                  label="Sucursal"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.requiresInventory}
                      onChange={(event) =>
                        onBooleanChange(event, 'requiresInventory')
                      }
                    />
                  }
                  label="Inventario"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.requiresClient}
                      onChange={(event) =>
                        onBooleanChange(event, 'requiresClient')
                      }
                    />
                  }
                  label="Cliente"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.requiresSupplier}
                      onChange={(event) =>
                        onBooleanChange(event, 'requiresSupplier')
                      }
                    />
                  }
                  label="Proveedor"
                  style={{ width: '100%' }}
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
                      disabled={!createMode}
                      checked={formState.requiresCash}
                      onChange={(event) =>
                        onBooleanChange(event, 'requiresCash')
                      }
                    />
                  }
                  label="Caja"
                  style={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={8}></Grid>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              {selectedCuenta && (
                <Button
                  startIcon={<Add />}
                  sx={{ margin: 2 }}
                  onClick={() => setCreateMode(true)}
                  style={{ width: '200px' }}
                >
                  {'Agregar Cuenta Hija'}
                </Button>
              )}
            </Grid>
          </Grid>
        </Grid>
      </CardLayout>
    </>
  );
};
