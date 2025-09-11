'use client';
import { getConfirmOrders, getSucursalById } from '@/backend';
import { ServerResponseType } from '@/store';
import {
  OrdenPedidoGet,
  OrdenPedidoList,
  OrderProd,
  OrderProdByIdType,
  PaginatedResponseType,
  SucursalType,
  UnidadesProducidasType,
} from '@/types';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { GridColDef, GridRowsProp, GridValidRowModel } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { format, parseISO } from 'date-fns';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { OrdenProduccionCostos } from './OrdenProduccionCostos';
import { OrdenProduccionEspecificaciones } from './OrdenProduccionEspecificaciones';
import { OrdenProduccionMateria } from './OrdenProduccionMateria';
import { OrdenProduccionObra } from './OrdenProduccionObra';
import { OrdenProduccionPedidoPaginacion } from './OrdenProduccionPedidoPaginacion';
import { OrdenProduccionUnidades } from './OrdenProduccionUnidades';
import {
  FormState,
  StyledDatePicker,
  useOrdenPedidoAsync,
  useOrdenProduccionAsync,
  useStyles,
} from '@/hooks';
import { GridRowModesModel } from '@mui/x-data-grid';
import { setCurrencyNumber, setDecimalPlacesString } from '@/functions';

export type OrdenProduccionPedidoProps = {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  rowsOrdenPedido: GridRowsProp;
  setRowsOrdenPedido: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  rowsUnidadesProd: GridRowsProp;
  setRowsUnidadesProd: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  rowsMateriaPrima: GridRowsProp;
  setRowsMateriaPrima: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  rowsObra: GridRowsProp;
  setRowsObra: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  rowsCostos: GridRowsProp;
  setRowsCostos: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setExecuteQuantity: React.Dispatch<React.SetStateAction<boolean>>;
  totalUnidades: number;
  totalMP: number;
  totalMO: number;
  totalCI: number;
  totalFinal: number;
  setScheduleQuantity: React.Dispatch<React.SetStateAction<number | undefined>>;
  createMode: boolean;
  editMode: boolean;
  rowModesModel: GridRowModesModel;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  requestOrderProd: OrderProd | undefined;
  executedQuantity: boolean;
  setTotalUnidades: React.Dispatch<React.SetStateAction<number>>;
};

