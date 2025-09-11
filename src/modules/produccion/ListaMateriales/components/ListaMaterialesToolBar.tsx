import {
  getCostosIndirectos,
  getManoObra,
  getProductsReceta,
} from '@/backend/inventario/recetaServices';
import {
  AutocompleteEditInputCellProps,
  allowDecimalsMeaseurementUnit,
} from '@/functions';
import { useStyles } from '@/hooks';
import { ServerResponseType } from '@/store';
import {
  ProductoByBodegaType,
  ProductoRecetaType,
  SucursalType,
} from '@/types';
import { CostosIndirectosType } from '@/types/inventario/costosIndirectos.type';
import { ManoObraType } from '@/types/inventario/manoObra.type';
import { Add } from '@mui/icons-material';
import { Autocomplete, Button, Popper, TextField } from '@mui/material';
import {
  GridRenderEditCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarContainer,
  useGridApiContext,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { InputNumber } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  createMode: boolean;
  editMode: boolean;
  sucursalUser: SucursalType;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  rows: GridRowsProp;
  setMateriales: React.Dispatch<React.SetStateAction<ProductoRecetaType[]>>;
  renderAlertMinMax: (product: ProductoRecetaType) => void;
  setManoObra: React.Dispatch<React.SetStateAction<ManoObraType[]>>;
  setCostosIndirectos: React.Dispatch<
    React.SetStateAction<CostosIndirectosType[]>
  >;
}

export function EditToolbar(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    createMode,
    editMode,
    addButtonRef,
    // rows,
    // setMateriales,
    //renderAlertMinMax,
  } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        productId: null,
        labourId: null,
        cifId: null,
        costTypeId: null,
        productCode: '',
        productName: '',
        measurementUnitName: '',
        measurementUnitId: '',
        quantity: 0,
        currentAverageCost: '',
        totalCost: 0,
        recipeCode: '',
        stateRecipe: true,
      },
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' },
    }));
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
        id="addButonProduct"
        ref={addButtonRef}
        color="primary"
        startIcon={<Add />}
        onClick={handleClick}
        disabled={!createMode && !editMode}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1 }}
      >
        Agregar Item
      </Button>
    </GridToolbarContainer>
  );
}

