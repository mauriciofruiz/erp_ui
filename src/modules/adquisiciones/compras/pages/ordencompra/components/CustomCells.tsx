import { getProductoByBodega } from '@/backend';
import { ParametersEnum } from '@/enums';
import {
  getDecimalPlaces,
  getPercentageValue,
  setDecimalPlaces,
} from '@/functions';
import { PopupBody, useProductoAsync, useStyles } from '@/hooks';
import { ServerResponseType } from '@/store';
import {
  DetailOrdenCompraGetType,
  DetailOrdenCompraSendType,
  OrdenCompraGetType,
  ProductoByBodegaType,
  SucursalType,
  TaxRateInterface,
} from '@/types';
import { Add, Help } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Checkbox,
  IconButton,
  Popper,
  TextField,
} from '@mui/material';
import {
  GridRenderEditCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarContainer,
  useGridApiContext,
} from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { InputNumber } from 'antd';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Unstable_Popup as BasePopup } from '@mui/base/Unstable_Popup';
import { randomId } from '@mui/x-data-grid-generator';

export function setDetailsPurchaseOrder(
  currentRows: GridRowsProp,
  existingDetails: DetailOrdenCompraGetType[],
  purchaseOrderSelected: OrdenCompraGetType | undefined
): DetailOrdenCompraSendType[] {
  if (existingDetails && existingDetails.length > 0) {
    return currentRows.map((current, index) => {
      return {
        detailPurchaseOrderId: existingDetails[index]
          ? existingDetails[index].detailPurchaseOrderId
          : null,
        purchaseOrderId: purchaseOrderSelected
          ? purchaseOrderSelected.purchaseOrderId
          : null,
        productId: current.productId,
        branchId: current.branchId,
        quantity: current.quantity,
        quantityReceived: existingDetails[index]
          ? existingDetails[index].quantityReceived
          : 0,
        unitPrice: current.unitPrice,
        totalPrice: current.totalPrice,
        discountPercentage: current.discountPercentage,
        discountValue: current.discountValue,
        documentCode: current.documentCode,
        ivaValue: current.ivaValue,
        hasIva: current.hasIva,
        observation: '',
        status: true,
        taxRateId: current.taxRateId,
      };
    });
  } else {
    return currentRows.map((current) => {
      return {
        detailPurchaseOrderId: null,
        purchaseOrderId: purchaseOrderSelected
          ? purchaseOrderSelected.purchaseOrderId
          : null,
        productId: current.productId,
        branchId: current.branchId,
        quantity: current.quantity,
        quantityReceived: 0,
        unitPrice: current.unitPrice,
        totalPrice: current.totalPrice,
        discountPercentage: current.discountPercentage,
        discountValue: current.discountValue,
        documentCode: current.documentCode,
        ivaValue: current.ivaValue,
        hasIva: current.hasIva,
        taxRateId: current.taxRateId,
        observation: '',
        status: true,
      };
    });
  }
}

export function validateDetails(
  detailsRows: DetailOrdenCompraSendType[],
  detailsFromDb: DetailOrdenCompraGetType[] | undefined
): DetailOrdenCompraSendType[] {
  if (detailsFromDb) {
    const rows = detailsFromDb
      .filter((found) => {
        const exists = detailsRows.some(
          (detail) =>
            detail.detailPurchaseOrderId === found.detailPurchaseOrderId
        );
        return !exists;
      })
      .map((found) => ({
        detailPurchaseOrderId: found.detailPurchaseOrderId,
        purchaseOrderId: found.purchaseOrderSelected,
        productId: found.productId,
        branchId: found.branchId,
        quantity: found.quantity,
        quantityReceived: found.quantityReceived,
        unitPrice: found.unitPrice,
        totalPrice: found.totalPrice,
        discountPercentage: found.discountPercentage,
        discountValue: found.discountValue,
        documentCode: found.documentCode,
        ivaValue: found.ivaValue,
        hasIva: found.hasIva,
        observation: found.observation,
        taxRateId: found.taxRateId,
        status: true,
      }));
    return [...detailsRows, ...rows];
  } else {
    return detailsRows;
  }
}

