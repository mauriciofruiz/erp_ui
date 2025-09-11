import {
  CuentaContableEnum,
  EstadoEgresoEnum,
  SucursalEnum,
  TipoEgresoEnum,
} from '@/enums';
import { FormState, useStyles } from '@/hooks';
import { StyledTooltip } from '@/hooks/useStyleDataGrid';
import {
  AccountEgresoType,
  ContenedorEgresoType,
  ImportacionesEgresoType,
  UserLoginType,
} from '@/types';
import { Add } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import {
  GridCellParams,
  GridEditInputCell,
  GridEditSingleSelectCell,
  GridRowId,
  GridToolbarContainer,
  GridValidRowModel,
} from '@mui/x-data-grid';
import {
  GridRenderEditCellParams,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { InputNumber } from 'antd';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useRef } from 'react';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  createMode: boolean;
  editMode: boolean;
  accountsList: AccountEgresoType[];
  user: UserLoginType;
  formState: FormState;
}

const findInitialAccountId = (
  accountsList: AccountEgresoType[],
  user: UserLoginType
) => {
  const hasItems = Array.isArray(accountsList) && accountsList.length > 0;
  if (!hasItems) return null;
  if (user.branchId === SucursalEnum.MATRIZ) {
    return accountsList.find(
      (cuenta) =>
        cuenta.accountNumber === CuentaContableEnum.CAJA_CHICA_OFICINA_MATRIZ
    )?.accountId;
  } else if (user.branchId === SucursalEnum.YAGUACHI) {
    return accountsList.find(
      (cuenta) =>
        cuenta.accountNumber === CuentaContableEnum.CAJA_CHICA_YAGUACHI
    )?.accountId;
  }
  return accountsList.find(
    (cuenta) =>
      cuenta.accountNumber === CuentaContableEnum.CAJA_CHICA_SUCURSALES
  )?.accountId;
};

export function EditToolbar(props: EditToolbarProps) {
  const { setRows, createMode, editMode, accountsList, user, formState } =
    props;
  const handleClick = () => {
    if (formState.availableValue <= 0) return;
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        accountId: findInitialAccountId(accountsList, user),
        amount: 0,
        cashId: null,
        cashOutflowId: null,
        closingCashId: null,
        description: '',
        entryId: null,
        issueDate: new Date(),
        outflowStatusId: EstadoEgresoEnum.GENERADO,
        outflowTypeId: TipoEgresoEnum.REPOS_CAJA_CHICA,
        packingListId: null,
        containerNumber: null,
      },
    ]);
  };

  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <Button
        color="primary"
        startIcon={<Add />}
        onClick={handleClick}
        disabled={!createMode && !editMode}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1 }}
      >
        Agregar Egreso
      </Button>
    </GridToolbarContainer>
  );
}

export function CustomSelectCellEditor({
  params,
  accountsList,
  user,
  rows,
  setRows,
}: {
  params: GridRenderEditCellParams;
  accountsList: AccountEgresoType[];
  user: UserLoginType | null;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
}) {
  const apiRef = useGridApiContext();
  const { id, field, value } = params;

  const handleChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      if (!event.target.value) return;
      if (!user) return;

      apiRef.current.setEditCellValue({
        id,
        field,
        value: event.target.value,
      });

      const accountId =
        event.target.value === TipoEgresoEnum.REPOS_CAJA_CHICA
          ? findInitialAccountId(accountsList, user)
          : event.target.value === TipoEgresoEnum.ANTICIPO_ESTIBAJE_CONTENEDOR
          ? accountsList.find(
              (cuenta) => cuenta.outflowTypeId === event.target.value
            )?.accountId
          : accountsList.find(
              (cuenta) =>
                cuenta.accountNumber ===
                CuentaContableEnum.ANTICIPOS_POR_LIQUIDAR
            )?.accountId;

      apiRef.current.setEditCellValue({
        id,
        field: 'accountId',
        value: accountId,
      });

      const rowIndex = rows.findIndex(
        (row: GridValidRowModel) => row.id === params.id
      );

      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          accountId,
        };
        setRows(newRows);
      }
    },
    [accountsList, apiRef, field, id, user]
  );

  const getValue = useCallback(() => {
    if (value) return value;
    return null;
  }, [value]);

  return (
    <GridEditSingleSelectCell
      {...params}
      value={getValue()}
      onChange={handleChange}
    />
  );
}