export function InputChangeDataGrid(props: {
  materiales: ProductoRecetaType[];
  rowsMateriaPrima: GridRowsProp;
  params: GridRenderEditCellParams;
  setRowsMateriaPrima: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const apiRef = useGridApiContext();
  const reference = React.useRef<HTMLInputElement>(null);
  const [decimal, setDecimal] = useState<number | undefined>();

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  useEffect(() => {
    const fieldName = props.params.field;
    if (fieldName === 'quantity') {
      if (props.params.row.measurementUnitId !== '') {
        if (allowDecimalsMeaseurementUnit(props.params.row.measurementUnitId)) {
          setDecimal(6);
        } else {
          setDecimal(0);
        }
      }
    } else if (fieldName === 'currentAverageCost') {
      setDecimal(6);
    }
  }, [props.params]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRowsMateriaPrima: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    let inputValue = value;
    let inputValueAsString = inputValue.toString();
    const unidad = /^[0-9\s]*$/;
    const row = props.rowsMateriaPrima.find((row) => row.id === id);
    if (row) {
      const product = props.materiales.find(
        (item) => item.productCode === row.productCode
      );

      if (product) {
        let newQuantity = row.quantity;
        let newcurretCost = row.currentAverageCost;
        value = value === 0 ? 1 : value;
        const fieldName = props.params.field;
        if (fieldName === 'quantity') {
          if (allowDecimalsMeaseurementUnit(product.measurementUnitId)) {
            newQuantity = inputValue <= 0 ? 0 : inputValue;
            setDecimal(6);
            apiRef.current.setEditCellValue({
              id: id,
              field: 'quantity',
              value: inputValue,
            });
          } else {
            if (unidad.test(inputValueAsString)) {
              newQuantity = parseInt(inputValue.toString(), 10);
              inputValue = newQuantity;
              setDecimal(0);
              apiRef.current.setEditCellValue({
                id: id,
                field: 'quantity',
                value: inputValue,
              });
            }
          }
        } else if (fieldName === 'currentAverageCost') {
          newcurretCost = inputValue <= 0 ? 0 : inputValue;
          apiRef.current.setEditCellValue({
            id: id,
            field: 'currentAverageCost',
            value: inputValue,
          });
          setDecimal(6);
        }

        const updateTotalCost = (newQuantity * newcurretCost).toFixed(2);
        apiRef.current.setEditCellValue({
          id: id,
          field: 'totalCost',
          value: updateTotalCost,
        });

        const rowIndex = props.rowsMateriaPrima.findIndex(
          (rowProp) => rowProp.id === id
        );

        const newRows = [...props.rowsMateriaPrima];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          quantity: newQuantity,
          currentAverageCost: newcurretCost,
          totalCost: updateTotalCost,
        };
        setRowsMateriaPrima(newRows);
      }
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRowsMateriaPrima)
      }
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={decimal}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function EditToolbarManoObra(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    createMode,
    editMode,
    addButtonRef,
    // rows,
    // setManoObra,
    //renderAlertMinMax,
  } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        productId: null,
        cifId: null,
        costTypeId: null,
        labourId: null,
        labourCode: '',
        labourName: '',
        unitMeasureId: '',
        quantity: 0,
        unitCostLabour: '',
        totalCost: 0,
        recipeCode: '',
        stateRecipe: true,
      },
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' },
    }));
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
        id="addButonProduct"
        ref={addButtonRef}
        color="primary"
        startIcon={<Add />}
        onClick={handleClick}
        disabled={!createMode && !editMode}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1 }}
      >
        Agregar Item
      </Button>
    </GridToolbarContainer>
  );
}

export function InputChangeDataGridObra(props: {
  manoObra: ManoObraType[];
  rowsObra: GridRowsProp;
  params: GridRenderEditCellParams;
  setRowsObra: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const apiRef = useGridApiContext();
  const reference = React.useRef<HTMLInputElement>(null);
  const [decimal, setDecimal] = useState<number | undefined>();

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  useEffect(() => {
    const fieldName = props.params.field;
    if (fieldName === 'quantity') {
      if (props.params.row.unitMeasureId !== '') {
        if (allowDecimalsMeaseurementUnit(props.params.row.unitMeasureId)) {
          setDecimal(6);
        } else {
          setDecimal(0);
        }
      }
    } else if (fieldName === 'unitCostLabour') {
      setDecimal(6);
    }
  }, [props.params]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRowsObra: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    let inputValue = value;
    let inputValueAsString = inputValue.toString();
    const unidad = /^[0-9\s]*$/;

    const row = props.rowsObra.find((row) => row.id === id);
    if (row) {
      const product = props.manoObra.find(
        (item) => item.labourCode === row.labourCode
      );

      if (product) {
        let newQuantity = row.quantity;
        let newcurretCost = row.unitCostLabour;
        value = value === 0 ? 1 : value;
        const fieldName = props.params.field;
        if (fieldName === 'quantity') {
          if (allowDecimalsMeaseurementUnit(product.unitMeasureId)) {
            newQuantity = inputValue <= 0 ? 0 : inputValue;
            setDecimal(6);
            apiRef.current.setEditCellValue({
              id: id,
              field: 'quantity',
              value: inputValue,
            });
          } else {
            if (unidad.test(inputValueAsString)) {
              newQuantity = parseInt(inputValue.toString(), 10);
              inputValue = newQuantity;
              setDecimal(0);
              apiRef.current.setEditCellValue({
                id: id,
                field: 'quantity',
                value: inputValue,
              });
            }
          }
        } else if (fieldName === 'unitCostLabour') {
          newcurretCost = inputValue <= 0 ? 0 : inputValue;
          apiRef.current.setEditCellValue({
            id: id,
            field: 'unitCostLabour',
            value: inputValue,
          });
          setDecimal(6);
        }

        const updateTotalCost = (newQuantity * newcurretCost).toFixed(2);
        apiRef.current.setEditCellValue({
          id: id,
          field: 'totalCost',
          value: updateTotalCost,
        });

        const rowIndex = props.rowsObra.findIndex(
          (rowProp) => rowProp.id === id
        );

        const newRows = [...props.rowsObra];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          quantity: newQuantity,
          totalCost: updateTotalCost,
        };
        setRowsObra(newRows);
      }
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRowsObra)
      }
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={decimal}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function EditToolbarCostos(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    createMode,
    editMode,
    addButtonRef,
    // rows,
    // setCostosIndirectos,
  } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        productId: null,
        labourId: null,
        costTypeId: null,
        cifId: null,
        cifCode: '',
        cifName: '',
        unitMeasureId: '',
        quantity: 0,
        unitCostCif: '',
        totalCost: 0,
        recipeCode: '',
        stateRecipe: true,
      },
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' },
    }));
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
        id="addButonProduct"
        ref={addButtonRef}
        color="primary"
        startIcon={<Add />}
        onClick={handleClick}
        disabled={!createMode && !editMode}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1 }}
      >
        Agregar Item
      </Button>
    </GridToolbarContainer>
  );
}