export function InputChangeQuantity(props: {
  productosByBodegaList: ProductoByBodegaType[];
  rows: GridRowsProp;
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  impuestosList: TaxRateInterface[];
}) {
  const apiRef = useGridApiContext();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    const row = props.rows.find((row) => row.id === id);

    if (row) {
      const totalPrice = value * row.unitPrice;
      const discountValue = (totalPrice * row.discountPercentage) / 100;
      let ivaValue = 0;
      if (row.hasIva) {
        const ivaPercetage = props.impuestosList.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        ivaValue = getPercentageValue(
          totalPrice - discountValue,
          ivaPercetage.taxRatePercentage
        );
      }
      const totalFinal = totalPrice - discountValue + ivaValue;

      setRowValues(
        apiRef,
        value,
        setDecimalPlaces(totalPrice, 2),
        setDecimalPlaces(row.unitPrice, 6),
        setDecimalPlaces(discountValue, 2),
        setDecimalPlaces(row.discountPercentage, 2),
        setDecimalPlaces(ivaValue, 2),
        row.hasIva,
        setDecimalPlaces(totalFinal, 2),
        row.taxRateId,
        id,
        props.rows,
        setRows
      );
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRows)
      }
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={getDecimalPlaces(props.params.row.measurementUnitId)}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function InputChangeUnitPrice(props: {
  productosByBodegaList: ProductoByBodegaType[];
  rows: GridRowsProp;
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  impuestosList: TaxRateInterface[];
}) {
  const apiRef = useGridApiContext();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    const row = props.rows.find((row) => row.id === id);

    if (row) {
      const newUnitPrice = value;
      const totalPrice = row.quantity * newUnitPrice;
      const discountValue = (totalPrice * row.discountPercentage) / 100;
      let ivaValue = 0;
      if (row.hasIva) {
        const ivaPercetage = props.impuestosList.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        ivaValue = getPercentageValue(
          totalPrice - discountValue,
          ivaPercetage.taxRatePercentage
        );
      }

      const totalFinal = totalPrice - discountValue + ivaValue;

      setRowValues(
        apiRef,
        row.quantity,
        setDecimalPlaces(totalPrice, 2),
        value,
        setDecimalPlaces(discountValue, 2),
        setDecimalPlaces(row.discountPercentage, 2),
        setDecimalPlaces(ivaValue, 2),
        row.hasIva,
        setDecimalPlaces(totalFinal, 2),
        row.taxRateId,
        id,
        props.rows,
        setRows
      );
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRows)
      }
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={6}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function InputChangeTotalPrice(props: {
  productosByBodegaList: ProductoByBodegaType[];
  rows: GridRowsProp;
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  impuestosList: TaxRateInterface[];
}) {
  const apiRef = useGridApiContext();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    const row = props.rows.find((row) => row.id === id);

    if (row) {
      const newTotalPrice = value;
      const unitPrice = newTotalPrice / row.quantity;
      const discountValue = (newTotalPrice * row.discountPercentage) / 100;
      let ivaValue = 0;
      if (row.hasIva) {
        const ivaPercetage = props.impuestosList.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        ivaValue = getPercentageValue(
          newTotalPrice - discountValue,
          ivaPercetage.taxRatePercentage
        );
      }

      const totalFinal = newTotalPrice - discountValue + ivaValue;

      setRowValues(
        apiRef,
        row.quantity,
        value,
        setDecimalPlaces(unitPrice, 6),
        setDecimalPlaces(discountValue, 2),
        setDecimalPlaces(row.discountPercentage, 2),
        setDecimalPlaces(ivaValue, 2),
        row.hasIva,
        setDecimalPlaces(totalFinal, 2),
        row.taxRateId,
        id,
        props.rows,
        setRows
      );
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRows)
      }
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={2}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function InputChangeDiscountPercentage(props: {
  productosByBodegaList: ProductoByBodegaType[];
  rows: GridRowsProp;
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  impuestosList: TaxRateInterface[];
}) {
  const apiRef = useGridApiContext();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    const row = props.rows.find((row) => row.id === id);

    if (row) {
      const discountPercentage = Math.min(value, 100);
      const discountValue = setDecimalPlaces(
        (row.totalPrice * discountPercentage) / 100,
        2
      );

      let ivaValue = 0;

      if (row.hasIva) {
        const ivaPercetage = props.impuestosList.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        ivaValue = setDecimalPlaces(
          getPercentageValue(
            row.totalPrice - discountValue,
            ivaPercetage.taxRatePercentage
          ),
          2
        );
      }

      const totalFinal = row.totalPrice - discountValue + ivaValue;

      setRowValues(
        apiRef,
        row.quantity,
        setDecimalPlaces(row.totalPrice, 2),
        setDecimalPlaces(row.unitPrice, 6),
        setDecimalPlaces(discountValue, 2),
        discountPercentage,
        setDecimalPlaces(ivaValue, 2),
        row.hasIva,
        setDecimalPlaces(totalFinal, 2),
        row.taxRateId,
        id,
        props.rows,
        setRows
      );
    }
  };

  const replieValue = (event: any) => {
    const rows = props.rows;

    const updatedRows = rows.map((row) => {
      const inputValue = event.target.value as number;

      const discountPercentage = Math.min(inputValue, 100);
      const discountValue = setDecimalPlaces(
        (row.totalPrice * discountPercentage) / 100,
        2
      );
      let ivaValue = 0;

      if (row.hasIva) {
        const ivaPercetage = props.impuestosList.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        ivaValue = setDecimalPlaces(
          getPercentageValue(
            row.totalPrice - discountValue,
            ivaPercetage.taxRatePercentage
          ),
          2
        );
      }

      const totalFinal = row.totalPrice - discountValue + ivaValue;

      const newRow = {
        ...row,
        discountValue: discountValue,
        discountPercentage: discountPercentage,
        ivaValue: ivaValue,
        totalFinal: totalFinal,
      };
      return newRow;
    }) as GridRowsProp;
    props.setRows(updatedRows);
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRows)
      }
      onKeyDown={(event) => {
        if (event.ctrlKey && event.key === 'Enter') {
          replieValue(event);
        }
      }}
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={6}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function InputChangeDiscount(props: {
  productosByBodegaList: ProductoByBodegaType[];
  rows: GridRowsProp;
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  impuestosList: TaxRateInterface[];
}) {
  const apiRef = useGridApiContext();

  const reference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.params.hasFocus) {
      reference.current!.focus();
    }
  }, [props.params.hasFocus]);

  const onQuantityChange = (
    value: number,
    id: GridRowId,
    setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>
  ) => {
    const row = props.rows.find((row) => row.id === id);

    if (row) {
      const discountValue = value;
      const newDiscountValue = Math.min(discountValue, row.totalPrice);
      const discountPercentage = setDecimalPlaces(
        (newDiscountValue * 100) / row.totalPrice,
        2
      );
      let ivaValue = 0;

      if (row.hasIva) {
        const ivaPercetage = props.impuestosList.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        ivaValue = setDecimalPlaces(
          getPercentageValue(
            row.totalPrice - discountValue,
            ivaPercetage.taxRatePercentage
          ),
          2
        );
      }

      const totalFinal = row.totalPrice - newDiscountValue + ivaValue;

      setRowValues(
        apiRef,
        row.quantity,
        row.totalPrice,
        row.unitPrice,
        newDiscountValue,
        setDecimalPlaces(discountPercentage, 2),
        setDecimalPlaces(ivaValue, 2),
        row.hasIva,
        setDecimalPlaces(totalFinal, 2),
        row.taxRateId,
        id,
        props.rows,
        setRows
      );
    }
  };

  const replieValue = (event: any) => {
    const rows = props.rows;

    const updatedRows = rows.map((row) => {
      const inputValue = event.target.value as number;
      const discountValue = inputValue;
      const newDiscountValue = Math.min(discountValue, row.totalPrice);
      const discountPercentage = setDecimalPlaces(
        (newDiscountValue * 100) / row.totalPrice,
        2
      );
      let ivaValue = 0;

      if (row.hasIva) {
        const ivaPercetage = props.impuestosList.find(
          (tax) => tax.taxRateId === row.taxRateId
        ) ?? { taxRatePercentage: 0 };
        ivaValue = setDecimalPlaces(
          getPercentageValue(
            row.totalPrice - discountValue,
            ivaPercetage.taxRatePercentage
          ),
          2
        );
      }

      const totalFinal = row.totalPrice - newDiscountValue + ivaValue;

      const newRow = {
        ...row,
        discountValue: newDiscountValue,
        discountPercentage: discountPercentage,
        ivaValue: ivaValue,
        totalFinal: totalFinal,
      };
      return newRow;
    }) as GridRowsProp;
    props.setRows(updatedRows);
  };
  return (
    <InputNumber
      ref={reference}
      min={0}
      value={props.params.value !== null ? props.params.value : 0}
      onChange={(value) =>
        onQuantityChange(value, props.params.id, props.setRows)
      }
      onKeyDown={(event) => {
        if (event.ctrlKey && event.key === 'Enter') {
          replieValue(event);
        }
      }}
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={2}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function ChangeHasIva(props: {
  productosByBodegaList: ProductoByBodegaType[];
  rows: GridRowsProp;
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  rowModesModel: GridRowModesModel;
  impuestosList: TaxRateInterface[];
}) {
  const apiRef = useGridApiContext();

  const reference = useRef<HTMLButtonElement>(null);

  const { fetchById } = useProductoAsync();

  const { impuestosList, params } = props;

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChangeBoolean = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const row = props.rows.find((row) => row.id === props.params.id);

    if (row) {
      const hasIva = event.target.checked;
      let ivaValue = 0;
      let taxRateId = ParametersEnum.TAX_RATE_ID_ZERO;

      if (hasIva) {
        const response = await fetchById(row.productId);
        if (response) {
          taxRateId = response.taxRateId;
          const currentImpuesto = impuestosList.find(
            (tax) => tax.taxRateId === taxRateId
          ) ?? { taxRatePercentage: 0 };
          ivaValue = getPercentageValue(
            row.totalPrice - row.discountValue,
            currentImpuesto.taxRatePercentage
          );
        }
      } else {
        const taxRateCero = impuestosList.find(
          (tax) => tax.taxRateId === taxRateId
        ) ?? { taxRatePercentage: 0 };
        ivaValue = getPercentageValue(
          row.totalPrice - row.discountValue,
          taxRateCero.taxRatePercentage
        );
      }

      const totalFinal = row.totalPrice - row.discountValue + ivaValue;

      setRowValues(
        apiRef,
        row.quantity,
        row.totalPrice,
        row.unitPrice,
        row.discountValue,
        row.discountPercentage,
        setDecimalPlaces(ivaValue, 2),
        hasIva,
        setDecimalPlaces(totalFinal, 2),
        taxRateId,
        props.params.id,
        props.rows,
        props.setRows
      );
    }
  };

  return (
    <Checkbox
      ref={reference}
      checked={props.params.row.hasIva}
      onChange={(event) => handleChangeBoolean(event)}
    />
  );
}

