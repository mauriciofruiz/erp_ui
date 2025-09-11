import { TabPanel } from '@/functions';
import { useCommonDataGrid } from '@/hooks';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { Cancel, Edit, Save } from '@mui/icons-material';
import { Grid, Tooltip } from '@mui/material';
import { GridRowModel } from '@mui/x-data-grid';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowModes,
  GridRowsProp,
} from '@mui/x-data-grid';

type ExistenciaTabProps = {
  tabIndex: number;
  value: number;
  createMode: boolean;
  editMode: boolean;
  bodegaStockRows: GridRowsProp;
  setBodegaStockRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  processRowUpdate: (newRow: GridRowModel) => {
    [x: string]: any;
    [x: symbol]: any;
  };
};
const ExistenciaTab: React.FC<ExistenciaTabProps> = ({
  tabIndex,
  bodegaStockRows,
  createMode,
  editMode,
  setBodegaStockRows,
  value,
  processRowUpdate,
}) => {
  const {
    rowModesModel,
    handleRowModesModelChange,
    handleRowEditStop,
    handleSaveClick,
    handleCancelClick,
    handleEditClick,
  } = useCommonDataGrid(bodegaStockRows, setBodegaStockRows);

  const bodegaStockColumns: GridColDef[] = [
    {
      field: 'branchName',
      headerName: 'Sucursal',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      flex: 1,
    },
    {
      field: 'minimumQuantity',
      headerName: 'Mínimo',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      editable: true,
      flex: 1,
    },
    {
      field: 'maximumQuantity',
      headerName: 'Máximo',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      editable: true,
      flex: 1,
    },
    {
      field: 'availableQuantity',
      headerName: 'Cant. Disponible',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      flex: 1,
    },
    {
      field: 'existenceQuantity',
      headerName: 'Cant. Existente',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      flex: 1,
    },
  ];
  if (createMode || editMode) {
    bodegaStockColumns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <Tooltip title="Guardar">
              <GridActionsCellItem
                icon={<Save />}
                label="Guardar"
                sx={{
                  color: 'primary.main',
                }}
                onClick={handleSaveClick(id)}
              />
            </Tooltip>,
            <Tooltip title="No Guardar">
              <GridActionsCellItem
                icon={<Cancel />}
                label="Cancelar"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />
            </Tooltip>,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Editar"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
        ];
      },
    });
  }
  return (
    <TabPanel value={tabIndex} index={value}>
      <Grid item xs={12}>
        <StyledDataGrid
          rows={bodegaStockRows}
          columns={bodegaStockColumns}
          editMode={createMode || editMode ? 'cell' : undefined}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          getRowClassName={(params) =>
            params !== null ? `super-app-theme--null` : ''
          }
          rowHeight={30}
          columnHeaderHeight={45}
          hideFooter
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          sx={{ height: bodegaStockRows.length > 0 ? '100%' : '300px' }}
        />
      </Grid>
    </TabPanel>
  );
};

export default ExistenciaTab;