export function InputChangeDataGridCostos(props: {
  costosIndirectos: CostosIndirectosType[];
  rowsCostos: GridRowsProp;
  params: GridRenderEditCellParams;
  setRowsCostos: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  renderAlertMinMax: (product: ProductoByBodegaType) => void;
}) {
  const apiRef = useGridApiContext();
  const reference = React.useRef<HTMLInputElement>(null);
  const [decimal, setDecimal] = useState<number | undefined>();

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  useEffect(() => {
    const fieldName = props.params.field;
    if (fieldName === 'quantity') {
      if (props.params.row.unitMeasureId !== '') {
        if (allowDecimalsMeaseurementUnit(props.params.row.unitMeasureId)) {
          setDecimal(6);
        } else {
          setDecimal(0);
        }
      }
    } else if (fieldName === 'unitCostCif') {
      setDecimal(6);
    }
  }, [props.params]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRowsCostos: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    let inputValue = value;
    let inputValueAsString = inputValue.toString();
    const unidad = /^[0-9\s]*$/;
    const row = props.rowsCostos.find((row) => row.id === id);
    if (row) {
      const product = props.costosIndirectos.find(
        (item) => item.cifCode === row.cifCode
      );

      if (product) {
        let newQuantity = row.quantity;
        let newcurretCost = row.unitCostCif;
        value = value === 0 ? 1 : value;
        const fieldName = props.params.field;
        if (fieldName === 'quantity') {
          if (allowDecimalsMeaseurementUnit(product.unitMeasureId)) {
            newQuantity = inputValue <= 0 ? 0 : inputValue;
            setDecimal(6);
            apiRef.current.setEditCellValue({
              id: id,
              field: 'quantity',
              value: inputValue,
            });
          } else {
            if (unidad.test(inputValueAsString)) {
              newQuantity = parseInt(inputValue.toString(), 10);
              inputValue = newQuantity;
              setDecimal(0);
              apiRef.current.setEditCellValue({
                id: id,
                field: 'quantity',
                value: inputValue,
              });
            }
          }
        } else if (fieldName === 'unitCostCif') {
          newcurretCost = inputValue <= 0 ? 0 : inputValue;
          apiRef.current.setEditCellValue({
            id: id,
            field: 'unitCostCif',
            value: inputValue,
          });
          setDecimal(6);
        }

        const updateTotalCost = (newQuantity * newcurretCost).toFixed(2);
        apiRef.current.setEditCellValue({
          id: id,
          field: 'totalCost',
          value: updateTotalCost,
        });

        const rowIndex = props.rowsCostos.findIndex(
          (rowProp) => rowProp.id === id
        );

        const newRows = [...props.rowsCostos];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          quantity: newQuantity,
          totalCost: updateTotalCost,
        };
        setRowsCostos(newRows);
      }
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRowsCostos)
      }
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={decimal}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function AutocompleteEditLM(props: AutocompleteEditInputCellProps) {
  const {
    params,
    options,
    onAutocompleteChange,
    firstFieldFocus,
    setInputValue,
  } = props;
  const apiRef = useGridApiContext();
  const styles = useStyles();

  const handleChange = useCallback(
    async (event: React.SyntheticEvent<Element, Event>, newValue: any) => {
      event.stopPropagation();
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: newValue.split(' - ')[1],
      });
      apiRef.current.setEditCellValue({
        id: params.id,
        field: 'quantity',
        value: 1,
      });
      if (params.field === 'productCode') {
        const fetchProductoByBodega = async () => {
          const response: ServerResponseType | undefined =
            await getProductsReceta(
              newValue.split(' - ')[1],
              null,
              null,
              true,
              null,
              null
            );
          if (response) {
            if (response.status === 200) {
              const producto: ProductoRecetaType[] = response.message;
              if (producto) {
                apiRef.current.setEditCellValue({
                  id: params.id,
                  field: 'currentAverageCost',
                  value: producto[0].currentAverageCost,
                });
              }
            }
          }
        };
        fetchProductoByBodega();
      } else if (params.field === 'labourCode') {
        const fetchManoObra = async () => {
          const response: ServerResponseType | undefined = await getManoObra(
            null,
            newValue.split(' - ')[1],
            null
          );
          if (response) {
            if (response.status === 200) {
              const producto: ManoObraType[] = response.message;
              if (producto) {
                apiRef.current.setEditCellValue({
                  id: params.id,
                  field: 'unitCostLabour',
                  value: producto[0].unitCostLabour,
                });
              }
            }
          }
        };
        fetchManoObra();
      } else if (params.field === 'cifCode') {
        const fetchCostos = async () => {
          const response: ServerResponseType | undefined =
            await getCostosIndirectos(null, newValue.split(' - ')[1], null);
          if (response) {
            if (response.status === 200) {
              const producto: CostosIndirectosType[] = response.message;
              if (producto) {
                apiRef.current.setEditCellValue({
                  id: params.id,
                  field: 'unitCostCif',
                  value: producto[0].unitCostCif,
                });
              }
            }
          }
        };
        fetchCostos();
      }

      onAutocompleteChange?.(event, newValue, params);
    },
    [params.id, params.field]
  );

  const getValue = useCallback(() => {
    if (params.value) return params.value;
    return null;
  }, [params.value]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Tab': {
        event.preventDefault();
        if (firstFieldFocus?.current) {
          firstFieldFocus.current.focus();
        }
        break;
      }
      default:
    }
  };

  const onInputChangeFunction = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setInputValue(newInputValue);
    }
  };

  return (
    <div>
      <Autocomplete
        value={getValue()}
        className={styles.genericFieldStyle}
        style={{ width: '100%' }}
        onChange={handleChange}
        onInputChange={onInputChangeFunction}
        fullWidth
        options={options ?? []}
        filterOptions={(options) => options}
        autoHighlight
        autoSelect
        handleHomeEndKeys
        disableClearable
        getOptionLabel={(option) => {
          if (/^\d+ - /.test(option)) {
            return option.substring(option.indexOf(' - ') + 3);
          }
          return option;
        }}
        noOptionsText="Sin resultados"
        isOptionEqualToValue={(option, value) => option.includes(value)}
        PopperComponent={({ children, ...popperProps }) => (
          <Popper
            {...popperProps}
            placement="bottom-start"
            style={{ width: 'auto', minWidth: '200px' }}
          >
            {children}
          </Popper>
        )}
        renderInput={(params) => {
          params.inputProps.onKeyDown = handleKeyDown;
          return (
            <TextField
              {...params}
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                className: styles.textBlackStyle,
              }}
            />
          );
        }}
      />
    </div>
  );
}