function setRowValues(
  apiRef: React.MutableRefObject<GridApiCommunity>,
  quantity: string | number,
  totalPrice: string | number,
  unitPrice: string | number,
  discountValue: string | number,
  discountPercentage: string | number,
  ivaValue: string | number,
  hasIva: boolean,
  totalFinal: string | number,
  taxRateId: number,
  id: GridRowId,
  rows: GridRowsProp,
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>
) {
  apiRef.current.setEditCellValue({
    id: id,
    field: 'quantity',
    value: quantity,
  });
  apiRef.current.setEditCellValue({
    id: id,
    field: 'unitPrice',
    value: unitPrice,
  });
  apiRef.current.setEditCellValue({
    id: id,
    field: 'totalPrice',
    value: totalPrice,
  });
  apiRef.current.setEditCellValue({
    id: id,
    field: 'discountValue',
    value: discountValue,
  });
  apiRef.current.setEditCellValue({
    id: id,
    field: 'discountPercentage',
    value: discountPercentage,
  });
  apiRef.current.setEditCellValue({
    id: id,
    field: 'ivaValue',
    value: ivaValue,
  });
  apiRef.current.setEditCellValue({
    id: id,
    field: 'hasIva',
    value: hasIva,
  });
  apiRef.current.setEditCellValue({
    id: id,
    field: 'totalFinal',
    value: totalFinal,
  });
  apiRef.current.setEditCellValue({
    id: id,
    field: 'taxRateId',
    value: taxRateId,
  });

  const rowIndex = rows.findIndex((rowProp) => rowProp.id === id);

  const newRows = [...rows];
  newRows[rowIndex] = {
    ...newRows[rowIndex],
    quantity: quantity,
    unitPrice: unitPrice,
    totalPrice: totalPrice,
    discountValue: discountValue,
    discountPercentage: discountPercentage,
    ivaValue: ivaValue,
    hasIva: hasIva,
    totalFinal: totalFinal,
    taxRateId: taxRateId,
  };

  setRows(newRows);
}

