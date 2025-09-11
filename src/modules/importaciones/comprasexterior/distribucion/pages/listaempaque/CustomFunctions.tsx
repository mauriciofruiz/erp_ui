import { useStyles } from '@/hooks';
import { LabeledInputNumber } from '@/modules/layout';
import { PersonProviderType } from '@/types';
import { Autocomplete, TextField } from '@mui/material';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { GridRowsProp, GridValidRowModel } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { useCallback, useEffect, useRef } from 'react';

export const GroupRows = (rows: GridRowsProp): readonly GridValidRowModel[] => {
  let groupedRows: Record<string, GridValidRowModel> = rows.reduce(
    (acc: Record<string, GridValidRowModel>, row) => {
      if (!acc[row.containerNumber]) {
        acc[row.containerNumber] = {
          ...row,
          id: randomId(),
          productId: [row.productId],
          productCode: [row.productCode],
          productName: [row.productName],
          quantity: [row.quantity],
        };
      } else {
        acc[row.containerNumber].productId.push(row.productId);
        acc[row.containerNumber].productCode.push(row.productCode);
        acc[row.containerNumber].productName.push(row.productName);
        acc[row.containerNumber].quantity.push(row.quantity);
      }
      return acc;
    },
    {}
  );

  // Convertir el objeto a un array
  let groupedRowsArray: GridValidRowModel[] = Object.values(groupedRows);
  return groupedRowsArray;
};

interface CustomCellProps {
  params: GridRenderEditCellParams;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  quantityList?: number[];
  transportistasList?: PersonProviderType[];
}

export function EditQuatityCell(props: CustomCellProps) {
  const { params, rows, setRows, quantityList } = props;

  const apiRef = useGridApiContext();

  const handleChange = (newValue: number, index: number) => {
    const newQuantityList = quantityList?.map((quantity, i) =>
      i === index ? newValue : quantity
    );

    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newQuantityList,
    });

    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          quantity: newQuantityList,
        };
        setRows(newRows);
      }
    }
  };

  return (
    <div>
      {quantityList &&
        quantityList.length > 0 &&
        quantityList.map((quantity, index) => (
          <LabeledInputNumber
            key={index}
            inputNumberProps={{
              onChange: (value) => handleChange(value as number, index),
              value: quantity,
              min: 0,
              defaultValue: 0,
              controls: false,
              precision: 0,
              onFocus: (e: any) => e.target.select(),
              size: 'small',
            }}
          />
        ))}
    </div>
  );
}

export const ProveedorEditCell = (props: CustomCellProps) => {
  const { params, rows, setRows, transportistasList } = props;

  const apiRef = useGridApiContext();

  const reference = useRef<HTMLElement>(null);

  const transportistas = transportistasList ?? [];

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const styles = useStyles();

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: PersonProviderType | null
  ) => {
    event.stopPropagation();
    if (!newValue) return;
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.providerId,
    });

    const rowIndex = rows.findIndex((row) => row.id === params.id);
    if (event && newValue !== null) {
      if (rows[rowIndex]) {
        const newRows = [...rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          transportProviderId: newValue.providerId,
        };
        setRows(newRows);
      }
    }
  };

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    return null;
  }, [params.value]);

  return (
    <Autocomplete
      ref={reference}
      value={
        getValue() === null
          ? undefined
          : transportistas.find(
              (proveedor) => proveedor.providerId === getValue()
            )
      }
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      fullWidth
      options={transportistas}
      filterSelectedOptions
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.personName.toLowerCase().includes(inputValue.toLowerCase())
        );
      }}
      getOptionLabel={(option: PersonProviderType) => option.personName ?? ''}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) =>
        option?.providerId === value?.providerId
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
};
