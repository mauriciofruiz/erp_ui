import { getAllProductosByParams } from '@/backend';
import { setDecimalPlaces } from '@/functions';
import { RootState } from '@/store';
import { GrupoType, ProductoType, SubgrupoType } from '@/types';
import { Autocomplete, Button, TextField } from '@mui/material';
import { ClassNameMap } from '@mui/styles';
import {
  GridRenderEditCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarContainer,
  GridValidRowModel,
  useGridApiContext,
} from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import { randomId } from '@mui/x-data-grid-generator';

interface AutocompleteEditInputCellProps {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  styles: ClassNameMap;
}

export function AutocompleteEditProductCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows, styles } = props;

  const apiRef = useGridApiContext();

  const [productosList, setProductosList] = useState<ProductoType[]>([]);

  const [inputValue, setInputValue] = useState('');

  const reference = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: ProductoType
  ) => {
    event.stopPropagation();
    setInputValue('');

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.productCode + ' - ' + newValue.shortName,
    });

    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'parameterId',
      value: newValue.productId,
    });

    handleAutocompleteChange(event, newValue, params);
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);

  const onInputChange = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    const regex = /^[a-zA-Z0-9]+$/; // Esta regex permite letras, números
    const validInput = newInputValue.length > 3 && regex.test(newInputValue);
    if (event !== null && validInput) {
      event.preventDefault();
      setInputValue(newInputValue);
    }
  };

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: ProductoType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          parameterId: newValue.productId,
          parameterValue: newValue.productCode + ' - ' + newValue.shortName,
        };
        setRows(newRows);
      }
    }
  };

  useEffect(() => {
    const fetchProductos = async () => {
      const response = await getAllProductosByParams(inputValue.toUpperCase());
      if (response && response.message) {
        setProductosList(response.message as ProductoType[]);
      } else {
        setProductosList([]);
      }
    };
    if (inputValue.length > 3) {
      fetchProductos();
    }
  }, [inputValue]);

  return (
    <Autocomplete
      ref={reference}
      value={getValue()}
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      onInputChange={debounce(onInputChange, 500)}
      filterOptions={(options) => options}
      fullWidth
      options={productosList}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      getOptionLabel={(option) => option.shortName ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.shortName.includes(value)}
      renderOption={(props, option: ProductoType) => (
        <li {...props} key={option.productId}>
          {option.productCode} - {option.shortName}
        </li>
      )}
      renderInput={(params) => {
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
  );
}

export function AutocompleteEditSubgroupCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows, styles } = props;

  const apiRef = useGridApiContext();

  const { subgrupos } = useSelector((state: RootState) => state.common);

  const reference = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: SubgrupoType
  ) => {
    event.stopPropagation();

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.subgroupName,
    });

    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'parameterId',
      value: newValue.subgroupId,
    });

    handleAutocompleteChange(event, newValue, params);
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: SubgrupoType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          parameterId: newValue.subgroupId,
          parameterValue: newValue.subgroupName,
        };
        setRows(newRows);
      }
    }
  };

  return (
    <Autocomplete
      ref={reference}
      value={getValue()}
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.subgroupName.toUpperCase().includes(inputValue.toUpperCase())
        );
      }}
      fullWidth
      options={subgrupos}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      getOptionLabel={(option) => option.subgroupName ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) =>
        option.subgroupName.includes(value)
      }
      renderInput={(params) => {
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
  );
}

export function AutocompleteEditGroupCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, rows, setRows, styles } = props;

  const apiRef = useGridApiContext();

  const { grupos } = useSelector((state: RootState) => state.common);

  const reference = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: GrupoType
  ) => {
    event.stopPropagation();

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.groupName,
    });

    apiRef.current.setEditCellValue({
      id: params.id,
      field: 'parameterId',
      value: newValue.groupId,
    });

    handleAutocompleteChange(event, newValue, params);
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: GrupoType | null,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          parameterId: newValue.groupId,
          parameterValue: newValue.groupName,
        };
        setRows(newRows);
      }
    }
  };

  return (
    <Autocomplete
      ref={reference}
      value={getValue()}
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.groupName.toUpperCase().includes(inputValue.toUpperCase())
        );
      }}
      fullWidth
      options={grupos}
      autoHighlight
      autoSelect
      handleHomeEndKeys
      getOptionLabel={(option) => option.groupName ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) => option.groupName.includes(value)}
      renderInput={(params) => {
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
  );
}

export function InputQuantityFunction(props: {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
}) {
  const apiRef = useGridApiContext();

  const reference = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (value: number | null, id: GridRowId) => {
    const row = props.rows.find((row) => row.id === id);
    if (row === undefined) return;

    if (row) {
      let valueModified = value !== null ? value : 0;
      valueModified = setDecimalPlaces(valueModified / 100, 4);
      apiRef.current.setEditCellValue({
        id: id,
        field: props.params.field,
        value: valueModified,
      });
    }
  };

  const parser = (value: string | undefined) => {
    if (value === undefined) return 0;
    let valueOne = value?.replace('%', '');
    let valueTwo = valueOne?.replace(',', '.');
    let valueThree = setDecimalPlaces(Number(valueTwo), 2);
    return valueThree;
  };

  return (
    <InputNumber<number>
      ref={reference}
      min={0}
      max={100}
      value={props.params.value !== null ? props.params.value * 100 : 0}
      formatter={(value) => `${value}%`}
      parser={(value) => parser(value)}
      onChange={debounce(
        (value) => onQuantityChange(value, props.params.id),
        500
      )}
      onFocus={(e) => e.target.select()}
      precision={2}
    />
  );
}

interface EditToolbarProps {
  createMode: boolean;
  editMode: boolean;
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
}

export function ToolbarExcepciones(props: EditToolbarProps) {
  const { createMode, editMode, setRows, setRowModesModel } = props;

  const handleNewRow = () => {
    const id = randomId();

    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        exceptionTypeId: null,
        parameterId: null,
        parameterValue: '',
        discountPortion: 0,
        startDate: null,
        endDate: null,
        status: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'exceptionTypeId' },
    }));
  };
  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: '10px',
      }}
    >
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleNewRow}
        disabled={!(createMode || editMode)}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1, width: '160px' }}
      >
        Agregar Excepción
      </Button>
    </GridToolbarContainer>
  );
}