interface AutocompleteEditSucursalCellProps {
  params: GridRenderEditCellParams;
  options: any[];
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  productosByBodegaList: ProductoByBodegaType[];
  setProductosByBodegaList: React.Dispatch<
    React.SetStateAction<ProductoByBodegaType[]>
  >;
}
export function AutocompleteEditSucursalCell(
  props: AutocompleteEditSucursalCellProps
) {
  const {
    params,
    options,
    rows,
    setRows,
    productosByBodegaList,
    setProductosByBodegaList,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const apiRef = useGridApiContext();

  const styles = useStyles();

  const handleChange = useCallback(
    (event: React.SyntheticEvent<Element, Event>, newValue: SucursalType) => {
      event.stopPropagation();
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: newValue.name,
      });
      handleAutocompleteChange(event, newValue, params);
    },
    [params.id, params.field]
  );

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: SucursalType,
    params: GridRenderEditCellParams
  ) => {
    const rowIndex = rows.findIndex((row) => row.id === params.id);
    const newRows = [...rows];
    if (event && newValue !== null) {
      const fetchProductoBySucursal = async () => {
        try {
          const response: ServerResponseType | undefined =
            await getProductoByBodega(
              newValue.branchId,
              newRows[rowIndex].productId
            );
          if (response) {
            if (response.status === 200) {
              const producto: ProductoByBodegaType = response.message;

              setProductosByBodegaList([...productosByBodegaList, producto]);

              newRows[rowIndex] = {
                ...newRows[rowIndex],
                documentCode: '',
                branchName: newValue.name,
                branchId: newValue.branchId,
                availableQuantity: producto.availableQuantity,
                quantity: newRows[rowIndex].quantity,
                unitPrice: producto.unitPrice,
                totalPrice: newRows[rowIndex].quantity * producto.unitPrice,
                taxRateId: producto.taxRateId,
                discountPercentage: 0,
                discountValue: 0,
                hasIva: false,
                ivaValue: 0,
                totalFinal: 0,
              };
            } else {
              enqueueSnackbar(
                `No se pudo cargar el producto de la sucursal: ${response.status}`,
                {
                  variant: 'error',
                }
              );
            }
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
      };
      if (newRows[rowIndex] && newRows[rowIndex].productId !== null) {
        fetchProductoBySucursal();
      } else {
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          branchName: newValue.name,
          branchId: newValue.branchId,
        };
      }
    } else {
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        documentCode: '',
        productId: null,
        productCode: '',
        productName: '',
        branchName: newValue.name,
        branchId: newValue.branchId,
        availableQuantity: 0,
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        discountPercentage: 0,
        discountValue: 0,
        hasIva: false,
        ivaValue: 0,
        totalFinal: 0,
      };
    }
    setRows(newRows);
  };

  const getValue = useCallback(() => {
    if (params.value) {
      return params.value;
    }

    return '';
  }, [params.value]);

  return (
    <div>
      <Autocomplete
        value={getValue()}
        className={styles.genericFieldStyle}
        style={{ width: '100%' }}
        onChange={handleChange}
        fullWidth
        options={options ?? []}
        filterOptions={(options, { inputValue }) => {
          return options.filter((option) =>
            option.name.toLowerCase().includes(inputValue.toLowerCase())
          );
        }}
        autoHighlight
        autoSelect
        handleHomeEndKeys
        disableClearable
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.name
        }
        noOptionsText="Sin resultados"
        isOptionEqualToValue={(option, value) =>
          value === '' ? true : option.name === value
        }
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

