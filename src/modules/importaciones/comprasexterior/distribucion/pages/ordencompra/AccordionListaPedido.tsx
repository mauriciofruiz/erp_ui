import { formatDate } from '@/functions';
import { useStyles } from '@/hooks';
import { ListaPedidoMain } from '@/types';
import { AltRoute, ExpandMore } from '@mui/icons-material';
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

interface AccordionListaPedidoProps {
  getOrden: (listaPedidoId: number, newPedido: boolean) => void;
  listaPedidoList: ListaPedidoMain[];
}

export const AccordionListaPedido = (props: AccordionListaPedidoProps) => {
  const { listaPedidoList, getOrden } = props;

  const styles = useStyles();

  const handlePurchaseOrderDetails = (listaPedidoId: number) => {
    getOrden(listaPedidoId, true);
  };

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
          <Typography sx={{ fontWeight: 'bold' }}>Listas De Pedido</Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        {listaPedidoList.length === 0 ? (
          <Typography>No hay listas de pedido asociadas</Typography>
        ) : (
          <div className={styles.tableContainer}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Lista Pedido</TableCell>
                    <TableCell>Partida</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Asignar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listaPedidoList.map(
                    (listaPedido: ListaPedidoMain, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{listaPedido.orderListId}</TableCell>
                        <TableCell>{listaPedido.importCode}</TableCell>
                        <TableCell>
                          {formatDate(listaPedido.registrationDate)}
                        </TableCell>
                        <TableCell>
                          <div className={styles.iconContainer}>
                            <Tooltip title="Asignar">
                              <IconButton
                                onClick={() =>
                                  handlePurchaseOrderDetails(
                                    listaPedido.orderListId
                                  )
                                }
                              >
                                <AltRoute />
                              </IconButton>
                            </Tooltip>
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