export const OrdenProduccionPedido: React.FC<OrdenProduccionPedidoProps> = ({
  formState,
  setFormState,
  rowsOrdenPedido,
  setRowsOrdenPedido,
  rowsUnidadesProd,
  setRowsUnidadesProd,
  rowsMateriaPrima,
  setRowsMateriaPrima,
  rowsObra,
  setRowsObra,
  rowsCostos,
  setRowsCostos,
  setExecuteQuantity,
  totalMP,
  totalMO,
  totalCI,
  totalFinal,
  totalUnidades,
  setScheduleQuantity,
  createMode,
  editMode,
  rowModesModel,
  setRowModesModel,
  requestOrderProd,
  executedQuantity,
  setTotalUnidades,
}) => {
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const styles = useStyles();
  const [requestOrders, setRequestOrders] = useState<OrdenPedidoList[]>([]);
  const [requestOrderDetailsSelected, setRequestOrderDetailsSelected] =
    useState<UnidadesProducidasType[]>([]);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [currentOrdePedi, setCurrentOrdePedi] = useState<
    GridValidRowModel | undefined
  >();
  const [requestOrderP, setRequesteOrderP] = useState<OrdenPedidoGet>();
  const [pagination, setPagination] = useState<PaginatedResponseType>({
    limit: 0,
    list: [],
    page: 0,
    totalPages: 0,
    totalRecords: 0,
  });

  const { fetchUnidadesProducidas, fetchById } = useOrdenPedidoAsync();

  const { fetchDataModified } = useOrdenProduccionAsync();

  const handleChange =
    (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      if (event && event !== null) {
        setExpandedPanel(isExpanded ? panel : null);
      }
    };

  const columns: GridColDef[] = [
    {
      field: 'selected',
      headerName: '',
      width: 1,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => {
        if (createMode || editMode) {
          return (
            <Checkbox
              checked={params.row.id === selectedRowId}
              disabled={
                selectedRowId !== null && params.row.id !== selectedRowId
              }
              onChange={() => handleRowSelection(params.row.id)}
            />
          );
        } else {
          return null;
        }
      },
    },
    {
      field: 'requestNumber',
      headerName: 'Número',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 100,
      editable: true,
      cellClassName: 'centered-grid',
      align: 'center',
    },
    {
      field: 'registrationDate',
      headerName: 'Fecha',
      type: 'string',
      flex: 200,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => {
        const rawDate = params.value;
        const formattedDate = rawDate
          ? format(new Date(rawDate), 'dd/MM/yyyy')
          : '';
        return formattedDate;
      },
    },
    {
      field: 'producedQuantity',
      headerName: 'Cantidad',
      type: 'string',
      flex: 100,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
    },
  ];

  const handleRowSelection = (rowId: number) => {
    setSelectedRowId(rowId === selectedRowId ? null : rowId);
    if (selectedRowId !== null) {
      setRowsUnidadesProd([]);
      setRowsMateriaPrima([]);
      setRowsObra([]);
      setRowsCostos([]);
      setCurrentOrdePedi(undefined);
      setFormState({
        ...formState,
        branchProduce: null,
        requestNumber: '',
        startDateOP: null,
        endDateOP: null,
      });
    } else {
      const currentRow = rowsOrdenPedido.find((row) => row.id === rowId);
      if (currentRow) {
        setFormState((prevState) => ({
          ...prevState,
          requestNumber: currentRow.requestNumber,
          requestId: currentRow.requestId,
          startDateOP: parseISO(currentRow.startDate.toString()),
          endDateOP: parseISO(currentRow.endDate.toString()),
          orderQuanitySelected: currentRow.producedQuantity,
        }));
        setCurrentOrdePedi(currentRow);
        getOrdenPedido(currentRow.requestId);
        getSucursalProduce(currentRow.branchProducesId);
        setScheduleQuantity(currentRow.totalQuantity);
      }
    }
  };

  const getOrdenPedido = (requestId: number) => {
    if (requestId) {
      fetchUnidadesProducidas(requestId).then((response) => {
        if (response) {
          setRequestOrderDetailsSelected(response);
        }
      });
    }
  };

  const getSucursalProduce = (sucursalId: number) => {
    if (sucursalId) {
      const getSucursal = async () => {
        return new Promise<void>(async (resolve, reject) => {
          try {
            const response: SucursalType | ServerResponseType =
              await getSucursalById(sucursalId);
            if (response) {
              const sucursal = response as SucursalType;
              setFormState((prevState) => ({
                ...prevState,
                branchProduce: sucursal?.name,
              }));
              resolve();
            } else {
              enqueueSnackbar(`No se pudo obtener la sucursal`, {
                variant: 'error',
              });
              reject();
            }
          } catch (error) {
            enqueueSnackbar('Existió un error de conexión', {
              variant: 'error',
            });
            reject(error);
          }
        });
      };
      try {
        Promise.all([getSucursal()]);
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    }
  };

  const getOrdenResponse = (unitsProduced: UnidadesProducidasType[]) => {
    const order: OrderProd = {
      ...(formState as OrderProd),
    };

    const orden: OrderProdByIdType = {
      order,
      unitsProduced,
      rawMaterials: [],
      labourData: [],
      indirectCosts: [],
    };

    return orden;
  };

  const getRecetaDetails = (
    orderId: number,
    unitsProduced: UnidadesProducidasType[]
  ) => {
    if (orderId) {
      const orden = getOrdenResponse(unitsProduced);
      fetchDataModified(orden).then((response) => {
        if (response) {
          const materiaPrima = response.rawMaterials;
          const obra = response.labourData;
          const costos = response.indirectCosts;
          const unidades = response.unitsProduced;

          const totalUnidadesTemp = unidades.reduce(
            (acc, item) => acc + item.quantity,
            0
          );

          setTotalUnidades(totalUnidadesTemp);

          setRowsMateriaPrima(
            materiaPrima && materiaPrima.length > 0
              ? materiaPrima.map((item) => ({
                  id: randomId(),
                  ...item,
                }))
              : []
          );

          setRowsObra(
            obra && obra.length > 0
              ? obra.map((item) => ({
                  id: randomId(),
                  ...item,
                }))
              : []
          );

          setRowsCostos(
            costos && costos.length > 0
              ? costos.map((item) => ({
                  id: randomId(),
                  ...item,
                }))
              : []
          );

          setRowsUnidadesProd(
            unidades && unidades.length > 0
              ? unidades.map((item) => ({
                  id: randomId(),
                  ...item,
                }))
              : []
          );
        }
      });
    }
  };

  useEffect(() => {
    if (requestOrderDetailsSelected.length > 0) {
      const unidades =
        requestOrderDetailsSelected && requestOrderDetailsSelected.length > 0
          ? requestOrderDetailsSelected.map((item) => ({
              id: randomId(),
              ...item,
            }))
          : [];
      getRecetaDetails(selectedRowId as number, unidades);
    }
  }, [requestOrderDetailsSelected]);

  useEffect(() => {
    if (executedQuantity) {
      const unitsProduced: UnidadesProducidasType[] = rowsUnidadesProd.map(
        (item) => ({
          ...(item as UnidadesProducidasType),
        })
      );

      getRecetaDetails(formState.requestId, unitsProduced);
      setExecuteQuantity(false);
    }
  }, [executedQuantity, rowsUnidadesProd.map((item) => item.quantity)]);

  useEffect(() => {
    const getRequestPurchase = async () => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          const response: ServerResponseType | undefined =
            await getConfirmOrders();
          if (response) {
            if (response.status === 200 && response.message) {
              setRequestOrders(response.message);
              resolve();
            } else {
              enqueueSnackbar(`No se pudo abrir la orden de pedido`, {
                variant: 'error',
              });
              reject();
            }
          }
        } catch (error) {
          enqueueSnackbar('Existió un error de conexión', {
            variant: 'error',
          });
          reject(error);
        }
      });
    };
    try {
      Promise.all([getRequestPurchase()]);
    } catch (error) {
      enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
    }
  }, []);

  useEffect(() => {
    if (requestOrders && requestOrders.length > 0) {
      setRowsOrdenPedido(
        requestOrders.map((ordenPedido: OrdenPedidoList) => {
          return {
            id: randomId(),
            ...ordenPedido,
          };
        })
      );
    }
  }, [requestOrders]);

  useEffect(() => {
    if (requestOrderProd && requestOrderProd !== null) {
      const fetchDataOP = async () => {
        fetchById(requestOrderProd.requestId).then((response) => {
          if (response) setRequesteOrderP(response);
        });
      };
      fetchDataOP();
    }
  }, [requestOrderProd]);

  useEffect(() => {
    if (requestOrderP && requestOrderP !== null) {
      setCurrentOrdePedi(requestOrderP);
      setFormState({
        ...formState,
        startDateOP: parseISO(requestOrderP.startDate.toString()),
        endDateOP: parseISO(requestOrderP.endDate.toString()),
      });
    }
  }, [requestOrderP]);

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
      <Grid item xs={5}>
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
                ORDENES DE PEDIDO
              </Typography>
            </div>
          </AccordionSummary>
          <Divider sx={{ mb: 1 }} />
          <AccordionDetails>
            <OrdenProduccionPedidoPaginacion
              columns={columns}
              rowsOrdenPedido={rowsOrdenPedido}
              setRowsOrdenPedido={setRowsOrdenPedido}
              pagination={pagination}
              setPagination={setPagination}
            />
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={7}>
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
                UNIDADES PRODUCIDAS
              </Typography>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <OrdenProduccionUnidades
              rowsUnidadesProd={rowsUnidadesProd}
              setRowsUnidadesProd={setRowsUnidadesProd}
              setExecuteQuantity={setExecuteQuantity}
              formState={formState}
            />
          </AccordionDetails>
        </Accordion>
      </Grid>
      {rowsMateriaPrima && rowsMateriaPrima.length > 0 && (
        <>
          <Grid item xs={12}>
            <Accordion
              expanded={expandedPanel === 'panel1'}
              onChange={handleChange('panel1')}
            >
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
                    MATERIA PRIMA TOTAL: {setDecimalPlacesString(totalMP, 2)}
                  </Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <OrdenProduccionMateria
                  rowsMateriaPrima={rowsMateriaPrima}
                  setRowsMateriaPrima={setRowsMateriaPrima}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expandedPanel === 'panel2'}
              onChange={handleChange('panel2')}
            >
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
                    MANO DE OBRA TOTAL: {setDecimalPlacesString(totalMO, 2)}
                  </Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <OrdenProduccionObra
                  rowsObra={rowsObra}
                  setRowsObra={setRowsObra}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expandedPanel === 'panel3'}
              onChange={handleChange('panel3')}
            >
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
                    COSTOS INDIRECTOS TOTAL:{' '}
                    {setDecimalPlacesString(totalCI, 2)}
                  </Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <OrdenProduccionCostos
                  rowsCostos={rowsCostos}
                  setRowsCostos={setRowsCostos}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expandedPanel === 'panel4'}
              onChange={handleChange('panel4')}
            >
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
                    ESPECIFICACIONES GENERALES
                  </Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <OrdenProduccionEspecificaciones
                  rowsEspecificaciones={rowsUnidadesProd}
                  setRowEspecificaciones={setRowsUnidadesProd}
                  createMode={createMode}
                  editMode={editMode}
                  rowModesModel={rowModesModel}
                  setRowModesModel={setRowModesModel}
                />
              </AccordionDetails>
            </Accordion>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Grid sx={{ textAlign: 'left' }} item xs={6}>
                <StyledDatePicker
                  label="Fecha Pedido"
                  readOnly
                  views={['year', 'month', 'day']}
                  format="dd/MM/yyyy"
                  value={
                    currentOrdePedi ? parseISO(currentOrdePedi.startDate) : null
                  }
                  slotProps={{
                    textField: {
                      className: styles.genericFieldStyle,
                      sx: {
                        minWidth: '50%',
                      },
                      InputProps: {
                        className: styles.textWhiteStyle,
                      },
                      InputLabelProps: {
                        className: styles.textGreenStyle,
                        shrink:
                          currentOrdePedi && currentOrdePedi !== null
                            ? true
                            : false,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid sx={{ textAlign: 'right' }} item xs={6}>
                <TextField
                  name="totalFinal"
                  value={`TOTAL COSTO PRODUCCIÓN: ${
                    totalFinal !== null ? setCurrencyNumber(totalFinal) : 0
                  }`}
                  sx={{ bgcolor: 'background.paper', width: '60%' }}
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink: totalFinal !== null ? true : false,
                  }}
                />
              </Grid>
              <Grid sx={{ textAlign: 'left' }} item xs={6}>
                <StyledDatePicker
                  label="Fecha Cierre Pedido"
                  readOnly
                  views={['year', 'month', 'day']}
                  format="dd/MM/yyyy"
                  value={formState.endDate !== null ? formState.endDate : null}
                  slotProps={{
                    textField: {
                      className: styles.genericFieldStyle,
                      sx: {
                        minWidth: '50%',
                      },
                      InputProps: {
                        className: styles.textWhiteStyle,
                      },
                      InputLabelProps: {
                        className: styles.textGreenStyle,
                        shrink: formState.endDate !== null ? true : false,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid sx={{ textAlign: 'right' }} item xs={6}>
                <TextField
                  name="totalUnidades"
                  value={`TOTAL UNIDADES PRODUCIDAS: ${
                    totalUnidades !== null
                      ? setDecimalPlacesString(totalUnidades, 2)
                      : 0
                  }`}
                  sx={{ bgcolor: 'background.paper', width: '60%' }}
                  InputProps={{
                    readOnly: true,
                  }}
                  InputLabelProps={{
                    shrink: totalUnidades !== null ? true : false,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};
