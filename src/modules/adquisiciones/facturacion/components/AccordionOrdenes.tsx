import { TipoDetalleFacturaEnum } from '@/enums';
import { formatDate, setCurrencyNumber } from '@/functions';
import { useOrdenCompraAsync, useStyles } from '@/hooks';
import { DetailOrdenCompraGetType, OrdenCompraGetType } from '@/types';
import { AdsClick, AltRoute, ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridRowsProp, GridValidRowModel } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface AccordionOrdenesProps {
  formState: any;
  getRetencionesNamesByDetalles: (
    retentionSourceId: number,
    retentionIVAId: number
  ) => any;
  setRows: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  setFormState: (newState: any) => void;
  rows: GridRowsProp;
  selectedPurchaseOrder: OrdenCompraGetType | undefined;
  setSelectedPurchaseOrder: Dispatch<
    SetStateAction<OrdenCompraGetType | undefined>
  >;
}

export const AccordionOrdenes = (props: AccordionOrdenesProps) => {
  const {
    formState,
    getRetencionesNamesByDetalles,
    setRows,
    setFormState,
    rows,
    selectedPurchaseOrder,
    setSelectedPurchaseOrder,
  } = props;

  const styles = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [currentPurchaseOrderId, setCurrentPurchaseOrderId] =
    useState<number>(0);

  const { fetchDetailOrdenCompraByIdOrden } = useOrdenCompraAsync();

  const [
    shouldRunHandlePurchaseOrderDetails,
    setShouldRunHandlePurchaseOrderDetails,
  ] = useState(false);

  const handlePurchaseOrderDetails = (purchaseOrderId: number) => {
    const orderSelected: OrdenCompraGetType = formState.purchaseOrderList.find(
      (purchase: OrdenCompraGetType) =>
        purchase.purchaseOrderId === purchaseOrderId
    );
    if (!orderSelected) {
      return;
    }
    setSelectedPurchaseOrder(orderSelected);
    const getPurchaseOrderDetails = async () => {
      try {
        const response = await fetchDetailOrdenCompraByIdOrden(purchaseOrderId);
        if (response) {
          const detailsGet: DetailOrdenCompraGetType[] = response;
          const filterDetails: DetailOrdenCompraGetType[] = detailsGet.filter(
            (detail) => detail.quantity > detail.quantityReceived
          );
          filterDetails.forEach(async (detail) => {
            const retentions = formState.isForeign
              ? []
              : await getRetencionesNamesByDetalles(
                  formState.retentionSourceId || undefined,
                  formState.retentionIVAId || undefined
                );
            setRows((oldRows) => {
              const existingRow = oldRows.find(
                (row) => row.productId === detail.productId
              ) as GridValidRowModel | undefined;

              if (existingRow) {
                const updatedRow = {
                  ...existingRow,
                  quantity: detail.quantity,
                  unitPrice: detail.unitPrice,
                  discount: detail.discountValue,
                  totalPrice: detail.totalPrice - detail.discountValue,
                  branchId: orderSelected.branchId,
                  branchName: orderSelected.branchName,
                  externalDocumentId: detail.detailPurchaseOrderId,
                  taxRateId: detail.taxRateId,
                  taxValue: detail.ivaValue,
                  hasIva: detail.hasIva,
                  unitMeasureId: detail.measurementUnitId,
                };
                return [
                  ...oldRows.slice(0, oldRows.indexOf(existingRow)),
                  updatedRow,
                  ...oldRows.slice(oldRows.indexOf(existingRow) + 1),
                ];
              } else {
                return [
                  ...oldRows,
                  {
                    id: randomId(),
                    detailId: null,
                    branchId: orderSelected.branchId,
                    branchName: orderSelected.branchName,
                    employeeName: '',
                    retentions,
                    providerInvoiceId: formState.providerInvoiceId,
                    productId: detail.productId,
                    productCode: detail.productCode,
                    providerProductCode: detail.providerProductCode,
                    productName: detail.productName,
                    quantity: detail.quantity,
                    unitPrice: detail.unitPrice,
                    discount: detail.discountValue,
                    priceWithoutTax: 0,
                    hasIva: detail.hasIva,
                    taxRateId: detail.taxRateId,
                    taxValue: detail.ivaValue,
                    totalPrice: detail.totalPrice - detail.discountValue,
                    isTaxCredit: true,
                    retentionSourceId: formState.retentionSourceId,
                    retentionIVAId: formState.retentionIVAId,
                    employeeId: null,
                    detailTypeId: TipoDetalleFacturaEnum.INVENTARIO,
                    externalDocumentId: detail.detailPurchaseOrderId,
                    status: true,
                    unitMeasureId: detail.measurementUnitId,
                  },
                ];
              }
            });
          });
        }
      } catch (error) {
        enqueueSnackbar('Existió un error de conexión', { variant: 'error' });
      }
    };
    getPurchaseOrderDetails();
    setFormState({
      ...formState,
      branchId: orderSelected.branchId,
      branchName: orderSelected.branchName,
      relatedDocumentId: purchaseOrderId,
      importOpeningId: orderSelected.importOpeningId,
      importOpeningCode: orderSelected.importOpeningCode,
    });
  };

  const handleReplacePurchaseOrder = (purchaseOrderId: number) => {
    setSelectedPurchaseOrder(undefined);
    setFormState({
      ...formState,
      relatedDocumentId: null,
    });
    setRows([]);

    setCurrentPurchaseOrderId(purchaseOrderId);

    setShouldRunHandlePurchaseOrderDetails(true);
  };

  useEffect(() => {
    if (
      selectedPurchaseOrder === undefined &&
      formState.relatedDocumentId === null &&
      rows.length === 0 &&
      shouldRunHandlePurchaseOrderDetails &&
      currentPurchaseOrderId !== null
    ) {
      handlePurchaseOrderDetails(currentPurchaseOrderId);
      setShouldRunHandlePurchaseOrderDetails(false);
    }
  }, [
    selectedPurchaseOrder,
    formState.relatedDocumentId,
    rows,
    shouldRunHandlePurchaseOrderDetails,
    currentPurchaseOrderId,
  ]);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <div
          style={{
            display: 'width',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>Ordenes De Compra</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        {formState.purchaseOrderList.length === 0 ? (
          <Typography>No hay ordenes de compra asociadas</Typography>
        ) : (
          <div className={styles.tableContainer}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Orden</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Observación</TableCell>
                    {formState.isForeign ? (
                      <TableCell>Partida</TableCell>
                    ) : (
                      <TableCell>Estado</TableCell>
                    )}
                    <TableCell>Fecha</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Asignar/Reemplazar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formState.purchaseOrderList.map(
                    (orden: OrdenCompraGetType, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{orden.purchaseOrderId}</TableCell>
                        <TableCell>{orden.providerName}</TableCell>
                        <TableCell>{orden.observation}</TableCell>
                        {formState.isForeign ? (
                          <TableCell>{orden.importOpeningCode}</TableCell>
                        ) : (
                          <TableCell>{orden.stateOrder}</TableCell>
                        )}
                        <TableCell>{formatDate(orden.creationDate)}</TableCell>
                        <TableCell>
                          {setCurrencyNumber(orden.totalValue)}
                        </TableCell>
                        <TableCell>
                          <div className={styles.iconContainer}>
                            {formState.relatedDocumentId &&
                            formState.relatedDocumentId !== null &&
                            formState.relatedDocumentId !==
                              orden.purchaseOrderId ? (
                              <Tooltip title="Reemplazar">
                                <IconButton
                                  onClick={() =>
                                    handleReplacePurchaseOrder(
                                      orden.purchaseOrderId
                                    )
                                  }
                                >
                                  <AltRoute />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Sincronizar">
                                <IconButton
                                  onClick={() =>
                                    handlePurchaseOrderDetails(
                                      orden.purchaseOrderId
                                    )
                                  }
                                >
                                  <AdsClick />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
