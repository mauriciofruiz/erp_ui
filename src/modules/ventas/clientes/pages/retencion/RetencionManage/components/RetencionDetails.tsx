import { ParametersEnum } from '@/enums';
import { FormState, useCommonDataGrid } from '@/hooks';
import { Grid } from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { useEffect, useMemo } from 'react';
import { setCurrencyNumber } from '@/functions';
import { RetencionGeneralInterface } from '@/types';
import { SelectRetentionCell } from './CustomCells';

export type RetencionDetailsProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  createMode: boolean;
  editMode: boolean;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  ivaListRetention: RetencionGeneralInterface[];
  sourceListRetention: RetencionGeneralInterface[];
};

export const RetencionDetails: React.FC<RetencionDetailsProps> = ({
  formState,
  setFormState,
  createMode,
  editMode,
  rows,
  setRows,
  ivaListRetention,
  sourceListRetention,
}) => {
  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    processRowUpdate,
    columns,
    setColumns,
  } = useCommonDataGrid(rows, setRows);

  const mergedList = useMemo(() => {
    return [...sourceListRetention, ...ivaListRetention];
  }, [JSON.stringify(ivaListRetention), JSON.stringify(sourceListRetention)]);

  const RetentionDescriptionValue = ({
    value,
    retentionsList,
  }: {
    value: number;
    retentionsList: RetencionGeneralInterface[];
  }) => {
    if (value === null) return 'TOTAL RETENCIÓN';
    const retencion = retentionsList.map((r: RetencionGeneralInterface) => {
      if (r.retentionId === value) {
        return r.detail;
      }
      return null;
    });

    return <div>{retencion}</div>;
  };

  useEffect(() => {
    setColumns([
      {
        field: 'retentionTypeId',
        headerName: 'Retención',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        minWidth: 70,
        flex: 1,
        editable: true,
        renderEditCell: (params) => (
          <SelectRetentionCell
            params={params}
            setRows={setRows}
            ivaListRetention={ivaListRetention}
            sourceListRetention={sourceListRetention}
          />
        ),
        renderCell: (params) => (
          <RetentionDescriptionValue
            value={params.value as number}
            retentionsList={mergedList}
          />
        ),
      },
      {
        field: 'base',
        headerName: 'Base Imponible',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'right',
        minWidth: 50,
        flex: 0.5,
        sortable: false,
        disableColumnMenu: true,
        valueFormatter: (params) => setCurrencyNumber(params.value as number),
      },
      {
        field: 'value',
        headerName: 'Total',
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'right',
        minWidth: 50,
        flex: 0.8,
        sortable: false,
        disableColumnMenu: true,
        valueFormatter: (params) => setCurrencyNumber(params.value as number),
      },
    ]);
  }, [
    rows.length,
    formState.invoiceId,
    JSON.stringify(ivaListRetention),
    JSON.stringify(sourceListRetention),
    JSON.stringify(rows.map((row) => row.retentionId)),
  ]);

  useEffect(() => {
    const rowsWithoutTotal = rows.filter(
      (row) => row.id !== ParametersEnum.ID_ROW_TOTAL
    );
    const total = rowsWithoutTotal.reduce(
      (acc, row) => acc + (row.value as number),
      0
    );

    const totalBase = rowsWithoutTotal.reduce(
      (acc, row) => acc + (row.base as number),
      0
    );
    const totalRow = {
      id: ParametersEnum.ID_ROW_TOTAL,
      retentionId: null,
      base: totalBase,
      value: total,
    };

    setRows([...rowsWithoutTotal, totalRow]);

    setFormState((prev) => ({
      ...prev,
      value: total,
    }));
  }, [JSON.stringify(rows.map((row) => row.value))]);

  return (
    <Grid item xs={12}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        editMode={createMode || editMode ? 'cell' : undefined}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        getRowClassName={(params) =>
          params.id === ParametersEnum.ID_ROW_TOTAL
            ? `super-app-theme--true`
            : 'super-app-theme--null'
        }
        processRowUpdate={processRowUpdate}
        getRowHeight={() => 'auto'}
        columnHeaderHeight={45}
        sx={{ height: rows.length > 0 ? '100%' : 300 }}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        hideFooter
      />
    </Grid>
  );
};
