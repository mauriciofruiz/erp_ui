import { TipoRetencionEnum } from '@/enums';
import { getPercentageValue, setDecimalPlaces } from '@/functions';
import { useStyles } from '@/hooks';
import { RetencionGeneralInterface } from '@/types';
import { Autocomplete, TextField } from '@mui/material';
import { useGridApiContext } from '@mui/x-data-grid';
import { GridRenderEditCellParams, GridRowsProp } from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function SelectRetentionCell(props: {
  params: GridRenderEditCellParams;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  ivaListRetention: RetencionGeneralInterface[];
  sourceListRetention: RetencionGeneralInterface[];
}) {
  const { params, setRows, ivaListRetention, sourceListRetention } = props;

  const apiRef = useGridApiContext();

  const reference = useRef<HTMLElement>(null);

  const styles = useStyles();

  useEffect(() => {
    if (params.hasFocus) {
      reference.current!.focus();
    }
  }, [params.hasFocus]);

  const mergedList = useMemo(() => {
    return [...sourceListRetention, ...ivaListRetention];
  }, [JSON.stringify(ivaListRetention), JSON.stringify(sourceListRetention)]);

  const [optionRetentions, setOptionRetentions] = useState<
    RetencionGeneralInterface[]
  >([]);

  useEffect(() => {
    const rows = apiRef.current.getAllRowIds();
    const index = rows.findIndex((r) => r === params.id);
    if (index === 0) {
      setOptionRetentions(sourceListRetention);
    } else {
      setOptionRetentions(ivaListRetention);
    }
  }, []);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: RetencionGeneralInterface | null
  ) => {
    if (!event) return;
    if (newValue === null) return;
    const { id } = params;
    const row = apiRef.current.getRowParams(id).row;
    if (row) {
      const value = newValue;
      apiRef.current.setEditCellValue({
        id: id,
        field: params.field,
        value: value.retentionId,
      });

      const total = setDecimalPlaces(
        getPercentageValue(row.base, value.percentageValue),
        2
      );

      const newRow = {
        ...row,
        retentionTypeId: value.retentionId,
        value: total,
        ...(value.retentionTypeId === TipoRetencionEnum.IVA
          ? { taxId: value.retentionId }
          : { sourceId: value.retentionId }),
      };
      const newRows = apiRef.current
        .getAllRowIds()
        .map((r) => (r === id ? newRow : apiRef.current.getRowParams(r).row));
      setRows(newRows);
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
          : mergedList.find((r) => r.retentionId === getValue())
      }
      className={styles.genericFieldStyle}
      style={{ width: '100%' }}
      onChange={handleChange}
      options={optionRetentions}
      getOptionLabel={(option: RetencionGeneralInterface) => option.detail}
      isOptionEqualToValue={(option, value) =>
        option?.retentionId === value?.retentionId
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