export function CustomInputQuantityCellEdit(props: {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  formState: FormState;
  error: any;
}) {
  const { params, formState, rows, error } = props;
  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const row = rows.find((row) => row.id === id);
    if (row === undefined) return;

    if (row) {
      let returnQuantity = value;
      const availableValue = formState.availableValue;
      if (returnQuantity > availableValue) {
        enqueueSnackbar(`El valor supera el monto disponible de efectivo`, {
          variant: 'warning',
        });
        returnQuantity = availableValue;
      } else if (returnQuantity <= 0) {
        enqueueSnackbar(`El valor ingresado debe ser mayor a 0`, {
          variant: 'warning',
        });
        returnQuantity = 1;
      }
      apiRef.current.setEditCellValue({
        id: id,
        field: params.field,
        value: returnQuantity,
      });
    }
  };

  return (
    <StyledTooltip open={!!error} title={error} placement="bottom">
      <InputNumber
        ref={reference}
        min={0}
        value={params.value !== null ? params.value : 0}
        onChange={(value) => onQuantityChange(value, params.id)}
        size="small"
        variant="borderless"
        controls={false}
        className="mi-input-number"
        precision={2}
        onFocus={(e) => e.target.select()}
      />
    </StyledTooltip>
  );
}

export function CustomInputCellEditor(params: GridRenderEditCellParams) {
  const apiRef = useGridApiContext();

  const getValue = useCallback(() => {
    if (params.value) return params.value;
    return null;
  }, [params.value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.toUpperCase();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue,
    });
  };

  return (
    <GridEditInputCell
      {...params}
      onChange={handleChange}
      value={getValue()}
      style={{ color: 'white' }}
    />
  );
}

export function CustomImportationCellEditor({
  params,
}: {
  params: GridRenderEditCellParams;
}) {
  const apiRef = useGridApiContext();
  const { id, field, value } = params;

  const handleChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      if (!event.target.value) return;

      apiRef.current.setEditCellValue({
        id,
        field,
        value: event.target.value,
      });
    },
    [apiRef, field, id]
  );

  const getValue = useCallback(() => {
    if (value) return value;
    return null;
  }, [value]);

  return (
    <GridEditSingleSelectCell
      {...params}
      value={getValue()}
      onChange={handleChange}
    />
  );
}

export function CustomContainerCell({
  params,
  importacionesList,
}: {
  params: GridRenderEditCellParams;
  importacionesList: ImportacionesEgresoType[];
}) {
  const styles = useStyles();

  const apiRef = useGridApiContext();

  const reference = useRef<HTMLElement>(null);

  const listMemo: ContenedorEgresoType[] = useMemo(() => {
    const importacionSelected: ImportacionesEgresoType =
      importacionesList.find(
        (importacion) => importacion.packingListId === params.row.packingListId
      ) ?? importacionesList[0];

    return importacionSelected.containersList ?? [];
  }, [importacionesList]);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: ContenedorEgresoType | null
  ) => {
    if (!value) return;
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: value.containerNumber,
    });
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);
  return (
    <Autocomplete
      ref={reference}
      value={
        getValue() != null
          ? listMemo.find((b) => b.containerNumber === params.value)
          : null
      }
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.containerName.toUpperCase().includes(inputValue.toUpperCase())
        );
      }}
      fullWidth
      options={listMemo}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      getOptionLabel={(option) => option.containerName ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) =>
        option.containerNumber === value.containerNumber
      }
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              className: styles?.textBlackStyle,
            }}
          />
        );
      }}
    />
  );
}

export const isCellEditable = (params: GridCellParams, rows: GridRowsProp) => {
  const currentRow = rows.find((row) => row.id === params.id);
  if (!currentRow) return false;

  const { outflowTypeId, outflowStatusId } = currentRow;
  const isConfirmedOrAnulated = [
    EstadoEgresoEnum.CONFIRMADO,
    EstadoEgresoEnum.ANULADO,
  ].includes(outflowStatusId);

  if (isConfirmedOrAnulated) return false;

  switch (params.field) {
    case 'packingListId':
    case 'containerNumber':
      return outflowTypeId === TipoEgresoEnum.ANTICIPO_ESTIBAJE_CONTENEDOR;
    default:
      return params.colDef.editable ?? true;
  }
};