interface AutocompleteEditInputCellProps {
  firstFieldFocus: React.RefObject<HTMLInputElement>;
  params: GridRenderEditCellParams;
  options: any[];
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  productosByBodegaList: ProductoByBodegaType[];
  setProductosByBodegaList: React.Dispatch<
    React.SetStateAction<ProductoByBodegaType[]>
  >;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
}
export function AutocompleteEditInputCell(
  props: AutocompleteEditInputCellProps
) {
  const {
    params,
    options,
    firstFieldFocus,
    setInputValue,
    productosByBodegaList,
    setProductosByBodegaList,
    rows,
    setRows,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const apiRef = useGridApiContext();

  const styles = useStyles();

  const reference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: any
  ) => {
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.split(' - ')[1],
    });
    handleAutocompleteChange(event, newValue, params);
  };

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

  const onInputChange = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    if (event !== null) {
      event.preventDefault();
      setInputValue(newInputValue);
    }
  };

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string | null,
    params: GridRenderEditCellParams
  ) => {
    if (event && newValue !== null) {
      const fetchProductoByBodega = async (sucursalId: number) => {
        try {
          const response: ServerResponseType | undefined =
            await getProductoByBodega(
              sucursalId,
              parseInt(newValue.split(' - ')[0])
            );
          if (response) {
            if (response.status === 200) {
              const producto: ProductoByBodegaType = response.message;

              setProductosByBodegaList([...productosByBodegaList, producto]);

              const rowIndex = rows.findIndex((row) => row.id === params.id);

              const newRows = [...rows];
              newRows[rowIndex] = {
                ...newRows[rowIndex],
                documentCode: '',
                productId: producto.productId,
                productCode: producto.productCode,
                productName: producto.productName,
                branchName: producto.branchName,
                branchId: producto.branchId,
                availableQuantity: producto.availableQuantity,
                quantity: newRows[rowIndex].quantity,
                unitPrice: producto.unitPrice,
                totalPrice: newRows[rowIndex].quantity * producto.unitPrice,
                discountPercentage: 0,
                discountValue: 0,
                hasIva: producto.hasIva,
                ivaValue: 0,
                totalFinal: 0,
                taxRateId: producto.taxRateId,
                measurementUnitId: producto.measurementUnitId,
              };

              setRows(newRows);
            } else {
              enqueueSnackbar(
                `No se pudo cargar el producto: ${response.status}`,
                {
                  variant: 'error',
                }
              );
            }
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
        }
      };
      const rowIndex = rows.findIndex((row) => row.id === params.id);
      if (rows[rowIndex] && rows[rowIndex].branchId !== null) {
        fetchProductoByBodega(rows[rowIndex].branchId);
      } else {
        enqueueSnackbar('Debe seleccionar la sucursal del producto', {
          variant: 'error',
        });
      }
    } else {
      const rowIndex = rows.findIndex((row) => row.id === params.id);

      const newRows = [...rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        documentCode: '',
        productId: null,
        productCode: '',
        productName: '',
        availableQuantity: 0,
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        discountPercentage: 0,
        discountValue: 0,
        hasIva: false,
        ivaValue: 0,
        totalFinal: 0,
      };
      setRows(newRows);
    }
  };

  return (
    <div ref={reference}>
      <Autocomplete
        value={getValue()}
        className={styles.genericFieldStyle}
        style={{ width: '100%' }}
        onChange={handleChange}
        onInputChange={onInputChange}
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

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  createMode: boolean;
  editMode: boolean;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  rows: GridRowsProp;
  purchaseOrderSelected: OrdenCompraGetType;
}
export function EditToolbar(props: EditToolbarProps) {
  const {
    setRows,
    setRowModesModel,
    createMode,
    editMode,
    addButtonRef,
    purchaseOrderSelected,
  } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        documentCode: '',
        productId: null,
        productCode: '',
        productName: '',
        branchName: purchaseOrderSelected
          ? purchaseOrderSelected.branchName
          : '',
        branchId: purchaseOrderSelected ? purchaseOrderSelected.branchId : null,
        availableQuantity: 0,
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        discountPercentage: 0,
        discountValue: 0,
        hasIva: true,
        taxRateId: ParametersEnum.TAX_RATE_ID_DEFAULT,
        ivaValue: 0,
        totalFinal: 0,
      },
    ]);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' },
    }));
  };

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const handlePopUp = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchor ? null : event.currentTarget);
  };

  const open = Boolean(anchor);
  const id = open ? 'simple-popper' : undefined;

  return (
    <GridToolbarContainer
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <div>
        <IconButton aria-describedby={id} color="primary" onClick={handlePopUp}>
          <Help />
        </IconButton>
        <BasePopup id={id} open={open} anchor={anchor}>
          <PopupBody>
            <p>
              Presione <kbd className="menu">Ctrl</kbd> +{' '}
              <kbd className="menu">Enter</kbd> en la columna de{' '}
              <kbd className="menu">% Descuento</kbd> o{' '}
              <kbd className="menu">Descuento</kbd> para replicar el valor{' '}
              seleccionado en todas las filas.
            </p>
          </PopupBody>
        </BasePopup>
      </div>
      <Button
        id="addButonProduct"
        ref={addButtonRef}
        color="primary"
        startIcon={<Add />}
        onClick={handleClick}
        disabled={!createMode && !editMode}
        sx={{ mb: 2, mt: 1, marginLeft: '10px', mr: 1 }}
      >
        Agregar Producto
      </Button>
    </GridToolbarContainer>
  );
}

