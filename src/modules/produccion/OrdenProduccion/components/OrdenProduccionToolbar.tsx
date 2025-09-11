import { allowDecimalsMeaseurementUnit } from '@/functions';
import { FormState } from '@/hooks';
import {
  GridRenderEditCellParams,
  GridRowId,
  GridRowModesModel,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

export function InputChangeOrderGrid(props: {
  rowsUnidadesProd: GridRowsProp;
  params: GridRenderEditCellParams;
  setRowsUnidadesProd: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  setExecuteQuantity: React.Dispatch<React.SetStateAction<boolean>>;
  formState: FormState;
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
    } else if (fieldName === 'unitPrice') {
      setDecimal(6);
    }
  }, [props.params]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRowsUnidadesProd: React.Dispatch<React.SetStateAction<GridRowsProp>>,
    setExecuteQuantity: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const numericValue = value;
    let inputValue = numericValue === 0 ? 1 : numericValue;
    let inputValueAsString = inputValue.toString();
    const unidad = /^[0-9\s]*$/;
    const row = props.rowsUnidadesProd.find((row) => row.id === id);
    if (row) {
      let newQuantity = row.quantity;
      let newcurretCost = row.unitPrice;
      const fieldName = props.params.field;
      if (fieldName === 'quantity') {
        if (allowDecimalsMeaseurementUnit(row.measurementUnitId)) {
          newQuantity = inputValue <= 0 ? 1 : inputValue;
          setDecimal(6);
          apiRef.current.setEditCellValue({
            id: id,
            field: 'quantity',
            value: inputValue,
          });
          apiRef.current.setEditCellValue({
            id: id,
            field: 'quantityProduced',
            value: Number(inputValue) + Number(row.quantityProduced),
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
            apiRef.current.setEditCellValue({
              id: id,
              field: 'quantityProduced',
              value: Number(inputValue) + Number(row.quantityProduced),
            });
          }
        }
      } else if (fieldName === 'unitPrice') {
        newcurretCost = inputValue <= 0 ? 1 : inputValue;
        apiRef.current.setEditCellValue({
          id: id,
          field: 'unitPrice',
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

      const rowIndex = props.rowsUnidadesProd.findIndex(
        (rowProp) => rowProp.id === id
      );

      const newRows = [...props.rowsUnidadesProd];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        quantity: newQuantity,
        quantityProduced: row.quantityProduced + newQuantity,
        unitPrice: newcurretCost,
        totalCost: updateTotalCost,
      };

      setRowsUnidadesProd(newRows);
      setExecuteQuantity(true);
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        debounce(
          () =>
            onQuantityChange(
              value,
              props.params.id,
              props.setRowsUnidadesProd,
              props.setExecuteQuantity
            ),
          2000
        )()
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

export function InputChangeEspeciGri(props: {
  rowsUnidadesProd: GridRowsProp;
  params: GridRenderEditCellParams;
  setRowsUnidadesProd: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  addButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const apiRef = useGridApiContext();
  const reference = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (
    value: string,
    id: GridRowId,
    setRowsUnidadesProd: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    let inputValue = value;
    const row = props.rowsUnidadesProd.find((row) => row.id === id);
    if (row) {
      let unity = '';
      let unitCost = '';
      let totalCost = '';
      let totalCost1 = '';
      let totalCost2 = '';
      const fieldName = props.params.field;
      if (fieldName === 'unity') {
        unity = inputValue;
        apiRef.current.setEditCellValue({
          id: id,
          field: 'unity',
          value: inputValue,
        });
      } else if (fieldName === 'unitCost') {
        unitCost = inputValue;
        apiRef.current.setEditCellValue({
          id: id,
          field: 'unitCost',
          value: inputValue,
        });
      } else if (fieldName === 'totalCost') {
        totalCost = inputValue;
        apiRef.current.setEditCellValue({
          id: id,
          field: 'totalCost',
          value: inputValue,
        });
      } else if (fieldName === 'totalCost1') {
        totalCost1 = inputValue;
        apiRef.current.setEditCellValue({
          id: id,
          field: 'totalCost1',
          value: inputValue,
        });
      } else if (fieldName === 'totalCost2') {
        totalCost2 = inputValue;
        apiRef.current.setEditCellValue({
          id: id,
          field: 'totalCost2',
          value: inputValue,
        });
      }

      const rowIndex = props.rowsUnidadesProd.findIndex(
        (rowProp) => rowProp.id === id
      );

      const newRows = [...props.rowsUnidadesProd];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        unity: unity,
        unitCost: unitCost,
        totalCost: totalCost,
        totalCost1: totalCost1,
        totalCost2: totalCost2,
      };
      setRowsUnidadesProd(newRows);
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRowsUnidadesProd)
      }
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      onFocus={(e) => e.target.select()}
    />
  );
}
