import {
  formatDate,
  setDecimalPlacesString,
  setPercentageNumber,
  TabPanel,
} from '@/functions';
import {
  FormState,
  PaginationWrapper,
  useCommonDataGrid,
  useStyles,
} from '@/hooks';
import { CustomNoRowsOverlay, StyledDataGrid } from '@/hooks/useStyleDataGrid';
import { LabeledInputNumber } from '@/modules/layout';
import { RootState } from '@/store';
import { BitacoraType, ProductDataType, TaxRateInterface } from '@/types';
import { Cancel, Edit, ExpandMore, Save } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridRowClassNameParams } from '@mui/x-data-grid';
import { GridValidRowModel } from '@mui/x-data-grid';
import { GridRowModel } from '@mui/x-data-grid';
import {
  GridActionsCellItem,
  GridColDef,
  GridRowModes,
  GridRowsProp,
} from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useSelector } from 'react-redux';

type CostoPrecioTabProps = {
  formState: FormState;
  tabIndex: number;
  value: number;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    listName?: string,
    index?: number
  ) => void;
  createMode: boolean;
  editMode: boolean;
  onAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    name: string,
    value: any,
    index?: number
  ) => void;
  onBooleanChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string,
    index?: number,
    listName?: string
  ) => void;
  bodegaPvpRows: GridRowsProp;
  setBodegaPvpRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  categoryPvpRows: GridRowsProp;
  productData: ProductDataType | undefined;
  processRowUpdate: (newRow: GridRowModel) => {
    [x: string]: any;
    [x: symbol]: any;
  };
  onInputNumberChange: (value: number, field: string) => void;
};
const CostoPrecioTab: React.FC<CostoPrecioTabProps> = ({
  formState,
  tabIndex,
  bodegaPvpRows,
  createMode,
  editMode,
  onAutocompleteChange,
  setBodegaPvpRows,
  value,
  onBooleanChange,
  categoryPvpRows,
  productData,
  processRowUpdate,
  onInputNumberChange,
}) => {
  const styles = useStyles();

  const { impuestos } = useSelector((state: RootState) => state.common);

  const {
    rowModesModel,
    handleRowEditStop,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleRowModesModelChange,
  } = useCommonDataGrid(bodegaPvpRows, setBodegaPvpRows);

  /**
   * * * * * * * * * * * * * * * Variables for sorting * * * * * * * * * * * *
   */

  const [sorting, setSorting] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  }>({
    column: 'logId', // Default sorting column
    direction: 'desc', // Default sorting direction
  });

  const [pagesToShowPerPage, setPagesToShowPerPage] = useState(10);

  const [currentPage, setCurrentPage] = useState(0);

  const [currentPageData, setCurrentPageData] = useState<BitacoraType[]>([]);

  const pageOptions = [10, 25, 50, -1];

  const handleSort = (column: string) => {
    setSorting((prevSorting) => ({
      column,
      direction:
        prevSorting.column === column && prevSorting.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const sortedList = currentPageData?.slice().sort((a, b) => {
    const isAsc = sorting.direction === 'asc';
    switch (sorting.column) {
      case 'field':
        return isAsc
          ? a.field.localeCompare(b.field)
          : b.field.localeCompare(a.field);
      case 'date':
        const dateA = a.date ? new Date(a.date).toLocaleDateString() : '';
        const dateB = b.date ? new Date(b.date).toLocaleDateString() : '';
        return isAsc ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);

      default:
        return 0;
    }
  });

  useEffect(() => {
    // Check if paginatedResponse is defined before proceeding
    if (productData && productData.bitacoraList) {
      const itemsPerPage = 25;
      const offset = currentPage * itemsPerPage;

      // Use a slice only if paginatedResponse.list is defined
      const currentPageData = productData.bitacoraList
        ? productData.bitacoraList.slice(offset, offset + itemsPerPage)
        : [];

      // Update the state with currentPageData
      setCurrentPageData(currentPageData);
      setPagesToShowPerPage(itemsPerPage);
    }
  }, [productData?.bitacoraList, currentPage]);

  useEffect(() => {
    if (productData && productData.bitacoraList) {
      const startIndex = currentPage * pagesToShowPerPage;
      const endIndex =
        pagesToShowPerPage === -1
          ? productData.bitacoraList.length
          : startIndex + pagesToShowPerPage;
      const currentPageDataAux = productData.bitacoraList
        ? productData.bitacoraList.slice(startIndex, endIndex)
        : [];
      setCurrentPageData(currentPageDataAux);
    }
  }, [pagesToShowPerPage]);

  const bodegaPvpColumns: GridColDef[] = [
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
      field: 'unitPrice',
      headerName: 'PVP',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      editable: true,
      flex: 1,
      renderCell: (params) => setDecimalPlacesString(params.value, 6),
    },
  ];

  if (createMode || editMode) {
    bodegaPvpColumns.push({
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

  const categoryPvpColumns: GridColDef[] = [
    {
      field: 'categoryName',
      headerName: 'Categoria',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      flex: 1,
    },
    {
      field: 'discount',
      headerName: 'Descuento %',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      flex: 1,
      renderCell: (params) => setPercentageNumber(params.value, 2),
    },
    {
      field: 'pvp',
      headerName: 'PVP',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      cellClassName: 'centered-grid',
      type: 'number',
      flex: 1,
      renderCell: (params) => setDecimalPlacesString(params.value, 6),
    },
  ];

  return (
    <TabPanel value={tabIndex} index={value}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12}>
              <LabeledInputNumber
                label="PVP"
                inputNumberProps={{
                  onChange: (value) =>
                    onInputNumberChange(value as number, 'productPvp'),
                  value: formState.productPvp,
                  min: 0,
                  defaultValue: 0,
                  controls: false,
                  precision: 6,
                  prefix: '$',
                  onFocus: (e: any) => e.target.select(),
                  readOnly: !createMode && !editMode,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <LabeledInputNumber
                label="Costo Promedio"
                inputNumberProps={{
                  onChange: (value) =>
                    onInputNumberChange(value as number, 'productCost'),
                  value: formState.productCost,
                  min: 0,
                  defaultValue: 0,
                  controls: false,
                  precision: 6,
                  prefix: '$',
                  onFocus: (e: any) => e.target.select(),
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                className={styles.genericFieldStyle}
                options={impuestos}
                getOptionLabel={(option: TaxRateInterface) =>
                  option.taxDescription
                }
                style={{ width: '100%' }}
                onChange={(event, value) =>
                  onAutocompleteChange(event, 'taxRateId', value?.taxRateId)
                }
                value={
                  formState.taxRateId && formState.taxRateId !== null
                    ? impuestos.find(
                        (tax) => tax.taxRateId === formState.taxRateId
                      )
                    : null
                }
                filterOptions={(options, { inputValue }) => {
                  return options.filter((option) =>
                    option.taxDescription
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  );
                }}
                isOptionEqualToValue={(option, value) => option === value}
                noOptionsText="Sin resultados"
                readOnly={!createMode && !editMode}
                disabled={!formState.productCheckIva}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tarifa IVA"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      className: styles.textWhiteStyle,
                    }}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                      className: styles.textGreenStyle,
                    }}
                    error={formState.taxRateId === null}
                    helperText={
                      formState.taxRateId === null
                        ? 'Debe seleccionar una tarifa IVA'
                        : ''
                    }
                  />
                )}
              />
            </Grid>
            <Grid
              item
              xs={12}
              container
              justifyContent="center"
              alignItems="center"
            >
              <FormControlLabel
                control={
                  <Switch
                    disabled={!createMode && !editMode}
                    checked={formState.productCheckIva}
                    onChange={(event) =>
                      onBooleanChange(event, 'productCheckIva')
                    }
                  />
                }
                label={formState.productCheckIva ? 'Con IVA' : 'Sin IVA'}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={8}>
          <StyledDataGrid
            rows={bodegaPvpRows}
            columns={bodegaPvpColumns}
            editMode={createMode || editMode ? 'cell' : undefined}
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            getRowClassName={(
              params: GridRowClassNameParams<GridValidRowModel>
            ) => (params !== null ? `super-app-theme--null` : '')}
            rowHeight={30}
            columnHeaderHeight={45}
            hideFooter
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{ height: bodegaPvpRows.length > 0 ? '40vh' : 300 }}
          />
        </Grid>
        <Grid item xs={4} />
        <Grid item xs={8}>
          <StyledDataGrid
            rows={categoryPvpRows}
            columns={categoryPvpColumns}
            getRowClassName={(params) =>
              params !== null ? `super-app-theme--null` : ''
            }
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            rowHeight={30}
            columnHeaderHeight={45}
            hideFooter
            sx={{ height: categoryPvpRows.length > 0 ? '100%' : 300 }}
          />
        </Grid>
        {productData?.bitacoraList && productData?.bitacoraList.length > 0 && (
          <>
            <Grid item xs={4}></Grid>
            <Grid item xs={8}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Typography sx={{ fontWeight: 'bold' }}>
                      HISTORIAL DE CAMBIOS
                    </Typography>
                  </div>
                </AccordionSummary>
                <Divider sx={{ mb: 1 }} />
                <AccordionDetails>
                  <TableContainer
                    component={Paper}
                    style={{
                      maxHeight: 450,
                      overflow: 'auto',
                    }}
                  >
                    <Table size="small" aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">
                            <TableSortLabel
                              active={sorting.column === 'field'}
                              direction={
                                sorting.column === 'field'
                                  ? sorting.direction
                                  : 'asc'
                              }
                              onClick={() => handleSort('field')}
                            >
                              Campo
                            </TableSortLabel>
                          </TableCell>
                          <TableCell align="center">Usuario</TableCell>
                          <TableCell align="center">
                            <TableSortLabel
                              active={sorting.column === 'date'}
                              direction={
                                sorting.column === 'date'
                                  ? sorting.direction
                                  : 'asc'
                              }
                              onClick={() => handleSort('date')}
                            >
                              Fecha
                            </TableSortLabel>
                          </TableCell>
                          <TableCell align="center">Anterior</TableCell>
                          <TableCell align="center">Actual</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedList.map((bitacora) => (
                          <TableRow key={bitacora.logId}>
                            <TableCell align="center">
                              {bitacora.field}
                            </TableCell>
                            <TableCell align="center">
                              {bitacora.userName}
                            </TableCell>
                            <TableCell align="center">
                              {formatDate(bitacora.date)}
                            </TableCell>
                            <TableCell align="center">
                              {bitacora.oldValue}
                            </TableCell>
                            <TableCell align="center">
                              {bitacora.newValue}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div
                      style={{
                        backgroundColor: '#696969',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PaginationWrapper>
                        <ReactPaginate
                          previousLabel={'Anterior'}
                          nextLabel={'Siguiente'}
                          breakLabel={'...'}
                          breakClassName={'break-me'}
                          pageCount={
                            Math.ceil(
                              (productData.bitacoraList.length || 1) /
                                pagesToShowPerPage
                            ) || 0
                          }
                          marginPagesDisplayed={2}
                          pageRangeDisplayed={5}
                          onPageChange={({ selected }) =>
                            setCurrentPage(selected)
                          }
                          containerClassName={'pagination'}
                          pageClassName={'pages'}
                          activeClassName={'active'}
                        />
                      </PaginationWrapper>
                      <Select
                        style={{ height: '36px' }}
                        value={pagesToShowPerPage}
                        onChange={(e) =>
                          setPagesToShowPerPage(Number(e.target.value))
                        }
                      >
                        {pageOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option === -1 ? 'Todo' : option}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </>
        )}
      </Grid>
    </TabPanel>
  );
};

export default CostoPrecioTab;