export function ImpuestoCell(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  impuestos: TaxRateInterface[];
}) {
  const { params, setRows, impuestos } = props;

  const reference = useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const apiRef = useGridApiContext();

  const styles = useStyles();

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: TaxRateInterface | null
  ) => {
    if (newValue === null) return;
    event.stopPropagation();
    apiRef.current.setEditCellValue({
      id: params.id,
      field: params.field,
      value: newValue.taxRateId,
    });
    handleAutocompleteChange(event, newValue, params);
  };

  const handleAutocompleteChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: TaxRateInterface,
    params: GridRenderEditCellParams
  ) => {
    const row = apiRef.current.getRowParams(params.id).row;
    if (event && newValue !== null) {
      if (row) {
        const taxRate = impuestos.find(
          (tax) => tax.taxRateId === newValue.taxRateId
        );

        const ivaValue = taxRate
          ? getPercentageValue(
              row.totalPrice - row.discountValue,
              taxRate.taxRatePercentage
            )
          : 0;

        const totalFinal = row.totalPrice - row.discountValue + ivaValue;

        const newRow = {
          ...row,
          taxRateId: newValue.taxRateId,
          ivaValue,
          totalFinal,
        };
        
        const newRows = apiRef.current
          .getAllRowIds()
          .map((r) =>
            r === params.id ? newRow : apiRef.current.getRowParams(r).row
          );
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
        getValue() === 0
          ? null
          : impuestos.find((tax) => tax.taxRateId === getValue())
      }
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      options={impuestos}
      getOptionLabel={(option: TaxRateInterface) => option.taxDescription}
      isOptionEqualToValue={(option, value) =>
        option?.taxRateId === value?.taxRateId
      }
      noOptionsText="Sin resultados"
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
