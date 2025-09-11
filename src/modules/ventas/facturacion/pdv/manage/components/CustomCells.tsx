import { getDecimalPlaces } from '@/functions';
import { useProductoAsync, useStyles } from '@/hooks';
import { ProductoByBodegaType } from '@/types';
import { Autocomplete, TextField } from '@mui/material';
import {
  GridRenderEditCellParams,
  GridRowId,
  GridRowsProp,
  useGridApiContext,
} from '@mui/x-data-grid';
import { InputNumber } from 'antd';
import { debounce } from 'lodash';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';

export function AutocompleteEditProductCell(props: {
  params: GridRenderEditCellParams;
  sucursalId: number;
}) {
  const { params, sucursalId } = props;

  const styles = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const apiRef = useGridApiContext();

  const [productosList, setProductosList] = useState<ProductoByBodegaType[]>(
    []
  );

  const { fetchBySucursalAndParam } = useProductoAsync();

  const [inputValue, setInputValue] = useState('');

  const reference = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: ProductoByBodegaType
  ) => {
    event.stopPropagation();
    setInputValue('');
    if (newValue.availableQuantity <= 0) {
      enqueueSnackbar('No hay dispone de este producto en su bodega', {
        variant: 'warning',
      });
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: '',
      });
      setProductosList([]);
    } else {
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: newValue.productName,
      });
      apiRef.current.setEditCellValue({
        field: 'quantity',
        id: params.id,
        value: 1,
      });

      apiRef.current.setEditCellValue({
        id: params.id,
        field: 'unitMeasureId',
        value: newValue.measurementUnitId,
      });

      const rows = apiRef.current
        .getAllRowIds()
        .map((id) => apiRef.current.getRow(id));

      const newRow = {
        ...rows.find((row) => row.id === params.id),
        productId: newValue.productId,
        productCode: newValue.productCode,
        productName: newValue.productName,
        quantity: 1,
        unitPrice: newValue.unitPrice,
        availableQuantity: newValue.availableQuantity,
        unitMeasureId: newValue.measurementUnitId,
      };

      const newRows = rows.map((row) =>
        row.id === params.id ? newRow : row
      ) as GridRowsProp;

      apiRef.current.setRows([...newRows]);

      //handleStopEdit(params.id, newRows, setRows, enqueueSnackbar);
    }
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

  useEffect(() => {
    const fetchProductos = async (id: number) => {
      const response = await fetchBySucursalAndParam(id, inputValue);
      if (response) {
        setProductosList(response as ProductoByBodegaType[]);
      }
    };
    if (sucursalId && sucursalId !== null && inputValue.length > 3) {
      fetchProductos(sucursalId);
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
      getOptionLabel={(option) => option.productName ?? option}
      noOptionsText="Sin resultados"
      isOptionEqualToValue={(option, value) =>
        option.productName.includes(value)
      }
      renderOption={(props, option: ProductoByBodegaType) => (
        <li {...props} key={option.productId}>
          {option.productCode} - {option.productName}
        </li>
      )}
      renderInput={(params) => {
        const handleKeyDown = (event: React.KeyboardEvent) => {
          if (event.key === 'Tab') {
            event.preventDefault();
            const listbox = document.querySelector('[role="listbox"]');
            const focusedOption = listbox?.querySelector('[data-focus="true"]');
            if (focusedOption) {
              (focusedOption as HTMLElement).click();
            } else {
              const firstOption = listbox?.querySelector('li');
              if (firstOption) {
                (firstOption as HTMLElement).click();
              }
            }
          }
        };

        return (
          <TextField
            {...params}
            variant="outlined"
            onKeyDown={handleKeyDown}
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

// export function RetencionMultipleCell(props: RetencionMultipleProps) {
//   const { params, rows, setRows, retencionList, styles } = props;

//   const apiRef = useGridApiContext();

//   const reference = React.useRef<HTMLElement>(null);

//   useEffect(() => {
//     if (params.hasFocus) {
//       reference.current!.focus();
//     }
//   }, [params.hasFocus]);

//   const handleChange = (
//     event: React.SyntheticEvent<Element, Event>,
//     newValue: RetencionType[]
//   ) => {
//     event.stopPropagation();
//     apiRef.current.setEditCellValue({
//       id: params.id,
//       field: params.field,
//       value: newValue,
//     });
//     handleAutocompleteChange(event, newValue, params);
//   };

//   const handleAutocompleteChange = (
//     event: React.SyntheticEvent<Element, Event>,
//     newValue: RetencionType[],
//     params: GridRenderEditCellParams
//   ) => {
//     const rowIndex = rows.findIndex((row) => row.id === params.id);
//     if (event && newValue !== null) {
//       const retentionSourceId = newValue.find(
//         (retencion) =>
//           retencion.retentionType ===
//           ParametersEnum.RETENCION_FUENTE_PARAMETER.toString()
//       )?.retentionId;
//       const retentionIVAId = newValue.find(
//         (retencion) =>
//           retencion.retentionType ===
//           ParametersEnum.RETENCION_IVA_PARAMETER.toString()
//       )?.retentionId;
//       if (rows[rowIndex]) {
//         const newRows = [...rows];
//         newRows[rowIndex] = {
//           ...newRows[rowIndex],
//           retentionSourceId,
//           retentionIVAId,
//           retentions: newValue,
//         };
//         setRows(newRows);
//       }
//     }
//   };

//   const getValue = useCallback(() => {
//     if (params.value) return params.value;

//     return null;
//   }, [params.value]);

//   return (
//     <Autocomplete
//       ref={reference}
//       value={getValue()}
//       className={styles.genericFieldStyle}
//       style={{ width: '100%' }}
//       onChange={handleChange}
//       multiple
//       options={retencionList}
//       getOptionLabel={(option) =>
//         `${option.retencionCode} - ${option.retentionDetail}`
//       }
//       isOptionEqualToValue={(option, value) => option === value}
//       filterSelectedOptions
//       renderInput={(params) => {
//         return (
//           <TextField
//             {...params}
//             variant="outlined"
//             InputProps={{
//               ...params.InputProps,
//               className: styles.textBlackStyle,
//             }}
//           />
//         );
//       }}
//       renderTags={(value, getTagProps) => (
//         <div style={{ display: 'width', maxWidth: '350px' }}>
//           {value.map((option, index) => (
//             <Tooltip
//               title={`${option.retencionCode} - ${option.retentionDetail}`}
//               placement="top-start"
//             >
//               <Chip
//                 variant="outlined"
//                 {...getTagProps({ index })}
//                 style={{ maxWidth: '100%', marginBottom: '5px' }}
//                 label={`${option.retencionCode} - ${option.retentionDetail}`}
//               />
//             </Tooltip>
//           ))}
//         </div>
//       )}
//     />
//   );
// }

export function InputQuantityFunction(props: {
  params: GridRenderEditCellParams;
}) {
  const { params } = props;
  const apiRef = useGridApiContext();

  const { enqueueSnackbar } = useSnackbar();

  const reference = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const onQuantityChange = (value: number, id: GridRowId) => {
    const rows = apiRef.current
      .getAllRowIds()
      .map((id) => apiRef.current.getRow(id));
    const row = rows.find((row) => row.id === id);
    if (row === undefined) return;

    if (row) {
      let returnQuantity = value;
      const availableQuantity = row.availableQuantity;
      if (returnQuantity > availableQuantity) {
        enqueueSnackbar(
          `La cantidad ingresada supera la cantidad disponible del producto`,
          {
            variant: 'warning',
          }
        );
        returnQuantity = availableQuantity;
      } else if (returnQuantity <= 0) {
        enqueueSnackbar(`La cantidad ingresada debe ser mayor a 0`, {
          variant: 'warning',
        });
        returnQuantity = 1;
      }
      apiRef.current.setEditCellValue({
        id: id,
        field: params.field,
        value: returnQuantity,
      });

      // const newRow = {
      //   ...row,
      //   quantity: returnQuantity,
      // };

      // const newRows = rows.map((row) =>
      //   row.id === id ? newRow : row
      // ) as GridRowsProp;

      // handleStopEdit(id, newRows, setRows, enqueueSnackbar);
    }
  };

  return (
    <InputNumber
      ref={reference}
      min={0}
      value={params.value !== null ? params.value : 0}
      onChange={(value) => onQuantityChange(value, params.id)}
      size="small"
      variant="borderless"
      controls={false}
      className="mi-input-number"
      precision={getDecimalPlaces(params.row.unitMeasureId as number)}
      onFocus={(e) => e.target.select()}
    />
  );
}

// const handleStopEdit = (
//   id: GridRowId,
//   rows: GridRowsProp,
//   setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>,
//   enqueueSnackbar: EnqueueSnackbar
// ) => {
//   const currentRow = rows.find((row) => row.id === id);
//   if (!currentRow) return;

//   const { productCode, quantity } = currentRow;
//   const emptyRow = !productCode || quantity <= 0;

//   if (emptyRow) {
//     enqueueSnackbar('No se puede guardar una registro sin un item', {
//       variant: 'info',
//     });
//     setRows(rows.filter((row) => row.id !== id));
//     return;
//   }

//   const repeatedCodeRow = rows.find(
//     (row) => row.productCode === productCode && row.id !== id
//   );

//   if (repeatedCodeRow) {
//
//     enqueueSnackbar('Este producto ya se encuentra registrado', {
//       variant: 'info',
//     });
//     const mergedRow = {
//       ...repeatedCodeRow,
//       quantity: repeatedCodeRow.quantity + quantity,
//     };
//     setRows(
//       rows
//         .filter((row) => row.id !== id && row.id !== repeatedCodeRow.id)
//         .concat(mergedRow)
//     );
//   } else {
//     setRows(rows);
//   }
// };
