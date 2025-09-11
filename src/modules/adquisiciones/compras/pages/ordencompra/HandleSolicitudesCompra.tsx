import { formatDate } from '@/functions';
import {
  FormState,
  useOrdenCompraAsync,
  useSolicitudCompraAsync,
  useStyles,
} from '@/hooks';
import {
  DetailOrdenCompraGetType,
  PersonProviderType,
  SolicitudCompraType,
} from '@/types';
import { AdsClick, ExpandMore, MoveDown } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridRowsProp } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { useEffect, useState } from 'react';

type HandleSolicitudesCompraProps = {
  proveedorSelected: PersonProviderType;
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  formState: FormState;
  createMode: boolean;
};

export const HandleSolicitudesCompra = (
  props: HandleSolicitudesCompraProps
) => {
  const { proveedorSelected, rows, setRows, formState, createMode } = props;
  const styles = useStyles();

  const { fetchByProveedorSucursal } = useSolicitudCompraAsync();

  const { fetchDetallesBySolicitud } = useOrdenCompraAsync();

  const [requestPurchaseList, setRequestPurchaseList] = useState<
    SolicitudCompraType[]
  >([]);

  useEffect(() => {
    const fetchSolicitudesCompra = async (
      personId: number,
      branchId: number | null
    ) => {
      fetchByProveedorSucursal(personId, branchId).then((response) => {
        if (response) {
          const requestPurchases: SolicitudCompraType[] =
            response as SolicitudCompraType[];
          setRequestPurchaseList(
            requestPurchases.sort((a, b) => {
              return (
                new Date(b.dateCreationRequestPurchase).getTime() -
                new Date(a.dateCreationRequestPurchase).getTime()
              );
            })
          );
        }
      });
    };
    if (proveedorSelected && proveedorSelected.personId !== null && formState) {
      fetchSolicitudesCompra(proveedorSelected.personId, formState.branchId);
    }
    if (proveedorSelected && createMode) setRows([]);
  }, [proveedorSelected, formState.branchId]);

  // * SE OBTIENEN LOS DETALLES DE LA ORDEN DE COMPRA Y SE ASIGNAN A LA VARIABLE ROWS

  const handleSetDetailPurchaseOrderSelected = (documentCode?: number) => {
    let requestPurchaseToSend: number[] = [];
    if (!documentCode) {
      requestPurchaseToSend = requestPurchaseList.map(
        (r) => r.requestPurchaseId
      );
    } else {
      requestPurchaseToSend.push(documentCode);
    }

    const fetchDetailsPurchaseOrders = async () => {
      const bodyToSend = {
        personId:
          proveedorSelected && proveedorSelected.personId !== null
            ? proveedorSelected.personId
            : 0,
        requestPurchaseListId: requestPurchaseToSend,
      };
      fetchDetallesBySolicitud(bodyToSend).then((response) => {
        if (response) {
          const detailsGet: DetailOrdenCompraGetType[] =
            response as DetailOrdenCompraGetType[];
          if (!validateRowsExistence(rows, detailsGet)) {
            detailsGet.forEach((detail) => {
              setRows((oldRows) => [
                ...oldRows,
                {
                  id: randomId(),
                  documentCode: detail.documentCode,
                  productId: detail.productId,
                  productCode: detail.productCode,
                  productName: detail.productName,
                  branchId: detail.branchId,
                  branchName: detail.branchName,
                  availableQuantity: detail.availableQuantity,
                  quantity: detail.quantity,
                  unitPrice: detail.unitPrice,
                  totalPrice: detail.totalPrice,
                  discountPercentage: detail.discountPercentage,
                  discountValue: detail.discountValue,
                  hasIva: detail.hasIva,
                  ivaValue: detail.ivaValue,
                  totalFinal:
                    detail.totalPrice - detail.discountValue + detail.ivaValue,
                  taxRateId: detail.taxRateId,
                  measurementUnitId: detail.measurementUnitId,
                },
              ]);
            });
          }
        }
      });
    };

    fetchDetailsPurchaseOrders();
  };

  return (
    <>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
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
            <Typography sx={{ fontWeight: 'bold', mt: 1 }}>
              Solicitudes De Compra
            </Typography>
            <Button
              sx={{ mr: 1 }}
              variant="contained"
              color="primary"
              startIcon={<MoveDown />}
              onClick={() => handleSetDetailPurchaseOrderSelected()}
            >
              Gestionar Todas
            </Button>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className={styles.tableContainer}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Solicitud</TableCell>
                    <TableCell>Sucursal</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Realizado Por</TableCell>
                    <TableCell>CDA Solicitado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requestPurchaseList.map((solicitudCompra, index) => (
                    <TableRow key={index}>
                      <TableCell>{solicitudCompra.requestPurchaseId}</TableCell>
                      <TableCell>{solicitudCompra.branchName}</TableCell>
                      <TableCell>
                        {formatDate(
                          solicitudCompra.dateCreationRequestPurchase
                        )}
                      </TableCell>
                      <TableCell>{solicitudCompra.nickUser}</TableCell>
                      <TableCell>
                        {solicitudCompra.nameAdquisitionType}
                      </TableCell>
                      <TableCell>
                        <div className={styles.iconContainer}>
                          <Tooltip title="Seleccionar Solicitud De Compra">
                            <IconButton
                              onClick={() =>
                                handleSetDetailPurchaseOrderSelected(
                                  solicitudCompra.requestPurchaseId
                                )
                              }
                            >
                              <AdsClick />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

function validateRowsExistence(
  rows: GridRowsProp,
  detalles: DetailOrdenCompraGetType[]
): boolean {
  return rows.some((row: any) =>
    detalles.some(
      (detail) =>
        detail.documentCode === row.documentCode &&
        detail.productCode === row.productCode
    )
  );
}
